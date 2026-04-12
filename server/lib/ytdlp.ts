// ============================================================
// yt-dlp engine — spawn, build args, retry strategy
// ============================================================

import { join } from 'path'
import { spawn } from 'child_process'
import { existsSync } from 'fs'
import { REALISTIC_USER_AGENT, isNonRetryableError } from './constants'
import { cleanupPartialFiles } from './file-utils'

/**
 * Mencari path binary (yt-dlp/ffmpeg) secara cerdas.
 * Prioritaskan binary lokal di server/api, fallback ke sistem.
 */
export function getBinaryPath(name: 'yt-dlp' | 'ffmpeg'): string {
  const isWin = process.platform === 'win32'
  const localName = isWin ? `${name}.exe` : name
  const localPath = join(process.cwd(), 'server', 'api', localName)

  if (existsSync(localPath)) {
    return localPath
  }

  // Fallback ke binary global sistem
  return name
}

/** Parse JSON output yt-dlp (kadang ada noise sebelum { ) */
export function parseYtdlpOutput(raw: string): any {
  const jsonStart = raw.indexOf('{')
  if (jsonStart !== -1) return JSON.parse(raw.substring(jsonStart))
  return JSON.parse(raw)
}

/**
 * Build args yt-dlp dari flag map.
 * Mendukung extractor-args, user-agent, retry, rate limiting, dll.
 */
export function buildYtdlpArgs(url: string, flags: Record<string, any>): string[] {
  const args: string[] = []

  // Flag standar
  if (flags.dumpSingleJson) args.push('--dump-single-json')
  if (flags.noWarnings) args.push('--no-warnings')
  if (flags.noCheckCertificates) args.push('--no-check-certificates')
  if (flags.noPlaylist) args.push('--no-playlist')
  if (flags.noCacheDir) args.push('--no-cache-dir')
  if (flags.forceIpv4) args.push('--force-ipv4')
  if (flags.ignoreErrors) args.push('--ignore-errors')
  if (flags.ignoreNoFormatsError) args.push('--ignore-no-formats-error')
  if (flags.flatPlaylist) args.push('--flat-playlist')
  if (flags.format) args.push('--format', flags.format)
  if (flags.output) args.push('--output', flags.output)
  if (flags.ffmpegLocation) args.push('--ffmpeg-location', flags.ffmpegLocation)
  if (flags.mergeOutputFormat) args.push('--merge-output-format', flags.mergeOutputFormat)

  // Pengganti deprecated --youtube-skip-dash-manifest & --youtube-skip-hls-manifest
  if (flags.extractorArgs) args.push('--extractor-args', flags.extractorArgs)

  // User-Agent realistis agar tidak terdeteksi bot
  if (flags.userAgent) args.push('--user-agent', flags.userAgent)

  // Rate limiting agar tidak di-flag YouTube
  if (flags.sleepInterval) args.push('--sleep-interval', String(flags.sleepInterval))
  if (flags.maxSleepInterval) args.push('--max-sleep-interval', String(flags.maxSleepInterval))

  // Retry bawaan yt-dlp
  if (flags.retries) args.push('--retries', String(flags.retries))
  if (flags.fragmentRetries) args.push('--fragment-retries', String(flags.fragmentRetries))

  // Network reconnect via ffmpeg (untuk stream yang putus)
  if (flags.downloaderArgs) args.push('--downloader-args', flags.downloaderArgs)

  // Post-processor args (e.g. force AAC transcoding for MP4)
  if (flags.postprocessorArgs) args.push('--postprocessor-args', flags.postprocessorArgs)

  // Socket timeout internal yt-dlp (default 20s, kurangi untuk server)
  if (flags.socketTimeout) args.push('--socket-timeout', String(flags.socketTimeout))

  // URL terakhir
  args.push(url)
  return args
}

/**
 * Spawn satu instance yt-dlp, dengan auto-fallback ke binary sistem jika lokal gagal.
 */
export function spawnYtdlp(binPath: string, args: string[], timeoutMs = 120_000): Promise<{ stdout: string }> {
  const execute = (path: string): Promise<{ stdout: string }> => {
    return new Promise((resolve, reject) => {
      const spawnStart = Date.now()
      console.log(`[Spawn] Running: ${path} ${args.join(' ')}`)
      const child = spawn(path, args)
      let stdout = ''
      let stderr = ''
      let firstDataTs = 0
      let stdoutChunks = 0

      const timer = setTimeout(() => {
        child.kill('SIGTERM')
        reject(new Error(`yt-dlp timeout setelah ${timeoutMs / 1000}s`))
      }, timeoutMs)

      child.stdout.on('data', (data) => {
        if (!firstDataTs) {
          firstDataTs = Date.now()
          console.log(`[Spawn] ⏱ First stdout data after ${firstDataTs - spawnStart}ms`)
        }
        stdoutChunks++
        stdout += data.toString()
      })
      child.stderr.on('data', (data) => {
        const line = data.toString().trim()
        // Log stderr yt-dlp untuk insight (extracting, downloading info, etc)
        if (line && !line.startsWith('WARNING')) {
          console.log(`[yt-dlp stderr] ${line.substring(0, 150)}`)
        }
        stderr += data.toString()
      })

      child.on('close', (code) => {
        clearTimeout(timer)
        const totalMs = Date.now() - spawnStart
        const streamMs = firstDataTs ? Date.now() - firstDataTs : 0
        console.log(`[Spawn] ⏱ Done: total=${totalMs}ms | spawn→data=${firstDataTs ? firstDataTs - spawnStart : 'N/A'}ms | data→close=${streamMs}ms | chunks=${stdoutChunks} | stdout=${(stdout.length / 1024).toFixed(0)}KB`)
        if (code === 0) resolve({ stdout })
        else {
          const err = new Error(stderr || `yt-dlp exited with code ${code}`)
          ;(err as any).code = code
          ;(err as any).stderr = stderr
          reject(err)
        }
      })

      child.on('error', (err) => {
        clearTimeout(timer)
        reject(err)
      })
    })
  }

  return execute(binPath).catch(async (err) => {
    const isLocal = binPath.includes('server' + (process.platform === 'win32' ? '\\' : '/') + 'api')
    // Jika local gagal dan belum coba sistem, coba sistem
    if (isLocal) {
      console.warn(`[Spawn] Local yt-dlp gagal (mungkin arsitektur salah), mencoba sistem...`)
      return execute('yt-dlp')
    }
    throw err
  })
}

/**
 * Eksekusi yt-dlp dengan progressive retry strategy.
 * Mode 'info': skip dash/hls manifest untuk kecepatan
 * Mode 'download': butuh akses DASH manifest penuh untuk bestvideo+bestaudio
 */
export async function execYtdlp(
  url: string,
  flags: Record<string, any>,
  timeoutMs = 120_000,
  purpose: 'info' | 'download' = 'info',
): Promise<{ stdout: string }> {
  const binPath = getBinaryPath('yt-dlp')

  // Deteksi apakah URL YouTube untuk apply strategy khusus
  const isYouTube = /(?:youtube\.com|youtu\.be)/i.test(url)

  let strategies: Record<string, any>[]

  if (!isYouTube) {
    // Non-YouTube: 2 strategy dengan UA berbeda untuk bypass blokir
    strategies = [
      { ...flags, userAgent: REALISTIC_USER_AGENT },
      { ...flags, userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' },
    ]
  } else if (purpose === 'info') {
    // Info mode: skip dash/hls untuk kecepatan
    strategies = [
      { ...flags, extractorArgs: 'youtube:skip=dash,hls', userAgent: REALISTIC_USER_AGENT },
      { ...flags, extractorArgs: 'youtube:player-client=ios;skip=dash,hls', userAgent: REALISTIC_USER_AGENT },
      { ...flags, extractorArgs: 'youtube:player-client=android;skip=dash,hls', userAgent: REALISTIC_USER_AGENT },
      { ...flags, extractorArgs: 'youtube:player-client=web', userAgent: REALISTIC_USER_AGENT },
    ]
  } else {
    // Download mode: JANGAN skip dash/hls karena butuh DASH untuk bestvideo+bestaudio
    strategies = [
      { ...flags, userAgent: REALISTIC_USER_AGENT },
      { ...flags, extractorArgs: 'youtube:player-client=ios', userAgent: REALISTIC_USER_AGENT },
      { ...flags, extractorArgs: 'youtube:player-client=android', userAgent: REALISTIC_USER_AGENT },
      { ...flags, extractorArgs: 'youtube:player-client=web', userAgent: REALISTIC_USER_AGENT },
    ]
  }

  let lastError: Error | null = null

  for (let i = 0; i < strategies.length; i++) {
    try {
      const strategyFlags = strategies[i] as Record<string, any>
      console.log(`[Retry] Attempt ${i + 1}/${strategies.length} — extractorArgs: ${strategyFlags.extractorArgs || 'none'}`)
      const args = buildYtdlpArgs(url, strategyFlags)
      return await spawnYtdlp(binPath, args, timeoutMs)
    } catch (err: any) {
      lastError = err
      const errMsg = err.message || String(err)
      console.warn(`[Retry] Attempt ${i + 1} gagal: ${errMsg.substring(0, 200)}`)

      // Error fatal (disk penuh, permission) → jangan retry, langsung gagal
      if (isNonRetryableError(errMsg)) {
        console.error(`[Retry] Non-retryable error terdeteksi, berhenti.`)
        if (flags.output) cleanupPartialFiles(flags.output)
        throw new Error(`Server error: ${errMsg.includes('No space') ? 'Disk server penuh, coba lagi nanti.' : errMsg}`)
      }

      // Cleanup partial files sebelum retry berikutnya
      if (flags.output) cleanupPartialFiles(flags.output)

      // Jeda pendek sebelum retry (fixed 500ms)
      if (i < strategies.length - 1) {
        await new Promise(r => setTimeout(r, 500))
      }
    }
  }

  throw lastError || new Error('Semua strategi download gagal')
}

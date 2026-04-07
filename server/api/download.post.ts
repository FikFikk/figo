import { defineEventHandler, readBody, createError } from 'h3'
import { join } from 'path'
import { randomUUID } from 'crypto'
import { tmpdir } from 'os'
import { spawn } from 'child_process'
import { downloadJobs } from '../lib/jobs'

// Blocklist for adult sites
const BLOCKED_DOMAINS = [
  'pornhub.com', 'xvideos.com', 'xnxx.com', 'xhamster.com', 'redtube.com',
  'youporn.com', 'spankbang.com', 'eporner.com', 'beeg.com', 'chaturbate.com',
  'onlyfans.com', 'rule34.xxx'
]

function isBlocked(url: string): boolean {
  try {
    const hostname = new URL(url).hostname.toLowerCase()
    return BLOCKED_DOMAINS.some(domain => hostname.includes(domain))
  } catch {
    return false
  }
}

function normalizeUrl(raw: string): string {
  let url = raw.trim()
  if (!url.startsWith('http://') && !url.startsWith('https://')) url = 'https://' + url
  return url
}

function parseYtdlpOutput(raw: string): any {
  const jsonStart = raw.indexOf('{')
  if (jsonStart !== -1) return JSON.parse(raw.substring(jsonStart))
  return JSON.parse(raw)
}

// User-Agent realistis untuk bypass fingerprinting
const REALISTIC_USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36'

/**
 * Implementasi native yt-dlp untuk kompatibilitas Nitro/Rollup.
 * Mendukung extractor-args, user-agent, retry, dan rate limiting.
 */
function buildYtdlpArgs(url: string, flags: Record<string, any>): string[] {
  const args: string[] = []

  // Flag standar
  if (flags.dumpSingleJson) args.push('--dump-single-json')
  if (flags.noWarnings) args.push('--no-warnings')
  if (flags.noCheckCertificates) args.push('--no-check-certificates')
  if (flags.noPlaylist) args.push('--no-playlist')
  if (flags.noCacheDir) args.push('--no-cache-dir')
  if (flags.forceIpv4) args.push('--force-ipv4')
  if (flags.ignoreErrors) args.push('--ignore-errors')
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

  // URL terakhir
  args.push(url)
  return args
}

function spawnYtdlp(binPath: string, args: string[], timeoutMs = 120_000): Promise<{ stdout: string }> {
  return new Promise((resolve, reject) => {
    console.log(`[Spawn] Running: ${binPath} ${args.join(' ')}`)
    const child = spawn(binPath, args)
    let stdout = ''
    let stderr = ''

    // Timeout agar tidak hang selamanya
    const timer = setTimeout(() => {
      child.kill('SIGTERM')
      reject(new Error(`yt-dlp timeout setelah ${timeoutMs / 1000}s`))
    }, timeoutMs)

    child.stdout.on('data', (data) => { stdout += data.toString() })
    child.stderr.on('data', (data) => { stderr += data.toString() })

    child.on('close', (code) => {
      clearTimeout(timer)
      if (code === 0) resolve({ stdout })
      else reject(new Error(stderr || `yt-dlp exited with code ${code}`))
    })

    child.on('error', (err) => {
      clearTimeout(timer)
      reject(err)
    })
  })
}

/**
 * Eksekusi yt-dlp dengan progressive retry strategy.
 * Attempt 1: Default (tanpa cookies, user-agent realistis)
 * Attempt 2: Dengan player-client=ios (bypass bot detection)
 * Attempt 3: Dengan player-client=android (fallback terakhir)
 */
async function execYtdlp(url: string, flags: Record<string, any>, timeoutMs = 120_000): Promise<{ stdout: string }> {
  const isWin = process.platform === 'win32'
  const binName = isWin ? 'yt-dlp.exe' : 'yt-dlp'
  const binPath = join(process.cwd(), 'server', 'api', binName)

  // Deteksi apakah URL YouTube untuk apply strategy khusus
  const isYouTube = /(?:youtube\.com|youtu\.be)/i.test(url)

  // Strategy list: dari paling ringan sampai paling agresif
  const strategies = isYouTube
    ? [
        // Attempt 1: Default dengan extractor-args skip dash/hls
        { ...flags, extractorArgs: 'youtube:skip=dash,hls', userAgent: REALISTIC_USER_AGENT },
        // Attempt 2: Pakai iOS client (sering bypass bot detection)
        { ...flags, extractorArgs: 'youtube:player-client=ios;skip=dash,hls', userAgent: REALISTIC_USER_AGENT },
        // Attempt 3: Pakai Android client sebagai fallback
        { ...flags, extractorArgs: 'youtube:player-client=android;skip=dash,hls', userAgent: REALISTIC_USER_AGENT },
        // Attempt 4: Web client tanpa skip manifest (full access)
        { ...flags, extractorArgs: 'youtube:player-client=web', userAgent: REALISTIC_USER_AGENT },
      ]
    : [
        // Non-YouTube: cukup 1 attempt dengan user-agent
        { ...flags, userAgent: REALISTIC_USER_AGENT },
      ]

  let lastError: Error | null = null

  for (let i = 0; i < strategies.length; i++) {
    try {
      const strategyFlags = strategies[i] as Record<string, any>
      console.log(`[Retry] Attempt ${i + 1}/${strategies.length} — extractorArgs: ${strategyFlags.extractorArgs || 'none'}`)
      const args = buildYtdlpArgs(url, strategyFlags)
      return await spawnYtdlp(binPath, args, timeoutMs)
    } catch (err: any) {
      lastError = err
      console.warn(`[Retry] Attempt ${i + 1} gagal: ${err.message?.substring(0, 200)}`)
      // Jeda sebelum retry berikutnya (exponential: 1s, 2s, 3s)
      if (i < strategies.length - 1) {
        await new Promise(r => setTimeout(r, (i + 1) * 1000))
      }
    }
  }

  throw lastError || new Error('Semua strategi download gagal')
}

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const targetUrl = body?.url as string
  const mode = (body?.mode as string) || 'info'
  const formatId = body?.formatId as string | undefined

  if (!targetUrl || typeof targetUrl !== 'string') {
    throw createError({ statusCode: 400, message: 'Harap masukkan URL yang valid.' })
  }

  const url = normalizeUrl(targetUrl)

  if (isBlocked(url)) {
    throw createError({
      statusCode: 403,
      message: 'Akses Ditolak: URL mengandung konten dewasa yang tidak diizinkan.'
    })
  }

  try { new URL(url) } catch {
    throw createError({ statusCode: 400, message: 'Format URL tidak valid.' })
  }

  try {
    // ===================== MODE: INFO =====================
    if (mode === 'info') {
      const startTime = Date.now()
      const dataRaw = await execYtdlp(url, {
        dumpSingleJson: true,
        noWarnings: true,
        noCheckCertificates: true,
        noPlaylist: true,
        forceIpv4: true,
        ignoreErrors: true,
        retries: 3,
        fragmentRetries: 3,
      }, 60_000)
      const duration = Date.now() - startTime
      console.log(`[FetchInfo] Success in ${duration}ms for: ${url}`)

      const data = parseYtdlpOutput(dataRaw.stdout)

      // Collect unique heights
      const heights = new Set<number>()
      const sizeEstimates: Record<number, number> = {}

      if (data.formats && Array.isArray(data.formats)) {
        let bestAudioSize = 0
        for (const f of data.formats) {
          if (f.acodec && f.acodec !== 'none' && (!f.vcodec || f.vcodec === 'none')) {
            const aSize = f.filesize || f.filesize_approx || 0
            if (aSize > bestAudioSize) bestAudioSize = aSize
          }
        }

        for (const f of data.formats) {
          if (f.height && f.vcodec && f.vcodec !== 'none') {
            heights.add(f.height)
            const vSize = f.filesize || f.filesize_approx || 0
            const total = vSize + bestAudioSize
            if (!sizeEstimates[f.height] || total > (sizeEstimates[f.height] ?? 0)) {
              sizeEstimates[f.height] = total
            }
          }
        }
      }

      const sortedHeights = [...heights].sort((a, b) => b - a)

      const qualities = sortedHeights.map(h => {
        const tier = h >= 2160 ? '4K' : h >= 1440 ? '2K' : h >= 1080 ? 'Full HD' : h >= 720 ? 'HD' : h >= 480 ? 'SD' : ''
        return {
          formatId: `bestvideo[height<=${h}][ext=mp4]+bestaudio[ext=m4a]/bestvideo[height<=${h}]+bestaudio/best[height<=${h}]`,
          label: `${h}p`,
          resolution: `${h}p`,
          ext: 'mp4',
          hasAudio: true,
          hasVideo: true,
          filesize: sizeEstimates[h] || null,
          note: tier,
        }
      })

      qualities.push({
        formatId: 'bestaudio[ext=m4a]/bestaudio',
        label: 'Audio Only',
        resolution: 'Audio',
        ext: 'm4a',
        hasAudio: true,
        hasVideo: false,
        filesize: null,
        note: 'Best quality',
      })

      return {
        success: true,
        mode: 'info',
        title: data.title || 'Video',
        thumb: data.thumbnail || null,
        duration: data.duration || null,
        uploader: data.uploader || data.channel || null,
        qualities,
        fetchDuration: duration,
      }
    }

    // ===================== MODE: DOWNLOAD =====================
    if (mode === 'download') {
      const jobId = randomUUID()
      const formatStr = formatId || 'best'
      const ext = formatStr.includes('bestaudio') && !formatStr.includes('bestvideo') ? 'm4a' : 'mp4'
      const tmpFile = join(tmpdir(), `figo-${jobId}.${ext}`)
      
      const isWin = process.platform === 'win32'
      const ffmpegName = isWin ? 'ffmpeg.exe' : 'ffmpeg'
      const ffmpegPath = join(process.cwd(), 'server', 'api', ffmpegName)

      const rawTitle = (body?.title as string) || 'Video'
      // Remove invalid characters for Windows/Linux filenames
      const safeTitle = rawTitle.replace(/[/\\?%*:|"<>]/g, '').trim()

      downloadJobs.set(jobId, { status: 'processing', ext, title: safeTitle })

      // Background process (fire-and-forget)
      ;(async () => {
        try {
          console.log(`[Job ${jobId}] Starting: format=${formatStr}`)
          const flags: any = {
            format: formatStr,
            output: tmpFile,
            noWarnings: true,
            noCheckCertificates: true,
            ffmpegLocation: ffmpegPath,
            retries: 5,
            fragmentRetries: 5,
            // Reconnect otomatis jika stream terputus
            downloaderArgs: 'ffmpeg_i:-reconnect 1 -reconnect_streamed 1 -reconnect_delay_max 5',
          }
          if (ext === 'mp4') flags.mergeOutputFormat = 'mp4'

          await execYtdlp(url, flags, 600_000)
          console.log(`[Job ${jobId}] Done!`)

          downloadJobs.set(jobId, {
            ...(downloadJobs.get(jobId) as any),
            status: 'done',
            filePath: tmpFile,
            ext,
            mimeType: ext === 'm4a' ? 'audio/mp4' : 'video/mp4'
          })
        } catch (err: any) {
          console.error(`[Job ${jobId}] Error:`, err)
          downloadJobs.set(jobId, { 
            ...(downloadJobs.get(jobId) as any), 
            status: 'error', 
            error: err.message || String(err) 
          })
        }
      })()

      return {
        success: true,
        mode: 'download',
        jobId,
      }
    }

    throw createError({ statusCode: 400, message: 'Mode tidak valid.' })

  } catch (err: any) {
    console.error('[Download Native Error]', err)
    if (err.statusCode) throw err
    throw createError({
      statusCode: 500,
      message: 'Native Error: ' + (err.message || String(err))
    })
  }
})

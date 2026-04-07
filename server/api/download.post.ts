import { defineEventHandler, readBody, createError } from 'h3'
import { join, dirname, basename } from 'path'
import { randomUUID } from 'crypto'
import { spawn } from 'child_process'
import { readdirSync, existsSync, unlinkSync, statSync, mkdirSync, copyFileSync } from 'fs'
import { downloadJobs } from '../lib/jobs'

/**
 * Gunakan directory di disk utama, bukan /tmp (sering tmpfs kecil).
 * Directory dibuat di <project>/.downloads/ agar pakai disk utama.
 */
function getDownloadDir(): string {
  const dir = join(process.cwd(), '.downloads')
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true })
    console.log(`[Init] Created download dir: ${dir}`)
  }
  return dir
}

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

// Error yang tidak perlu di-retry (masalah server, bukan YouTube)
const NON_RETRYABLE_PATTERNS = [
  'No space left on device',
  'Permission denied',
  'ENOSPC',
  'EACCES',
]

function isNonRetryableError(msg: string): boolean {
  return NON_RETRYABLE_PATTERNS.some(p => msg.includes(p))
}

/**
 * Bersihkan file figo-* lama di /tmp (lebih dari 30 menit).
 * Mencegah disk penuh karena partial download yang gagal.
 */
function cleanupStaleTempFiles(): { cleaned: number; freedMB: number } {
  const tmp = getDownloadDir()
  let cleaned = 0
  let freedBytes = 0
  const maxAge = 30 * 60 * 1000 // 30 menit

  try {
    const files = readdirSync(tmp)
    const now = Date.now()
    for (const f of files) {
      if (!f.startsWith('figo-')) continue
      const fullPath = join(tmp, f)
      try {
        const info = statSync(fullPath)
        if (now - info.mtimeMs > maxAge) {
          freedBytes += info.size
          unlinkSync(fullPath)
          cleaned++
        }
      } catch {}
    }
  } catch {}

  return { cleaned, freedMB: Math.round(freedBytes / 1048576) }
}

/**
 * Bersihkan partial files (.part, .ytdl) untuk jobId tertentu.
 */
function cleanupPartialFiles(tmpFile: string): void {
  const dir = dirname(tmpFile)
  const base = basename(tmpFile).replace(/\.[^.]+$/, '')
  try {
    const files = readdirSync(dir)
    for (const f of files) {
      if (f.startsWith(base) && (f.endsWith('.part') || f.endsWith('.ytdl') || f.endsWith('.part-Frag0'))) {
        try { unlinkSync(join(dir, f)) } catch {}
      }
    }
  } catch {}
}

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
 * Mode 'info': skip dash/hls manifest untuk kecepatan
 * Mode 'download': butuh akses DASH manifest penuh untuk bestvideo+bestaudio
 */
async function execYtdlp(url: string, flags: Record<string, any>, timeoutMs = 120_000, purpose: 'info' | 'download' = 'info'): Promise<{ stdout: string }> {
  const isWin = process.platform === 'win32'
  const binName = isWin ? 'yt-dlp.exe' : 'yt-dlp'
  const binPath = join(process.cwd(), 'server', 'api', binName)

  // Deteksi apakah URL YouTube untuk apply strategy khusus
  const isYouTube = /(?:youtube\.com|youtu\.be)/i.test(url)

  let strategies: Record<string, any>[]

  if (!isYouTube) {
    // Non-YouTube: cukup 1 attempt dengan user-agent
    strategies = [{ ...flags, userAgent: REALISTIC_USER_AGENT }]
  } else if (purpose === 'info') {
    // Info mode: skip dash/hls untuk kecepatan (tidak perlu download format)
    strategies = [
      { ...flags, extractorArgs: 'youtube:skip=dash,hls', userAgent: REALISTIC_USER_AGENT },
      { ...flags, extractorArgs: 'youtube:player-client=ios;skip=dash,hls', userAgent: REALISTIC_USER_AGENT },
      { ...flags, extractorArgs: 'youtube:player-client=android;skip=dash,hls', userAgent: REALISTIC_USER_AGENT },
      { ...flags, extractorArgs: 'youtube:player-client=web', userAgent: REALISTIC_USER_AGENT },
    ]
  } else {
    // Download mode: JANGAN skip dash/hls karena butuh akses DASH untuk bestvideo+bestaudio
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
        // Cleanup partial files sebelum throw
        if (flags.output) cleanupPartialFiles(flags.output)
        throw new Error(`Server error: ${errMsg.includes('No space') ? 'Disk server penuh, coba lagi nanti.' : errMsg}`)
      }

      // Cleanup partial files sebelum retry berikutnya
      if (flags.output) cleanupPartialFiles(flags.output)

      // Jeda sebelum retry berikutnya (exponential: 1s, 2s, 3s)
      if (i < strategies.length - 1) {
        await new Promise(r => setTimeout(r, (i + 1) * 1000))
      }
    }
  }

  throw lastError || new Error('Semua strategi download gagal')
}

/**
 * Cari file hasil download yt-dlp.
 * Prioritas: merged file (tanpa fragment pattern) → fragment terbesar.
 */
function findDownloadedFile(downloadDir: string, jobId: string): { file: string | null; fragments: string[]; merged: string | null } {
  let allMatches: { path: string; size: number; name: string }[] = []
  try {
    const files = readdirSync(downloadDir)
    for (const f of files) {
      if (!f.includes(jobId)) continue
      if (f.endsWith('.part') || f.endsWith('.ytdl')) continue
      try {
        const fullPath = join(downloadDir, f)
        const info = statSync(fullPath)
        allMatches.push({ path: fullPath, size: info.size, name: f })
      } catch {}
    }
  } catch {}

  if (allMatches.length === 0) {
    console.error(`[FindFile] Tidak ada file untuk job ${jobId} di ${downloadDir}`)
    return { file: null, fragments: [], merged: null }
  }

  console.log(`[FindFile] Ditemukan: ${allMatches.map(m => `${m.name} (${(m.size / 1048576).toFixed(1)}MB)`).join(', ')}`)

  const fragmentPattern = /\.f\d+\./
  const mergedFiles = allMatches.filter(m => !fragmentPattern.test(m.name))
  const fragmentFiles = allMatches.filter(m => fragmentPattern.test(m.name))

  if (mergedFiles.length > 0) {
    mergedFiles.sort((a, b) => b.size - a.size)
    return { file: mergedFiles[0].path, fragments: fragmentFiles.map(f => f.path), merged: mergedFiles[0].path }
  }

  return { file: null, fragments: fragmentFiles.map(f => f.path), merged: null }
}

/**
 * Manual merge dengan ffmpeg jika yt-dlp merge gagal.
 * Gabungkan video + audio fragments menjadi satu file mp4.
 */
function manualMerge(fragments: string[], outputPath: string, ffmpegPath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    // Pisahkan video dan audio fragments
    const videoExts = ['.mp4', '.webm', '.mkv']
    const audioExts = ['.m4a', '.opus', '.ogg', '.mp3', '.webm']

    let videoFile = ''
    let audioFile = ''

    for (const f of fragments) {
      const ext = '.' + (f.split('.').pop() || '')
      if (!videoFile && videoExts.includes(ext)) videoFile = f
      else if (!audioFile && audioExts.includes(ext)) audioFile = f
    }

    // Jika ada 2 webm, cek mana yang lebih besar (biasanya video)
    if (!videoFile && !audioFile && fragments.length >= 2) {
      const sorted = [...fragments]
      sorted.sort((a, b) => {
        try {
          return statSync(b).size - statSync(a).size
        } catch { return 0 }
      })
      videoFile = sorted[0]
      audioFile = sorted[1]
    }

    if (!videoFile || !audioFile) {
      // Hanya 1 file — copy langsung
      const src = videoFile || audioFile || fragments[0]
      if (src) {
        try {
          copyFileSync(src, outputPath)
          return resolve()
        } catch (e: any) {
          return reject(new Error(`Copy gagal: ${e.message}`))
        }
      }
      return reject(new Error('Tidak ada fragment untuk di-merge'))
    }

    console.log(`[Merge] Video: ${basename(videoFile)}, Audio: ${basename(audioFile)} → ${basename(outputPath)}`)

    const args = [
      '-i', videoFile,
      '-i', audioFile,
      '-c', 'copy',       // Copy tanpa re-encode (cepat)
      '-movflags', '+faststart',  // Optimasi streaming
      '-y',               // Overwrite
      outputPath
    ]

    const child = spawn(ffmpegPath, args)
    let stderr = ''
    child.stderr.on('data', (d) => { stderr += d.toString() })

    const timer = setTimeout(() => {
      child.kill('SIGTERM')
      reject(new Error('ffmpeg merge timeout 120s'))
    }, 120_000)

    child.on('close', (code) => {
      clearTimeout(timer)
      if (code === 0 && existsSync(outputPath)) {
        console.log(`[Merge] Berhasil! → ${basename(outputPath)}`)
        // Hapus fragments setelah merge sukses
        for (const f of fragments) {
          try { unlinkSync(f) } catch {}
        }
        resolve()
      } else {
        reject(new Error(`ffmpeg merge gagal (code ${code}): ${stderr.substring(0, 300)}`))
      }
    })

    child.on('error', (err) => {
      clearTimeout(timer)
      reject(err)
    })
  })
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
          formatId: `bestvideo[height<=${h}]+bestaudio/best[height<=${h}]/best`,
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
      const isAudioOnly = formatStr.includes('bestaudio') && !formatStr.includes('bestvideo')
      const ext = isAudioOnly ? 'm4a' : 'mp4'
      // Output TANPA ekstensi — biarkan yt-dlp yang tentukan
      const tmpBase = join(getDownloadDir(), `figo-${jobId}`)
      const tmpFile = `${tmpBase}.%(ext)s`
      
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
          // Auto-cleanup file lama sebelum download baru
          const cleanup = cleanupStaleTempFiles()
          if (cleanup.cleaned > 0) {
            console.log(`[Cleanup] Hapus ${cleanup.cleaned} file lama, freed ${cleanup.freedMB}MB`)
          }

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

          await execYtdlp(url, flags, 600_000, 'download')
          console.log(`[Job ${jobId}] yt-dlp selesai, verifikasi file...`)

          // Cari file hasil download berdasarkan jobId
          const downloadDir = getDownloadDir()
          let result = findDownloadedFile(downloadDir, jobId)

          let actualFile = result.file

          // Jika yt-dlp merge gagal tapi fragments ada → merge manual dgn ffmpeg
          if (!actualFile && result.fragments.length >= 2) {
            console.warn(`[Job ${jobId}] Merge yt-dlp gagal, coba manual merge...`)
            const mergedPath = join(downloadDir, `figo-${jobId}.mp4`)
            try {
              await manualMerge(result.fragments, mergedPath, ffmpegPath)
              actualFile = mergedPath
            } catch (mergeErr: any) {
              console.error(`[Job ${jobId}] Manual merge gagal:`, mergeErr.message)
              // Fallback: kirim fragment terbesar (video-only) daripada error total
              result.fragments.sort((a, b) => {
                try { return statSync(b).size - statSync(a).size } catch { return 0 }
              })
              actualFile = result.fragments[0]
              console.warn(`[Job ${jobId}] Fallback ke fragment terbesar: ${basename(actualFile)}`)
            }
          } else if (!actualFile && result.fragments.length === 1) {
            // Hanya 1 fragment (mungkin combined stream)
            actualFile = result.fragments[0]
          }

          if (!actualFile) {
            try {
              const allFiles = readdirSync(downloadDir)
              console.error(`[Job ${jobId}] Files di dir: ${allFiles.join(', ')}`)
            } catch {}
            throw new Error('File hasil download tidak ditemukan.')
          }

          // Deteksi ekstensi aktual
          const actualExt = actualFile.split('.').pop() || ext
          const actualMime = actualExt === 'm4a' || actualExt === 'mp3' || actualExt === 'opus'
            ? 'audio/' + (actualExt === 'm4a' ? 'mp4' : actualExt)
            : 'video/mp4'

          console.log(`[Job ${jobId}] Done! File: ${actualFile} (${actualExt})`)

          downloadJobs.set(jobId, {
            ...(downloadJobs.get(jobId) as any),
            status: 'done',
            filePath: actualFile,
            ext: actualExt,
            mimeType: actualMime,
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

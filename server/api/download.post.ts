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
  'xvideos.com', 'xnxx.com', 'xhamster.com', 'redtube.com',
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

// ===================== TWITTER/X HELPER =====================

/** Deteksi apakah URL dari Twitter/X */
function isTwitterUrl(url: string): boolean {
  try {
    const hostname = new URL(url).hostname.toLowerCase()
    return hostname.includes('twitter.com') || hostname.includes('x.com')
  } catch {
    return false
  }
}

/** Extract username dan tweet ID dari URL Twitter/X */
function extractTweetInfo(url: string): { username: string, tweetId: string } | null {
  try {
    const urlObj = new URL(url)
    const match = urlObj.pathname.match(/^\/([^\/]+)\/status\/(\d+)/)
    if (match) {
      // Jika pathname adalah /i/status/... ganti jadi 'Twitter'
      const username = match[1].toLowerCase() === 'i' ? 'Twitter' : match[1]
      return { username, tweetId: match[2] }
    }
  } catch {}
  return null
}

interface TwitterMediaItem {
  type: 'photo' | 'video' | 'gif'
  url: string
  thumbnail: string
  width: number
  height: number
  duration?: number
  qualities?: any[]
}

/** Fetch media dari FxTwitter API */
async function fetchTwitterMedia(url: string): Promise<{
  title: string
  uploader: string
  mediaItems: TwitterMediaItem[]
}> {
  const tweetInfo = extractTweetInfo(url)
  if (!tweetInfo) throw new Error('Tidak bisa mengekstrak Tweet ID dari URL.')

  // FxTwitter API — gratis, tanpa API key. Wajib pakai username valid.
  const apiUrl = `https://api.fxtwitter.com/${tweetInfo.username}/status/${tweetInfo.tweetId}`
  console.log(`[Twitter] Fetching via FxTwitter: ${apiUrl}`)

  const response = await fetch(apiUrl, {
    headers: {
      'User-Agent': 'Figo-Downloader/1.0 (+https://github.com/fikfikk)',
      'Accept': 'application/json',
    },
  })

  if (!response.ok) {
    throw new Error(`FxTwitter API error: ${response.status} ${response.statusText}`)
  }

  const data = await response.json() as any
  const tweet = data?.tweet

  if (!tweet) {
    throw new Error('Tweet tidak ditemukan atau sudah dihapus.')
  }

  const mediaItems: TwitterMediaItem[] = []

  // Kumpulkan foto
  if (tweet.media?.photos && Array.isArray(tweet.media.photos)) {
    for (const photo of tweet.media.photos) {
      let origUrl = photo.url
      let thumbUrl = photo.url
      
      try {
        const uOrig = new URL(photo.url)
        uOrig.searchParams.set('name', 'orig')
        origUrl = uOrig.toString()

        const uThumb = new URL(photo.url)
        uThumb.searchParams.set('name', 'small')
        thumbUrl = uThumb.toString()
      } catch {}

      mediaItems.push({
        type: 'photo',
        url: origUrl,
        thumbnail: thumbUrl,
        width: photo.width || 0,
        height: photo.height || 0,
      })
    }
  }

  // Kumpulkan video dan GIF
  if (tweet.media?.videos && Array.isArray(tweet.media.videos)) {
    for (const video of tweet.media.videos) {
      const qualities: any[] = []
      if (video.variants && Array.isArray(video.variants)) {
        // Hanya ambil MP4, abaikan m3u8 (HLS) yang bukan video utuh
        const mp4Variants = video.variants.filter((v: any) => v.content_type === 'video/mp4' && v.url)
        // Sortir dari resolusi/bitrate tertinggi
        mp4Variants.sort((a, b) => (b.bitrate || 0) - (a.bitrate || 0))
        
        for (const v of mp4Variants) {
          // Cari tinggi pixel dari pola /vid/avc1/1280x720/ di URL
          const resMatch = v.url.match(/\/(\d+)x(\d+)\//)
          const h = resMatch ? parseInt(resMatch[2]) : video.height || 720
          // Filter duplikat tinggi
          if (!qualities.find(q => q.height === h)) {
            qualities.push({
              height: h,
              url: v.url,
              filesize: null
            })
          }
        }
      }

      mediaItems.push({
        type: video.type === 'gif' ? 'gif' : 'video',
        url: video.url || '',
        thumbnail: video.thumbnail_url || '',
        width: video.width || 0,
        height: video.height || 0,
        duration: video.duration || undefined,
        qualities: qualities.length > 0 ? qualities : undefined
      })
    }
  }

  // Kalau tidak ada media sama sekali
  if (mediaItems.length === 0) {
    throw new Error('Tweet ini tidak mengandung media (foto/video).')
  }

  const uploader = tweet.author?.screen_name
    ? `@${tweet.author.screen_name}`
    : tweet.author?.name || 'Unknown'

  return {
    title: tweet.text || 'Twitter Post',
    uploader,
    mediaItems,
    statistics: {
      likes: tweet.likes || 0,
      comments: tweet.replies || 0,
      retweets: tweet.retweets || 0
    }
  }
}

// User-Agent realistis untuk bypass fingerprinting
const REALISTIC_USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36'

/** Deteksi apakah URL dari TikTok */
function isTikTokUrl(url: string): boolean {
  try {
    const h = new URL(url).hostname.toLowerCase()
    return h.includes('tiktok.com') || h.includes('vm.tiktok.com')
  } catch { return false }
}

/** Fetch media TikTok via tikwm.com API (tanpa API key, stabil) */
async function fetchTikTokMedia(url: string): Promise<{
  title: string
  uploader: string
  thumb: string | null
  avatar: string | null
  mediaItems: any[]
}> {
  const apiUrl = `https://www.tikwm.com/api/?url=${encodeURIComponent(url)}&hd=1`
  console.log(`[TikTok] Fetching via tikwm API...`)
  
  const res = await fetch(apiUrl, {
    headers: {
      'User-Agent': REALISTIC_USER_AGENT,
      'Referer': 'https://tikwm.com/',
      'Accept': 'application/json'
    }
  })

  if (!res.ok) throw new Error(`tikwm API error: HTTP ${res.status}`)

  const json = await res.json() as any
  if (json.code !== 0 || !json.data) {
    throw new Error(json.msg || 'TikTok video tidak ditemukan atau link tidak valid.')
  }

  const data = json.data
  const uploader = data.author?.unique_id ? `@${data.author.unique_id}` : (data.author?.nickname || 'TikTok User')
  const thumb = data.cover || data.origin_cover || null
  const avatar = data.author?.avatar || null

  const mediaItems: any[] = []

  // Foto Slideshow (images array)
  if (data.images && Array.isArray(data.images) && data.images.length > 0) {
    for (const imgUrl of data.images) {
      if (imgUrl) mediaItems.push({
        type: 'photo', url: imgUrl, thumbnail: imgUrl, width: 0, height: 0
      })
    }
  }

  // Video (HD + SD kualitas)
  if (mediaItems.length === 0 && data.play) {
    const qualities: any[] = []
    // HD (no watermark) — tikwm hdplay atau play
    if (data.hdplay) qualities.push({ height: 1080, url: data.hdplay })
    if (data.play && data.play !== data.hdplay) qualities.push({ height: 720, url: data.play })
    if (data.wmplay) qualities.push({ height: 480, url: data.wmplay, label: 'SD (Watermark)' })
    
    mediaItems.push({
      type: 'video',
      url: data.hdplay || data.play,
      thumbnail: thumb,
      width: data.width || 0,
      height: data.height || 0,
      duration: data.duration || undefined,
      qualities
    })
  }

  if (mediaItems.length === 0) throw new Error('Tidak ada media yang ditemukan di video TikTok ini.')

  return {
    title: data.title || 'TikTok Video',
    uploader, thumb, avatar, mediaItems,
    statistics: {
      likes: data.digg_count || 0,
      comments: data.comment_count || 0,
      shares: data.share_count || 0,
      views: data.play_count || 0
    }
  }
}

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

  // URL terakhir
  args.push(url)
  return args
}

/**
 * Mencari path binary (yt-dlp/ffmpeg) secara cerdas.
 * Memprioritaskan binary lokal di server/api, jika gagal/tidak ada maka pakai binary sistem.
 */
function getBinaryPath(name: 'yt-dlp' | 'ffmpeg'): string {
  const isWin = process.platform === 'win32'
  const localName = isWin ? `${name}.exe` : name
  const localPath = join(process.cwd(), 'server', 'api', localName)

  if (existsSync(localPath)) {
    // Pada Linux, pastikan file lokal bukan sekadar file Windows yang salah commit (.exe)
    // dan memiliki permission yang benar. 
    // Kita cek ukuran file sebagai indikator kasar: .exe biasanya jauh berbeda ukurannya atau 
    // kita biarkan spawn yang gagal nanti mentrigger fallback (untuk saat ini asumsikan ada dulu).
    return localPath
  }

  // Fallback ke binary global sistem
  return name
}

function spawnYtdlp(binPath: string, args: string[], timeoutMs = 120_000): Promise<{ stdout: string }> {
  const execute = (path: string): Promise<{ stdout: string }> => {
    return new Promise((resolve, reject) => {
      console.log(`[Spawn] Running: ${path} ${args.join(' ')}`)
      const child = spawn(path, args)
      let stdout = ''
      let stderr = ''

      const timer = setTimeout(() => {
        child.kill('SIGTERM')
        reject(new Error(`yt-dlp timeout setelah ${timeoutMs / 1000}s`))
      }, timeoutMs)

      child.stdout.on('data', (data) => { stdout += data.toString() })
      child.stderr.on('data', (data) => { stderr += data.toString() })

      child.on('close', (code) => {
        clearTimeout(timer)
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
async function execYtdlp(url: string, flags: Record<string, any>, timeoutMs = 120_000, purpose: 'info' | 'download' = 'info'): Promise<{ stdout: string }> {
  const binPath = getBinaryPath('yt-dlp')

  // Deteksi apakah URL YouTube untuk apply strategy khusus
  const isYouTube = /(?:youtube\.com|youtu\.be)/i.test(url)

  let strategies: Record<string, any>[]

  if (!isYouTube) {
    // Non-YouTube: Berikan 2 strategy dengan UA berbeda untuk bypass blokir
    strategies = [
      { ...flags, userAgent: REALISTIC_USER_AGENT },
      { ...flags, userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' }
    ]
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
    return { file: mergedFiles[0]?.path || null, fragments: fragmentFiles.map(f => f.path), merged: mergedFiles[0]?.path || null }
  }

  return { file: null, fragments: fragmentFiles.map(f => f.path), merged: null }
}

/**
 * Manual merge dengan ffmpeg jika yt-dlp merge gagal.
 * Gabungkan video + audio fragments menjadi satu file mp4.
 */
function manualMerge(fragments: string[], outputPath: string, ffmpegPath: string): Promise<void> {
  const execute = (path: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (fragments.length < 2) {
        // Hanya 1 file — copy langsung
        const src = fragments[0]
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

      // Identifikasi video vs audio BERDASARKAN UKURAN FILE
      const withSize = fragments.map(f => {
        try { return { path: f, size: statSync(f).size } }
        catch { return { path: f, size: 0 } }
      })
      withSize.sort((a, b) => b.size - a.size)

      const videoFile = withSize[0]?.path || ''  // File terbesar = video
      const audioFile = withSize[1]?.path || ''  // File terkecil = audio

      console.log(`[Merge] Video: ${basename(videoFile)} (${(withSize[0].size / 1048576).toFixed(1)}MB)`)
      console.log(`[Merge] Audio: ${basename(audioFile)} (${(withSize[1].size / 1048576).toFixed(1)}MB)`)
      console.log(`[Merge] Output: ${basename(outputPath)}`)

      const args = [
        '-i', videoFile,
        '-i', audioFile,
        '-c:v', 'copy',     // Copy video tanpa re-encode (cepat)
        '-c:a', 'aac',      // Convert audio ke AAC agar kompatibel dengan MP4/Browser
        '-b:a', '192k',     // Bitrate audio
        '-movflags', '+faststart',  // Optimasi streaming
        '-y',               // Overwrite
        outputPath
      ]

      const child = spawn(path, args)
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
          const err = new Error(`ffmpeg merge gagal (code ${code}): ${stderr.substring(0, 300)}`)
          ;(err as any).code = code
          reject(err)
        }
      })

      child.on('error', (err) => {
        clearTimeout(timer)
        reject(err)
      })
    })
  }

  return execute(ffmpegPath).catch(async (err) => {
    const isLocal = ffmpegPath.includes('server' + (process.platform === 'win32' ? '\\' : '/') + 'api')
    if (isLocal) {
      console.warn(`[Merge] Local ffmpeg gagal, mencoba system ffmpeg...`)
      return execute('ffmpeg')
    }
    throw err
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

      // ---------- TWITTER/X: gunakan FxTwitter API ----------
      if (isTwitterUrl(url)) {
        try {
          const twitterData = await fetchTwitterMedia(url)
          const duration = Date.now() - startTime
          console.log(`[FetchInfo] Twitter success in ${duration}ms — ${twitterData.mediaItems.length} media items`)

          // Twitter langsung siap
          const enrichedItems = twitterData.mediaItems.map(item => {
            if (item.type === 'video' && !item.qualities) {
              return {
                ...item,
                qualities: [{ height: item.height || 720, url: item.url, filesize: null }]
              }
            }
            return item
          })

          return {
            success: true,
            mode: 'info',
            source: 'twitter',
            title: twitterData.title,
            thumb: twitterData.mediaItems[0]?.thumbnail || null,
            avatar: twitterData.mediaItems[0] ? `https://unavatar.io/twitter/${twitterData.uploader.replace('@', '')}?fallback=false` : null,
            duration: null,
            uploader: twitterData.uploader,
            mediaItems: enrichedItems,
            statistics: twitterData.statistics,
            fetchDuration: Date.now() - startTime,
          }
        } catch (twitterErr: any) {
          console.error(`[Twitter] FxTwitter API gagal: ${twitterErr.message}`)
          throw createError({
            statusCode: 422,
            message: twitterErr.message || 'Gagal mengambil media dari tweet.'
          })
        }
      }

      // ---------- TIKTOK: gunakan tikwm API (bypass IP block yt-dlp) ----------
      if (isTikTokUrl(url)) {
        try {
          const ttData = await fetchTikTokMedia(url)
          console.log(`[TikTok] Success: ${ttData.mediaItems.length} media items`)
          return {
            success: true, mode: 'info', source: 'tiktok',
            title: ttData.title,
            uploader: ttData.uploader,
            thumb: ttData.thumb,
            avatar: ttData.avatar
              ? `/api/download-twitter?url=${encodeURIComponent(ttData.avatar)}&type=photo&inline=true`
              : `https://ui-avatars.com/api/?name=${encodeURIComponent(ttData.uploader.replace('@',''))}&background=010101&color=fff&size=128`,
            mediaItems: ttData.mediaItems,
            statistics: ttData.statistics,
            fetchDuration: Date.now() - startTime
          }
        } catch (ttErr: any) {
          console.error(`[TikTok] tikwm API gagal: ${ttErr.message}`)
          throw createError({
            statusCode: 422,
            message: ttErr.message || 'Gagal mengambil media dari TikTok.'
          })
        }
      }

      // ---------- INSTAGRAM: Hybrid Strategy (YtDlp Video -> HTML Photo) ----------
      if (/(?:instagram\.com|ig\.me)/i.test(url)) {
        const parseIgContent = (raw: string) => {
          let caption = raw || ''
          let likes = ''
          let comments = ''

          // Format: "90K likes, 727 comments - User on Date: \"Caption\""
          // Juga mendukung bahasa Indonesia: "99,4 rb suka, 893 komentar"
          const likesMatch = raw.match(/([\d.,]+[KMB rbjt]*)\s*(?:likes?|suka)/i)
          const commentsMatch = raw.match(/([\d.,]+[KMB rbjt]*)\s*(?:comments?|komentar)/i)
          
          if (likesMatch) likes = likesMatch[1]
          if (commentsMatch) comments = commentsMatch[1]

          // Ambil caption: cari teks di dalam tanda kutip terakhir setelah titik dua
          const captionQuoteMatch = raw.match(/:\s*["'](.*)["']$/i)
          if (captionQuoteMatch) {
            caption = captionQuoteMatch[1]
          } else {
            // Fallback: hapus awalan standar Instagram
            caption = raw.replace(/^.*?on Instagram: /i, '').replace(/^.*?on [\w\s\d,]+: /i, '').trim()
          }

          return { caption: caption.trim(), likes, comments }
        }

        if (/\/stories\//i.test(url)) {
           throw createError({
             statusCode: 422,
             message: 'Pengunduhan Instagram Story tidak didukung oleh public server.'
           })
        }

        // STEP 1: Coba tangkap videonya pakai YT-DLP (Sangat kuat untuk Reels)
        try {
          console.log('[Instagram] Mencoba yt-dlp untuk ekstrak Video / Reel...')
          const ytRaw = await execYtdlp(url, {
            dumpSingleJson: true, noCheckCertificates: true, noWarnings: true,
            ignoreErrors: true, forceIpv4: true
          }, 20000)
          
          const ytParsed = parseYtdlpOutput(ytRaw.stdout)
          if (ytParsed && ytParsed.title && !ytParsed.title.includes('There is no video')) {
             
             // Extractor yt-dlp sukses! Format ke UI standards
             const qualitiesMap = new Map<number, string>()
             if (ytParsed.formats) {
                for (const f of ytParsed.formats) {
                   // kita ambil URL CDN instagram yang mentah (exclude manifest dash/m3u8 bila ada supaya proxy bs unduh as mp4)
                   if (f.height && f.vcodec && f.vcodec !== 'none' && f.url && !f.url.includes('.m3u8')) {
                      qualitiesMap.set(f.height, f.url)
                   }
                }
             }
             
             let qualities = Array.from(qualitiesMap.keys())
                .sort((a, b) => b - a)
                .map(h => ({ height: h, url: qualitiesMap.get(h)! }))

             if (qualities.length === 0) {
                 qualities = [{ height: 720, url: ytParsed.url || url }]
             }

             const uploader = ytParsed.uploader || ytParsed.channel || 'Instagram User'
             const thumb = ytParsed.thumbnail || null
             const rawTitle = ytParsed.description || ytParsed.title || 'Instagram Reel'
             const { caption, likes, comments } = parseIgContent(rawTitle)
             
             return {
                success: true, mode: 'info', source: 'instagram',
                title: caption.substring(0, 200),
                uploader, thumb,
                statistics: {
                   likes: likes || ytParsed.like_count || 0,
                   comments: comments || ytParsed.comment_count || 0
                },
                avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(uploader.replace('@',''))}&background=E1306C&color=fff&size=128`,
                mediaItems: [{
                   type: 'video',
                   url: url,
                   thumbnail: thumb,
                   width: ytParsed.width || 0,
                   height: ytParsed.height || 0,
                   qualities
                }],
                fetchDuration: Date.now() - startTime
             }
          }
        } catch(vidErr) {
          console.log('[Instagram] Tidak diformat sbg video murni, Fallback mengecek foto...')
        }

        // STEP 2: Scrape HTML murni (Khusus untuk Single Photos / Carousel tanpa video)
        try {
          const res = await fetch(url, {
            headers: {
              'User-Agent': REALISTIC_USER_AGENT,
              'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
              'Accept-Language': 'en-US,en;q=0.5',
              'Upgrade-Insecure-Requests': '1',
              'Sec-Fetch-Dest': 'document',
              'Sec-Fetch-Mode': 'navigate',
              'Sec-Fetch-Site': 'none'
            }
          })

          if (!res.ok) {
            throw new Error(`Instagram menolak akses (HTTP ${res.status}).`)
          }

          const html = await res.text()

          // STEP 2: Scrape OpenGraph metadata (paling stabil untuk publik)
          const ogImageMatch = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i) ||
                               html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i)
          
          const ogVideoMatch = html.match(/<meta[^>]+property=["']og:video(?::secure_url)?["'][^>]+content=["']([^"']+)["']/i) ||
                               html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:video(?::secure_url)?["']/i)

          const ogTitleMatch = html.match(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i) ||
                               html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:title["']/i) ||
                               html.match(/<title>([^<]+)<\/title>/i)

          const ogDescMatch = html.match(/<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']+)["']/i) ||
                              html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:description["']/i)

          const ogUrlMatch = html.match(/<meta[^>]+property=["']og:url["'][^>]+content=["']([^"']+)["']/i)

          // Coba cari username uploader dari title atau JSON-LD
          let uploader = 'Instagram User'
          if (ogTitleMatch && ogTitleMatch[1]) {
             const title = ogTitleMatch[1]
             // Biasa formatnya: "Username (@handle) • Instagram photos and videos"
             const handleMatch = title.match(/\((@[^)]+)\)/)
             if (handleMatch) uploader = handleMatch[1]
             else if (title.includes('on Instagram')) uploader = title.split(' on Instagram')[0]
          }

          const mediaItems: any[] = []

          // Jika ada video, prioritaskan video
          if (ogVideoMatch && ogVideoMatch[1]) {
             const vUrl = ogVideoMatch[1].replace(/&amp;/g, '&')
             mediaItems.push({
                type: 'video',
                url: vUrl,
                thumbnail: ogImageMatch ? ogImageMatch[1].replace(/&amp;/g, '&') : vUrl,
                width: 0, height: 0,
                qualities: [{ height: 720, url: vUrl }]
             })
          } 
          // Jika tidak ada video tapi ada foto
          else if (ogImageMatch && ogImageMatch[1]) {
             const pUrl = ogImageMatch[1].replace(/&amp;/g, '&')
             mediaItems.push({
                type: 'photo',
                url: pUrl,
                thumbnail: pUrl,
                width: 0, height: 0
             })
          }

          // STEP 3: Fallback ke Public API jika scraping HTML tidak menghasilkan media
          // (Misal untuk Carousel yang butuh data lebih detail)
          if (mediaItems.length === 0) {
             console.log('[Instagram] HTML Scraping nihil, mencoba Public Fallback API...')
             const fallbackRes = await fetch(`https://api.vreden.web.id/api/igdownload?url=${encodeURIComponent(url)}`).catch(() => null)
             if (fallbackRes && fallbackRes.ok) {
                const fbJson = await fallbackRes.json() as any
                if (fbJson.status && fbJson.result && fbJson.result.length > 0) {
                   for (const item of fbJson.result) {
                      const type = item.url.includes('.mp4') ? 'video' : 'photo'
                      mediaItems.push({
                         type,
                         url: item.url,
                         thumbnail: item.thumbnail || item.url,
                         width: 0, height: 0,
                         qualities: type === 'video' ? [{ height: 720, url: item.url }] : undefined
                      })
                   }
                }
             }
          }

          if (mediaItems.length === 0) {
            throw new Error('Tidak ada media yang terdeteksi. Post mungkin di-private.')
          }
          
          const rawCaption = ogDescMatch ? ogDescMatch[1].replace(/&amp;/g, '&') : (ogTitleMatch ? ogTitleMatch[1] : 'Instagram Post')
          const { caption, likes, comments } = parseIgContent(rawCaption)

          return {
             success: true, mode: 'info', source: 'instagram',
             title: caption.substring(0, 200),
             uploader, 
             thumb: mediaItems[0]?.thumbnail || null,
             statistics: { likes, comments },
             avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(uploader.replace('@',''))}&background=E1306C&color=fff&size=128`,
             mediaItems,
             fetchDuration: Date.now() - startTime
          }
        } catch (igErr: any) {
           console.error(`[Instagram] Scraper gagal: ${igErr.message}`)
           throw createError({
             statusCode: 422,
             message: igErr.message || 'Gagal mengambil media. Pastikan akun tidak di-private.'
           })
        }
      }

      // ---------- DEFAULT: yt-dlp untuk platform lain ----------
      const dataRaw = await execYtdlp(url, {
        dumpSingleJson: true,
        noCheckCertificates: true,
        noPlaylist: true,
        forceIpv4: true,
        ignoreErrors: true,
        retries: 3,
        fragmentRetries: 3,
      }, 60_000)
      const fetchDuration = Date.now() - startTime
      console.log(`[FetchInfo] Success in ${fetchDuration}ms for: ${url}`)

      const data = parseYtdlpOutput(dataRaw.stdout)


      // KODE ASLI UNTUK NON-INSTAGRAM (YOUTUBE, TIKTOK, DLL)
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

      // Deteksi source platform secara generik dari domain
      let source = 'web'
      const lowUrl = url.toLowerCase()
      if (lowUrl.includes('pornhub.com')) source = 'pornhub'
      else if (lowUrl.includes('youtube.com') || lowUrl.includes('youtu.be')) source = 'youtube'
      else if (lowUrl.includes('facebook.com') || lowUrl.includes('fb.watch')) source = 'facebook'
      else if (lowUrl.includes('reddit.com')) source = 'reddit'

      return {
        success: true,
        mode: 'info',
        source,
        title: data.title || 'Video',
        thumb: data.thumbnail || null,
        duration: data.duration || null,
        uploader: data.uploader || data.channel || null,
        statistics: {
          views: data.view_count || 0,
          likes: data.like_count || 0
        },
        qualities,
        fetchDuration,
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
      
      const ffmpegPath = getBinaryPath('ffmpeg')

      const rawTitle = (body?.title as string) || 'Video'
      const uploader = (body?.uploader as string) || 'Unknown'
      const resolution = (body?.resolution as string) || 'Video'
      // Remove invalid characters for Windows/Linux filenames
      const safeTitle = rawTitle.replace(/[/\\?%*:|"<>]/g, '').trim()
      const safeUploader = uploader.replace(/[/\\?%*:|"<>@]/g, '').trim()
      const finalName = `figo-${Date.now()}-${safeUploader} - ${resolution}`

      downloadJobs.set(jobId, { status: 'processing', ext, title: finalName })

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
          // Biarkan yt-dlp yang tentukan merge formatnya (biasanya mkv/webm jika codec tidak cocok untuk mp4)
          // Jika kita batasi ke mp4, yt-dlp bisa gagal merge jika streamnya VP9/Opus.

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
              actualFile = result.fragments[0] || null
              console.warn(`[Job ${jobId}] Fallback ke fragment terbesar: ${actualFile ? basename(actualFile) : 'none'}`)
            }
          } else if (!actualFile && result.fragments.length === 1) {
            // Hanya 1 fragment (mungkin combined stream)
            actualFile = result.fragments[0] || null
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
    let msg = err.message || String(err)
    
    if (msg.includes('empty media response')) {
      console.warn('[Figo] IG Private/Blocked Post terdeteksi (Gagal fetch dari yt-dlp).')
      msg = 'Video/Foto IG di-private atau server diblokir oleh Instagram.'
    } else {
      console.error('[Download Native Error]', msg.split('\n')[0])
      msg = 'Sistem Error: ' + msg.replace('Native Error: ', '')
    }
    
    if (err.statusCode) throw err
    throw createError({
      statusCode: (msg.includes('di-private')) ? 422 : 500,
      message: msg
    })
  }
})

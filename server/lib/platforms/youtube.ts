// ============================================================
// YouTube — info fetch dengan LRU cache + parallel race strategy
// ============================================================

import type { PlatformResult } from '../types'
import { execYtdlp, parseYtdlpOutput } from '../ytdlp'

// ===================== LRU CACHE =====================

interface CacheEntry {
  data: PlatformResult
  timestamp: number
}

interface OEmbedResponse {
  title?: string
  author_name?: string
  thumbnail_url?: string
}

const CACHE_TTL = 10 * 60 * 1000 // 10 menit
const CACHE_MAX_SIZE = 50         // Max 50 video cached
const infoCache = new Map<string, CacheEntry>()

/** Evict entries lama jika melebihi limit */
function evictCache(): void {
  if (infoCache.size <= CACHE_MAX_SIZE) return
  // Hapus entry tertua berdasarkan timestamp
  let oldest: string | null = null
  let oldestTs = Infinity
  for (const [key, entry] of infoCache) {
    if (entry.timestamp < oldestTs) {
      oldestTs = entry.timestamp
      oldest = key
    }
  }
  if (oldest) infoCache.delete(oldest)
}

/** Extract video ID dari URL YouTube untuk cache key */
export function extractYouTubeVideoId(url: string): string | null {
  try {
    const u = new URL(url)
    // youtube.com/watch?v=xxx
    if (u.searchParams.has('v')) return u.searchParams.get('v')
    // youtu.be/xxx
    if (u.hostname.includes('youtu.be')) return u.pathname.slice(1).split('/')[0] || null
    // youtube.com/shorts/xxx, youtube.com/embed/xxx
    const match = u.pathname.match(/\/(shorts|embed|v)\/([^/?]+)/)
    if (match) return match[2] || null
  } catch {}
  return null
}

function buildCacheKey(url: string): string {
  return extractYouTubeVideoId(url) || Buffer.from(url).toString('base64url')
}

function getCachedInfo(key: string): PlatformResult | null {
  const cached = infoCache.get(key)
  if (!cached || Date.now() - cached.timestamp >= CACHE_TTL) return null
  return cached.data
}

function normalizeYouTubeWatchUrl(url: string, videoId: string | null): string {
  return videoId ? `https://www.youtube.com/watch?v=${videoId}` : url
}

async function fetchWithTimeout<T>(url: string, timeoutMs: number): Promise<T> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const response = await fetch(url, { signal: controller.signal })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    return await response.json() as T
  } finally {
    clearTimeout(timer)
  }
}

/** Deteksi apakah URL dari YouTube */
export function isYouTubeUrl(url: string): boolean {
  return /(?:youtube\.com|youtu\.be)/i.test(url)
}

// Preset kualitas statis — tidak perlu probing yt-dlp untuk tahu format selector.
// Selector bersifat deterministik dengan fallback ke best available jika resolusi tak ada.
const PRESET_TIERS = [
  { height: 1080, note: 'Full HD' },
  { height: 720, note: 'HD' },
  { height: 480, note: 'SD' },
  { height: 360, note: '' },
]

/** Bangun daftar kualitas statis tanpa memanggil yt-dlp */
function buildPresetQualities(): any[] {
  const qualities = PRESET_TIERS.map(({ height: h, note }) => ({
    // Fallback berlapis: video mp4 < h + audio m4a, lalu best < h, lalu best apa saja
    formatId: `bestvideo[height<=${h}][ext=mp4]+bestaudio[ext=m4a]/bestvideo[height<=${h}]+bestaudio/best[height<=${h}]/best`,
    label: `${h}p`,
    resolution: `${h}p`,
    ext: 'mp4',
    hasAudio: true,
    hasVideo: true,
    filesize: null,
    note,
  }))

  // Opsi audio-only
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

  return qualities
}

/**
 * Fast info untuk YouTube: preview (oEmbed) + daftar kualitas statis.
 * Tidak ada extraction yt-dlp di flow ini — quality langsung tampil instan.
 * yt-dlp baru dijalankan saat user benar-benar menekan tombol download.
 */
export async function fetchYouTubeFastInfo(url: string): Promise<PlatformResult & { qualities: any[] }> {
  const videoId = extractYouTubeVideoId(url)
  const watchUrl = normalizeYouTubeWatchUrl(url, videoId)
  let meta: OEmbedResponse | null = null

  try {
    meta = await fetchWithTimeout<OEmbedResponse>(`https://www.youtube.com/oembed?format=json&url=${encodeURIComponent(watchUrl)}`, 2_500)
  } catch (err: any) {
    console.warn(`[YouTube Fast] oEmbed gagal untuk ${videoId || url}: ${err.message || String(err)}`)
  }

  return {
    source: 'youtube',
    id: videoId || undefined,
    title: meta?.title || 'YouTube Video',
    uploader: meta?.author_name || 'YouTube',
    thumb: meta?.thumbnail_url || (videoId ? `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg` : null),
    avatar: null,
    duration: null,
    mediaItems: [],
    statistics: {},
    qualities: buildPresetQualities(),
  }
}

/**
 * Fetch YouTube info dengan optimasi:
 * 1. LRU cache (TTL 10 menit) — repeated paste = instant
 * 2. Retry strategy sequential (karena race overhead > benefit ketika attempt 1 biasanya berhasil)
 */
export async function fetchYouTubeInfo(url: string): Promise<PlatformResult> {
  // Cek cache — jika hit, return langsung (0ms)
  const videoId = extractYouTubeVideoId(url)
  const cacheKey = buildCacheKey(url)
  const cached = getCachedInfo(cacheKey)
  if (cached) {
    console.log(`[YouTube] Cache HIT untuk ${cacheKey} — skip yt-dlp`)
    return cached
  }

  const t0 = Date.now()
  const dataRaw = await execYtdlp(url, {
    dumpSingleJson: true,
    noCheckCertificates: true,
    noPlaylist: true,
    // JANGAN forceIpv4 — IPv6 ke YouTube sering lebih cepat di datacenter
    ignoreErrors: true,
    noCacheDir: true,       // Skip disk cache (lambat di VPS murah)
    socketTimeout: 10,      // Cap socket timeout 10s (default 20s)
    retries: 1,
    fragmentRetries: 1,
  }, 30_000) // 30s cukup untuk info mode
  const t1 = Date.now()

  const data = parseYtdlpOutput(dataRaw.stdout)
  const t2 = Date.now()
  console.log(`[YouTube] ⏱ yt-dlp=${t1 - t0}ms | JSON.parse=${t2 - t1}ms | payload=${(dataRaw.stdout.length / 1024).toFixed(0)}KB | formats=${data.formats?.length || 0}`)

  // Debug log untuk YouTube (tanpa array formats yang sangat panjang)
  const { formats: _, requested_formats: __, entries: ___, ...safeYouTubeData } = data as any
  console.log('[DEBUG] YouTube yt-dlp Raw Data:', JSON.stringify(safeYouTubeData, null, 2))

  // Collect unique (height, ext) combinations
  const formatMap = new Map<string, { height: number; ext: string; size: number }>()
  let bestAudioSize = 0

  if (data.formats && Array.isArray(data.formats)) {
    // Cari audio terbaik dulu
    for (const f of data.formats) {
      if (f.acodec && f.acodec !== 'none' && (!f.vcodec || f.vcodec === 'none')) {
        const aSize = f.filesize || f.filesize_approx || 0
        if (aSize > bestAudioSize) bestAudioSize = aSize
      }
    }

    for (const f of data.formats) {
      if (f.height && f.vcodec && f.vcodec !== 'none') {
        // Normalisasi ekstensi
        let ext = f.ext === 'm4v' ? 'mp4' : f.ext
        if (!['mp4', 'webm'].includes(ext)) ext = 'mp4'

        const key = `${f.height}-${ext}`
        const vSize = f.filesize || f.filesize_approx || 0

        if (!formatMap.has(key) || vSize > (formatMap.get(key)?.size || 0)) {
          formatMap.set(key, { height: f.height, ext, size: vSize })
        }
      }
    }
  }

  const sortedFormats = Array.from(formatMap.values()).sort((a, b) => {
    if (b.height !== a.height) return b.height - a.height
    return a.ext === 'mp4' ? -1 : 1 // Prioritas MP4 jika resolusi sama
  })

  const qualities = sortedFormats.map(f => {
    const { height: h, ext } = f
    const tier = h >= 2160 ? '4K' : h >= 1440 ? '2K' : h >= 1080 ? 'Full HD' : h >= 720 ? 'HD' : h >= 480 ? 'SD' : ''

    const filterStr = `[height<=${h}][ext=${ext}]`
    const audioFilter = ext === 'mp4' ? 'bestaudio[ext=m4a]/bestaudio' : 'bestaudio'

    return {
      formatId: `bestvideo${filterStr}+${audioFilter}/best${filterStr}/best`,
      label: `${h}p`,
      resolution: `${h}p`,
      ext,
      hasAudio: true,
      hasVideo: true,
      filesize: (f.size > 0 ? f.size + bestAudioSize : null),
      note: tier,
    }
  })

  // Tambah audio-only option
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

  // Deteksi source platform lebih granular (generic yt-dlp bisa handle banyak site)
  let source = 'web'
  const lowUrl = url.toLowerCase()
  if (lowUrl.includes('pornhub.com')) source = 'pornhub'
  else if (lowUrl.includes('youtube.com') || lowUrl.includes('youtu.be')) source = 'youtube'
  else if (lowUrl.includes('facebook.com') || lowUrl.includes('fb.watch')) source = 'facebook'
  else if (lowUrl.includes('reddit.com')) source = 'reddit'

  const result: PlatformResult & { qualities: typeof qualities; duration: number | null } = {
    source,
    id: data.id || videoId || undefined,
    title: data.title || 'Video',
    uploader: data.uploader || data.channel || 'Unknown',
    thumb: data.thumbnail || null,
    avatar: null,
    duration: data.duration || null,
    mediaItems: [], // YouTube menggunakan qualities, bukan mediaItems
    statistics: {
      views: data.view_count || 0,
      likes: data.like_count || 0,
    },
    qualities,
  }

  // Simpan ke cache
  if (cacheKey) {
    infoCache.set(cacheKey, { data: result, timestamp: Date.now() })
    evictCache()
    console.log(`[YouTube] Cached info untuk ${cacheKey}`)
  }

  return result
}

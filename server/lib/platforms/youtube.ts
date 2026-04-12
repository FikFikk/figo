// ============================================================
// YouTube — info fetch dengan LRU cache + parallel race strategy
// ============================================================

import type { PlatformResult, MediaItem, Quality } from '../types'
import { execYtdlp, parseYtdlpOutput } from '../ytdlp'

// ===================== LRU CACHE =====================

interface CacheEntry {
  data: PlatformResult
  timestamp: number
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
function extractVideoId(url: string): string | null {
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

/** Deteksi apakah URL dari YouTube */
export function isYouTubeUrl(url: string): boolean {
  return /(?:youtube\.com|youtu\.be)/i.test(url)
}

/**
 * Fetch YouTube info dengan optimasi:
 * 1. LRU cache (TTL 10 menit) — repeated paste = instant
 * 2. Retry strategy sequential (karena race overhead > benefit ketika attempt 1 biasanya berhasil)
 */
export async function fetchYouTubeInfo(url: string): Promise<PlatformResult> {
  // Cek cache — jika hit, return langsung (0ms)
  const videoId = extractVideoId(url)
  if (videoId) {
    const cached = infoCache.get(videoId)
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      console.log(`[YouTube] Cache HIT untuk ${videoId} — skip yt-dlp`)
      return cached.data
    }
  }

  const dataRaw = await execYtdlp(url, {
    dumpSingleJson: true,
    noCheckCertificates: true,
    noPlaylist: true,
    forceIpv4: true,
    ignoreErrors: true,
    retries: 1,
    fragmentRetries: 1,
  }, 30_000) // 30s cukup untuk info mode

  const data = parseYtdlpOutput(dataRaw.stdout)

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
  if (videoId) {
    infoCache.set(videoId, { data: result, timestamp: Date.now() })
    evictCache()
    console.log(`[YouTube] Cached info untuk ${videoId}`)
  }

  return result
}

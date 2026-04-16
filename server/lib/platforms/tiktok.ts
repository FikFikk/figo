// ============================================================
// TikTok — tikwm.com API integration (bypass IP block yt-dlp)
// ============================================================

import type { PlatformResult, MediaItem, Quality } from '../types'
import { REALISTIC_USER_AGENT } from '../constants'

/** Deteksi apakah URL dari TikTok */
export function isTikTokUrl(url: string): boolean {
  try {
    const h = new URL(url).hostname.toLowerCase()
    return h.includes('tiktok.com') || h.includes('vm.tiktok.com')
  } catch { return false }
}

/** Fetch media TikTok via tikwm.com API (tanpa API key, stabil) */
export async function fetchTikTokMedia(url: string): Promise<PlatformResult> {
  const apiUrl = `https://www.tikwm.com/api/?url=${encodeURIComponent(url)}&hd=1`
  console.log(`[TikTok] Fetching via tikwm API...`)

  const res = await fetch(apiUrl, {
    headers: {
      'User-Agent': REALISTIC_USER_AGENT,
      'Referer': 'https://tikwm.com/',
      'Accept': 'application/json',
    },
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

  const mediaItems: MediaItem[] = []

  // Foto Slideshow (images array)
  if (data.images && Array.isArray(data.images) && data.images.length > 0) {
    for (const imgUrl of data.images) {
      if (imgUrl) mediaItems.push({
        type: 'photo', url: imgUrl, thumbnail: imgUrl, width: 0, height: 0,
      })
    }
  }

  // Video (HD + SD kualitas)
  if (mediaItems.length === 0 && data.play) {
    const qualities: Quality[] = []
    if (data.hdplay) qualities.push({ height: 1080, url: data.hdplay })
    if (data.play && data.play !== data.hdplay) qualities.push({ height: 720, url: data.play })
    if (data.wmplay) qualities.push({ height: 480, url: data.wmplay, label: 'SD (Watermark)' })

    mediaItems.push({
      type: 'video',
      url: data.hdplay || data.play,
      thumbnail: thumb || '',
      width: data.width || 0,
      height: data.height || 0,
      duration: data.duration || undefined,
      qualities,
    })
  }

  if (mediaItems.length === 0) throw new Error('Tidak ada media yang ditemukan di video TikTok ini.')

  return {
    source: 'tiktok',
    id: data.id,
    title: data.title || 'TikTok Video',
    uploader,
    thumb,
    avatar: avatar
      ? `/api/media-proxy?url=${encodeURIComponent(avatar)}&type=photo&inline=true`
      : `https://ui-avatars.com/api/?name=${encodeURIComponent(uploader.replace('@', ''))}&background=010101&color=fff&size=128`,
    mediaItems,
    statistics: {
      likes: data.digg_count || 0,
      comments: data.comment_count || 0,
      shares: data.share_count || 0,
      views: data.play_count || 0,
    },
  }
}

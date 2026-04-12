// ============================================================
// Twitter/X — FxTwitter API integration
// ============================================================

import type { PlatformResult, MediaItem, Quality } from '../types'

/** Deteksi apakah URL dari Twitter/X */
export function isTwitterUrl(url: string): boolean {
  try {
    const hostname = new URL(url).hostname.toLowerCase()
    return hostname.includes('twitter.com') || hostname.includes('x.com')
  } catch {
    return false
  }
}

/** Extract username dan tweet ID dari URL Twitter/X */
function extractTweetInfo(url: string): { username: string; tweetId: string } | null {
  try {
    const urlObj = new URL(url)
    const match = urlObj.pathname.match(/^\/([^\/]+)\/status\/(\d+)/)
    if (match) {
      // Jika pathname adalah /i/status/... ganti jadi 'Twitter'
      const username = match[1]!.toLowerCase() === 'i' ? 'Twitter' : match[1]!
      return { username, tweetId: match[2]! }
    }
  } catch {}
  return null
}

/** Fetch media dari FxTwitter API — cepat (~100-200ms) */
export async function fetchTwitterMedia(url: string): Promise<PlatformResult> {
  const tweetInfo = extractTweetInfo(url)
  if (!tweetInfo) throw new Error('Tidak bisa mengekstrak Tweet ID dari URL.')

  // FxTwitter API — gratis, tanpa API key
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

  const mediaItems: MediaItem[] = []

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
      const qualities: Quality[] = []
      if (video.variants && Array.isArray(video.variants)) {
        // Hanya MP4, abaikan m3u8 (HLS)
        const mp4Variants = video.variants.filter((v: any) => v.content_type === 'video/mp4' && v.url)
        mp4Variants.sort((a: any, b: any) => (b.bitrate || 0) - (a.bitrate || 0))

        for (const v of mp4Variants) {
          const resMatch = v.url.match(/\/(\d+)x(\d+)\//)
          const h = resMatch ? parseInt(resMatch[2]) : video.height || 720
          // Filter duplikat tinggi
          if (!qualities.find(q => q.height === h)) {
            qualities.push({ height: h, url: v.url, filesize: null })
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
        qualities: qualities.length > 0 ? qualities : undefined,
      })
    }
  }

  if (mediaItems.length === 0) {
    throw new Error('Tweet ini tidak mengandung media (foto/video).')
  }

  const uploader = tweet.author?.screen_name
    ? `@${tweet.author.screen_name}`
    : tweet.author?.name || 'Unknown'

  return {
    source: 'twitter',
    title: tweet.text || 'Twitter Post',
    uploader,
    thumb: mediaItems[0]?.thumbnail || null,
    avatar: `https://unavatar.io/twitter/${uploader.replace('@', '')}?fallback=false`,
    mediaItems,
    statistics: {
      likes: tweet.likes || 0,
      comments: tweet.replies || 0,
      retweets: tweet.retweets || 0,
    },
  }
}

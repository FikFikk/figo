// ============================================================
// Instagram — Hybrid strategy: yt-dlp video + HTML scrape foto
// Optimized: yt-dlp dan HTML scrape dirace secara paralel
// ============================================================

import type { PlatformResult, MediaItem, Quality } from '../types'
import { REALISTIC_USER_AGENT } from '../constants'
import { execYtdlp, parseYtdlpOutput } from '../ytdlp'

/** Deteksi apakah URL dari Instagram */
export function isInstagramUrl(url: string): boolean {
  return /(?:instagram\.com|ig\.me)/i.test(url)
}

function extractIgId(url: string): string {
  const match = url.match(/(?:p|reel|tv)\/([^/?]+)/i)
  return match ? match[1]! : ''
}

/** Parse caption, likes, comments dari raw IG text */
function parseIgContent(raw: string): { caption: string; likes: string; comments: string } {
  let caption = raw || ''
  let likes = ''
  let comments = ''

  // Format: "90K likes, 727 comments - User on Date: \"Caption\""
  // Juga mendukung bahasa Indonesia
  const likesMatch = raw.match(/([\d.,]+[KMB rbjt]*)\s*(?:likes?|suka)/i)
  const commentsMatch = raw.match(/([\d.,]+[KMB rbjt]*)\s*(?:comments?|komentar)/i)

  if (likesMatch) likes = likesMatch[1]!
  if (commentsMatch) comments = commentsMatch[1]!

  const captionQuoteMatch = raw.match(/:\s*["'](.*?)["']$/i)
  if (captionQuoteMatch) {
    caption = captionQuoteMatch[1]!
  } else {
    caption = raw.replace(/^.*?on Instagram: /i, '').replace(/^.*?on [\w\s\d,]+: /i, '').trim()
  }

  return { caption: caption.trim(), likes, comments }
}

/** Coba extract via yt-dlp (powerful untuk Reels) */
async function tryYtdlpExtract(url: string): Promise<PlatformResult | null> {
  try {
    console.log('[Instagram] Mencoba yt-dlp untuk ekstrak Video / Reel...')
    const ytRaw = await execYtdlp(url, {
      dumpSingleJson: true, noCheckCertificates: true, noWarnings: true,
      ignoreErrors: true, forceIpv4: true,
    }, 20000)

    const ytParsed = parseYtdlpOutput(ytRaw.stdout)
    // Simplify output untuk yt-dlp agar tak crash console karena terlalu pajang
    const { formats: _, ...safeYtParsed } = ytParsed as any
    console.log('[DEBUG] Instagram yt-dlp Raw Data:', JSON.stringify(safeYtParsed, null, 2))

    if (!ytParsed?.title || ytParsed.title.includes('There is no video')) return null

    // Format qualities dari yt-dlp formats
    const qualitiesMap = new Map<number, string>()
    if (ytParsed.formats) {
      for (const f of ytParsed.formats) {
        if (f.height && f.vcodec && f.vcodec !== 'none' && f.url && !f.url.includes('.m3u8')) {
          qualitiesMap.set(f.height, f.url)
        }
      }
    }

    let qualities: Quality[] = Array.from(qualitiesMap.keys())
      .sort((a, b) => b - a)
      .map(h => ({ height: h, url: qualitiesMap.get(h)! }))

    if (qualities.length === 0) {
      qualities = [{ height: 720, url: ytParsed.url || url }]
    }

    const uploader = ytParsed.uploader || ytParsed.channel || 'Instagram User'
    const thumb = ytParsed.thumbnail || null
    const rawTitle = ytParsed.description || ytParsed.title || 'Instagram Reel'
    const { caption, likes, comments } = parseIgContent(rawTitle)
    const igId = ytParsed.id || ytParsed.display_id || extractIgId(url)

    return {
      source: 'instagram',
      id: igId,
      title: caption.substring(0, 200),
      uploader,
      thumb,
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(uploader.replace('@', ''))}&background=E1306C&color=fff&size=128`,
      mediaItems: [{
        type: 'video',
        url,
        thumbnail: thumb || '',
        width: ytParsed.width || 0,
        height: ytParsed.height || 0,
        qualities,
      }],
      statistics: {
        likes: likes || ytParsed.like_count || 0,
        comments: comments || ytParsed.comment_count || 0,
      },
    }
  } catch {
    console.log('[Instagram] yt-dlp gagal, bukan video murni.')
    return null
  }
}

/** Coba scrape HTML murni (untuk Single Photos / Carousel) */
async function tryHtmlScrape(url: string): Promise<PlatformResult | null> {
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': REALISTIC_USER_AGENT,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Upgrade-Insecure-Requests': '1',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
      },
    })

    if (!res.ok) throw new Error(`Instagram menolak akses (HTTP ${res.status}).`)

    const html = await res.text()

    // Scrape OpenGraph metadata
    const ogImageMatch = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i) ||
                          html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i)

    const ogVideoMatch = html.match(/<meta[^>]+property=["']og:video(?::secure_url)?["'][^>]+content=["']([^"']+)["']/i) ||
                          html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:video(?::secure_url)?["']/i)

    const ogTitleMatch = html.match(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i) ||
                          html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:title["']/i) ||
                          html.match(/<title>([^<]+)<\/title>/i)

    const ogDescMatch = html.match(/<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']+)["']/i) ||
                         html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:description["']/i)

    // Cari username uploader
    let uploader = 'Instagram User'
    if (ogTitleMatch?.[1]) {
      const title = ogTitleMatch[1]
      const handleMatch = title.match(/\((@[^)]+)\)/)
      if (handleMatch) uploader = handleMatch[1]!
      else if (title.includes('on Instagram')) uploader = title.split(' on Instagram')[0]!
    }

    const mediaItems: MediaItem[] = []

    // Prioritaskan video
    if (ogVideoMatch?.[1]) {
      const vUrl = ogVideoMatch[1].replace(/&amp;/g, '&')
      mediaItems.push({
        type: 'video',
        url: vUrl,
        thumbnail: ogImageMatch ? ogImageMatch[1]!.replace(/&amp;/g, '&') : vUrl,
        width: 0, height: 0,
        qualities: [{ height: 720, url: vUrl }],
      })
    } else if (ogImageMatch?.[1]) {
      const pUrl = ogImageMatch[1].replace(/&amp;/g, '&')
      mediaItems.push({
        type: 'photo',
        url: pUrl,
        thumbnail: pUrl,
        width: 0, height: 0,
      })
    }

    // Fallback ke Public API jika scraping nihil
    if (mediaItems.length === 0) {
      console.log('[Instagram] HTML Scraping nihil, mencoba Public Fallback API...')
      const fallbackRes = await fetch(`https://api.vreden.web.id/api/igdownload?url=${encodeURIComponent(url)}`).catch(() => null)
      if (fallbackRes?.ok) {
        const fbJson = await fallbackRes.json() as any
        console.log('[DEBUG] Instagram Fallback API Raw Data:', JSON.stringify(fbJson, null, 2))
        if (fbJson.status && fbJson.result?.length > 0) {
          for (const item of fbJson.result) {
            const type = item.url.includes('.mp4') ? 'video' : 'photo' as const
            mediaItems.push({
              type,
              url: item.url,
              thumbnail: item.thumbnail || item.url,
              width: 0, height: 0,
              qualities: type === 'video' ? [{ height: 720, url: item.url }] : undefined,
            })
          }
        }
      }
    }

    if (mediaItems.length === 0) return null

    const rawCaption = ogDescMatch ? ogDescMatch[1]!.replace(/&amp;/g, '&') : (ogTitleMatch ? ogTitleMatch[1]! : 'Instagram Post')
    const { caption, likes, comments } = parseIgContent(rawCaption)
    const igId = extractIgId(url)

    return {
      source: 'instagram',
      id: igId,
      title: caption.substring(0, 200),
      uploader,
      thumb: mediaItems[0]?.thumbnail || null,
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(uploader.replace('@', ''))}&background=E1306C&color=fff&size=128`,
      mediaItems,
      statistics: { likes, comments },
    }
  } catch (err: any) {
    console.log(`[Instagram] HTML scrape gagal: ${err.message}`)
    return null
  }
}

/**
 * Fetch media Instagram — parallel race: yt-dlp vs HTML scrape.
 * Siapa yang pertama sukses menang.
 */
export async function fetchInstagramMedia(url: string): Promise<PlatformResult> {
  // Cek Story — tidak didukung
  if (/\/stories\//i.test(url)) {
    throw new Error('Pengunduhan Instagram Story tidak didukung oleh public server.')
  }

  // Race: yt-dlp dan HTML scrape berjalan bersamaan
  const [ytdlpResult, htmlResult] = await Promise.allSettled([
    tryYtdlpExtract(url),
    tryHtmlScrape(url),
  ])

  // Prioritaskan yt-dlp (lebih kaya data: kualitas, caption, stats)
  if (ytdlpResult.status === 'fulfilled' && ytdlpResult.value) {
    return ytdlpResult.value
  }

  // Fallback ke HTML scrape
  if (htmlResult.status === 'fulfilled' && htmlResult.value) {
    return htmlResult.value
  }

  throw new Error('Gagal mengambil media. Pastikan akun tidak di-private.')
}

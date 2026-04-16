import { defineEventHandler, getQuery, createError, setResponseHeaders } from 'h3'

/**
 * Proxy download untuk media CDN (Twitter, Instagram, TikTok).
 * Menghindari CORS issue ketika download langsung dari browser.
 * Query params: url (URL media), type (photo|video), filename (opsional)
 */
export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const mediaUrl = query.url as string
  const type = (query.type as string) || 'photo'
  const filename = (query.filename as string) || ''
  const isInline = query.inline === 'true'

  if (!mediaUrl) {
    throw createError({ statusCode: 400, message: 'URL media diperlukan.' })
  }

  // Validasi domain — izinkan domain media yang dikenal
  try {
    const hostname = new URL(mediaUrl).hostname.toLowerCase()
    const allowed = [
      'twimg.com', 'instagram.com', 'cdninstagram.com', 'fbcdn.net',
      'tikwm.com', 'tiktokcdn.com', 'tiktokcdn-us.com', 'tiktok.com', 'musical.ly',
      'p16-sign-sg.tiktokcdn.com', 'v19-webapp.tiktok.com', 'v16m-default.tiktokcdn-us.com',
    ]
    if (!allowed.some(d => hostname.endsWith(d) || hostname.includes(d))) {
      throw createError({ statusCode: 403, message: 'Domain media tidak diizinkan.' })
    }
  } catch (err: any) {
    if (err.statusCode) throw err
    throw createError({ statusCode: 400, message: 'URL media tidak valid.' })
  }

  try {
    const response = await fetch(mediaUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
        'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Referer': mediaUrl.includes('twimg') ? 'https://x.com/' : undefined,
      },
    })

    if (!response.ok) {
      const error: any = new Error(`Gagal mengunduh media: ${response.status}`)
      error.statusCode = response.status
      throw error
    }

    // Tentukan content-type dan ekstensi
    const contentType = response.headers.get('content-type') || ''

    let ext = type === 'video' ? 'mp4' : 'jpg'

    if (contentType.includes('png')) ext = 'png'
    else if (contentType.includes('webp')) ext = 'webp'
    else if (contentType.includes('gif')) ext = 'gif'
    else if (contentType.includes('jpeg') || contentType.includes('jpg')) ext = 'jpg'
    else if (contentType.includes('mp4') || contentType.includes('video/')) ext = 'mp4'

    let downloadName = filename || `figo-${type}.${ext}`
    // Jika filename dari query tidak memiliki ekstensi yang benar, tambahkan ekstensi
    if (filename && !filename.toLowerCase().endsWith(`.${ext}`)) {
      downloadName = `${filename}.${ext}`
    }

    // Pastikan filename utama hanya berisi karakter ASCII untuk menghindari error HTTP Header
    const safeFilename = downloadName.replace(/[^\x20-\x7E]/g, '').replace(/"/g, '') || 'download';

    setResponseHeaders(event, {
      'Content-Type': contentType,
      'Content-Disposition': `${isInline ? 'inline' : 'attachment'}; filename="${safeFilename}"; filename*=UTF-8''${encodeURIComponent(downloadName)}`,
      'Cache-Control': 'no-cache',
    })

    // Tambah Content-Length jika tersedia
    const contentLength = response.headers.get('content-length')
    if (contentLength) {
      setResponseHeaders(event, { 'Content-Length': contentLength })
    }

    // Stream response body ke client
    return response.body

  } catch (err: any) {
    if (err.statusCode === 403 || err.statusCode === 404) {
      console.warn(`[Media Proxy] Media ${err.statusCode}: Link expired atau di-block oleh platform.`)
    } else {
      console.error('[Media Proxy] Error:', err.message || err)
    }
    
    if (err.statusCode) throw err
    throw createError({
      statusCode: 500,
      message: 'Gagal mengunduh media: ' + (err.message || String(err)),
    })
  }
})

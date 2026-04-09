import { defineEventHandler, getQuery, createError, setResponseHeaders } from 'h3'

/**
 * Proxy download untuk media Twitter (foto/video).
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

  // Validasi domain — izinkan domain Twitter media & Instagram media
  try {
    const hostname = new URL(mediaUrl).hostname.toLowerCase()
    const allowed = ['twimg.com', 'instagram.com', 'cdninstagram.com', 'fbcdn.net']
    if (!allowed.some(d => hostname.endsWith(d) || hostname.includes(d))) {
      throw createError({ statusCode: 403, message: 'Domain media tidak diizinkan.' })
    }
  } catch (err: any) {
    if (err.statusCode) throw err
    throw createError({ statusCode: 400, message: 'URL media tidak valid.' })
  }

  try {
    console.log(`[Twitter Proxy] Downloading ${type}: ${mediaUrl.substring(0, 100)}...`)

    const response = await fetch(mediaUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
        'Referer': mediaUrl.includes('twimg') ? 'https://x.com/' : 'https://www.instagram.com/',
      },
    })

    if (!response.ok) {
      throw new Error(`Gagal mengunduh media: ${response.status}`)
    }

    // Tentukan content-type dan ekstensi
    const contentType = response.headers.get('content-type') || (type === 'video' ? 'video/mp4' : 'image/jpeg')
    let ext = 'jpg'
    if (contentType.includes('png')) ext = 'png'
    else if (contentType.includes('webp')) ext = 'webp'
    else if (contentType.includes('gif')) ext = 'gif'
    else if (contentType.includes('mp4') || contentType.includes('video')) ext = 'mp4'

    let downloadName = filename || `twitter-${type}-${Date.now()}.${ext}`
    // Jika filename dari query tidak memiliki ekstensi yang benar, tambahkan ekstensi
    if (filename && !filename.toLowerCase().endsWith(`.${ext}`)) {
      downloadName = `${filename}.${ext}`
    }

    setResponseHeaders(event, {
      'Content-Type': contentType,
      'Content-Disposition': `${isInline ? 'inline' : 'attachment'}; filename="${downloadName}"; filename*=UTF-8''${encodeURIComponent(downloadName)}`,
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
    console.error('[Twitter Proxy] Error:', err)
    if (err.statusCode) throw err
    throw createError({
      statusCode: 500,
      message: 'Gagal mengunduh media Twitter: ' + (err.message || String(err))
    })
  }
})

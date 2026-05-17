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
    const statusCode = err.statusCode || 500

    // Log peringatan biasa, menghindari penulisan error unhandled di server log
    console.warn(`[Media Proxy] Media ${statusCode}: Link expired atau di-block oleh platform. Pesan: ${err.message || String(err)}`)

    // Jika request inline dan untuk tipe foto, kembalikan gambar fallback SVG yang cantik
    if (isInline && type === 'photo') {
      setResponseHeaders(event, {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
      })
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100%" height="100%">
  <rect width="100%" height="100%" fill="#0a0f1d" />
  <circle cx="50" cy="50" r="30" fill="#1e293b" opacity="0.15" />
  <g transform="translate(38, 38)" stroke="#475569" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
    <rect x="0" y="0" width="24" height="24" rx="2" ry="2" />
    <circle cx="8" cy="8" r="2.5" />
    <path d="M22 21L16 12L12 18L9 15L2 21" />
  </g>
</svg>`
    }

    // Untuk unduhan atau tipe video, lempar error terstruktur yang ditangani dengan baik
    throw createError({
      statusCode: statusCode,
      message: err.message || 'Gagal mengunduh media.',
      fatal: false
    })
  }
})

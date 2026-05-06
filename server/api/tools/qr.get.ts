import { defineEventHandler, getQuery, setResponseHeader, createError, getRequestIP } from 'h3'
import QRCode from 'qrcode'

// ============================================================
// QR ENGINE API — Public QR Code Generator dengan Rate Limiter
// ============================================================

// Rate limiter: Map<IP, { count, resetTime }>
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()
const RATE_LIMIT = 30 // Maksimal request per window
const RATE_WINDOW = 60 * 1000 // 1 menit (ms)

// Bersihkan entry yang sudah expired setiap 5 menit
setInterval(() => {
  const now = Date.now()
  for (const [ip, data] of rateLimitMap) {
    if (now > data.resetTime) rateLimitMap.delete(ip)
  }
}, 5 * 60 * 1000)

function checkRateLimit(ip: string): { allowed: boolean; remaining: number; resetIn: number } {
  const now = Date.now()
  const entry = rateLimitMap.get(ip)

  if (!entry || now > entry.resetTime) {
    // Window baru
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_WINDOW })
    return { allowed: true, remaining: RATE_LIMIT - 1, resetIn: RATE_WINDOW }
  }

  if (entry.count >= RATE_LIMIT) {
    return { allowed: false, remaining: 0, resetIn: entry.resetTime - now }
  }

  entry.count++
  return { allowed: true, remaining: RATE_LIMIT - entry.count, resetIn: entry.resetTime - now }
}

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const text = (query.text as string) || ''
  const format = ((query.format as string) || 'png').toLowerCase()
  const size = Math.min(Math.max(Number(query.size) || 300, 50), 2000) // Batas 50-2000px
  const darkColor = (query.dark as string) || '#000000'
  const lightColor = (query.light as string) || '#ffffff'
  const errorLevel = (['L', 'M', 'Q', 'H'].includes((query.ec as string)?.toUpperCase()) ? (query.ec as string).toUpperCase() : 'M') as 'L' | 'M' | 'Q' | 'H'
  const margin = Math.min(Math.max(Number(query.margin) ?? 2, 0), 10)

  if (!text) {
    throw createError({ statusCode: 400, message: 'Parameter "text" wajib diisi. Contoh: /api/tools/qr?text=hello' })
  }

  if (text.length > 4296) {
    throw createError({ statusCode: 400, message: 'Teks terlalu panjang. Maksimal 4296 karakter untuk QR Code.' })
  }

  // Rate limit check
  const ip = getRequestIP(event, { xForwardedFor: true }) || 'unknown'
  const rl = checkRateLimit(ip)

  // Set rate limit headers
  setResponseHeader(event, 'X-RateLimit-Limit', String(RATE_LIMIT))
  setResponseHeader(event, 'X-RateLimit-Remaining', String(rl.remaining))
  setResponseHeader(event, 'X-RateLimit-Reset', String(Math.ceil(rl.resetIn / 1000)))

  if (!rl.allowed) {
    throw createError({
      statusCode: 429,
      message: `Rate limit exceeded. Coba lagi dalam ${Math.ceil(rl.resetIn / 1000)} detik.`
    })
  }

  const qrOptions = {
    errorCorrectionLevel: errorLevel,
    margin,
    width: size,
    color: {
      dark: darkColor,
      light: lightColor,
    },
  }

  try {
    if (format === 'svg') {
      const svg = await QRCode.toString(text, { ...qrOptions, type: 'svg' })
      setResponseHeader(event, 'Content-Type', 'image/svg+xml')
      setResponseHeader(event, 'Cache-Control', 'public, max-age=86400')
      return svg
    }

    // Default: PNG sebagai buffer
    const buffer = await QRCode.toBuffer(text, { ...qrOptions, type: 'png' })
    setResponseHeader(event, 'Content-Type', 'image/png')
    setResponseHeader(event, 'Cache-Control', 'public, max-age=86400')
    return buffer
  } catch (err: any) {
    throw createError({
      statusCode: 500,
      message: `Gagal generate QR: ${err.message || 'Unknown error'}`
    })
  }
})

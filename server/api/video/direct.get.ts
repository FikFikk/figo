import { defineEventHandler, getQuery, createError, setResponseHeaders } from 'h3'

/**
 * Bridge: frontend → backend Go video proxy
 * GET /api/video/direct?id=XXX&type=movie|tv&s=N&e=N
 * 
 * Kenapa perlu bridge ini:
 * - Backend Go jalan di 127.0.0.1:5001 (tidak bisa diakses browser langsung)
 * - Nuxt server bisa akses internal 127.0.0.1:5001
 * - Browser akses /api/video/direct → Nuxt forward ke Go backend
 */
export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const { id, type, s, e } = query

  if (!id || !type) {
    throw createError({ statusCode: 400, statusMessage: 'id dan type wajib diisi' })
  }

  const goBase = process.env.GO_DOWNLOAD_API_URL || 'http://127.0.0.1:5001'
  const params = new URLSearchParams({ id: String(id), type: String(type) })
  if (s) params.set('s', String(s))
  if (e) params.set('e', String(e))

  const upstreamUrl = `${goBase}/video/direct?${params}`

  try {
    const res = await fetch(upstreamUrl, {
      headers: { 'Accept': 'text/html,*/*' },
    })

    if (!res.ok) {
      throw createError({ statusCode: res.status, statusMessage: 'Go backend error' })
    }

    const html = await res.text()

    setResponseHeaders(event, {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-cache',
      // Izinkan iframe embed dari domain sendiri
      'X-Frame-Options': 'SAMEORIGIN',
    })

    return html
  } catch (err: any) {
    if (err.statusCode) throw err
    throw createError({ statusCode: 502, statusMessage: 'Go backend tidak dapat dijangkau' })
  }
})

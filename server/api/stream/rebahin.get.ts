import { defineEventHandler, getQuery, createError } from 'h3'

const GO_API = process.env.GO_DOWNLOAD_API_URL || 'http://127.0.0.1:5001'

/**
 * GET /api/stream/rebahin?url=https://rebahin.app/tow-2026/
 * Dekripsi payload Rebahin & kembalikan direct streaming links backend
 */
export default defineEventHandler(async (event) => {
  const { url } = getQuery(event)
  const filmURL = String(url || '').trim()

  if (!filmURL || !filmURL.startsWith('http')) {
    throw createError({
      statusCode: 400,
      statusMessage: 'URL film Rebahin tidak valid'
    })
  }

  try {
    const data = await $fetch(`${GO_API}/stream/rebahin?url=${encodeURIComponent(filmURL)}`)
    return data
  } catch (error: any) {
    console.error('Rebahin stream error:', error.message)
    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Gagal mendekripsi stream URL'
    })
  }
})

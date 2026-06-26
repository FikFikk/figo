import { defineEventHandler, getQuery, createError } from 'h3'

const GO_API = process.env.GO_DOWNLOAD_API_URL || 'http://127.0.0.1:5001'

/**
 * GET /api/lk21/stream?url=https://tv11.lk21official.cc/film-slug
 * Ambil embed player URLs dari halaman film LK21
 */
export default defineEventHandler(async (event) => {
  const { url } = getQuery(event)
  const filmURL = String(url || '').trim()

  if (!filmURL || !filmURL.startsWith('http')) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid film URL'
    })
  }

  try {
    const data = await $fetch(`${GO_API}/lk21/stream?url=${encodeURIComponent(filmURL)}`)
    return data
  } catch (error: any) {
    console.error('LK21 stream error:', error.message)
    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Failed to fetch stream URLs'
    })
  }
})

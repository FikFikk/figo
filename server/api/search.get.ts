import { defineEventHandler, getQuery, createError } from 'h3'
import { assertUnlocked } from '../lib/stream-auth'

const GO_API = process.env.GO_DOWNLOAD_API_URL || 'http://127.0.0.1:5001'

/**
 * GET /api/search?q=keyword
 * Cari film/series via TMDB melalui Go backend
 */
export default defineEventHandler(async (event) => {
  assertUnlocked(event)

  const { q } = getQuery(event)
  const query = String(q || '').trim()

  if (!query || query.length < 2) {
    return { results: [] }
  }

  try {
    const data = await $fetch(`${GO_API}/stream/search?q=${encodeURIComponent(query)}`)
    return data
  } catch {
    return { results: [] }
  }
})

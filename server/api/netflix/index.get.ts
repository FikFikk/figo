import { defineEventHandler, getQuery } from 'h3'
import { assertUnlocked } from '../../lib/stream-auth'

const GO_API = process.env.GO_DOWNLOAD_API_URL || 'http://127.0.0.1:5001'

/**
 * GET /api/netflix
 * Series tersedia di Netflix (TMDB discover/tv + provider 8).
 * ?q=<query> → search mode
 * Dijaga PIN gate.
 */
export default defineEventHandler(async (event) => {
  assertUnlocked(event)

  const query = getQuery(event)
  const search = String(query.q || '').trim()

  const target = search
    ? `${GO_API}/catalog/netflix/search?q=${encodeURIComponent(search)}`
    : `${GO_API}/catalog/netflix`

  try {
    return await $fetch(target)
  } catch {
    return { results: [], total: 0 }
  }
})

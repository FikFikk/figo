import { defineEventHandler, getQuery } from 'h3'
import { assertUnlocked } from '../../lib/stream-auth'

const GO_API = process.env.GO_DOWNLOAD_API_URL || 'http://127.0.0.1:5001'

/**
 * Daftar show trending dari katalog (TVMaze via Go backend).
 * Dijaga PIN gate.
 */
export default defineEventHandler(async (event) => {
  assertUnlocked(event)

  const query = getQuery(event)
  const search = String(query.q || '').trim()

  // Bila ada query pencarian, arahkan ke endpoint search Go
  const target = search
    ? `${GO_API}/catalog/search?q=${encodeURIComponent(search)}`
    : `${GO_API}/catalog/trending`

  try {
    return await $fetch(target)
  } catch {
    return { results: [] }
  }
})

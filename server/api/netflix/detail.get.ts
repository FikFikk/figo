import { defineEventHandler, getQuery } from 'h3'
import { assertUnlocked } from '../../lib/stream-auth'

const GO_API = process.env.GO_DOWNLOAD_API_URL || 'http://127.0.0.1:5001'

/**
 * GET /api/netflix/detail?id=<tmdb_id>
 * Detail series Netflix (genres, networks, seasons, cast) via TMDB.
 * Dijaga PIN gate.
 */
export default defineEventHandler(async (event) => {
  assertUnlocked(event)

  const query = getQuery(event)
  const id = String(query.id || '').trim()

  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'ID series wajib diisi.' })
  }

  try {
    return await $fetch(`${GO_API}/catalog/netflix/detail?id=${encodeURIComponent(id)}`)
  } catch (err: any) {
    throw createError({
      statusCode: err?.response?.status || 502,
      statusMessage: 'Gagal memuat detail series.',
    })
  }
})

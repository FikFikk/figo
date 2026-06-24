import { defineEventHandler, getRouterParam, createError } from 'h3'
import { assertUnlocked } from '../../lib/stream-auth'

const GO_API = process.env.GO_DOWNLOAD_API_URL || 'http://127.0.0.1:5001'

/**
 * Detail satu show + daftar episode per season.
 * Param: id (show id TVMaze). Dijaga PIN gate.
 */
export default defineEventHandler(async (event) => {
  assertUnlocked(event)

  const id = getRouterParam(event, 'id')
  if (!id || !/^\d+$/.test(id)) {
    throw createError({ statusCode: 400, statusMessage: 'ID show tidak valid.' })
  }

  try {
    // Ambil detail & episode paralel
    const [show, episodes] = await Promise.all([
      $fetch(`${GO_API}/catalog/show?id=${id}`),
      $fetch(`${GO_API}/catalog/episodes?id=${id}`),
    ])
    return { show, ...(episodes as Record<string, unknown>) }
  } catch {
    throw createError({ statusCode: 502, statusMessage: 'Gagal memuat detail show.' })
  }
})

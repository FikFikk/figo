import { defineEventHandler, getQuery } from 'h3'
import { assertUnlocked } from '../lib/stream-auth'

const GO_API = process.env.GO_DOWNLOAD_API_URL || 'http://127.0.0.1:5001'

export default defineEventHandler(async (event) => {
  assertUnlocked(event)
  const { id, season } = getQuery(event)
  if (!id) return { episodes: [] }
  const url = `${GO_API}/catalog/season?id=${id}&season=${season || 1}`
  try {
    return await $fetch(url)
  } catch {
    return { episodes: [] }
  }
})

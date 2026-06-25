import { defineEventHandler, getQuery } from 'h3'
import { assertUnlocked } from '../lib/stream-auth'

const GO_API = process.env.GO_DOWNLOAD_API_URL || 'http://127.0.0.1:5001'

export default defineEventHandler(async (event) => {
  assertUnlocked(event)
  const { q } = getQuery(event)
  const url = q
    ? `${GO_API}/catalog/multi/search?q=${encodeURIComponent(String(q))}`
    : `${GO_API}/catalog/trending`
  try {
    return await $fetch(url)
  } catch {
    return { results: [] }
  }
})

import { defineEventHandler } from 'h3'
import { assertUnlocked } from '../../lib/stream-auth'

const GO_API = process.env.GO_DOWNLOAD_API_URL || 'http://127.0.0.1:5001'

export default defineEventHandler(async (event) => {
  assertUnlocked(event)
  try {
    return await $fetch(`${GO_API}/catalog/anime`)
  } catch {
    return { results: [] }
  }
})

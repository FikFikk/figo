/**
 * GET /api/ai/status
 * Cek apakah AI Studio backend siap
 */
const GO_API = process.env.GO_DOWNLOAD_API_URL || 'http://127.0.0.1:5001'

export default defineEventHandler(async (_event) => {
  try {
    return await $fetch(`${GO_API}/ai/status`)
  } catch {
    return { ready: false, error: 'AI Studio backend unavailable' }
  }
})

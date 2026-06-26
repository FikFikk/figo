import { defineEventHandler, getQuery, createError } from 'h3'

const GO_API = process.env.GO_DOWNLOAD_API_URL || 'http://127.0.0.1:5001'

/**
 * GET /api/lk21/search?q=keyword
 * Cari film di LK21 (Indonesian content) via Cloudflare bypass
 */
export default defineEventHandler(async (event) => {
  const { q } = getQuery(event)
  const query = String(q || '').trim()

  if (!query || query.length < 2) {
    return { results: [], count: 0, query }
  }

  try {
    const data = await $fetch(`${GO_API}/lk21/search?q=${encodeURIComponent(query)}`)
    return data
  } catch (error: any) {
    console.error('LK21 search error:', error.message)
    return { results: [], count: 0, query, error: error.message }
  }
})

/**
 * GET /api/stock/search?q=BBCA
 * Proxy ke IDX API — cari kode saham
 * API menggunakan param 'keyword' bukan 'q'
 */
export default defineEventHandler(async (event) => {
  const { q } = getQuery(event) as { q?: string }

  if (!q || q.trim().length < 1) {
    throw createError({ statusCode: 400, statusMessage: 'Parameter q diperlukan' })
  }

  const query = q.trim().toUpperCase()

  return cachedFetch(`stock:search:${query}`, CACHE_TTL.SEARCH, async () => {
    return fetchWithRetry(`${IDX_BASE_URL}/api/main/search`, {
      headers: getIdxHeaders(),
      params: { keyword: query },
    })
  })
})

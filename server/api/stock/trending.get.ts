/**
 * GET /api/stock/trending
 * Proxy ke IDX API — saham trending hari ini
 */
export default defineEventHandler(async () => {
  return cachedFetch('stock:trending', CACHE_TTL.SHORT, async () => {
    return fetchWithRetry(`${IDX_BASE_URL}/api/main/trending`, {
      headers: getIdxHeaders(),
    })
  })
})

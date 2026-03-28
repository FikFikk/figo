/**
 * GET /api/stock/chart?symbol=BBCA&limit=60
 * Proxy ke IDX API — data OHLCV
 * Endpoint: /api/chart/{symbol}/daily/latest?limit=N
 */
export default defineEventHandler(async (event) => {
  const { symbol, limit } = getQuery(event) as { symbol?: string; limit?: string }

  if (!symbol) {
    throw createError({ statusCode: 400, statusMessage: 'Parameter symbol diperlukan' })
  }

  const sym = symbol.trim().toUpperCase()
  const lim = parseInt(limit || '60', 10)

  return cachedFetch(`stock:chart:${sym}:${lim}`, CACHE_TTL.MEDIUM, async () => {
    return fetchWithRetry(`${IDX_BASE_URL}/api/chart/${sym}/daily/latest`, {
      headers: getIdxHeaders(),
      params: { limit: lim },
    })
  })
})

/**
 * GET /api/stock/info?symbol=BBCA
 * Proxy ke IDX API — info emiten (harga, market cap, volume)
 */
export default defineEventHandler(async (event) => {
  const { symbol } = getQuery(event) as { symbol?: string }

  if (!symbol) {
    throw createError({ statusCode: 400, statusMessage: 'Parameter symbol diperlukan' })
  }

  const sym = symbol.trim().toUpperCase()

  return cachedFetch(`stock:info:${sym}`, CACHE_TTL.LONG, async () => {
    return fetchWithRetry(`${IDX_BASE_URL}/api/emiten/${sym}/info`, {
      headers: getIdxHeaders(),
    })
  })
})

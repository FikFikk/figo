/**
 * GET /api/stock/movers?type=gainers|losers|volume
 * Proxy ke IDX API — market movers
 * Endpoint: /api/movers/{type}
 */
export default defineEventHandler(async (event) => {
  const { type } = getQuery(event) as { type?: string }
  const moverType = type || 'gainers'

  // Map type ke path API yang benar
  const typeMap: Record<string, string> = {
    gainers: 'top-gainer',
    losers: 'top-loser',
    volume: 'top-volume',
  }

  const apiType = typeMap[moverType]
  if (!apiType) {
    throw createError({ statusCode: 400, statusMessage: 'Type harus: gainers, losers, atau volume' })
  }

  return cachedFetch(`stock:movers:${moverType}`, CACHE_TTL.SHORT, async () => {
    return fetchWithRetry(`${IDX_BASE_URL}/api/movers/${apiType}`, {
      headers: getIdxHeaders(),
    })
  })
})

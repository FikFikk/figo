/**
 * GET /api/stock/bandarmology?symbol=BBCA
 * Proxy ke IDX API — analisa akumulasi & smart money flow
 * Endpoints:
 *   /api/analysis/bandar/accumulation/{symbol}
 *   /api/analysis/bandar/smart-money/{symbol}
 */
export default defineEventHandler(async (event) => {
  const { symbol } = getQuery(event) as { symbol?: string }

  if (!symbol) {
    throw createError({ statusCode: 400, statusMessage: 'Parameter symbol diperlukan' })
  }

  const sym = symbol.trim().toUpperCase()

  return cachedFetch(`stock:bandarmology:${sym}`, CACHE_TTL.MEDIUM, async () => {
    // Fetch akumulasi dan smart money secara paralel
    const [accumulation, smartMoney] = await Promise.all([
      fetchWithRetry(`${IDX_BASE_URL}/api/analysis/bandar/accumulation/${sym}`, {
        headers: getIdxHeaders(),
      }).catch(() => null),
      fetchWithRetry(`${IDX_BASE_URL}/api/analysis/bandar/smart-money/${sym}`, {
        headers: getIdxHeaders(),
      }).catch(() => null),
    ])

    return { accumulation, smartMoney }
  })
})

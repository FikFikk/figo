/**
 * GET /api/stock/technical?symbol=BBCA
 * Proxy ke IDX API — sinyal teknikal (RSI, MACD, SMA, EMA, Bollinger)
 */
export default defineEventHandler(async (event) => {
  const { symbol } = getQuery(event) as { symbol?: string }

  if (!symbol) {
    throw createError({ statusCode: 400, statusMessage: 'Parameter symbol diperlukan' })
  }

  const sym = symbol.trim().toUpperCase()

  return cachedFetch(`stock:technical:${sym}`, CACHE_TTL.MEDIUM, async () => {
    return fetchWithRetry(`${IDX_BASE_URL}/api/analysis/technical/${sym}`, {
      headers: getIdxHeaders(),
      params: { indicators: 'rsi,macd,sma,ema,bbands,stochastic,obv,vwap,atr' },
    })
  })
})

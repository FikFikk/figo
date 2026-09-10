import { IDX_BASE_URL, getIdxHeaders, fetchWithRetry, cachedFetch, CACHE_TTL } from '../../utils/stock-config'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const rawSymbol = query.symbol as string
  if (!rawSymbol) {
    throw createError({ statusCode: 400, statusMessage: 'Parameter symbol diperlukan' })
  }

  const symbol = rawSymbol.replace(/^IDX:/i, '').replace(/\.JK$/i, '').trim().toUpperCase()

  // Gunakan cache medium karena insight cukup stabil harian
  const cacheKey = `idx:insights:${symbol.toUpperCase()}`
  
  return cachedFetch(cacheKey, CACHE_TTL.MEDIUM, async () => {
    return fetchWithRetry(
      `${IDX_BASE_URL}/api/beta/insights/${symbol}`,
      {
        headers: getIdxHeaders(),
      }
    )
  })
})

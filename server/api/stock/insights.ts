import { IDX_BASE_URL, getIdxHeaders, fetchWithRetry, cachedFetch, CACHE_TTL } from '../../utils/stock-config'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const symbol = query.symbol as string

  if (!symbol) {
    throw createError({ statusCode: 400, statusMessage: 'Parameter symbol diperlukan' })
  }

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

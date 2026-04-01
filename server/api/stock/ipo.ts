import { IDX_BASE_URL, getIdxHeaders, fetchWithRetry, cachedFetch, CACHE_TTL } from '../../utils/stock-config'

export default defineEventHandler(async (event) => {
  // Gunakan cache long karena data IPO jarang berubah realtime
  const cacheKey = `idx:ipo:momentum`
  
  return cachedFetch(cacheKey, CACHE_TTL.LONG, async () => {
    return fetchWithRetry(
      `${IDX_BASE_URL}/api/analysis/sentiment/ipo/momentum`,
      {
        headers: getIdxHeaders(),
      }
    )
  })
})

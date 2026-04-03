import { ECONOMIC_CALENDAR_BASE_URL, getEconomicCalendarHeaders, fetchWithRetry, cachedFetch, CACHE_TTL } from '../../utils/stock-config'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  
  // Default parameters (Singular string as per API playground to avoid 403)
  const countryCode = (query.countryCode as string) || '' 
  const volatility = (query.volatility as string) || ''
  
  // Default 30 hari ke belakang jika tidak ditentukan
  const startDate = (query.startDate as string) || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  const endDate = (query.endDate as string) || new Date().toISOString().split('T')[0]

  // Cache sangat agresif (24 jam) karena limit 30 request/bulan
  const CACHE_DAY = 24 * 60 * 60 * 1000
  const cacheKey = `stock:calendar:v4:${countryCode}:${volatility}:${startDate}:${endDate}`
  
  return cachedFetch(cacheKey, CACHE_DAY, async () => {
    try {
      const apiParams: Record<string, any> = {
        startDate,
        endDate,
        timezone: 'GMT+7'
      }

      if (countryCode) apiParams.countryCode = countryCode
      if (volatility) apiParams.volatility = volatility

      return await fetchWithRetry(
        `${ECONOMIC_CALENDAR_BASE_URL}/calendar`,
        {
          headers: getEconomicCalendarHeaders(),
          params: apiParams
        }
      )
    } catch (err: any) {
      // Jika 403, berikan pesan instruksi subscribe
      if (err?.status === 403) {
        throw createError({
          statusCode: 403,
          statusMessage: 'Akses Ditolak (403). Pastikan sudah klik "Subscribe" di dashboard RapidAPI Anda.',
        })
      }
      throw err
    }
  })

})

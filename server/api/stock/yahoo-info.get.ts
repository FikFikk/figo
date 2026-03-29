/**
 * GET /api/stock/yahoo-info?symbol=BBCA
 * Info saham via Yahoo Finance quote endpoint
 * Mengembalikan harga realtime, volume, market cap, dll
 */
export default defineEventHandler(async (event) => {
  const { symbol } = getQuery(event) as { symbol?: string }

  if (!symbol) {
    throw createError({ statusCode: 400, statusMessage: 'Parameter symbol diperlukan' })
  }

  const sym = symbol.trim().toUpperCase()
  const yahooSymbol = sym.endsWith('.JK') ? sym : `${sym}.JK`
  const cacheKey = `yahoo:info:${yahooSymbol}`

  return cachedFetch(cacheKey, CACHE_TTL.REALTIME, async () => {
    try {
      const response = await $fetch<any>(
        `https://query1.finance.yahoo.com/v8/finance/chart/${yahooSymbol}`,
        {
          params: { interval: '1d', range: '5d' },
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          }
        }
      )

      const result = response?.chart?.result?.[0]
      if (!result) {
        throw createError({ statusCode: 404, statusMessage: `Data ${sym} tidak ditemukan` })
      }

      const meta = result.meta || {}
      const timestamps = result.timestamp || []
      const quote = result.indicators?.quote?.[0] || {}

      // Ambil data hari terakhir & hari sebelumnya
      const lastIdx = timestamps.length - 1
      const prevIdx = Math.max(0, lastIdx - 1)

      const currentClose = quote.close?.[lastIdx] ?? meta.regularMarketPrice ?? 0
      const prevClose = quote.close?.[prevIdx] ?? meta.previousClose ?? currentClose
      const currentOpen = quote.open?.[lastIdx] ?? 0
      const currentHigh = quote.high?.[lastIdx] ?? 0
      const currentLow = quote.low?.[lastIdx] ?? 0
      const currentVolume = quote.volume?.[lastIdx] ?? 0

      const change = currentClose - prevClose
      const changePercent = prevClose > 0 ? (change / prevClose) * 100 : 0

      // Hitung high/low dari 5 hari terakhir
      const highs = (quote.high || []).filter((h: number) => h > 0)
      const lows = (quote.low || []).filter((l: number) => l > 0)
      const weekHigh = highs.length ? Math.max(...highs) : currentHigh
      const weekLow = lows.length ? Math.min(...lows) : currentLow

      return {
        symbol: sym,
        yahooSymbol,
        name: meta.longName || meta.shortName || sym,
        currency: meta.currency || 'IDR',
        exchange: meta.exchangeName || 'JKT',
        timezone: meta.exchangeTimezoneName || 'Asia/Jakarta',
        // Harga
        price: currentClose,
        open: currentOpen,
        high: currentHigh,
        low: currentLow,
        previousClose: prevClose,
        change: Math.round(change),
        changePercent: Number(changePercent.toFixed(2)),
        volume: currentVolume,
        // Range 5 hari
        weekHigh,
        weekLow,
        // Market meta
        regularMarketPrice: meta.regularMarketPrice,
        fiftyTwoWeekHigh: meta.fiftyTwoWeekHigh,
        fiftyTwoWeekLow: meta.fiftyTwoWeekLow,
        // Timestamp
        lastTradeDate: timestamps[lastIdx] ? new Date(timestamps[lastIdx] * 1000).toISOString() : null,
        source: 'yahoo'
      }
    } catch (err: any) {
      const status = err?.status || err?.statusCode || 500
      throw createError({
        statusCode: status,
        statusMessage: err?.message || `Gagal mengambil info ${sym} dari Yahoo Finance`
      })
    }
  })
})

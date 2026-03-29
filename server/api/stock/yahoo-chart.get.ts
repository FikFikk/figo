/**
 * GET /api/stock/yahoo-chart?symbol=BBCA&interval=15m&range=5d
 * Proxy ke Yahoo Finance — data OHLCV dengan timeframe intraday
 * Endpoint: query1.finance.yahoo.com/v8/finance/chart/{symbol}.JK
 * 
 * interval: 1m, 5m, 15m, 30m, 60m, 1d, 1wk, 1mo
 * range: 1d, 5d, 1mo, 3mo, 6mo, 1y, 2y, 5y, ytd, max
 */
export default defineEventHandler(async (event) => {
  const { symbol, interval, range } = getQuery(event) as {
    symbol?: string
    interval?: string
    range?: string
  }

  if (!symbol) {
    throw createError({ statusCode: 400, statusMessage: 'Parameter symbol diperlukan' })
  }

  const sym = symbol.trim().toUpperCase()
  // Tambah suffix .JK untuk saham Indonesia di Yahoo Finance
  const yahooSymbol = sym.endsWith('.JK') ? sym : `${sym}.JK`
  const intv = interval || '1d'
  const rng = range || '3mo'

  // Buat cache key berdasarkan parameter
  const cacheKey = `yahoo:chart:${yahooSymbol}:${intv}:${rng}`

  // TTL cache berdasarkan interval — intraday lebih pendek
  const isIntraday = ['1m', '5m', '15m', '30m', '60m'].includes(intv)
  const ttl = isIntraday ? 60 * 1000 : 10 * 60 * 1000 // 1 menit vs 10 menit

  return cachedFetch(cacheKey, ttl, async () => {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${yahooSymbol}`

    try {
      const response = await $fetch<any>(url, {
        params: { interval: intv, range: rng },
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      })

      const result = response?.chart?.result?.[0]
      if (!result) {
        throw createError({ statusCode: 404, statusMessage: `Data tidak ditemukan untuk ${yahooSymbol}` })
      }

      const timestamps = result.timestamp || []
      const quote = result.indicators?.quote?.[0] || {}
      const { open, high, low, close, volume } = quote

      // Konversi ke format array OHLCV yang konsisten
      const chartData = timestamps.map((ts: number, i: number) => ({
        date: new Date(ts * 1000).toISOString(),
        timestamp: ts,
        open: open?.[i] ?? 0,
        high: high?.[i] ?? 0,
        low: low?.[i] ?? 0,
        close: close?.[i] ?? 0,
        volume: volume?.[i] ?? 0
      })).filter((d: any) => d.close > 0) // Buang data null

      return {
        symbol: sym,
        interval: intv,
        range: rng,
        currency: result.meta?.currency || 'IDR',
        exchangeTimezone: result.meta?.exchangeTimezoneName || 'Asia/Jakarta',
        regularMarketPrice: result.meta?.regularMarketPrice,
        previousClose: result.meta?.previousClose,
        data: chartData
      }
    } catch (err: any) {
      const status = err?.status || err?.statusCode || 500
      if (status === 404 || status === 422) {
        throw createError({
          statusCode: 404,
          statusMessage: `Saham ${sym} tidak ditemukan di Yahoo Finance`
        })
      }
      throw createError({
        statusCode: status,
        statusMessage: err?.message || 'Gagal mengambil data dari Yahoo Finance'
      })
    }
  })
})

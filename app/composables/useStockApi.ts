/**
 * Composable untuk semua operasi fetch data saham
 * Mendukung dual API: Yahoo Finance (default) dan RapidAPI IDX
 * State apiSource disimpan secara global agar konsisten antar komponen
 */

// State global: sumber API yang aktif (persisten antar komponen) — Default: Yahoo Finance, opsi kedua: TradingView (ZPI)
const apiSource = ref<'zpi' | 'yahoo'>('yahoo')

interface UseStockApiReturn {
  // Loading & error state
  loading: Ref<boolean>
  error: Ref<string>

  // API Source toggle
  apiSource: Ref<'zpi' | 'yahoo'>
  toggleApiSource: () => void

  // Fungsi fetch
  searchStock: (query: string) => Promise<any>
  getTrending: () => Promise<any>
  getStockInfo: (symbol: string) => Promise<any>
  getChart: (symbol: string, params?: { interval?: string; range?: string; limit?: number }) => Promise<any>
  getTechnical: (symbol: string) => Promise<any>
  getMovers: (type: 'gainers' | 'losers' | 'volume') => Promise<any>
  getBandarmology: (symbol: string) => Promise<any>
  getInsights: (symbol: string) => Promise<any>
}

export function useStockApi(): UseStockApiReturn {
  const loading = ref(false)
  const error = ref('')

  /**
   * Wrapper fetch dengan loading & error handling otomatis
   */
  async function fetchWithState<T>(url: string, params?: Record<string, any>): Promise<T | null> {
    loading.value = true
    error.value = ''

    try {
      const data = await $fetch<T>(url, { params })
      return data
    } catch (err: any) {
      const message = err?.data?.statusMessage || err?.data?.message || err?.message || 'Gagal mengambil data'
      error.value = message
      return null
    } finally {
      loading.value = false
    }
  }

  // Toggle antara TradingView (ZPI) dan Yahoo Finance
  function toggleApiSource() {
    apiSource.value = apiSource.value === 'zpi' ? 'yahoo' : 'zpi'
  }

  // Cari saham berdasarkan keyword — gunakan API yang aktif
  async function searchStock(query: string) {
    if (apiSource.value === 'zpi') {
      const data = await fetchWithState<{data?: {items?: any[]}}>('/api/stock/zpi', { endpoint: 'search', q: query, market: 'indonesia' })
      return data?.data?.items || []
    }
    if (apiSource.value === 'yahoo') {
      return fetchWithState('/api/stock/yahoo-search', { q: query })
    }
    return fetchWithState('/api/stock/search', { q: query })
  }

  // Ambil daftar saham trending
  async function getTrending() {
    if (apiSource.value === 'zpi') {
        const data = await fetchWithState<{data?: {items?: any[]}}>('/api/stock/zpi', { endpoint: 'screener', market: 'indonesia', sortBy: 'volume', sortOrder: 'desc', count: 10 })
        if (data?.data?.items) {
           return data.data.items.map((i:any) => ({ symbol: i.ticker, code: i.ticker, ...i }))
        }
        return []
    }
    return fetchWithState('/api/stock/trending')
  }

  // Ambil info detail emiten — gunakan API yang aktif
  async function getStockInfo(symbol: string) {
    if (apiSource.value === 'zpi') {
       // symbols di ZPI perlu format (IDX:BBCA)
       const ticker = symbol.startsWith('IDX:') ? symbol : `IDX:${symbol}`
       const data = await fetchWithState('/api/stock/zpi', { endpoint: 'symbol', symbol: ticker, market: 'indonesia' })
       if (data && !(data as any)?.error && !(data as any)?.content?.code) return data
       // Fallback otomatis ke Yahoo Finance jika ZPI gagal atau kuota habis
       return fetchWithState('/api/stock/yahoo-info', { symbol })
    }
    if (apiSource.value === 'yahoo') {
      return fetchWithState('/api/stock/yahoo-info', { symbol })
    }
    return fetchWithState('/api/stock/info', { symbol })
  }

  // Ambil data chart OHLCV — gunakan API yang aktif
  async function getChart(symbol: string, params?: { interval?: string; range?: string; limit?: number }) {
    if (apiSource.value === 'zpi') {
       const ticker = symbol.startsWith('IDX:') ? symbol : `IDX:${symbol}`
       // Map interval ke format ZPI TradingView
       let resZpi = '1D'
       const inv = params?.interval || '1d'
       if (inv === '1m') resZpi = '1'
       else if (inv === '5m') resZpi = '5'
       else if (inv === '15m') resZpi = '15'
       else if (inv === '30m') resZpi = '30'
       else if (inv === '60m' || inv === '1h') resZpi = '60'
       else if (inv === '1d') resZpi = '1D'
       else if (inv === '1wk') resZpi = '1W'
       else if (inv === '1mo') resZpi = '1M'

       const data = await fetchWithState<{data?: {candles?: any[]}}>('/api/stock/zpi', {
         endpoint: 'chart',
         symbol: ticker,
         resolution: resZpi,
         count: params?.limit || 100
       })
       if (data?.data?.candles && data.data.candles.length > 0) {
         return data.data.candles
       }
       // Fallback otomatis ke Yahoo Finance jika ZPI gagal atau kuota habis
       return fetchWithState('/api/stock/yahoo-chart', {
         symbol,
         interval: params?.interval || '1d',
         range: params?.range || '2y'
       })
    }
    if (apiSource.value === 'yahoo') {
      return fetchWithState('/api/stock/yahoo-chart', {
        symbol,
        interval: params?.interval || '1d',
        range: params?.range || '2y'
      })
    }
    return fetchWithState('/api/stock/chart', { symbol, limit: params?.limit || 63 })
  }

  // Ambil sinyal teknikal
  async function getTechnical(symbol: string) {
    if (apiSource.value === 'zpi') {
       const ticker = symbol.startsWith('IDX:') ? symbol : `IDX:${symbol}`
       const res = await fetchWithState<{data?: any}>('/api/stock/zpi', { endpoint: 'technicals', symbol: ticker })
       const d = res?.data || {}
       return {
         indicators: {
           rsi: { value: d.rsi || 0, signal: d.oscillatorsSummary || 'neutral' },
           macd: { value: d.macd || 0, macdLine: d.macd || 0, signal: d.macdSignal > d.macd ? 'sell' : 'buy' },
           stochastic: { k: d.stochK || 0, d: d.stochD || 0, signal: d.oscillatorsSummary || 'neutral' },
           atr: { value: d.atr || 0, volatility: d.atr > 100 ? 'HIGH' : 'LOW', signal: 'neutral' },
           sma20: { value: d.sma20 || 0, trend: d.last > d.sma20 ? 'buy' : 'sell' },
           sma50: { value: d.sma50 || 0, trend: d.last > d.sma50 ? 'buy' : 'sell' }
         }
       }
    }
    return fetchWithState('/api/stock/technical', { symbol })
  }

  // Ambil market movers
  async function getMovers(type: 'gainers' | 'losers' | 'volume' = 'gainers') {
    if (apiSource.value === 'zpi') {
        const sortOrder = type === 'losers' ? 'asc' : 'desc'
        const sortBy = type === 'volume' ? 'volume' : 'change'
        const data = await fetchWithState<{data?: {items?: any[]}}>('/api/stock/zpi', { endpoint: 'screener', market: 'indonesia', sortBy, sortOrder, count: 20 })
        if (data?.data?.items) {
           return data.data.items.map((i:any) => ({ symbol: i.ticker, code: i.ticker, price: i.last, change: i.change, percentage: i.changePercent, ...i }))
        }
        return []
    }
    return fetchWithState('/api/stock/movers', { type })
  }

  // Ambil data audit fundamental emiten (atau AI Insights)
  async function getInsights(symbol: string) {
    const cleanSymbol = symbol.replace(/^IDX:/i, '').replace(/\.JK$/i, '').trim().toUpperCase()
    return fetchWithState('/api/stock/insights', { symbol: cleanSymbol })
  }

  // Ambil data bandarmology (hanya RapidAPI IDX)
  async function getBandarmology(symbol: string) {
    return fetchWithState('/api/stock/bandarmology', { symbol })
  }

  return {
    loading,
    error,
    apiSource,
    toggleApiSource,
    searchStock,
    getTrending,
    getStockInfo,
    getChart,
    getTechnical,
    getMovers,
    getBandarmology,
    getInsights,
  }
}

/**
 * Composable untuk semua operasi fetch data saham IDX
 * Menyediakan fungsi-fungsi untuk mengambil data dari server proxy
 */

interface StockSearchResult {
  symbol: string
  name: string
  [key: string]: any
}

interface UseStockApiReturn {
  // Loading & error state
  loading: Ref<boolean>
  error: Ref<string>

  // Fungsi fetch
  searchStock: (query: string) => Promise<any>
  getTrending: () => Promise<any>
  getStockInfo: (symbol: string) => Promise<any>
  getChart: (symbol: string, limit?: number) => Promise<any>
  getTechnical: (symbol: string) => Promise<any>
  getMovers: (type: 'gainers' | 'losers' | 'volume') => Promise<any>
  getBandarmology: (symbol: string) => Promise<any>
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

  // Cari saham berdasarkan keyword
  async function searchStock(query: string) {
    return fetchWithState('/api/stock/search', { q: query })
  }

  // Ambil daftar saham trending
  async function getTrending() {
    return fetchWithState('/api/stock/trending')
  }

  // Ambil info detail emiten (harga, volume, market cap)
  async function getStockInfo(symbol: string) {
    return fetchWithState('/api/stock/info', { symbol })
  }

  // Ambil data chart OHLCV
  async function getChart(symbol: string, limit: number = 60) {
    return fetchWithState('/api/stock/chart', { symbol, limit })
  }

  // Ambil sinyal teknikal
  async function getTechnical(symbol: string) {
    return fetchWithState('/api/stock/technical', { symbol })
  }

  // Ambil market movers
  async function getMovers(type: 'gainers' | 'losers' | 'volume' = 'gainers') {
    return fetchWithState('/api/stock/movers', { type })
  }

  // Ambil data bandarmology (akumulasi + smart money)
  async function getBandarmology(symbol: string) {
    return fetchWithState('/api/stock/bandarmology', { symbol })
  }

  return {
    loading,
    error,
    searchStock,
    getTrending,
    getStockInfo,
    getChart,
    getTechnical,
    getMovers,
    getBandarmology,
  }
}

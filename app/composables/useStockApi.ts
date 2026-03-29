/**
 * Composable untuk semua operasi fetch data saham
 * Mendukung dual API: Yahoo Finance (default) dan RapidAPI IDX
 * State apiSource disimpan secara global agar konsisten antar komponen
 */

// State global: sumber API yang aktif (persisten antar komponen)
const apiSource = ref<'yahoo' | 'rapidapi'>('yahoo')

interface UseStockApiReturn {
  // Loading & error state
  loading: Ref<boolean>
  error: Ref<string>

  // API Source toggle
  apiSource: Ref<'yahoo' | 'rapidapi'>
  toggleApiSource: () => void

  // Fungsi fetch
  searchStock: (query: string) => Promise<any>
  getTrending: () => Promise<any>
  getStockInfo: (symbol: string) => Promise<any>
  getChart: (symbol: string, params?: { interval?: string; range?: string; limit?: number }) => Promise<any>
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

  // Toggle antara Yahoo Finance dan RapidAPI IDX
  function toggleApiSource() {
    apiSource.value = apiSource.value === 'yahoo' ? 'rapidapi' : 'yahoo'
  }

  // Cari saham berdasarkan keyword — gunakan API yang aktif
  async function searchStock(query: string) {
    if (apiSource.value === 'yahoo') {
      return fetchWithState('/api/stock/yahoo-search', { q: query })
    }
    return fetchWithState('/api/stock/search', { q: query })
  }

  // Ambil daftar saham trending (hanya RapidAPI IDX)
  async function getTrending() {
    return fetchWithState('/api/stock/trending')
  }

  // Ambil info detail emiten — gunakan API yang aktif
  async function getStockInfo(symbol: string) {
    if (apiSource.value === 'yahoo') {
      return fetchWithState('/api/stock/yahoo-info', { symbol })
    }
    return fetchWithState('/api/stock/info', { symbol })
  }

  // Ambil data chart OHLCV — gunakan API yang aktif
  async function getChart(symbol: string, params?: { interval?: string; range?: string; limit?: number }) {
    if (apiSource.value === 'yahoo') {
      return fetchWithState('/api/stock/yahoo-chart', {
        symbol,
        interval: params?.interval || '1d',
        range: params?.range || '3mo'
      })
    }
    return fetchWithState('/api/stock/chart', { symbol, limit: params?.limit || 63 })
  }

  // Ambil sinyal teknikal (hanya RapidAPI IDX)
  async function getTechnical(symbol: string) {
    return fetchWithState('/api/stock/technical', { symbol })
  }

  // Ambil market movers (hanya RapidAPI IDX)
  async function getMovers(type: 'gainers' | 'losers' | 'volume' = 'gainers') {
    return fetchWithState('/api/stock/movers', { type })
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
  }
}

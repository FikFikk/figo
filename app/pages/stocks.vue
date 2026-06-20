<template>
  <div class="pt-24 pb-20 px-4 md:px-8 max-w-7xl mx-auto min-h-screen">

    <!-- Page Header -->
    <div class="mb-8">
      <div class="flex items-center justify-between gap-3 mb-3">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-2xl flex items-center justify-center"
            :class="isDark ? 'bg-primary/15' : 'bg-blue-50'"
          >
            <span class="material-symbols-outlined text-xl text-primary">candlestick_chart</span>
          </div>
          <div>
            <h1 class="text-2xl md:text-3xl font-headline font-black tracking-tight"
              :class="isDark ? 'text-white' : 'text-slate-900'"
            >Global Stock Analysis</h1>
            <p class="text-xs" :class="isDark ? 'text-gray-500' : 'text-slate-400'">
              Real-time market data, technical signals & institutional flows.
            </p>
          </div>
        </div>
        <!-- API Source Toggle -->
        <button v-if="isPinVerified" @click="toggleApi"
          class="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[9px] font-bold uppercase tracking-wider transition-all border"
          :class="stockApi.apiSource.value === 'yahoo'
            ? (isDark ? 'bg-purple-500/15 text-purple-400 border-purple-500/20 hover:bg-purple-500/25' : 'bg-purple-50 text-purple-600 border-purple-200 hover:bg-purple-100')
            : (isDark ? 'bg-amber-500/15 text-amber-400 border-amber-500/20 hover:bg-amber-500/25' : 'bg-amber-50 text-amber-600 border-amber-200 hover:bg-amber-100')"
        >
          <span class="material-symbols-outlined text-sm">{{ stockApi.apiSource.value === 'yahoo' ? 'public' : 'api' }}</span>
          {{ stockApi.apiSource.value === 'yahoo' ? 'Yahoo Finance' : 'RapidAPI IDX' }}
          <span class="material-symbols-outlined text-xs opacity-50">swap_horiz</span>
        </button>
      </div>
    </div>

    <!-- Search Bar (selalu tampil, overlay PIN jika belum verified) -->
    <div class="mb-8 relative">
      <div v-if="!isPinVerified" @click="showPinModal = true"
        class="absolute inset-0 z-30 rounded-2xl flex items-center justify-center cursor-pointer"
        :class="isDark ? 'bg-black/40 backdrop-blur-sm' : 'bg-white/40 backdrop-blur-sm'"
      >
        <div class="flex items-center gap-2 px-4 py-2 rounded-xl"
          :class="isDark ? 'bg-white/10 text-white' : 'bg-slate-800/80 text-white'"
        >
          <span class="material-symbols-outlined text-sm">lock</span>
          <span class="text-xs font-bold">Enter PIN to access</span>
        </div>
      </div>
      <StockSearch @select="onSelectStock" />
    </div>

    <!-- PIN Modal -->
    <Teleport to="body">
      <Transition
        enter-active-class="transition duration-200 ease-out"
        enter-from-class="opacity-0"
        enter-to-class="opacity-100"
        leave-active-class="transition duration-150 ease-in"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <div v-if="showPinModal" class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" @click.self="showPinModal = false">
          <div class="glass-panel border rounded-3xl p-8 md:p-10 text-center max-w-sm w-full"
            :class="isDark ? 'bg-[#1a1d28] border-white/10' : 'bg-white border-slate-200 shadow-2xl'"
          >
            <div class="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5 transition-all duration-500"
              :class="[
                isDark ? 'bg-primary/20 text-primary' : 'bg-primary text-white shadow-lg shadow-primary/30',
                pinError ? '!bg-red-500/20 !text-red-500 animate-bounce' : ''
              ]"
            >
              <span class="material-symbols-outlined text-2xl">{{ pinError ? 'lock_open_right' : 'lock' }}</span>
            </div>
            <h2 class="text-lg font-bold font-headline mb-1" :class="isDark ? 'text-white' : 'text-slate-900'">Enter PIN</h2>
            <p class="text-[10px] opacity-50 mb-6">6-digit secret PIN to unlock Advanced Analysis.</p>

            <form @submit.prevent="checkPin">
              <input 
                v-model="pinInput"
                type="password" 
                inputmode="numeric"
                maxlength="6"
                pattern="\d*"
                placeholder="••••••"
                class="w-full text-center text-3xl tracking-[0.3em] font-mono font-bold bg-transparent border-b-2 outline-none pb-3 transition-all placeholder:opacity-20 mb-3"
                :class="[
                  isDark ? 'border-white/10 text-white focus:border-primary' : 'border-slate-200 text-slate-900 focus:border-primary',
                  pinError ? '!border-red-500 !text-red-500' : ''
                ]"
                @input="handlePinInput"
              />
              <p v-if="pinError" class="text-[10px] font-bold text-red-500 animate-pulse">Incorrect PIN.</p>
            </form>

            <button @click="showPinModal = false" class="mt-4 text-[10px] opacity-40 hover:opacity-80 transition-opacity">Close</button>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Error Global -->
    <Transition
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="opacity-0 -translate-y-2"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div v-if="globalError" class="mb-6 rounded-2xl p-4 border flex items-start gap-3"
        :class="isDark ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-red-50 text-red-700 border-red-200'"
      >
        <span class="material-symbols-outlined text-lg">error</span>
        <div>
          <p class="font-bold text-sm">Error</p>
          <p class="text-xs opacity-80">{{ globalError }}</p>
        </div>
        <button @click="globalError = ''" class="ml-auto opacity-50 hover:opacity-100">
          <span class="material-symbols-outlined text-sm">close</span>
        </button>
      </div>
    </Transition>

    <!-- Konten Utama: Saat saham sudah dipilih (PIN required) -->
    <div v-if="isPinVerified && selectedSymbol" class="space-y-6">
      <StockOverview :symbol="selectedSymbol" :info="stockInfo" :loading="loadingInfo" />
      <!-- Chart full-width agar tampilan candle besar dan lega -->
      <StockChart :data="chartData" :loading="loadingChart" :plan="tradingPlan" @fetch="loadChart(selectedSymbol, $event)" @period-change="onPeriodChange" @load-more="onChartLoadMore" />
      <!-- Analisa di bawah chart: Smart Trading Plan melebar (2/3), Technical (1/3) -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <div class="lg:col-span-2">
          <StockTradingPlan :data="chartData" :loading="loadingChart" @update:plan="tradingPlan = $event" />
        </div>
        <div class="lg:col-span-1">
          <StockTechnical :data="technicalData" :loading="loadingTechnical" @fetch="loadTechnical(selectedSymbol)" />
        </div>
      </div>
      <StockBandarmology :data="bandarmologyData" :loading="loadingBandarmology" @fetch="loadBandarmology(selectedSymbol)" />
      <StockInsights :data="insightData" :loading="loadingInsights" @fetch="loadInsights(selectedSymbol)" />
    </div>

    <!-- Bagian Publik (tanpa PIN) -->
    <div v-if="!selectedSymbol" class="mt-2 space-y-6">

      <!-- Market Movers (PIN required, collapsible) -->
      <div v-if="isPinVerified" class="glass-panel rounded-2xl border overflow-hidden"
        :class="isDark ? 'border-white/5' : 'border-slate-100'"
      >
        <button @click="moversOpen = !moversOpen"
          class="w-full flex items-center justify-between p-5 text-left transition-colors"
          :class="isDark ? 'hover:bg-white/5' : 'hover:bg-slate-50'"
        >
          <div class="flex items-center gap-2">
            <span class="material-symbols-outlined text-lg text-primary">leaderboard</span>
            <h2 class="font-headline font-bold text-lg" :class="isDark ? 'text-white' : 'text-slate-900'">Market Movers</h2>
          </div>
          <span class="material-symbols-outlined text-lg transition-transform duration-300" :class="moversOpen ? 'rotate-180' : ''" style="opacity: 0.4">expand_more</span>
        </button>
        <div v-show="moversOpen" class="px-5 pb-5">
          <StockMovers :data="moversData" :loading="loadingMovers" :active-tab="moversTab"
            @select-stock="onSelectStock" @tab-change="onMoversTabChange" @update-tab="moversTab = $event" @fetch="loadMovers(moversTab)" />
        </div>
      </div>

      <!-- Momentum IPO (PIN required) -->
      <StockIpo v-if="isPinVerified" />

      <!-- Kalender Ekonomi (LOCKED) -->
      <StockEconomicCalendar v-if="isPinVerified" />

      <!-- Ensiklopedia Pola Saham (PUBLIK) -->
      <div>
        <div class="flex items-center gap-2 mb-4">
          <span class="material-symbols-outlined text-lg text-primary">auto_awesome</span>
          <h2 class="font-headline font-bold text-lg" :class="isDark ? 'text-white' : 'text-slate-900'">Stock Patterns Encyclopedia</h2>
        </div>
        <StockPatterns />
      </div>
    </div>

    <!-- Footer -->
    <div class="mt-10 text-center opacity-20">
      <p class="text-[9px] font-bold uppercase tracking-[0.3em]">{{ stockApi.apiSource.value === 'yahoo' ? 'Chart via Yahoo Finance' : 'Data via RapidAPI IDX' }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * Halaman utama Analisa Saham IDX -> Global Stock Analysis
 * Layout: Search → Overview → Chart + Technical → Bandarmology → Market Movers
 */
useSeoMeta({
  title: 'Analisa Saham — OHLCV Chart, Technical Analysis & Market Movers — FiGo',
  ogTitle: 'Stock Analysis Tools — Technical Signals & Market Movers — FiGo',
  description: 'Analisa saham lengkap dengan chart OHLCV, sinyal teknikal, market movers, bandarmology, dan IPO momentum. Mendukung Yahoo Finance dan IDX. Gratis dan real-time.',
  ogDescription: 'Comprehensive stock market analysis with OHLCV charts, technical signals, institutional flows. Free real-time data.',
  twitterCard: 'summary_large_image',
})

const { isDark } = useColorMode()
const stockApi = useStockApi()

// === PIN Authentication ===
const isPinVerified = ref(false)
const pinInput = ref('')
const pinError = ref(false)
const showPinModal = ref(false)
const CORRECT_PIN = '112233'

function checkPin() {
  if (pinInput.value === CORRECT_PIN) {
    isPinVerified.value = true
    pinError.value = false
    showPinModal.value = false
  } else {
    pinError.value = true
    pinInput.value = ''
  }
}

function handlePinInput() {
  pinError.value = false
  if (pinInput.value.length === 6) {
    setTimeout(() => {
      checkPin()
    }, 100) // slight delay for UX so user sees the 6th dot before it flashes
  }
}

// State utama
const selectedSymbol = ref('')
const globalError = ref('')

// Data per section (masing-masing punya loading state sendiri)
const stockInfo = ref<any>(null)
const chartData = ref<any[]>([])
const technicalData = ref<any>(null)
const bandarmologyData = ref<any>(null)
const insightData = ref<any>(null)
const moversData = ref<any>(null)
const moversTab = ref('gainers')
const moversOpen = ref(false) // Default collapsed untuk hemat API
const tradingPlan = ref<any>(null)
const currentChartParams = ref({ interval: '1d', range: '3mo' })

// Loading state per section
const loadingInfo = ref(false)
const loadingChart = ref(false)
const loadingTechnical = ref(false)
const loadingBandarmology = ref(false)
const loadingInsights = ref(false)
const loadingMovers = ref(false)

// Handler: Saham dipilih (dari search atau movers table)
async function onSelectStock(stock: any) {
  const symbol = stock.symbol || stock.code || ''
  if (!symbol) return

  selectedSymbol.value = symbol.toUpperCase()
  globalError.value = ''

  // Reset state agar komponen lain me-reset tampilan menjadi "Locked/Fetch"
  chartData.value = []
  technicalData.value = null
  bandarmologyData.value = null
  insightData.value = null
  tradingPlan.value = null

  // HANYA fetch Overview secara otomatis untuk menghemat limit (1 req)
  // Komponen lain baru di-fetch setelah user mengklik tombol "Tampilkan Data"
  await loadStockInfo(selectedSymbol.value)
}

// Fetch: Info emiten — dual API support
async function loadStockInfo(symbol: string) {
  loadingInfo.value = true
  try {
    if (stockApi.apiSource.value === 'yahoo') {
      const data = await $fetch('/api/stock/yahoo-info', { params: { symbol } })
      stockInfo.value = data
    } else {
      const data = await $fetch('/api/stock/info', { params: { symbol } })
      stockInfo.value = data
    }
  } catch (err: any) {
    globalError.value = err?.data?.statusMessage || 'Failed to load stock info'
  } finally {
    loadingInfo.value = false
  }
}

// Toggle API dan refresh data saham yang aktif
function toggleApi() {
  stockApi.toggleApiSource()
  // Jika ada saham yang dipilih, refresh datanya
  if (selectedSymbol.value) {
    loadStockInfo(selectedSymbol.value)
    loadChart(selectedSymbol.value, { interval: '1d', range: '3mo' })
  }
}

// Fetch: Chart OHLCV — dual API support (Yahoo Finance default)
async function loadChart(symbol: string, params: { interval: string; range: string }) {
  loadingChart.value = true
  try {
    if (stockApi.apiSource.value === 'yahoo') {
      const data = await $fetch<any>('/api/stock/yahoo-chart', {
        params: { symbol, interval: params.interval, range: params.range }
      })
      // StockChart akan sort chronologically sendiri
      if (Array.isArray(data?.data)) chartData.value = data.data
      else if (Array.isArray(data)) chartData.value = data
      else chartData.value = []
    } else {
      // RapidAPI IDX — hanya daily, convert range/interval ke limit
      const limitMap: Record<string, number> = { '1d': 2, '5d': 5, '1mo': 21, '3mo': 63, '1y': 252, '5y': 1260 }
      const limit = limitMap[params.range] || 63
      const data = await $fetch<any>('/api/stock/chart', { params: { symbol, limit } })
      const chartbit = data?.data?.data?.chartbit || data?.data?.chartbit || data?.chartbit
      if (Array.isArray(chartbit)) chartData.value = chartbit
      else if (Array.isArray(data)) chartData.value = data
      else if (data?.data && Array.isArray(data.data)) chartData.value = data.data
      else chartData.value = []
    }
  } catch (err: any) {
    console.error('Chart error:', err)
    chartData.value = []
  } finally {
    loadingChart.value = false
  }
}

// Fetch: Technical
async function loadTechnical(symbol: string) {
  loadingTechnical.value = true
  try {
    const data = await $fetch('/api/stock/technical', { params: { symbol } })
    technicalData.value = data
  } catch (err: any) {
    console.error('Technical error:', err)
  } finally {
    loadingTechnical.value = false
  }
}

// Fetch: Bandarmology
async function loadBandarmology(symbol: string) {
  loadingBandarmology.value = true
  try {
    const data = await $fetch('/api/stock/bandarmology', { params: { symbol } })
    bandarmologyData.value = data
  } catch (err: any) {
    console.error('Bandarmology error:', err)
  } finally {
    loadingBandarmology.value = false
  }
}

// Fetch: Insights
async function loadInsights(symbol: string) {
  loadingInsights.value = true
  try {
    const data = await $fetch('/api/stock/insights', { params: { symbol } })
    insightData.value = data
  } catch (err: any) {
    console.error('Insights error:', err)
  } finally {
    loadingInsights.value = false
  }
}

// Fetch: Market movers
async function loadMovers(type: string) {
  loadingMovers.value = true
  try {
    const data = await $fetch('/api/stock/movers', { params: { type } })
    moversData.value = data
  } catch (err: any) {
    console.error('Movers error:', err)
  } finally {
    loadingMovers.value = false
  }
}

// Handler: Period chart berubah (dari StockChart component)
function onPeriodChange(params: { interval: string; range: string }) {
  if (selectedSymbol.value) {
    currentChartParams.value = { ...params }
    loadChart(selectedSymbol.value, params)
  }
}

// Handler: Load more data historis (chart di-pan mentok kiri)
function onChartLoadMore() {
  if (!selectedSymbol.value || loadingChart.value) return
  
  const currentRange = currentChartParams.value.range
  const interval = currentChartParams.value.interval
  
  // Escalasi range disesuaikan dengan limit Yahoo Finance per interval
  const escalationMap: Record<string, string[]> = {
    '1m': ['1d', '5d', '7d'],
    '5m': ['1d', '5d', '1mo', '60d'],
    '15m': ['5d', '1mo', '60d'],
    '30m': ['5d', '1mo', '60d'],
    '60m': ['1mo', '3mo', '1y', '2y'],
    '1d': ['3mo', '1y', '5y', 'max'],
    '1wk': ['1y', '5y', 'max'],
    '1mo': ['5y', 'max']
  }
  
  const seq = escalationMap[interval] || ['1mo', '3mo', '1y', '5y', 'max']
  const idx = seq.indexOf(currentRange)
  
  let nextRange = currentRange
  if (idx >= 0 && idx < seq.length - 1) {
    nextRange = seq[idx + 1] || currentRange
  } else if (idx === -1 && seq.length > 0) {
    // Jika range awal tidak standar, lompat ke step terakhir yang valid
    nextRange = seq[seq.length - 1] || currentRange
  }

  if (nextRange === currentRange) return // sudah max
  
  currentChartParams.value.range = nextRange
  loadChart(selectedSymbol.value, currentChartParams.value)
}

// Handler: Tab movers berubah
function onMoversTabChange(type: string) {
  moversTab.value = type
  moversData.value = null
  loadMovers(type)
}
</script>

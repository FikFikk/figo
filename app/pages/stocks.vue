<template>
  <div class="pt-24 pb-20 px-4 md:px-8 max-w-7xl mx-auto min-h-screen">

    <!-- Swiss Header -->
    <div class="mb-8 border-b pb-6" :class="isDark ? 'border-neutral-800' : 'border-neutral-200'">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div class="flex items-center gap-2 mb-1.5">
            <span class="px-2 py-0.5 text-[9px] font-mono font-bold tracking-[0.2em] uppercase border"
              :class="isDark ? 'bg-neutral-900 border-neutral-800 text-neutral-400' : 'bg-neutral-100 border-neutral-300 text-neutral-600'"
            >
              MARKET TERMINAL / EQUITIES
            </span>
            <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          </div>
          <h1 class="text-2xl md:text-3xl font-mono font-black tracking-tight uppercase"
            :class="isDark ? 'text-white' : 'text-neutral-900'"
          >Global Stock Analysis</h1>
          <p class="text-xs font-medium opacity-60 mt-0.5" :class="isDark ? 'text-neutral-400' : 'text-neutral-600'">
            Institutional-grade technical metrics, order-flow signals, and market intelligence.
          </p>
        </div>

        <!-- API Source Switcher -->
        <button v-if="isPinVerified" @click="toggleApi"
          class="flex items-center self-start sm:self-center gap-2 px-3 py-1.5 text-[10px] font-mono font-bold uppercase tracking-wider transition-all border shrink-0"
          :class="isDark 
            ? 'bg-neutral-900/80 border-neutral-700 text-neutral-200 hover:border-neutral-400' 
            : 'bg-white border-neutral-300 text-neutral-800 hover:border-neutral-900 shadow-xs'"
        >
          <span class="material-symbols-outlined text-xs">tune</span>
          FEED: {{ stockApi.apiSource.value === 'zpi' ? 'ZPI TRADINGVIEW' : stockApi.apiSource.value === 'yahoo' ? 'YAHOO FINANCE' : 'RAPIDAPI IDX' }}
          <span class="material-symbols-outlined text-xs opacity-50">swap_horiz</span>
        </button>
      </div>
    </div>

    <!-- Search Bar (PIN locked overlay if unverified) -->
    <div class="mb-8 relative">
      <div v-if="!isPinVerified" @click="showPinModal = true"
        class="absolute inset-0 z-30 flex items-center justify-center cursor-pointer border"
        :class="isDark ? 'bg-[#15171e]/80 border-neutral-800 backdrop-blur-xs' : 'bg-white/80 border-neutral-200 backdrop-blur-xs'"
      >
        <div class="flex items-center gap-2 px-4 py-2 border font-mono text-xs font-bold uppercase tracking-widest"
          :class="isDark ? 'bg-neutral-900 border-neutral-700 text-white' : 'bg-neutral-900 text-white border-neutral-900 shadow-sm'"
        >
          <span class="material-symbols-outlined text-sm">lock</span>
          <span>ENTER PIN TO UNLOCK TERMINAL</span>
        </div>
      </div>
      <StockSearch @select="onSelectStock" />
    </div>

    <!-- PIN Modal (Swiss Minimalist) -->
    <Teleport to="body">
      <Transition
        enter-active-class="transition duration-150 ease-out"
        enter-from-class="opacity-0 scale-95"
        enter-to-class="opacity-100 scale-100"
        leave-active-class="transition duration-100 ease-in"
        leave-from-class="opacity-100 scale-100"
        leave-to-class="opacity-0 scale-95"
      >
        <div v-if="showPinModal" class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" @click.self="showPinModal = false">
          <div class="border p-6 md:p-8 max-w-sm w-full transition-all"
            :class="isDark ? 'bg-[#15171e] border-neutral-700 text-white' : 'bg-white border-neutral-300 text-neutral-900 shadow-2xl'"
          >
            <div class="flex items-center justify-between border-b pb-3 mb-5"
              :class="isDark ? 'border-neutral-800' : 'border-neutral-200'"
            >
              <div class="flex items-center gap-2">
                <span class="material-symbols-outlined text-base">lock</span>
                <h2 class="font-mono font-bold text-xs uppercase tracking-widest">AUTHENTICATION</h2>
              </div>
              <button @click="showPinModal = false" class="text-neutral-400 hover:text-neutral-900 dark:hover:text-white">
                <span class="material-symbols-outlined text-base">close</span>
              </button>
            </div>

            <p class="text-xs font-mono opacity-60 mb-6 uppercase tracking-wider">
              ENTER 6-DIGIT PASSCODE TO ACCESS REAL-TIME MARKET DATA & AI PLANS.
            </p>

            <form @submit.prevent="checkPin">
              <input 
                v-model="pinInput"
                type="password" 
                inputmode="numeric"
                maxlength="6"
                pattern="\d*"
                placeholder="••••••"
                autofocus
                class="w-full text-center text-3xl tracking-[0.35em] font-mono font-bold bg-transparent border-b-2 outline-none pb-3 transition-all placeholder:opacity-20 mb-3"
                :class="[
                  isDark ? 'border-neutral-700 text-white focus:border-white' : 'border-neutral-300 text-neutral-900 focus:border-neutral-900',
                  pinError ? '!border-red-500 !text-red-500' : ''
                ]"
                @input="handlePinInput"
              />
              <p v-if="pinError" class="text-[10px] font-mono font-bold text-red-500 uppercase tracking-widest text-center mt-2">
                INVALID PASSCODE. PLEASE TRY AGAIN.
              </p>
            </form>

            <div class="mt-6 flex justify-end">
              <button @click="showPinModal = false" 
                class="px-4 py-1.5 text-[10px] font-mono font-bold uppercase tracking-widest border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800"
              >
                CANCEL
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Error Global -->
    <Transition
      enter-active-class="transition duration-150 ease-out"
      enter-from-class="opacity-0 -translate-y-1"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition duration-100 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div v-if="globalError" class="mb-6 p-4 border flex items-start gap-3 font-mono text-xs"
        :class="isDark ? 'bg-red-500/10 text-red-400 border-red-500/30' : 'bg-red-50 text-red-700 border-red-200'"
      >
        <span class="material-symbols-outlined text-base">error</span>
        <div class="flex-1">
          <p class="font-bold uppercase tracking-wider">ERROR OCCURRED</p>
          <p class="text-[11px] opacity-80 mt-0.5">{{ globalError }}</p>
        </div>
        <button @click="globalError = ''" class="opacity-50 hover:opacity-100">
          <span class="material-symbols-outlined text-sm">close</span>
        </button>
      </div>
    </Transition>

    <!-- Konten Utama: Saat saham sudah dipilih (PIN required) -->
    <div v-if="isPinVerified && selectedSymbol" class="space-y-6">
      <StockOverview :symbol="selectedSymbol" :info="stockInfo" :loading="loadingInfo" />
      
      <!-- Chart full-width -->
      <StockChart 
        :data="chartData" 
        :loading="loadingChart" 
        :plan="tradingPlan" 
        @fetch="loadChart(selectedSymbol, $event)" 
        @period-change="onPeriodChange" 
        @load-more="onChartLoadMore" 
      />

      <!-- Analisa di bawah chart: Smart Trading Plan (2/3) + Technical (1/3) -->
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

    <!-- Bagian Publik (tanpa PIN atau saat belum pilih emiten) -->
    <div v-if="!selectedSymbol" class="mt-2 space-y-6">

      <!-- Market Movers (PIN required, collapsible) -->
      <div v-if="isPinVerified" class="border overflow-hidden"
        :class="isDark ? 'bg-[#15171e] border-neutral-800' : 'bg-white border-neutral-300 shadow-sm'"
      >
        <button @click="moversOpen = !moversOpen"
          class="w-full flex items-center justify-between p-4 md:p-5 text-left transition-colors border-b"
          :class="isDark ? 'border-neutral-800 hover:bg-neutral-800/30' : 'border-neutral-200 hover:bg-neutral-50'"
        >
          <div class="flex items-center gap-2">
            <span class="material-symbols-outlined text-base opacity-70">leaderboard</span>
            <h2 class="font-mono font-bold text-xs uppercase tracking-widest" :class="isDark ? 'text-white' : 'text-neutral-900'">
              MARKET MOVERS
            </h2>
          </div>
          <span class="material-symbols-outlined text-base transition-transform duration-200 opacity-60" :class="moversOpen ? 'rotate-180' : ''">
            expand_more
          </span>
        </button>
        <div v-show="moversOpen">
          <StockMovers :data="moversData" :loading="loadingMovers" :active-tab="moversTab"
            @select-stock="onSelectStock" @tab-change="onMoversTabChange" @update-tab="moversTab = $event" @fetch="loadMovers(moversTab)" />
        </div>
      </div>

      <!-- Momentum IPO (PIN required) -->
      <StockIpo v-if="isPinVerified" />

      <!-- Kalender Ekonomi (LOCKED) -->
      <StockEconomicCalendar v-if="isPinVerified" />

      <!-- Ensiklopedia Pola Saham (PUBLIK) -->
      <div class="border overflow-hidden mt-6"
        :class="isDark ? 'bg-[#15171e] border-neutral-800' : 'bg-white border-neutral-300 shadow-sm'"
      >
        <button @click="encyclopediaOpen = !encyclopediaOpen"
          class="w-full flex items-center justify-between p-4 md:p-5 text-left transition-colors border-b"
          :class="isDark ? 'border-neutral-800 hover:bg-neutral-800/30' : 'border-neutral-200 hover:bg-neutral-50'"
        >
          <div class="flex items-center gap-2">
            <span class="material-symbols-outlined text-base opacity-70">auto_awesome</span>
            <h2 class="font-mono font-bold text-xs uppercase tracking-widest" :class="isDark ? 'text-white' : 'text-neutral-900'">
              CHART PATTERNS ENCYCLOPEDIA
            </h2>
          </div>
          <span class="material-symbols-outlined text-base transition-transform duration-200 opacity-60" :class="encyclopediaOpen ? 'rotate-180' : ''">
            expand_more
          </span>
        </button>
        <div v-show="encyclopediaOpen" class="p-5">
          <StockPatterns />
        </div>
      </div>
    </div>

    <!-- Swiss Minimalist Footer Note -->
    <div class="mt-12 text-center border-t pt-6" :class="isDark ? 'border-neutral-800 text-neutral-600' : 'border-neutral-200 text-neutral-400'">
      <p class="text-[9px] font-mono uppercase tracking-[0.3em]">
        FI-GO FINANCIAL TERMINAL · {{ stockApi.apiSource.value === 'zpi' ? 'ZPI TRADINGVIEW API' : stockApi.apiSource.value === 'yahoo' ? 'YAHOO FINANCE FEED' : 'RAPIDAPI IDX ENGINE' }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * Halaman utama Analisa Saham — Swiss International Typographic Style
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
const route = useRoute()
const router = useRouter()
let realTimeInterval: any = null

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
    encyclopediaOpen.value = false
    if (import.meta.client) localStorage.setItem('figo_stock_pin', CORRECT_PIN)
  } else {
    pinError.value = true
    pinInput.value = ''
  }
}

onMounted(() => {
  if (import.meta.client) {
    const savedPin = localStorage.getItem('figo_stock_pin')
    if (savedPin === CORRECT_PIN) {
      isPinVerified.value = true
      encyclopediaOpen.value = false
      if (route.query.symbol) {
        onSelectStock({ symbol: route.query.symbol as string })
      }
    }
  }
})

onBeforeUnmount(() => {
  if (realTimeInterval) clearInterval(realTimeInterval)
})

function handlePinInput() {
  pinError.value = false
  if (pinInput.value.length === 6) {
    setTimeout(() => {
      checkPin()
    }, 100)
  }
}

// State utama
const selectedSymbol = ref('')
const globalError = ref('')

// Data per section
const stockInfo = ref<any>(null)
const chartData = ref<any[]>([])
const technicalData = ref<any>(null)
const bandarmologyData = ref<any>(null)
const insightData = ref<any>(null)
const moversData = ref<any>(null)
const moversTab = ref('gainers')
const moversOpen = ref(false)
const encyclopediaOpen = ref(true)
const tradingPlan = ref<any>(null)
const currentChartParams = ref({ interval: '1d', range: '3mo' })

// Loading state per section
const loadingInfo = ref(false)
const loadingChart = ref(false)
const loadingTechnical = ref(false)
const loadingBandarmology = ref(false)
const loadingInsights = ref(false)
const loadingMovers = ref(false)

async function onSelectStock(stock: any) {
  const symbol = stock.symbol || stock.code || ''
  if (!symbol) return

  selectedSymbol.value = symbol.toUpperCase()
  globalError.value = ''
  
  router.replace({ query: { symbol: selectedSymbol.value } })

  chartData.value = []
  technicalData.value = null
  bandarmologyData.value = null
  insightData.value = null
  tradingPlan.value = null

  await loadStockInfo(selectedSymbol.value)
  
  if (realTimeInterval) clearInterval(realTimeInterval)
  realTimeInterval = setInterval(() => {
    if (document.visibilityState === 'visible' && selectedSymbol.value) {
       loadStockInfo(selectedSymbol.value, true)
       if (chartData.value.length > 0) {
           loadChart(selectedSymbol.value, currentChartParams.value, true)
       }
    }
  }, 10000)
}

async function loadStockInfo(symbol: string, quiet: boolean = false) {
  if (!quiet) loadingInfo.value = true
  try {
    const data = await stockApi.getStockInfo(symbol)
    stockInfo.value = data
  } catch (err: any) {
    globalError.value = err?.data?.statusMessage || 'Failed to load stock info'
  } finally {
    loadingInfo.value = false
  }
}

function toggleApi() {
  stockApi.toggleApiSource()
  if (selectedSymbol.value) {
    onSelectStock({ symbol: selectedSymbol.value })
  } else {
    loadMovers(moversTab.value)
  }
}

async function loadChart(symbol: string, params: { interval: string; range: string }, quiet: boolean = false) {
  if (!quiet) loadingChart.value = true
  try {
    const limitMap: Record<string, number> = { '1d': 2, '5d': 5, '1mo': 21, '3mo': 63, '1y': 252, '5y': 1260 }
    let limit = limitMap[params.range] || 100
    
    if (params.interval.endsWith('m') || params.interval.endsWith('h')) {
      if (params.range === '1d') limit = 100
      else if (params.range === '5d') limit = 300
      else limit = 500
    }
    if (stockApi.apiSource.value === 'zpi') {
      limit = Math.max(limit, 300)
    }
    
    const data = await stockApi.getChart(symbol, { ...params, limit })
    
    if (stockApi.apiSource.value === 'yahoo') {
      if (Array.isArray(data?.data)) chartData.value = data.data
      else if (Array.isArray(data)) chartData.value = data
      else chartData.value = []
    } else if (stockApi.apiSource.value === 'zpi') {
      chartData.value = Array.isArray(data) ? data : []
    } else {
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

async function loadTechnical(symbol: string) {
  loadingTechnical.value = true
  try {
    const data = await stockApi.getTechnical(symbol)
    technicalData.value = data
  } catch (err: any) {
    console.error('Technical error:', err)
  } finally {
    loadingTechnical.value = false
  }
}

async function loadBandarmology(symbol: string) {
  loadingBandarmology.value = true
  try {
    const data = await stockApi.getBandarmology(symbol)
    bandarmologyData.value = data
  } catch (err: any) {
    console.error('Bandarmology error:', err)
  } finally {
    loadingBandarmology.value = false
  }
}

async function loadInsights(symbol: string) {
  loadingInsights.value = true
  try {
    const data = await stockApi.getInsights(symbol)
    insightData.value = data
  } catch (err: any) {
    console.error('Insights error:', err)
  } finally {
    loadingInsights.value = false
  }
}

async function loadMovers(type: string) {
  loadingMovers.value = true
  try {
    const data = await stockApi.getMovers(type as 'gainers' | 'losers' | 'volume')
    moversData.value = data
  } catch (err: any) {
    console.error('Movers error:', err)
  } finally {
    loadingMovers.value = false
  }
}

function onPeriodChange(params: { interval: string; range: string }) {
  if (selectedSymbol.value) {
    currentChartParams.value = { ...params }
    loadChart(selectedSymbol.value, params)
  }
}

function onChartLoadMore() {
  if (!selectedSymbol.value || loadingChart.value) return
  
  const currentRange = currentChartParams.value.range
  const interval = currentChartParams.value.interval
  
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
    nextRange = seq[seq.length - 1] || currentRange
  }

  if (nextRange === currentRange) return
  
  currentChartParams.value.range = nextRange
  loadChart(selectedSymbol.value, currentChartParams.value)
}

function onMoversTabChange(type: string) {
  moversTab.value = type
  moversData.value = null
  loadMovers(type)
}

onUnmounted(() => {
  if (realTimeInterval) {
    clearInterval(realTimeInterval)
    realTimeInterval = null
  }
})
</script>

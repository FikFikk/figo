<template>
  <div class="pt-20 pb-20 px-4 md:px-8 max-w-7xl mx-auto min-h-screen font-mono">
    
    <!-- 1. LAYAR LOGIN PIN (Restricted Vault Screen ala /brain) -->
    <div v-if="!isUnlocked" class="min-h-[75vh] flex flex-col items-center justify-center">
      <div class="border p-6 md:p-8 max-w-sm w-full transition-all"
        :class="isDark ? 'bg-[#15171e] border-neutral-700 text-white shadow-2xl' : 'bg-white border-neutral-300 text-neutral-900 shadow-xl'"
      >
        <div class="flex items-center gap-2 mb-2 border-b pb-3" :class="isDark ? 'border-neutral-800' : 'border-neutral-200'">
          <span class="material-symbols-outlined text-amber-500 text-base">lock</span>
          <span class="text-[9px] font-bold tracking-widest uppercase text-neutral-400">RESTRICTED VAULT // QUANT ENGINE</span>
        </div>

        <h1 class="text-xl font-black uppercase tracking-tight mt-3 mb-1.5">Trading Terminal Vault</h1>
        <p class="text-xs opacity-60 mb-6 uppercase tracking-wider font-sans leading-relaxed">
          Masukkan 6-digit passcode untuk mengakses real-time chart, sinyal eksekusi multi-horizon, dan quant trading plan.
        </p>

        <form @submit.prevent="checkPin">
          <input 
            v-model="pinInput" 
            type="password" 
            inputmode="numeric" 
            maxlength="6"
            placeholder="••••••" 
            autofocus
            class="w-full text-center text-3xl tracking-[0.35em] font-mono font-bold bg-transparent border-b-2 outline-none pb-3 mb-3 transition-all placeholder:opacity-25"
            :class="[
              isDark ? 'border-neutral-700 text-white focus:border-white' : 'border-neutral-300 text-neutral-900 focus:border-neutral-900',
              pinError ? '!border-red-500 !text-red-500' : ''
            ]"
            @input="handlePinInput"
          />
          <p v-if="pinError" class="text-[10px] font-mono font-bold text-red-500 uppercase tracking-widest text-center mb-3">
            INVALID PASSCODE. PLEASE TRY AGAIN.
          </p>

          <button type="submit" 
            class="w-full py-2.5 text-xs font-mono font-bold uppercase tracking-wider border transition-all mt-2 cursor-pointer"
            :class="isDark ? 'bg-white text-neutral-950 border-white hover:bg-neutral-200' : 'bg-neutral-950 text-white border-neutral-950 hover:bg-neutral-800'"
          >
            Buka Akses Terminal
          </button>
        </form>

        <div class="mt-6 pt-4 border-t text-center" :class="isDark ? 'border-neutral-800' : 'border-neutral-200'">
          <NuxtLink to="/stocks" class="text-[10px] opacity-60 hover:opacity-100 hover:underline uppercase tracking-wider">
            &larr; Kembali ke Edukasi Saham
          </NuxtLink>
        </div>
      </div>
    </div>

    <!-- 2. LAYAR UTAMA TERMINAL TRADING (Saat Unlocked) -->
    <div v-else class="space-y-6">

      <!-- Header Terminal dengan Feed Switcher & Tombol Lock -->
      <div class="border-b pb-5" :class="isDark ? 'border-neutral-800' : 'border-neutral-200'">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div class="flex items-center gap-2 mb-1.5">
              <span class="px-2 py-0.5 text-[9px] font-mono font-bold tracking-[0.2em] uppercase border"
                :class="isDark ? 'bg-neutral-900 border-neutral-800 text-neutral-400' : 'bg-neutral-100 border-neutral-300 text-neutral-600'"
              >
                PRO QUANT TERMINAL // EQUITIES
              </span>
              <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            </div>
            <h1 class="text-2xl md:text-3xl font-mono font-black tracking-tight uppercase"
              :class="isDark ? 'text-white' : 'text-neutral-900'"
            >
              Quant Trading Terminal
            </h1>
            <p class="text-xs font-medium opacity-60 mt-0.5" :class="isDark ? 'text-neutral-400' : 'text-neutral-600'">
              Institutional-grade multi-horizon plans, interactive candlestick chart, order-flow &amp; seasonality.
            </p>
          </div>

          <!-- Controls: Switch Feed & Lock Terminal -->
          <div class="flex items-center flex-wrap gap-2">
            <!-- Feed Switcher -->
            <button @click="toggleApi"
              class="flex items-center gap-2 px-3 py-1.5 text-[10px] font-mono font-bold uppercase tracking-wider transition-all border shrink-0 cursor-pointer"
              :class="isDark 
                ? 'bg-neutral-900/80 border-neutral-700 text-neutral-200 hover:border-neutral-400' 
                : 'bg-white border-neutral-300 text-neutral-800 hover:border-neutral-900 shadow-xs'"
            >
              <span class="material-symbols-outlined text-xs">tune</span>
              FEED: {{ stockApi.apiSource.value === 'zpi' ? 'ZPI TRADINGVIEW' : stockApi.apiSource.value === 'yahoo' ? 'YAHOO FINANCE' : 'RAPIDAPI IDX' }}
              <span class="material-symbols-outlined text-xs opacity-50">swap_horiz</span>
            </button>

            <!-- Link Kembali ke Edukasi Saham -->
            <NuxtLink to="/stocks"
              class="px-3 py-1.5 text-[10px] font-mono font-bold uppercase tracking-wider border transition-all flex items-center gap-1"
              :class="isDark ? 'bg-neutral-900 border-neutral-700 text-neutral-300 hover:border-neutral-400' : 'bg-white border-neutral-300 text-neutral-800 hover:border-neutral-900 shadow-xs'"
            >
              <span class="material-symbols-outlined text-xs">school</span>
              Edukasi Saham
            </NuxtLink>

            <!-- Tombol Kunci Terminal (Hapus Sesi) -->
            <button @click="lockTerminal" 
              title="Kunci kembali terminal ini"
              class="px-3 py-1.5 text-[10px] font-mono font-bold uppercase tracking-wider border transition-all flex items-center gap-1 text-red-500 hover:bg-red-500/10 cursor-pointer"
              :class="isDark ? 'border-neutral-700' : 'border-neutral-300'"
            >
              <span class="material-symbols-outlined text-xs">lock</span>
              Lock
            </button>
          </div>
        </div>
      </div>

      <!-- Search Bar Saham (Tampilan Awal Utama) -->
      <div>
        <StockSearch @select="onSelectStock" />
      </div>

      <!-- Error Global -->
      <div v-if="globalError" class="p-4 border rounded-md flex items-start gap-3 font-mono text-xs"
        :class="isDark ? 'bg-red-500/10 text-red-400 border-red-500/30' : 'bg-red-50 text-red-700 border-red-200'"
      >
        <span class="material-symbols-outlined text-base">error</span>
        <div class="flex-1">
          <p class="font-bold uppercase tracking-wider">ERROR OCCURRED</p>
          <p class="text-[11px] opacity-80 mt-0.5">{{ globalError }}</p>
        </div>
        <button @click="globalError = ''" class="opacity-50 hover:opacity-100 cursor-pointer">
          <span class="material-symbols-outlined text-sm">close</span>
        </button>
      </div>

      <!-- TAMPILAN 1: Saat Belum Ada Saham Dipilih (Search Landing) -->
      <div v-if="!selectedSymbol" class="py-6 text-center space-y-6">
        <!-- Kotak Edukasi / Panduan Awal (Lebar Penuh w-full Menyesuaikan Search & Movers) -->
        <div class="w-full p-8 md:p-10 border rounded-md text-center"
          :class="isDark ? 'bg-neutral-900/30 border-neutral-800' : 'bg-white border-neutral-200 shadow-sm'"
        >
          <div class="max-w-lg mx-auto">
            <div class="w-10 h-10 border rounded-md flex items-center justify-center mx-auto mb-3"
              :class="isDark ? 'bg-neutral-900 border-neutral-700 text-primary' : 'bg-neutral-100 border-neutral-300 text-primary'"
            >
              <span class="material-symbols-outlined text-xl">candlestick_chart</span>
            </div>
            <h2 class="text-xs font-bold uppercase tracking-wider mb-2" :class="isDark ? 'text-white' : 'text-neutral-900'">
              Pilih atau Cari Ticker Saham
            </h2>
            <p class="text-xs opacity-60 leading-relaxed font-sans mb-0">
              Ketik kode saham di search bar atas atau pilih dari <strong>Quick / Cache Ticker</strong> untuk langsung membuka candlestick chart interaktif, sinyal eksekusi multi-horizon, dan trading plan.
            </p>
          </div>
        </div>

        <!-- Market Movers (Full Width Matching Search Bar) -->
        <div class="border rounded-md overflow-hidden w-full text-left"
          :class="isDark ? 'bg-[#15171e] border-neutral-800' : 'bg-white border-neutral-300 shadow-sm'"
        >
          <button @click="moversOpen = !moversOpen"
            class="w-full flex items-center justify-between p-4 text-left transition-colors border-b cursor-pointer"
            :class="isDark ? 'border-neutral-800 hover:bg-neutral-800/30' : 'border-neutral-200 hover:bg-neutral-50'"
          >
            <div class="flex items-center gap-2">
              <span class="material-symbols-outlined text-base opacity-70">leaderboard</span>
              <h2 class="font-mono font-bold text-xs uppercase tracking-widest" :class="isDark ? 'text-white' : 'text-neutral-900'">
                TOP MARKET MOVERS (IDX)
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
      </div>

      <!-- TAMPILAN 2: Saat Saham Sudah Dipilih (Full Pro Trading Suite) -->
      <div v-else class="space-y-6">
        
        <!-- Overview Ringkasan Saham -->
        <StockOverview :symbol="selectedSymbol" :info="stockInfo" :loading="loadingInfo" />
        
        <!-- Interactive Candlestick Chart -->
        <StockChart 
          :data="chartData" 
          :loading="loadingChart" 
          :plan="tradingPlan" 
          @fetch="loadChart(selectedSymbol, $event)" 
          @period-change="onPeriodChange" 
          @load-more="onChartLoadMore" 
        />

        <!-- Smart Trading Plan (10/10 Polish) + Technical Oscillators -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          <div class="lg:col-span-2">
            <StockTradingPlan :data="chartData" :loading="loadingChart" @update:plan="tradingPlan = $event" />
          </div>
          <div class="lg:col-span-1">
            <StockTechnical :data="technicalData" :loading="loadingTechnical" @fetch="loadTechnical(selectedSymbol)" />
          </div>
        </div>

        <!-- Bandarmology & AI Market Insights -->
        <StockBandarmology :data="bandarmologyData" :loading="loadingBandarmology" @fetch="loadBandarmology(selectedSymbol)" />
        <StockInsights :data="insightData" :loading="loadingInsights" @fetch="loadInsights(selectedSymbol)" />

      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * Halaman Utama Pro Quant Trading Terminal — Terproteksi PIN (7-Day Cookie Session)
 * Menampung Search Bar, OHLCV Chart, Smart Trading Plan, Technicals, Bandarmology & Insights.
 */
import { ref, onMounted, onBeforeUnmount } from 'vue'

useSeoMeta({
  title: 'Quant Trading Terminal — Chart, Strategy & Trading Plan — FiGo',
  description: 'Terminal quant trading saham real-time dengan chart OHLCV interaktif, trading plan multi-horizon, tape reading, dan sinyal institusional.',
})

const { isDark } = useColorMode()
const stockApi = useStockApi()
const route = useRoute()
const router = useRouter()
let realTimeInterval: any = null

// === PIN Authentication dengan Cookie Persisten (7 Hari) ===
const CORRECT_PIN = '112233'
const stockPinCookie = useCookie<string | null>('figo_stock_pin', {
  maxAge: 60 * 60 * 24 * 7,
  path: '/',
  sameSite: 'lax',
})

const isUnlocked = ref(stockPinCookie.value === CORRECT_PIN)
const pinInput = ref('')
const pinError = ref(false)

// State Data Terminal
const selectedSymbol = ref('')
const globalError = ref('')

const stockInfo = ref<any>(null)
const chartData = ref<any[]>([])
const technicalData = ref<any>(null)
const bandarmologyData = ref<any>(null)
const insightData = ref<any>(null)
const moversData = ref<any>(null)
const moversTab = ref('gainers')
const moversOpen = ref(true)
const tradingPlan = ref<any>(null)
const currentChartParams = ref({ interval: '1d', range: '3mo' })

const loadingInfo = ref(false)
const loadingChart = ref(false)
const loadingTechnical = ref(false)
const loadingBandarmology = ref(false)
const loadingInsights = ref(false)
const loadingMovers = ref(false)

function handlePinInput() {
  pinError.value = false
  if (pinInput.value.length === 6) {
    setTimeout(() => {
      checkPin()
    }, 100)
  }
}

function checkPin() {
  if (pinInput.value === CORRECT_PIN) {
    stockPinCookie.value = CORRECT_PIN
    isUnlocked.value = true
    pinError.value = false
    if (selectedSymbol.value) {
      loadAllData(selectedSymbol.value)
    } else {
      loadMovers(moversTab.value)
    }
  } else {
    pinError.value = true
    pinInput.value = ''
  }
}

function lockTerminal() {
  stockPinCookie.value = null
  isUnlocked.value = false
  pinInput.value = ''
  if (realTimeInterval) clearInterval(realTimeInterval)
}

function toggleApi() {
  stockApi.toggleApiSource()
  if (selectedSymbol.value) {
    loadAllData(selectedSymbol.value)
  } else {
    loadMovers(moversTab.value)
  }
}

async function onSelectStock(stock: any) {
  let symbol = stock.symbol || stock.code || ''
  if (!symbol) return

  symbol = symbol.trim().toUpperCase().replace(/^IDX:/i, '').replace(/\.JK$/i, '')
  selectedSymbol.value = symbol
  globalError.value = ''
  
  router.replace({ query: { symbol: selectedSymbol.value } })

  chartData.value = []
  technicalData.value = null
  bandarmologyData.value = null
  insightData.value = null
  tradingPlan.value = null

  await loadAllData(selectedSymbol.value)
  
  startPolling()
}

function startPolling() {
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

async function loadAllData(symbol: string) {
  await loadStockInfo(symbol)
  await loadChart(symbol, currentChartParams.value)
}

async function loadStockInfo(symbol: string, quiet: boolean = false) {
  if (!quiet) loadingInfo.value = true
  try {
    const data = await stockApi.getStockInfo(symbol)
    stockInfo.value = data
  } catch (err: any) {
    globalError.value = err?.data?.statusMessage || 'Gagal memuat info emiten'
  } finally {
    loadingInfo.value = false
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
    const data = await stockApi.getMovers(type)
    moversData.value = data
  } catch (err: any) {
    console.error('Movers error:', err)
  } finally {
    loadingMovers.value = false
  }
}

function onMoversTabChange(tab: string) {
  moversTab.value = tab
  loadMovers(tab)
}

function onPeriodChange(params: { interval: string; range: string }) {
  currentChartParams.value = params
  if (selectedSymbol.value) {
    loadChart(selectedSymbol.value, params)
  }
}

function onChartLoadMore() {
  // Load more historical candles
}

onMounted(() => {
  const querySym = route.query.symbol as string
  if (querySym) {
    selectedSymbol.value = querySym.trim().toUpperCase()
  }

  if (stockPinCookie.value === CORRECT_PIN) {
    isUnlocked.value = true
    if (selectedSymbol.value) {
      loadAllData(selectedSymbol.value)
      startPolling()
    } else {
      loadMovers(moversTab.value)
    }
  }
})

onBeforeUnmount(() => {
  if (realTimeInterval) clearInterval(realTimeInterval)
})
</script>

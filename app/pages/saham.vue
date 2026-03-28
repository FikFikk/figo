<template>
  <div>
    <!-- PIN Protection Screen -->
    <div v-if="!isPinVerified" class="min-h-screen flex flex-col items-center justify-center p-4">
      <div class="glass-panel border rounded-3xl p-8 md:p-12 text-center max-w-sm w-full"
        :class="isDark ? 'bg-[#1a1d28]/80 border-white/5' : 'bg-white/80 border-slate-100 shadow-xl'"
      >
        <div class="w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-6 transition-all duration-500"
          :class="[
            isDark ? 'bg-primary/20 text-primary' : 'bg-primary text-white shadow-lg shadow-primary/30',
            pinError ? 'bg-red-500/20 text-red-500 animate-bounce' : ''
          ]"
        >
          <span class="material-symbols-outlined text-3xl">{{ pinError ? 'lock_open_right' : 'lock' }}</span>
        </div>
        <h2 class="text-xl font-bold font-headline mb-2" :class="isDark ? 'text-white' : 'text-slate-900'">Akses Terbatas</h2>
        <p class="text-[11px] opacity-60 mb-8 px-4">Masukkan 6 digit PIN rahasia untuk membuka fitur Analisa Saham.</p>

        <form @submit.prevent="checkPin" class="flex flex-col gap-6">
          <div>
            <input 
              v-model="pinInput"
              type="password" 
              inputmode="numeric"
              maxlength="6"
              pattern="\d*"
              placeholder="••••••"
              class="w-full text-center text-4xl tracking-[0.3em] font-mono font-bold bg-transparent border-b-2 outline-none pb-3 transition-all placeholder:opacity-20"
              :class="[
                isDark ? 'border-white/10 text-white focus:border-primary' : 'border-slate-200 text-slate-900 focus:border-primary',
                pinError ? '!border-red-500 !text-red-500' : ''
              ]"
              @input="handlePinInput"
            />
            <p v-if="pinError" class="text-[10px] font-bold text-red-500 mt-3 animate-pulse">PIN salah. Silakan coba lagi.</p>
          </div>
        </form>
      </div>
    </div>

    <!-- Main Content -->
    <div v-else class="pt-24 pb-20 px-4 md:px-8 max-w-7xl mx-auto min-h-screen transform transition-all animate-fade-in">
    
    <!-- Page Header -->
    <div class="mb-8">
      <div class="flex items-center gap-3 mb-3">
        <div class="w-10 h-10 rounded-2xl flex items-center justify-center"
          :class="isDark ? 'bg-primary/15' : 'bg-blue-50'"
        >
          <span class="material-symbols-outlined text-xl text-primary">candlestick_chart</span>
        </div>
        <div>
          <h1 class="text-2xl md:text-3xl font-headline font-black tracking-tight"
            :class="isDark ? 'text-white' : 'text-slate-900'"
          >Analisa Saham IDX</h1>
          <p class="text-xs" :class="isDark ? 'text-gray-500' : 'text-slate-400'">
            Real-time market data, technical signals & bandarmology
          </p>
        </div>
      </div>
    </div>

    <!-- Search Bar -->
    <div class="mb-8">
      <StockSearch @select="onSelectStock" />
    </div>

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

    <!-- Konten Utama: Saat saham sudah dipilih -->
    <div v-if="selectedSymbol" class="space-y-6">
      
      <!-- Overview -->
      <StockOverview :symbol="selectedSymbol" :info="stockInfo" :loading="loadingInfo" />

      <!-- Chart & Technical — Side by Side di Desktop -->
      <div class="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <!-- Chart (lebih lebar) -->
        <div class="lg:col-span-3">
          <StockChart :data="chartData" :loading="loadingChart" @fetch="loadChart(selectedSymbol, $event)" @period-change="onPeriodChange" />
        </div>

        <!-- Technical Analysis -->
        <div class="lg:col-span-2">
          <StockTechnical :data="technicalData" :loading="loadingTechnical" @fetch="loadTechnical(selectedSymbol)" />
        </div>
      </div>

      <!-- Bandarmology -->
      <StockBandarmology :data="bandarmologyData" :loading="loadingBandarmology" @fetch="loadBandarmology(selectedSymbol)" />
    </div>

    <!-- Market Movers (tampil jika belum ada saham yang dipilih) -->
    <div v-if="!selectedSymbol" class="mt-8">
      <div class="flex items-center gap-2 mb-4">
        <span class="material-symbols-outlined text-lg text-primary">leaderboard</span>
        <h2 class="font-headline font-bold text-lg"
          :class="isDark ? 'text-white' : 'text-slate-900'"
        >Market Movers</h2>
      </div>
      <StockMovers 
        :data="moversData" 
        :loading="loadingMovers" 
        :active-tab="moversTab"
        @select-stock="onSelectStock"
        @tab-change="onMoversTabChange"
        @update-tab="moversTab = $event"
        @fetch="loadMovers(moversTab)"
      />
    </div>

    <!-- Footer -->
    <div class="mt-10 text-center opacity-20">
      <p class="text-[9px] font-bold uppercase tracking-[0.3em]">Data from IDX via RapidAPI</p>
    </div>
  </div>
  </div>
</template>

<script setup lang="ts">
/**
 * Halaman utama Analisa Saham IDX
 * Layout: Search → Overview → Chart + Technical → Bandarmology → Market Movers
 */
useSeoMeta({
  title: 'Analisa Saham IDX — FiGo',
  description: 'Analisa saham Indonesia Stock Exchange (IDX) dengan chart OHLCV, sinyal teknikal, market movers, dan bandarmology. Powered by FiGo.',
})

const { isDark } = useColorMode()
const stockApi = useStockApi()

// === PIN Authentication ===
const isPinVerified = ref(false)
const pinInput = ref('')
const pinError = ref(false)
const CORRECT_PIN = '112233'

function checkPin() {
  if (pinInput.value === CORRECT_PIN) {
    isPinVerified.value = true
    pinError.value = false
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
const moversData = ref<any>(null)
const moversTab = ref('gainers')

// Loading state per section
const loadingInfo = ref(false)
const loadingChart = ref(false)
const loadingTechnical = ref(false)
const loadingBandarmology = ref(false)
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

  // HANYA fetch Overview secara otomatis untuk menghemat limit (1 req)
  // Komponen lain baru di-fetch setelah user mengklik tombol "Tampilkan Data"
  await loadStockInfo(selectedSymbol.value)
}

// Fetch: Info emiten
async function loadStockInfo(symbol: string) {
  loadingInfo.value = true
  try {
    const data = await $fetch('/api/stock/info', { params: { symbol } })
    stockInfo.value = data
  } catch (err: any) {
    globalError.value = err?.data?.statusMessage || 'Gagal memuat info saham'
  } finally {
    loadingInfo.value = false
  }
}

// Fetch: Chart OHLCV
async function loadChart(symbol: string, limit: number) {
  loadingChart.value = true
  try {
    const data = await $fetch<any>('/api/stock/chart', { params: { symbol, limit } })
    // API format: { success, data: { data: { chartbit: [...] } } }
    const chartbit = data?.data?.data?.chartbit
      || data?.data?.chartbit
      || data?.chartbit
    if (Array.isArray(chartbit)) chartData.value = chartbit
    else if (Array.isArray(data)) chartData.value = data
    else if (data?.data && Array.isArray(data.data)) chartData.value = data.data
    else chartData.value = []
  } catch (err: any) {
    console.error('Chart error:', err)
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

// Handler: Period chart berubah
function onPeriodChange(limit: number) {
  if (selectedSymbol.value) {
    loadChart(selectedSymbol.value, limit)
  }
}

// Handler: Tab movers berubah
function onMoversTabChange(type: string) {
  moversTab.value = type
  moversData.value = null
  loadMovers(type)
}
</script>

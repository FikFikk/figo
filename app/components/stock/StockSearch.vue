<template>
  <div class="relative w-full">
    <!-- Input Pencarian Swiss Style -->
    <div class="relative">
      <div class="flex items-center border transition-all duration-200"
        :class="[
          isDark 
            ? 'bg-[#12141a] border-neutral-800 focus-within:border-neutral-400' 
            : 'bg-white border-neutral-300 focus-within:border-neutral-900 shadow-sm'
        ]"
      >
        <div class="pl-4 pr-2 flex items-center justify-center text-neutral-400">
          <span class="material-symbols-outlined text-lg">search</span>
        </div>
        
        <input
          v-model="query"
          type="text"
          placeholder="SEARCH TICKER OR COMPANY (E.G. BBCA, BBRI, NVDA, AAPL)..."
          class="w-full py-3.5 pr-10 text-xs md:text-sm font-mono tracking-wider uppercase bg-transparent outline-none placeholder:normal-case placeholder:font-sans placeholder:tracking-normal placeholder:opacity-40"
          :class="isDark ? 'text-white' : 'text-neutral-900'"
          @input="onSearch"
          @focus="showDropdown = true"
          @keydown.escape="showDropdown = false"
          @keydown.enter="selectFirst"
        />

        <!-- Loading spinner -->
        <span v-if="loading" class="material-symbols-outlined absolute right-3.5 top-1/2 -translate-y-1/2 text-sm animate-spin text-neutral-400">
          progress_activity
        </span>
        <!-- Clear button -->
        <button v-else-if="query" @click="clearSearch"
          class="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors"
        >
          <span class="material-symbols-outlined text-base">close</span>
        </button>
      </div>

      <!-- Quick Tickers Bar (Swiss Pill Grid) -->
      <div class="flex items-center gap-1.5 mt-2.5 overflow-x-auto pb-1 no-scrollbar text-[10px] font-mono font-medium">
        <span class="text-neutral-400 dark:text-neutral-600 uppercase tracking-widest text-[9px] mr-1 shrink-0">QUICK:</span>
        <button
          v-for="ticker in quickTickers"
          :key="ticker.symbol"
          @click="selectQuickTicker(ticker)"
          class="px-2.5 py-1 border transition-all shrink-0 hover:border-neutral-900 dark:hover:border-white"
          :class="[
            isDark 
              ? 'bg-neutral-900/60 border-neutral-800 text-neutral-300 hover:text-white hover:bg-neutral-800' 
              : 'bg-neutral-50 border-neutral-200 text-neutral-700 hover:text-neutral-900 hover:bg-neutral-100'
          ]"
        >
          <span class="font-bold">{{ ticker.symbol }}</span>
          <span v-if="ticker.tag" class="ml-1 text-[8px] opacity-40 uppercase">{{ ticker.tag }}</span>
        </button>
      </div>
    </div>

    <!-- Dropdown hasil pencarian -->
    <Transition
      enter-active-class="transition duration-150 ease-out"
      enter-from-class="opacity-0 -translate-y-1"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition duration-100 ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 -translate-y-1"
    >
      <div v-if="showDropdown && query.length > 0"
        class="absolute top-full left-0 right-0 mt-1 shadow-2xl z-50 max-h-80 overflow-y-auto border"
        :class="isDark ? 'bg-[#15171e] border-neutral-800 text-neutral-200' : 'bg-white border-neutral-300 text-neutral-900'"
      >
        <!-- Header Dropdown -->
        <div class="px-4 py-2 border-b flex items-center justify-between"
          :class="isDark ? 'bg-neutral-900/80 border-neutral-800 text-neutral-500' : 'bg-neutral-50 border-neutral-200 text-neutral-400'"
        >
          <p class="text-[9px] font-mono uppercase tracking-[0.2em]">
            SEARCH RESULTS FOR <span class="text-neutral-900 dark:text-neutral-200 font-bold">"{{ query }}"</span>
          </p>
          <span class="text-[9px] font-mono">{{ displayList.length }} MATCHES</span>
        </div>

        <!-- Loading State -->
        <div v-if="isTyping || loading" class="px-4 py-8 text-center flex flex-col items-center justify-center">
          <span class="material-symbols-outlined text-neutral-400 animate-spin text-2xl mb-2 inline-block">progress_activity</span>
          <p class="text-[11px] font-mono opacity-60 uppercase tracking-wider">{{ isTyping ? 'Typing...' : 'Fetching market data...' }}</p>
        </div>

        <!-- Daftar Saham -->
        <div v-else class="divide-y" :class="isDark ? 'divide-neutral-800/60' : 'divide-neutral-100'">
          <!-- Item Saham -->
          <button
            v-for="stock in displayList"
            :key="stock.symbol || stock.code"
            @click="selectStock(stock)"
            class="w-full px-4 py-2.5 flex items-center gap-3 transition-colors text-left group"
            :class="isDark ? 'hover:bg-neutral-800/50' : 'hover:bg-neutral-50'"
          >
            <!-- Badge Ticker -->
            <div class="w-11 h-9 flex items-center justify-center flex-shrink-0 text-xs font-mono font-bold border uppercase"
              :class="isDark ? 'bg-neutral-900 border-neutral-700 text-white' : 'bg-neutral-100 border-neutral-200 text-neutral-900'"
            >
              {{ (stock.symbol || stock.code || '?').replace('.JK', '').substring(0, 4) }}
            </div>

            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2">
                <span class="font-mono font-bold text-xs tracking-wider"
                  :class="isDark ? 'text-white' : 'text-neutral-900'"
                >{{ stock.symbol || stock.code }}</span>
                
                <!-- Exchange Badge -->
                <span v-if="stock.isIDX || stock.tag === 'IDX' || (stock.symbol && stock.symbol.endsWith('.JK'))" 
                  class="px-1.5 py-0.2 text-[8px] font-mono uppercase bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                >IDX</span>
                <span v-else-if="stock.tag" 
                  class="px-1.5 py-0.2 text-[8px] font-mono uppercase opacity-50 border"
                  :class="isDark ? 'border-neutral-700' : 'border-neutral-200'"
                >{{ stock.tag }}</span>
              </div>
              <p class="text-[11px] truncate opacity-60 font-sans"
                :class="isDark ? 'text-neutral-400' : 'text-neutral-600'"
              >{{ stock.name || stock.company || '' }}</p>
            </div>

            <!-- Harga jika tersedia -->
            <div v-if="stock.close || stock.price" class="text-right flex-shrink-0 font-mono tabular-nums">
              <p class="text-xs font-bold"
                :class="isDark ? 'text-white' : 'text-neutral-900'"
              >{{ formatPrice(stock.close || stock.price) }}</p>
              <p v-if="stock.change !== undefined" class="text-[9px] font-bold"
                :class="(stock.change || 0) >= 0 ? 'text-emerald-500' : 'text-red-500'"
              >{{ (stock.change || 0) >= 0 ? '+' : '' }}{{ formatPercent(stock.changePct || stock.percent || 0) }}%</p>
            </div>
          </button>

          <!-- Tidak ditemukan -->
          <div v-if="query.length > 0 && results.length === 0"
            class="px-4 py-8 text-center"
          >
            <span class="material-symbols-outlined text-2xl mb-1 block opacity-30">search_off</span>
            <p class="text-xs font-mono opacity-60">NO TICKER MATCHING "{{ query }}"</p>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Overlay untuk menutup dropdown -->
    <div v-if="showDropdown" class="fixed inset-0 z-40" @click="showDropdown = false"></div>
  </div>
</template>

<script setup lang="ts">
/**
 * Komponen pencarian saham Swiss International Typographic Style
 * Dilengkapi Shortcut Ticker Cepat dan Debounce Optimal
 */
const emit = defineEmits<{
  select: [stock: any]
}>()

const { isDark } = useColorMode()
const { searchStock, loading } = useStockApi()

const query = ref('')
const results = ref<any[]>([])
const showDropdown = ref(false)
const isTyping = ref(false)
let searchTimeout: ReturnType<typeof setTimeout> | null = null

// Quick Tickers Populer
const quickTickers = [
  { symbol: 'BBCA', tag: 'IDX' },
  { symbol: 'BBRI', tag: 'IDX' },
  { symbol: 'BMRI', tag: 'IDX' },
  { symbol: 'TLKM', tag: 'IDX' },
  { symbol: 'ASII', tag: 'IDX' },
  { symbol: 'BREN', tag: 'IDX' },
  { symbol: 'AMMN', tag: 'IDX' },
  { symbol: 'NVDA', tag: 'US' },
  { symbol: 'AAPL', tag: 'US' },
  { symbol: 'TSLA', tag: 'US' },
]

function selectQuickTicker(ticker: { symbol: string; tag?: string }) {
  emit('select', { symbol: ticker.symbol })
  query.value = ticker.symbol
  showDropdown.value = false
}

// Daftar yang ditampilkan
const displayList = computed(() => results.value)

// Debounced search (350ms agar cepat dan responsif)
function onSearch() {
  if (searchTimeout) clearTimeout(searchTimeout)
  showDropdown.value = true
  isTyping.value = true

  if (query.value.trim().length < 1) {
    results.value = []
    isTyping.value = false
    return
  }

  searchTimeout = setTimeout(async () => {
    isTyping.value = false
    const data = await searchStock(query.value)

    let items: any[] = []
    if (Array.isArray(data)) {
      items = data
    } else {
      items = extractSearchResults(data)
    }

    results.value = items.map((c: any) => ({
      symbol: c.symbol || c.name || c.code || '',
      name: c.name || c.longname || c.desc || c.description || c.company || '',
      ...c,
    }))
  }, 350)
}

function extractArray(data: any): any[] {
  if (!data) return []
  if (Array.isArray(data)) return data
  if (data.data) {
    if (Array.isArray(data.data)) return data.data
    if (data.data.data && Array.isArray(data.data.data)) return data.data.data
  }
  return []
}

function extractSearchResults(data: any): any[] {
  if (!data) return []
  if (data?.data?.data?.company) return data.data.data.company
  if (data?.data?.company) return data.data.company
  return extractArray(data)
}

function selectStock(stock: any) {
  query.value = stock.symbol || stock.code || ''
  showDropdown.value = false
  emit('select', stock)
}

function selectFirst() {
  if (displayList.value.length > 0) {
    selectStock(displayList.value[0])
  }
}

function clearSearch() {
  query.value = ''
  results.value = []
  showDropdown.value = false
}

function formatPrice(price: number): string {
  if (!price) return '-'
  return new Intl.NumberFormat('id-ID').format(price)
}

function formatPercent(pct: number): string {
  return (pct || 0).toFixed(2)
}
</script>

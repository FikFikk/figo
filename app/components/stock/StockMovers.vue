<template>
  <div class="border transition-all duration-200"
    :class="isDark ? 'bg-[#15171e] border-neutral-800' : 'bg-white border-neutral-300 shadow-sm'"
  >
    <!-- Header Tabs: Swiss Segmented Grid -->
    <div class="grid grid-cols-3 divide-x border-b font-mono text-[10px] font-bold"
      :class="isDark ? 'divide-neutral-800 border-neutral-800 bg-neutral-900/40' : 'divide-neutral-200 border-neutral-200 bg-neutral-50'"
    >
      <button v-for="tab in tabs" :key="tab.type" @click="switchTab(tab.type)"
        class="py-3 px-2 flex items-center justify-center gap-1.5 uppercase tracking-widest transition-all text-center"
        :class="activeTab === tab.type
          ? (isDark ? 'bg-neutral-800 text-white border-b-2 border-b-white' : 'bg-white text-neutral-900 border-b-2 border-b-neutral-900 shadow-xs')
          : (isDark ? 'text-neutral-500 hover:text-neutral-300' : 'text-neutral-500 hover:text-neutral-900')"
      >
        <span class="material-symbols-outlined text-xs">{{ tab.icon }}</span>
        <span>{{ tab.label }}</span>
      </button>
    </div>

    <!-- Content -->
    <div class="p-0">
      <!-- Unlocked State -->
      <div v-if="!isUnlocked && !movers.length && !loading" class="flex flex-col items-center justify-center p-8 text-center min-h-[200px]">
        <div class="w-10 h-10 border flex items-center justify-center mb-3"
          :class="isDark ? 'bg-neutral-900 border-neutral-700 text-neutral-400' : 'bg-neutral-100 border-neutral-300 text-neutral-600'"
        >
          <span class="material-symbols-outlined text-lg">leaderboard</span>
        </div>
        <h4 class="font-mono font-bold text-xs uppercase tracking-wider mb-1" :class="isDark ? 'text-white' : 'text-neutral-900'">
          REAL-TIME MARKET MOVERS
        </h4>
        <p class="text-[11px] opacity-60 mb-4 max-w-[260px]">Load the most active stocks filtered by Top Gainers, Losers, and Volume.</p>
        <button @click="handleUnlock" 
          class="px-5 py-2 text-xs font-mono font-bold uppercase tracking-wider border transition-all"
          :class="isDark 
            ? 'bg-white text-black border-white hover:bg-neutral-200' 
            : 'bg-neutral-900 text-white border-neutral-900 hover:bg-neutral-800'"
        >
          LOAD MOVERS
        </button>
      </div>

      <!-- Loading -->
      <div v-else-if="loading" class="p-4 space-y-2">
        <div v-for="i in 5" :key="i" class="h-10 border animate-pulse"
          :class="isDark ? 'bg-neutral-900/40 border-neutral-800' : 'bg-neutral-100 border-neutral-200'"></div>
      </div>

      <!-- Tabel Movers: Swiss Dense Rows -->
      <div v-else-if="movers.length > 0" class="divide-y"
        :class="isDark ? 'divide-neutral-800/80' : 'divide-neutral-200'"
      >
        <div v-for="(stock, idx) in movers" :key="stock.symbol || idx"
          @click="$emit('selectStock', stock)"
          class="flex items-center justify-between px-4 py-3 cursor-pointer transition-colors group hover:bg-neutral-50 dark:hover:bg-neutral-900/40"
        >
          <!-- Left: Rank + Ticker + Company -->
          <div class="flex items-center gap-3 min-w-0">
            <span class="font-mono text-[10px] font-bold w-5 opacity-40 tabular-nums">
              {{ String(idx + 1).padStart(2, '0') }}
            </span>

            <div class="min-w-0">
              <div class="flex items-center gap-2">
                <span class="font-mono font-bold text-xs tracking-wider"
                  :class="isDark ? 'text-white' : 'text-neutral-900'"
                >{{ stock.symbol }}</span>
                <span class="text-[9px] font-mono opacity-50 truncate max-w-[140px] hidden sm:inline">
                  {{ stock.name }}
                </span>
              </div>
            </div>
          </div>

          <!-- Right: Price + Percent Change + Volume -->
          <div class="flex items-center gap-3 font-mono tabular-nums shrink-0">
            <p class="text-xs font-bold" :class="isDark ? 'text-white' : 'text-neutral-900'">
              {{ formatPrice(stock.price) }}
            </p>

            <span class="px-2 py-0.5 text-[9px] font-bold border tracking-wider"
              :class="getChangeClass(stock)"
            >
              {{ getChangeText(stock) }}
            </span>

            <span v-if="activeTab === 'volume'" class="text-[10px] opacity-50 w-12 text-right hidden md:inline">
              {{ formatVolume(stock.volume) }}
            </span>
          </div>
        </div>
      </div>

      <!-- Empty state -->
      <div v-else class="text-center py-8">
        <span class="material-symbols-outlined text-2xl opacity-20 mb-1 block">leaderboard</span>
        <p class="text-xs font-mono opacity-50 uppercase">NO MARKET MOVERS DATA AVAILABLE</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * Komponen Market Movers Swiss Style
 */
const props = defineProps<{
  data: any
  loading: boolean
  activeTab: string
}>()

const emit = defineEmits<{
  selectStock: [stock: any]
  tabChange: [type: string]
  updateTab: [type: string]
  fetch: []
}>()

const isUnlocked = ref(false)
const { isDark } = useColorMode()

const tabs = [
  { type: 'gainers', label: 'Gainers', icon: 'arrow_upward' },
  { type: 'losers', label: 'Losers', icon: 'arrow_downward' },
  { type: 'volume', label: 'Volume', icon: 'bar_chart' },
]

function handleUnlock() {
  isUnlocked.value = true
  emit('fetch')
}

function switchTab(type: string) {
  if (isUnlocked.value) {
    emit('tabChange', type)
  } else {
    emit('updateTab', type)
  }
}

const movers = computed(() => {
  if (!props.data) return []

  let raw: any[] = []
  if (Array.isArray(props.data)) raw = props.data
  else if (props.data?.data?.data?.mover_list && Array.isArray(props.data.data.data.mover_list)) raw = props.data.data.data.mover_list
  else if (props.data?.data?.mover_list && Array.isArray(props.data.data.mover_list)) raw = props.data.data.mover_list
  else if (props.data?.data?.data && Array.isArray(props.data.data.data)) raw = props.data.data.data
  else if (props.data?.data && Array.isArray(props.data.data)) raw = props.data.data

  return raw.slice(0, 10).map((item: any) => ({
    symbol: item.stock_detail?.code || item.symbol || item.code || '',
    name: item.stock_detail?.name || item.name || item.company || '',
    price: item.price || item.close || item.lastPrice || 0,
    changePct: item.change?.percentage || item.changePct || item.percent || 0,
    changeValue: item.change?.value || item.change || 0,
    volume: item.volume?.raw || item.volume || item.vol || 0,
    value: item.value?.raw || item.value || 0,
  }))
})

function getChangeClass(stock: any): string {
  const pct = stock.changePct || 0
  if (pct > 0) return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
  if (pct < 0) return 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/30'
  return isDark.value ? 'bg-neutral-800 text-neutral-400 border-neutral-700' : 'bg-neutral-100 text-neutral-600 border-neutral-300'
}

function getChangeText(stock: any): string {
  const pct = stock.changePct || 0
  return (pct >= 0 ? '+' : '') + Number(pct).toFixed(2) + '%'
}

function formatPrice(n: number): string {
  if (!n) return '-'
  return new Intl.NumberFormat('id-ID').format(n)
}

function formatVolume(n: number): string {
  if (!n) return '-'
  if (n >= 1_000_000_000) return (n / 1_000_000_000).toFixed(1) + 'B'
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M'
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K'
  return n.toString()
}
</script>

<template>
  <div v-if="info" class="border transition-all duration-200 rounded-md overflow-hidden font-mono"
    :class="isDark ? 'bg-[#15171e] border-neutral-800' : 'bg-white border-neutral-300 shadow-sm'"
  >
    <!-- Top Technical System Badge & Multi-Horizon Summary -->
    <div class="px-5 py-2.5 border-b flex flex-wrap items-center justify-between gap-2 text-[10px]"
      :class="isDark ? 'bg-neutral-900/60 border-neutral-800 text-neutral-400' : 'bg-neutral-50 border-neutral-200 text-neutral-600'"
    >
      <div class="flex items-center gap-3">
        <span class="font-bold text-primary flex items-center gap-1">
          <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          REALTIME STOCKBIT + QUANT ENGINE
        </span>
        <span class="hidden sm:inline opacity-40">|</span>
        <span class="hidden sm:inline">{{ stockData?.sector || 'EQUITIES' }}</span>
      </div>

      <!-- 3-Horizon Quick Verdict Badges -->
      <div class="flex items-center gap-1.5 font-bold text-[9px]">
        <span class="px-2 py-0.5 border"
          :class="changePct >= 0 ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30' : 'bg-red-500/10 text-red-500 border-red-500/30'"
        >
          ⚡ SCALP: {{ changePct >= 0 ? 'MOMENTUM UP' : 'PULLBACK' }}
        </span>
        <span class="px-2 py-0.5 border"
          :class="isDark ? 'bg-neutral-900 text-blue-400 border-blue-500/30' : 'bg-blue-50 text-blue-700 border-blue-200'"
        >
          🌊 SWING: ACCUMULATE
        </span>
        <span class="px-2 py-0.5 border"
          :class="isDark ? 'bg-neutral-900 text-neutral-300 border-neutral-700' : 'bg-neutral-100 text-neutral-800 border-neutral-300'"
        >
          🏛️ INVEST: HOLD
        </span>
      </div>
    </div>

    <!-- Header: Ticker, Name, Price, and Status -->
    <div class="p-5 md:p-6 border-b flex flex-col md:flex-row md:items-center justify-between gap-4"
      :class="isDark ? 'border-neutral-800' : 'border-neutral-200'"
    >
      <!-- Left: Logo & Company -->
      <div class="flex items-start md:items-center gap-3.5 min-w-0">
        <div class="w-12 h-12 flex items-center justify-center flex-shrink-0 bg-neutral-100 dark:bg-neutral-900 border rounded-md"
          :class="isDark ? 'border-neutral-700' : 'border-neutral-200'"
        >
          <img 
            v-if="!logoError"
            :src="`https://assets.stockbit.com/logos/companies/${symbol.replace('.JK', '')}.png`" 
            :alt="symbol"
            class="w-full h-full object-contain p-1.5"
            @error="logoError = true"
          />
          <span v-else class="font-mono font-black text-sm uppercase" :class="isDark ? 'text-white' : 'text-neutral-900'">
            {{ symbol.replace('.JK', '').substring(0, 3) }}
          </span>
        </div>

        <div class="min-w-0">
          <div class="flex items-center gap-2 mb-0.5">
            <h2 class="font-mono font-black text-2xl md:text-3xl tracking-tight uppercase"
              :class="isDark ? 'text-white' : 'text-neutral-900'"
            >{{ symbol }}</h2>
            <span v-if="stockData?.sector" 
              class="px-2 py-0.5 text-[9px] font-mono font-bold uppercase tracking-widest border rounded-xs"
              :class="isDark ? 'bg-neutral-800 border-neutral-700 text-neutral-300' : 'bg-neutral-100 border-neutral-300 text-neutral-700'"
            >{{ stockData.sector }}</span>
          </div>
          <p class="text-xs truncate font-sans opacity-70" :class="isDark ? 'text-neutral-400' : 'text-neutral-600'">
            {{ stockData?.name || stockData?.company || 'Equities / Stock' }}
          </p>
        </div>
      </div>

      <!-- Right: Main Price Display & Day Range Bar -->
      <div class="flex flex-col md:items-end justify-center border-t md:border-t-0 pt-3 md:pt-0"
        :class="isDark ? 'border-neutral-800/80' : 'border-neutral-100'"
      >
        <div class="flex items-baseline md:justify-end gap-3">
          <p class="font-mono font-black text-3xl md:text-4xl tracking-tight tabular-nums"
            :class="isDark ? 'text-white' : 'text-neutral-900'"
          >{{ formatPrice(currentPrice) }}</p>

          <span class="px-2 py-0.5 text-[10px] font-mono font-bold tracking-wider uppercase border rounded-xs flex items-center gap-1"
            :class="changeValue >= 0 
              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' 
              : 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20'"
          >
            <span class="material-symbols-outlined text-xs">{{ changeValue >= 0 ? 'arrow_upward' : 'arrow_downward' }}</span>
            {{ changeValue >= 0 ? '+' : '' }}{{ formatPrice(changeValue) }} ({{ changeValue >= 0 ? '+' : '' }}{{ changePct.toFixed(2) }}%)
          </span>
        </div>

        <!-- Day Low / High Range Bar (Stockbit Style) -->
        <div v-if="dayLow && dayHigh" class="w-full md:w-56 mt-2 text-[9px] font-mono">
          <div class="flex justify-between items-center opacity-60 mb-0.5">
            <span>L: {{ formatPrice(dayLow) }}</span>
            <span>H: {{ formatPrice(dayHigh) }}</span>
          </div>
          <div class="h-1.5 w-full bg-neutral-200 dark:bg-neutral-800 rounded-xs overflow-hidden relative">
            <div class="h-full bg-primary" :style="{ width: `${dayRangePct}%` }"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Stats Grid: Swiss Modular Table -->
    <div class="grid grid-cols-2 sm:grid-cols-4 divide-x divide-y sm:divide-y-0"
      :class="isDark ? 'divide-neutral-800 bg-neutral-950/40' : 'divide-neutral-200 bg-neutral-50/50'"
    >
      <div v-for="stat in stats" :key="stat.label" class="p-3.5 md:p-4">
        <p class="text-[9px] font-mono uppercase tracking-[0.2em] opacity-50 mb-1">
          {{ stat.label }}
        </p>
        <p class="text-xs md:text-sm font-mono font-bold tabular-nums truncate" 
          :class="isDark ? 'text-white' : 'text-neutral-900'"
        >
          {{ stat.value }}
        </p>
      </div>
    </div>
  </div>

  <!-- Loading skeleton -->
  <div v-else-if="loading" class="border p-6 animate-pulse rounded-md"
    :class="isDark ? 'bg-[#15171e] border-neutral-800' : 'bg-white border-neutral-300'"
  >
    <div class="flex items-start justify-between mb-6">
      <div class="flex items-center gap-3">
        <div class="w-12 h-12 rounded-md" :class="isDark ? 'bg-neutral-800' : 'bg-neutral-200'"></div>
        <div>
          <div class="h-6 w-24 mb-2" :class="isDark ? 'bg-neutral-800' : 'bg-neutral-200'"></div>
          <div class="h-3.5 w-44" :class="isDark ? 'bg-neutral-800/60' : 'bg-neutral-100'"></div>
        </div>
      </div>
      <div class="text-right">
        <div class="h-7 w-32 mb-1.5 ml-auto" :class="isDark ? 'bg-neutral-800' : 'bg-neutral-200'"></div>
        <div class="h-4 w-20 ml-auto" :class="isDark ? 'bg-neutral-800/60' : 'bg-neutral-100'"></div>
      </div>
    </div>
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
      <div v-for="i in 4" :key="i" class="h-14" :class="isDark ? 'bg-neutral-800/40' : 'bg-neutral-100'"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * Komponen Overview Saham Swiss International Typographic Style + Stockbit Matrix
 */
const props = defineProps<{
  symbol: string
  info: any
  loading: boolean
}>()

const { isDark } = useColorMode()
const logoError = ref(false)

watch(() => props.symbol, () => {
  logoError.value = false
})

const stockData = computed(() => {
  if (!props.info) return null
  return props.info?.data || props.info
})

const currentPrice = computed(() => {
  if (!stockData.value) return 0
  const d = stockData.value
  return d.price || d.close || d.lastPrice || d.last || 0
})

const changeValue = computed(() => {
  if (!stockData.value) return 0
  const d = stockData.value
  return parseFloat(d.change) || 0
})

const changePct = computed(() => {
  if (!stockData.value) return 0
  const d = stockData.value
  return parseFloat(d.changePercent) || parseFloat(d.percentage) || d.changePct || d.percent || 0
})

const dayLow = computed(() => {
  if (!stockData.value) return 0
  const d = stockData.value
  return d.low || d.dayLow || d.regularMarketDayLow || 0
})

const dayHigh = computed(() => {
  if (!stockData.value) return 0
  const d = stockData.value
  return d.high || d.dayHigh || d.regularMarketDayHigh || 0
})

const dayRangePct = computed(() => {
  if (!dayLow.value || !dayHigh.value || dayHigh.value === dayLow.value) return 50
  const pct = ((currentPrice.value - dayLow.value) / (dayHigh.value - dayLow.value)) * 100
  return Math.min(Math.max(pct, 5), 95)
})

const stats = computed(() => {
  if (!stockData.value) return []
  const d = stockData.value

  return [
    {
      label: 'PREV CLOSE',
      value: formatPrice(d.previousClose || d.previous || d.prevClose || 0),
    },
    {
      label: 'VOLUME (LOTS)',
      value: formatVolume(d.volume || d.vol || 0),
    },
    {
      label: 'DAY RANGE',
      value: dayLow.value && dayHigh.value ? `${formatPrice(dayLow.value)} - ${formatPrice(dayHigh.value)}` : '-',
    },
    {
      label: 'FEED SOURCE',
      value: d.source === 'yahoo' ? 'YAHOO FINANCE' : (d.source === 'zpi' ? 'ZPI TRADINGVIEW' : 'IDX REALTIME'),
    },
  ]
})

function formatPrice(n: number): string {
  if (!n) return '-'
  return new Intl.NumberFormat('id-ID').format(n)
}

function formatVolume(n: number): string {
  if (!n) return '-'
  if (n >= 1_000_000_000) return (n / 1_000_000_000).toFixed(2) + 'B'
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(2) + 'M'
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K'
  return n.toString()
}
</script>

<style scoped>
/* Scoped Swiss Layout */
</style>

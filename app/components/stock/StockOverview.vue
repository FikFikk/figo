<template>
  <div v-if="info" class="glass-panel rounded-2xl p-5 md:p-6 border transition-all"
    :class="isDark ? 'border-white/5' : 'border-slate-100'"
  >
    <!-- Header: Nama & Kode Saham & Logo -->
    <div class="flex items-start justify-between gap-4 mb-5">
      <div class="min-w-0 flex items-center gap-3">
        <!-- Logo -->
        <div class="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 bg-white border"
          :class="isDark ? 'border-white/10' : 'border-slate-100'"
        >
          <img 
            v-if="!logoError"
            :src="`https://assets.stockbit.com/logos/companies/${symbol}.png`" 
            :alt="symbol"
            class="w-full h-full object-contain p-1.5"
            @error="logoError = true"
          />
          <span v-else class="font-black text-lg" :class="isDark ? 'text-slate-800' : 'text-slate-900'">
            {{ symbol.substring(0, 2) }}
          </span>
        </div>

        <div class="min-w-0">
          <div class="flex items-center gap-2 mb-1">
            <h2 class="font-headline font-black text-2xl md:text-3xl tracking-tight"
              :class="isDark ? 'text-white' : 'text-slate-900'"
            >{{ symbol }}</h2>
            <div v-if="stockData?.sector" class="px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider"
              :class="isDark ? 'bg-primary/15 text-primary border border-primary/20' : 'bg-blue-50 text-primary'"
            >{{ stockData.sector }}</div>
          </div>
          <p class="text-xs truncate" :class="isDark ? 'text-gray-500' : 'text-slate-400'">
            {{ stockData?.name || '' }}
          </p>
        </div>
      </div>

      <!-- Harga Utama -->
      <div class="text-right flex-shrink-0">
        <p class="font-headline font-black text-2xl md:text-3xl tracking-tight"
          :class="isDark ? 'text-white' : 'text-slate-900'"
        >{{ formatPrice(currentPrice) }}</p>
        <div class="flex items-center justify-end gap-2 mt-0.5">
          <span class="material-symbols-outlined text-sm"
            :class="changeValue >= 0 ? 'text-emerald-500' : 'text-red-500'"
          >{{ changeValue >= 0 ? 'trending_up' : 'trending_down' }}</span>
          <span class="text-sm font-bold"
            :class="changeValue >= 0 ? 'text-emerald-500' : 'text-red-500'"
          >{{ changeValue >= 0 ? '+' : '' }}{{ formatPrice(changeValue) }} ({{ changeValue >= 0 ? '+' : '' }}{{ changePct.toFixed(2) }}%)</span>
        </div>
      </div>
    </div>

    <!-- Stats Grid -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
      <div v-for="stat in stats" :key="stat.label"
        class="rounded-2xl p-3 text-center border transition-all"
        :class="isDark ? 'bg-white/[0.03] border-white/5' : 'bg-slate-50/80 border-slate-100'"
      >
        <div class="flex items-center justify-center gap-1 mb-1.5">
          <span class="material-symbols-outlined text-sm opacity-40">{{ stat.icon }}</span>
          <span class="text-[9px] font-black uppercase tracking-widest opacity-40">{{ stat.label }}</span>
        </div>
        <p class="text-sm font-bold font-mono" :class="isDark ? 'text-gray-200' : 'text-slate-700'">
          {{ stat.value }}
        </p>
      </div>
    </div>
  </div>

  <!-- Loading skeleton -->
  <div v-else-if="loading" class="glass-panel rounded-2xl p-6 border animate-pulse"
    :class="isDark ? 'border-white/5' : 'border-slate-100'"
  >
    <div class="flex items-start justify-between mb-5">
      <div>
        <div class="h-8 w-24 rounded-lg mb-2" :class="isDark ? 'bg-white/10' : 'bg-slate-200'"></div>
        <div class="h-4 w-40 rounded-lg" :class="isDark ? 'bg-white/5' : 'bg-slate-100'"></div>
      </div>
      <div class="text-right">
        <div class="h-8 w-28 rounded-lg mb-2 ml-auto" :class="isDark ? 'bg-white/10' : 'bg-slate-200'"></div>
        <div class="h-4 w-20 rounded-lg ml-auto" :class="isDark ? 'bg-white/5' : 'bg-slate-100'"></div>
      </div>
    </div>
    <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
      <div v-for="i in 4" :key="i" class="h-16 rounded-xl" :class="isDark ? 'bg-white/5' : 'bg-slate-100'"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * Komponen overview saham — harga, perubahan, stats utama
 */
const props = defineProps<{
  symbol: string
  info: any
  loading: boolean
}>()

const { isDark } = useColorMode()
const logoError = ref(false)

// Reset logo error when symbol changes
watch(() => props.symbol, () => {
  logoError.value = false
})

// Normalize: data bisa dari Yahoo Finance atau RapidAPI IDX
const stockData = computed(() => {
  if (!props.info) return null
  // Yahoo Finance: data langsung, RapidAPI: mungkin nested di { data: {...} }
  return props.info?.data || props.info
})

// Ambil harga dari API field
const currentPrice = computed(() => {
  if (!stockData.value) return 0
  const d = stockData.value
  return d.price || d.close || d.lastPrice || d.last || 0
})

const changeValue = computed(() => {
  if (!stockData.value) return 0
  const d = stockData.value
  // API mengembalikan change sebagai string "-175.00"
  return parseFloat(d.change) || 0
})

const changePct = computed(() => {
  if (!stockData.value) return 0
  const d = stockData.value
  // Yahoo: changePercent, RapidAPI: percentage
  return parseFloat(d.changePercent) || parseFloat(d.percentage) || d.changePct || d.percent || 0
})

// Stats grid
const stats = computed(() => {
  if (!stockData.value) return []
  const d = stockData.value

  return [
    {
      label: 'Previous',
      icon: 'history',
      value: formatPrice(d.previousClose || d.previous || d.prevClose || 0),
    },
    {
      label: 'Volume',
      icon: 'bar_chart',
      value: formatVolume(d.volume || d.vol || 0),
    },
    {
      label: 'Sektor',
      icon: 'factory',
      value: d.sector || d.sub_sector || d.exchange || '-',
    },
    {
      label: d.source === 'yahoo' ? 'Source' : 'Status',
      icon: d.source === 'yahoo' ? 'public' : 'info',
      value: d.source === 'yahoo' ? 'Yahoo Finance' : (d.status || '-'),
    },
  ].filter(s => s.value !== '0' && s.value !== '-')
})

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

function formatMarketCap(n: number): string {
  if (!n) return '-'
  if (n >= 1_000_000_000_000) return 'Rp ' + (n / 1_000_000_000_000).toFixed(1) + 'T'
  if (n >= 1_000_000_000) return 'Rp ' + (n / 1_000_000_000).toFixed(1) + 'B'
  if (n >= 1_000_000) return 'Rp ' + (n / 1_000_000).toFixed(1) + 'M'
  return 'Rp ' + new Intl.NumberFormat('id-ID').format(n)
}
</script>

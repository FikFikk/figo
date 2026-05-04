<template>
  <div class="glass-panel rounded-2xl border overflow-hidden"
    :class="isDark ? 'border-white/5' : 'border-slate-100'"
  >
    <!-- Tabs -->
    <div class="flex items-center border-b"
      :class="isDark ? 'border-white/5' : 'border-slate-100'"
    >
      <button v-for="tab in tabs" :key="tab.type" @click="switchTab(tab.type)"
        class="flex-1 py-3.5 text-[11px] font-bold uppercase tracking-wider transition-all relative"
        :class="activeTab === tab.type
          ? (isDark ? 'text-primary' : 'text-primary')
          : (isDark ? 'text-gray-500 hover:text-gray-300' : 'text-slate-400 hover:text-slate-600')"
      >
        <span class="flex items-center justify-center gap-1.5">
          <span class="material-symbols-outlined text-sm">{{ tab.icon }}</span>
          {{ tab.label }}
        </span>
        <!-- Indikator aktif -->
        <div v-if="activeTab === tab.type"
          class="absolute bottom-0 left-1/4 right-1/4 h-0.5 bg-primary rounded-full"
        ></div>
      </button>
    </div>

    <!-- Content -->
    <div class="p-4">
      <!-- Unlocked State -->
      <div v-if="!isUnlocked && !movers.length && !loading" class="flex flex-col items-center justify-center py-6 text-center">
        <div class="w-12 h-12 rounded-2xl flex items-center justify-center mb-3" :class="isDark ? 'bg-white/5' : 'bg-slate-50'">
          <span class="material-symbols-outlined text-xl opacity-50">leaderboard</span>
        </div>
        <h4 class="font-bold text-sm mb-1" :class="isDark ? 'text-white' : 'text-slate-900'">Market Movers</h4>
        <p class="text-[10px] opacity-60 mb-4 max-w-[280px]">List of most active stocks (Top Gainers/Losers/Volume). Click to load details.</p>
        <button @click="handleUnlock" class="px-5 py-2 rounded-2xl text-xs font-bold transition-all" :class="isDark ? 'bg-primary/20 text-primary hover:bg-primary/30' : 'bg-primary text-white hover:bg-primary/90 shadow-sm'">
          Tampilkan Data
        </button>
      </div>

      <!-- Loading -->
      <div v-else-if="loading" class="space-y-2">
        <div v-for="i in 5" :key="i" class="h-12 rounded-xl animate-pulse"
          :class="isDark ? 'bg-white/5' : 'bg-slate-100'"></div>
      </div>

      <!-- Tabel Movers -->
      <div v-else-if="movers.length > 0" class="space-y-1.5">
        <div v-for="(stock, idx) in movers" :key="stock.symbol || idx"
          @click="$emit('selectStock', stock)"
          class="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all group"
          :class="isDark ? 'hover:bg-white/5' : 'hover:bg-slate-50'"
        >
          <!-- Ranking -->
          <span class="text-[10px] font-black w-5 text-center opacity-30">{{ Number(idx) + 1 }}</span>

          <!-- Stock Info -->
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2">
              <p class="font-headline font-bold text-sm"
                :class="isDark ? 'text-white' : 'text-slate-900'"
              >{{ stock.symbol }}</p>
              <p class="text-[10px] truncate max-w-[120px]"
                :class="isDark ? 'text-gray-600' : 'text-slate-400'"
              >{{ stock.name }}</p>
            </div>
          </div>

          <!-- Harga & Perubahan -->
          <div class="text-right flex-shrink-0 flex items-center gap-3">
            <p class="text-sm font-bold font-mono"
              :class="isDark ? 'text-gray-200' : 'text-slate-700'"
            >{{ formatPrice(stock.price) }}</p>

            <div class="min-w-[60px] text-right">
              <p class="text-[11px] font-bold px-2 py-0.5 rounded-md inline-block"
                :class="getChangeClass(stock)"
              >
                {{ getChangeText(stock) }}
              </p>
            </div>
          </div>

          <!-- Volume (opsional, hanya di tab volume) -->
          <div v-if="activeTab === 'volume'" class="text-right flex-shrink-0 min-w-[60px] hidden md:block">
            <p class="text-[10px] font-mono font-bold"
              :class="isDark ? 'text-gray-500' : 'text-slate-400'"
            >{{ formatVolume(stock.volume) }}</p>
          </div>
        </div>
      </div>

      <!-- Empty state -->
      <div v-else class="text-center py-8">
        <span class="material-symbols-outlined text-3xl opacity-15 mb-2 block">leaderboard</span>
        <p class="text-xs opacity-40">Data market movers tidak tersedia</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * Komponen market movers — top gainers, losers, dan volume
 * Dengan tabs dan interaksi klik untuk melihat detail saham
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
  { type: 'gainers', label: 'Top Gainers', icon: 'trending_up' },
  { type: 'losers', label: 'Top Losers', icon: 'trending_down' },
  { type: 'volume', label: 'Top Volume', icon: 'bar_chart' },
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

// Parse movers dari data API, normalize ke format seragam
const movers = computed(() => {
  if (!props.data) return []

  // Extract array dari berbagai format: { data: { data: { mover_list: [...] } } }
  let raw: any[] = []
  if (Array.isArray(props.data)) raw = props.data
  else if (props.data?.data?.data?.mover_list && Array.isArray(props.data.data.data.mover_list)) raw = props.data.data.data.mover_list
  else if (props.data?.data?.mover_list && Array.isArray(props.data.data.mover_list)) raw = props.data.data.mover_list
  else if (props.data?.data?.data && Array.isArray(props.data.data.data)) raw = props.data.data.data
  else if (props.data?.data && Array.isArray(props.data.data)) raw = props.data.data

  // Normalize setiap item ke format flat
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
  if (pct > 0) return 'bg-emerald-500/15 text-emerald-500'
  if (pct < 0) return 'bg-red-500/15 text-red-500'
  return isDark.value ? 'bg-white/5 text-gray-500' : 'bg-slate-100 text-slate-400'
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

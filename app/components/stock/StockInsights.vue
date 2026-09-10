<template>
  <div class="border rounded-xl overflow-hidden transition-all duration-200"
    :class="isDark ? 'bg-[#15171e] border-neutral-800' : 'bg-white border-neutral-300 shadow-sm'"
  >
    <!-- Header -->
    <div class="p-4 md:p-5 border-b flex items-center justify-between"
      :class="isDark ? 'border-neutral-800' : 'border-neutral-200'"
    >
      <div class="flex items-center gap-2">
        <span class="material-symbols-outlined text-base opacity-70">psychology</span>
        <h3 class="font-mono font-bold text-xs uppercase tracking-widest" :class="isDark ? 'text-white' : 'text-neutral-900'">
          AI FUNDAMENTAL INSIGHTS
        </h3>
      </div>
      <span class="px-2 py-0.5 text-[9px] font-mono font-bold uppercase tracking-widest border"
        :class="isDark ? 'bg-neutral-800 border-neutral-700 text-neutral-300' : 'bg-neutral-100 border-neutral-300 text-neutral-700'"
      >DEEP AUDIT</span>
    </div>

    <!-- Content Area -->
    <div class="p-5 font-mono">
      <!-- Unlocked State -->
      <div v-if="!isUnlocked && !insightData && !loading" class="flex flex-col items-center justify-center p-8 text-center min-h-[220px]">
        <div class="w-10 h-10 border rounded-xs flex items-center justify-center mb-3"
          :class="isDark ? 'bg-neutral-900 border-neutral-700 text-neutral-400' : 'bg-neutral-100 border-neutral-300 text-neutral-600'"
        >
          <span class="material-symbols-outlined text-lg">data_exploration</span>
        </div>
        <h4 class="font-mono font-bold text-xs uppercase tracking-wider mb-1" :class="isDark ? 'text-white' : 'text-neutral-900'">
          AI FUNDAMENTAL REPORT
        </h4>
        <p class="text-[11px] opacity-60 mb-4 max-w-[280px]">Buka hasil audit AI terhadap metrik valuasi, solvabilitas, dan efisiensi emiten.</p>
        <button @click="handleUnlock" 
          class="px-5 py-2 text-xs font-mono font-bold uppercase tracking-wider border rounded-xs transition-all cursor-pointer"
          :class="isDark 
            ? 'bg-white text-black border-white hover:bg-neutral-200' 
            : 'bg-neutral-900 text-white border-neutral-900 hover:bg-neutral-800'"
        >
          LOAD INSIGHTS
        </button>
      </div>

      <!-- Loading State -->
      <div v-else-if="loading" class="space-y-3">
        <div class="h-16 border rounded-xs animate-pulse" :class="isDark ? 'bg-neutral-900/40 border-neutral-800' : 'bg-neutral-100 border-neutral-200'"></div>
        <div class="grid grid-cols-2 gap-2">
          <div v-for="i in 4" :key="i" class="h-20 border rounded-xs animate-pulse" :class="isDark ? 'bg-neutral-900/40 border-neutral-800' : 'bg-neutral-100 border-neutral-200'"></div>
        </div>
      </div>

      <!-- Result State -->
      <div v-else-if="insightData && Object.keys(categories).length" class="space-y-6">
        
        <!-- Summary Stats Board (Swiss Modular Ledger) -->
        <div class="grid grid-cols-1 sm:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x border rounded-xs"
          :class="isDark ? 'bg-neutral-950 border-neutral-800 divide-neutral-800' : 'bg-neutral-50 border-neutral-200 divide-neutral-200'">
          <div class="p-3 sm:col-span-1">
            <span class="text-[9px] uppercase font-bold text-neutral-400 block mb-0.5">AUDIT SCOPE</span>
            <p class="text-sm font-black">{{ summary.totalInsights || 0 }} METRICS</p>
          </div>
          <div class="p-3 text-center">
            <span class="text-[9px] uppercase font-bold text-emerald-500 tracking-wider block mb-0.5">POSITIVE</span>
            <span class="font-mono font-black text-xl text-emerald-500 tabular-nums">{{ summary.good || 0 }}</span>
          </div>
          <div class="p-3 text-center">
            <span class="text-[9px] uppercase font-bold text-red-500 tracking-wider block mb-0.5">DEFICIT</span>
            <span class="font-mono font-black text-xl text-red-500 tabular-nums">{{ summary.bad || 0 }}</span>
          </div>
          <div class="p-3 text-center">
            <span class="text-[9px] uppercase font-bold text-neutral-400 tracking-wider block mb-0.5">NEUTRAL</span>
            <span class="font-mono font-black text-xl text-neutral-400 tabular-nums">{{ (summary.neutral || 0) + (summary.na || 0) }}</span>
          </div>
        </div>

        <!-- Categories List -->
        <div v-for="(categoryData, catName) in categories" :key="catName" class="space-y-2 mt-4">
          <!-- Header Kategori -->
          <div class="flex items-center gap-2 border-b pb-1.5" :class="isDark ? 'border-neutral-800' : 'border-neutral-200'">
             <span class="material-symbols-outlined text-[15px] text-primary">{{ getCategoryIcon(String(catName)) }}</span>
             <h4 class="font-mono font-bold text-xs uppercase tracking-wider" :class="isDark ? 'text-white' : 'text-neutral-900'">{{ translateCategory(String(catName)) }}</h4>
          </div>

          <!-- List Items -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
            <template v-for="(item, idx) in categoryData" :key="idx">
              <div v-if="(item.status || '').toUpperCase() !== 'NA'" 
                class="p-3.5 border rounded-xs flex gap-3 relative overflow-hidden transition-all"
                :class="isDark ? 'border-neutral-800 bg-neutral-950/60 hover:border-neutral-700' : 'border-neutral-200 bg-white hover:border-neutral-300'">
                
                <div class="absolute left-0 top-0 bottom-0 w-1" :class="getStatusBorder(item.status)"></div>
                
                <div class="flex-1 min-w-0 pl-1">
                   <div class="flex justify-between items-start gap-2 mb-1">
                     <h5 class="font-mono font-bold text-xs uppercase" :class="isDark ? 'text-white' : 'text-neutral-900'">{{ item.name }}</h5>
                     <span class="text-[8px] font-mono font-bold px-1.5 py-0.5 border rounded-xs uppercase"
                       :class="(item.status || '').toLowerCase() === 'good' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30' : (item.status || '').toLowerCase() === 'bad' ? 'bg-red-500/10 text-red-500 border-red-500/30' : 'bg-neutral-800 text-neutral-400 border-neutral-700'"
                     >[ {{ (item.status || 'NEUTRAL').toUpperCase() }} ]</span>
                   </div>
                   <p class="text-[11px] opacity-75 mb-2 leading-relaxed font-sans" :class="isDark ? 'text-neutral-300' : 'text-neutral-600'">{{ item.shortStatement }}</p>
                   
                   <div class="flex items-center gap-2 text-[9px] font-mono" v-if="item.value !== undefined && item.benchmark !== undefined">
                      <span class="px-2 py-0.5 border rounded-xs" :class="isDark ? 'bg-neutral-900 border-neutral-800 text-neutral-300' : 'bg-neutral-50 border-neutral-200 text-neutral-700'">
                        VAL: {{ typeof item.value === 'number' ? Number(item.value).toFixed(2) : item.value }}
                      </span>
                      <span class="px-2 py-0.5 border rounded-xs opacity-60" :class="isDark ? 'border-neutral-800' : 'border-neutral-200'">
                        BENCH: {{ typeof item.benchmark === 'number' ? Number(item.benchmark).toFixed(2) : item.benchmark }}
                      </span>
                   </div>
                </div>
              </div>
            </template>
          </div>
        </div>
      </div>

      <!-- Fallback / Empty State Saat Data Gagal atau Tidak Tersedia -->
      <div v-else class="flex flex-col items-center justify-center p-8 text-center min-h-[200px]">
        <div class="w-10 h-10 border rounded-xs flex items-center justify-center mb-3"
          :class="isDark ? 'bg-neutral-900 border-neutral-700 text-neutral-400' : 'bg-neutral-100 border-neutral-300 text-neutral-600'"
        >
          <span class="material-symbols-outlined text-lg">info</span>
        </div>
        <h4 class="font-mono font-bold text-xs uppercase tracking-wider mb-1" :class="isDark ? 'text-white' : 'text-neutral-900'">
          AUDIT FUNDAMENTAL BELUM TERSEDIA
        </h4>
        <p class="text-[11px] opacity-60 mb-4 max-w-[340px]">
          Data audit emiten ini tidak ditemukan di sumber saat ini, atau server sedang standby menunggu koneksi Live AI Router.
        </p>
        <button @click="emit('fetch')" 
          class="px-4 py-2 text-xs font-mono font-bold uppercase tracking-wider border rounded-xs transition-all cursor-pointer"
          :class="isDark 
            ? 'bg-neutral-900 text-white border-neutral-700 hover:border-neutral-500' 
            : 'bg-neutral-100 text-neutral-900 border-neutral-300 hover:border-neutral-400'"
        >
          COBA RE-FETCH
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * Komponen AI Insights saham dari RapidAPI IDX beta / AI Router
 */
const props = defineProps<{
  data: any
  loading: boolean
}>()

const emit = defineEmits<{
  fetch: []
}>()

const { isDark } = useColorMode()
const isUnlocked = ref(false)

function handleUnlock() {
  isUnlocked.value = true
  emit('fetch')
}

// Normalisasi Data (Keluarkan properti yang dalam jika dibungkus berlapis)
const insightData = computed(() => {
  if (!props.data) return null
  
  // Format 1: Response RapidAPI dengan format categories object
  if (props.data?.data?.data?.categories) return props.data.data.data
  if (props.data?.data?.categories) return props.data.data
  if (props.data?.categories) return props.data

  // Format 2: Flat list insights
  const rawList = props.data?.data?.data?.insights || props.data?.data?.insights || props.data?.insights
  if (Array.isArray(rawList) && rawList.length) {
    const cats: Record<string, any[]> = {}
    let good = 0, bad = 0, neutral = 0, na = 0
    for (const item of rawList) {
      const cat = item.category || 'General'
      if (!cats[cat]) cats[cat] = []
      const st = (item.details?.evaluationStatus || item.status || 'NA').toLowerCase()
      if (st === 'good') good++
      else if (st === 'bad') bad++
      else if (st === 'neutral') neutral++
      else na++

      cats[cat].push({
        name: item.insightName || item.name || 'Metrik Finansial',
        shortStatement: item.shortInsightStatement || item.shortStatement || item.insightStatement || item.statement || '-',
        status: st,
        value: item.details?.propertyValue ?? item.value,
        benchmark: item.details?.benchmarkValue ?? item.benchmark,
      })
    }
    return {
      summary: {
        totalInsights: rawList.length,
        good,
        bad,
        neutral,
        na,
      },
      categories: cats,
    }
  }
  
  return null
})

const summary = computed(() => {
  return insightData.value?.summary || {}
})

const categories = computed(() => {
  return insightData.value?.categories || {}
})

// Utilities
function formatNumber(num: number | undefined): string {
  if (num === undefined || num === null) return '-'
  
  const absNum = Math.abs(num)
  if (absNum > 1_000_000_000_000) {
    return (num / 1_000_000_000_000).toFixed(2) + 'T'
  }
  if (absNum > 1_000_000_000) {
    return (num / 1_000_000_000).toFixed(2) + 'B'
  }
  if (absNum > 1_000_000) {
    return (num / 1_000_000).toFixed(2) + 'M'
  }
  
  // Deteksi persen jika nilai aslinya sangat kecil & kriteria relevan (tapi num sendiri misal 0.04)
  // Untuk amannya, cukup format dengan Intl
  return new Intl.NumberFormat('id-ID', { maximumFractionDigits: 2 }).format(num)
}

function getStatusBorder(status: string) {
  if (status === 'good') return 'bg-emerald-500'
  if (status === 'bad') return 'bg-red-500'
  return 'bg-gray-400'
}

function getStatusBg(status: string) {
  if (status === 'good') return isDark.value ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-100 text-emerald-600'
  if (status === 'bad') return isDark.value ? 'bg-red-500/20 text-red-400' : 'bg-red-100 text-red-600'
  return isDark.value ? 'bg-gray-500/20 text-gray-400' : 'bg-gray-100 text-gray-600'
}

function getStatusIcon(status: string) {
  if (status === 'good') return 'check_circle'
  if (status === 'bad') return 'error'
  return 'info'
}

function getCategoryIcon(catName: string) {
  const icons: Record<string, string> = {
    'Valuation': 'account_balance_wallet',
    'Earnings': 'payments',
    'Growth': 'trending_up',
    'Performance': 'speed',
    'Health': 'health_and_safety',
  }
  return icons[catName] || 'insights'
}

function translateCategory(catName: string) {
  const idTranslate: Record<string, string> = {
    'Valuation': 'Valuasi & Harga',
    'Earnings': 'Laba & Pendapatan',
    'Growth': 'Proyeksi Pertumbuhan',
    'Performance': 'Kinerja Historis',
    'Health': 'Kesehatan Finansial',
  }
  return idTranslate[catName] || catName
}
</script>

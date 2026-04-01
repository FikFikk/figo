<template>
  <div class="glass-panel border rounded-2xl overflow-hidden"
    :class="isDark ? 'border-white/5' : 'border-slate-100'"
  >
    <!-- Header -->
    <div class="px-5 py-4 flex items-center gap-3 border-b"
      :class="isDark ? 'border-white/5' : 'border-slate-100'"
    >
      <div class="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0"
        :class="isDark ? 'bg-indigo-500/20 text-indigo-400' : 'bg-indigo-50 text-indigo-600'"
      >
        <span class="material-symbols-outlined text-xl">psychology</span>
      </div>
      <div>
        <h3 class="font-headline font-bold text-lg leading-tight" :class="isDark ? 'text-white' : 'text-slate-900'">AI Insights</h3>
        <p class="text-[10px] opacity-60">Analisa valuasi, kesehatan finansial, hingga prediksi performa.</p>
      </div>
    </div>

    <!-- Content Area -->
    <div class="p-5">
      <!-- Unlocked State -->
      <div v-if="!isUnlocked && !insightData && !loading" class="flex flex-col items-center justify-center py-6 text-center">
        <div class="w-12 h-12 rounded-2xl flex items-center justify-center mb-3" :class="isDark ? 'bg-white/5' : 'bg-slate-50'">
          <span class="material-symbols-outlined text-xl opacity-50">data_exploration</span>
        </div>
        <h4 class="font-bold text-sm mb-1" :class="isDark ? 'text-white' : 'text-slate-900'">Insights Mendetail</h4>
        <p class="text-[10px] opacity-60 mb-4 max-w-[280px]">Buka hasil ekstraksi robot AI terhadap kondisi fundamental emiten.</p>
        <button @click="handleUnlock" class="px-5 py-2 rounded-2xl text-xs font-bold transition-all"
          :class="isDark ? 'bg-primary/20 text-primary hover:bg-primary/30' : 'bg-primary text-white hover:bg-primary/90 shadow-sm'"
        >
          Tampilkan Data
        </button>
      </div>

      <!-- Loading State -->
      <div v-else-if="loading" class="space-y-4">
        <div class="h-20 rounded-2xl animate-pulse" :class="isDark ? 'bg-white/5' : 'bg-slate-100'"></div>
        <div class="grid grid-cols-2 gap-3">
          <div v-for="i in 4" :key="i" class="h-24 rounded-2xl animate-pulse" :class="isDark ? 'bg-white/5' : 'bg-slate-100'"></div>
        </div>
      </div>

      <!-- Result State -->
      <div v-else-if="insightData" class="space-y-6">
        
        <!-- Summary Stats Board -->
        <div class="flex flex-col md:flex-row gap-4 items-center justify-between p-4 rounded-2xl border"
          :class="isDark ? 'bg-black/20 border-white/5' : 'bg-slate-50 border-slate-100'">
          <div>
            <h4 class="font-headline font-bold text-lg">Skor Fundamental</h4>
            <p class="text-[10px] opacity-60 mt-0.5">Total observasi: {{ summary.totalInsights || 0 }} insight.</p>
          </div>
          <div class="flex items-center gap-3">
             <div class="flex flex-col items-center justify-center p-2 px-4 rounded-2xl" :class="isDark ? 'bg-emerald-500/10' : 'bg-emerald-50'">
               <span class="text-[10px] uppercase font-bold text-emerald-500 tracking-wider">Good</span>
               <span class="font-mono font-black text-xl text-emerald-500">{{ summary.good || 0 }}</span>
             </div>
             <div class="flex flex-col items-center justify-center p-2 px-4 rounded-2xl" :class="isDark ? 'bg-red-500/10' : 'bg-red-50'">
               <span class="text-[10px] uppercase font-bold text-red-500 tracking-wider">Bad</span>
               <span class="font-mono font-black text-xl text-red-500">{{ summary.bad || 0 }}</span>
             </div>
             <div class="flex flex-col items-center justify-center p-2 px-4 rounded-2xl" :class="isDark ? 'bg-gray-500/10' : 'bg-slate-100'">
               <span class="text-[10px] uppercase font-bold text-gray-500 tracking-wider">Neutral</span>
               <span class="font-mono font-black text-xl text-gray-500">{{ (summary.neutral || 0) + (summary.na || 0) }}</span>
             </div>
          </div>
        </div>

        <!-- Categories List -->
        <div v-for="(categoryData, catName) in categories" :key="catName" class="space-y-3 mt-4">
          <!-- Header Kategori -->
          <div class="flex items-center gap-2 border-b pb-2" :class="isDark ? 'border-white/10' : 'border-slate-200'">
             <span class="material-symbols-outlined text-[16px] text-primary">{{ getCategoryIcon(String(catName)) }}</span>
             <h4 class="font-bold text-sm uppercase tracking-wider" :class="isDark ? 'text-white' : 'text-slate-800'">{{ translateCategory(String(catName)) }}</h4>
          </div>

          <!-- List Items -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
            <template v-for="(item, idx) in categoryData" :key="idx">
              <div v-if="item.status !== 'NA'" 
                class="p-4 rounded-2xl border flex gap-3 relative overflow-hidden transition-all hover:-translate-y-0.5"
                :class="isDark ? 'border-white/5 bg-[#1a1d28]/60 hover:border-white/20' : 'border-slate-100 bg-white hover:shadow-md'">
                
                <!-- Indikator warna kiri -->
                <div class="absolute left-0 top-0 bottom-0 w-1" :class="getStatusBorder(item.status)"></div>
                
                <div class="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                  :class="getStatusBg(item.status)">
                  <span class="material-symbols-outlined text-[16px]">{{ getStatusIcon(item.status) }}</span>
                </div>
                
                <div class="flex-1 min-w-0 pr-1">
                   <div class="flex justify-between items-start gap-2 mb-1">
                     <h5 class="font-bold text-xs" :class="isDark ? 'text-gray-200' : 'text-slate-800'">{{ item.name }}</h5>
                   </div>
                   <p class="text-[11px] opacity-75 mb-2 leading-relaxed" :class="isDark ? 'text-gray-300' : 'text-slate-600'">{{ item.shortStatement }}</p>
                   
                   <div class="flex items-center gap-2 text-[10px]" v-if="item.value !== undefined && item.benchmark !== undefined">
                      <div class="px-2 py-0.5 rounded bg-black/5 dark:bg-white/5 border dark:border-white/5">
                        <span class="opacity-50">Emiten:</span> <strong class="font-mono mx-1">{{ formatNumber(item.value) }}</strong>
                      </div>
                      <div class="px-2 py-0.5 rounded bg-black/5 dark:bg-white/5 border dark:border-white/5">
                        <span class="opacity-50">Benchmark:</span> <strong class="font-mono mx-1">{{ formatNumber(item.benchmark) }}</strong>
                      </div>
                   </div>
                </div>
              </div>
            </template>
          </div>
        </div>

      </div>

      <!-- Empty State -->
      <div v-else class="text-center py-10 opacity-50">
        <span class="material-symbols-outlined text-4xl mb-3 opacity-20 block">folder_off</span>
        <p class="text-sm font-bold">Tidak ada insight tersedia</p>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * Komponen AI Insights saham dari RapidAPI IDX beta
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
  
  // JSON RapidAPI sering membungkus response di { data: { message: "...", data: { categories: ... } } }
  if (props.data?.data?.data?.categories) return props.data.data.data
  // Fallback ke 1 level
  if (props.data?.data?.categories) return props.data.data
  // Fallback ke root level
  if (props.data?.categories) return props.data
  
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

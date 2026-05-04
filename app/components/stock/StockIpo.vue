<template>
  <div class="glass-panel rounded-2xl border overflow-hidden"
    :class="isDark ? 'border-white/5' : 'border-slate-100'"
  >
    <!-- Toggle Header -->
    <button @click="isOpen = !isOpen"
      class="w-full flex items-center justify-between p-5 text-left transition-colors"
      :class="isDark ? 'hover:bg-white/5' : 'hover:bg-slate-50'"
    >
      <div class="flex items-center gap-2">
        <span class="material-symbols-outlined text-lg text-primary">rocket_launch</span>
        <h2 class="font-headline font-bold text-lg" :class="isDark ? 'text-white' : 'text-slate-900'">Momentum IPO</h2>
      </div>
      <span class="material-symbols-outlined text-lg transition-transform duration-300"
        :class="isOpen ? 'rotate-180' : ''" style="opacity: 0.4">expand_more</span>
    </button>
    
    <div v-show="isOpen" class="px-5 pb-5">
      <!-- Unlocked State -->
      <div v-if="!isFetched && !loading" class="flex flex-col items-center justify-center py-6 text-center border-t"
        :class="isDark ? 'border-white/5' : 'border-slate-100'">
        <div class="w-12 h-12 rounded-2xl flex items-center justify-center mb-3" :class="isDark ? 'bg-white/5' : 'bg-slate-50'">
          <span class="material-symbols-outlined text-xl opacity-50">rocket_launch</span>
        </div>
        <h4 class="font-bold text-sm mb-1" :class="isDark ? 'text-white' : 'text-slate-900'">Pantau IPO Terbaru</h4>
        <p class="text-[10px] opacity-60 mb-4 max-w-[280px]">Sentiment analysis, momentum, and trading strategies for upcoming IPOs.</p>
        <button @click="handleFetch" class="px-5 py-2 rounded-2xl text-xs font-bold transition-all"
          :class="isDark ? 'bg-primary/20 text-primary hover:bg-primary/30' : 'bg-primary text-white hover:bg-primary/90 shadow-sm'">
          Tampilkan Data
        </button>
      </div>

      <!-- Loading -->
      <div v-else-if="loading" class="space-y-4 py-4 border-t" :class="isDark ? 'border-white/5' : 'border-slate-100'">
        <div v-for="i in 2" :key="i" class="h-40 rounded-xl animate-pulse" :class="isDark ? 'bg-white/5' : 'bg-slate-100'"></div>
      </div>

      <!-- Result/Data -->
      <div v-else-if="ipoData" class="space-y-5 py-4 border-t" :class="isDark ? 'border-white/5' : 'border-slate-100'">
        <!-- Summary Alert -->
        <div class="p-4 rounded-2xl flex items-center justify-between border"
          :class="isDark ? 'bg-primary/10 border-primary/20' : 'bg-blue-50 border-blue-100'">
          <div class="flex items-center gap-3">
             <span class="material-symbols-outlined text-primary text-2xl">monitoring</span>
             <div>
               <p class="text-[10px] font-bold uppercase tracking-wider text-primary">Sentimen Pasar IPO</p>
               <p class="font-headline font-black text-lg" :class="isDark ? 'text-white' : 'text-slate-900'">{{ ipoData.market_sentiment || 'UNKNOWN' }}</p>
             </div>
          </div>
          <div class="text-right">
             <p class="text-[10px] opacity-60">Total IPO Terjadwal</p>
             <p class="font-bold text-lg font-mono" :class="isDark ? 'text-white' : 'text-slate-900'">{{ ipoData.summary?.total_upcoming || 0 }}</p>
          </div>
        </div>

        <!-- Upcoming IPOs List -->
        <div v-if="ipoData.upcoming_ipos && ipoData.upcoming_ipos.length > 0" class="space-y-3">
          <p class="text-xs font-bold px-1" :class="isDark ? 'text-gray-400' : 'text-slate-500'">Masa Penawaran & Mendatang</p>
          
          <div v-for="ipo in ipoData.upcoming_ipos" :key="ipo.symbol"
            class="p-5 rounded-2xl border flex flex-col gap-4 relative overflow-hidden"
            :class="isDark ? 'border-white/10 bg-[#1a1d28]/50' : 'border-slate-200 bg-white shadow-sm'">
            
            <div class="absolute top-0 right-0 px-3 py-1 text-[9px] font-black tracking-wider uppercase rounded-bl-xl"
              :class="isDark ? 'bg-white/10 text-white' : 'bg-slate-100 text-slate-600'">
              {{ ipo.status }}
            </div>

            <!-- Header Emiten -->
            <div class="flex items-start justify-between mt-2">
              <div class="pr-24">
                <div class="flex items-center gap-2 mb-1">
                  <h3 class="font-headline font-black text-2xl tracking-tight" :class="isDark ? 'text-white' : 'text-slate-900'">{{ ipo.symbol }}</h3>
                  <span class="px-2 py-0.5 text-[10px] font-bold rounded-md" :class="getScoreClass(ipo.momentum_score)">
                    Score: {{ ipo.momentum_score }}/10
                  </span>
                </div>
                <p class="text-xs font-medium opacity-70">{{ ipo.name }}</p>
                <div class="flex items-center gap-3 mt-1.5 text-[10px] opacity-60">
                  <span>Shares Offered <span v-if="ipo.indicators?.offering_size">({{ ipo.indicators?.offering_size }})</span>: <b :class="isDark ? 'text-white' : 'text-slate-800'">{{ ipo.shares_offered }}</b></span>
                  <span>Total Value: <b :class="isDark ? 'text-white' : 'text-slate-800'">Rp {{ ipo.total_value }}</b></span>
                </div>
              </div>
              <div class="text-right flex-shrink-0">
                <p class="text-[10px] opacity-60 mb-0.5">Harga Penawaran</p>
                <p class="font-mono font-bold text-lg" :class="isDark ? 'text-white' : 'text-slate-900'">
                  {{ formatPrice(ipo.ipo_price) }}
                </p>
              </div>
            </div>

            <!-- Detail Grid Info Utama -->
            <div class="grid grid-cols-2 md:grid-cols-5 gap-3 text-[10px] p-3 rounded-2xl border"
              :class="isDark ? 'bg-black/20 border-white/5' : 'bg-slate-50 border-slate-100'">
              <div>
                <span class="opacity-50 block mb-0.5">Masa Penawaran</span>
                <strong :class="isDark ? 'text-white' : 'text-slate-800'">
                  {{ formatDateShort(ipo.offering_period?.start) }} - {{ formatDateShort(ipo.offering_period?.end) }}
                </strong>
              </div>
              <div>
                <span class="opacity-50 block mb-0.5">Tgl Listing</span>
                <strong :class="isDark ? 'text-white' : 'text-slate-800'">{{ formatDate(ipo.listing_date) }}</strong>
              </div>
              <div>
                <span class="opacity-50 block mb-0.5">Kondisi Pasar</span>
                <strong :class="isDark ? 'text-white' : 'text-slate-800'">{{ ipo.indicators?.market_condition }}</strong>
              </div>
              <div>
                <span class="opacity-50 block mb-0.5">Sektor</span>
                <strong :class="isDark ? 'text-white' : 'text-slate-800'">{{ ipo.indicators?.sector_momentum }}</strong>
              </div>
              <div>
                <span class="opacity-50 block mb-0.5">Daya Tarik Harga</span>
                <strong :class="isDark ? 'text-white' : 'text-slate-800'">{{ ipo.indicators?.price_attractiveness }}</strong>
              </div>
            </div>

            <!-- Prediction / Analysis -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <!-- Prediction details -->
              <div class="space-y-2 text-[11px] rounded-2xl border p-3 flex flex-col justify-center"
                :class="isDark ? 'border-white/5 bg-white/5' : 'border-slate-100 bg-slate-50'">
                 <p class="font-bold border-b pb-1.5 mb-2" :class="isDark ? 'border-white/10' : 'border-slate-200'">Prediksi Performa</p>
                 <div class="flex items-center justify-between">
                   <span class="opacity-60">Potensi Gain (Hari 1):</span>
                   <span class="font-bold text-emerald-500">{{ ipo.prediction?.first_day_return }}</span>
                 </div>
                 <div class="flex items-center justify-between">
                   <span class="opacity-60">Potensi Gain (Minggu 1):</span>
                   <span class="font-bold text-emerald-500">{{ ipo.prediction?.first_week_return }}</span>
                 </div>
                 <div class="flex items-center justify-between">
                   <span class="opacity-60">Probabilitas Win:</span>
                   <span class="font-bold" :class="isDark ? 'text-white' : 'text-slate-800'">{{ ipo.prediction?.probability }}%</span>
                 </div>
                 <div class="flex items-center justify-between">
                   <span class="opacity-60">Tingkat Risiko (Risk):</span>
                   <span class="font-bold px-2 py-0.5 rounded text-[9px]" :class="getRiskClass(ipo.prediction?.risk_level)">{{ ipo.prediction?.risk_level }}</span>
                 </div>
              </div>

              <!-- Strategi IPO -->
              <div class="rounded-2xl border p-3 flex flex-col justify-between"
                :class="isDark ? 'border-primary/20 bg-primary/5' : 'border-primary/20 bg-primary/5'">
                 <div class="flex items-start gap-2 mb-2">
                   <span class="material-symbols-outlined text-[16px] mt-0.5" :class="getActionColorClass(ipo.strategy?.action)">lightbulb</span>
                   <div class="w-full">
                     <p class="text-[11px] font-bold uppercase tracking-wider" :class="getActionColorClass(ipo.strategy?.action)">
                       Rekomendasi: {{ (ipo.strategy?.action || '').replace('_', ' ') }}
                     </p>
                     <ul class="list-disc pl-3 mt-1.5 space-y-1">
                       <li v-for="(reason, idx) in ipo.strategy?.reasoning" :key="idx" class="text-[10px] opacity-70">
                         {{ reason }}
                       </li>
                     </ul>
                   </div>
                 </div>
                 <div class="flex flex-wrap items-center gap-2 mt-2">
                   <div class="px-2 py-1 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                     Target: {{ formatPrice(ipo.strategy?.exit_target) }}
                   </div>
                   <div class="px-2 py-1 rounded text-[10px] font-bold bg-red-500/10 text-red-600 border border-red-500/20">
                     SL: {{ formatPrice(ipo.strategy?.stop_loss) }}
                   </div>
                   <div class="px-2 py-1 rounded text-[10px] font-bold border opacity-70" :class="isDark ? 'border-white/20' : 'border-slate-300'">
                     Hold: {{ ipo.strategy?.hold_period }}
                   </div>
                 </div>
              </div>
            </div>
            
            <!-- Daftar Underwriter -->
            <div class="mt-3 text-[10px] opacity-60 flex items-start gap-1.5">
              <span class="material-symbols-outlined text-[14px]">account_balance</span>
              <div>
                <span class="font-bold">Underwriters<span v-if="ipo.indicators?.underwriter_quality"> ({{ ipo.indicators.underwriter_quality }})</span>:</span> 
                {{ ipo.underwriters?.join(' • ') }}
              </div>
            </div>

          </div>
        </div>
        
        <div v-else class="text-center py-6 opacity-50">
           <span class="material-symbols-outlined text-3xl mb-2 opacity-30">event_busy</span>
           <p class="text-xs">Tidak ada jadwal IPO yang sedang offering dalam waktu dekat.</p>
        </div>

        <!-- Glosarium / Kamus Mini -->
        <div class="mt-2 p-4 rounded-2xl border flex flex-col gap-3" :class="isDark ? 'border-white/10 bg-[#1a1d28]/30' : 'border-slate-200 bg-slate-50'">
          <div class="flex items-center gap-2 mb-1">
            <span class="material-symbols-outlined text-sm text-primary">menu_book</span>
            <h4 class="font-bold text-xs" :class="isDark ? 'text-white' : 'text-slate-800'">Kamus Indikator IPO</h4>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-[10px] opacity-80" :class="isDark ? 'text-gray-400' : 'text-slate-600'">
            <div>
              <strong :class="isDark ? 'text-gray-300' : 'text-slate-700'">Kondisi Pasar (Market Condition)</strong>
              <ul class="list-disc pl-4 mt-1 space-y-1">
                <li><b :class="isDark ? 'text-emerald-400' : 'text-emerald-600'">BULLISH:</b> Tren pasar sedang naik / optimis.</li>
                <li><b :class="isDark ? 'text-red-400' : 'text-red-600'">BEARISH:</b> Tren pasar sedang turun / lesu.</li>
                <li><b :class="isDark ? 'text-amber-400' : 'text-amber-600'">NEUTRAL:</b> Pasar cenderung datar / stagnan.</li>
              </ul>
            </div>
            <div>
              <strong :class="isDark ? 'text-gray-300' : 'text-slate-700'">Daya Tarik Harga (Price)</strong>
              <ul class="list-disc pl-4 mt-1 space-y-1">
                <li><b :class="isDark ? 'text-emerald-400' : 'text-emerald-600'">ATTRACTIVE:</b> Penawaran harga IPO relatif murah/menarik dibanding peers.</li>
                <li><b :class="isDark ? 'text-amber-400' : 'text-amber-600'">FAIR:</b> Valuasi berada di kisaran wajar.</li>
                <li><b :class="isDark ? 'text-red-400' : 'text-red-600'">EXPENSIVE:</b> Valuasi harga penawaran tergolong mahal.</li>
              </ul>
            </div>
            <div>
              <strong :class="isDark ? 'text-gray-300' : 'text-slate-700'">Momentum Sektor</strong>
              <ul class="list-disc pl-4 mt-1 space-y-1">
                <li><b :class="isDark ? 'text-emerald-400' : 'text-emerald-600'">STRONG:</b> Sektor bisnis emiten sedang diminati / naik daun.</li>
                <li><b :class="isDark ? 'text-amber-400' : 'text-amber-600'">AVERAGE:</b> Minat terhadap sektor bisnis emiten bersifat moderat.</li>
                <li><b :class="isDark ? 'text-red-400' : 'text-red-600'">WEAK:</b> Sektor bisnis emiten sedang kurang menguntungkan.</li>
              </ul>
            </div>
            <div>
              <strong :class="isDark ? 'text-gray-300' : 'text-slate-700'">Kualitas Underwriter</strong>
              <ul class="list-disc pl-4 mt-1 space-y-1">
                <li><b :class="isDark ? 'text-primary' : 'text-primary'">TIER_1:</b> Sekuritas penjamin memiliki rekam jejak sangat kuat / mengamankan harga IPO.</li>
                <li><b :class="isDark ? 'text-blue-400' : 'text-blue-600'">TIER_2:</b> Reputasi baik, skala menengah.</li>
                <li><b :class="isDark ? 'text-gray-400' : 'text-slate-500'">TIER_3:</b> Rekam jejak biasa saja atau rawan fluktuasi berat di hari pertama.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * Komponen IPO Momentum
 * Menggunakan RapidAPI endpoint /api/analysis/sentiment/ipo/momentum
 */
const { isDark } = useColorMode()

const ipoData = ref<any>(null)
const loading = ref(false)
const isFetched = ref(false)
const isOpen = ref(false)

async function handleFetch() {
  if (isFetched.value && ipoData.value) return
  
  isFetched.value = true
  loading.value = true
  try {
    const data = await $fetch<any>('/api/stock/ipo')
    // Extract format response: { success: true, data: { analysis_date, upcoming_ipos } }
    if (data?.data?.upcoming_ipos || data?.data?.summary) {
      ipoData.value = data.data
    } else if (data?.upcoming_ipos) {
      ipoData.value = data
    } else if (data?.data?.data?.upcoming_ipos) {
      ipoData.value = data.data.data
    }
  } catch(e) {
    console.error('Gagal fetch data IPO:', e)
    // Fallback error state if needed
  } finally {
    loading.value = false
  }
}

function formatPrice(price: number | string | undefined) {
  if (!price) return '-'
  return new Intl.NumberFormat('id-ID').format(Number(price))
}

function formatDate(dateStr: string | undefined) {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
}

function formatDateShort(dateStr: string | undefined) {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
}

function getScoreClass(score: number | undefined) {
  if (!score) return 'bg-gray-500/20 text-gray-500'
  if (score >= 8) return 'bg-emerald-500/20 text-emerald-500'
  if (score >= 5) return 'bg-amber-500/20 text-amber-500'
  return 'bg-red-500/20 text-red-500'
}

function getRiskClass(level: string | undefined) {
  if (level === 'LOW') return isDark.value ? 'bg-emerald-500/20 text-emerald-500' : 'bg-emerald-100 text-emerald-700'
  if (level === 'MEDIUM') return isDark.value ? 'bg-amber-500/20 text-amber-500' : 'bg-amber-100 text-amber-700'
  if (level === 'HIGH') return isDark.value ? 'bg-red-500/20 text-red-500' : 'bg-red-100 text-red-700'
  return 'bg-gray-500/20 text-gray-500'
}

function getActionColorClass(action: string | undefined) {
  if (!action) return 'text-gray-500'
  if (action.includes('APPLY') || action.includes('BUY')) return 'text-emerald-500'
  if (action.includes('AVOID') || action.includes('SELL')) return 'text-red-500'
  return 'text-amber-500'
}
</script>

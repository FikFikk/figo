<template>
  <div class="glass-panel rounded-2xl border p-5" :class="isDark ? 'border-white/5' : 'border-slate-100'">
    <!-- Header -->
    <div class="flex items-center justify-between mb-4">
      <div class="flex items-center gap-2">
        <div class="w-8 h-8 rounded-full flex items-center justify-center" :class="isDark ? 'bg-primary/20' : 'bg-blue-50'">
          <span class="material-symbols-outlined text-sm text-primary">model_training</span>
        </div>
        <h3 class="font-headline font-bold text-sm" :class="isDark ? 'text-white' : 'text-slate-900'">
          Smart Trading Plan
        </h3>
      </div>
      <span class="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md"
        :class="isDark ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' : 'bg-purple-50 text-purple-600 border border-purple-100'">
        AI Powered
      </span>
    </div>

    <!-- Empty State -->
    <div v-if="!data?.length && !loading" class="flex flex-col items-center justify-center py-10 text-center">
      <div class="w-12 h-12 rounded-2xl flex items-center justify-center mb-3" :class="isDark ? 'bg-white/5' : 'bg-slate-50'">
        <span class="material-symbols-outlined text-xl opacity-30">show_chart</span>
      </div>
      <p class="text-[10px] opacity-50 mb-3 max-w-[200px]">Tampilkan Chart terlebih dahulu untuk memuat data kalkulasi AI.</p>
    </div>

    <!-- Locked State -->
    <div v-else-if="!isAnalyzed" class="flex flex-col items-center justify-center py-6 text-center">
      <div class="w-12 h-12 rounded-2xl flex items-center justify-center mb-3" :class="isDark ? 'bg-purple-500/10 text-purple-500' : 'bg-purple-50 flex text-purple-600'">
        <span class="material-symbols-outlined text-xl">smart_toy</span>
      </div>
      <h4 class="font-bold text-sm mb-1" :class="isDark ? 'text-white' : 'text-slate-900'">AI Trading Plan</h4>
      <p class="text-[10px] opacity-60 mb-4 max-w-[260px]">Kalkulasi otomatis Support, Resistance, dan Tren menggunakan metodologi Price Action.</p>
      <button @click="analyzeData" class="px-5 py-2 rounded-2xl text-xs font-bold transition-all" :class="isDark ? 'bg-primary/20 text-primary hover:bg-primary/30' : 'bg-primary text-white hover:bg-primary/90 shadow-sm'">
        Jalankan Kalkulasi
      </button>
    </div>

    <!-- Loading -->
    <div v-else-if="loading || isAnalyzing" class="animate-pulse space-y-3 py-2">
      <div class="h-16 rounded-2xl" :class="isDark ? 'bg-white/5' : 'bg-slate-100'"></div>
      <div class="h-16 rounded-2xl" :class="isDark ? 'bg-white/5' : 'bg-slate-100'"></div>
    </div>

    <!-- Content -->
    <div v-else-if="plan" class="space-y-4">
      <!-- Method & Trend Base -->
      <div class="p-3.5 rounded-2xl border flex flex-col gap-2" :class="isDark ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-200'">
        <div class="flex justify-between items-start gap-2">
          <div>
            <p class="text-[9px] font-bold opacity-50 uppercase tracking-widest mb-0.5">Analisa Tren & Metodologi</p>
            <p class="text-xs font-bold font-headline text-primary leading-tight">{{ plan.method }}</p>
          </div>
          <span class="material-symbols-outlined text-lg opacity-40">menu_book</span>
        </div>
        <p class="text-[10.5px] opacity-80 leading-relaxed">{{ plan.trendAnalysis }}</p>
      </div>

      <!-- Actionable Plan (Buy, Target, SL) -->
      <div class="grid grid-cols-2 gap-3">
        <!-- Area Beli -->
        <div class="p-3.5 rounded-2xl flex flex-col justify-between"
          :class="isDark ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-emerald-50 border border-emerald-200'"
        >
          <div>
            <p class="text-[9px] font-bold text-emerald-600 uppercase tracking-wider mb-1 flex items-center gap-1">
              <span class="material-symbols-outlined text-[12px]">shopping_cart_checkout</span> Buy Zone
            </p>
            <p class="text-sm font-black font-mono text-emerald-700 dark:text-emerald-400">
              {{ formatPrice(plan.buyZone[0]) }} - {{ formatPrice(plan.buyZone[1]) }}
            </p>
          </div>
          <p class="text-[9.5px] font-bold text-emerald-600/80 mt-2">{{ plan.buyAction }}</p>
        </div>

        <!-- TP & SL -->
        <div class="flex flex-col gap-2">
          <!-- Target (Resistance) -->
          <div class="flex-1 p-2.5 rounded-2xl border flex justify-between items-center"
            :class="isDark ? 'bg-blue-500/10 border-blue-500/20' : 'bg-blue-50 border-blue-200'"
          >
            <div>
              <p class="text-[9px] font-bold text-blue-600 uppercase mb-0.5">Target Price</p>
              <p class="text-xs font-bold font-mono text-blue-700 dark:text-blue-400">{{ formatPrice(plan.target) }}</p>
            </div>
            <span class="material-symbols-outlined text-blue-500 text-[18px]">moving</span>
          </div>

          <!-- Stop Loss -->
          <div class="flex-1 p-2.5 rounded-2xl border flex justify-between items-center"
            :class="isDark ? 'bg-red-500/10 border-red-500/20' : 'bg-red-50 border-red-200'"
          >
            <div>
              <p class="text-[9px] font-bold text-red-600 uppercase mb-0.5">Berhenti Kerugian (SL)</p>
              <p class="text-xs font-bold font-mono text-red-700 dark:text-red-400">< {{ formatPrice(plan.stopLoss) }}</p>
            </div>
            <span class="material-symbols-outlined text-red-500 text-[18px]">warning</span>
          </div>
        </div>
      </div>

      <!-- Warning Bottom Note -->
      <div class="flex items-start gap-3 p-3 rounded-2xl border"
        :class="isDark ? 'bg-orange-500/10 border-orange-500/20' : 'bg-orange-50 gap-2 border-orange-200'"
      >
        <span class="material-symbols-outlined text-orange-500 text-lg mt-0.5">gavel</span>
        <p class="text-[9.5px] leading-relaxed text-orange-700 dark:text-orange-300">
          <strong>MANAJEMEN RESIKO:</strong> Jika harga menembus ke bawah cut-loss area, patuhi disiplin jual untuk mencegah nyangkut di fase Mark-Down. Trading mengandung resiko tinggi. Area beli dan TP digambar visual di Chart!
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue'

const props = defineProps<{
  data: any[]
  loading: boolean
}>()

const emit = defineEmits<{
  'update:plan': [plan: any]
}>()

const { isDark } = useColorMode()

const isAnalyzed = ref(false)
const isAnalyzing = ref(false)

function formatPrice(n: number): string {
  return new Intl.NumberFormat('id-ID').format(Math.round(n))
}

function analyzeData() {
  isAnalyzing.value = true
  setTimeout(() => {
    isAnalyzing.value = false
    isAnalyzed.value = true
  }, 1200) // Simulasi processing time
}

// Reset state jika saham berganti (data kosong)
watch(() => props.data, (newData) => {
  if (!newData || newData.length === 0) {
    isAnalyzed.value = false
  }
})

const plan = computed(() => {
  if (!isAnalyzed.value || !props.data || props.data.length < 20) return null

  // API returns latest first. Reverse back if needed, but calculating min/max doesn't care about order.
  const latest = props.data[0]
  const currentPrice = latest.close || latest.Close || latest.c || 0

  // Ambil data array harga
  const closePrices = props.data.map(d => Number(d.close || d.Close || d.c || 0))
  const lowPrices = props.data.map(d => Number(d.low || d.Low || d.l || 0))
  const highPrices = props.data.map(d => Number(d.high || d.High || d.h || 0))

  // Technical calculations
  const sma20 = closePrices.slice(0, 20).reduce((a, b) => a + b, 0) / 20
  const sma60 = closePrices.slice(0, 60).reduce((a, b) => a + b, 0) / Math.min(60, closePrices.length)

  // Look back Support & Resistance
  const support1 = Math.min(...lowPrices.slice(0, 20))
  const support2 = Math.min(...lowPrices.slice(0, 60))
  const resistance1 = Math.max(...highPrices.slice(0, 60))

  let method = ""
  let trendAnalysis = ""
  let buyAction = ""

  // Stage Analysis Logic (Stan Weinstein & Price Action)
  if (currentPrice > sma60 && currentPrice > sma20) {
    method = "Stage 2 Trend Following (Stan Weinstein)"
    trendAnalysis = "Saham terkonfirmasi berada dalam fase UPTREND (MA20 & MA60 naik). Momentum pasar sangat kuat, resiko holding relatif lebih rendah jika dibeli di dasar tren."
    
    if (currentPrice <= support1 + (support1 * 0.05)) {
      buyAction = "🟢 Sangat Ideal (Harga Rebound Support)"
    } else {
      buyAction = "🟡 Tunggu Koreksi (Buy on Weakness)"
    }
  } else if (currentPrice < sma60 && currentPrice < sma20) {
    method = "Reversal / Bottom Fishing (Wyckoff Accumulation Phase)"
    trendAnalysis = "Saham masih terjebak di fase DOWNTREND (Stage 4). Ada resiko tinggi melanjutkan penurunan kecuali mampu bertahan kuat (consolidate) di area Support 2."
    buyAction = "🔴 High Risk (Spekulatif Buy Pantulan)"
  } else {
    method = "Volatility Contraction Pattern (Mark Minervini)"
    trendAnalysis = "Saham sedang berkonsolidasi / SIDEWAYS membangun pola basis baru. Potensi terjadi ledakan harga (breakout) jika demand tiba-tiba meledak menembus Resistance."
    buyAction = "🔵 Akumulasi Bertahap di Support"
  }

  const buyZoneTop = support1 + ((resistance1 - support1) * 0.25)
  const stopLoss = support1 * 0.96 // Toleransi 4% tebus false breakout

  return {
    method,
    trendAnalysis,
    buyAction,
    buyZone: [support1, buyZoneTop] as [number, number],
    target: resistance1,
    stopLoss,
    support1,
    resistance1
  }
})

// Emit the calculated plan backwards to the Chart
watch(plan, (newPlan) => {
  if (newPlan) {
    emit('update:plan', newPlan)
  }
}, { immediate: true })

</script>

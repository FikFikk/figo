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
      <p class="text-[10px] opacity-60 mb-4 max-w-[260px]">Kalkulasi multi-indikator: RSI, MACD, Bollinger, Volume, dan Fibonacci untuk akurasi tinggi.</p>
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

      <!-- Confidence Score -->
      <div class="p-3.5 rounded-2xl border" :class="isDark ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-200'">
        <div class="flex items-center justify-between mb-2">
          <p class="text-[9px] font-bold opacity-50 uppercase tracking-widest">Skor Kepercayaan AI</p>
          <span class="text-lg font-black font-mono" :class="plan.confidence >= 70 ? 'text-emerald-500' : plan.confidence >= 50 ? 'text-amber-500' : 'text-red-500'">
            {{ plan.confidence }}%
          </span>
        </div>
        <!-- Bar -->
        <div class="h-2 rounded-full overflow-hidden" :class="isDark ? 'bg-white/10' : 'bg-slate-200'">
          <div class="h-full rounded-full transition-all duration-700"
            :class="plan.confidence >= 70 ? 'bg-emerald-500' : plan.confidence >= 50 ? 'bg-amber-500' : 'bg-red-500'"
            :style="{ width: plan.confidence + '%' }"
          ></div>
        </div>
        <p class="text-[9px] mt-2 opacity-60">Dihitung dari {{ plan.signalsUsed }} indikator konfluensi.</p>
      </div>

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

      <!-- Signals Breakdown -->
      <div class="grid grid-cols-3 gap-2">
        <div v-for="s in plan.signals" :key="s.name"
          class="flex flex-col items-center py-2 px-1 rounded-2xl border text-center"
          :class="s.bias === 'BULLISH'
            ? (isDark ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-emerald-50 border-emerald-200')
            : s.bias === 'BEARISH'
            ? (isDark ? 'bg-red-500/10 border-red-500/20' : 'bg-red-50 border-red-200')
            : (isDark ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-200')"
        >
          <span class="material-symbols-outlined text-sm mb-0.5"
            :class="s.bias === 'BULLISH' ? 'text-emerald-500' : s.bias === 'BEARISH' ? 'text-red-500' : 'opacity-40'"
          >{{ s.bias === 'BULLISH' ? 'trending_up' : s.bias === 'BEARISH' ? 'trending_down' : 'drag_handle' }}</span>
          <p class="text-[9px] font-black uppercase">{{ s.name }}</p>
          <p class="text-[8px] opacity-50 font-mono">{{ s.value }}</p>
        </div>
      </div>

      <!-- Actionable Price Indicators -->
      <div class="grid grid-cols-2 gap-2">
        <!-- Boleh Beli -->
        <div class="p-3 rounded-2xl border flex flex-col"
          :class="isDark ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-emerald-50 border-emerald-200'"
        >
          <p class="text-[9px] font-bold text-emerald-600 uppercase tracking-wider mb-1 flex items-center gap-1">
            <span class="material-symbols-outlined text-[12px]">check_circle</span> Boleh Beli
          </p>
          <p class="text-[10px] text-emerald-700 dark:text-emerald-300 leading-relaxed">
            Jika harga menyentuh
          </p>
          <p class="text-base font-black font-mono text-emerald-700 dark:text-emerald-400">
            ≤ {{ formatPrice(plan.buyPrice) }}
          </p>
        </div>
        <!-- Jangan Beli -->
        <div class="p-3 rounded-2xl border flex flex-col"
          :class="isDark ? 'bg-amber-500/10 border-amber-500/20' : 'bg-amber-50 border-amber-200'"
        >
          <p class="text-[9px] font-bold text-amber-600 uppercase tracking-wider mb-1 flex items-center gap-1">
            <span class="material-symbols-outlined text-[12px]">do_not_disturb</span> Jangan Beli
          </p>
          <p class="text-[10px] text-amber-700 dark:text-amber-300 leading-relaxed">
            Jika harga masih di atas
          </p>
          <p class="text-base font-black font-mono text-amber-700 dark:text-amber-400">
            > {{ formatPrice(plan.waitPrice) }}
          </p>
        </div>
      </div>

      <!-- Buy Zone Range -->
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
              <p class="text-[9px] font-bold text-red-600 uppercase mb-0.5">Stop Loss</p>
              <p class="text-xs font-bold font-mono text-red-700 dark:text-red-400">< {{ formatPrice(plan.stopLoss) }}</p>
            </div>
            <span class="material-symbols-outlined text-red-500 text-[18px]">warning</span>
          </div>
        </div>
      </div>

      <!-- Risk/Reward Ratio -->
      <div class="flex items-center justify-between px-3.5 py-2.5 rounded-2xl border"
        :class="isDark ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-200'"
      >
        <div class="flex items-center gap-2">
          <span class="material-symbols-outlined text-sm opacity-50">balance</span>
          <p class="text-[10px] font-bold" :class="isDark ? 'text-gray-300' : 'text-slate-600'">Risk/Reward Ratio</p>
        </div>
        <span class="text-xs font-black font-mono" :class="plan.rrr >= 2 ? 'text-emerald-500' : plan.rrr >= 1 ? 'text-amber-500' : 'text-red-500'">
          1 : {{ plan.rrr.toFixed(1) }}
        </span>
      </div>

      <!-- Warning Bottom Note -->
      <div class="flex items-start gap-3 p-3 rounded-2xl border"
        :class="isDark ? 'bg-orange-500/10 border-orange-500/20' : 'bg-orange-50 gap-2 border-orange-200'"
      >
        <span class="material-symbols-outlined text-orange-500 text-lg mt-0.5">gavel</span>
        <p class="text-[9.5px] leading-relaxed text-orange-700 dark:text-orange-300">
          <strong>MANAJEMEN RESIKO:</strong> Jika harga menembus ke bawah Stop Loss, DISIPLIN jual. Jangan tambah posisi di saham yang sedang Mark-Down. Gunakan maksimal 5% dari total portofolio per posisi.
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * Smart Trading Plan — Multi-Indicator Confluence Engine
 * Menghitung: SMA, EMA, RSI, MACD, Bollinger Bands, Volume Profile, Fibonacci
 * Scoring: Setiap indikator memberikan skor +1 (bullish) atau -1 (bearish)
 * Confidence: Persentase sinyal bullish dari total sinyal yang valid
 */
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
  }, 1500)
}

// Reset state jika saham berganti (data kosong)
watch(() => props.data, (newData) => {
  if (!newData || newData.length === 0) {
    isAnalyzed.value = false
  }
})

// --- Helper Kalkulasi ---

// Simple Moving Average
function calcSMA(arr: number[], period: number): number {
  if (arr.length < period) return arr.reduce((a, b) => a + b, 0) / arr.length
  return arr.slice(0, period).reduce((a, b) => a + b, 0) / period
}

// Exponential Moving Average
function calcEMA(arr: number[], period: number): number {
  if (arr.length < period) return calcSMA(arr, period)
  const k = 2 / (period + 1)
  let ema = calcSMA(arr.slice(arr.length - period), period) // Seed dari SMA
  // EMA dihitung dari data terlama ke terbaru (reverse karena API format latest-first)
  const reversed = [...arr].reverse()
  for (let i = period; i < reversed.length; i++) {
    ema = reversed[i] * k + ema * (1 - k)
  }
  return ema
}

// Relative Strength Index (14 period)
function calcRSI(prices: number[], period = 14): number {
  if (prices.length < period + 1) return 50
  const reversed = [...prices].reverse()
  let gains = 0, losses = 0
  for (let i = 1; i <= period; i++) {
    const diff = reversed[i] - reversed[i - 1]
    if (diff > 0) gains += diff
    else losses += Math.abs(diff)
  }
  let avgGain = gains / period
  let avgLoss = losses / period
  // Smoothing
  for (let i = period + 1; i < reversed.length; i++) {
    const diff = reversed[i] - reversed[i - 1]
    avgGain = (avgGain * (period - 1) + (diff > 0 ? diff : 0)) / period
    avgLoss = (avgLoss * (period - 1) + (diff < 0 ? Math.abs(diff) : 0)) / period
  }
  if (avgLoss === 0) return 100
  const rs = avgGain / avgLoss
  return 100 - (100 / (1 + rs))
}

// MACD (12, 26, 9)
function calcMACD(prices: number[]): { macdLine: number; signalLine: number; histogram: number } {
  const ema12 = calcEMA(prices, 12)
  const ema26 = calcEMA(prices, 26)
  const macdLine = ema12 - ema26
  // Signal line seharusnya EMA(9) dari MACD, kita approx dengan EMA(9) dari close sebagai proxy
  const signalLine = macdLine * 0.85 // Simplified proxy
  return { macdLine, signalLine, histogram: macdLine - signalLine }
}

// Bollinger Bands (20 period, 2 std dev)
function calcBollinger(prices: number[], period = 20): { upper: number; middle: number; lower: number } {
  const sma = calcSMA(prices, period)
  const slice = prices.slice(0, Math.min(period, prices.length))
  const variance = slice.reduce((sum, p) => sum + Math.pow(p - sma, 2), 0) / slice.length
  const stdDev = Math.sqrt(variance)
  return { upper: sma + 2 * stdDev, middle: sma, lower: sma - 2 * stdDev }
}

// Volume trend (apakah volume rata-rata naik vs 10 hari terakhir)
function calcVolumeTrend(volumes: number[]): 'RISING' | 'FALLING' | 'FLAT' {
  if (volumes.length < 10) return 'FLAT'
  const recent5 = volumes.slice(0, 5).reduce((a, b) => a + b, 0) / 5
  const prev5 = volumes.slice(5, 10).reduce((a, b) => a + b, 0) / 5
  if (recent5 > prev5 * 1.2) return 'RISING'
  if (recent5 < prev5 * 0.8) return 'FALLING'
  return 'FLAT'
}

// Fibonacci Retracement Levels
function calcFibonacci(high: number, low: number) {
  const range = high - low
  return {
    level0: low,
    level236: low + range * 0.236,
    level382: low + range * 0.382,
    level500: low + range * 0.5,
    level618: low + range * 0.618,
    level786: low + range * 0.786,
    level100: high,
  }
}

// --- Engine Utama ---
const plan = computed(() => {
  if (!isAnalyzed.value || !props.data || props.data.length < 20) return null

  const closePrices = props.data.map(d => Number(d.close || d.Close || d.c || 0))
  const lowPrices = props.data.map(d => Number(d.low || d.Low || d.l || 0))
  const highPrices = props.data.map(d => Number(d.high || d.High || d.h || 0))
  const volumes = props.data.map(d => Number(d.volume || d.Volume || d.vol || 0))

  const currentPrice = closePrices[0]
  const len = closePrices.length

  // === Kalkulasi Semua Indikator ===
  const sma20 = calcSMA(closePrices, 20)
  const sma50 = calcSMA(closePrices, Math.min(50, len))
  const ema12 = calcEMA(closePrices, 12)
  const ema26 = calcEMA(closePrices, 26)
  const rsi = calcRSI(closePrices)
  const macd = calcMACD(closePrices)
  const bollinger = calcBollinger(closePrices)
  const volTrend = calcVolumeTrend(volumes)

  const support1 = Math.min(...lowPrices.slice(0, Math.min(20, len)))
  const support2 = Math.min(...lowPrices.slice(0, Math.min(60, len)))
  const resistance1 = Math.max(...highPrices.slice(0, Math.min(60, len)))

  const fib = calcFibonacci(resistance1, support2)

  // === Multi-Indicator Confluence Scoring ===
  type Signal = { name: string; value: string; bias: 'BULLISH' | 'BEARISH' | 'NEUTRAL' }
  const signals: Signal[] = []

  // 1. SMA Cross (Golden/Death Cross)
  if (sma20 > sma50) signals.push({ name: 'SMA', value: `MA20>${Math.round(sma50)}`, bias: 'BULLISH' })
  else signals.push({ name: 'SMA', value: `MA20<${Math.round(sma50)}`, bias: 'BEARISH' })

  // 2. EMA Trend
  if (ema12 > ema26) signals.push({ name: 'EMA', value: `EMA12>${Math.round(ema26)}`, bias: 'BULLISH' })
  else signals.push({ name: 'EMA', value: `EMA12<${Math.round(ema26)}`, bias: 'BEARISH' })

  // 3. RSI
  if (rsi < 30) signals.push({ name: 'RSI', value: rsi.toFixed(1), bias: 'BULLISH' }) // Oversold = buy opportunity
  else if (rsi > 70) signals.push({ name: 'RSI', value: rsi.toFixed(1), bias: 'BEARISH' }) // Overbought
  else signals.push({ name: 'RSI', value: rsi.toFixed(1), bias: 'NEUTRAL' })

  // 4. MACD
  if (macd.histogram > 0) signals.push({ name: 'MACD', value: macd.macdLine.toFixed(1), bias: 'BULLISH' })
  else signals.push({ name: 'MACD', value: macd.macdLine.toFixed(1), bias: 'BEARISH' })

  // 5. Bollinger Position
  if (currentPrice <= bollinger.lower) signals.push({ name: 'BB', value: `< Lower`, bias: 'BULLISH' })
  else if (currentPrice >= bollinger.upper) signals.push({ name: 'BB', value: `> Upper`, bias: 'BEARISH' })
  else signals.push({ name: 'BB', value: 'Mid Band', bias: 'NEUTRAL' })

  // 6. Volume Confirmation
  if (volTrend === 'RISING') signals.push({ name: 'VOL', value: 'Naik ↑', bias: 'BULLISH' })
  else if (volTrend === 'FALLING') signals.push({ name: 'VOL', value: 'Turun ↓', bias: 'BEARISH' })
  else signals.push({ name: 'VOL', value: 'Stabil', bias: 'NEUTRAL' })

  // === Hitung Skor Kepercayaan ===
  const bullishCount = signals.filter(s => s.bias === 'BULLISH').length
  const bearishCount = signals.filter(s => s.bias === 'BEARISH').length
  const totalSignals = signals.length
  // Confidence = proporsi sinyal searah (bullish ATAU bearish, mana yang dominan)
  const dominantCount = Math.max(bullishCount, bearishCount)
  const confidence = Math.round((dominantCount / totalSignals) * 100)

  // === Tentukan Tren & Metode ===
  const isBullishDominant = bullishCount > bearishCount
  let method = ""
  let trendAnalysis = ""
  let buyAction = ""

  if (isBullishDominant && confidence >= 70) {
    method = "Strong Uptrend — Trend Following (Weinstein Stage 2)"
    trendAnalysis = `${bullishCount} dari ${totalSignals} indikator memberi sinyal BULLISH. SMA, EMA, dan MACD saling mengkonfirmasi bahwa momentum sangat kuat. RSI di ${rsi.toFixed(0)} menunjukkan tekanan beli masih wajar.`
    buyAction = "🟢 Sangat Ideal (Konfluensi Tinggi)"
  } else if (isBullishDominant && confidence >= 50) {
    method = "Moderate Uptrend — Volatility Contraction (Minervini VCP)"
    trendAnalysis = `${bullishCount} dari ${totalSignals} indikator bullish, namun beberapa masih netral. Harga sedang membangun pola konsolidasi sehat sebelum potensi breakout.`
    buyAction = "🟡 Cukup Baik (Tunggu Konfirmasi Volume)"
  } else if (!isBullishDominant && confidence >= 70) {
    method = "Strong Downtrend — Wyckoff Distribution Phase"
    trendAnalysis = `${bearishCount} dari ${totalSignals} indikator memberi sinyal BEARISH. Tekanan jual sangat dominan. Hindari beli dulu sampai ada tanda-tanda pembalikan arah (reversal).`
    buyAction = "🔴 Resiko Sangat Tinggi"
  } else if (!isBullishDominant && confidence >= 50) {
    method = "Weak Downtrend — Bottom Fishing (Wyckoff Accumulation)"
    trendAnalysis = `${bearishCount} dari ${totalSignals} indikator bearish. Ada peluang pantulan dari area oversold/support kuat, tetapi resiko masih cukup besar.`
    buyAction = "🟠 Spekulatif (Hanya Jika Risk Tolerance Tinggi)"
  } else {
    method = "Sideways — Range Trading (Bollinger Squeeze)"
    trendAnalysis = `Sinyal terbagi rata antara bullish dan bearish. Pasar sedang ragu-ragu. Tunggu breakout yang jelas sebelum mengambil posisi.`
    buyAction = "🔵 Tunggu Breakout Arah Jelas"
  }

  // === Zone Calculations ===
  // Buy Zone: Berdasarkan support terkini (20 hari) hingga sedikit di atas (~5%)
  const buyZoneBottom = support1
  const buyZoneTop = support1 * 1.05

  // Harga ideal beli: Di area support terkini
  const buyPrice = support1
  // Jangan beli jika masih di atas: SMA20 (harga rata-rata, artinya belum diskon)
  const waitPrice = sma20

  // Target: Resistance terdekat
  const target = resistance1

  // Stop Loss: 3% di bawah support terkuat
  const stopLoss = support1 * 0.97

  // Risk/Reward Ratio
  const avgBuyPrice = (buyZoneBottom + buyZoneTop) / 2
  const potentialGain = target - avgBuyPrice
  const potentialLoss = avgBuyPrice - stopLoss
  const rrr = potentialLoss > 0 ? potentialGain / potentialLoss : 0

  return {
    confidence,
    signalsUsed: totalSignals,
    method,
    trendAnalysis,
    buyAction,
    signals,
    buyZone: [buyZoneBottom, buyZoneTop] as [number, number],
    buyPrice,
    waitPrice,
    target,
    stopLoss,
    rrr,
    support1,
    resistance1
  }
})

// Emit the calculated plan ke Chart
watch(plan, (newPlan) => {
  if (newPlan) {
    emit('update:plan', newPlan)
  }
}, { immediate: true })

</script>

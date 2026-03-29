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

      <!-- Method & Trend Base (CLICKABLE → modal) -->
      <button @click="showMethodModal = true" class="w-full p-3.5 rounded-2xl border flex flex-col gap-2 text-left transition-all hover:scale-[1.01]"
        :class="isDark ? 'bg-white/5 border-white/10 hover:bg-white/8' : 'bg-slate-50 border-slate-200 hover:bg-slate-100'"
      >
        <div class="flex justify-between items-start gap-2">
          <div>
            <p class="text-[9px] font-bold opacity-50 uppercase tracking-widest mb-0.5">Analisa Tren & Metodologi</p>
            <p class="text-xs font-bold font-headline text-primary leading-tight">{{ plan.method }}</p>
          </div>
          <div class="flex flex-col items-center gap-0.5">
            <span class="material-symbols-outlined text-lg opacity-40">menu_book</span>
            <span class="text-[7px] font-bold opacity-30 uppercase">Detail</span>
          </div>
        </div>
        <p class="text-[10.5px] opacity-80 leading-relaxed">{{ plan.trendAnalysis }}</p>
        <p class="text-[8px] font-bold text-primary/60 mt-1">{{ allMethods.length }} metodologi dianalisa — klik untuk lihat semua →</p>
      </button>

      <!-- Signals Breakdown (CLICKABLE) -->
      <div class="grid grid-cols-3 gap-2">
        <button v-for="s in plan.signals" :key="s.name"
          @click="openSignalDetail(s)"
          class="flex flex-col items-center py-2 px-1 rounded-2xl border text-center transition-all hover:scale-[1.02] cursor-pointer"
          :class="s.bias === 'BULLISH'
            ? (isDark ? 'bg-emerald-500/10 border-emerald-500/20 hover:bg-emerald-500/15' : 'bg-emerald-50 border-emerald-200 hover:bg-emerald-100')
            : s.bias === 'BEARISH'
            ? (isDark ? 'bg-red-500/10 border-red-500/20 hover:bg-red-500/15' : 'bg-red-50 border-red-200 hover:bg-red-100')
            : (isDark ? 'bg-white/5 border-white/10 hover:bg-white/8' : 'bg-slate-50 border-slate-200 hover:bg-slate-100')"
        >
          <span class="material-symbols-outlined text-sm mb-0.5"
            :class="s.bias === 'BULLISH' ? 'text-emerald-500' : s.bias === 'BEARISH' ? 'text-red-500' : 'opacity-40'"
          >{{ s.bias === 'BULLISH' ? 'trending_up' : s.bias === 'BEARISH' ? 'trending_down' : 'drag_handle' }}</span>
          <p class="text-[9px] font-black uppercase">{{ s.name }}</p>
          <p class="text-[8px] opacity-50 font-mono">{{ s.value }}</p>
          <span class="text-[7px] text-primary/50 font-bold mt-0.5">detail →</span>
        </button>
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

    <!-- Methodology Detail Modal -->
    <Teleport to="body">
      <Transition
        enter-active-class="transition duration-200 ease-out"
        enter-from-class="opacity-0"
        enter-to-class="opacity-100"
        leave-active-class="transition duration-150 ease-in"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <div v-if="showMethodModal" class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" @click.self="showMethodModal = false">
          <div class="glass-panel border rounded-3xl max-w-lg w-full max-h-[85vh] overflow-y-auto"
            :class="isDark ? 'bg-[#1a1d28] border-white/10' : 'bg-white border-slate-200 shadow-2xl'"
          >
            <!-- Modal Header -->
            <div class="sticky top-0 z-10 p-5 pb-3 rounded-t-3xl border-b"
              :class="isDark ? 'bg-[#1a1d28] border-white/5' : 'bg-white border-slate-100'"
            >
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <span class="material-symbols-outlined text-primary">analytics</span>
                  <h3 class="font-headline font-bold text-sm" :class="isDark ? 'text-white' : 'text-slate-900'">Semua Metodologi Analisa</h3>
                </div>
                <button @click="showMethodModal = false" class="w-8 h-8 rounded-full flex items-center justify-center transition-colors"
                  :class="isDark ? 'hover:bg-white/10' : 'hover:bg-slate-100'">
                  <span class="material-symbols-outlined text-sm opacity-50">close</span>
                </button>
              </div>
              <p class="text-[10px] opacity-50 mt-1">{{ allMethods.length }} metodologi dihitung secara real-time dari data chart</p>
            </div>

            <!-- Methods List -->
            <div class="p-5 pt-3 space-y-3">
              <div v-for="(m, i) in allMethods" :key="m.id"
                class="p-4 rounded-2xl border transition-all"
                :class="[
                  i === 0
                    ? (isDark ? 'bg-primary/10 border-primary/30 ring-1 ring-primary/20' : 'bg-blue-50 border-blue-200 ring-1 ring-blue-100')
                    : (isDark ? 'bg-white/[0.03] border-white/5' : 'bg-slate-50/80 border-slate-100'),
                ]"
              >
                <div class="flex items-start justify-between gap-2 mb-2">
                  <div class="flex-1">
                    <div class="flex items-center gap-2 mb-1">
                      <span v-if="i === 0" class="text-[8px] font-black px-1.5 py-0.5 rounded bg-primary/20 text-primary border border-primary/30">BEST MATCH</span>
                      <span v-else class="text-[8px] font-black px-1.5 py-0.5 rounded opacity-40 border"
                        :class="isDark ? 'border-white/10' : 'border-slate-200'"
                      >#{{ i + 1 }}</span>
                    </div>
                    <p class="text-xs font-bold font-headline" :class="isDark ? 'text-white' : 'text-slate-900'">{{ m.name }}</p>
                    <p class="text-[9px] font-bold opacity-40 uppercase tracking-wider">{{ m.category }}</p>
                  </div>
                  <!-- Score -->
                  <div class="flex flex-col items-center">
                    <span class="text-lg font-black font-mono" :class="m.score >= 70 ? 'text-emerald-500' : m.score >= 40 ? 'text-amber-500' : 'text-red-400'">{{ m.score }}%</span>
                    <span class="text-[7px] font-bold opacity-30 uppercase">Match</span>
                  </div>
                </div>

                <!-- Deskripsi -->
                <p class="text-[10.5px] opacity-80 leading-relaxed mb-2">{{ m.description }}</p>

                <!-- Kondisi yang terpenuhi -->
                <div class="space-y-1">
                  <div v-for="c in m.conditions" :key="c.label" class="flex items-center gap-2">
                    <span class="material-symbols-outlined text-xs"
                      :class="c.met ? 'text-emerald-500' : 'text-red-400'"
                    >{{ c.met ? 'check_circle' : 'cancel' }}</span>
                    <span class="text-[9.5px]" :class="c.met ? 'opacity-80' : 'opacity-40'">{{ c.label }}</span>
                  </div>
                </div>

                <!-- Aksi -->
                <div v-if="m.action" class="mt-2 pt-2 border-t"
                  :class="isDark ? 'border-white/5' : 'border-slate-200'"
                >
                  <p class="text-[10px] font-bold" :class="m.bias === 'BULLISH' ? 'text-emerald-500' : m.bias === 'BEARISH' ? 'text-red-500' : 'text-amber-500'">{{ m.action }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Indicator Detail Modal -->
    <Teleport to="body">
      <Transition
        enter-active-class="transition duration-200 ease-out"
        enter-from-class="opacity-0"
        enter-to-class="opacity-100"
        leave-active-class="transition duration-150 ease-in"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <div v-if="showSignalModal && activeSignal" class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" @click.self="showSignalModal = false">
          <div class="glass-panel border rounded-3xl max-w-md w-full max-h-[85vh] overflow-y-auto"
            :class="isDark ? 'bg-[#1a1d28] border-white/10' : 'bg-white border-slate-200 shadow-2xl'"
          >
            <!-- Header -->
            <div class="sticky top-0 z-10 p-5 pb-3 rounded-t-3xl border-b"
              :class="isDark ? 'bg-[#1a1d28] border-white/5' : 'bg-white border-slate-100'"
            >
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <div class="w-8 h-8 rounded-xl flex items-center justify-center"
                    :class="activeSignal.bias === 'BULLISH' ? 'bg-emerald-500/20 text-emerald-500' : activeSignal.bias === 'BEARISH' ? 'bg-red-500/20 text-red-500' : 'bg-white/10 opacity-60'"
                  >
                    <span class="material-symbols-outlined text-sm">{{ activeSignal.bias === 'BULLISH' ? 'trending_up' : activeSignal.bias === 'BEARISH' ? 'trending_down' : 'drag_handle' }}</span>
                  </div>
                  <div>
                    <h3 class="font-headline font-bold text-sm" :class="isDark ? 'text-white' : 'text-slate-900'">{{ activeSignal.detail?.fullName || activeSignal.name }}</h3>
                    <p class="text-[9px] font-bold uppercase tracking-wider"
                      :class="activeSignal.bias === 'BULLISH' ? 'text-emerald-500' : activeSignal.bias === 'BEARISH' ? 'text-red-500' : 'opacity-40'"
                    >{{ activeSignal.bias }}</p>
                  </div>
                </div>
                <button @click="showSignalModal = false" class="w-8 h-8 rounded-full flex items-center justify-center"
                  :class="isDark ? 'hover:bg-white/10' : 'hover:bg-slate-100'">
                  <span class="material-symbols-outlined text-sm opacity-50">close</span>
                </button>
              </div>
            </div>

            <div class="p-5 space-y-4" v-if="activeSignal.detail">
              <!-- Nilai Akhir -->
              <div class="flex items-center justify-between p-3 rounded-2xl border"
                :class="isDark ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-200'"
              >
                <span class="text-[10px] font-bold opacity-50">NILAI SAAT INI</span>
                <span class="text-xl font-black font-mono"
                  :class="activeSignal.bias === 'BULLISH' ? 'text-emerald-500' : activeSignal.bias === 'BEARISH' ? 'text-red-500' : (isDark ? 'text-white' : 'text-slate-900')"
                >{{ activeSignal.value }}</span>
              </div>

              <!-- Mini Chart Canvas -->
              <div class="rounded-2xl border overflow-hidden"
                :class="isDark ? 'bg-white/[0.03] border-white/5' : 'bg-slate-50 border-slate-100'"
              >
                <p class="text-[8px] font-bold uppercase tracking-widest px-3 pt-2 opacity-30">Chart + Indicator Lines</p>
                <canvas ref="indicatorCanvas" class="w-full" style="height: 140px;"></canvas>
              </div>

              <!-- Konfigurasi -->
              <div class="p-3 rounded-2xl border space-y-2"
                :class="isDark ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-200'"
              >
                <p class="text-[9px] font-bold opacity-50 uppercase tracking-widest">Konfigurasi Perhitungan</p>
                <div v-for="cfg in activeSignal.detail.config" :key="cfg.label" class="flex justify-between items-center">
                  <span class="text-[10px] opacity-70">{{ cfg.label }}</span>
                  <span class="text-[10px] font-bold font-mono" :class="isDark ? 'text-white' : 'text-slate-900'">{{ cfg.value }}</span>
                </div>
              </div>

              <!-- Step-by-step Calculation -->
              <div class="space-y-2">
                <p class="text-[9px] font-bold opacity-50 uppercase tracking-widest">Langkah Perhitungan</p>
                <div v-for="(step, si) in activeSignal.detail.steps" :key="si"
                  class="flex gap-3 items-start"
                >
                  <div class="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-[8px] font-black"
                    :class="isDark ? 'bg-primary/20 text-primary' : 'bg-blue-100 text-primary'"
                  >{{ si + 1 }}</div>
                  <p class="text-[10px] leading-relaxed opacity-80 flex-1">{{ step }}</p>
                </div>
              </div>

              <!-- Interpretasi -->
              <div class="p-3 rounded-2xl border"
                :class="activeSignal.bias === 'BULLISH'
                  ? (isDark ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-emerald-50 border-emerald-200')
                  : activeSignal.bias === 'BEARISH'
                  ? (isDark ? 'bg-red-500/10 border-red-500/20' : 'bg-red-50 border-red-200')
                  : (isDark ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-200')"
              >
                <p class="text-[9px] font-bold uppercase tracking-widest mb-1"
                  :class="activeSignal.bias === 'BULLISH' ? 'text-emerald-500' : activeSignal.bias === 'BEARISH' ? 'text-red-500' : 'opacity-50'"
                >Interpretasi</p>
                <p class="text-[10.5px] leading-relaxed opacity-80">{{ activeSignal.detail.interpretation }}</p>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
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
const showMethodModal = ref(false)
const showSignalModal = ref(false)
const activeSignal = ref<any>(null)
const indicatorCanvas = ref<HTMLCanvasElement | null>(null)

// Detail data untuk tiap indikator
interface SignalDetail {
  fullName: string
  config: { label: string; value: string }[]
  steps: string[]
  interpretation: string
}

// Buka modal detail indicator
function openSignalDetail(signal: any) {
  if (!props.data || props.data.length < 20) return

  const closePrices = props.data.map((d: any) => Number(d.close || d.Close || d.c || 0))
  const highPrices = props.data.map((d: any) => Number(d.high || d.High || d.h || 0))
  const lowPrices = props.data.map((d: any) => Number(d.low || d.Low || d.l || 0))
  const volumes = props.data.map((d: any) => Number(d.volume || d.Volume || d.vol || 0))
  const cp = closePrices[0] || 0

  let detail: SignalDetail

  switch (signal.name) {
    case 'SMA': {
      const sma20 = calcSMA(closePrices, 20)
      const sma50 = calcSMA(closePrices, Math.min(50, closePrices.length))
      const sum20 = closePrices.slice(0, 20).reduce((a: number, b: number) => a + b, 0)
      detail = {
        fullName: 'Simple Moving Average (SMA20 vs SMA50)',
        config: [
          { label: 'Period SMA Pendek', value: '20 candle' },
          { label: 'Period SMA Panjang', value: `${Math.min(50, closePrices.length)} candle` },
          { label: 'Total data yang digunakan', value: `${closePrices.length} candle` },
        ],
        steps: [
          `Ambil 20 harga close terakhir. Contoh 3 data terbaru: ${closePrices.slice(0, 3).map(p => Math.round(p)).join(', ')}, ...`,
          `Jumlahkan semua 20 harga: ${Math.round(sum20)}`,
          `SMA20 = Total / 20 = ${Math.round(sum20)} / 20 = ${Math.round(sma20)}`,
          `Lakukan hal sama untuk 50 candle → SMA50 = ${Math.round(sma50)}`,
          `Bandingkan: SMA20 (${Math.round(sma20)}) ${sma20 > sma50 ? '>' : '<'} SMA50 (${Math.round(sma50)})`,
          sma20 > sma50
            ? 'SMA20 > SMA50 = Golden Cross → Tren BULLISH. Moving average jangka pendek di atas jangka panjang.'
            : 'SMA20 < SMA50 = Death Cross → Tren BEARISH. Moving average jangka pendek di bawah jangka panjang.',
        ],
        interpretation: sma20 > sma50
          ? `Harga rata-rata 20 candle (${Math.round(sma20)}) berada di atas rata-rata 50 candle (${Math.round(sma50)}). Ini menunjukkan momentum jangka pendek lebih kuat dari jangka menengah — sinyal tren kenaikan (Golden Cross).`
          : `Harga rata-rata 20 candle (${Math.round(sma20)}) berada di bawah rata-rata 50 candle (${Math.round(sma50)}). Momentum melemah — sinyal tren penurunan (Death Cross).`,
      }
      break
    }
    case 'EMA': {
      const ema20 = calcEMA(closePrices, 20)
      const ema50 = calcEMA(closePrices, Math.min(50, closePrices.length))
      const ema100 = closePrices.length >= 100 ? calcEMA(closePrices, 100) : null
      const ema200 = closePrices.length >= 200 ? calcEMA(closePrices, 200) : null
      const shortAboveLong = ema20 > ema50
      detail = {
        fullName: 'Exponential Moving Average (EMA 20/50/100/200)',
        config: [
          { label: 'EMA20 (Short)', value: `${Math.round(ema20)} — k=${(2/21).toFixed(4)}` },
          { label: 'EMA50 (Medium)', value: `${Math.round(ema50)} — k=${(2/51).toFixed(4)}` },
          { label: 'EMA100 (Long)', value: ema100 ? `${Math.round(ema100)} — k=${(2/101).toFixed(4)}` : 'Data kurang' },
          { label: 'EMA200 (Very Long)', value: ema200 ? `${Math.round(ema200)} — k=${(2/201).toFixed(4)}` : 'Data kurang' },
        ],
        steps: [
          `Seed EMA dengan SMA awal dari data terlama.`,
          `Rumus: EMA = Close × k + EMA_sebelumnya × (1-k), dimana k = 2/(period+1)`,
          `EMA20 = ${Math.round(ema20)} (paling sensitif, bereaksi cepat)`,
          `EMA50 = ${Math.round(ema50)} (tren menengah, lebih smooth)`,
          ema100 ? `EMA100 = ${Math.round(ema100)} (tren panjang, sangat smooth)` : 'EMA100: butuh minimal 100 candle data',
          ema200 ? `EMA200 = ${Math.round(ema200)} (tren jangka sangat panjang, "golden standard")` : 'EMA200: butuh minimal 200 candle data',
          shortAboveLong
            ? 'EMA20 > EMA50 → Semua moving average pendek di atas panjang = BULLISH alignment'
            : 'EMA20 < EMA50 → Moving average pendek di bawah panjang = BEARISH alignment',
        ],
        interpretation: `EMA20 (${Math.round(ema20)}) ${shortAboveLong ? '>' : '<'} EMA50 (${Math.round(ema50)}). ${shortAboveLong ? 'Tren naik — EMA pendek di atas EMA panjang menunjukkan momentum bullish.' : 'Tren turun — EMA pendek di bawah EMA panjang menunjukkan momentum bearish.'} ${ema200 ? `Harga ${closePrices[0] > ema200 ? 'di atas' : 'di bawah'} EMA200 (${Math.round(ema200)}) — ${closePrices[0] > ema200 ? 'secara teknikal masih bullish jangka panjang.' : 'secara teknikal bearish jangka panjang.'}` : ''}`,
      }
      break
    }
    case 'RSI': {
      const rsi = calcRSI(closePrices)
      detail = {
        fullName: 'Relative Strength Index (RSI-14)',
        config: [
          { label: 'Period', value: '14 candle' },
          { label: 'Zona Oversold', value: '< 30' },
          { label: 'Zona Overbought', value: '> 70' },
          { label: 'Zona Netral', value: '30 - 70' },
        ],
        steps: [
          `Ambil 14+1 = 15 candle terakhir untuk hitung perubahan harga.`,
          `Hitung selisih close antar candle berurutan (change).`,
          `Pisahkan ke Gains (naik) dan Losses (turun).`,
          `Average Gain = total kenaikan / 14, Average Loss = total penurunan / 14`,
          `RS (Relative Strength) = Avg Gain / Avg Loss`,
          `RSI = 100 - (100 / (1 + RS)) = ${rsi.toFixed(2)}`,
          rsi < 30 ? 'RSI < 30 = OVERSOLD → Harga sudah jatuh terlalu dalam, potensi bounce.' :
          rsi > 70 ? 'RSI > 70 = OVERBOUGHT → Harga sudah naik terlalu tinggi, potensi koreksi.' :
          'RSI di zona netral → Tidak ada sinyal ekstrim.',
        ],
        interpretation: rsi < 30
          ? `RSI ${rsi.toFixed(1)} menunjukkan kondisi oversold (jenuh jual). Tekanan jual sangat tinggi sehingga harga mungkin sudah terlalu murah. Potensi reversal naik (bullish signal).`
          : rsi > 70
          ? `RSI ${rsi.toFixed(1)} menunjukkan overbought (jenuh beli). Harga sudah naik terlalu cepat. Potensi koreksi atau pullback (bearish signal).`
          : `RSI ${rsi.toFixed(1)} berada di zona netral. Tidak ada kondisi ekstrim. Gunakan indikator lain untuk konfirmasi arah.`,
      }
      break
    }
    case 'MACD': {
      const macd = calcMACD(closePrices)
      detail = {
        fullName: 'MACD — Moving Average Convergence Divergence',
        config: [
          { label: 'EMA Fast', value: '12 candle' },
          { label: 'EMA Slow', value: '26 candle' },
          { label: 'Signal Line', value: 'EMA(9) dari MACD' },
        ],
        steps: [
          `Hitung EMA12 dari harga close = ${Math.round(calcEMA(closePrices, 12))}`,
          `Hitung EMA26 dari harga close = ${Math.round(calcEMA(closePrices, 26))}`,
          `MACD Line = EMA12 - EMA26 = ${macd.macdLine.toFixed(2)}`,
          `Signal Line = EMA(9) dari MACD Line ≈ ${macd.signalLine.toFixed(2)}`,
          `Histogram = MACD Line - Signal Line = ${macd.histogram.toFixed(2)}`,
          macd.histogram > 0
            ? 'Histogram POSITIF → MACD di atas signal line = momentum BULLISH'
            : 'Histogram NEGATIF → MACD di bawah signal line = momentum BEARISH',
        ],
        interpretation: `MACD Line (${macd.macdLine.toFixed(2)}) ${macd.histogram > 0 ? 'di atas' : 'di bawah'} Signal Line (${macd.signalLine.toFixed(2)}). Histogram = ${macd.histogram.toFixed(2)}. ${macd.histogram > 0 ? 'Momentum naik — EMA jangka pendek bergerak menjauh ke atas dari EMA jangka panjang. Tren bullish menguat.' : 'Momentum turun — EMA jangka pendek konvergen ke bawah. Tren bearish atau pelemahan.'}`,
      }
      break
    }
    case 'BB': {
      const bb = calcBollinger(closePrices)
      detail = {
        fullName: 'Bollinger Bands (BB-20, 2σ)',
        config: [
          { label: 'Period', value: '20 candle' },
          { label: 'Deviasi', value: '2 standard deviasi' },
          { label: 'Upper Band', value: Math.round(bb.upper).toString() },
          { label: 'Middle Band (SMA20)', value: Math.round(bb.middle).toString() },
          { label: 'Lower Band', value: Math.round(bb.lower).toString() },
          { label: 'Bandwidth', value: `${bb.bandwidth.toFixed(1)}%` },
        ],
        steps: [
          `Hitung SMA20 dari 20 close terakhir = ${Math.round(bb.middle)}`,
          `Hitung standard deviasi (σ) dari 20 data tersebut`,
          `Upper Band = SMA20 + (2 × σ) = ${Math.round(bb.upper)}`,
          `Lower Band = SMA20 - (2 × σ) = ${Math.round(bb.lower)}`,
          `Bandwidth = (Upper - Lower) / Middle × 100 = ${bb.bandwidth.toFixed(1)}%`,
          `Harga saat ini (${Math.round(cp)}) berada ${cp <= bb.lower ? 'DI BAWAH Lower Band → Oversold' : cp >= bb.upper ? 'DI ATAS Upper Band → Overbought' : 'DI ANTARA band → Normal'}`,
        ],
        interpretation: cp <= bb.lower
          ? `Harga (${Math.round(cp)}) menembus di bawah Lower Band (${Math.round(bb.lower)}). Secara statistik, 95% harga berada di dalam Bollinger Bands. Breakout ke bawah menandakan oversold ekstrim — potensi bounce kembali ke SMA20 (${Math.round(bb.middle)}).`
          : cp >= bb.upper
          ? `Harga (${Math.round(cp)}) menembus Upper Band (${Math.round(bb.upper)}). Overbought — harga sudah 2 standard deviasi di atas rata-rata. Potensi pullback ke SMA20 (${Math.round(bb.middle)}).`
          : `Harga (${Math.round(cp)}) berada di antara Upper (${Math.round(bb.upper)}) dan Lower (${Math.round(bb.lower)}). Bandwidth ${bb.bandwidth.toFixed(1)}% — ${bb.bandwidth < 10 ? 'sangat sempit, potensi breakout besar.' : 'normal, belum ada sinyal ekstrim.'}`,
      }
      break
    }
    case 'VOL': {
      const recent5 = volumes.slice(0, 5)
      const prev5 = volumes.slice(5, 10)
      const avgRecent = recent5.reduce((a: number, b: number) => a + b, 0) / 5
      const avgPrev = prev5.reduce((a: number, b: number) => a + b, 0) / 5
      const ratio = avgPrev > 0 ? avgRecent / avgPrev : 1
      const volTrend = calcVolumeTrend(volumes)
      detail = {
        fullName: 'Volume Trend Analysis (5-Day Comparison)',
        config: [
          { label: 'Period Baru', value: '5 candle terakhir' },
          { label: 'Period Lama', value: 'Candle ke-6 s/d ke-10' },
          { label: 'Rata-rata volume baru', value: formatVolume(avgRecent) },
          { label: 'Rata-rata volume lama', value: formatVolume(avgPrev) },
          { label: 'Rasio', value: `${ratio.toFixed(2)}x` },
        ],
        steps: [
          `Ambil 5 volume terakhir: ${recent5.map(v => formatVolume(v)).join(', ')}`,
          `Rata-rata 5 terakhir = ${formatVolume(avgRecent)}`,
          `Ambil 5 volume sebelumnya (candle 6-10): ${prev5.map(v => formatVolume(v)).join(', ')}`,
          `Rata-rata 5 sebelumnya = ${formatVolume(avgPrev)}`,
          `Rasio = ${formatVolume(avgRecent)} / ${formatVolume(avgPrev)} = ${ratio.toFixed(2)}x`,
          ratio > 1.2 ? `Rasio > 1.2 → Volume NAIK ${((ratio - 1) * 100).toFixed(0)}% = BULLISH` :
          ratio < 0.8 ? `Rasio < 0.8 → Volume TURUN ${((1 - ratio) * 100).toFixed(0)}% = BEARISH` :
          'Rasio 0.8 - 1.2 → Volume STABIL = NETRAL',
        ],
        interpretation: volTrend === 'RISING'
          ? `Volume naik ${((ratio - 1) * 100).toFixed(0)}% dibanding periode sebelumnya. Volume yang meningkat bersama tren harga mengkonfirmasi kekuatan tren tersebut. Smart money sedang aktif.`
          : volTrend === 'FALLING'
          ? `Volume turun ${((1 - ratio) * 100).toFixed(0)}%. Volume menurun bisa berarti kurangnya minat pasar. Tren tanpa volume = tren lemah.`
          : 'Volume relatif stabil (±20%). Tidak ada sinyal kuat dari sisi volume.',
      }
      break
    }
    default:
      detail = {
        fullName: signal.name,
        config: [{ label: 'Tipe', value: signal.name }],
        steps: ['Detail perhitungan belum tersedia untuk indikator ini.'],
        interpretation: 'Informasi tambahan belum tersedia.',
      }
  }

  activeSignal.value = { ...signal, detail }
  showSignalModal.value = true

  // Draw mini chart setelah modal ter-render
  nextTick(() => setTimeout(() => drawIndicatorChart(signal.name), 100))
}

// Format volume singkat
function formatVolume(n: number): string {
  if (n >= 1_000_000_000) return (n / 1_000_000_000).toFixed(1) + 'B'
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M'
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K'
  return Math.round(n).toString()
}

// Gambar mini chart dengan overlay indicator
function drawIndicatorChart(indicatorName: string) {
  const canvas = indicatorCanvas.value
  if (!canvas || !props.data || props.data.length < 10) return

  const parent = canvas.parentElement
  if (!parent) return

  const dpr = window.devicePixelRatio || 1
  const w = parent.getBoundingClientRect().width
  const h = 140

  canvas.width = w * dpr
  canvas.height = h * dpr
  canvas.style.width = w + 'px'
  canvas.style.height = h + 'px'

  const ctx = canvas.getContext('2d')
  if (!ctx) return
  ctx.scale(dpr, dpr)
  ctx.clearRect(0, 0, w, h)

  // Ambil 40 candle terakhir, sort chronologically (oldest → newest)
  const items = [...props.data].sort((a: any, b: any) => {
    const tA = a.timestamp || new Date(a.date || a.Date || 0).getTime()
    const tB = b.timestamp || new Date(b.date || b.Date || 0).getTime()
    return tA - tB
  }).slice(-40)
  const closes = items.map((d: any) => Number(d.close || d.Close || d.c || 0))
  const highs = items.map((d: any) => Number(d.high || d.High || d.h || 0))
  const lows = items.map((d: any) => Number(d.low || d.Low || d.l || 0))
  const opens = items.map((d: any) => Number(d.open || d.Open || d.o || 0))
  const volumes = items.map((d: any) => Number(d.volume || d.Volume || d.vol || 0))

  const pad = { top: 10, right: 10, bottom: 20, left: 10 }
  const cW = w - pad.left - pad.right
  const cH = h - pad.top - pad.bottom

  const allPrices = [...highs, ...lows].filter(p => p > 0)
  let minP = Math.min(...allPrices)
  let maxP = Math.max(...allPrices)

  // Untuk BB, extend range agar band terlihat
  if (indicatorName === 'BB') {
    const bb = calcBollinger(closes.slice().reverse())
    minP = Math.min(minP, bb.lower * 0.99)
    maxP = Math.max(maxP, bb.upper * 1.01)
  }

  const range = maxP - minP || 1
  const barW = cW / items.length
  const toY = (p: number) => pad.top + cH - ((p - minP) / range) * cH

  // Gambar candlesticks mini
  items.forEach((_: any, i: number) => {
    const x = pad.left + i * barW + barW / 2
    const o = opens[i], c = closes[i], hi = highs[i], lo = lows[i]
    const isBullish = c >= o
    ctx.strokeStyle = isBullish ? '#10b981' : '#ef4444'
    ctx.fillStyle = isBullish ? '#10b98140' : '#ef444440'
    ctx.lineWidth = 1

    // Wick
    ctx.beginPath()
    ctx.moveTo(x, toY(hi))
    ctx.lineTo(x, toY(lo))
    ctx.stroke()

    // Body
    const bTop = toY(Math.max(o, c))
    const bBot = toY(Math.min(o, c))
    const bH = Math.max(bBot - bTop, 1)
    ctx.fillRect(x - barW * 0.3, bTop, barW * 0.6, bH)
  })

  // Overlay berdasarkan indicator
  ctx.lineWidth = 1.5
  ctx.setLineDash([])

  // Pre-compute helper: hitung SMA array dari SEMUA data props.data
  const allCloses = [...props.data].sort((a: any, b: any) => {
    const tA = a.timestamp || new Date(a.date || a.Date || 0).getTime()
    const tB = b.timestamp || new Date(b.date || b.Date || 0).getTime()
    return tA - tB
  }).map((d: any) => Number(d.close || d.Close || d.c || 0))

  function computeSMAArray(data: number[], period: number): (number | null)[] {
    const result: (number | null)[] = []
    for (let i = 0; i < data.length; i++) {
      if (i < period - 1) { result.push(null); continue }
      let sum = 0
      for (let j = i - period + 1; j <= i; j++) sum += data[j]
      result.push(sum / period)
    }
    return result
  }

  function computeEMAArray(data: number[], period: number): (number | null)[] {
    const result: (number | null)[] = []
    const k = 2 / (period + 1)
    let ema: number | null = null
    for (let i = 0; i < data.length; i++) {
      if (i < period - 1) { result.push(null); continue }
      if (ema === null) {
        let sum = 0
        for (let j = i - period + 1; j <= i; j++) sum += data[j]
        ema = sum / period
      } else {
        ema = data[i] * k + ema * (1 - k)
      }
      result.push(ema)
    }
    return result
  }

  // Offset: ambil 40 terakhir dari allCloses
  const visibleOffset = Math.max(0, allCloses.length - items.length)

  if (indicatorName === 'SMA') {
    const maLines = [
      { period: 20, color: '#f59e0b', label: 'SMA20' },
      { period: 50, color: '#06b6d4', label: 'SMA50' },
    ]
    maLines.forEach(ma => {
      if (allCloses.length < ma.period) return
      const smaArr = computeSMAArray(allCloses, ma.period)
      ctx.strokeStyle = ma.color
      ctx.lineWidth = 1.5
      ctx.beginPath()
      let started = false
      for (let i = 0; i < items.length; i++) {
        const globalIdx = visibleOffset + i
        const val = smaArr[globalIdx]
        if (val === null) continue
        const x = pad.left + i * barW + barW / 2
        if (!started) { ctx.moveTo(x, toY(val)); started = true }
        else ctx.lineTo(x, toY(val))
      }
      ctx.stroke()
    })
    ctx.font = 'bold 7px monospace'
    ctx.fillStyle = '#f59e0b'; ctx.fillText('SMA20', pad.left + 2, pad.top + 9)
    if (allCloses.length >= 50) {
      ctx.fillStyle = '#06b6d4'; ctx.fillText('SMA50', pad.left + 40, pad.top + 9)
    }
  }

  if (indicatorName === 'EMA') {
    const emaLines = [
      { period: 20, color: '#f59e0b', label: 'EMA20' },
      { period: 50, color: '#06b6d4', label: 'EMA50' },
      { period: 100, color: '#a855f7', label: 'EMA100' },
      { period: 200, color: '#ef4444', label: 'EMA200' },
    ]
    emaLines.forEach(ema => {
      if (allCloses.length < ema.period) return
      const emaArr = computeEMAArray(allCloses, ema.period)
      ctx.strokeStyle = ema.color
      ctx.lineWidth = 1.5
      ctx.beginPath()
      let started = false
      for (let i = 0; i < items.length; i++) {
        const globalIdx = visibleOffset + i
        const val = emaArr[globalIdx]
        if (val === null) continue
        const x = pad.left + i * barW + barW / 2
        if (!started) { ctx.moveTo(x, toY(val)); started = true }
        else ctx.lineTo(x, toY(val))
      }
      ctx.stroke()
    })
    ctx.font = 'bold 7px monospace'
    let lx = pad.left + 2
    emaLines.forEach(ema => {
      if (allCloses.length < ema.period) return
      ctx.fillStyle = ema.color; ctx.fillText(ema.label, lx, pad.top + 9)
      lx += 38
    })
  }

  if (indicatorName === 'BB') {
    // Gambar upper, middle, lower bands
    const colors = ['#8b5cf660', '#3b82f6', '#8b5cf660']
    const labels = ['Upper', 'SMA20', 'Lower']
    for (let b = 0; b < 3; b++) {
      ctx.strokeStyle = colors[b]
      ctx.setLineDash(b !== 1 ? [3, 3] : [])
      ctx.beginPath()
      for (let i = 0; i < closes.length; i++) {
        const slice = closes.slice(i).reverse()
        const bb = calcBollinger(slice, Math.min(20, slice.length))
        const val = b === 0 ? bb.upper : b === 1 ? bb.middle : bb.lower
        const x = pad.left + i * barW + barW / 2
        if (i === 0) ctx.moveTo(x, toY(val))
        else ctx.lineTo(x, toY(val))
      }
      ctx.stroke()
      ctx.fillStyle = colors[b]
      ctx.font = 'bold 7px monospace'
      ctx.fillText(labels[b], pad.left + 2, pad.top + 10 + b * 10)
    }
    ctx.setLineDash([])
  }

  if (indicatorName === 'RSI') {
    // RSI oscillator di area bawah chart
    const rsiH = cH * 0.4
    const rsiTop = pad.top + cH - rsiH

    // Background zones — RSI 100 di atas, RSI 0 di bawah
    // Overbought (>70) = merah di ATAS
    ctx.fillStyle = '#ef444415'
    ctx.fillRect(pad.left, rsiTop, cW, rsiH * 0.3)
    // Oversold (<30) = hijau di BAWAH
    ctx.fillStyle = '#10b98115'
    ctx.fillRect(pad.left, rsiTop + rsiH * 0.7, cW, rsiH * 0.3)

    // Garis dashed di level 70 dan 30
    ctx.strokeStyle = '#ffffff30'
    ctx.setLineDash([2, 2])
    // y70 = 30% dari atas (RSI 70 → 1 - 70/100 = 0.3)
    const y70 = rsiTop + rsiH * 0.3
    // y30 = 70% dari atas (RSI 30 → 1 - 30/100 = 0.7)
    const y30 = rsiTop + rsiH * 0.7
    ctx.beginPath(); ctx.moveTo(pad.left, y70); ctx.lineTo(w - pad.right, y70); ctx.stroke()
    ctx.beginPath(); ctx.moveTo(pad.left, y30); ctx.lineTo(w - pad.right, y30); ctx.stroke()
    ctx.setLineDash([])

    // Level labels
    ctx.fillStyle = '#ef444480'
    ctx.font = 'bold 7px monospace'
    ctx.fillText('70', w - pad.right - 14, y70 - 2)
    ctx.fillStyle = '#10b98180'
    ctx.fillText('30', w - pad.right - 14, y30 + 8)

    // Pre-compute RSI dari allCloses
    function computeRSIArray(data: number[]): (number | null)[] {
      const result: (number | null)[] = []
      for (let i = 0; i < data.length; i++) {
        if (i < 14) { result.push(null); continue }
        const slice = data.slice(0, i + 1)
        let gains = 0, losses = 0
        for (let j = slice.length - 14; j < slice.length; j++) {
          const diff = slice[j] - slice[j - 1]
          if (diff > 0) gains += diff
          else losses -= diff
        }
        const avgGain = gains / 14
        const avgLoss = losses / 14
        const rs = avgLoss === 0 ? 100 : avgGain / avgLoss
        result.push(100 - (100 / (1 + rs)))
      }
      return result
    }

    const rsiArr = computeRSIArray(allCloses)

    // RSI line
    ctx.strokeStyle = '#a855f7'
    ctx.lineWidth = 2
    ctx.beginPath()
    let started = false
    for (let i = 0; i < items.length; i++) {
      const globalIdx = visibleOffset + i
      const val = rsiArr[globalIdx]
      if (val === null) continue
      const x = pad.left + i * barW + barW / 2
      const y = rsiTop + rsiH - (val / 100) * rsiH
      if (!started) { ctx.moveTo(x, y); started = true }
      else ctx.lineTo(x, y)
    }
    ctx.stroke()

    ctx.fillStyle = '#a855f7'
    ctx.font = 'bold 7px monospace'
    ctx.fillText('RSI-14', pad.left + 2, rsiTop + 8)
  }

  if (indicatorName === 'MACD') {
    // Gambar histogram MACD di bawah chart
    const macdH = cH * 0.3
    const macdTop = pad.top + cH - macdH

    for (let i = 0; i < closes.length - 26; i++) {
      const slice = closes.slice(i).reverse()
      const m = calcMACD(slice)
      const x = pad.left + i * barW
      const barHeight = Math.abs(m.histogram) * (macdH / (maxP - minP) * 50)
      const clampH = Math.min(barHeight, macdH * 0.9)

      ctx.fillStyle = m.histogram > 0 ? '#10b98160' : '#ef444460'
      if (m.histogram > 0) {
        ctx.fillRect(x + 1, macdTop + macdH - clampH, barW - 2, clampH)
      } else {
        ctx.fillRect(x + 1, macdTop, barW - 2, clampH)
      }
    }

    ctx.fillStyle = '#f59e0b'
    ctx.font = 'bold 7px monospace'
    ctx.fillText('MACD Hist', pad.left + 2, macdTop + 8)
  }

  if (indicatorName === 'VOL') {
    // Gambar volume bars di bawah chart
    const volH = cH * 0.25
    const volTop = pad.top + cH - volH
    const maxVol = Math.max(...volumes)

    items.forEach((_: any, i: number) => {
      const x = pad.left + i * barW
      const vH = maxVol > 0 ? (volumes[i] / maxVol) * volH : 0
      ctx.fillStyle = closes[i] >= opens[i] ? '#10b98140' : '#ef444440'
      ctx.fillRect(x + 1, volTop + volH - vH, barW - 2, vH)
    })

    // 5-day average volume line
    ctx.strokeStyle = '#f59e0b'
    ctx.lineWidth = 1
    ctx.beginPath()
    for (let i = 0; i < volumes.length - 5; i++) {
      const avg = volumes.slice(i, i + 5).reduce((a: number, b: number) => a + b, 0) / 5
      const x = pad.left + i * barW + barW / 2
      const y = volTop + volH - (maxVol > 0 ? (avg / maxVol) * volH : 0)
      if (i === 0) ctx.moveTo(x, y)
      else ctx.lineTo(x, y)
    }
    ctx.stroke()

    ctx.fillStyle = '#f59e0b'
    ctx.font = 'bold 7px monospace'
    ctx.fillText('VOL', pad.left + 2, volTop + 8)
  }
}

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
    showMethodModal.value = false
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
  const signalLine = macdLine * 0.85 // Simplified proxy
  return { macdLine, signalLine, histogram: macdLine - signalLine }
}

// Bollinger Bands (20 period, 2 std dev)
function calcBollinger(prices: number[], period = 20): { upper: number; middle: number; lower: number; bandwidth: number } {
  const sma = calcSMA(prices, period)
  const slice = prices.slice(0, Math.min(period, prices.length))
  const variance = slice.reduce((sum, p) => sum + Math.pow(p - sma, 2), 0) / slice.length
  const stdDev = Math.sqrt(variance)
  const bandwidth = sma > 0 ? ((sma + 2 * stdDev) - (sma - 2 * stdDev)) / sma * 100 : 0
  return { upper: sma + 2 * stdDev, middle: sma, lower: sma - 2 * stdDev, bandwidth }
}

// Volume trend
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

// ATR (Average True Range) — volatilitas
function calcATR(highs: number[], lows: number[], closes: number[], period = 14): number {
  if (highs.length < 2) return 0
  const trs: number[] = []
  for (let i = 0; i < Math.min(period + 1, highs.length - 1); i++) {
    const tr = Math.max(
      highs[i] - lows[i],
      Math.abs(highs[i] - closes[i + 1]),
      Math.abs(lows[i] - closes[i + 1])
    )
    trs.push(tr)
  }
  return trs.length > 0 ? trs.reduce((a, b) => a + b, 0) / trs.length : 0
}

// --- Multi-Methodology Engine ---
interface MethodResult {
  id: string
  name: string
  category: string
  description: string
  score: number
  bias: 'BULLISH' | 'BEARISH' | 'NEUTRAL'
  action: string
  conditions: { label: string; met: boolean }[]
}

const allMethods = computed<MethodResult[]>(() => {
  if (!isAnalyzed.value || !props.data || props.data.length < 20) return []

  const closePrices = props.data.map((d: any) => Number(d.close || d.Close || d.c || 0))
  const lowPrices = props.data.map((d: any) => Number(d.low || d.Low || d.l || 0))
  const highPrices = props.data.map((d: any) => Number(d.high || d.High || d.h || 0))
  const volumes = props.data.map((d: any) => Number(d.volume || d.Volume || d.vol || 0))

  const cp = closePrices[0] || 0
  const sma20 = calcSMA(closePrices, 20)
  const sma50 = calcSMA(closePrices, Math.min(50, closePrices.length))
  const ema12 = calcEMA(closePrices, 12)
  const ema26 = calcEMA(closePrices, 26)
  const rsi = calcRSI(closePrices)
  const macd = calcMACD(closePrices)
  const bb = calcBollinger(closePrices)
  const volTrend = calcVolumeTrend(volumes)
  const atr = calcATR(highPrices, lowPrices, closePrices)
  const atrPct = cp > 0 ? (atr / cp) * 100 : 0

  const support20 = Math.min(...lowPrices.slice(0, 20))
  const resistance20 = Math.max(...highPrices.slice(0, 20))
  const rangeWidth = resistance20 > 0 ? ((resistance20 - support20) / resistance20) * 100 : 0

  // Hitung return 10 hari
  const ret10 = closePrices.length >= 10 && closePrices[9] > 0
    ? ((cp - closePrices[9]) / closePrices[9]) * 100 : 0

  const methods: MethodResult[] = []

  // 1. Weinstein Stage 2 — Trend Following
  const w1 = cp > sma20 && sma20 > sma50
  const w2 = ema12 > ema26
  const w3 = rsi > 50 && rsi < 75
  const w4 = volTrend === 'RISING'
  methods.push({
    id: 'weinstein', name: 'Weinstein Stage 2 — Advancing', category: 'Trend Following',
    description: 'Harga berada di atas MA20 dan MA50 yang keduanya naik. Ini adalah fase paling menguntungkan untuk position trading. Momentum kuat dan tren sudah dikonfirmasi.',
    score: Math.round(([w1, w2, w3, w4].filter(Boolean).length / 4) * 100),
    bias: 'BULLISH', action: '🟢 Beli dan tahan selama harga di atas MA20. Trail stop di bawah MA50.',
    conditions: [
      { label: `Harga (${Math.round(cp)}) > SMA20 (${Math.round(sma20)}) > SMA50 (${Math.round(sma50)})`, met: w1 },
      { label: `EMA12 (${Math.round(ema12)}) > EMA26 (${Math.round(ema26)})`, met: w2 },
      { label: `RSI (${rsi.toFixed(1)}) di zona 50-75 (sweet spot)`, met: w3 },
      { label: `Volume trend: ${volTrend} (butuh RISING)`, met: w4 },
    ]
  })

  // 2. Minervini VCP (Volatility Contraction Pattern)
  const v1 = bb.bandwidth < 15
  const v2 = cp > sma20
  const v3 = atrPct < 3
  const v4 = rsi >= 45 && rsi <= 65
  methods.push({
    id: 'vcp', name: 'Minervini VCP — Volatility Contraction', category: 'Breakout Setup',
    description: 'Harga terkonsolidasi dengan volatilitas menyempit (Bollinger menyempit). Pola ini sering mendahului breakout besar. Semakin ketat konsolidasi, semakin kuat breakout potensial.',
    score: Math.round(([v1, v2, v3, v4].filter(Boolean).length / 4) * 100),
    bias: 'BULLISH', action: '🟡 Pantau ketat. Beli jika breakout di atas resistance dengan volume tinggi.',
    conditions: [
      { label: `BB Bandwidth (${bb.bandwidth.toFixed(1)}%) < 15% (menyempit)`, met: v1 },
      { label: `Harga (${Math.round(cp)}) > SMA20 (${Math.round(sma20)})`, met: v2 },
      { label: `ATR% (${atrPct.toFixed(2)}%) < 3% (volatilitas rendah)`, met: v3 },
      { label: `RSI (${rsi.toFixed(1)}) netral 45-65`, met: v4 },
    ]
  })

  // 3. Wyckoff Accumulation
  const wa1 = cp <= sma20
  const wa2 = rsi < 40
  const wa3 = cp <= bb.lower * 1.02
  const wa4 = volTrend === 'RISING'
  methods.push({
    id: 'wyckoff_acc', name: 'Wyckoff Accumulation — Spring Phase', category: 'Reversal (Bottom)',
    description: 'Harga mendekati atau di bawah support kuat dengan volume meningkat. Institusi mungkin sedang mengakumulasi. Potensi reversal bullish jika terjadi "spring" (false breakdown).',
    score: Math.round(([wa1, wa2, wa3, wa4].filter(Boolean).length / 4) * 100),
    bias: 'BULLISH', action: '🟠 Spekulatif. Beli hanya jika harga bounce dari support dengan volume tinggi.',
    conditions: [
      { label: `Harga (${Math.round(cp)}) ≤ SMA20 (${Math.round(sma20)})`, met: wa1 },
      { label: `RSI (${rsi.toFixed(1)}) < 40 (oversold area)`, met: wa2 },
      { label: `Harga dekat lower BB (${Math.round(bb.lower)})`, met: wa3 },
      { label: `Volume RISING (konfirmasi akumulasi)`, met: wa4 },
    ]
  })

  // 4. Wyckoff Distribution
  const wd1 = cp >= sma20 && cp > resistance20 * 0.95
  const wd2 = rsi > 65
  const wd3 = macd.histogram < 0
  const wd4 = volTrend === 'FALLING'
  methods.push({
    id: 'wyckoff_dist', name: 'Wyckoff Distribution — UTAD Phase', category: 'Reversal (Top)',
    description: 'Harga mendekati resistance kuat, RSI overbought, dan momentum mulai melemah. Institusi mungkin sedang mendistribusikan (menjual). Resiko penurunan tinggi.',
    score: Math.round(([wd1, wd2, wd3, wd4].filter(Boolean).length / 4) * 100),
    bias: 'BEARISH', action: '🔴 Hindari beli. Pertimbangkan jual/take profit jika sudah punya posisi.',
    conditions: [
      { label: `Harga dekat resistance (${Math.round(resistance20)})`, met: wd1 },
      { label: `RSI (${rsi.toFixed(1)}) > 65 (overbought area)`, met: wd2 },
      { label: `MACD Histogram negatif (momentum melemah)`, met: wd3 },
      { label: `Volume FALLING (distribusi)`, met: wd4 },
    ]
  })

  // 5. Bollinger Squeeze — Pre-Breakout
  const bs1 = bb.bandwidth < 10
  const bs2 = rangeWidth < 8
  const bs3 = rsi >= 40 && rsi <= 60
  methods.push({
    id: 'bb_squeeze', name: 'Bollinger Squeeze — Pre-Explosion', category: 'Volatility Play',
    description: 'Bollinger Bands sangat menyempit, menandakan volatilitas historis sangat rendah. Ledakan harga (breakout besar) sangat mungkin terjadi dalam waktu dekat ke arah manapun.',
    score: Math.round(([bs1, bs2, bs3].filter(Boolean).length / 3) * 100),
    bias: 'NEUTRAL', action: '🔵 Tunggu arah breakout. Pasang order di kedua sisi (buy stop + sell stop).',
    conditions: [
      { label: `BB Bandwidth (${bb.bandwidth.toFixed(1)}%) < 10% (sangat sempit)`, met: bs1 },
      { label: `Range 20 hari (${rangeWidth.toFixed(1)}%) < 8%`, met: bs2 },
      { label: `RSI (${rsi.toFixed(1)}) netral 40-60`, met: bs3 },
    ]
  })

  // 6. Mean Reversion — Oversold Bounce
  const mr1 = cp < bb.lower
  const mr2 = rsi < 30
  const mr3 = ret10 < -5
  methods.push({
    id: 'mean_rev', name: 'Mean Reversion — Oversold Bounce', category: 'Counter-Trend',
    description: 'Harga jauh di bawah rata-rata (oversold ekstrim). Secara statistik, harga cenderung kembali ke mean (SMA20). Peluang bounce jangka pendek cukup tinggi.',
    score: Math.round(([mr1, mr2, mr3].filter(Boolean).length / 3) * 100),
    bias: 'BULLISH', action: '🟡 Beli cepat (scalp/swing). Target: SMA20. Stop loss: 3% di bawah entry.',
    conditions: [
      { label: `Harga (${Math.round(cp)}) < BB Lower (${Math.round(bb.lower)})`, met: mr1 },
      { label: `RSI (${rsi.toFixed(1)}) < 30 (oversold ekstrim)`, met: mr2 },
      { label: `Return 10 hari (${ret10.toFixed(1)}%) < -5%`, met: mr3 },
    ]
  })

  // 7. Overbought Reversal
  const or1 = cp > bb.upper
  const or2 = rsi > 75
  const or3 = ret10 > 10
  methods.push({
    id: 'overbought', name: 'Overbought Warning — Potential Pullback', category: 'Counter-Trend',
    description: 'Harga sangat jauh di atas rata-rata dan RSI overbought. Koreksi/pullback sangat mungkin terjadi. Bukan waktu ideal untuk beli baru.',
    score: Math.round(([or1, or2, or3].filter(Boolean).length / 3) * 100),
    bias: 'BEARISH', action: '🔴 Jangan beli. Pertimbangkan take profit sebagian. Tunggu pullback ke SMA20.',
    conditions: [
      { label: `Harga (${Math.round(cp)}) > BB Upper (${Math.round(bb.upper)})`, met: or1 },
      { label: `RSI (${rsi.toFixed(1)}) > 75 (overbought)`, met: or2 },
      { label: `Return 10 hari (${ret10.toFixed(1)}%) > +10%`, met: or3 },
    ]
  })

  // 8. Momentum Breakout
  const mb1 = cp > resistance20 * 0.98
  const mb2 = macd.histogram > 0
  const mb3 = volTrend === 'RISING'
  const mb4 = rsi > 55 && rsi < 80
  methods.push({
    id: 'momentum', name: 'Momentum Breakout — New High', category: 'Momentum',
    description: 'Harga mendekati atau menembus resistance dengan momentum MACD positif dan volume naik. Breakout ini bisa menjadi awal tren naik baru yang kuat.',
    score: Math.round(([mb1, mb2, mb3, mb4].filter(Boolean).length / 4) * 100),
    bias: 'BULLISH', action: '🟢 Beli di breakout resistance. Stop loss: 3% di bawah resistance lama.',
    conditions: [
      { label: `Harga mendekati resistance (${Math.round(resistance20)})`, met: mb1 },
      { label: `MACD Histogram > 0 (momentum positif)`, met: mb2 },
      { label: `Volume RISING (konfirmasi breakout)`, met: mb3 },
      { label: `RSI (${rsi.toFixed(1)}) di 55-80 (kuat tapi belum overbought)`, met: mb4 },
    ]
  })

  // 9. Pullback Buy — Healthy Correction
  const pb1 = sma20 > sma50
  const pb2 = cp >= sma20 * 0.97 && cp <= sma20 * 1.02
  const pb3 = rsi >= 35 && rsi <= 55
  const pb4 = macd.macdLine > 0
  methods.push({
    id: 'pullback', name: 'Pullback Buy — Healthy Correction in Uptrend', category: 'Trend Following',
    description: 'Tren utama masih naik (SMA20 > SMA50) tapi harga sedang pullback ke area SMA20. Ini adalah titik entry terbaik dalam uptrend — "buy the dip" yang terukur.',
    score: Math.round(([pb1, pb2, pb3, pb4].filter(Boolean).length / 4) * 100),
    bias: 'BULLISH', action: '🟢 Ideal untuk beli. Harga di area support dinamis (SMA20). Stop: bawah SMA50.',
    conditions: [
      { label: `SMA20 (${Math.round(sma20)}) > SMA50 (${Math.round(sma50)}) = uptrend`, met: pb1 },
      { label: `Harga (${Math.round(cp)}) dekat SMA20 (pullback zone)`, met: pb2 },
      { label: `RSI (${rsi.toFixed(1)}) reset ke 35-55 (tidak overbought)`, met: pb3 },
      { label: `MACD Line > 0 (tren underlying masih positif)`, met: pb4 },
    ]
  })

  // 10. Range Trading — Sideways Market
  const rt1 = rangeWidth < 10
  const rt2 = rsi >= 40 && rsi <= 60
  const rt3 = Math.abs(macd.histogram) < cp * 0.005
  methods.push({
    id: 'range', name: 'Range Trading — Buy Support, Sell Resistance', category: 'Sideways Market',
    description: `Harga bergerak dalam range sempit (${rangeWidth.toFixed(1)}%). Strategi: beli di support (${Math.round(support20)}), jual di resistance (${Math.round(resistance20)}). Disiplin stop loss wajib.`,
    score: Math.round(([rt1, rt2, rt3].filter(Boolean).length / 3) * 100),
    bias: 'NEUTRAL', action: `🔵 Beli dekat ${Math.round(support20)}, jual dekat ${Math.round(resistance20)}. SL: 2% di luar range.`,
    conditions: [
      { label: `Range width (${rangeWidth.toFixed(1)}%) < 10% (sideways)`, met: rt1 },
      { label: `RSI (${rsi.toFixed(1)}) netral 40-60`, met: rt2 },
      { label: `MACD Histogram kecil (tidak ada momentum kuat)`, met: rt3 },
    ]
  })

  // Sort by score descending
  return methods.sort((a, b) => b.score - a.score)
})

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

  // === Tentukan Tren & Metode dari allMethods engine ===
  const bestMethod = allMethods.value[0]
  const method = bestMethod?.name || 'Analisa Belum Tersedia'
  const trendAnalysis = bestMethod
    ? `${bestMethod.description} (Score: ${bestMethod.score}%)`
    : `${bullishCount} dari ${totalSignals} indikator telah dihitung.`
  const buyAction = bestMethod?.action || '🔵 Tunggu Analisa'

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

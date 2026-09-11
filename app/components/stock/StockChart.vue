<template>
  <Teleport to="body" :disabled="!isFullscreen">
    <div class="border overflow-hidden transition-all duration-200"
      :class="[
        isFullscreen ? 'fixed inset-0 z-[99999] w-screen h-[100dvh] flex flex-col p-0 m-0 bg-[#08090d] rounded-none border-none' : 'relative rounded-2xl',
        isDark ? 'bg-[#0d0f17]/90 border-white/[0.08] shadow-2xl' : 'bg-white border-slate-200 shadow-sm'
      ]"
    >
      <!-- Linear Terminal Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b"
        :class="[
          isDark ? 'border-white/[0.06]' : 'border-slate-100',
          isFullscreen ? 'px-4 py-2.5 sm:px-6 sm:py-3' : 'px-4 sm:px-5 pt-4 sm:pt-5 pb-3'
        ]"
      >
      <div class="flex items-center gap-2.5 shrink-0">
        <span class="px-2 py-0.5 rounded-xl text-[9px] font-mono font-bold uppercase tracking-widest border"
          :class="isDark ? 'bg-white/[0.04] border-white/[0.08] text-slate-300' : 'bg-slate-100 border-slate-200 text-slate-700'"
        >
          OHLCV TERMINAL
        </span>
        <h3 class="font-headline font-bold text-sm uppercase tracking-tight" :class="isDark ? 'text-white' : 'text-slate-900'">
          Interactive Chart
        </h3>
        <span v-if="data?.length" class="text-[10px] font-mono opacity-50 hidden md:inline">
          // {{ activeCandle }} per candle
        </span>
      </div>

      <!-- Timeframe Selector -->
      <div class="flex w-full sm:w-auto flex-wrap items-center justify-between sm:justify-end gap-1.5 font-mono text-[10px]">
        <div class="flex flex-wrap items-center gap-1 p-1 rounded-xl border" :class="isDark ? 'bg-white/[0.02] border-white/[0.06]' : 'bg-slate-100/70 border-slate-200/60'">
          <button v-for="p in periods" :key="p.interval" @click="changePeriod(p.interval)"
            class="px-2.5 py-1 rounded-lg uppercase font-bold tracking-wider transition-all cursor-pointer"
            :class="activePeriod === p.interval
              ? (isDark ? 'bg-white text-slate-950 font-black shadow-xs' : 'bg-slate-900 text-white font-black shadow-xs')
              : (isDark ? 'text-slate-400 hover:text-white hover:bg-white/[0.05]' : 'text-slate-600 hover:text-slate-950 hover:bg-white/60')"
          >
            {{ p.label }}
          </button>
        </div>
      </div>
    </div>

    <!-- Sub-header info mobile -->
    <div v-if="data?.length && !isFullscreen" class="px-5 py-2 flex items-center justify-between text-[10px] font-mono border-b md:hidden"
      :class="isDark ? 'border-neutral-800 text-neutral-400' : 'border-neutral-200 text-neutral-600'"
    >
      <span>INTERVAL: {{ activeCandle }}</span>
      <span class="text-emerald-500 font-bold">REALTIME FEED</span>
    </div>

    <!-- Empty State -->
    <div v-if="!data?.length && !loading" class="flex flex-col items-center justify-center py-10 text-center font-mono" style="height: 440px;">
      <div class="w-12 h-12 rounded-xl flex items-center justify-center mb-3 border"
        :class="isDark ? 'bg-neutral-900 border-neutral-800 text-neutral-400' : 'bg-neutral-100 border-neutral-300 text-neutral-600'"
      >
        <span class="material-symbols-outlined text-xl">candlestick_chart</span>
      </div>
      <h4 class="font-bold text-sm mb-1 uppercase tracking-wider" :class="isDark ? 'text-white' : 'text-neutral-900'">OHLCV CHART STANDBY</h4>
      <p class="text-[11px] text-neutral-500 mb-4 max-w-[280px]">Klik untuk memuat grafik pergerakan harga historis.</p>
      <button @click="$emit('fetch', getActivePeriodParams())"
        class="px-6 py-2.5 rounded-xl text-xs font-bold font-headline uppercase tracking-wider transition-all border cursor-pointer"
        :class="isDark ? 'bg-white text-neutral-950 border-white hover:bg-neutral-200' : 'bg-neutral-950 text-white border-neutral-950 hover:bg-neutral-800'"
      >
        Tampilkan Chart
      </button>
    </div>

    <!-- Chart Canvas Container -->
    <div v-else class="relative px-2 pb-2 pt-2 flex-1 w-full flex flex-col min-h-0" :style="isFullscreen ? undefined : { height: '440px' }">
      <!-- Loading -->
      <div v-if="loading && !isLoadingMore" class="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-xs z-10 font-mono text-xs">
        <div class="flex items-center gap-2 px-4 py-2 rounded-xl border bg-neutral-900 border-neutral-700 text-white">
          <span class="material-symbols-outlined text-primary animate-spin text-base">progress_activity</span>
          <span>LOADING STREAM...</span>
        </div>
      </div>

      <!-- Canvas -->
      <canvas ref="canvasRef" class="w-full h-full touch-none cursor-grab active:cursor-grabbing" :class="{ 'opacity-0': loading && !isLoadingMore, 'opacity-50 blur-[1px] cursor-wait': loading && isLoadingMore }"></canvas>

      <!-- Loading indicator saat auto-load more -->
      <div v-if="atLeftEdge && loading" class="absolute left-3 top-1/2 -translate-y-1/2 z-20 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-mono font-bold backdrop-blur-md border"
        :class="isDark ? 'bg-neutral-900/90 text-primary border-neutral-700' : 'bg-white/90 text-neutral-800 border-neutral-300'"
      >
        <span class="material-symbols-outlined text-sm animate-spin">progress_activity</span>
        MEMUAT DATA HISTORIS...
      </div>

      <!-- Active Pattern Visual Floating Badges -->
      <div v-if="data?.length && detectedPatterns.length > 0 && !isAnalyzingPattern" class="absolute top-4 left-3 flex flex-col items-start gap-1.5 z-20 pointer-events-none font-mono">
        <template v-for="(pat, idx) in detectedPatterns" :key="'pat-'+idx">
          <div v-if="pat.label" class="animate-in fade-in slide-in-from-top-2 duration-300">
             <div class="backdrop-blur-md px-2.5 py-1 text-[9px] font-black tracking-widest uppercase shadow-md flex items-center gap-1.5 border truncate max-w-full rounded-xs"
               :style="{ backgroundColor: isDark ? '#09090bF0' : '#FFFFFFFA', color: pat.color, borderColor: pat.color }"
             >
               <span class="material-symbols-outlined text-[13px]">{{ pat.category === 'BULLISH' ? 'trending_up' : pat.category === 'BEARISH' ? 'trending_down' : 'swap_horiz' }}</span>
               {{ pat.label }}
             </div>
          </div>
        </template>
      </div>

      <!-- Type Toggle, Pattern Analyzer, Zoom & Fullscreen Toolbar (Linear Minimalist Bar) -->
      <div v-if="data?.length" class="absolute bottom-3 right-3 flex items-center backdrop-blur-xl rounded-xl p-1 z-30 border shadow-2xl font-mono text-[10px]"
        :class="isDark ? 'bg-[#0a0c14]/90 border-white/[0.12] text-slate-200' : 'bg-white/95 border-slate-200 text-slate-800 shadow-slate-300/40'"
      >
        <!-- Pola Button -->
        <button @click="analyzeChartPatterns" class="h-6 px-2.5 flex items-center justify-center gap-1.5 rounded-lg transition-all border border-transparent font-semibold cursor-pointer" 
           :class="isAnalyzingPattern ? 'animate-pulse text-purple-400' : detectedPatterns.length ? 'bg-purple-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'"
           title="Deteksi Pola Chart & Price Action Otomatis">
           <span class="material-symbols-outlined text-[14px]">draw</span>
           <span class="text-[9px] font-bold uppercase tracking-wider">{{ detectedPatterns.length ? 'POLA AKTIF' : 'DETEKSI POLA' }}</span>
        </button>
        <div class="w-px h-3.5 mx-1" :class="isDark ? 'bg-white/[0.08]' : 'bg-slate-200'"></div>

        <!-- Candle / Line Toggle -->
        <button @click="chartType = 'candle'" class="w-6 h-6 flex items-center justify-center rounded-lg transition-all cursor-pointer"
          :class="chartType === 'candle' ? (isDark ? 'bg-white text-slate-950 font-bold shadow-xs' : 'bg-slate-900 text-white font-bold shadow-xs') : 'text-slate-400 hover:text-white'"
          title="Tampilan Candlestick"
        >
          <span class="material-symbols-outlined text-[15px]">candlestick_chart</span>
        </button>
        <button @click="chartType = 'line'" class="w-6 h-6 flex items-center justify-center rounded-lg transition-all cursor-pointer"
          :class="chartType === 'line' ? (isDark ? 'bg-white text-slate-950 font-bold shadow-xs' : 'bg-slate-900 text-white font-bold shadow-xs') : 'text-slate-400 hover:text-white'"
          title="Tampilan Line Chart"
        >
          <span class="material-symbols-outlined text-[15px]">show_chart</span>
        </button>

        <div class="w-px h-3.5 mx-1" :class="isDark ? 'bg-white/[0.08]' : 'bg-slate-200'"></div>

        <!-- Zoom In / Zoom Out / Reset Controls -->
        <button @click="zoomIn" class="w-6 h-6 flex items-center justify-center rounded-lg transition-all text-slate-400 hover:text-white cursor-pointer"
          title="Zoom In (Perbesar Candle)"
        >
          <span class="material-symbols-outlined text-[15px]">zoom_in</span>
        </button>
        <button @click="zoomOut" class="w-6 h-6 flex items-center justify-center rounded-lg transition-all text-slate-400 hover:text-white cursor-pointer"
          title="Zoom Out (Perkecil / Tampilkan Lebih Banyak)"
        >
          <span class="material-symbols-outlined text-[15px]">zoom_out</span>
        </button>
        <button @click="resetZoom" class="w-6 h-6 flex items-center justify-center rounded-lg transition-all text-slate-400 hover:text-white cursor-pointer"
          title="Reset Zoom Normal"
        >
          <span class="material-symbols-outlined text-[14px]">restart_alt</span>
        </button>

        <div class="w-px h-3.5 mx-1" :class="isDark ? 'bg-white/[0.08]' : 'bg-slate-200'"></div>

        <!-- Fullscreen Landscape Toggle Button -->
        <button @click="toggleFullscreen" class="h-6 px-2 flex items-center justify-center gap-1 rounded-lg transition-all font-semibold cursor-pointer"
          :class="isFullscreen ? 'bg-amber-500 text-black font-black' : 'text-slate-400 hover:text-white'"
          :title="isFullscreen ? 'Keluar Fullscreen (Esc)' : 'TradingView Fullscreen Landscape'"
        >
          <span class="material-symbols-outlined text-[15px]">{{ isFullscreen ? 'fullscreen_exit' : 'fullscreen' }}</span>
          <span class="text-[9px] font-bold uppercase tracking-wider">{{ isFullscreen ? 'EXIT' : 'FULLSCREEN' }}</span>
        </button>
      </div>

      <!-- Crosshair Vertical Line -->
      <div v-if="tooltip.show" class="absolute top-[30px] bottom-[30px] w-px pointer-events-none z-0 border-r border-dashed"
        :class="isDark ? 'border-neutral-500/40' : 'border-neutral-900/30'"
        :style="{ left: tooltip.cx + 'px' }"
      ></div>
      
      <!-- Crosshair Date Tag Top -->
      <div v-if="tooltip.show" class="absolute top-[2px] transform -translate-x-1/2 px-2 py-0.5 rounded-xs text-[9px] font-mono font-bold z-20 shadow-sm border uppercase"
        :class="isDark ? 'bg-white text-neutral-950 border-white' : 'bg-neutral-950 text-white border-neutral-950'"
        :style="{ left: tooltip.cx + 'px' }"
      >
        {{ tooltip.dateFormatted }}
      </div>

      <!-- Tooltip Box (Swiss Modular Precision Card) -->
      <Transition
        enter-active-class="transition duration-100 ease-out"
        enter-from-class="opacity-0 scale-95"
        enter-to-class="opacity-100 scale-100"
        leave-active-class="transition duration-75 ease-in"
        leave-from-class="opacity-100 scale-100"
        leave-to-class="opacity-0 scale-95"
      >
        <div v-if="tooltip.show"
          class="absolute z-30 pointer-events-none p-2.5 rounded-xl border text-[10px] font-mono shadow-2xl backdrop-blur-md"
          :class="isDark ? 'bg-neutral-950/95 border-neutral-700 text-white' : 'bg-white/95 border-neutral-300 text-neutral-900'"
          :style="{ left: tooltip.x + 'px', top: tooltip.y + 'px' }"
        >
          <p class="font-bold border-b pb-1 mb-1.5 opacity-60 text-[9px] uppercase tracking-wider"
            :class="isDark ? 'border-neutral-800' : 'border-neutral-200'"
          >{{ tooltip.dateFormatted }}</p>
          <div class="grid grid-cols-2 gap-x-3 gap-y-0.5">
            <span class="opacity-50 uppercase">OPEN</span><span class="text-right font-bold">{{ tooltip.open }}</span>
            <span class="opacity-50 uppercase">HIGH</span><span class="text-right font-bold text-emerald-500">{{ tooltip.high }}</span>
            <span class="opacity-50 uppercase">LOW</span><span class="text-right font-bold text-red-500">{{ tooltip.low }}</span>
            <span class="opacity-50 uppercase">CLOSE</span><span class="text-right font-black" :class="isDark ? 'text-white' : 'text-neutral-950'">{{ tooltip.close }}</span>
            <span class="opacity-50 uppercase">VOLUME</span><span class="text-right font-bold text-primary">{{ tooltip.volume }}</span>
          </div>
        </div>
      </Transition>
    </div>

    <!-- Interactive Pattern Diagnostic Card (Linear Minimalist Card) -->
    <div v-if="primaryPattern && !isFullscreen" class="p-5 border-t font-sans transition-all"
      :class="primaryPattern.category === 'BULLISH'
        ? (isDark ? 'bg-emerald-500/[0.04] border-emerald-500/20 text-slate-100' : 'bg-emerald-50/70 border-emerald-200 text-slate-900')
        : primaryPattern.category === 'BEARISH'
        ? (isDark ? 'bg-rose-500/[0.04] border-rose-500/20 text-slate-100' : 'bg-rose-50/70 border-rose-200 text-slate-900')
        : (isDark ? 'bg-amber-500/[0.04] border-amber-500/20 text-slate-100' : 'bg-amber-50/70 border-amber-200 text-slate-900')"
    >
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
        <div class="flex items-center gap-2">
          <span class="px-2.5 py-0.5 rounded-xl text-[10px] font-mono font-bold uppercase tracking-wider border"
            :class="primaryPattern.category === 'BULLISH' 
              ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' 
              : primaryPattern.category === 'BEARISH' 
              ? 'bg-rose-500/20 text-rose-400 border-rose-500/30' 
              : 'bg-amber-500/20 text-amber-400 border-amber-500/30'"
          >
            Deteksi Pola
          </span>
          <h4 class="font-bold text-sm uppercase tracking-tight"
            :class="primaryPattern.category === 'BULLISH' ? 'text-emerald-400' : primaryPattern.category === 'BEARISH' ? 'text-rose-400' : 'text-amber-400'"
          >
            {{ primaryPattern.label }}
          </h4>
        </div>
        <span class="text-xs font-mono font-semibold opacity-75">Confidence: {{ primaryPattern.confidence }}%</span>
      </div>

      <p class="text-xs leading-relaxed opacity-85 mb-3">{{ primaryPattern.description }}</p>

      <!-- Action Plan & Key Levels -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-3 border-t text-xs font-mono" :class="isDark ? 'border-white/[0.06]' : 'border-slate-200/80'">
        <div v-if="primaryPattern.neckline" class="p-2.5 border rounded-xl" :class="isDark ? 'bg-black/30 border-white/[0.08]' : 'bg-white border-slate-200 shadow-2xs'">
          <span class="opacity-50 text-[9px] uppercase tracking-wider block font-sans">Garis Konfirmasi (Neckline)</span>
          <strong class="font-bold tabular-nums text-sm">Rp {{ fmt(primaryPattern.neckline) }}</strong>
        </div>
        <div v-if="primaryPattern.target" class="p-2.5 border rounded-xl" :class="isDark ? 'bg-black/30 border-white/[0.08]' : 'bg-white border-slate-200 shadow-2xs'">
          <span class="opacity-50 text-[9px] uppercase tracking-wider block font-sans">Target Proyeksi Pola</span>
          <strong class="font-bold tabular-nums text-sm" :class="primaryPattern.category === 'BULLISH' ? 'text-emerald-400' : 'text-rose-400'">Rp {{ fmt(primaryPattern.target) }}</strong>
        </div>
        <div class="p-2.5 border rounded-xl" :class="[primaryPattern.neckline && primaryPattern.target ? '' : 'sm:col-span-2', isDark ? 'bg-black/30 border-white/[0.08]' : 'bg-white border-slate-200 shadow-2xs']">
          <span class="opacity-50 text-[9px] uppercase tracking-wider block font-sans">Rekomendasi Tindakan</span>
          <p class="font-medium text-xs leading-tight text-primary font-sans mt-0.5">{{ primaryPattern.actionAdvice }}</p>
        </div>
      </div>
    </div>
  </div>
</Teleport>
</template>

<script setup lang="ts">
/**
 * Swiss Graphic Design Chart Terminal
 * Features: Timeframe 1M to 1MO, Fullscreen Landscape Mode, Advanced Pattern Recognition, Precision Candlestick Canvas
 */
import { ref, reactive, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'

const props = defineProps<{
  data: any[]
  loading: boolean
  plan?: any
}>()

const emit = defineEmits<{
  loadMore: []
  periodChange: [params: { interval: string; range: string }]
  fetch: [params: { interval: string; range: string }]
}>()

const { isDark } = useColorMode()
const canvasRef = ref<HTMLCanvasElement | null>(null)

// Fullscreen State
const isFullscreen = ref(false)

function toggleFullscreen() {
  isFullscreen.value = !isFullscreen.value
  if (isFullscreen.value) {
    try {
      if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen().catch(() => {})
      }
      if (screen?.orientation && 'lock' in screen.orientation) {
        (screen.orientation as any).lock('landscape').catch(() => {})
      }
    } catch (_) {}
  } else {
    try {
      if (document.fullscreenElement && document.exitFullscreen) {
        document.exitFullscreen().catch(() => {})
      }
    } catch (_) {}
  }
  nextTick(() => {
    setTimeout(() => drawChart(), 100)
  })
}

// Sinkronisasi status saat keluar dari fullscreen browser (misal lewat Escape atau F11)
function onFullscreenChange() {
  if (!document.fullscreenElement && isFullscreen.value) {
    isFullscreen.value = false
    nextTick(() => {
      setTimeout(() => drawChart(), 100)
    })
  }
}

// Esc key listener untuk mode fullscreen
function handleKeyDown(e: KeyboardEvent) {
  if (e.key === 'Escape' && isFullscreen.value) {
    isFullscreen.value = false
    if (document.fullscreenElement && document.exitFullscreen) {
      document.exitFullscreen().catch(() => {})
    }
    nextTick(() => drawChart())
  }
}

interface TimeframePeriod {
  label: string
  interval: string
  range: string
  candleLabel: string
}

const periods: TimeframePeriod[] = [
  { label: '1M', interval: '1m', range: '5d', candleLabel: '1 Menit' },
  { label: '5M', interval: '5m', range: '1mo', candleLabel: '5 Menit' },
  { label: '15M', interval: '15m', range: '1mo', candleLabel: '15 Menit' },
  { label: '30M', interval: '30m', range: '3mo', candleLabel: '30 Menit' },
  { label: '1H', interval: '60m', range: '1y', candleLabel: '1 Jam' },
  { label: '1D', interval: '1d', range: '2y', candleLabel: '1 Hari' },
  { label: '1W', interval: '1wk', range: '5y', candleLabel: '1 Minggu' },
  { label: '1MO', interval: '1mo', range: '10y', candleLabel: '1 Bulan' },
]

const activePeriod = ref('1d')
const activeCandle = computed(() => periods.find(p => p.interval === activePeriod.value)?.candleLabel || '1 Hari')

const chartType = ref('candle')
const isAnalyzingPattern = ref(false)

const panOffset = ref(0)
const visibleCandles = ref(60)
let isDragging = false
let dragStartX = 0
let dragStartPan = 0
let currentBarGap = 10
let maxPanState = 0
let isPinching = false
let initialPinchDist = 0
let initialVisibleCandles = 60
let isMobileLongPress = false
let longPressTimer: ReturnType<typeof setTimeout> | null = null
const isLoadingMore = ref(false)
let anchorTimestamp: number | null = null

interface CanvasPattern {
  type: string
  label: string
  category: 'BULLISH' | 'BEARISH' | 'NEUTRAL'
  confidence: number
  description: string
  actionAdvice: string
  neckline?: number
  target?: number
  invalidation?: number
  points: { i: number; price: number; label?: string }[]
  color: string
  boxTop?: number
  boxBottom?: number
}

const detectedPatterns = ref<CanvasPattern[]>([])

const primaryPattern = computed(() => {
  const nonTrend = detectedPatterns.value.filter(p => p.type !== 'trend_curve')
  return nonTrend[0] || null
})

const tooltip = reactive({
  show: false,
  x: 0,
  y: 0,
  cx: 0,
  dateFormatted: '',
  date: '',
  open: '',
  high: '',
  low: '',
  close: '',
  volume: '',
})

function getActivePeriodParams(): { interval: string; range: string } {
  const p = periods.find(p => p.interval === activePeriod.value)
  return { interval: p?.interval || '1d', range: p?.range || '2y' }
}

function changePeriod(interval: string) {
  activePeriod.value = interval
  const p = periods.find(p => p.interval === interval)
  if (p) emit('periodChange', { interval: p.interval, range: p.range })
}

function fmt(n: number): string {
  if (!n) return '-'
  return new Intl.NumberFormat('id-ID').format(Math.round(n))
}

function fmtVol(n: number): string {
  if (n >= 1_000_000_000) return (n / 1_000_000_000).toFixed(1) + 'B'
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M'
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K'
  return n.toString()
}

watch(() => props.data, () => {
  if (anchorTimestamp && props.data?.length) {
    const sorted = [...props.data].sort((a: any, b: any) => {
      const tA = a.timestamp || new Date(a.date || a.Date || 0).getTime()
      const tB = b.timestamp || new Date(b.date || b.Date || 0).getTime()
      return tA - tB
    })
    const newAnchorIdx = sorted.findIndex((d: any) => {
      const t = d.timestamp || new Date(d.date || d.Date || 0).getTime()
      return t >= anchorTimestamp!
    })
    if (newAnchorIdx >= 0) {
      const newPan = sorted.length - visibleCandles.value - newAnchorIdx
      panOffset.value = Math.max(0, newPan)
    }
    anchorTimestamp = null
  }
  isLoadingMore.value = false
  nextTick(() => drawChart())
}, { deep: true })

const atLeftEdge = computed(() => {
  if (!props.data?.length) return false
  const maxPan = Math.max(0, props.data.length - visibleCandles.value)
  return panOffset.value >= maxPan && maxPan > 0
})

watch(atLeftEdge, (isEdge) => {
  if (isEdge && !props.loading && !isLoadingMore.value && props.data?.length) {
    const sorted = [...props.data].sort((a: any, b: any) => {
      const tA = a.timestamp || new Date(a.date || a.Date || 0).getTime()
      const tB = b.timestamp || new Date(b.date || b.Date || 0).getTime()
      return tA - tB
    })
    const leftVisibleIdx = Math.max(0, sorted.length - visibleCandles.value - panOffset.value)
    const anchorCandle = sorted[leftVisibleIdx]
    if (anchorCandle) {
      anchorTimestamp = anchorCandle.timestamp || new Date(anchorCandle.date || anchorCandle.Date || 0).getTime()
    }
    
    isLoadingMore.value = true
    emit('loadMore')
  }
})

watch(() => props.plan, () => {
  nextTick(() => drawChart())
}, { deep: true })

watch(chartType, () => nextTick(() => drawChart()))
watch(isDark, () => nextTick(() => drawChart()))

// Handler mouse drag di window agar panning tetap berjalan saat kursor melewati batas canvas
function onWindowMouseUp() {
  isDragging = false
}

function onWindowMouseMove(e: MouseEvent) {
  if (isDragging && currentBarGap > 0) {
    const dx = e.clientX - dragStartX
    const candlesMoved = Math.round(dx / currentBarGap)
    panOffset.value = Math.max(0, Math.min(dragStartPan + candlesMoved, maxPanState))
    drawChart()
  }
}

let resizeObserver: ResizeObserver | null = null

onMounted(() => {
  drawChart()
  window.addEventListener('keydown', handleKeyDown)
  window.addEventListener('mouseup', onWindowMouseUp)
  window.addEventListener('mousemove', onWindowMouseMove)
  document.addEventListener('fullscreenchange', onFullscreenChange)
  if (canvasRef.value) {
    resizeObserver = new ResizeObserver(() => drawChart())
    resizeObserver.observe(canvasRef.value.parentElement!)
  }
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown)
  window.removeEventListener('mouseup', onWindowMouseUp)
  window.removeEventListener('mousemove', onWindowMouseMove)
  document.removeEventListener('fullscreenchange', onFullscreenChange)
  resizeObserver?.disconnect()
})

// Draw Canvas
function drawChart() {
  const canvas = canvasRef.value
  if (!canvas) return

  const parent = canvas.parentElement
  if (!parent) return

  const dpr = window.devicePixelRatio || 1
  const rect = parent.getBoundingClientRect()
  const width = rect.width || 600
  const height = rect.height || 440

  canvas.width = width * dpr
  canvas.height = height * dpr
  canvas.style.width = width + 'px'
  canvas.style.height = height + 'px'

  const ctx = canvas.getContext('2d')
  if (!ctx) return

  ctx.scale(dpr, dpr)
  ctx.clearRect(0, 0, width, height)

  const rawData = props.data || []
  if (rawData.length === 0) return

  const sortedData = [...rawData].sort((a: any, b: any) => {
    const tA = a.timestamp || new Date(a.date || a.Date || 0).getTime()
    const tB = b.timestamp || new Date(b.date || b.Date || 0).getTime()
    return tA - tB
  })

  const totalLen = sortedData.length
  const maxVisible = Math.min(visibleCandles.value, totalLen)
  const maxPan = Math.max(0, totalLen - maxVisible)
  maxPanState = maxPan
  panOffset.value = Math.max(0, Math.min(panOffset.value, maxPan))

  const startIdx = totalLen - maxVisible - panOffset.value
  const items = sortedData.slice(Math.max(0, startIdx), Math.max(0, startIdx) + maxVisible)
  if (items.length === 0) return

  const padding = { top: 25, right: 60, bottom: 25, left: 10 }
  const chartW = width - padding.left - padding.right
  const chartH = height - padding.top - padding.bottom

  const barGap = chartW / items.length
  currentBarGap = barGap

  const highs = items.map((d: any) => Number(d.high || d.High || d.h || 0))
  const lows = items.map((d: any) => Number(d.low || d.Low || d.l || 0))
  let maxPrice = Math.max(...highs)
  let minPrice = Math.min(...lows)

  if (props.plan) {
    if (props.plan.target) maxPrice = Math.max(maxPrice, props.plan.target)
    if (props.plan.stopLoss) minPrice = Math.min(minPrice, props.plan.stopLoss)
  }

  // Include pattern lines in price scaling
  if (detectedPatterns.value.length > 0) {
    detectedPatterns.value.forEach(p => {
      if (p.neckline) { maxPrice = Math.max(maxPrice, p.neckline); minPrice = Math.min(minPrice, p.neckline); }
      if (p.target) { maxPrice = Math.max(maxPrice, p.target); minPrice = Math.min(minPrice, p.target); }
      if (p.boxTop) maxPrice = Math.max(maxPrice, p.boxTop);
      if (p.boxBottom) minPrice = Math.min(minPrice, p.boxBottom);
    })
  }

  const pRange = maxPrice - minPrice
  maxPrice += pRange * 0.05
  minPrice -= pRange * 0.05
  const totalRange = maxPrice - minPrice || 1

  const barWidth = Math.max(barGap * 0.7, 1.5)

  // Color Palette
  const upColor = '#10b981'
  const downColor = '#ef4444'
  const gridColor = isDark.value ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.06)'
  const textColor = isDark.value ? '#8b949e' : '#64748b'

  // Grid Lines & Price Slices
  ctx.strokeStyle = gridColor
  ctx.lineWidth = 1
  ctx.fillStyle = textColor
  ctx.font = 'bold 9px monospace, sans-serif'
  ctx.textAlign = 'right'

  const gridLines = 5
  for (let i = 0; i <= gridLines; i++) {
    const y = padding.top + (chartH / gridLines) * i
    const price = maxPrice - (totalRange / gridLines) * i

    ctx.beginPath()
    ctx.setLineDash([3, 3])
    ctx.moveTo(padding.left, y)
    ctx.lineTo(width - padding.right, y)
    ctx.stroke()
    ctx.setLineDash([])

    ctx.fillText(fmt(Math.round(price)), width - 5, y + 3.5)
  }

  // Render Candles or Line
  if (chartType.value === 'candle') {
    for (let i = 0; i < items.length; i++) {
      const d = items[i]
      const open = d.open || d.Open || d.o || 0
      const close = d.close || d.Close || d.c || 0
      const high = d.high || d.High || d.h || 0
      const low = d.low || d.Low || d.l || 0

      const x = padding.left + barGap * i + barGap / 2
      const isUp = close >= open
      const color = isUp ? upColor : downColor

      const yOpen = padding.top + ((maxPrice - open) / totalRange) * chartH
      const yClose = padding.top + ((maxPrice - close) / totalRange) * chartH
      const yHigh = padding.top + ((maxPrice - high) / totalRange) * chartH
      const yLow = padding.top + ((maxPrice - low) / totalRange) * chartH

      // Wick
      ctx.strokeStyle = color
      ctx.lineWidth = 1.2
      ctx.beginPath()
      ctx.moveTo(x, yHigh)
      ctx.lineTo(x, yLow)
      ctx.stroke()

      // Body
      ctx.fillStyle = color
      const bodyTop = Math.min(yOpen, yClose)
      const bodyH = Math.max(Math.abs(yClose - yOpen), 1.5)
      ctx.fillRect(x - barWidth / 2, bodyTop, barWidth, bodyH)
    }
  } else {
    // Swiss Line
    const linePoints: { x: number; y: number }[] = []
    for (let i = 0; i < items.length; i++) {
      const close = items[i].close || items[i].Close || items[i].c || 0
      const x = padding.left + barGap * i + barGap / 2
      const yClose = padding.top + ((maxPrice - close) / totalRange) * chartH
      linePoints.push({ x, y: yClose })
    }

    if (linePoints.length > 1) {
      const grad = ctx.createLinearGradient(0, padding.top, 0, height - padding.bottom)
      grad.addColorStop(0, isDark.value ? 'rgba(59,130,246,0.25)' : 'rgba(59,130,246,0.18)')
      grad.addColorStop(1, 'rgba(59,130,246,0)')
      ctx.fillStyle = grad
      ctx.beginPath()
      ctx.moveTo(linePoints[0]!.x, height - padding.bottom)
      for (const p of linePoints) ctx.lineTo(p.x, p.y)
      ctx.lineTo(linePoints[linePoints.length - 1]!.x, height - padding.bottom)
      ctx.closePath()
      ctx.fill()
    }

    ctx.strokeStyle = '#2563eb'
    ctx.lineWidth = 2
    ctx.beginPath()
    for (let i = 0; i < linePoints.length; i++) {
      const p = linePoints[i]!
      if (i === 0) ctx.moveTo(p.x, p.y)
      else ctx.lineTo(p.x, p.y)
    }
    ctx.stroke()
  }

  // Draw Swiss Trading Plan Overlays
  if (props.plan) {
    const s1 = props.plan.support1
    const r1 = props.plan.target
    const sl = props.plan.stopLoss
    const [bBottom, bTop] = props.plan.buyZone || [s1, s1]

    const yS1 = padding.top + ((maxPrice - s1) / totalRange) * chartH
    const yR1 = padding.top + ((maxPrice - r1) / totalRange) * chartH
    const ySL = padding.top + ((maxPrice - sl) / totalRange) * chartH
    const yBBottom = Math.min(height - padding.bottom, Math.max(padding.top, padding.top + ((maxPrice - bBottom) / totalRange) * chartH))
    const yBTop = Math.min(height - padding.bottom, Math.max(padding.top, padding.top + ((maxPrice - bTop) / totalRange) * chartH))

    // Buy Zone Fill
    if (yBTop >= padding.top && yBBottom <= height - padding.bottom) {
      ctx.fillStyle = isDark.value ? 'rgba(16, 185, 129, 0.12)' : 'rgba(16, 185, 129, 0.16)'
      ctx.fillRect(padding.left, yBTop, chartW, yBBottom - yBTop)
      
      ctx.strokeStyle = '#10b981'
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(padding.left, yBTop)
      ctx.lineTo(width - padding.right, yBTop)
      ctx.stroke()

      ctx.beginPath()
      ctx.moveTo(padding.left, yBBottom)
      ctx.lineTo(width - padding.right, yBBottom)
      ctx.stroke()
    }

    const drawSwissBadgeLine = (y: number, color: string, label: string, priceVal: number, subLabel?: string) => {
      if (y < padding.top || y > height - padding.bottom) return
      ctx.strokeStyle = color
      ctx.lineWidth = 1.2
      ctx.beginPath()
      ctx.setLineDash([4, 4])
      ctx.moveTo(padding.left, y)
      ctx.lineTo(width - padding.right, y)
      ctx.stroke()
      ctx.setLineDash([])
      
      const badgeText = `${label}: ${fmt(priceVal)}${subLabel ? ' (' + subLabel + ')' : ''}`
      const badgeW = Math.min(chartW - 10, Math.max(85, badgeText.length * 6.5 + 12))

      ctx.fillStyle = isDark.value ? '#090b10' : '#ffffff'
      ctx.fillRect(padding.left + 2, y - 9.5, badgeW, 17)
      ctx.strokeStyle = color
      ctx.lineWidth = 1
      ctx.strokeRect(padding.left + 2, y - 9.5, badgeW, 17)
      
      ctx.fillStyle = color
      ctx.textAlign = 'left'
      ctx.font = 'bold 8.5px monospace, sans-serif'
      ctx.fillText(badgeText, padding.left + 6, y + 2.5)
    }

    drawSwissBadgeLine(yR1, '#3b82f6', 'TARGET TP', r1, 'AMBIL PROFIT')
    drawSwissBadgeLine(yS1, '#10b981', 'BUY ZONE', s1, `AREA BELI ${fmt(bBottom)}-${fmt(bTop)}`)
    drawSwissBadgeLine(ySL, '#ef4444', 'STOP LOSS', sl, 'CUT LOSS')
  }

  // Dates on X Axis
  const isIntraday = ['1m', '5m', '15m', '30m', '60m'].includes(activePeriod.value)
  ctx.fillStyle = textColor
  ctx.textAlign = 'center'
  ctx.font = 'bold 9px monospace, sans-serif'
  const step = Math.ceil(items.length / 6)
  for (let i = 0; i < items.length; i += step) {
    const d = items[i]
    const dateStr = d.date || d.Date || d.timestamp || ''
    if (dateStr) {
      const x = padding.left + barGap * i + barGap / 2
      const dt = typeof dateStr === 'number' ? (dateStr < 10000000000 ? new Date(dateStr * 1000) : new Date(dateStr)) : new Date(dateStr)
      let label: string
      if (isIntraday) {
        label = dt.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
      } else {
        label = dt.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })
      }
      ctx.fillText(label, x, height - 5)
    }
  }

  // Draw Detected Patterns Overlays (Geometric Lines & Necklines)
  if (detectedPatterns.value.length > 0) {
    for (const pat of detectedPatterns.value) {
      ctx.strokeStyle = pat.color
      ctx.fillStyle = pat.color

      // Sideways Box Overlay
      if (pat.type === 'sideways_box' && pat.boxTop && pat.boxBottom) {
        const yTop = padding.top + ((maxPrice - pat.boxTop) / totalRange) * chartH
        const yBtm = padding.top + ((maxPrice - pat.boxBottom) / totalRange) * chartH

        ctx.fillStyle = isDark.value ? 'rgba(245, 158, 11, 0.12)' : 'rgba(245, 158, 11, 0.15)'
        ctx.fillRect(padding.left, yTop, chartW, yBtm - yTop)

        ctx.strokeStyle = '#f59e0b'
        ctx.lineWidth = 1.5
        ctx.setLineDash([4, 4])
        ctx.beginPath()
        ctx.moveTo(padding.left, yTop)
        ctx.lineTo(width - padding.right, yTop)
        ctx.moveTo(padding.left, yBtm)
        ctx.lineTo(width - padding.right, yBtm)
        ctx.stroke()
        ctx.setLineDash([])

        ctx.fillStyle = isDark.value ? '#090b10' : '#ffffff'
        ctx.fillRect(padding.left + 4, yTop - 9, 130, 16)
        ctx.strokeStyle = '#f59e0b'
        ctx.strokeRect(padding.left + 4, yTop - 9, 130, 16)

        ctx.fillStyle = '#f59e0b'
        ctx.textAlign = 'left'
        ctx.font = 'bold 8.5px monospace, sans-serif'
        ctx.fillText(`SIDEWAYS RES: ${fmt(pat.boxTop)}`, padding.left + 8, yTop + 3)
      }

      // Neckline Horizontal Line
      if (pat.neckline) {
        const yNeck = padding.top + ((maxPrice - pat.neckline) / totalRange) * chartH
        ctx.strokeStyle = pat.color
        ctx.lineWidth = 1.2
        ctx.setLineDash([4, 4])
        ctx.beginPath()
        ctx.moveTo(padding.left, yNeck)
        ctx.lineTo(width - padding.right, yNeck)
        ctx.stroke()
        ctx.setLineDash([])

        ctx.fillStyle = isDark.value ? '#090b10' : '#ffffff'
        ctx.fillRect(width - padding.right - 95, yNeck - 9, 90, 16)
        ctx.strokeStyle = pat.color
        ctx.strokeRect(width - padding.right - 95, yNeck - 9, 90, 16)

        ctx.fillStyle = pat.color
        ctx.textAlign = 'center'
        ctx.font = 'bold 8px monospace, sans-serif'
        ctx.fillText(`NECKLINE: ${fmt(pat.neckline)}`, width - padding.right - 50, yNeck + 3)
      }
      
      // Pivot Vertex Points & Connection Lines
      if (pat.points && pat.points.length > 1) {
        ctx.lineWidth = 2
        ctx.beginPath()
        for (let k = 0; k < pat.points.length; k++) {
          const pt = pat.points[k]!
          const px = padding.left + barGap * pt.i + barGap / 2
          const py = padding.top + ((maxPrice - pt.price) / totalRange) * chartH
          if (k === 0) ctx.moveTo(px, py)
          else ctx.lineTo(px, py)
        }
        ctx.stroke()
        
        // Glowing vertex dots
        for (let k = 0; k < pat.points.length; k++) {
          const pt = pat.points[k]!
          const px = padding.left + barGap * pt.i + barGap / 2
          const py = padding.top + ((maxPrice - pt.price) / totalRange) * chartH
          
          ctx.beginPath()
          ctx.fillStyle = pat.color
          ctx.arc(px, py, 4.5, 0, Math.PI * 2)
          ctx.fill()

          if (pt.label) {
            ctx.fillStyle = isDark.value ? '#ffffff' : '#000000'
            ctx.font = 'bold 8px monospace, sans-serif'
            ctx.textAlign = 'center'
            ctx.fillText(pt.label, px, py - 8)
          }
        }
      }
    }
  }

  function showTooltipAt(clientX: number, clientY: number, isTouch: boolean) {
    const rect = canvas.getBoundingClientRect()
    const mx = clientX - rect.left
    const idx = Math.floor((mx - padding.left) / barGap)

    if (idx >= 0 && idx < items.length) {
      const d = items[idx]
      tooltip.show = true
      tooltip.cx = padding.left + barGap * idx + barGap / 2
      
      if (isTouch) {
        tooltip.x = Math.min(Math.max(tooltip.cx - 65, 10), width - 150)
        tooltip.y = 25 
      } else {
        tooltip.x = Math.min(Math.max(tooltip.cx - 80, 10), width - 180)
        tooltip.y = Math.max(10, clientY - rect.top - 95)
      }
      
      const rawDate = d.date || d.Date || d.timestamp || ''
      const dt = typeof rawDate === 'number' ? (rawDate < 10000000000 ? new Date(rawDate * 1000) : new Date(rawDate)) : new Date(rawDate)
      if (isIntraday) {
        tooltip.dateFormatted = rawDate ? `${dt.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB` : '-'
      } else {
        tooltip.dateFormatted = rawDate ? dt.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'
      }
      tooltip.date = rawDate
      tooltip.open = fmt(d.open || d.Open || d.o || 0)
      tooltip.high = fmt(d.high || d.High || d.h || 0)
      tooltip.low = fmt(d.low || d.Low || d.l || 0)
      tooltip.close = fmt(d.close || d.Close || d.c || 0)
      tooltip.volume = fmtVol(d.volume || d.Volume || d.vol || 0)
    } else {
      tooltip.show = false
    }
  }

  canvas.onwheel = (e: WheelEvent) => {
    e.preventDefault()
    if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
      const step = Math.round(e.deltaX / 6)
      panOffset.value = Math.max(0, Math.min(panOffset.value - step, maxPan))
    } else {
      const delta = e.deltaY > 0 ? 4 : -4
      visibleCandles.value = Math.max(15, Math.min(250, visibleCandles.value + delta))
    }
    drawChart()
  }

  canvas.onmousedown = (e: MouseEvent) => {
    isDragging = true
    dragStartX = e.clientX
    dragStartPan = panOffset.value
    tooltip.show = false
  }
  canvas.onmousemove = (e: MouseEvent) => {
    if (isDragging && currentBarGap > 0) {
      const dx = e.clientX - dragStartX
      const candlesMoved = Math.round(dx / currentBarGap)
      panOffset.value = Math.max(0, Math.min(dragStartPan + candlesMoved, maxPanState))
      drawChart()
    } else {
      showTooltipAt(e.clientX, e.clientY, false)
    }
  }
  canvas.onmouseup = () => { isDragging = false }
  canvas.onmouseleave = () => {
    tooltip.show = false
  }

  canvas.ontouchstart = (e: TouchEvent) => {
    if (!e.touches.length) return

    // 2-finger pinch gesture
    if (e.touches.length === 2) {
      const t1 = e.touches[0]!
      const t2 = e.touches[1]!
      initialPinchDist = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY)
      initialVisibleCandles = visibleCandles.value
      isPinching = true
      isDragging = false
      isMobileLongPress = false
      if (longPressTimer) { clearTimeout(longPressTimer); longPressTimer = null }
      tooltip.show = false
      return
    }

    const t = e.touches[0]!
    dragStartX = t.clientX
    dragStartPan = panOffset.value
    isDragging = false
    isMobileLongPress = false

    if (longPressTimer) clearTimeout(longPressTimer)
    longPressTimer = setTimeout(() => {
      isMobileLongPress = true
      if (e.cancelable) e.preventDefault()
      showTooltipAt(t.clientX, t.clientY, true)
    }, 250)
  }

  canvas.ontouchmove = (e: TouchEvent) => {
    if (!e.touches.length) return

    // Handle 2-finger pinch zoom
    if (e.touches.length === 2 && isPinching) {
      if (e.cancelable) e.preventDefault()
      const t1 = e.touches[0]!
      const t2 = e.touches[1]!
      const currentDist = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY)
      if (initialPinchDist > 0 && currentDist > 0) {
        const factor = initialPinchDist / currentDist
        const targetCandles = Math.round(initialVisibleCandles * factor)
        visibleCandles.value = Math.max(12, Math.min(250, targetCandles))
        drawChart()
      }
      return
    }

    const t = e.touches[0]!
    const dx = t.clientX - dragStartX

    if (isMobileLongPress) {
      if (e.cancelable) e.preventDefault()
      showTooltipAt(t.clientX, t.clientY, true)
    } else {
      if (Math.abs(dx) > 4) {
        if (longPressTimer) { clearTimeout(longPressTimer); longPressTimer = null }
        isDragging = true
        if (e.cancelable) e.preventDefault()
        const candlesMoved = Math.round(dx / barGap)
        panOffset.value = Math.max(0, Math.min(dragStartPan + candlesMoved, maxPan))
        drawChart()
      }
    }
  }

  canvas.ontouchend = () => {
    if (longPressTimer) { clearTimeout(longPressTimer); longPressTimer = null }
    isDragging = false
    isPinching = false
    isMobileLongPress = false
    tooltip.show = false
  }

  canvas.ontouchcancel = () => {
    if (longPressTimer) { clearTimeout(longPressTimer); longPressTimer = null }
    isDragging = false
    isPinching = false
    isMobileLongPress = false
    tooltip.show = false
  }
}

// Quick Zoom Buttons
function zoomIn() {
  visibleCandles.value = Math.max(12, Math.round(visibleCandles.value * 0.75))
  drawChart()
}

function zoomOut() {
  visibleCandles.value = Math.min(250, Math.round(visibleCandles.value * 1.35))
  drawChart()
}

function resetZoom() {
  visibleCandles.value = 60
  panOffset.value = 0
  drawChart()
}

// Full-Fledged Price Action & Pattern Recognition Engine
function analyzeChartPatterns() {
  if (!props.data || props.data.length < 10) return

  if (detectedPatterns.value.length > 0) {
    detectedPatterns.value = []
    drawChart()
    return
  }

  isAnalyzingPattern.value = true
  setTimeout(() => {
    detectedPatterns.value = []
    
    const items = [...props.data].sort((a, b) => {
      const tA = a.timestamp || new Date(a.date || a.Date || 0).getTime()
      const tB = b.timestamp || new Date(b.date || b.Date || 0).getTime()
      return tA - tB
    })
    const closes = items.map(d => Number(d.close || d.Close || d.c || 0))
    const highs = items.map(d => Number(d.high || d.High || d.h || 0))
    const lows = items.map(d => Number(d.low || d.Low || d.l || 0))
    const currentPrice = closes[closes.length - 1] || 0

    // 1. Pivot Detection (Swing Highs & Swing Lows)
    const lookback = Math.max(2, Math.floor(closes.length / 20))
    const pivots: { type: 'peak' | 'valley'; i: number; price: number }[] = []
    for (let i = lookback; i < closes.length - lookback; i++) {
      const sliceH = highs.slice(i - lookback, i + lookback + 1)
      const sliceL = lows.slice(i - lookback, i + lookback + 1)
      
      if (highs[i] >= Math.max(...sliceH)) {
        if (pivots.length && pivots[pivots.length - 1]!.type === 'peak') {
          if (highs[i]! > pivots[pivots.length - 1]!.price) pivots[pivots.length - 1] = { type: 'peak', i, price: highs[i]! }
        } else {
          pivots.push({ type: 'peak', i, price: highs[i]! })
        }
      }
      if (lows[i] <= Math.min(...sliceL)) {
        if (pivots.length && pivots[pivots.length - 1]!.type === 'valley') {
          if (lows[i]! < pivots[pivots.length - 1]!.price) pivots[pivots.length - 1] = { type: 'valley', i, price: lows[i]! }
        } else {
          pivots.push({ type: 'valley', i, price: lows[i]! })
        }
      }
    }

    let patternFound = false

    // 2. Pattern Matching: Double Bottom (W-Pattern)
    for (let i = 0; i < pivots.length - 2; i++) {
      const p1 = pivots[i]!; const p2 = pivots[i+1]!; const p3 = pivots[i+2]!;
      if (p1.type === 'valley' && p2.type === 'peak' && p3.type === 'valley') {
        const diff = Math.abs(p1.price - p3.price) / p1.price
        if (diff < 0.05 && p2.price > p1.price * 1.02) {
          const target = Math.round(p2.price + (p2.price - Math.min(p1.price, p3.price)))
          detectedPatterns.value.push({
            type: 'double_bottom',
            label: 'BULLISH: Double Bottom (W)',
            category: 'BULLISH',
            confidence: Math.round((1 - diff) * 100),
            description: `Terbentuk formasi dasar ganda (W-Pattern) pada support Rp ${fmt(Math.min(p1.price, p3.price))}. Mengindikasikan penyerapan aksi jual dan persiapan akumulasi naik.`,
            actionAdvice: `Konfirmasi buy valid saat candle breakout menembus Neckline Rp ${fmt(p2.price)}. Target proyeksi Rp ${fmt(target)}.`,
            neckline: p2.price,
            target,
            color: '#10b981',
            points: [
              { ...p1, label: 'B1' },
              { ...p2, label: 'NECK' },
              { ...p3, label: 'B2' }
            ]
          })
          patternFound = true
          break
        }
      }
    }

    // 3. Pattern Matching: Double Top (M-Pattern)
    if (!patternFound) {
      for (let i = 0; i < pivots.length - 2; i++) {
        const p1 = pivots[i]!; const p2 = pivots[i+1]!; const p3 = pivots[i+2]!;
        if (p1.type === 'peak' && p2.type === 'valley' && p3.type === 'peak') {
          const diff = Math.abs(p1.price - p3.price) / p1.price
          if (diff < 0.05 && p2.price < p1.price * 0.98) {
            const target = Math.round(p2.price - (Math.max(p1.price, p3.price) - p2.price))
            detectedPatterns.value.push({
              type: 'double_top',
              label: 'BEARISH: Double Top (M)',
              category: 'BEARISH',
              confidence: Math.round((1 - diff) * 100),
              description: `Terbentuk puncak ganda (M-Pattern) pada resistensi Rp ${fmt(Math.max(p1.price, p3.price))}. Mengindikasikan kegagalan menembus level tertinggi dan resiko pembalikan turun.`,
              actionAdvice: `Waspada take profit atau pasang trailing stop. Sinyal breakdown jika harga tembus ke bawah Neckline Rp ${fmt(p2.price)}.`,
              neckline: p2.price,
              target,
              color: '#ef4444',
              points: [
                { ...p1, label: 'T1' },
                { ...p2, label: 'NECK' },
                { ...p3, label: 'T2' }
              ]
            })
            patternFound = true
            break
          }
        }
      }
    }

    // 4. Pattern Matching: Head & Shoulders
    if (!patternFound && pivots.length >= 5) {
      for (let i = 0; i < pivots.length - 4; i++) {
        const p1 = pivots[i]!; const p2 = pivots[i+1]!; const p3 = pivots[i+2]!; const p4 = pivots[i+3]!; const p5 = pivots[i+4]!;
        if (p1.type === 'peak' && p2.type === 'valley' && p3.type === 'peak' && p4.type === 'valley' && p5.type === 'peak') {
          if (p3.price > p1.price && p3.price > p5.price && Math.abs(p1.price - p5.price) / p1.price < 0.06) {
            const neckline = Math.round((p2.price + p4.price) / 2)
            const target = Math.round(neckline - (p3.price - neckline))
            detectedPatterns.value.push({
              type: 'head_shoulders',
              label: 'BEARISH: Head & Shoulders',
              category: 'BEARISH',
              confidence: 90,
              description: `Pola distribusi puncak klasik (Kepala & Bahu). Sinyal peringatan dini berakhirnya tren bullish.`,
              actionAdvice: `Kurangi porsi jika harga menembus di bawah Neckline Rp ${fmt(neckline)}. Target pelemahan ke Rp ${fmt(target)}.`,
              neckline,
              target,
              color: '#f43f5e',
              points: [
                { ...p1, label: 'LS' },
                { ...p2, label: 'N1' },
                { ...p3, label: 'HEAD' },
                { ...p4, label: 'N2' },
                { ...p5, label: 'RS' }
              ]
            })
            patternFound = true
            break
          }
        }
      }
    }

    // 5. Pattern Matching: Sideways Consolidation (Darvas Box)
    if (!patternFound) {
      const recentHighs = highs.slice(-25)
      const recentLows = lows.slice(-25)
      const boxTop = Math.max(...recentHighs)
      const boxBottom = Math.min(...recentLows)
      const rangeSpread = (boxTop - boxBottom) / boxTop

      if (rangeSpread < 0.06) {
        detectedPatterns.value.push({
          type: 'sideways_box',
          label: 'NEUTRAL: Sideways Box',
          category: 'NEUTRAL',
          confidence: 88,
          description: `Pergerakan harga terkonsolidasi dalam rentang sempit Rp ${fmt(boxBottom)} - Rp ${fmt(boxTop)}. Energi pasar sedang terkumpul untuk breakout arah baru.`,
          actionAdvice: `Strategi Swing: Buy on Support di dekat Rp ${fmt(boxBottom)} dan Sell on Resistance di dekat Rp ${fmt(boxTop)}. Stop loss jika tembus ke bawah.`,
          boxTop,
          boxBottom,
          color: '#f59e0b',
          points: []
        })
        patternFound = true
      }
    }

    // Fallback: Trend Channel
    if (!patternFound) {
      const firstPrice = closes[0] || 1
      const isUptrend = currentPrice >= firstPrice
      detectedPatterns.value.push({
        type: isUptrend ? 'uptrend_continuation' : 'downtrend_channel',
        label: isUptrend ? 'BULLISH: Uptrend Channel' : 'BEARISH: Downtrend Channel',
        category: isUptrend ? 'BULLISH' : 'BEARISH',
        confidence: 80,
        description: isUptrend 
          ? `Harga bergerak dalam kanal naik bertahap dengan struktur Higher Highs.` 
          : `Harga berada dalam tekanan distribusi menurun dengan struktur Lower Lows.`,
        actionAdvice: isUptrend 
          ? `Pertahankan posisi beli selama harga berada di atas moving average.` 
          : `Tunggu konfirmasi pantulan support kuat sebelum melakukan entry baru.`,
        color: isUptrend ? '#10b981' : '#ef4444',
        points: []
      })
    }

    isAnalyzingPattern.value = false
    drawChart()
  }, 400)
}
</script>

<style scoped>
/* Scoped Swiss Layout */
</style>

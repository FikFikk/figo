<template>
  <div class="rounded-2xl border overflow-hidden transition-colors"
    :class="isDark ? 'bg-[#0d1117] border-neutral-800' : 'bg-white border-neutral-200 shadow-sm'"
  >
    <!-- Swiss Terminal Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 pt-5 pb-3 border-b"
      :class="isDark ? 'border-neutral-800' : 'border-neutral-200'"
    >
      <div class="flex items-center gap-2.5 shrink-0">
        <span class="px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase tracking-widest border"
          :class="isDark ? 'bg-neutral-900 border-neutral-800 text-neutral-300' : 'bg-neutral-100 border-neutral-300 text-neutral-700'"
        >
          SYS.01 // OHLCV
        </span>
        <h3 class="font-headline font-black text-sm uppercase tracking-tight" :class="isDark ? 'text-white' : 'text-neutral-900'">
          Chart Terminal
        </h3>
        <span v-if="data?.length" class="text-[10px] font-mono text-neutral-400 hidden md:inline">
          // 1 CANDLE = {{ activeCandle }}
        </span>
      </div>

      <!-- Timeframe Selector (Swiss Modular Tabs) -->
      <div class="flex w-full sm:w-auto flex-wrap items-center gap-1 font-mono text-[10px]">
        <button v-for="p in periods" :key="p.interval" @click="changePeriod(p.interval)"
          class="px-2.5 py-1 rounded-md uppercase font-bold tracking-wider transition-all border"
          :class="activePeriod === p.interval
            ? (isDark ? 'bg-white text-neutral-950 border-white font-black' : 'bg-neutral-950 text-white border-neutral-950 font-black')
            : (isDark ? 'bg-neutral-900/80 text-neutral-400 border-neutral-800 hover:border-neutral-600' : 'bg-neutral-50 text-neutral-600 border-neutral-200 hover:border-neutral-400')"
        >
          {{ p.label }}
        </button>
      </div>
    </div>

    <!-- Sub-header info mobile -->
    <div v-if="data?.length" class="px-5 py-2 flex items-center justify-between text-[10px] font-mono border-b md:hidden"
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
        class="px-6 py-2.5 rounded-xl text-xs font-bold font-headline uppercase tracking-wider transition-all border"
        :class="isDark ? 'bg-white text-neutral-950 border-white hover:bg-neutral-200' : 'bg-neutral-950 text-white border-neutral-950 hover:bg-neutral-800'"
      >
        Tampilkan Chart
      </button>
    </div>

    <!-- Chart Canvas -->
    <div v-else class="relative px-2 pb-4 pt-2" style="height: 440px;">
      <!-- Loading -->
      <div v-if="loading && !isLoadingMore" class="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-xs z-10 font-mono text-xs">
        <div class="flex items-center gap-2 px-4 py-2 rounded-lg border bg-neutral-900 border-neutral-700 text-white">
          <span class="material-symbols-outlined text-primary animate-spin text-base">progress_activity</span>
          <span>LOADING STREAM...</span>
        </div>
      </div>

      <!-- Canvas -->
      <canvas ref="canvasRef" class="w-full h-full touch-none" :class="{ 'opacity-0': loading && !isLoadingMore, 'opacity-50 blur-[1px] cursor-wait': loading && isLoadingMore }"></canvas>

      <!-- Loading indicator saat auto-load more -->
      <div v-if="atLeftEdge && loading" class="absolute left-3 top-1/2 -translate-y-1/2 z-20 flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[10px] font-mono font-bold backdrop-blur-md border"
        :class="isDark ? 'bg-neutral-900/90 text-primary border-neutral-700' : 'bg-white/90 text-neutral-800 border-neutral-300'"
      >
        <span class="material-symbols-outlined text-sm animate-spin">progress_activity</span>
        MEMUAT DATA HISTORIS...
      </div>

      <!-- Active Patterns List -->
      <div v-if="data?.length && detectedPatterns.length > 0 && !isAnalyzingPattern" class="absolute bottom-[70px] right-2 flex flex-col items-end gap-1.5 z-20 pointer-events-none font-mono">
        <template v-for="(pat, idx) in detectedPatterns" :key="'pat-'+idx">
          <div v-if="pat.label" class="animate-in fade-in slide-in-from-right-3 duration-300">
             <div class="backdrop-blur-xl px-2.5 py-1 text-[9px] font-bold tracking-widest uppercase shadow-md flex items-center gap-1.5 border truncate max-w-full rounded"
               :style="{ backgroundColor: isDark ? '#09090bF0' : '#FFFFFFFA', color: pat.color, borderColor: pat.color }"
             >
               <span class="material-symbols-outlined text-[13px]">polyline</span>
               {{ pat.label }}
             </div>
          </div>
        </template>
      </div>

      <!-- Type Toggle & Pattern Analyzer (Swiss Modular Toolbar) -->
      <div v-if="data?.length" class="absolute bottom-[30px] right-2 flex items-center backdrop-blur-md rounded-lg p-1 z-20 border shadow-sm font-mono text-[10px]"
        :class="isDark ? 'bg-neutral-900/90 border-neutral-700' : 'bg-white/90 border-neutral-300'"
      >
        <button @click="analyzeChartPatterns" class="h-7 px-2.5 flex items-center justify-center gap-1.5 rounded transition-all border border-transparent font-bold" 
           :class="isAnalyzingPattern ? 'animate-pulse text-purple-400' : detectedPatterns.length ? 'bg-purple-600 text-white' : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'"
           title="Deteksi Pola Chart Otomatis">
           <span class="material-symbols-outlined text-[15px]">draw</span>
           <span class="text-[9px] font-bold uppercase tracking-wider">{{ detectedPatterns.length ? 'POLA AKTIF' : 'POLA' }}</span>
        </button>
        <div class="w-px h-4 mx-1" :class="isDark ? 'bg-neutral-800' : 'bg-neutral-200'"></div>

        <button @click="chartType = 'candle'" class="w-7 h-7 flex items-center justify-center rounded transition-all"
          :class="chartType === 'candle' ? (isDark ? 'bg-white text-neutral-950 font-bold' : 'bg-neutral-950 text-white font-bold') : 'text-neutral-400 hover:text-neutral-900 dark:hover:text-white'"
        >
          <span class="material-symbols-outlined text-[16px]">candlestick_chart</span>
        </button>
        <button @click="chartType = 'line'" class="w-7 h-7 flex items-center justify-center rounded transition-all"
          :class="chartType === 'line' ? (isDark ? 'bg-white text-neutral-950 font-bold' : 'bg-neutral-950 text-white font-bold') : 'text-neutral-400 hover:text-neutral-900 dark:hover:text-white'"
        >
          <span class="material-symbols-outlined text-[16px]">show_chart</span>
        </button>
      </div>

      <!-- Crosshair Vertical Line -->
      <div v-if="tooltip.show" class="absolute top-[30px] bottom-[30px] w-px pointer-events-none z-0 border-r border-dashed"
        :class="isDark ? 'border-neutral-500/40' : 'border-neutral-900/30'"
        :style="{ left: tooltip.cx + 'px' }"
      ></div>
      
      <!-- Crosshair Date Tag Top -->
      <div v-if="tooltip.show" class="absolute top-[2px] transform -translate-x-1/2 px-2 py-0.5 rounded text-[9px] font-mono font-bold z-20 shadow-sm border uppercase"
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
          class="absolute pointer-events-none px-3.5 py-2.5 rounded-xl text-[10px] font-mono shadow-xl z-20 border"
          :class="isDark ? 'bg-neutral-950/95 border-neutral-700 text-neutral-200' : 'bg-white/95 border-neutral-300 text-neutral-800'"
          :style="{ left: tooltip.x + 'px', top: tooltip.y + 'px' }"
        >
          <div class="text-[9px] font-bold pb-1 mb-1.5 border-b uppercase tracking-wider" :class="isDark ? 'border-neutral-800 text-neutral-400' : 'border-neutral-200 text-neutral-500'">
            METRICS // {{ tooltip.dateFormatted }}
          </div>
          <div class="grid grid-cols-2 gap-x-4 gap-y-1">
            <span class="opacity-50 uppercase">OPEN</span><span class="text-right font-bold">{{ tooltip.open }}</span>
            <span class="opacity-50 uppercase">HIGH</span><span class="text-right font-bold text-emerald-500">{{ tooltip.high }}</span>
            <span class="opacity-50 uppercase">LOW</span><span class="text-right font-bold text-red-500">{{ tooltip.low }}</span>
            <span class="opacity-50 uppercase">CLOSE</span><span class="text-right font-black" :class="isDark ? 'text-white' : 'text-neutral-950'">{{ tooltip.close }}</span>
            <span class="opacity-50 uppercase">VOLUME</span><span class="text-right font-bold text-primary">{{ tooltip.volume }}</span>
          </div>
        </div>
      </Transition>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * Swiss Style Candlestick OHLCV Chart Engine
 */
const props = defineProps<{
  data: any[]
  loading: boolean
  plan?: any
}>()

const emit = defineEmits<{
  periodChange: [params: { interval: string; range: string }]
  fetch: [params: { interval: string; range: string }]
  loadMore: []
}>()

const { isDark } = useColorMode()

const canvasRef = ref<HTMLCanvasElement | null>(null)

const atLeftEdge = computed(() => {
  if (!props.data?.length) return false
  const totalLen = props.data.length
  const maxVisible = Math.min(visibleCandles.value, totalLen)
  const maxPan = Math.max(0, totalLen - maxVisible)
  return panOffset.value >= maxPan && maxPan > 0
})

interface TimeframePeriod {
  label: string
  interval: string
  range: string
  candleLabel: string
}

const periods: TimeframePeriod[] = [
  { label: '1M', interval: '1m', range: '1d', candleLabel: '1 Menit' },
  { label: '5M', interval: '5m', range: '1d', candleLabel: '5 Menit' },
  { label: '15M', interval: '15m', range: '5d', candleLabel: '15 Menit' },
  { label: '30M', interval: '30m', range: '5d', candleLabel: '30 Menit' },
  { label: '1H', interval: '60m', range: '1mo', candleLabel: '1 Jam' },
  { label: '1D', interval: '1d', range: '3mo', candleLabel: '1 Hari' },
  { label: '1W', interval: '1wk', range: '1y', candleLabel: '1 Minggu' },
  { label: '1MO', interval: '1mo', range: '5y', candleLabel: '1 Bulan' },
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
let isMobileLongPress = false
let longPressTimer: ReturnType<typeof setTimeout> | null = null
const isLoadingMore = ref(false)
let anchorTimestamp: number | null = null

interface CanvasPattern {
  type: string
  label: string
  points: { i: number; price: number }[]
  color: string
}
const detectedPatterns = ref<CanvasPattern[]>([])

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
  return { interval: p?.interval || '1d', range: p?.range || '3mo' }
}

function changePeriod(interval: string) {
  activePeriod.value = interval
  const p = periods.find(p => p.interval === interval)
  if (p) emit('periodChange', { interval: p.interval, range: p.range })
}

function fmt(n: number): string {
  return new Intl.NumberFormat('id-ID').format(n)
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

watch(chartType, () => {
  nextTick(() => drawChart())
})

watch(isDark, () => nextTick(() => drawChart()))

let resizeObserver: ResizeObserver | null = null

onMounted(() => {
  drawChart()
  if (canvasRef.value) {
    resizeObserver = new ResizeObserver(() => drawChart())
    resizeObserver.observe(canvasRef.value.parentElement!)
  }
})

onUnmounted(() => {
  resizeObserver?.disconnect()
})

function drawChart() {
  const canvas = canvasRef.value
  if (!canvas || !props.data || props.data.length === 0) return

  const parent = canvas.parentElement!
  const dpr = window.devicePixelRatio || 1
  const rect = parent.getBoundingClientRect()
  const width = rect.width - 16
  const height = 420

  canvas.width = width * dpr
  canvas.height = height * dpr
  canvas.style.width = width + 'px'
  canvas.style.height = height + 'px'

  const ctx = canvas.getContext('2d')!
  ctx.scale(dpr, dpr)
  ctx.clearRect(0, 0, width, height)

  const allItems = [...props.data].sort((a, b) => {
    const tA = a.timestamp || new Date(a.date || a.Date || 0).getTime()
    const tB = b.timestamp || new Date(b.date || b.Date || 0).getTime()
    return tA - tB
  })

  const totalLen = allItems.length
  const maxVisible = Math.min(visibleCandles.value, totalLen)
  const maxPan = Math.max(0, totalLen - maxVisible)
  panOffset.value = Math.max(0, Math.min(panOffset.value, maxPan))
  
  const startIdx = totalLen - maxVisible - panOffset.value
  const endIdx = startIdx + maxVisible
  const items = allItems.slice(Math.max(0, startIdx), endIdx)

  const padding = { top: 15, right: 65, bottom: 30, left: 10 }
  const chartW = width - padding.left - padding.right
  const chartH = height - padding.top - padding.bottom

  let minPrice = Infinity
  let maxPrice = -Infinity
  for (const d of items) {
    const lo = d.low || d.Low || d.l || 0
    const hi = d.high || d.High || d.h || 0
    if (lo < minPrice) minPrice = lo
    if (hi > maxPrice) maxPrice = hi
  }
  const priceRange = maxPrice - minPrice || 1
  const buffer = priceRange * 0.05
  minPrice -= buffer
  maxPrice += buffer
  const totalRange = maxPrice - minPrice

  const barWidth = Math.max(2, (chartW / items.length) * 0.65)
  const barGap = chartW / items.length

  const gridColor = isDark.value ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.08)'
  const textColor = isDark.value ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.55)'
  const upColor = '#10b981'
  const downColor = '#ef4444'

  // Precision Horizontal Grid Lines & Price Axis
  const gridLines = 5
  ctx.strokeStyle = gridColor
  ctx.lineWidth = 1
  ctx.font = '10px monospace, sans-serif'
  ctx.fillStyle = textColor
  ctx.textAlign = 'right'

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

  // Render Chart Body
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
    // Swiss Line Chart
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
    const [bBottom, bTop] = props.plan.buyZone

    const yS1 = padding.top + ((maxPrice - s1) / totalRange) * chartH
    const yR1 = padding.top + ((maxPrice - r1) / totalRange) * chartH
    const ySL = padding.top + ((maxPrice - sl) / totalRange) * chartH
    const yBBottom = Math.min(height - padding.bottom, Math.max(padding.top, padding.top + ((maxPrice - bBottom) / totalRange) * chartH))
    const yBTop = Math.min(height - padding.bottom, Math.max(padding.top, padding.top + ((maxPrice - bTop) / totalRange) * chartH))

    // Buy Zone Shaded Fill with Hairline Boundaries
    if (yBTop >= padding.top && yBBottom <= height - padding.bottom) {
      ctx.fillStyle = isDark.value ? 'rgba(16, 185, 129, 0.12)' : 'rgba(16, 185, 129, 0.16)'
      ctx.fillRect(padding.left, yBTop, chartW, yBBottom - yBTop)
      
      // Top boundary
      ctx.strokeStyle = '#10b981'
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(padding.left, yBTop)
      ctx.lineTo(width - padding.right, yBTop)
      ctx.stroke()

      // Bottom boundary
      ctx.beginPath()
      ctx.moveTo(padding.left, yBBottom)
      ctx.lineTo(width - padding.right, yBBottom)
      ctx.stroke()
    }

    const drawSwissBadgeLine = (y: number, color: string, label: string, priceVal: number) => {
      if (y < padding.top || y > height - padding.bottom) return
      ctx.strokeStyle = color
      ctx.lineWidth = 1.2
      ctx.beginPath()
      ctx.setLineDash([4, 4])
      ctx.moveTo(padding.left, y)
      ctx.lineTo(width - padding.right, y)
      ctx.stroke()
      ctx.setLineDash([])
      
      // Swiss Badge Box on Left
      const badgeText = `[ ${label}: ${fmt(priceVal)} ]`
      ctx.font = 'bold 9px monospace, sans-serif'
      const textW = ctx.measureText(badgeText).width + 8
      
      ctx.fillStyle = isDark.value ? '#09090b' : '#ffffff'
      ctx.fillRect(padding.left + 4, y - 9, textW, 16)
      
      ctx.strokeStyle = color
      ctx.lineWidth = 1
      ctx.strokeRect(padding.left + 4, y - 9, textW, 16)
      
      ctx.fillStyle = color
      ctx.textAlign = 'left'
      ctx.fillText(badgeText, padding.left + 8, y + 2.5)
    }

    drawSwissBadgeLine(yR1, '#3b82f6', 'TARGET', r1)
    drawSwissBadgeLine(yS1, '#10b981', 'BUY ZONE', s1)
    drawSwissBadgeLine(ySL, '#ef4444', 'STOP LOSS', sl)
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
      const dt = typeof dateStr === 'number' ? new Date(dateStr * 1000) : new Date(dateStr)
      let label: string
      if (isIntraday) {
        label = dt.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
      } else {
        label = dt.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })
      }
      ctx.fillText(label, x, height - 5)
    }
  }

  // Draw Detected Patterns Overlays
  if (detectedPatterns.value.length > 0) {
    for (const pat of detectedPatterns.value) {
      ctx.strokeStyle = pat.color
      ctx.fillStyle = pat.color
      
      if (pat.type === 'trend_curve') {
        const smaVals: number[] = (pat as any).smaValues || []
        const phases: {startI: number, endI: number, dir: string}[] = (pat as any).phases || []
        
        if (smaVals.length > 1) {
          for (const phase of phases) {
            const color = phase.dir === 'UP' ? '#10b981' : phase.dir === 'DOWN' ? '#ef4444' : '#64748b'
            ctx.strokeStyle = color
            ctx.lineWidth = 2.5
            ctx.beginPath()
            
            for (let k = phase.startI; k <= Math.min(phase.endI, smaVals.length - 1); k++) {
              const x = padding.left + barGap * k + barGap / 2
              const y = padding.top + ((maxPrice - smaVals[k]) / totalRange) * chartH
              if (k === phase.startI) ctx.moveTo(x, y)
              else ctx.lineTo(x, y)
            }
            ctx.stroke()
            
            const midI = Math.floor((phase.startI + phase.endI) / 2)
            const midX = padding.left + barGap * Math.min(midI, smaVals.length - 1) + barGap / 2
            const midY = padding.top + ((maxPrice - smaVals[Math.min(midI, smaVals.length - 1)]) / totalRange) * chartH
            
            ctx.font = 'bold 9px monospace, sans-serif'
            ctx.textAlign = 'center'
            ctx.fillStyle = color
            const lbl = phase.dir === 'UP' ? '▲ UPTREND' : phase.dir === 'DOWN' ? '▼ DOWNTREND' : '◆ SIDEWAYS'
            ctx.fillText(lbl, midX, Math.max(padding.top + 12, midY - 12))
          }
        }
      } 
      else if (pat.type !== 'trend_curve') {
        ctx.lineWidth = 2
        ctx.beginPath()
        let lastX = 0, lastY = 0
        for (let k = 0; k < pat.points.length; k++) {
          const pt = pat.points[k]
          const px = padding.left + barGap * pt.i + barGap / 2
          const py = padding.top + ((maxPrice - pt.price) / totalRange) * chartH
          
          if (k === 0) ctx.moveTo(px, py)
          else ctx.lineTo(px, py)
          lastX = px
          lastY = py
        }
        ctx.stroke()
        
        for (let k = 0; k < pat.points.length; k++) {
          const pt = pat.points[k]
          const px = padding.left + barGap * pt.i + barGap / 2
          const py = padding.top + ((maxPrice - pt.price) / totalRange) * chartH
          ctx.beginPath()
          ctx.arc(px, py, 4, 0, Math.PI * 2)
          ctx.fill()
        }
        
        ctx.font = 'bold 9px monospace, sans-serif'
        ctx.textAlign = 'center'
        ctx.fillStyle = isDark.value ? '#ffffff' : '#000000'
        ctx.fillText(pat.label, Math.max(padding.left + 30, Math.min(width - 30, lastX)), lastY - 15)
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
    if (isDragging) {
      const dx = e.clientX - dragStartX
      const candlesMoved = Math.round(dx / barGap)
      panOffset.value = Math.max(0, Math.min(dragStartPan + candlesMoved, maxPan))
      drawChart()
    } else {
      showTooltipAt(e.clientX, e.clientY, false)
    }
  }
  canvas.onmouseup = () => { isDragging = false }
  canvas.onmouseleave = () => {
    isDragging = false
    tooltip.show = false
  }

  canvas.ontouchstart = (e: TouchEvent) => {
    if (!e.touches.length) return
    const t = e.touches[0]
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
    const t = e.touches[0]
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
    isMobileLongPress = false
    tooltip.show = false
  }
  canvas.ontouchcancel = () => {
    if (longPressTimer) { clearTimeout(longPressTimer); longPressTimer = null }
    isDragging = false
    isMobileLongPress = false
    tooltip.show = false
  }
}

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
    
    const smaPeriod = Math.max(5, Math.floor(closes.length / 10))
    const smaValues: number[] = []
    for (let i = 0; i < closes.length; i++) {
      const start = Math.max(0, i - smaPeriod + 1)
      const slice = closes.slice(start, i + 1)
      smaValues.push(slice.reduce((a, b) => a + b, 0) / slice.length)
    }
    
    const phaseWindow = Math.max(3, Math.floor(smaPeriod / 2))
    const phases: {startI: number, endI: number, dir: string}[] = []
    let currentDir = 'FLAT'
    let phaseStart = 0
    
    for (let i = phaseWindow; i < smaValues.length; i++) {
      const diff = (smaValues[i] - smaValues[i - phaseWindow]) / smaValues[i - phaseWindow]
      let dir = 'FLAT'
      if (diff > 0.02) dir = 'UP'
      else if (diff < -0.02) dir = 'DOWN'
      
      if (dir !== currentDir) {
        if (i > phaseStart + 1) {
          phases.push({ startI: phaseStart, endI: i - 1, dir: currentDir })
        }
        currentDir = dir
        phaseStart = i
      }
    }
    phases.push({ startI: phaseStart, endI: smaValues.length - 1, dir: currentDir })
    
    detectedPatterns.value.push({
      type: 'trend_curve',
      label: '',
      color: '',
      points: [],
      smaValues,
      phases
    } as any)

    const lookback = Math.max(2, Math.floor(closes.length / 20))
    const pivots: {type: 'peak'|'valley', i: number, price: number}[] = []
    for (let i = lookback; i < closes.length - lookback; i++) {
        const sliceH = highs.slice(i - lookback, i + lookback + 1)
        const sliceL = lows.slice(i - lookback, i + lookback + 1)
        
        if (highs[i] >= Math.max(...sliceH)) {
           if (pivots.length && pivots[pivots.length - 1].type === 'peak') {
              if (highs[i] > pivots[pivots.length - 1].price) pivots[pivots.length - 1] = {type: 'peak', i, price: highs[i]}
           } else {
              pivots.push({type: 'peak', i, price: highs[i]})
           }
        }
        if (lows[i] <= Math.min(...sliceL)) {
           if (pivots.length && pivots[pivots.length - 1].type === 'valley') {
              if (lows[i] < pivots[pivots.length - 1].price) pivots[pivots.length - 1] = {type: 'valley', i, price: lows[i]}
           } else {
              pivots.push({type: 'valley', i, price: lows[i]})
           }
        }
    }

    for (let i = 0; i < pivots.length - 2; i++) {
       const p1 = pivots[i]; const p2 = pivots[i+1]; const p3 = pivots[i+2];
       
       if (p1.type === 'valley' && p2.type === 'peak' && p3.type === 'valley') {
          if (Math.abs(p1.price - p3.price) / p1.price < 0.05) {
             detectedPatterns.value.push({
                type: 'double_bottom', label: 'BULLISH: Double Bottom', color: '#3b82f6',
                points: [p1, p2, p3]
             })
             i += 2; continue;
          }
       }
       if (p1.type === 'peak' && p2.type === 'valley' && p3.type === 'peak') {
          if (Math.abs(p1.price - p3.price) / p1.price < 0.05) {
             detectedPatterns.value.push({
                type: 'double_top', label: 'BEARISH: Double Top', color: '#f59e0b',
                points: [p1, p2, p3]
             })
             i += 2; continue;
          }
       }
    }
    
    for (let i = 0; i < pivots.length - 4; i++) {
       const p1 = pivots[i]; const p2 = pivots[i+1]; const p3 = pivots[i+2]; const p4 = pivots[i+3]; const p5 = pivots[i+4];
       if (p1.type==='peak' && p2.type==='valley' && p3.type==='peak' && p4.type==='valley' && p5.type==='peak') {
          if (p3.price > p1.price && p3.price > p5.price) {
             const leftRightSym = Math.abs(p1.price - p5.price) / p1.price < 0.05
             const neckSym = Math.abs(p2.price - p4.price) / p2.price < 0.05
             if (leftRightSym && neckSym) {
                detectedPatterns.value.push({
                   type: 'head_shoulders', label: 'BEARISH: Head & Shoulders', color: '#db2777',
                   points: [p1, p2, p3, p4, p5]
                })
                i += 4;
             }
          }
       }
    }

    isAnalyzingPattern.value = false
    drawChart()
  }, 500)
}
</script>

<style scoped>
/* Swiss Chart Layout */
</style>

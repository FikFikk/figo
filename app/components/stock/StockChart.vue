<template>
  <div class="glass-panel rounded-2xl border overflow-hidden"
    :class="isDark ? 'border-white/5' : 'border-slate-100'"
  >
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0 px-5 pt-5 pb-3">
      <div class="flex items-center gap-2 shrink-0">
        <span class="material-symbols-outlined text-lg text-primary">candlestick_chart</span>
        <h3 class="font-headline font-bold text-sm" :class="isDark ? 'text-white' : 'text-slate-900'">
          Chart OHLCV
        </h3>
      </div>

      <!-- Timeframe selector -->
      <div class="flex w-full sm:w-auto flex-wrap items-center gap-0.5 sm:gap-1 rounded-2xl p-1"
        :class="isDark ? 'bg-white/5' : 'bg-slate-100'"
      >
        <button v-for="p in periods" :key="p.interval" @click="changePeriod(p.interval)"
          class="flex-1 sm:flex-none px-0.5 sm:px-3 py-1.5 rounded-[10px] sm:rounded-2xl text-[9px] sm:text-[10px] sm:tracking-wider font-bold uppercase transition-all"
          :class="activePeriod === p.interval
            ? (isDark ? 'bg-primary/20 text-primary' : 'bg-primary text-white shadow-sm')
            : (isDark ? 'text-gray-500 hover:text-gray-300' : 'text-slate-500 hover:text-slate-700')"
        >{{ p.label }}</button>
      </div>
    </div>
    <!-- Candle timeframe indicator -->
    <div v-if="data?.length" class="px-5 pb-1">
      <span class="text-[9px] font-bold uppercase tracking-wider opacity-40">📊 Setiap candle = {{ activeCandle }}</span>
    </div>

    <!-- Unlocked State -->
    <div v-if="!data?.length && !loading" class="flex flex-col items-center justify-center py-10 text-center" style="height: 440px;">
      <div class="w-12 h-12 rounded-2xl flex items-center justify-center mb-3" :class="isDark ? 'bg-white/5' : 'bg-slate-50'">
        <span class="material-symbols-outlined text-xl opacity-50">show_chart</span>
      </div>
      <h4 class="font-bold text-sm mb-1" :class="isDark ? 'text-white' : 'text-slate-900'">Chart OHLCV</h4>
      <p class="text-[10px] opacity-60 mb-4 max-w-[280px]">Klik untuk memuat grafik pergerakan harga historis guna menghemat kuota API.</p>
      <button @click="$emit('fetch', getActivePeriodParams())" class="px-5 py-2 rounded-2xl text-xs font-bold transition-all" :class="isDark ? 'bg-primary/20 text-primary hover:bg-primary/30' : 'bg-primary text-white hover:bg-primary/90 shadow-sm'">
        Tampilkan Chart
      </button>
    </div>

    <!-- Chart Canvas -->
    <div v-else class="relative px-2 pb-4" style="height: 440px;">
      <!-- Loading (Hanya untuk initial load, bukan loadMore) -->
      <div v-if="loading && !isLoadingMore" class="absolute inset-0 flex items-center justify-center">
        <span class="material-symbols-outlined text-primary animate-spin text-2xl">progress_activity</span>
      </div>

      <!-- Canvas -->
      <canvas ref="canvasRef" class="w-full h-full touch-none" :class="{ 'opacity-0': loading && !isLoadingMore, 'opacity-50 blur-[1px] cursor-wait': loading && isLoadingMore }"></canvas>

      <!-- Loading indicator saat auto-load more -->
      <div v-if="atLeftEdge && loading" class="absolute left-3 top-1/2 -translate-y-1/2 z-20 flex items-center gap-1 px-3 py-2 rounded-2xl text-[10px] font-bold backdrop-blur-md"
        :class="isDark ? 'bg-white/5 text-primary border border-white/10' : 'bg-slate-100 text-slate-600 border border-slate-200'"
      >
        <span class="material-symbols-outlined text-sm animate-spin">progress_activity</span>
        Memuat...
      </div>

      <!-- Type Toggle & Pattern Analyzer -->
      <div v-if="data?.length" class="absolute bottom-[30px] right-2 flex items-center bg-white/50 dark:bg-black/50 backdrop-blur-md rounded-2xl p-0.5 z-20 border border-slate-200 dark:border-white/10 shadow-sm">
        
        <button @click="analyzeChartPatterns" class="h-7 px-2 flex items-center justify-center gap-1 rounded-lg transition-all" 
           :class="isAnalyzingPattern ? 'animate-pulse text-purple-500' : detectedPatterns.length ? 'bg-purple-500 text-white shadow' : 'text-slate-500 dark:text-gray-400 hover:text-purple-500 dark:hover:text-purple-400'"
           title="Deteksi Pola Chart Otomatis">
           <span class="material-symbols-outlined text-[16px]">draw</span>
           <span v-if="detectedPatterns.length" class="text-[9px] font-bold tracking-wider uppercase">POLA AKTIF</span>
        </button>
        <div class="w-px h-4 mx-1 bg-slate-300 dark:bg-slate-700"></div>

        <button @click="chartType = 'candle'" class="w-7 h-7 flex items-center justify-center rounded-lg transition-all" :class="chartType === 'candle' ? 'bg-primary text-white shadow' : 'text-slate-500 dark:text-gray-400 hover:text-primary dark:hover:text-white'"><span class="material-symbols-outlined text-[16px]">candlestick_chart</span></button>
        <button @click="chartType = 'line'" class="w-7 h-7 flex items-center justify-center rounded-lg transition-all" :class="chartType === 'line' ? 'bg-primary text-white shadow' : 'text-slate-500 dark:text-gray-400 hover:text-primary dark:hover:text-white'"><span class="material-symbols-outlined text-[16px]">show_chart</span></button>
      </div>

      <!-- Crosshair Vertical Line -->
      <div v-if="tooltip.show" class="absolute top-[30px] bottom-[30px] w-px pointer-events-none z-0 border-r border-dashed"
        :class="isDark ? 'border-white/30' : 'border-slate-800/20'"
        :style="{ left: tooltip.cx + 'px' }"
      ></div>
      
      <!-- Crosshair Date Tag Top -->
      <div v-if="tooltip.show" class="absolute top-[2px] transform -translate-x-1/2 px-2 py-0.5 rounded-md text-[9px] font-bold z-20 shadow-sm"
        :class="isDark ? 'bg-white text-slate-900 border border-white' : 'bg-slate-800 text-white border border-slate-800'"
        :style="{ left: tooltip.cx + 'px' }"
      >
        {{ tooltip.dateFormatted }}
      </div>

      <!-- Tooltip Box -->
      <Transition
        enter-active-class="transition duration-150 ease-out"
        enter-from-class="opacity-0"
        enter-to-class="opacity-100"
        leave-active-class="transition duration-100 ease-in"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <div v-if="tooltip.show"
          class="absolute pointer-events-none px-3 py-2 rounded-2xl text-[10px] font-mono shadow-xl z-20 border"
          :class="isDark ? 'bg-[#1a1d28] border-white/10 text-gray-200' : 'bg-white border-slate-200 text-slate-700'"
          :style="{ left: tooltip.x + 'px', top: tooltip.y + 'px' }"
        >
          <div class="grid grid-cols-2 gap-x-3 gap-y-0.5">
            <span class="opacity-50">Open</span><span class="text-right">{{ tooltip.open }}</span>
            <span class="opacity-50">High</span><span class="text-right text-emerald-500">{{ tooltip.high }}</span>
            <span class="opacity-50">Low</span><span class="text-right text-red-500">{{ tooltip.low }}</span>
            <span class="opacity-50">Close</span><span class="text-right font-bold">{{ tooltip.close }}</span>
            <span class="opacity-50 pr-4">Vol</span><span class="text-right">{{ tooltip.volume }}</span>
          </div>
        </div>
      </Transition>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * Komponen chart OHLCV — candlestick menggunakan canvas
 * Menampilkan data dengan pilihan timeframe intraday dan daily
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

// Computed: apakah sudah mentok di kiri
const atLeftEdge = computed(() => {
  if (!props.data?.length) return false
  const totalLen = props.data.length
  const maxVisible = Math.min(visibleCandles.value, totalLen)
  const maxPan = Math.max(0, totalLen - maxVisible)
  return panOffset.value >= maxPan && maxPan > 0
})

// Konfigurasi timeframe — setiap opsi punya interval dan range
interface TimeframePeriod {
  label: string
  interval: string
  range: string
  candleLabel: string // Keterangan per candle
}

const periods: TimeframePeriod[] = [
  { label: '5m', interval: '5m', range: '1d', candleLabel: '5 menit' },
  { label: '15m', interval: '15m', range: '5d', candleLabel: '15 menit' },
  { label: '30m', interval: '30m', range: '5d', candleLabel: '30 menit' },
  { label: '1H', interval: '60m', range: '1mo', candleLabel: '1 jam' },
  { label: '1D', interval: '1d', range: '3mo', candleLabel: '1 hari' },
  { label: '1W', interval: '1wk', range: '1y', candleLabel: '1 minggu' },
  { label: '1M', interval: '1mo', range: '5y', candleLabel: '1 bulan' },
]

// Default: 1 hari per candle, 3 bulan range
const activePeriod = ref('1d')
const activeCandle = computed(() => periods.find(p => p.interval === activePeriod.value)?.candleLabel || '1 hari')

const chartType = ref('candle')
const isAnalyzingPattern = ref(false)

// Pan/Scroll state
const panOffset = ref(0) // jumlah candle offset dari kanan (0 = paling terbaru)
const visibleCandles = ref(60) // jumlah candle yg terlihat
let isDragging = false
let dragStartX = 0
let dragStartPan = 0
let isMobileLongPress = false
let longPressTimer: ReturnType<typeof setTimeout> | null = null
const isLoadingMore = ref(false) // flag: reaktif untuk dipakai di template
let anchorTimestamp: number | null = null // timestamp candle terkiri sebelum loadMore

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

// Ambil params berdasarkan active period
function getActivePeriodParams(): { interval: string; range: string } {
  const p = periods.find(p => p.interval === activePeriod.value)
  return { interval: p?.interval || '1d', range: p?.range || '3mo' }
}

function changePeriod(interval: string) {
  activePeriod.value = interval
  const p = periods.find(p => p.interval === interval)
  if (p) emit('periodChange', { interval: p.interval, range: p.range })
}

// Format angka
function fmt(n: number): string {
  return new Intl.NumberFormat('id-ID').format(n)
}

function fmtVol(n: number): string {
  if (n >= 1_000_000_000) return (n / 1_000_000_000).toFixed(1) + 'B'
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M'
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K'
  return n.toString()
}

// Render chart saat data berubah
watch(() => props.data, (newData, oldData) => {
  detectedPatterns.value = []
  if (isLoadingMore.value && oldData?.length && newData?.length) {
    // Data bertambah dari loadMore: cari posisi anchor timestamp
    if (anchorTimestamp !== null) {
      // Cari index dari anchor di data baru
      const newDataSorted = [...newData].sort((a: any, b: any) => {
        const tA = a.timestamp || new Date(a.date || a.Date || 0).getTime()
        const tB = b.timestamp || new Date(b.date || b.Date || 0).getTime()
        return tA - tB
      })
      const anchorIdx = newDataSorted.findIndex(d => {
        const t = d.timestamp || new Date(d.date || d.Date || 0).getTime()
        return t === anchorTimestamp
      })
      if (anchorIdx !== -1) {
        // panOffset dihitung dari KANAN (newDataSorted.length - 1)
        // Jika anchorIdx adalah candle terkiri yang terlihat, maka offset kanan:
        // offset = newDataSorted.length - anchorIdx - visibleCandles
        panOffset.value = Math.max(0, newDataSorted.length - anchorIdx - visibleCandles.value)
      } else {
        // Fallback jika tidak ketemu
        const addedCount = newData.length - oldData.length
        if (addedCount > 0) panOffset.value += addedCount
      }
    }
    isLoadingMore.value = false
    anchorTimestamp = null
  } else {
    // Data baru (ganti saham/timeframe): reset ke posisi terbaru
    panOffset.value = 0
  }
  nextTick(() => drawChart())
}, { deep: true })

// Auto-trigger loadMore saat pan mentok kiri
watch(atLeftEdge, (isEdge) => {
  if (isEdge && !props.loading && !isLoadingMore.value && props.data?.length) {
    // Simpan timestamp dari candle terkiri yang sedang terlihat sebagai anchor
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

// Re-draw saat dark mode berubah
watch(isDark, () => nextTick(() => drawChart()))

// Resize handler
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

  // Sort chronologically (oldest → newest) agar chart terbaca kiri → kanan
  const allItems = [...props.data].sort((a, b) => {
    const tA = a.timestamp || new Date(a.date || a.Date || 0).getTime()
    const tB = b.timestamp || new Date(b.date || b.Date || 0).getTime()
    return tA - tB
  })

  // Viewport: hanya tampilkan candle yang visible berdasarkan panOffset
  const totalLen = allItems.length
  const maxVisible = Math.min(visibleCandles.value, totalLen)
  const maxPan = Math.max(0, totalLen - maxVisible)
  panOffset.value = Math.max(0, Math.min(panOffset.value, maxPan))
  
  const startIdx = totalLen - maxVisible - panOffset.value
  const endIdx = startIdx + maxVisible
  const items = allItems.slice(Math.max(0, startIdx), endIdx)

  const padding = { top: 10, right: 60, bottom: 30, left: 10 }
  const chartW = width - padding.left - padding.right
  const chartH = height - padding.top - padding.bottom

  // Cari range harga
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

  const barWidth = Math.max(2, (chartW / items.length) * 0.6)
  const barGap = chartW / items.length

  // Warna berdasarkan tema
  const gridColor = isDark.value ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.06)'
  const textColor = isDark.value ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.35)'
  const upColor = '#10b981'
  const downColor = '#ef4444'

  // Grid garis horizontal
  const gridLines = 5
  ctx.strokeStyle = gridColor
  ctx.lineWidth = 1
  ctx.font = '10px Inter, sans-serif'
  ctx.fillStyle = textColor
  ctx.textAlign = 'right'

  for (let i = 0; i <= gridLines; i++) {
    const y = padding.top + (chartH / gridLines) * i
    const price = maxPrice - (totalRange / gridLines) * i

    ctx.beginPath()
    ctx.setLineDash([4, 4])
    ctx.moveTo(padding.left, y)
    ctx.lineTo(width - padding.right, y)
    ctx.stroke()
    ctx.setLineDash([])

    ctx.fillText(fmt(Math.round(price)), width - 5, y + 3)
  }

  // Render Chart Body
  if (chartType.value === 'candle') {
    // Candlestick bars
    for (let i = 0; i < items.length; i++) {
      const d = items[i]
      const open = d.open || d.Open || d.o || 0
      const close = d.close || d.Close || d.c || 0
      const high = d.high || d.High || d.h || 0
      const low = d.low || d.Low || d.l || 0

      const x = padding.left + barGap * i + barGap / 2
      const isUp = close >= open
      const color = isUp ? upColor : downColor

      // Posisi Y
      const yOpen = padding.top + ((maxPrice - open) / totalRange) * chartH
      const yClose = padding.top + ((maxPrice - close) / totalRange) * chartH
      const yHigh = padding.top + ((maxPrice - high) / totalRange) * chartH
      const yLow = padding.top + ((maxPrice - low) / totalRange) * chartH

      // Wick (garis vertikal)
      ctx.strokeStyle = color
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(x, yHigh)
      ctx.lineTo(x, yLow)
      ctx.stroke()

      // Body (kotak)
      ctx.fillStyle = color
      const bodyTop = Math.min(yOpen, yClose)
      const bodyH = Math.max(Math.abs(yClose - yOpen), 1)
      ctx.fillRect(x - barWidth / 2, bodyTop, barWidth, bodyH)
    }
  } else {
    // Line chart dengan gradient fill di bawah garis
    const linePoints: { x: number; y: number }[] = []
    for (let i = 0; i < items.length; i++) {
      const close = items[i].close || items[i].Close || items[i].c || 0
      const x = padding.left + barGap * i + barGap / 2
      const yClose = padding.top + ((maxPrice - close) / totalRange) * chartH
      linePoints.push({ x, y: yClose })
    }

    // Gradient area di bawah garis untuk efek visual modern
    if (linePoints.length > 1) {
      const grad = ctx.createLinearGradient(0, padding.top, 0, height - padding.bottom)
      grad.addColorStop(0, isDark.value ? 'rgba(59,130,246,0.28)' : 'rgba(59,130,246,0.22)')
      grad.addColorStop(1, 'rgba(59,130,246,0)')
      ctx.fillStyle = grad
      ctx.beginPath()
      ctx.moveTo(linePoints[0]!.x, height - padding.bottom)
      for (const p of linePoints) ctx.lineTo(p.x, p.y)
      ctx.lineTo(linePoints[linePoints.length - 1]!.x, height - padding.bottom)
      ctx.closePath()
      ctx.fill()
    }

    // Garis utama
    ctx.strokeStyle = '#3b82f6'
    ctx.lineWidth = 2
    ctx.lineJoin = 'round'
    ctx.lineCap = 'round'
    ctx.beginPath()
    for (let i = 0; i < linePoints.length; i++) {
      const p = linePoints[i]!
      if (i === 0) ctx.moveTo(p.x, p.y)
      else ctx.lineTo(p.x, p.y)
    }
    ctx.stroke()
  }

  // Draw Trading Plan overlays
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

    // Buy Zone Fill
    if (yBTop >= padding.top && yBBottom <= height - padding.bottom) {
      ctx.fillStyle = isDark.value ? 'rgba(16, 185, 129, 0.1)' : 'rgba(16, 185, 129, 0.15)'
      ctx.fillRect(padding.left, yBTop, chartW, yBBottom - yBTop)
    }

    const drawDashedLine = (y: number, color: string, label: string) => {
      if (y < padding.top || y > height - padding.bottom) return
      ctx.strokeStyle = color
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.setLineDash([5, 5])
      ctx.moveTo(padding.left, y)
      ctx.lineTo(width - padding.right, y)
      ctx.stroke()
      ctx.setLineDash([])
      
      ctx.fillStyle = isDark.value ? '#1a1d28' : '#ffffff'
      ctx.fillRect(padding.left + 2, y - 10, 52, 14)
      
      ctx.fillStyle = color
      ctx.textAlign = 'left'
      ctx.font = 'bold 9px Inter, sans-serif'
      ctx.fillText(label, padding.left + 6, y + 1)
    }

    drawDashedLine(yR1, '#3b82f6', 'TARGET')
    drawDashedLine(yS1, '#10b981', 'BUY ZONE')
    drawDashedLine(ySL, '#ef4444', 'STOP LOSS')
  }

  // Tanggal/Waktu di bawah (setiap 5-10 candle)
  const isIntraday = ['5m', '15m', '30m', '60m'].includes(activePeriod.value)
  ctx.fillStyle = textColor
  ctx.textAlign = 'center'
  ctx.font = 'bold 9px Inter, sans-serif'
  const step = Math.ceil(items.length / 6)
  for (let i = 0; i < items.length; i += step) {
    const d = items[i]
    const dateStr = d.date || d.Date || d.timestamp || ''
    if (dateStr) {
      const x = padding.left + barGap * i + barGap / 2
      const dt = typeof dateStr === 'number' ? new Date(dateStr * 1000) : new Date(dateStr)
      let label: string
      if (isIntraday) {
        // Tampilkan jam:menit untuk intraday
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
        // Smooth SMA Trend Curve — digambar langsung dari data smaValues
        const smaVals: number[] = (pat as any).smaValues || []
        const phases: {startI: number, endI: number, dir: string}[] = (pat as any).phases || []
        
        if (smaVals.length > 1) {
          // Gambar garis SMA smooth berwarna per segmen
          for (const phase of phases) {
            const color = phase.dir === 'UP' ? '#10b981' : phase.dir === 'DOWN' ? '#ef4444' : '#64748b'
            ctx.strokeStyle = color
            ctx.lineWidth = 3
            ctx.lineJoin = 'round'
            ctx.lineCap = 'round'
            ctx.beginPath()
            
            for (let k = phase.startI; k <= Math.min(phase.endI, smaVals.length - 1); k++) {
              const x = padding.left + barGap * k + barGap / 2
              const y = padding.top + ((maxPrice - smaVals[k]) / totalRange) * chartH
              if (k === phase.startI) ctx.moveTo(x, y)
              else ctx.lineTo(x, y)
            }
            ctx.stroke()
            
            // Fill gradient di bawah/atas garis untuk efek visual
            const midI = Math.floor((phase.startI + phase.endI) / 2)
            const midX = padding.left + barGap * Math.min(midI, smaVals.length - 1) + barGap / 2
            const midY = padding.top + ((maxPrice - smaVals[Math.min(midI, smaVals.length - 1)]) / totalRange) * chartH
            
            ctx.font = 'bold 10px Inter, sans-serif'
            ctx.textAlign = 'center'
            ctx.fillStyle = color
            const lbl = phase.dir === 'UP' ? '▲ UPTREND' : phase.dir === 'DOWN' ? '▼ DOWNTREND' : '◆ SIDEWAYS'
            ctx.fillText(lbl, midX, Math.max(padding.top + 12, midY - 12))
          }
        }
      } 
      else if (pat.type !== 'trend_curve') {
        // Line Pattern connecting points
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
        
        // Draw dots
        for (let k = 0; k < pat.points.length; k++) {
          const pt = pat.points[k]
          const px = padding.left + barGap * pt.i + barGap / 2
          const py = padding.top + ((maxPrice - pt.price) / totalRange) * chartH
          ctx.beginPath()
          ctx.arc(px, py, 4, 0, Math.PI * 2)
          ctx.fill()
        }
        
        // Label at last point
        ctx.font = 'bold 10px Inter, sans-serif'
        ctx.textAlign = 'center'
        ctx.fillStyle = isDark.value ? '#ffffff' : '#000000'
        ctx.fillText(pat.label, Math.max(padding.left + 30, Math.min(width - 30, lastX)), lastY - 15)
      }
    }
  }

  // --- Tooltip helper ---
  function showTooltipAt(clientX: number, clientY: number, isTouch: boolean) {
    const rect = canvas.getBoundingClientRect()
    const mx = clientX - rect.left
    const idx = Math.floor((mx - padding.left) / barGap)

    if (idx >= 0 && idx < items.length) {
      const d = items[idx]
      tooltip.show = true
      tooltip.cx = padding.left + barGap * idx + barGap / 2
      
      if (isTouch) {
        tooltip.x = Math.min(Math.max(tooltip.cx - 65, 10), width - 140)
        tooltip.y = 25 
      } else {
        tooltip.x = Math.min(Math.max(tooltip.cx - 80, 10), width - 170)
        tooltip.y = Math.max(10, clientY - rect.top - 90)
      }
      
      const rawDate = d.date || d.Date || d.timestamp || ''
      const dt = typeof rawDate === 'number' ? new Date(rawDate * 1000) : new Date(rawDate)
      if (isIntraday) {
        tooltip.dateFormatted = rawDate ? dt.toLocaleString('id-ID', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : '-'
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

  // --- Mouse: hover = tooltip, drag = pan ---
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

  // --- Touch: quick drag = pan, long press (300ms) = tooltip mode ---
  canvas.ontouchstart = (e: TouchEvent) => {
    if (!e.touches.length) return
    const t = e.touches[0]
    dragStartX = t.clientX
    dragStartPan = panOffset.value
    isDragging = false
    isMobileLongPress = false

    // Long press timer: jika hold 300ms tanpa bergerak → mode tooltip
    if (longPressTimer) clearTimeout(longPressTimer)
    longPressTimer = setTimeout(() => {
      isMobileLongPress = true
      if (e.cancelable) e.preventDefault()
      showTooltipAt(t.clientX, t.clientY, true)
    }, 300)
  }
  canvas.ontouchmove = (e: TouchEvent) => {
    if (!e.touches.length) return
    const t = e.touches[0]
    const dx = t.clientX - dragStartX

    if (isMobileLongPress) {
      // Mode tooltip — geser jari = geser crosshair
      if (e.cancelable) e.preventDefault()
      showTooltipAt(t.clientX, t.clientY, true)
    } else {
      // Mode pan — geser chart
      if (Math.abs(dx) > 5) {
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

// Logic Analisa Pola (Pattern Recognition)
function analyzeChartPatterns() {
  if (!props.data || props.data.length < 10) return

  // Toggle Off jika sudah aktif
  if (detectedPatterns.value.length > 0) {
    detectedPatterns.value = []
    drawChart()
    return
  }

  isAnalyzingPattern.value = true
  setTimeout(() => {
    detectedPatterns.value = []
    
    // Sort chronologically: index 0 = oldest
    const items = [...props.data].sort((a, b) => {
      const tA = a.timestamp || new Date(a.date || a.Date || 0).getTime()
      const tB = b.timestamp || new Date(b.date || b.Date || 0).getTime()
      return tA - tB
    })
    const closes = items.map(d => Number(d.close || d.Close || d.c || 0))
    const highs = items.map(d => Number(d.high || d.High || d.h || 0))
    const lows = items.map(d => Number(d.low || d.Low || d.l || 0))
    
    // 1. Analisa Tren Utama — Smooth SMA Curve berwarna per fase
    const smaPeriod = Math.max(5, Math.floor(closes.length / 10)) // Adaptive SMA period
    const smaValues: number[] = []
    for (let i = 0; i < closes.length; i++) {
      const start = Math.max(0, i - smaPeriod + 1)
      const slice = closes.slice(start, i + 1)
      smaValues.push(slice.reduce((a, b) => a + b, 0) / slice.length)
    }
    
    // Deteksi fase: bandingkan SMA saat ini vs SMA beberapa bar sebelumnya
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
    // Push fase terakhir
    phases.push({ startI: phaseStart, endI: smaValues.length - 1, dir: currentDir })
    
    detectedPatterns.value.push({
      type: 'trend_curve',
      label: '',
      color: '',
      points: [],
      smaValues,
      phases
    } as any)

    // 2. Deteksi Titik Pivot (Puncak dan Lembah Lokal)
    const lookback = Math.max(2, Math.floor(closes.length / 20))
    const pivots: {type: 'peak'|'valley', i: number, price: number}[] = []
    for (let i = lookback; i < closes.length - lookback; i++) {
        const sliceH = highs.slice(i - lookback, i + lookback + 1)
        const sliceL = lows.slice(i - lookback, i + lookback + 1)
        
        // Puncak
        if (highs[i] >= Math.max(...sliceH)) {
           if (pivots.length && pivots[pivots.length - 1].type === 'peak') {
              if (highs[i] > pivots[pivots.length - 1].price) pivots[pivots.length - 1] = {type: 'peak', i, price: highs[i]}
           } else {
              pivots.push({type: 'peak', i, price: highs[i]})
           }
        }
        // Lembah
        if (lows[i] <= Math.min(...sliceL)) {
           if (pivots.length && pivots[pivots.length - 1].type === 'valley') {
              if (lows[i] < pivots[pivots.length - 1].price) pivots[pivots.length - 1] = {type: 'valley', i, price: lows[i]}
           } else {
              pivots.push({type: 'valley', i, price: lows[i]})
           }
        }
    }

    // 3. Pencocokan Pola (Double Bottom, Double Top)
    for (let i = 0; i < pivots.length - 2; i++) {
       const p1 = pivots[i]; const p2 = pivots[i+1]; const p3 = pivots[i+2];
       
       if (p1.type === 'valley' && p2.type === 'peak' && p3.type === 'valley') {
          if (Math.abs(p1.price - p3.price) / p1.price < 0.05) { // Toleransi kedalaman 5%
             detectedPatterns.value.push({
                type: 'double_bottom', label: 'BULLISH: Double Bottom', color: '#3b82f6', // Blueprint
                points: [p1, p2, p3]
             })
             i += 2; continue;
          }
       }
       if (p1.type === 'peak' && p2.type === 'valley' && p3.type === 'peak') {
          if (Math.abs(p1.price - p3.price) / p1.price < 0.05) {
             detectedPatterns.value.push({
                type: 'double_top', label: 'BEARISH: Double Top', color: '#f59e0b', // Amber
                points: [p1, p2, p3]
             })
             i += 2; continue;
          }
       }
    }
    
    // 4. Pencocokan Pola (Head & Shoulders)
    for (let i = 0; i < pivots.length - 4; i++) {
       const p1 = pivots[i]; const p2 = pivots[i+1]; const p3 = pivots[i+2]; const p4 = pivots[i+3]; const p5 = pivots[i+4];
       if (p1.type==='peak' && p2.type==='valley' && p3.type==='peak' && p4.type==='valley' && p5.type==='peak') {
          if (p3.price > p1.price && p3.price > p5.price) { // Head lebih tinggi dari kiri & kanan
             const leftRightSym = Math.abs(p1.price - p5.price) / p1.price < 0.05
             const neckSym = Math.abs(p2.price - p4.price) / p2.price < 0.05
             if (leftRightSym && neckSym) {
                detectedPatterns.value.push({
                   type: 'head_shoulders', label: 'BEARISH: Head & Shoulders', color: '#db2777', // Pink
                   points: [p1, p2, p3, p4, p5]
                })
                i += 4;
             }
          }
       }
    }

    isAnalyzingPattern.value = false
    drawChart()
  }, 500) // Waktu simulasi analisa visual
}
</script>

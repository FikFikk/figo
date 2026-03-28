<template>
  <div class="glass-panel rounded-2xl border overflow-hidden"
    :class="isDark ? 'border-white/5' : 'border-slate-100'"
  >
    <!-- Header -->
    <div class="flex items-center justify-between px-5 pt-5 pb-3">
      <div class="flex items-center gap-2">
        <span class="material-symbols-outlined text-lg text-primary">candlestick_chart</span>
        <h3 class="font-headline font-bold text-sm" :class="isDark ? 'text-white' : 'text-slate-900'">
          Chart OHLCV
        </h3>
      </div>

      <!-- Period selector -->
      <div class="flex items-center gap-1 rounded-xl p-0.5"
        :class="isDark ? 'bg-white/5' : 'bg-slate-100'"
      >
        <button v-for="p in periods" :key="p.value" @click="changePeriod(p.value)"
          class="px-3 py-1.5 rounded-2xl text-[10px] font-bold uppercase tracking-wider transition-all"
          :class="activePeriod === p.value
            ? (isDark ? 'bg-primary/20 text-primary' : 'bg-primary text-white shadow-sm')
            : (isDark ? 'text-gray-500 hover:text-gray-300' : 'text-slate-500 hover:text-slate-700')"
        >{{ p.label }}</button>
      </div>
    </div>

    <!-- Unlocked State -->
    <div v-if="!data?.length && !loading" class="flex flex-col items-center justify-center py-10 text-center" style="height: 320px;">
      <div class="w-12 h-12 rounded-2xl flex items-center justify-center mb-3" :class="isDark ? 'bg-white/5' : 'bg-slate-50'">
        <span class="material-symbols-outlined text-xl opacity-50">show_chart</span>
      </div>
      <h4 class="font-bold text-sm mb-1" :class="isDark ? 'text-white' : 'text-slate-900'">Chart OHLCV</h4>
      <p class="text-[10px] opacity-60 mb-4 max-w-[280px]">Klik untuk memuat grafik pergerakan harga historis guna menghemat kuota API.</p>
      <button @click="$emit('fetch', activePeriod)" class="px-5 py-2 rounded-2xl text-xs font-bold transition-all" :class="isDark ? 'bg-primary/20 text-primary hover:bg-primary/30' : 'bg-primary text-white hover:bg-primary/90 shadow-sm'">
        Tampilkan Chart
      </button>
    </div>

    <!-- Chart Canvas -->
    <div v-else class="relative px-2 pb-4" style="height: 320px;">
      <!-- Loading -->
      <div v-if="loading" class="absolute inset-0 flex items-center justify-center">
        <span class="material-symbols-outlined text-primary animate-spin text-2xl">progress_activity</span>
      </div>

      <!-- Canvas -->
      <canvas ref="canvasRef" class="w-full h-full" :class="{ 'opacity-0': loading }"></canvas>

      <!-- Tooltip -->
      <Transition
        enter-active-class="transition duration-150 ease-out"
        enter-from-class="opacity-0"
        enter-to-class="opacity-100"
        leave-active-class="transition duration-100 ease-in"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <div v-if="tooltip.show"
          class="absolute pointer-events-none px-3 py-2 rounded-2xl text-[10px] font-mono shadow-xl z-10 border"
          :class="isDark ? 'bg-[#1a1d28] border-white/10 text-gray-200' : 'bg-white border-slate-200 text-slate-700'"
          :style="{ left: tooltip.x + 'px', top: tooltip.y + 'px' }"
        >
          <p class="font-bold text-[11px] mb-1">{{ tooltip.date }}</p>
          <div class="grid grid-cols-2 gap-x-3 gap-y-0.5">
            <span class="opacity-50">Open</span><span class="text-right">{{ tooltip.open }}</span>
            <span class="opacity-50">High</span><span class="text-right text-emerald-500">{{ tooltip.high }}</span>
            <span class="opacity-50">Low</span><span class="text-right text-red-500">{{ tooltip.low }}</span>
            <span class="opacity-50">Close</span><span class="text-right font-bold">{{ tooltip.close }}</span>
            <span class="opacity-50">Vol</span><span class="text-right">{{ tooltip.volume }}</span>
          </div>
        </div>
      </Transition>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * Komponen chart OHLCV — candlestick menggunakan canvas
 * Menampilkan data harian dengan hover tooltip
 */
const props = defineProps<{
  data: any[]
  loading: boolean
}>()

const emit = defineEmits<{
  periodChange: [limit: number]
  fetch: [limit: number]
}>()

const { isDark } = useColorMode()

const canvasRef = ref<HTMLCanvasElement | null>(null)

// Hitung hari trading untuk YTD (sekitar 5/7 dari hari kalender sejak 1 Januari)
const ytdDays = Math.max(5, Math.floor(Math.ceil(Math.abs(new Date().getTime() - new Date(new Date().getFullYear(), 0, 1).getTime()) / (1000 * 60 * 60 * 24)) * 5 / 7))

const periods = [
  { label: '1D', value: 2 }, // Mengambil 2 hari agar terlihat sedkit konteks pergerakan (hari ini vs kemarin)
  { label: '1W', value: 5 },
  { label: '1M', value: 21 },
  { label: '3M', value: 63 },
  { label: 'YTD', value: ytdDays },
  { label: '1Y', value: 252 },
  { label: '3Y', value: 756 },
  { label: '5Y', value: 1260 },
]

const activePeriod = ref(63) // Default 3M

const tooltip = reactive({
  show: false,
  x: 0,
  y: 0,
  date: '',
  open: '',
  high: '',
  low: '',
  close: '',
  volume: '',
})

function changePeriod(days: number) {
  activePeriod.value = days
  emit('periodChange', days)
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
watch(() => props.data, () => {
  nextTick(() => drawChart())
}, { deep: true })

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
  const height = 300

  canvas.width = width * dpr
  canvas.height = height * dpr
  canvas.style.width = width + 'px'
  canvas.style.height = height + 'px'

  const ctx = canvas.getContext('2d')!
  ctx.scale(dpr, dpr)
  ctx.clearRect(0, 0, width, height)

  const items = [...props.data].reverse() // Data API biasanya terbaru di index 0
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

  // Tanggal di bawah (setiap 5-10 candle)
  ctx.fillStyle = textColor
  ctx.textAlign = 'center'
  const step = Math.ceil(items.length / 6)
  for (let i = 0; i < items.length; i += step) {
    const d = items[i]
    const dateStr = d.date || d.Date || d.timestamp || ''
    if (dateStr) {
      const x = padding.left + barGap * i + barGap / 2
      const label = new Date(dateStr).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })
      ctx.fillText(label, x, height - 5)
    }
  }

  // Mouse hover handler
  canvas.onmousemove = (e: MouseEvent) => {
    const rect = canvas.getBoundingClientRect()
    const mx = e.clientX - rect.left
    const idx = Math.floor((mx - padding.left) / barGap)

    if (idx >= 0 && idx < items.length) {
      const d = items[idx]
      tooltip.show = true
      tooltip.x = Math.min(mx + 10, width - 160)
      tooltip.y = Math.max(10, e.clientY - rect.top - 80)
      tooltip.date = d.date || d.Date || d.timestamp || '-'
      tooltip.open = fmt(d.open || d.Open || d.o || 0)
      tooltip.high = fmt(d.high || d.High || d.h || 0)
      tooltip.low = fmt(d.low || d.Low || d.l || 0)
      tooltip.close = fmt(d.close || d.Close || d.c || 0)
      tooltip.volume = fmtVol(d.volume || d.Volume || d.vol || 0)
    } else {
      tooltip.show = false
    }
  }

  canvas.onmouseleave = () => {
    tooltip.show = false
  }
}
</script>

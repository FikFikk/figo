<template>
  <div class="glass-panel rounded-2xl p-5 md:p-6 border"
    :class="isDark ? 'border-white/5' : 'border-slate-100'"
  >
    <!-- Header -->
    <div class="flex items-center justify-between mb-5">
      <div class="flex items-center gap-2">
        <span class="material-symbols-outlined text-lg text-primary">analytics</span>
        <h3 class="font-headline font-bold text-sm" :class="isDark ? 'text-white' : 'text-slate-900'">
          Analisa Teknikal
        </h3>
      </div>

      <!-- Summary Score -->
      <div v-if="summary" class="flex items-center gap-2">
        <div class="flex items-center gap-1 px-2.5 py-1 rounded-2xl text-[10px] font-black"
          :class="summary.signal === 'BUY' ? 'bg-emerald-500/15 text-emerald-500' :
                   summary.signal === 'SELL' ? 'bg-red-500/15 text-red-500' :
                   isDark ? 'bg-white/5 text-gray-400' : 'bg-slate-100 text-slate-500'"
        >
          <span class="material-symbols-outlined text-xs">
            {{ summary.signal === 'BUY' ? 'thumb_up' : summary.signal === 'SELL' ? 'thumb_down' : 'drag_handle' }}
          </span>
          {{ summary.signal }}
        </div>
        <span class="text-[10px] font-bold" :class="isDark ? 'text-gray-500' : 'text-slate-400'">
          {{ summary.buyCount }}B / {{ summary.sellCount }}S / {{ summary.neutralCount }}N
        </span>
      </div>
    </div>

    <!-- Unlocked State -->
    <div v-if="!data && !loading" class="flex flex-col items-center justify-center py-6 text-center h-[200px]">
      <div class="w-10 h-10 rounded-2xl flex items-center justify-center mb-3" :class="isDark ? 'bg-white/5' : 'bg-slate-50'">
        <span class="material-symbols-outlined text-lg opacity-50">lock</span>
      </div>
      <h4 class="font-bold text-sm mb-1" :class="isDark ? 'text-white' : 'text-slate-900'">Analisa Teknikal</h4>
      <p class="text-[10px] opacity-60 mb-4 max-w-[200px]">Klik untuk memuat data teknikal guna menghemat kuota API.</p>
      <button @click="$emit('fetch')" class="px-5 py-2 rounded-2xl text-xs font-bold transition-all" :class="isDark ? 'bg-primary/20 text-primary hover:bg-primary/30' : 'bg-primary text-white hover:bg-primary/90 shadow-sm'">
        Tampilkan Data
      </button>
    </div>

    <!-- Loading -->
    <div v-else-if="loading" class="grid grid-cols-1 md:grid-cols-2 gap-2">
      <div v-for="i in 6" :key="i" class="h-14 rounded-xl animate-pulse"
        :class="isDark ? 'bg-white/5' : 'bg-slate-100'"></div>
    </div>

    <!-- Indikator Grid -->
    <div v-else-if="indicators.length > 0" class="grid grid-cols-1 md:grid-cols-2 gap-2">
      <div v-for="ind in indicators" :key="ind.name"
        class="flex items-center justify-between px-4 py-3 rounded-2xl border transition-all"
        :class="isDark ? 'bg-white/[0.02] border-white/5' : 'bg-slate-50/60 border-slate-100'"
      >
        <div class="flex items-center gap-3 min-w-0">
          <div class="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
            :class="signalBgClass(ind.signal)"
          >
            <span class="material-symbols-outlined text-sm" :class="signalTextClass(ind.signal)">
              {{ signalIcon(ind.signal) }}
            </span>
          </div>
          <div class="min-w-0 pt-0.5">
            <div class="flex items-center gap-1.5 mb-0.5">
              <p class="text-[11px] font-bold uppercase tracking-wider"
                :class="isDark ? 'text-gray-200' : 'text-slate-800'"
              >{{ ind.name }}</p>
              <span class="text-[9px] font-mono px-1.5 rounded bg-black/5 dark:bg-white/10 opacity-70">
                {{ ind.value }}
              </span>
            </div>
            <p class="text-[10px] leading-relaxed pr-2" :class="isDark ? 'text-gray-400' : 'text-slate-500'">
              {{ ind.desc }}
            </p>
          </div>
        </div>

        <!-- Signal Badge -->
        <span class="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider flex-shrink-0"
          :class="signalBadgeClass(ind.signal)"
        >{{ ind.signal }}</span>
      </div>
    </div>

    <!-- Empty state -->
    <div v-else class="text-center py-8">
      <span class="material-symbols-outlined text-3xl opacity-15 mb-2 block">analytics</span>
      <p class="text-xs opacity-40">Tidak ada data teknikal tersedia</p>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * Komponen sinyal teknikal — RSI, MACD, SMA, EMA, Bollinger Bands
 * Setiap indikator menampilkan nama, nilai, dan sinyal BUY/SELL/NEUTRAL
 */
const props = defineProps<{
  data: any
  loading: boolean
}>()

const { isDark } = useColorMode()

interface Indicator {
  name: string
  value: string
  desc: string
  signal: string
}

// Parse data dari API ke format display
const indicators = computed<Indicator[]>(() => {
  if (!props.data) return []

  const rawIndicators = props.data?.data?.data?.indicators
    || props.data?.data?.indicators
    || props.data?.indicators
    || null

  if (!rawIndicators || typeof rawIndicators !== 'object') return []

  const result: Indicator[] = []

  for (const [key, val] of Object.entries(rawIndicators as Record<string, any>)) {
    if (!val || typeof val !== 'object') continue

    // Indikator dengan signal langsung (RSI, MACD, dll)
    if ('signal' in val || 'value' in val) {
      let displayValue = ''
      let desc = ''
      const sig = normalizeSignal(val.signal ?? val.trend ?? val.action ?? 'NEUTRAL')

      const lowerKey = key.toLowerCase()
      if (lowerKey === 'rsi') {
        const r = Number(val.value)
        displayValue = formatNum(r)
        if (r > 70) desc = "Mahal (Overbought). Harga rawan turun/koreksi."
        else if (r < 30) desc = "Murah (Oversold). Potensi besar untuk naik."
        else desc = "Aktivitas beli dan jual sedang seimbang."
      }
      else if (lowerKey === 'macd') {
        displayValue = formatNum(val.macdLine)
        if (sig === 'BUY') desc = "Garis MACD menanjak naik. Indikasi momentum Beli kuat."
        else if (sig === 'SELL') desc = "Garis MACD menukik turun. Momentum harga melemah."
        else desc = "Tren sedang mendatar (sideways)."
      }
      else if (lowerKey === 'stochastic') {
        const k = Number(val.k); const d = Number(val.d)
        displayValue = `K:${formatNum(k)} D:${formatNum(d)}`
        if (k > 80 && d > 80) desc = "Sangat jenuh beli. Hati-hati harga berbalik arah tiba-tiba."
        else if (k < 20 && d < 20) desc = "Sangat jenuh jual. Banyak yang antre untuk jaring bawah."
        else desc = "Momentum pergerakan harga di area tengah."
      }
      else if (lowerKey === 'atr') {
        displayValue = formatNum(val.value)
        const v = String(val.volatility || '').toUpperCase()
        if (v.includes('HIGH')) desc = "Pergerakan harga sangat liar (Volatilitas Tinggi)."
        else if (v.includes('LOW')) desc = "Pergerakan harga lambat dan stabil."
        else desc = "Rentang pergerakan harga berfluktuasi normal."
      }
      else if (lowerKey === 'obv') {
        displayValue = formatVolNum(val.value)
        if (sig === 'BUY') desc = "Volume uang masuk (Akumulasi) lebih besar dari yang keluar."
        else if (sig === 'SELL') desc = "Lebih banyak buang barang (Distribusi) dibanding yang beli."
        else desc = "Arus volume uang masuk dan keluar sejajar."
      }
      else if (lowerKey === 'vwap') {
        displayValue = `Rp ${formatNum(val.value)}`
        desc = `Rata-rata harga bandar hari ini. (Sinyal: ${sig})`
      }
      else {
        displayValue = formatNum(val.value ?? val.current ?? 0)
        desc = `Indikator tambahan membaca sinyal: ${sig}.`
      }

      result.push({
        name: key.toUpperCase(),
        value: displayValue,
        desc,
        signal: sig,
      })
    }
    // Indikator tanpa signal langsung tapi kumpulan data (SMA, EMA)
    else {
      const isSMA = key.toLowerCase() === 'sma'
      const isEMA = key.toLowerCase() === 'ema'
      
      if (isSMA || isEMA) {
        const short = val[`${key}5`] || val[`${key}10`]
        const mid = val[`${key}20`] || val[`${key}50`]
        
        // Cukup tampilkan 2 angka rata2
        const entries = Object.entries(val).filter(([_, v]) => v !== null).slice(0, 2)
        const displayValue = entries.map(([k, v]) => `${k.toUpperCase()}=${formatNum(v)}`).join(', ')
        
        let desc = 'Data rata-rata harga historis.'
        let sig = 'NEUTRAL'
        
        if (short && mid) {
          if (short > mid) {
            desc = "Garis tren jangka pendek DI ATAS menengah. Fase Naik (Uptrend)."
            sig = 'BUY'
          } else {
            desc = "Garis tren jangka pendek DI BAWAH menengah. Fase Turun (Downtrend)."
            sig = 'SELL'
          }
        }
        
        result.push({
          name: key.toUpperCase(),
          value: displayValue || '-',
          desc,
          signal: sig
        })
      }
    }
  }

  return result
})

// Summary score
const summary = computed(() => {
  if (indicators.value.length === 0) return null

  let buy = 0, sell = 0, neutral = 0
  for (const ind of indicators.value) {
    const s = ind.signal.toUpperCase()
    if (s === 'BUY' || s === 'STRONG BUY' || s === 'BULLISH') buy++
    else if (s === 'SELL' || s === 'STRONG SELL' || s === 'BEARISH') sell++
    else neutral++
  }

  let signal = 'NEUTRAL'
  if (buy > sell) signal = 'BUY'
  else if (sell > buy) signal = 'SELL'

  return { signal, buyCount: buy, sellCount: sell, neutralCount: neutral }
})

// Format angka
function formatNum(n: any): string {
  if (n === null || n === undefined) return '-'
  const num = Number(n)
  if (isNaN(num)) return String(n)
  return num.toFixed(2)
}

function formatVolNum(n: any): string {
  const num = Number(n)
  if (isNaN(num)) return '-'
  if (Math.abs(num) >= 1_000_000) return (num / 1_000_000).toFixed(1) + 'M'
  if (Math.abs(num) >= 1_000) return (num / 1_000).toFixed(1) + 'K'
  return num.toFixed(0)
}

function normalizeSignal(s: any): string {
  if (!s) return 'NEUTRAL'
  const str = String(s).toUpperCase().trim()
  if (str.includes('BUY')) return 'BUY'
  if (str.includes('SELL')) return 'SELL'
  return 'NEUTRAL'
}

function signalIcon(signal: string): string {
  if (signal === 'BUY') return 'trending_up'
  if (signal === 'SELL') return 'trending_down'
  return 'drag_handle'
}

function signalBgClass(signal: string): string {
  if (signal === 'BUY') return 'bg-emerald-500/10'
  if (signal === 'SELL') return 'bg-red-500/10'
  return isDark.value ? 'bg-white/5' : 'bg-slate-100'
}

function signalTextClass(signal: string): string {
  if (signal === 'BUY') return 'text-emerald-500'
  if (signal === 'SELL') return 'text-red-500'
  return isDark.value ? 'text-gray-500' : 'text-slate-400'
}

function signalBadgeClass(signal: string): string {
  if (signal === 'BUY') return 'bg-emerald-500/15 text-emerald-500'
  if (signal === 'SELL') return 'bg-red-500/15 text-red-500'
  return isDark.value ? 'bg-white/5 text-gray-500' : 'bg-slate-100 text-slate-400'
}
</script>

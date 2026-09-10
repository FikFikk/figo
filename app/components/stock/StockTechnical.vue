<template>
  <div class="border transition-all duration-200"
    :class="isDark ? 'bg-[#15171e] border-neutral-800' : 'bg-white border-neutral-300 shadow-sm'"
  >
    <!-- Header -->
    <div class="p-4 md:p-5 border-b flex items-center justify-between"
      :class="isDark ? 'border-neutral-800' : 'border-neutral-200'"
    >
      <div class="flex items-center gap-2">
        <span class="material-symbols-outlined text-base opacity-70">analytics</span>
        <h3 class="font-mono font-bold text-xs uppercase tracking-widest" :class="isDark ? 'text-white' : 'text-neutral-900'">
          TECHNICAL SIGNALS
        </h3>
      </div>

      <!-- Summary Score Badge -->
      <div v-if="summary" class="flex items-center gap-2 font-mono text-[10px]">
        <div class="px-2 py-0.5 border font-bold uppercase tracking-wider flex items-center gap-1"
          :class="summary.signal === 'BUY' 
            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30' 
            : summary.signal === 'SELL' 
            ? 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/30' 
            : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 border-neutral-300 dark:border-neutral-700'"
        >
          <span class="material-symbols-outlined text-xs">
            {{ summary.signal === 'BUY' ? 'arrow_upward' : summary.signal === 'SELL' ? 'arrow_downward' : 'remove' }}
          </span>
          {{ summary.signal }}
        </div>
        <span class="opacity-50 tracking-wider">
          {{ summary.buyCount }}B · {{ summary.sellCount }}S · {{ summary.neutralCount }}N
        </span>
      </div>
    </div>

    <!-- Unlocked State -->
    <div v-if="!data && !loading" class="flex flex-col items-center justify-center p-8 text-center min-h-[220px]">
      <div class="w-10 h-10 border flex items-center justify-center mb-3" 
        :class="isDark ? 'bg-neutral-900 border-neutral-700 text-neutral-400' : 'bg-neutral-100 border-neutral-300 text-neutral-600'"
      >
        <span class="material-symbols-outlined text-lg">lock</span>
      </div>
      <h4 class="font-mono font-bold text-xs uppercase tracking-wider mb-1" :class="isDark ? 'text-white' : 'text-neutral-900'">
        TECHNICAL OSCILLATORS
      </h4>
      <p class="text-[11px] opacity-60 mb-4 max-w-[220px]">Click below to compute RSI, MACD, Stochastic & Moving Averages.</p>
      <button @click="$emit('fetch')" 
        class="px-5 py-2 text-xs font-mono font-bold uppercase tracking-wider border transition-all"
        :class="isDark 
          ? 'bg-white text-black border-white hover:bg-neutral-200' 
          : 'bg-neutral-900 text-white border-neutral-900 hover:bg-neutral-800'"
      >
        LOAD TECHNICALS
      </button>
    </div>

    <!-- Loading -->
    <div v-else-if="loading" class="p-4 grid grid-cols-1 gap-2">
      <div v-for="i in 5" :key="i" class="h-12 border animate-pulse"
        :class="isDark ? 'bg-neutral-900/40 border-neutral-800' : 'bg-neutral-100 border-neutral-200'"></div>
    </div>

    <!-- Indikator Grid (Swiss Tabular View) -->
    <div v-else-if="indicators.length > 0" class="divide-y"
      :class="isDark ? 'divide-neutral-800/80' : 'divide-neutral-200'"
    >
      <div v-for="ind in indicators" :key="ind.name"
        class="p-3.5 flex items-start justify-between gap-3 transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-900/40"
      >
        <div class="min-w-0 flex-1">
          <div class="flex items-center gap-2 mb-1">
            <span class="font-mono font-bold text-xs uppercase tracking-wider"
              :class="isDark ? 'text-white' : 'text-neutral-900'"
            >{{ ind.name }}</span>
            <span class="text-[10px] font-mono px-1.5 py-0.2 border bg-neutral-100 dark:bg-neutral-900"
              :class="isDark ? 'border-neutral-800 text-neutral-300' : 'border-neutral-200 text-neutral-700'"
            >
              {{ ind.value }}
            </span>
          </div>
          <p class="text-[10.5px] leading-relaxed opacity-60 font-sans" :class="isDark ? 'text-neutral-400' : 'text-neutral-600'">
            {{ ind.desc }}
          </p>
        </div>

        <!-- Signal Badge -->
        <span class="px-2 py-0.5 text-[9px] font-mono font-bold uppercase tracking-widest border shrink-0"
          :class="signalBadgeClass(ind.signal)"
        >{{ ind.signal }}</span>
      </div>
    </div>

    <!-- Empty state -->
    <div v-else class="text-center py-8">
      <span class="material-symbols-outlined text-2xl opacity-20 mb-1 block">analytics</span>
      <p class="text-xs font-mono opacity-50 uppercase">NO TECHNICAL DATA AVAILABLE</p>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * Komponen Sinyal Teknikal Swiss Style — RSI, MACD, SMA, EMA, Stochastic
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

    if ('signal' in val || 'value' in val) {
      let displayValue = ''
      let desc = ''
      const sig = normalizeSignal(val.signal ?? val.trend ?? val.action ?? 'NEUTRAL')

      const lowerKey = key.toLowerCase()
      if (lowerKey === 'rsi') {
        const r = Number(val.value)
        displayValue = formatNum(r)
        if (r > 70) desc = "Overbought (Jenuh Beli). Waspada koreksi teknikal."
        else if (r < 30) desc = "Oversold (Jenuh Jual). Potensi rebound teknikal."
        else desc = "Momentum harga di area seimbang."
      }
      else if (lowerKey === 'macd') {
        displayValue = formatNum(val.macdLine)
        if (sig === 'BUY') desc = "MACD line memotong ke atas signal line (Golden Cross)."
        else if (sig === 'SELL') desc = "MACD line menukik ke bawah (Death Cross)."
        else desc = "MACD konsolidasi mendatar."
      }
      else if (lowerKey === 'stochastic') {
        const k = Number(val.k); const d = Number(val.d)
        displayValue = `K:${formatNum(k)} D:${formatNum(d)}`
        if (k > 80 && d > 80) desc = "Zona overbought tinggi. Waspada reversal cepat."
        else if (k < 20 && d < 20) desc = "Zona oversold ekstrem. Area akumulasi pantul."
        else desc = "Osilator berada pada rentang wajar."
      }
      else if (lowerKey === 'atr') {
        displayValue = formatNum(val.value)
        const v = String(val.volatility || '').toUpperCase()
        if (v.includes('HIGH')) desc = "Volatilitas tinggi, range pergerakan lebar."
        else if (v.includes('LOW')) desc = "Volatilitas rendah, pergerakan stabil."
        else desc = "Rentang fluktuasi normal."
      }
      else if (lowerKey === 'obv') {
        displayValue = formatVolNum(val.value)
        if (sig === 'BUY') desc = "On-Balance Volume mencatat akumulasi inflow."
        else if (sig === 'SELL') desc = "Tekanan jual volume outflow mendominasi."
        else desc = "Arus akumulasi volume seimbang."
      }
      else if (lowerKey === 'vwap') {
        displayValue = `Rp ${formatNum(val.value)}`
        desc = `Volume Weighted Average Price (${sig}).`
      }
      else {
        displayValue = formatNum(val.value ?? val.current ?? 0)
        desc = `Signal bacaan osilator: ${sig}.`
      }

      result.push({
        name: key.toUpperCase(),
        value: displayValue,
        desc,
        signal: sig,
      })
    }
    else {
      const isSMA = key.toLowerCase() === 'sma'
      const isEMA = key.toLowerCase() === 'ema'
      
      if (isSMA || isEMA) {
        const short = val[`${key}5`] || val[`${key}10`]
        const mid = val[`${key}20`] || val[`${key}50`]
        
        const entries = Object.entries(val).filter(([_, v]) => v !== null).slice(0, 2)
        const displayValue = entries.map(([k, v]) => `${k.toUpperCase()}=${formatNum(v)}`).join(', ')
        
        let desc = 'Moving average crossover trend.'
        let sig = 'NEUTRAL'
        
        if (short && mid) {
          if (short > mid) {
            desc = "Moving average pendek di atas garis menengah (Uptrend)."
            sig = 'BUY'
          } else {
            desc = "Moving average pendek di bawah garis menengah (Downtrend)."
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

function signalBadgeClass(signal: string): string {
  if (signal === 'BUY') return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
  if (signal === 'SELL') return 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/30'
  return isDark.value ? 'bg-neutral-800 text-neutral-400 border-neutral-700' : 'bg-neutral-100 text-neutral-600 border-neutral-300'
}
</script>

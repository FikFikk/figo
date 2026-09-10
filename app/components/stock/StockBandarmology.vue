<template>
  <div class="border transition-all duration-200"
    :class="isDark ? 'bg-[#15171e] border-neutral-800' : 'bg-white border-neutral-300 shadow-sm'"
  >
    <!-- Header -->
    <div class="p-4 md:p-5 border-b flex items-center justify-between"
      :class="isDark ? 'border-neutral-800' : 'border-neutral-200'"
    >
      <div class="flex items-center gap-2">
        <span class="material-symbols-outlined text-base opacity-70">psychology</span>
        <h3 class="font-mono font-bold text-xs uppercase tracking-widest" :class="isDark ? 'text-white' : 'text-neutral-900'">
          BANDARMOLOGY & SMART MONEY
        </h3>
      </div>
      <span class="px-2 py-0.5 text-[9px] font-mono font-bold uppercase tracking-widest border"
        :class="isDark ? 'bg-neutral-800 border-neutral-700 text-neutral-300' : 'bg-neutral-100 border-neutral-300 text-neutral-700'"
      >INSTITUTIONAL FLOW</span>
    </div>

    <!-- Unlocked State -->
    <div v-if="!data && !loading" class="flex flex-col items-center justify-center p-8 text-center min-h-[220px]">
      <div class="w-10 h-10 border flex items-center justify-center mb-3"
        :class="isDark ? 'bg-neutral-900 border-neutral-700 text-neutral-400' : 'bg-neutral-100 border-neutral-300 text-neutral-600'"
      >
        <span class="material-symbols-outlined text-lg">data_exploration</span>
      </div>
      <h4 class="font-mono font-bold text-xs uppercase tracking-wider mb-1" :class="isDark ? 'text-white' : 'text-neutral-900'">
        SMART MONEY FLOW ANALYSIS
      </h4>
      <p class="text-[11px] opacity-60 mb-4 max-w-[260px]">Analyze institutional accumulation, distribution, and net broker summary.</p>
      <button @click="$emit('fetch')" 
        class="px-5 py-2 text-xs font-mono font-bold uppercase tracking-wider border transition-all"
        :class="isDark 
          ? 'bg-white text-black border-white hover:bg-neutral-200' 
          : 'bg-neutral-900 text-white border-neutral-900 hover:bg-neutral-800'"
      >
        LOAD BANDARMOLOGY
      </button>
    </div>

    <!-- Loading -->
    <div v-else-if="loading" class="p-4 grid grid-cols-1 md:grid-cols-2 gap-3">
      <div v-for="i in 2" :key="i" class="h-28 border animate-pulse"
        :class="isDark ? 'bg-neutral-900/40 border-neutral-800' : 'bg-neutral-100 border-neutral-200'"></div>
    </div>

    <!-- Content: 2-Column Swiss Grid -->
    <div v-else-if="hasData" class="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x"
      :class="isDark ? 'divide-neutral-800' : 'divide-neutral-200'"
    >
      <!-- Akumulasi Card -->
      <div class="p-4 md:p-5 flex flex-col justify-between">
        <div>
          <div class="flex items-center justify-between mb-3 font-mono text-[10px]">
            <span class="uppercase tracking-[0.2em] opacity-50">ACCUMULATION / DISTRIBUTION</span>
            <span class="font-bold tabular-nums"
              :class="accumulationStatus === 'ACCUMULATING' ? 'text-emerald-500' : accumulationStatus === 'DISTRIBUTING' ? 'text-red-500' : 'opacity-60'"
            >
              {{ accumulationScore }}%
            </span>
          </div>

          <!-- Gauge Line -->
          <div class="h-1.5 w-full bg-neutral-200 dark:bg-neutral-800 mb-2 overflow-hidden">
            <div class="h-full transition-all duration-500"
              :style="{ width: accumulationScore + '%' }"
              :class="accumulationScore > 60 ? 'bg-emerald-500' : accumulationScore > 40 ? 'bg-amber-500' : 'bg-red-500'"
            ></div>
          </div>

          <div class="flex items-center justify-between text-[9px] font-mono opacity-50 mb-4">
            <span>0% DIST</span>
            <span>50% NEUTRAL</span>
            <span>100% ACC</span>
          </div>
        </div>

        <!-- Status Tag -->
        <div class="p-2.5 border text-center font-mono text-xs font-bold"
          :class="accumulationStatus === 'ACCUMULATING'
            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
            : accumulationStatus === 'DISTRIBUTING'
            ? 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/30'
            : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 border-neutral-300 dark:border-neutral-700'"
        >
          {{ accumulationLabel }}
        </div>
      </div>

      <!-- Smart Money Flow Card -->
      <div class="p-4 md:p-5 flex flex-col justify-between">
        <div>
          <div class="flex items-center justify-between mb-3 font-mono text-[10px]">
            <span class="uppercase tracking-[0.2em] opacity-50">SMART MONEY FLOW</span>
            <span class="font-bold uppercase"
              :class="smartMoneyDirection === 'INFLOW' ? 'text-emerald-500' : smartMoneyDirection === 'OUTFLOW' ? 'text-red-500' : 'opacity-60'"
            >
              {{ smartMoneyDirection }}
            </span>
          </div>

          <!-- Inflow/Outflow Bars -->
          <div class="space-y-2 mb-4">
            <div class="flex items-center gap-2 font-mono text-[10px]">
              <span class="w-12 text-emerald-500 font-bold uppercase">INFLOW</span>
              <div class="flex-1 h-1.5 bg-neutral-200 dark:bg-neutral-800 overflow-hidden">
                <div class="h-full bg-emerald-500 transition-all duration-500" :style="{ width: inflowPct + '%' }"></div>
              </div>
              <span class="w-8 text-right tabular-nums opacity-70">{{ inflowPct }}%</span>
            </div>

            <div class="flex items-center gap-2 font-mono text-[10px]">
              <span class="w-12 text-red-500 font-bold uppercase">OUTFLOW</span>
              <div class="flex-1 h-1.5 bg-neutral-200 dark:bg-neutral-800 overflow-hidden">
                <div class="h-full bg-red-500 transition-all duration-500" :style="{ width: outflowPct + '%' }"></div>
              </div>
              <span class="w-8 text-right tabular-nums opacity-70">{{ outflowPct }}%</span>
            </div>
          </div>
        </div>

        <!-- Direction Label -->
        <div class="p-2.5 border text-center font-mono text-xs font-bold"
          :class="smartMoneyDirection === 'INFLOW'
            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
            : smartMoneyDirection === 'OUTFLOW'
            ? 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/30'
            : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 border-neutral-300 dark:border-neutral-700'"
        >
          {{ smartMoneyLabel }}
        </div>
      </div>
    </div>

    <!-- Empty state -->
    <div v-else class="text-center py-8">
      <span class="material-symbols-outlined text-2xl opacity-20 mb-1 block">psychology</span>
      <p class="text-xs font-mono opacity-50 uppercase">NO INSTITUTIONAL FLOW DATA AVAILABLE</p>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * Komponen Bandarmology Swiss Style — Deteksi Akumulasi/Distribusi & Smart Money Flow
 */
const props = defineProps<{
  data: any
  loading: boolean
}>()

const { isDark } = useColorMode()

const hasData = computed(() => {
  return props.data && (props.data.accumulation || props.data.smartMoney)
})

const accumulationScore = computed(() => {
  if (!props.data?.accumulation) return 50
  const acc = props.data.accumulation
  return acc.score ?? acc.accumulationScore ?? acc.percentage ?? 50
})

const accumulationStatus = computed(() => {
  if (!props.data?.accumulation) return 'NEUTRAL'
  const acc = props.data.accumulation
  const status = (acc.status || acc.signal || acc.action || '').toUpperCase()
  if (status.includes('ACCUMUL')) return 'ACCUMULATING'
  if (status.includes('DISTRIBU')) return 'DISTRIBUTING'
  if (accumulationScore.value > 60) return 'ACCUMULATING'
  if (accumulationScore.value < 40) return 'DISTRIBUTING'
  return 'NEUTRAL'
})

const accumulationLabel = computed(() => {
  if (accumulationStatus.value === 'ACCUMULATING') return 'ACCUMULATION DETECTED (BIG MONEY INFLOW)'
  if (accumulationStatus.value === 'DISTRIBUTING') return 'DISTRIBUTION DETECTED (INSTITUTIONAL SELLING)'
  return 'NEUTRAL MARKET FLOW (NO HEAVY ACCUMULATION)'
})

const inflowPct = computed(() => {
  if (!props.data?.smartMoney) return 50
  const sm = props.data.smartMoney
  return sm.inflowPct ?? sm.inflow_pct ?? sm.buyPct ?? 50
})

const outflowPct = computed(() => {
  return Math.max(0, 100 - inflowPct.value)
})

const smartMoneyDirection = computed(() => {
  if (!props.data?.smartMoney) return 'NEUTRAL'
  const sm = props.data.smartMoney
  const dir = (sm.direction || sm.signal || sm.flow || '').toUpperCase()
  if (dir.includes('IN') || dir.includes('BUY')) return 'INFLOW'
  if (dir.includes('OUT') || dir.includes('SELL')) return 'OUTFLOW'
  if (inflowPct.value > 55) return 'INFLOW'
  if (inflowPct.value < 45) return 'OUTFLOW'
  return 'NEUTRAL'
})

const smartMoneyLabel = computed(() => {
  if (smartMoneyDirection.value === 'INFLOW') return 'NET POSITIVE BUY VOLUME'
  if (smartMoneyDirection.value === 'OUTFLOW') return 'NET NEGATIVE SELL VOLUME'
  return 'BALANCED ORDER BOOK FLOW'
})
</script>

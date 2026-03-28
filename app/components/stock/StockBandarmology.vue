<template>
  <div class="glass-panel rounded-2xl p-5 md:p-6 border"
    :class="isDark ? 'border-white/5' : 'border-slate-100'"
  >
    <!-- Header -->
    <div class="flex items-center gap-2 mb-5">
      <span class="material-symbols-outlined text-lg text-primary">psychology</span>
      <h3 class="font-headline font-bold text-sm" :class="isDark ? 'text-white' : 'text-slate-900'">
        Bandarmology
      </h3>
      <span class="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full"
        :class="isDark ? 'bg-primary/10 text-primary border border-primary/20' : 'bg-blue-50 text-primary'"
      >Smart Money</span>
    </div>

    <!-- Unlocked State -->
    <div v-if="!data && !loading" class="flex flex-col items-center justify-center py-10 text-center min-h-[220px]">
      <div class="w-12 h-12 rounded-2xl flex items-center justify-center mb-3" :class="isDark ? 'bg-white/5' : 'bg-slate-50'">
        <span class="material-symbols-outlined text-xl opacity-50">data_exploration</span>
      </div>
      <h4 class="font-bold text-sm mb-1" :class="isDark ? 'text-white' : 'text-slate-900'">Bandarmologi</h4>
      <p class="text-[10px] opacity-60 mb-4 max-w-[280px]">Lihat pergerakan bandar (Smart Money Flow & Akumulasi/Distribusi). Memerlukan request API.</p>
      <button @click="$emit('fetch')" class="px-5 py-2 rounded-2xl text-xs font-bold transition-all" :class="isDark ? 'bg-primary/20 text-primary hover:bg-primary/30' : 'bg-primary text-white hover:bg-primary/90 shadow-sm'">
        Tampilkan Analisa Bandar
      </button>
    </div>

    <!-- Loading -->
    <div v-else-if="loading" class="grid grid-cols-1 md:grid-cols-2 gap-3">
      <div v-for="i in 2" :key="i" class="h-32 rounded-xl animate-pulse"
        :class="isDark ? 'bg-white/5' : 'bg-slate-100'"></div>
    </div>

    <div v-else-if="hasData" class="grid grid-cols-1 md:grid-cols-2 gap-3">
      <!-- Akumulasi Card -->
      <div class="rounded-2xl p-4 border"
        :class="isDark ? 'bg-white/[0.02] border-white/5' : 'bg-slate-50/60 border-slate-100'"
      >
        <div class="flex items-center justify-between mb-3">
          <span class="text-[10px] font-bold uppercase tracking-widest opacity-40">Akumulasi</span>
          <span class="material-symbols-outlined text-sm"
            :class="accumulationStatus === 'ACCUMULATING' ? 'text-emerald-500' :
                     accumulationStatus === 'DISTRIBUTING' ? 'text-red-500' : 'text-gray-400'"
          >{{ accumulationStatus === 'ACCUMULATING' ? 'add_circle' :
               accumulationStatus === 'DISTRIBUTING' ? 'remove_circle' : 'radio_button_unchecked' }}</span>
        </div>

        <!-- Visual Gauge -->
        <div class="mb-3">
          <div class="w-full h-2 rounded-2xl overflow-hidden"
            :class="isDark ? 'bg-white/10' : 'bg-slate-200'"
          >
            <div class="h-full rounded-2xl transition-all duration-700 ease-out"
              :style="{ width: accumulationScore + '%' }"
              :class="accumulationScore > 60 ? 'bg-emerald-500' :
                       accumulationScore > 40 ? 'bg-yellow-500' : 'bg-red-500'"
            ></div>
          </div>
          <div class="flex items-center justify-between mt-1.5">
            <span class="text-[9px] font-bold text-red-500/60">Distribusi</span>
            <span class="text-xs font-black font-mono"
              :class="accumulationScore > 60 ? 'text-emerald-500' :
                       accumulationScore > 40 ? 'text-yellow-500' : 'text-red-500'"
            >{{ accumulationScore }}%</span>
            <span class="text-[9px] font-bold text-emerald-500/60">Akumulasi</span>
          </div>
        </div>

        <!-- Status Label -->
        <div class="px-3 py-2 rounded-md text-center"
          :class="accumulationStatus === 'ACCUMULATING'
            ? (isDark ? 'bg-emerald-500/10 text-emerald-400' : 'bg-emerald-50 text-emerald-700')
            : accumulationStatus === 'DISTRIBUTING'
              ? (isDark ? 'bg-red-500/10 text-red-400' : 'bg-red-50 text-red-700')
              : (isDark ? 'bg-white/5 text-gray-400' : 'bg-slate-100 text-slate-500')"
        >
          <p class="text-[11px] font-bold">{{ accumulationLabel }}</p>
        </div>
      </div>

      <!-- Smart Money Flow Card -->
      <div class="rounded-2xl p-4 border"
        :class="isDark ? 'bg-white/[0.02] border-white/5' : 'bg-slate-50/60 border-slate-100'"
      >
        <div class="flex items-center justify-between mb-3">
          <span class="text-[10px] font-bold uppercase tracking-widest opacity-40">Smart Money Flow</span>
          <span class="material-symbols-outlined text-sm"
            :class="smartMoneyDirection === 'INFLOW' ? 'text-emerald-500' :
                     smartMoneyDirection === 'OUTFLOW' ? 'text-red-500' : 'text-gray-400'"
          >{{ smartMoneyDirection === 'INFLOW' ? 'south_west' :
               smartMoneyDirection === 'OUTFLOW' ? 'north_east' : 'swap_vert' }}</span>
        </div>

        <!-- Flow Visual -->
        <div class="flex items-center gap-3 mb-3">
          <div class="flex-1 space-y-1.5">
            <!-- Inflow bar -->
            <div class="flex items-center gap-2">
              <span class="text-[9px] font-bold w-12 text-emerald-500">Inflow</span>
              <div class="flex-1 h-2 rounded-2xl overflow-hidden"
                :class="isDark ? 'bg-white/10' : 'bg-slate-200'"
              >
                <div class="h-full bg-emerald-500 rounded-2xl transition-all duration-700"
                  :style="{ width: inflowPct + '%' }"
                ></div>
              </div>
              <span class="text-[10px] font-mono font-bold w-10 text-right opacity-60">
                {{ inflowPct }}%
              </span>
            </div>
            <!-- Outflow bar -->
            <div class="flex items-center gap-2">
              <span class="text-[9px] font-bold w-12 text-red-500">Outflow</span>
              <div class="flex-1 h-2 rounded-2xl overflow-hidden"
                :class="isDark ? 'bg-white/10' : 'bg-slate-200'"
              >
                <div class="h-full bg-red-500 rounded-2xl transition-all duration-700"
                  :style="{ width: outflowPct + '%' }"
                ></div>
              </div>
              <span class="text-[10px] font-mono font-bold w-10 text-right opacity-60">
                {{ outflowPct }}%
              </span>
            </div>
          </div>
        </div>

        <!-- Direction Label -->
        <div class="px-3 py-2 rounded-md text-center"
          :class="smartMoneyDirection === 'INFLOW'
            ? (isDark ? 'bg-emerald-500/10 text-emerald-400' : 'bg-emerald-50 text-emerald-700')
            : smartMoneyDirection === 'OUTFLOW'
              ? (isDark ? 'bg-red-500/10 text-red-400' : 'bg-red-50 text-red-700')
              : (isDark ? 'bg-white/5 text-gray-400' : 'bg-slate-100 text-slate-500')"
        >
          <p class="text-[11px] font-bold">{{ smartMoneyLabel }}</p>
        </div>
      </div>
    </div>

    <!-- Empty state -->
    <div v-else class="text-center py-8">
      <span class="material-symbols-outlined text-3xl opacity-15 mb-2 block">psychology</span>
      <p class="text-xs opacity-40">Data bandarmology tidak tersedia untuk saham ini</p>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * Komponen bandarmology — deteksi akumulasi/distribusi & smart money flow
 * Visual gauge & flow bars untuk analisa pergerakan bandar
 */
const props = defineProps<{
  data: any
  loading: boolean
}>()

const { isDark } = useColorMode()

const hasData = computed(() => {
  return props.data && (props.data.accumulation || props.data.smartMoney)
})

// === Akumulasi ===
const accumulationScore = computed(() => {
  if (!props.data?.accumulation) return 50
  const acc = props.data.accumulation
  // Coba ambil score dari berbagai kemungkinan field
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
  if (accumulationStatus.value === 'ACCUMULATING') return '🟢 Bandar sedang mengakumulasi'
  if (accumulationStatus.value === 'DISTRIBUTING') return '🔴 Bandar sedang distribusi'
  return '⚪ Tidak ada aktivitas signifikan'
})

// === Smart Money Flow ===
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
  if (smartMoneyDirection.value === 'INFLOW') return '🟢 Smart money masuk — bullish signal'
  if (smartMoneyDirection.value === 'OUTFLOW') return '🔴 Smart money keluar — bearish signal'
  return '⚪ Aliran netral'
})
</script>

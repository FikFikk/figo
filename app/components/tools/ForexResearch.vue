<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between gap-3 flex-wrap">
      <div>
        <div
          class="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase mb-3"
          :class="isDark ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'"
        >
          Forex Research
        </div>
        <h2 class="text-2xl font-headline font-black tracking-tight" :class="isDark ? 'text-white' : 'text-slate-900'">
          Signal Dashboard
        </h2>
        <p class="text-sm mt-1" :class="isDark ? 'text-gray-400' : 'text-slate-500'">
          Research mode: score, direction, dan reasoning signal forex dari collector lokal.
        </p>
      </div>

      <button
        class="px-4 py-2 rounded-2xl text-xs font-bold transition-all border"
        :class="isDark ? 'bg-white/5 border-white/10 text-white hover:bg-white/10' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'"
        @click="loadSignals"
      >
        Refresh
      </button>
    </div>

    <div
      v-if="loading"
      class="rounded-3xl p-8 border"
      :class="isDark ? 'border-white/5 text-gray-400 bg-white/[0.02]' : 'border-slate-100 text-slate-500 bg-white'"
    >
      Loading signals...
    </div>

    <div
      v-else-if="error"
      class="rounded-3xl p-5 border"
      :class="isDark ? 'bg-red-500/10 border-red-500/20 text-red-300' : 'bg-red-50 border-red-200 text-red-700'"
    >
      {{ error }}
    </div>

    <div
      v-else-if="!signals.length"
      class="rounded-3xl p-8 border"
      :class="isDark ? 'border-white/5 text-gray-400 bg-white/[0.02]' : 'border-slate-100 text-slate-500 bg-white'"
    >
      Belum ada signal. Jalankan collector + run_signals + export_api dulu.
    </div>

    <div v-else class="grid grid-cols-1 xl:grid-cols-2 gap-4">
      <div
        v-for="signal in signals"
        :key="`${signal.symbol}-${signal.timeframe}-${signal.ts_utc}-${signal.direction}`"
        class="rounded-3xl p-5 border transition-all"
        :class="cardClass(signal)"
      >
        <div class="flex items-start justify-between gap-4">
          <div>
            <div class="flex items-center gap-2 flex-wrap">
              <h3 class="text-lg font-headline font-black" :class="isDark ? 'text-white' : 'text-slate-900'">
                {{ signal.symbol }}
              </h3>
              <span
                class="px-2.5 py-1 rounded-full text-[10px] font-black tracking-widest uppercase"
                :class="pillClass(signal.status)"
              >
                {{ signal.timeframe }} · {{ signal.status }}
              </span>
            </div>
            <p class="text-xs mt-1" :class="isDark ? 'text-gray-500' : 'text-slate-400'">
              {{ signal.ts_utc }}
            </p>
          </div>

          <div class="text-right">
            <div
              class="text-[10px] font-black uppercase tracking-[0.25em] mb-1"
              :class="signal.direction === 'BUY' ? 'text-emerald-500' : signal.direction === 'SELL' ? 'text-rose-500' : 'text-gray-400'"
            >
              {{ signal.direction }}
            </div>
            <div class="text-3xl font-black leading-none" :class="isDark ? 'text-white' : 'text-slate-900'">
              {{ formatScore(signal.final_score) }}
            </div>
            <div class="text-[10px] uppercase tracking-[0.2em] mt-1" :class="isDark ? 'text-gray-500' : 'text-slate-400'">
              score
            </div>
          </div>
        </div>

        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5">
          <div class="rounded-2xl px-3 py-2" :class="isDark ? 'bg-white/5' : 'bg-slate-50'">
            <div class="text-[10px] uppercase tracking-[0.2em] opacity-50">Trend</div>
            <div class="text-sm font-bold mt-1">{{ formatScore(signal.trend_score) }}</div>
          </div>
          <div class="rounded-2xl px-3 py-2" :class="isDark ? 'bg-white/5' : 'bg-slate-50'">
            <div class="text-[10px] uppercase tracking-[0.2em] opacity-50">Momentum</div>
            <div class="text-sm font-bold mt-1">{{ formatScore(signal.momentum_score) }}</div>
          </div>
          <div class="rounded-2xl px-3 py-2" :class="isDark ? 'bg-white/5' : 'bg-slate-50'">
            <div class="text-[10px] uppercase tracking-[0.2em] opacity-50">Pattern</div>
            <div class="text-sm font-bold mt-1">{{ formatScore(signal.pattern_score) }}</div>
          </div>
          <div class="rounded-2xl px-3 py-2" :class="isDark ? 'bg-white/5' : 'bg-slate-50'">
            <div class="text-[10px] uppercase tracking-[0.2em] opacity-50">News Penalty</div>
            <div class="text-sm font-bold mt-1">-{{ formatScore(signal.news_penalty) }}</div>
          </div>
        </div>

        <details class="mt-5 rounded-2xl overflow-hidden" :class="isDark ? 'bg-black/20' : 'bg-slate-50'">
          <summary
            class="cursor-pointer list-none px-4 py-3 text-xs font-bold uppercase tracking-[0.2em]"
            :class="isDark ? 'text-gray-300' : 'text-slate-600'"
          >
            Reason JSON
          </summary>
          <pre
            class="px-4 pb-4 text-xs overflow-x-auto whitespace-pre-wrap break-words"
            :class="isDark ? 'text-gray-400' : 'text-slate-600'"
          >{{ prettyReason(signal.reason_json) }}</pre>
        </details>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { isDark } = useColorMode()
const loading = ref(true)
const error = ref('')
const signals = ref<any[]>([])

function formatScore(value: any) {
  const num = Number(value || 0)
  return Number.isFinite(num) ? Math.round(num) : 0
}

function prettyReason(raw: any) {
  try {
    const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw
    return JSON.stringify(parsed, null, 2)
  } catch {
    return String(raw || '{}')
  }
}

function pillClass(status: string) {
  if (status === 'STRONG') return isDark.value ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
  if (status === 'VALID') return isDark.value ? 'bg-blue-500/15 text-blue-400 border border-blue-500/20' : 'bg-blue-50 text-blue-700 border border-blue-200'
  if (status === 'WATCHLIST') return isDark.value ? 'bg-amber-500/15 text-amber-400 border border-amber-500/20' : 'bg-amber-50 text-amber-700 border border-amber-200'
  return isDark.value ? 'bg-white/10 text-gray-300 border border-white/10' : 'bg-slate-100 text-slate-700 border border-slate-200'
}

function cardClass(signal: any) {
  if (signal.direction === 'BUY' && signal.status !== 'REJECTED') {
    return isDark.value ? 'border-emerald-500/20 bg-emerald-500/5' : 'border-emerald-200 bg-emerald-50/70'
  }
  if (signal.direction === 'SELL' && signal.status !== 'REJECTED') {
    return isDark.value ? 'border-rose-500/20 bg-rose-500/5' : 'border-rose-200 bg-rose-50/70'
  }
  return isDark.value ? 'border-white/5 bg-white/[0.02]' : 'border-slate-200 bg-white'
}

async function loadSignals() {
  loading.value = true
  error.value = ''
  try {
    signals.value = await $fetch('/api/forex/signals')
  } catch (err: any) {
    error.value = err?.data?.statusMessage || err?.message || 'Gagal memuat forex signals'
    signals.value = []
  } finally {
    loading.value = false
  }
}

onMounted(loadSignals)
</script>

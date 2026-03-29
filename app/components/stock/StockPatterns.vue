<template>
  <div class="space-y-6">
    <!-- Konsep Dasar (SELALU TERBUKA, di atas) -->
    <div v-for="cc in conceptCats" :key="cc.title"
      class="glass-panel rounded-2xl border overflow-hidden"
      :class="isDark ? 'border-white/5' : 'border-slate-100'"
    >
      <div class="p-5">
        <p class="text-[9px] font-black uppercase tracking-[0.2em] mb-1"
          :class="isDark ? 'text-gray-600' : 'text-slate-400'">{{ cc.subtitle }}</p>
        <h3 class="font-headline font-bold text-sm" :class="isDark ? 'text-white' : 'text-slate-900'">{{ cc.title }}</h3>
      </div>
      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 px-5 pb-5">
        <div v-for="c in cc.concepts" :key="c.name" @click="activeConcept = c"
          class="rounded-2xl border p-4 flex flex-col items-center transition-all hover:scale-[1.02] cursor-pointer"
          :class="isDark ? 'bg-white/[0.03] border-white/10 hover:border-white/20' : 'bg-slate-50 border-slate-200 hover:border-slate-300'"
        >
          <span class="material-symbols-outlined text-2xl mb-2 text-primary">{{ c.icon }}</span>
          <p class="text-xs font-bold font-headline text-center mb-1" :class="isDark ? 'text-white' : 'text-slate-900'">{{ c.name }}</p>
          <p class="text-[9px] leading-relaxed text-center" :class="isDark ? 'text-gray-500' : 'text-slate-500'">{{ c.desc }}</p>
        </div>
      </div>
    </div>

    <!-- Kategori Pola (collapsible) -->
    <div v-for="cat in categories" :key="cat.title"
      class="glass-panel rounded-2xl border overflow-hidden"
      :class="isDark ? 'border-white/5' : 'border-slate-100'"
    >
      <button @click="cat.open = !cat.open"
        class="w-full flex items-center justify-between p-5 text-left transition-colors"
        :class="isDark ? 'hover:bg-white/5' : 'hover:bg-slate-50'"
      >
        <div>
          <p class="text-[9px] font-black uppercase tracking-[0.2em] mb-1"
            :class="isDark ? 'text-gray-600' : 'text-slate-400'">{{ cat.subtitle }}</p>
          <h3 class="font-headline font-bold text-sm" :class="isDark ? 'text-white' : 'text-slate-900'">{{ cat.title }}</h3>
        </div>
        <span class="material-symbols-outlined text-lg transition-transform duration-300"
          :class="cat.open ? 'rotate-180' : ''" style="opacity:0.4">expand_more</span>
      </button>
      <div v-show="cat.open" class="overflow-hidden">
        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 px-5 pb-5">
          <div v-for="p in cat.patterns" :key="p.name" @click="activePattern = p"
            class="rounded-2xl border p-3.5 flex flex-col transition-all hover:scale-[1.02] cursor-pointer"
            :class="isDark ? 'bg-white/[0.03] border-white/10 hover:border-white/20' : 'bg-slate-50 border-slate-200 hover:border-slate-300'"
          >
            <!-- Harmonic SVG (garis XABCD + Fibonacci) -->
            <div v-if="p.harmonic" class="h-20 flex items-center justify-center mb-2">
              <svg width="100%" height="76" viewBox="0 0 200 120" class="max-w-full">
                <!-- Garis penghubung titik -->
                <template v-for="(pt, pi) in p.harmonic.points" :key="'l'+pi">
                  <line v-if="pi < p.harmonic.points.length - 1"
                    :x1="pt.x" :y1="pt.y"
                    :x2="p.harmonic.points[pi+1].x" :y2="p.harmonic.points[pi+1].y"
                    :stroke="p.harmonic.points[pi+1].y < pt.y ? '#10b981' : '#ef4444'"
                    stroke-width="2" stroke-linecap="round" />
                </template>
                <!-- Garis putus-putus horizontal (level referensi) -->
                <line v-if="p.harmonic.points.length >= 4"
                  :x1="p.harmonic.points[0].x" :y1="p.harmonic.points[0].y"
                  :x2="p.harmonic.points[p.harmonic.points.length-1].x" :y2="p.harmonic.points[0].y"
                  stroke="#64748b" stroke-width="0.5" stroke-dasharray="3,3" opacity="0.4" />
                <!-- Titik (dots) -->
                <circle v-for="(pt, pi) in p.harmonic.points" :key="'c'+pi"
                  :cx="pt.x" :cy="pt.y" r="3"
                  :fill="isDark ? '#fff' : '#1e293b'" />
                <!-- Label titik -->
                <text v-for="(pt, pi) in p.harmonic.points" :key="'t'+pi"
                  :x="pt.x" :y="pt.y < 60 ? pt.y - 7 : pt.y + 14"
                  text-anchor="middle" :fill="isDark ? '#94a3b8' : '#475569'"
                  font-size="9" font-weight="bold">{{ pt.label }}</text>
                <!-- Label Fibonacci -->
                <text v-for="(f, fi) in p.harmonic.fibs" :key="'f'+fi"
                  :x="f.x" :y="f.y" :text-anchor="f.align || 'middle'"
                  fill="#a78bfa" font-size="7" font-weight="600" opacity="0.8">{{ f.text }}</text>
              </svg>
            </div>

            <!-- Visual Candlestick SVG (non-harmonic) -->
            <div v-else class="h-16 flex items-end justify-center gap-1 mb-2">
              <svg v-for="(c, ci) in p.candles" :key="ci" :width="c.w || 16" height="60" viewBox="0 0 16 60" class="flex-shrink-0">
                <line :x1="8" :y1="c.wickTop" :x2="8" :y2="c.bodyTop" :stroke="c.color" stroke-width="1.5" />
                <rect :x="2" :y="c.bodyTop" :width="12" :height="Math.max(2, c.bodyBot - c.bodyTop)" :rx="2" :fill="c.color" :stroke="c.color" stroke-width="1.5" />
                <line :x1="8" :y1="c.bodyBot" :x2="8" :y2="c.wickBot" :stroke="c.color" stroke-width="1.5" />
              </svg>
            </div>

            <p class="text-[9px] text-center mb-1 font-bold" :class="p.labelColor">{{ p.label }}</p>
            <p class="text-xs font-bold font-headline text-center mb-1" :class="isDark ? 'text-white' : 'text-slate-900'">{{ p.name }}</p>
            <p class="text-[9px] leading-relaxed text-center flex-1" :class="isDark ? 'text-gray-500' : 'text-slate-500'">{{ p.desc }}</p>
            <div class="mt-2 flex justify-center">
              <span class="text-[8px] font-black uppercase px-2 py-0.5 rounded-md tracking-wider" :class="signalClass(p.signal)">{{ p.signal }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Detail Pola -->
    <Teleport to="body">
      <Transition enter-active-class="transition duration-200 ease-out" enter-from-class="opacity-0" enter-to-class="opacity-100"
        leave-active-class="transition duration-150 ease-in" leave-from-class="opacity-100" leave-to-class="opacity-0">
        <div v-if="activePattern" class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" @click.self="activePattern = null">
          <div class="border rounded-3xl p-6 md:p-8 max-w-md w-full max-h-[85vh] overflow-y-auto"
            :class="isDark ? 'bg-[#1a1d28] border-white/10' : 'bg-white border-slate-200 shadow-2xl'">
            <!-- Visual besar: harmonic atau candle -->
            <div v-if="activePattern.harmonic" class="h-28 flex items-center justify-center mb-4">
              <svg width="100%" height="110" viewBox="0 0 200 120" class="max-w-full">
                <template v-for="(pt, pi) in activePattern.harmonic.points" :key="'ml'+pi">
                  <line v-if="pi < activePattern.harmonic.points.length - 1"
                    :x1="pt.x" :y1="pt.y" :x2="activePattern.harmonic.points[pi+1].x" :y2="activePattern.harmonic.points[pi+1].y"
                    :stroke="activePattern.harmonic.points[pi+1].y < pt.y ? '#10b981' : '#ef4444'" stroke-width="2.5" stroke-linecap="round" />
                </template>
                <line v-if="activePattern.harmonic.points.length >= 4"
                  :x1="activePattern.harmonic.points[0].x" :y1="activePattern.harmonic.points[0].y"
                  :x2="activePattern.harmonic.points[activePattern.harmonic.points.length-1].x" :y2="activePattern.harmonic.points[0].y"
                  stroke="#64748b" stroke-width="0.5" stroke-dasharray="3,3" opacity="0.4" />
                <circle v-for="(pt, pi) in activePattern.harmonic.points" :key="'mc'+pi"
                  :cx="pt.x" :cy="pt.y" r="4" :fill="isDark ? '#fff' : '#1e293b'" />
                <text v-for="(pt, pi) in activePattern.harmonic.points" :key="'mt'+pi"
                  :x="pt.x" :y="pt.y < 60 ? pt.y - 8 : pt.y + 15" text-anchor="middle"
                  :fill="isDark ? '#e2e8f0' : '#334155'" font-size="11" font-weight="bold">{{ pt.label }}</text>
                <text v-for="(f, fi) in activePattern.harmonic.fibs" :key="'mf'+fi"
                  :x="f.x" :y="f.y" :text-anchor="f.align || 'middle'"
                  fill="#a78bfa" font-size="9" font-weight="600">{{ f.text }}</text>
              </svg>
            </div>
            <div v-else class="h-20 flex items-end justify-center gap-1.5 mb-4">
              <svg v-for="(c, ci) in activePattern.candles" :key="ci" width="22" height="76" viewBox="0 0 16 60" class="flex-shrink-0">
                <line :x1="8" :y1="c.wickTop" :x2="8" :y2="c.bodyTop" :stroke="c.color" stroke-width="1.5" />
                <rect :x="2" :y="c.bodyTop" :width="12" :height="Math.max(2, c.bodyBot - c.bodyTop)" :rx="2" :fill="c.color" :stroke="c.color" stroke-width="1.5" />
                <line :x1="8" :y1="c.bodyBot" :x2="8" :y2="c.wickBot" :stroke="c.color" stroke-width="1.5" />
              </svg>
            </div>
            <p class="text-[10px] text-center font-bold mb-1" :class="activePattern.labelColor">{{ activePattern.label }}</p>
            <h3 class="text-lg font-headline font-black text-center mb-1" :class="isDark ? 'text-white' : 'text-slate-900'">{{ activePattern.name }}</h3>
            <div class="flex justify-center mb-4">
              <span class="text-[9px] font-black uppercase px-3 py-1 rounded-lg tracking-wider" :class="signalClass(activePattern.signal)">{{ activePattern.signal }}</span>
            </div>
            <p class="text-xs leading-relaxed mb-4 text-center" :class="isDark ? 'text-gray-400' : 'text-slate-600'">{{ activePattern.desc }}</p>
            <div class="border-t mb-4" :class="isDark ? 'border-white/10' : 'border-slate-200'"></div>
            <div class="space-y-3">
              <div v-for="(s, si) in activePattern.detail" :key="si">
                <p class="text-[10px] font-black uppercase tracking-wider mb-1 text-primary">{{ s.title }}</p>
                <p class="text-[11px] leading-relaxed" :class="isDark ? 'text-gray-400' : 'text-slate-600'">{{ s.body }}</p>
              </div>
            </div>
            <button @click="activePattern = null" class="mt-6 w-full py-2.5 rounded-xl text-xs font-bold transition-colors"
              :class="isDark ? 'bg-white/5 text-white hover:bg-white/10' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'">Tutup</button>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Modal Detail Konsep -->
    <Teleport to="body">
      <Transition enter-active-class="transition duration-200 ease-out" enter-from-class="opacity-0" enter-to-class="opacity-100"
        leave-active-class="transition duration-150 ease-in" leave-from-class="opacity-100" leave-to-class="opacity-0">
        <div v-if="activeConcept" class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" @click.self="activeConcept = null">
          <div class="border rounded-3xl p-6 md:p-8 max-w-md w-full max-h-[85vh] overflow-y-auto"
            :class="isDark ? 'bg-[#1a1d28] border-white/10' : 'bg-white border-slate-200 shadow-2xl'">
            <span class="material-symbols-outlined text-4xl text-primary block text-center mb-3">{{ activeConcept.icon }}</span>
            <h3 class="text-lg font-headline font-black text-center mb-1" :class="isDark ? 'text-white' : 'text-slate-900'">{{ activeConcept.name }}</h3>
            <p class="text-xs leading-relaxed mb-4 text-center" :class="isDark ? 'text-gray-400' : 'text-slate-600'">{{ activeConcept.desc }}</p>
            <div class="border-t mb-4" :class="isDark ? 'border-white/10' : 'border-slate-200'"></div>
            <div class="space-y-3">
              <div v-for="(s, si) in activeConcept.detail" :key="si">
                <p class="text-[10px] font-black uppercase tracking-wider mb-1 text-primary">{{ s.title }}</p>
                <p class="text-[11px] leading-relaxed" :class="isDark ? 'text-gray-400' : 'text-slate-600'">{{ s.body }}</p>
              </div>
            </div>
            <button @click="activeConcept = null" class="mt-6 w-full py-2.5 rounded-xl text-xs font-bold transition-colors"
              :class="isDark ? 'bg-white/5 text-white hover:bg-white/10' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'">Tutup</button>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
/**
 * Ensiklopedia komprehensif pola candlestick, chart pattern, harmonic pattern (SVG line XABCD),
 * dan konsep dasar analisa teknikal. Data di-import dari patternData.ts.
 */
import { patternCategories, conceptCategories, type PatternDef, type ConceptDef } from './patternData'

const { isDark } = useColorMode()
const categories = reactive(patternCategories)
const conceptCats = reactive(conceptCategories)
const activePattern = ref<PatternDef | null>(null)
const activeConcept = ref<ConceptDef | null>(null)

function signalClass(signal: string): string {
  if (['Bullish', 'Bullish Kuat', 'Bullish Sangat Kuat'].includes(signal))
    return isDark.value ? 'bg-emerald-500/15 text-emerald-400' : 'bg-emerald-50 text-emerald-600'
  if (['Bearish', 'Bearish Kuat'].includes(signal))
    return isDark.value ? 'bg-red-500/15 text-red-400' : 'bg-red-50 text-red-600'
  return isDark.value ? 'bg-white/10 text-gray-400' : 'bg-slate-100 text-slate-500'
}
</script>

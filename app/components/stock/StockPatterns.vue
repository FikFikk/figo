<template>
  <div class="space-y-6">
    <!-- Header statistik -->
    <div class="glass-panel rounded-2xl border p-5" :class="isDark?'border-white/5':'border-slate-100'">
      <div class="flex items-center gap-3 mb-3">
        <span class="material-symbols-outlined text-2xl text-primary">menu_book</span>
        <h2 class="font-headline font-bold text-base" :class="isDark?'text-white':'text-slate-900'">Ensiklopedia Saham</h2>
      </div>
      <div class="grid grid-cols-4 gap-2">
        <div v-for="s in stats" :key="s.label" class="rounded-xl p-2.5 text-center" :class="isDark?'bg-white/5':'bg-slate-50'">
          <p class="text-lg font-black font-headline" :class="s.color">{{ s.val }}</p>
          <p class="text-[8px] uppercase tracking-wider font-bold" :class="isDark?'text-gray-500':'text-slate-500'">{{ s.label }}</p>
        </div>
      </div>
    </div>

    <!-- Konsep Dasar (SELALU TERBUKA) -->
    <div v-for="cc in baseConcepts" :key="cc.title" class="glass-panel rounded-2xl border overflow-hidden" :class="isDark?'border-white/5':'border-slate-100'">
      <div class="p-5">
        <p class="text-[9px] font-black uppercase tracking-[0.2em] mb-1" :class="isDark?'text-gray-600':'text-slate-400'">{{ cc.subtitle }}</p>
        <h3 class="font-headline font-bold text-sm" :class="isDark?'text-white':'text-slate-900'">{{ cc.title }}</h3>
      </div>
      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 px-5 pb-5">
        <div v-for="c in cc.concepts" :key="c.name" @click="openConcept(c,cc.title)" class="rounded-2xl border p-4 flex flex-col items-center transition-all hover:scale-[1.02] cursor-pointer" :class="isDark?'bg-white/[0.03] border-white/10 hover:border-white/20':'bg-slate-50 border-slate-200 hover:border-slate-300'">
          <span class="material-symbols-outlined text-2xl mb-2 text-primary">{{ c.icon }}</span>
          <p class="text-xs font-bold font-headline text-center mb-1" :class="isDark?'text-white':'text-slate-900'">{{ c.name }}</p>
          <p class="text-[9px] leading-relaxed text-center" :class="isDark?'text-gray-500':'text-slate-500'">{{ c.desc }}</p>
        </div>
      </div>
    </div>

    <!-- Kategori Pola (collapsible) -->
    <div v-for="cat in allPatternCats" :key="cat.title" class="glass-panel rounded-2xl border overflow-hidden" :class="isDark?'border-white/5':'border-slate-100'">
      <button @click="cat.open=!cat.open" class="w-full flex items-center justify-between p-5 text-left transition-colors" :class="isDark?'hover:bg-white/5':'hover:bg-slate-50'">
        <div>
          <p class="text-[9px] font-black uppercase tracking-[0.2em] mb-1" :class="isDark?'text-gray-600':'text-slate-400'">{{ cat.subtitle }}</p>
          <h3 class="font-headline font-bold text-sm" :class="isDark?'text-white':'text-slate-900'">{{ cat.title }}</h3>
        </div>
        <div class="flex items-center gap-2">
          <span class="text-[9px] font-bold px-2 py-0.5 rounded-full" :class="isDark?'bg-white/10 text-gray-400':'bg-slate-100 text-slate-500'">{{ cat.patterns.length }}</span>
          <span class="material-symbols-outlined text-lg transition-transform duration-300" :class="cat.open?'rotate-180':''" style="opacity:0.4">expand_more</span>
        </div>
      </button>
      <div v-show="cat.open">
        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 px-5 pb-5">
          <div v-for="p in cat.patterns" :key="p.name" @click="activePattern=p" class="rounded-2xl border p-3.5 flex flex-col transition-all hover:scale-[1.02] cursor-pointer" :class="isDark?'bg-white/[0.03] border-white/10 hover:border-white/20':'bg-slate-50 border-slate-200 hover:border-slate-300'">
            <div v-if="p.harmonic" class="h-20 flex items-center justify-center mb-2">
              <svg width="100%" height="76" viewBox="0 0 200 120" class="max-w-full">
                <template v-for="(pt,pi) in p.harmonic.points" :key="'l'+pi"><line v-if="pi<p.harmonic.points.length-1" :x1="pt.x" :y1="pt.y" :x2="p.harmonic.points[pi+1].x" :y2="p.harmonic.points[pi+1].y" :stroke="p.harmonic.points[pi+1].y<pt.y?'#10b981':'#ef4444'" stroke-width="2" stroke-linecap="round"/></template>
                <circle v-for="(pt,pi) in p.harmonic.points" :key="'c'+pi" :cx="pt.x" :cy="pt.y" r="3" :fill="isDark?'#fff':'#1e293b'"/>
                <text v-for="(pt,pi) in p.harmonic.points" :key="'t'+pi" :x="pt.x" :y="pt.y<60?pt.y-7:pt.y+14" text-anchor="middle" :fill="isDark?'#94a3b8':'#475569'" font-size="9" font-weight="bold">{{pt.label}}</text>
                <text v-for="(f,fi) in p.harmonic.fibs" :key="'f'+fi" :x="f.x" :y="f.y" :text-anchor="f.align||'middle'" fill="#a78bfa" font-size="7" font-weight="600" opacity="0.8">{{f.text}}</text>
              </svg>
            </div>
            <div v-else class="h-16 flex items-end justify-center gap-1 mb-2">
              <svg v-for="(c,ci) in p.candles" :key="ci" :width="c.w||16" height="60" viewBox="0 0 16 60" class="flex-shrink-0">
                <line :x1="8" :y1="c.wickTop" :x2="8" :y2="c.bodyTop" :stroke="c.color" stroke-width="1.5"/>
                <rect :x="2" :y="c.bodyTop" :width="12" :height="Math.max(2,c.bodyBot-c.bodyTop)" :rx="2" :fill="c.color" :stroke="c.color" stroke-width="1.5"/>
                <line :x1="8" :y1="c.bodyBot" :x2="8" :y2="c.wickBot" :stroke="c.color" stroke-width="1.5"/>
              </svg>
            </div>
            <p class="text-[9px] text-center mb-1 font-bold" :class="p.labelColor">{{p.label}}</p>
            <p class="text-xs font-bold font-headline text-center mb-1" :class="isDark?'text-white':'text-slate-900'">{{p.name}}</p>
            <p class="text-[9px] leading-relaxed text-center flex-1" :class="isDark?'text-gray-500':'text-slate-500'">{{p.desc}}</p>
            <div class="mt-2 flex justify-center"><span class="text-[8px] font-black uppercase px-2 py-0.5 rounded-md tracking-wider" :class="signalClass(p.signal)">{{p.signal}}</span></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Kategori Konsep Lanjutan (collapsible) -->
    <div v-for="cc in advConcepts" :key="cc.title" class="glass-panel rounded-2xl border overflow-hidden" :class="isDark?'border-white/5':'border-slate-100'">
      <button @click="cc.open=!cc.open" class="w-full flex items-center justify-between p-5 text-left transition-colors" :class="isDark?'hover:bg-white/5':'hover:bg-slate-50'">
        <div>
          <p class="text-[9px] font-black uppercase tracking-[0.2em] mb-1" :class="isDark?'text-gray-600':'text-slate-400'">{{cc.subtitle}}</p>
          <h3 class="font-headline font-bold text-sm" :class="isDark?'text-white':'text-slate-900'">{{cc.title}}</h3>
        </div>
        <div class="flex items-center gap-2">
          <span class="text-[9px] font-bold px-2 py-0.5 rounded-full" :class="isDark?'bg-white/10 text-gray-400':'bg-slate-100 text-slate-500'">{{ cc.concepts.length }}</span>
          <span class="material-symbols-outlined text-lg transition-transform duration-300" :class="cc.open?'rotate-180':''" style="opacity:0.4">expand_more</span>
        </div>
      </button>
      <div v-show="cc.open">
        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 px-5 pb-5">
          <div v-for="c in cc.concepts" :key="c.name" @click="openConcept(c,cc.title)" class="rounded-2xl border p-4 flex flex-col items-center transition-all hover:scale-[1.02] cursor-pointer" :class="isDark?'bg-white/[0.03] border-white/10 hover:border-white/20':'bg-slate-50 border-slate-200 hover:border-slate-300'">
            <span class="material-symbols-outlined text-2xl mb-2 text-primary">{{c.icon}}</span>
            <p class="text-xs font-bold font-headline text-center mb-1" :class="isDark?'text-white':'text-slate-900'">{{c.name}}</p>
            <p class="text-[9px] leading-relaxed text-center" :class="isDark?'text-gray-500':'text-slate-500'">{{c.desc}}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- ═══ MODAL DETAIL POLA (dengan mini chart + panduan trading) ═══ -->
    <Teleport to="body">
      <Transition enter-active-class="transition duration-200 ease-out" enter-from-class="opacity-0" enter-to-class="opacity-100"
        leave-active-class="transition duration-150 ease-in" leave-from-class="opacity-100" leave-to-class="opacity-0">
        <div v-if="activePattern" class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" @click.self="activePattern=null">
          <div class="border rounded-3xl p-5 md:p-7 max-w-lg w-full max-h-[90vh] overflow-y-auto" :class="isDark?'bg-[#1a1d28] border-white/10':'bg-white border-slate-200 shadow-2xl'">

            <!-- Nama + badge -->
            <div class="text-center mb-3">
              <p class="text-[10px] font-bold mb-0.5" :class="activePattern.labelColor">{{activePattern.label}}</p>
              <h3 class="text-lg font-headline font-black" :class="isDark?'text-white':'text-slate-900'">{{activePattern.name}}</h3>
              <span class="inline-block mt-1 text-[9px] font-black uppercase px-3 py-1 rounded-lg tracking-wider" :class="signalClass(activePattern.signal)">{{activePattern.signal}}</span>
            </div>

            <!-- Visual kecil pola -->
            <div v-if="activePattern.harmonic" class="h-24 flex items-center justify-center mb-3">
              <svg width="100%" height="96" viewBox="0 0 200 120" class="max-w-full">
                <template v-for="(pt,pi) in activePattern.harmonic.points" :key="'ml'+pi"><line v-if="pi<activePattern.harmonic.points.length-1" :x1="pt.x" :y1="pt.y" :x2="activePattern.harmonic.points[pi+1].x" :y2="activePattern.harmonic.points[pi+1].y" :stroke="activePattern.harmonic.points[pi+1].y<pt.y?'#10b981':'#ef4444'" stroke-width="2.5" stroke-linecap="round"/></template>
                <circle v-for="(pt,pi) in activePattern.harmonic.points" :key="'mc'+pi" :cx="pt.x" :cy="pt.y" r="4" :fill="isDark?'#fff':'#1e293b'"/>
                <text v-for="(pt,pi) in activePattern.harmonic.points" :key="'mt'+pi" :x="pt.x" :y="pt.y<60?pt.y-8:pt.y+15" text-anchor="middle" :fill="isDark?'#e2e8f0':'#334155'" font-size="11" font-weight="bold">{{pt.label}}</text>
                <text v-for="(f,fi) in activePattern.harmonic.fibs" :key="'mf'+fi" :x="f.x" :y="f.y" :text-anchor="f.align||'middle'" fill="#a78bfa" font-size="9" font-weight="600">{{f.text}}</text>
              </svg>
            </div>
            <div v-else class="flex items-end justify-center gap-1.5 mb-3" style="height:60px">
              <svg v-for="(c,ci) in activePattern.candles" :key="ci" width="20" height="56" viewBox="0 0 16 60" class="flex-shrink-0">
                <line :x1="8" :y1="c.wickTop" :x2="8" :y2="c.bodyTop" :stroke="c.color" stroke-width="1.5"/>
                <rect :x="2" :y="c.bodyTop" :width="12" :height="Math.max(2,c.bodyBot-c.bodyTop)" :rx="2" :fill="c.color"/>
                <line :x1="8" :y1="c.bodyBot" :x2="8" :y2="c.wickBot" :stroke="c.color" stroke-width="1.5"/>
              </svg>
            </div>

            <!-- ★ Contoh Chart Real-Case (procedural) ★ -->
            <div v-if="activePattern.candles?.length && !activePattern.harmonic" class="rounded-2xl p-3 mb-4" :class="isDark?'bg-white/[0.03]':'bg-slate-50'">
              <p class="text-[9px] font-black uppercase tracking-wider mb-2" :class="isDark?'text-gray-500':'text-slate-400'">📊 Contoh di Chart Real</p>
              <svg width="100%" :viewBox="`0 0 ${chartData.w} 110`" class="w-full" style="height:130px">
                <!-- Grid horizontal -->
                <line v-for="gy in [25,50,75]" :key="gy" x1="0" :y1="gy" :x2="chartData.w" :y2="gy" :stroke="isDark?'#ffffff08':'#00000008'" stroke-width="1"/>
                <!-- Highlight zona pola -->
                <rect :x="chartData.hlX" y="2" :width="chartData.hlW" height="106" rx="6" :fill="activePattern.signal.includes('Bullish')?'#10b98110':'#ef444410'" :stroke="activePattern.signal.includes('Bullish')?'#10b98130':'#ef444430'" stroke-width="1" stroke-dasharray="3,3"/>
                <!-- Candles -->
                <template v-for="(mc,mi) in chartData.candles" :key="mi">
                  <line :x1="mc.cx" :y1="mc.hy" :x2="mc.cx" :y2="mc.ly" :stroke="mc.color" stroke-width="1"/>
                  <rect :x="mc.cx-mc.bw/2" :y="Math.min(mc.oy,mc.cy)" :width="mc.bw" :height="Math.max(2,Math.abs(mc.oy-mc.cy))" rx="1" :fill="mc.color" :opacity="mc.isPat?1:0.7"/>
                </template>
                <!-- Label tren sebelum -->
                <text :x="chartData.w*0.15" y="16" text-anchor="middle" :fill="isDark?'#94a3b8':'#64748b'" font-size="8" font-style="italic">
                  {{activePattern.signal.includes('Bullish')?'↘ Downtrend':activePattern.signal.includes('Bearish')?'↗ Uptrend':'→ Tren'}}
                </text>
                <!-- Label pola -->
                <text :x="chartData.hlX+chartData.hlW/2" y="16" text-anchor="middle" fill="#a78bfa" font-size="7" font-weight="bold">{{activePattern.label}}</text>
                <!-- Label tren sesudah -->
                <text :x="chartData.w*0.85" y="16" text-anchor="middle" :fill="isDark?'#94a3b8':'#64748b'" font-size="8" font-style="italic">
                  {{activePattern.signal.includes('Bullish')?'↗ Reversal Naik':activePattern.signal.includes('Bearish')?'↘ Reversal Turun':'→ Lanjut'}}
                </text>
              </svg>
            </div>

            <!-- Deskripsi singkat -->
            <p class="text-xs leading-relaxed mb-4 text-center" :class="isDark?'text-gray-400':'text-slate-600'">{{activePattern.desc}}</p>

            <div class="border-t mb-4" :class="isDark?'border-white/10':'border-slate-200'"></div>

            <!-- Detail spesifik pola (dari data) -->
            <div class="space-y-3 mb-4">
              <div v-for="(s,si) in activePattern.detail" :key="si">
                <p class="text-[10px] font-black uppercase tracking-wider mb-1 text-primary">{{s.title}}</p>
                <p class="text-[11px] leading-relaxed" :class="isDark?'text-gray-400':'text-slate-600'">{{s.body}}</p>
              </div>
            </div>

            <!-- ★ Panduan Trading Universal (auto-generated) ★ -->
            <div class="border-t pt-4 space-y-3" :class="isDark?'border-white/10':'border-slate-200'">
              <p class="text-[10px] font-black uppercase tracking-wider text-amber-500 flex items-center gap-1">
                <span class="material-symbols-outlined text-xs">school</span> Panduan Trading Lengkap
              </p>
              <div v-for="(g,gi) in tradingGuide" :key="gi">
                <p class="text-[10px] font-black uppercase tracking-wider mb-1" :class="isDark?'text-gray-500':'text-slate-400'">{{g.icon}} {{g.title}}</p>
                <p class="text-[11px] leading-relaxed" :class="isDark?'text-gray-400':'text-slate-600'">{{g.body}}</p>
              </div>
            </div>

            <button @click="activePattern=null" class="mt-6 w-full py-2.5 rounded-xl text-xs font-bold transition-colors" :class="isDark?'bg-white/5 text-white hover:bg-white/10':'bg-slate-100 text-slate-700 hover:bg-slate-200'">Tutup</button>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Modal Detail Konsep (dengan ilustrasi + panduan) -->
    <Teleport to="body">
      <Transition enter-active-class="transition duration-200 ease-out" enter-from-class="opacity-0" enter-to-class="opacity-100"
        leave-active-class="transition duration-150 ease-in" leave-from-class="opacity-100" leave-to-class="opacity-0">
        <div v-if="activeConcept" class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" @click.self="activeConcept=null">
          <div class="border rounded-3xl p-5 md:p-7 max-w-lg w-full max-h-[90vh] overflow-y-auto" :class="isDark?'bg-[#1a1d28] border-white/10':'bg-white border-slate-200 shadow-2xl'">
            <span class="material-symbols-outlined text-4xl text-primary block text-center mb-3">{{activeConcept.icon}}</span>
            <h3 class="text-lg font-headline font-black text-center mb-1" :class="isDark?'text-white':'text-slate-900'">{{activeConcept.name}}</h3>
            <p class="text-xs leading-relaxed mb-4 text-center" :class="isDark?'text-gray-400':'text-slate-600'">{{activeConcept.desc}}</p>

            <!-- ★ Ilustrasi Chart SVG (procedural per kategori) ★ -->
            <div v-if="cIllust" class="rounded-2xl p-3 mb-4" :class="isDark?'bg-white/[0.03]':'bg-slate-50'">
              <p class="text-[9px] font-black uppercase tracking-wider mb-2" :class="isDark?'text-gray-500':'text-slate-400'">📊 Ilustrasi Visual</p>
              <svg width="100%" viewBox="0 0 300 120" class="w-full" style="height:140px">
                <!-- Grid -->
                <line v-for="gy in [30,55,80]" :key="gy" x1="0" :y1="gy" x2="300" :y2="gy" :stroke="isDark?'#ffffff06':'#00000006'" stroke-width="1"/>
                <!-- Zona S/R -->
                <template v-if="cIllust.zones">
                  <rect v-for="(z,zi) in cIllust.zones" :key="'zr'+zi" x="0" :y="z.y" width="300" height="10" :fill="z.color" opacity="0.12" rx="2"/>
                  <line v-for="(z,zi) in cIllust.zones" :key="'zl'+zi" x1="0" :y1="z.y+5" x2="300" :y2="z.y+5" :stroke="z.color" stroke-width="1" stroke-dasharray="4,3" opacity="0.5"/>
                  <text v-for="(z,zi) in cIllust.zones" :key="'zt'+zi" x="6" :y="z.y-2" :fill="z.color" font-size="7" font-weight="bold" opacity="0.8">{{z.label}}</text>
                </template>
                <!-- Candles -->
                <template v-for="(mc,mi) in cIllust.candles" :key="'cc'+mi">
                  <line :x1="mc.cx" :y1="mc.hy" :x2="mc.cx" :y2="mc.ly" :stroke="mc.color" stroke-width="1"/>
                  <rect :x="mc.cx-4" :y="Math.min(mc.oy,mc.cy)" width="8" :height="Math.max(2,Math.abs(mc.oy-mc.cy))" rx="1" :fill="mc.color" opacity="0.7"/>
                </template>
                <!-- Overlay line (MA / indicator) -->
                <path v-if="cIllust.line" :d="cIllust.line" fill="none" stroke="#a78bfa" stroke-width="1.8" opacity="0.85" stroke-linecap="round"/>
                <path v-if="cIllust.line2" :d="cIllust.line2" fill="none" stroke="#f59e0b" stroke-width="1.2" opacity="0.5" stroke-dasharray="3,3"/>
                <path v-if="cIllust.line3" :d="cIllust.line3" fill="none" stroke="#f59e0b" stroke-width="1.2" opacity="0.5" stroke-dasharray="3,3"/>
                <!-- Oscillator subplot -->
                <template v-if="cIllust.oscLine">
                  <line x1="0" y1="85" x2="300" y2="85" :stroke="isDark?'#ffffff15':'#00000010'" stroke-width="1"/>
                  <rect x="0" y="88" width="300" height="2" :fill="isDark?'#ef444420':'#ef444410'"/>
                  <rect x="0" y="112" width="300" height="2" :fill="isDark?'#10b98120':'#10b98110'"/>
                  <text x="4" y="96" fill="#ef4444" font-size="6" opacity="0.6">Overbought</text>
                  <text x="4" y="118" fill="#10b981" font-size="6" opacity="0.6">Oversold</text>
                  <path :d="cIllust.oscLine" fill="none" stroke="#a78bfa" stroke-width="1.5" opacity="0.8"/>
                </template>
                <!-- Label -->
                <text v-for="(lb,li) in (cIllust.labels||[])" :key="'lb'+li" :x="lb.x" :y="lb.y" :text-anchor="lb.anchor||'middle'" :fill="lb.color||'#94a3b8'" :font-size="lb.size||8" font-weight="bold" :font-style="lb.italic?'italic':'normal'">{{lb.text}}</text>
              </svg>
            </div>

            <div class="border-t mb-4" :class="isDark?'border-white/10':'border-slate-200'"></div>
            <!-- Detail spesifik (dari data) -->
            <div class="space-y-3 mb-4">
              <div v-for="(s,si) in activeConcept.detail" :key="si">
                <p class="text-[10px] font-black uppercase tracking-wider mb-1 text-primary">{{s.title}}</p>
                <p class="text-[11px] leading-relaxed" :class="isDark?'text-gray-400':'text-slate-600'">{{s.body}}</p>
              </div>
            </div>
            <!-- ★ Panduan Universal Konsep (auto-generated) ★ -->
            <div v-if="conceptGuide.length" class="border-t pt-4 space-y-3" :class="isDark?'border-white/10':'border-slate-200'">
              <p class="text-[10px] font-black uppercase tracking-wider text-amber-500 flex items-center gap-1">
                <span class="material-symbols-outlined text-xs">school</span> Panduan Praktis
              </p>
              <div v-for="(g,gi) in conceptGuide" :key="gi">
                <p class="text-[10px] font-black uppercase tracking-wider mb-1" :class="isDark?'text-gray-500':'text-slate-400'">{{g.icon}} {{g.title}}</p>
                <p class="text-[11px] leading-relaxed" :class="isDark?'text-gray-400':'text-slate-600'">{{g.body}}</p>
              </div>
            </div>
            <button @click="activeConcept=null" class="mt-6 w-full py-2.5 rounded-xl text-xs font-bold transition-colors" :class="isDark?'bg-white/5 text-white hover:bg-white/10':'bg-slate-100 text-slate-700 hover:bg-slate-200'">Tutup</button>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
/**
 * Ensiklopedia super lengkap: 173 item, 8 kategori.
 * Setiap modal memiliki:
 * 1. Visual pola (candle/harmonic SVG)
 * 2. Contoh chart real-case (procedural mini chart)
 * 3. Detail spesifik pola (dari data)
 * 4. Panduan trading universal (auto-generated berdasarkan signal)
 */
import { candleCategories, chartCategories, advancedConceptCategories, type PatternDef, type ConceptDef } from './patternData'

const { isDark } = useColorMode()

const allPatternCats = reactive([...candleCategories, ...chartCategories])
const baseConcepts = reactive([advancedConceptCategories.find(c => c.title.includes('Price Action'))!].filter(Boolean))
const advConcepts = reactive(advancedConceptCategories.filter(c => !c.title.includes('Price Action')))
const activePattern = ref<PatternDef | null>(null)
const activeConcept = ref<ConceptDef | null>(null)
const activeConceptCat = ref('')
function openConcept(c: ConceptDef, catTitle: string) { activeConcept.value = c; activeConceptCat.value = catTitle }

// ─── Statistik header ───
const stats = computed(() => {
  let bullish = 0, bearish = 0, konsep = 0, total = 0
  allPatternCats.forEach(c => c.patterns.forEach(p => { total++; if (p.signal.includes('Bullish')) bullish++; else if (p.signal.includes('Bearish')) bearish++ }))
  advancedConceptCategories.forEach(c => { konsep += c.concepts.length; total += c.concepts.length })
  return [
    { label:'Total Teknik', val:total, color:isDark.value?'text-white':'text-slate-900' },
    { label:'Bullish', val:bullish, color:'text-emerald-500' },
    { label:'Bearish', val:bearish, color:'text-red-500' },
    { label:'Konsep', val:konsep, color:'text-violet-500' },
  ]
})

// ─── Procedural Mini Chart Generator ───
// Membuat contoh chart real-case untuk setiap pola candlestick
function seededRng(name: string) {
  let s = 0
  for (let i = 0; i < name.length; i++) s = (s * 31 + name.charCodeAt(i)) & 0x7fffffff
  return () => { s = (s * 1103515245 + 12345) & 0x7fffffff; return (s >>> 16) / 32768 }
}

interface MiniC { cx:number; hy:number; ly:number; oy:number; cy:number; color:string; bw:number; isPat:boolean }

const chartData = computed(() => {
  const p = activePattern.value
  if (!p || !p.candles?.length || p.harmonic) return { candles:[] as MiniC[], w:300, hlX:0, hlW:0 }

  const rng = seededRng(p.name)
  const isBull = p.signal.includes('Bullish')
  const isBear = p.signal.includes('Bearish')
  const nPat = p.candles.length
  const nBefore = 8, nAfter = 6
  const total = nBefore + nPat + nAfter
  const spacing = 18
  const W = total * spacing + 10

  // Buat harga prosedural
  const prices: {o:number;h:number;l:number;c:number;color:string;isPat:boolean}[] = []
  let price = 55

  // Candle sebelum pola (tren konteks)
  for (let i = 0; i < nBefore; i++) {
    const dir = isBull ? -1 : isBear ? 1 : (rng() > 0.5 ? 0.5 : -0.5)
    const body = 2 + rng() * 5
    const noise = (rng() - 0.5) * 3
    const move = dir * (1 + rng() * 2) + noise
    const o = price
    const c = o + move
    const isG = c > o
    const wU = rng() * 3, wD = rng() * 3
    prices.push({ o, c, h: Math.max(o, c) + wU, l: Math.min(o, c) - wD, color: isG ? '#10b981' : '#ef4444', isPat: false })
    price = c
  }

  // Candle pola (konversi dari viewBox 0-60 ke skala harga)
  const base = price
  for (let i = 0; i < nPat; i++) {
    const pc = p.candles[i]
    const sc = 0.35
    const isG = pc.color === '#10b981'
    const o = base + (30 - (isG ? pc.bodyBot : pc.bodyTop)) * sc
    const c = base + (30 - (isG ? pc.bodyTop : pc.bodyBot)) * sc
    const h = base + (30 - pc.wickTop) * sc
    const l = base + (30 - pc.wickBot) * sc
    prices.push({ o, c, h, l, color: pc.color, isPat: true })
    if (i === nPat - 1) price = c
  }

  // Candle sesudah pola (hasil)
  for (let i = 0; i < nAfter; i++) {
    const dir = isBull ? 1 : isBear ? -1 : (rng() > 0.5 ? 0.5 : -0.5)
    const body = 2 + rng() * 5
    const move = dir * (1.5 + rng() * 2.5) + (rng() - 0.5) * 1.5
    const o = price
    const c = o + move
    const isG = c > o
    const wU = rng() * 3, wD = rng() * 3
    prices.push({ o, c, h: Math.max(o, c) + wU, l: Math.min(o, c) - wD, color: isG ? '#10b981' : '#ef4444', isPat: false })
    price = c
  }

  // Normalisasi ke viewBox Y (10-100)
  let minP = Infinity, maxP = -Infinity
  prices.forEach(c => { if (c.l < minP) minP = c.l; if (c.h > maxP) maxP = c.h })
  const range = maxP - minP || 1
  const toY = (v: number) => 100 - ((v - minP) / range) * 85 - 5

  const candles: MiniC[] = prices.map((c, i) => ({
    cx: i * spacing + spacing / 2 + 5,
    hy: toY(c.h), ly: toY(c.l), oy: toY(c.o), cy: toY(c.c),
    color: c.color, bw: c.isPat ? 10 : 8, isPat: c.isPat
  }))

  const hlX = nBefore * spacing + 2
  const hlW = nPat * spacing + 6

  return { candles, w: W, hlX, hlW }
})

// ─── Panduan Trading Universal (auto-generated berdasarkan signal) ───
const tradingGuide = computed(() => {
  const p = activePattern.value
  if (!p) return []
  const isBull = p.signal.includes('Bullish')
  const isBear = p.signal.includes('Bearish')
  const isCont = p.signal === 'Continuation'

  if (isBull) return [
    { icon:'📍', title:'Kapan Muncul', body:'Pola ini muncul di AKHIR downtrend atau di dekat area support kuat. Semakin panjang downtrend sebelumnya dan semakin dekat ke support penting, semakin kuat sinyal reversal naik.' },
    { icon:'🎯', title:'Cara Entry', body:'JANGAN langsung beli saat pola terbentuk! Tunggu candle konfirmasi berikutnya — candle hijau yang menutup di atas high pola. Entry di candle konfirmasi ini. Volume tinggi pada candle konfirmasi memperkuat sinyal.' },
    { icon:'🛑', title:'Stop Loss', body:'Pasang stop loss di BAWAH titik terendah (low) pola. Jika harga turun melewati level ini, berarti pola gagal dan sebaiknya keluar. Jangan perbesar stop loss — disiplin adalah kunci.' },
    { icon:'💰', title:'Target Profit', body:'Target pertama: resistance terdekat. Target kedua: gunakan Fibonacci extension 127.2% atau 161.8% dari tinggi pola. Pertimbangkan taking partial profit di target pertama.' },
    { icon:'⚠️', title:'Kesalahan Umum', body:'1) Entry tanpa menunggu konfirmasi. 2) Mengabaikan volume — pola tanpa volume tinggi sering gagal. 3) Trading di tengah downtrend kuat tanpa support kuat di dekatnya. 4) Memasang stop loss terlalu dekat.' },
    { icon:'💡', title:'Tips Pro', body:'Kombinasikan pola ini dengan indikator lain: RSI oversold (<30) + pola bullish = sinyal sangat kuat. Cek juga apakah ada divergence bullish di RSI/MACD untuk double-confirmation.' },
  ]
  if (isBear) return [
    { icon:'📍', title:'Kapan Muncul', body:'Pola ini muncul di PUNCAK uptrend atau di dekat area resistance kuat. Semakin panjang uptrend sebelumnya, semakin besar kemungkinan reversal turun.' },
    { icon:'🎯', title:'Cara Entry', body:'Tunggu candle konfirmasi bearish — candle merah yang menutup di bawah low pola. Untuk trader saham: pertimbangkan untuk JUAL/take profit posisi yang ada, bukan short selling.' },
    { icon:'🛑', title:'Stop Loss', body:'Pasang stop loss di ATAS titik tertinggi (high) pola. Jika tembus ke atas = pola gagal, uptrend berlanjut.' },
    { icon:'💰', title:'Target', body:'Target turun: support terdekat. Untuk saham, gunakan ini sebagai sinyal keluar/take profit, bukan entry short. Fibonacci extension 127.2% dari tinggi pola untuk target jika short.' },
    { icon:'⚠️', title:'Kesalahan Umum', body:'1) Panic selling tanpa konfirmasi. 2) Mengabaikan konteks — pola bearish di tengah uptrend kuat bisa jadi hanya koreksi minor. 3) Tidak memperhatikan volume.' },
    { icon:'💡', title:'Tips Pro', body:'RSI overbought (>70) + pola bearish + bearish divergence = triple confirmation. Volume menurun saat uptrend + pola bearish = smart money sudah distribusi.' },
  ]
  if (isCont) return [
    { icon:'📍', title:'Kapan Muncul', body:'Pola kelanjutan muncul di TENGAH tren yang sedang berlangsung. Ini menandakan "jeda" sebentar sebelum tren melanjutkan arahnya.' },
    { icon:'🎯', title:'Cara Entry', body:'Entry saat harga breakout dari pola searah tren utama. Misalnya di uptrend: beli saat tembus resistance pola. Volume tinggi saat breakout memperkuat validitas.' },
    { icon:'🛑', title:'Stop Loss', body:'Di balik sisi pola yang berlawanan dengan tren. Misalnya uptrend: stop loss di bawah low pola.' },
    { icon:'💰', title:'Target', body:'Ukur tinggi/panjang pola, lalu proyeksikan dari titik breakout searah tren. Ini disebut "measured move".' },
    { icon:'💡', title:'Tips Pro', body:'Volume biasanya MENURUN selama konsolidasi dan MENINGKAT saat breakout. Jika breakout tanpa volume = waspada false breakout.' },
  ]
  // Netral
  return [
    { icon:'📍', title:'Kapan Muncul', body:'Pola netral bisa muncul di mana saja. Artinya belum jelas arah selanjutnya — pasar sedang "berpikir". Perlu konfirmasi dari candle/pola selanjutnya.' },
    { icon:'🎯', title:'Cara Trading', body:'TUNGGU. Jangan entry saat muncul pola netral. Perhatikan candle selanjutnya dan padukan dengan indikator (RSI, MACD) untuk menentukan arah. Pola netral di dekat support lebih cenderung bullish, dekat resistance lebih cenderung bearish.' },
    { icon:'⚠️', title:'Peringatan', body:'Pola netral di tengah tren kuat bisa jadi hanya noise. Selalu lihat konteks besar (timeframe lebih tinggi) sebelum membuat keputusan.' },
  ]
})

// ─── Ilustrasi SVG untuk Konsep (procedural per kategori) ───
interface IllustC { cx:number; hy:number; ly:number; oy:number; cy:number; color:string }
interface IllustZone { y:number; color:string; label:string }
interface IllustLabel { x:number; y:number; text:string; color?:string; size?:number; anchor?:string; italic?:boolean }

const cIllust = computed(() => {
  const c = activeConcept.value
  const cat = activeConceptCat.value
  if (!c) return null
  const rng = seededRng(c.name)

  // Buat candle chart dasar (16 candle)
  const raw: {o:number;h:number;l:number;c:number}[] = []
  let pr = 55
  for (let i = 0; i < 16; i++) {
    const dir = (rng() > 0.5 ? 1 : -1) * (0.5 + rng() * 2.5)
    const o = pr; const cc = o + dir + (rng()-0.5)*2
    raw.push({ o, c: cc, h: Math.max(o,cc) + rng()*3, l: Math.min(o,cc) - rng()*3 })
    pr = cc
  }
  let minP = Infinity, maxP = -Infinity
  raw.forEach(p => { if(p.l<minP) minP=p.l; if(p.h>maxP) maxP=p.h })
  const rr = maxP - minP || 1
  const toY = (v:number) => 80 - ((v-minP)/rr)*65 - 5
  const sp = 300/16
  const candles: IllustC[] = raw.map((p,i) => ({
    cx: i*sp+sp/2, hy: toY(p.h), ly: toY(p.l), oy: toY(p.o), cy: toY(p.c),
    color: p.c > p.o ? '#10b981' : '#ef4444'
  }))

  let zones: IllustZone[]|null = null
  let line = '', line2 = '', line3 = '', oscLine = ''
  const labels: IllustLabel[] = []

  if (cat.includes('Price Action')) {
    // Zona Support & Resistance
    const mids = raw.map(p => (p.o+p.c)/2).sort((a,b)=>a-b)
    const sLvl = mids[Math.floor(mids.length*0.2)]
    const rLvl = mids[Math.floor(mids.length*0.8)]
    zones = [
      { y: toY(sLvl)-5, color:'#10b981', label:'Support Zone' },
      { y: toY(rLvl)-5, color:'#ef4444', label:'Resistance Zone' }
    ]
    labels.push(
      { x:280, y:toY(sLvl)+3, text:'↑ Buyer masuk', color:'#10b981', size:7, anchor:'end' },
      { x:280, y:toY(rLvl)+3, text:'↓ Seller masuk', color:'#ef4444', size:7, anchor:'end' }
    )
  } else if (cat.includes('Indikator')) {
    // Deteksi tipe indikator
    const isOsc = ['RSI','Stochastic','CCI','Williams','Momentum','ROC','TSI','Ultimate','Awesome','DPO','KST','MFI','Force','Klinger','Chaikin'].some(o => c.name.includes(o))
    const isBand = ['Bollinger','Keltner','Donchian','Channel'].some(o => c.name.includes(o))

    if (isOsc) {
      // Oscillator subplot (RSI-like)
      const oscVals: number[] = []
      let ov = 50
      for (let i = 0; i < 16; i++) {
        ov += (rng()-0.48) * 15
        ov = Math.max(15, Math.min(85, ov))
        oscVals.push(ov)
      }
      oscLine = oscVals.map((v,i) => `${i===0?'M':'L'}${candles[i].cx},${112 - v*0.3}`).join(' ')
      labels.push({ x:150, y:96, text:c.name.split('(')[0].trim(), color:'#a78bfa', size:7 })
    } else if (isBand) {
      // Band overlay (upper + lower)
      const ma: number[] = []
      for (let i = 0; i < 16; i++) {
        const s = Math.max(0,i-4)
        ma.push(raw.slice(s,i+1).reduce((a,p)=>a+(p.o+p.c)/2,0)/(i-s+1))
      }
      const bw = 4 + rng()*3
      line2 = ma.map((v,i) => `${i===0?'M':'L'}${candles[i].cx},${toY(v+bw+rng()*1.5)}`).join(' ')
      line3 = ma.map((v,i) => `${i===0?'M':'L'}${candles[i].cx},${toY(v-bw-rng()*1.5)}`).join(' ')
      line = ma.map((v,i) => `${i===0?'M':'L'}${candles[i].cx},${toY(v)}`).join(' ')
      labels.push({ x:260, y:16, text:'Upper Band', color:'#f59e0b', size:7 },{ x:260, y:78, text:'Lower Band', color:'#f59e0b', size:7 })
    } else {
      // MA overlay line
      const prd = c.name.includes('EMA') ? 4 : 6
      const ma: number[] = []
      for (let i = 0; i < 16; i++) {
        const s = Math.max(0,i-prd+1)
        ma.push(raw.slice(s,i+1).reduce((a,p)=>a+(p.o+p.c)/2,0)/(i-s+1))
      }
      line = ma.map((v,i) => `${i===0?'M':'L'}${candles[i].cx},${toY(v)}`).join(' ')
      labels.push({ x:candles[15].cx, y:toY(ma[15])-6, text:c.name.split('(')[0].trim(), color:'#a78bfa', size:7, anchor:'end' })
    }
  } else {
    // Teori & Jenis Chart: MA line + label fase
    const ma: number[] = []
    for (let i = 0; i < 16; i++) {
      const s = Math.max(0,i-5)
      ma.push(raw.slice(s,i+1).reduce((a,p)=>a+(p.o+p.c)/2,0)/(i-s+1))
    }
    line = ma.map((v,i) => `${i===0?'M':'L'}${candles[i].cx},${toY(v)}`).join(' ')
    if (cat.includes('Teori')) {
      labels.push({ x:50, y:12, text:'Fase 1', color:'#64748b', size:7, italic:true },{ x:150, y:12, text:'Fase 2', color:'#64748b', size:7, italic:true },{ x:250, y:12, text:'Fase 3', color:'#64748b', size:7, italic:true })
    }
  }

  return { candles, zones, line, line2, line3, oscLine, labels }
})

// ─── Panduan Universal Konsep (auto-generated berdasarkan kategori) ───
const conceptGuide = computed(() => {
  const cat = activeConceptCat.value
  const c = activeConcept.value
  if (!c) return []

  if (cat.includes('Price Action')) return [
    { icon:'📍', title:'Cara Menentukan', body:'Cari level harga di mana harga memantul minimal 2-3 kali. Semakin sering diuji (disentuh tapi tidak tembus), semakin kuat level tersebut. Gunakan timeframe lebih tinggi (Daily/Weekly) untuk level utama.' },
    { icon:'🎯', title:'Cara Trading', body:'BUY: Saat harga mendekati support + muncul candle reversal bullish (hammer, engulfing). SELL: Saat harga mendekati resistance + muncul candle reversal bearish. Selalu tunggu KONFIRMASI — jangan entry hanya karena menyentuh level.' },
    { icon:'📐', title:'Contoh Perhitungan', body:'Misal saham BBCA memantul 3x di harga 8.500 (support) dan ditolak 3x di 9.200 (resistance). Range = 700. Entry beli: 8.550 setelah hammer. Stop loss: 8.450 (di bawah support). Target: 9.150 (dekat resistance). Risk = 100, Reward = 600. Risk:Reward = 1:6 — sangat baik!' },
    { icon:'⚠️', title:'Peringatan', body:'Level yang sering diuji AKHIRNYA akan ditembus. Saat tembus, level berubah peran (support → resistance, resistance → support). Jangan keras kepala mempertahankan level yang sudah break.' },
  ]
  if (cat.includes('Indikator')) return [
    { icon:'📐', title:'Contoh Perhitungan', body:`Misal indikator ${c.name.split('(')[0].trim()}: Jika menggunakan periode 14, ambil data 14 hari terakhir. Hitung sesuai rumus indikator. Contoh SMA 14 = (Harga hari 1 + hari 2 + ... + hari 14) ÷ 14. Jika total = 140.000, maka SMA = 10.000. Besok: buang hari terlama, tambah hari baru.` },
    { icon:'🎯', title:'Cara Membaca Sinyal', body:'Aturan umum: (1) Crossover — saat garis indikator memotong garis sinyal/level tertentu = sinyal entry/exit. (2) Divergence — indikator bergerak berlawanan dengan harga = peringatan dini reversal. (3) Overbought/Oversold — indikator di zona ekstrem = potensi pembalikan.' },
    { icon:'🔗', title:'Kombinasi Terbaik', body:'Jangan gunakan 1 indikator saja! Kombinasi yang populer: (1) Trend indicator (MA/Supertrend) + Momentum (RSI/MACD) untuk konfirmasi. (2) Bollinger Bands + RSI: harga sentuh band bawah + RSI <30 = sinyal beli kuat. (3) MACD crossover + Volume naik = konfirmasi tren baru.' },
    { icon:'⚠️', title:'Kesalahan Umum', body:'(1) Terlalu banyak indikator = "analysis paralysis". Cukup 2-3. (2) Menggunakan indikator yang sama jenisnya (misalnya RSI + Stochastic = redundan, keduanya momentum). (3) Tidak memahami bahwa indikator LAGGING — mereka mengikuti harga, bukan memprediksi.' },
  ]
  if (cat.includes('Teori')) return [
    { icon:'📚', title:'Prinsip Utama', body:'Setiap teori/metode di atas adalah KERANGKA BERPIKIR, bukan formula ajaib. Mereka membantu menyusun analisis secara sistematis. Gunakan sebagai panduan, bukan aturan kaku. Konfirmasi selalu dengan price action (candle pattern) dan volume.' },
    { icon:'📐', title:'Contoh Aplikasi', body:'Misal menggunakan Fibonacci Retracement: Harga naik dari 1.000 ke 2.000 (range 1.000). Level 61.8% = 2.000 - (1.000 × 0.618) = 1.382. Artinya jika harga koreksi ke 1.382, itu area potensial untuk rebound. Tunggu candle bullish di level ini untuk entry.' },
    { icon:'⚠️', title:'Keterbatasan', body:'Tidak ada teori yang 100% akurat. Elliott Wave sangat subjektif (beda analis beda hitungan). Fibonacci bukan sains eksak — ini "area", bukan titik pasti. Wyckoff butuh pengalaman bertahun-tahun. Mulai dari yang sederhana (Dow Theory, Fibonacci) sebelum yang kompleks.' },
  ]
  if (cat.includes('Chart')) return [
    { icon:'🎯', title:'Kapan Digunakan', body:'Setiap jenis chart memiliki kekuatan unik. Candlestick = paling populer, detail OHLC lengkap. Heikin Ashi = melihat tren tanpa noise. Renko = murni pergerakan harga tanpa waktu. Pilih berdasarkan gaya trading: scalper → Tick Chart, swing trader → Candlestick/Heikin Ashi.' },
    { icon:'✅', title:'Kelebihan', body:'Chart alternatif seperti Renko dan Kagi sangat baik untuk filter noise dan melihat tren bersih. P&F chart sangat baik untuk menentukan target harga. Volume chart (Tick, CandleVolume) menunjukkan aktivitas pasar yang sesungguhnya.' },
    { icon:'⚠️', title:'Kekurangan', body:'Semua chart non-candlestick memiliki LAG (keterlambatan). Renko/Kagi/P&F tidak menunjukkan waktu — Anda tidak tahu berapa lama pola terbentuk. Heikin Ashi mengubah Open/Close sehingga TIDAK cocok untuk menentukan entry/exit presisi.' },
  ]
  return []
})

// ─── Helper warna badge ───
function signalClass(signal: string): string {
  if (signal.includes('Bullish')) return isDark.value ? 'bg-emerald-500/15 text-emerald-400' : 'bg-emerald-50 text-emerald-600'
  if (signal.includes('Bearish')) return isDark.value ? 'bg-red-500/15 text-red-400' : 'bg-red-50 text-red-600'
  if (signal === 'Continuation') return isDark.value ? 'bg-blue-500/15 text-blue-400' : 'bg-blue-50 text-blue-600'
  return isDark.value ? 'bg-white/10 text-gray-400' : 'bg-slate-100 text-slate-500'
}
</script>

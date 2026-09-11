<template>
  <div class="space-y-6 font-mono">
    <!-- Header statistik (Swiss Modular Block) -->
    <div class="border p-5" :class="isDark ? 'bg-[#15171e] border-neutral-800' : 'bg-white border-neutral-300 shadow-sm'">
      <div class="flex items-center gap-2 mb-4 pb-3 border-b" :class="isDark ? 'border-neutral-800' : 'border-neutral-200'">
        <span class="material-symbols-outlined text-lg opacity-70">menu_book</span>
        <h2 class="font-mono font-bold text-xs uppercase tracking-widest" :class="isDark ? 'text-white' : 'text-neutral-900'">
          CHART PATTERNS ENCYCLOPEDIA // DIRECTORY
        </h2>
      </div>
      <div class="grid grid-cols-2 sm:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x border"
        :class="isDark ? 'bg-neutral-950 border-neutral-800 divide-neutral-800' : 'bg-neutral-50 border-neutral-200 divide-neutral-200'"
      >
        <div v-for="s in stats" :key="s.label" class="p-3 text-center">
          <p class="text-xl font-black font-mono tabular-nums" :class="s.color">{{ s.val }}</p>
          <p class="text-[8px] uppercase tracking-widest font-bold opacity-50 mt-0.5">{{ s.label }}</p>
        </div>
      </div>
    </div>

    <!-- Konsep Dasar -->
    <div v-for="cc in baseConcepts" :key="cc.title" class="border overflow-hidden" :class="isDark ? 'bg-[#15171e] border-neutral-800' : 'bg-white border-neutral-300 shadow-sm'">
      <div class="p-4 md:p-5 border-b" :class="isDark ? 'border-neutral-800' : 'border-neutral-200'">
        <p class="text-[9px] font-mono font-bold uppercase tracking-[0.2em] opacity-40 mb-0.5">{{ cc.subtitle }}</p>
        <h3 class="font-mono font-bold text-xs uppercase tracking-wider" :class="isDark ? 'text-white' : 'text-neutral-900'">{{ cc.title }}</h3>
      </div>
      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 p-4 md:p-5">
        <div v-for="c in cc.concepts" :key="c.name" @click="openConcept(c,cc.title)" class="border p-3.5 flex flex-col items-center transition-all hover:border-neutral-900 dark:hover:border-white cursor-pointer" :class="isDark ? 'bg-neutral-950/60 border-neutral-800' : 'bg-neutral-50 border-neutral-200'">
          <span class="material-symbols-outlined text-xl mb-1.5 text-primary">{{ c.icon }}</span>
          <p class="text-xs font-mono font-bold text-center mb-1 uppercase" :class="isDark ? 'text-white' : 'text-neutral-900'">{{ c.name }}</p>
          <p class="text-[9px] leading-relaxed text-center opacity-60 font-sans">{{ c.desc }}</p>
        </div>
      </div>
    </div>

    <!-- Kategori Pola (collapsible) -->
    <div v-for="cat in allPatternCats" :key="cat.title" class="border overflow-hidden" :class="isDark ? 'bg-[#15171e] border-neutral-800' : 'bg-white border-neutral-300 shadow-sm'">
      <button @click="cat.open=!cat.open" class="w-full flex items-center justify-between p-4 md:p-5 text-left transition-colors border-b" :class="isDark ? 'border-neutral-800 hover:bg-neutral-800/30' : 'border-neutral-200 hover:bg-neutral-50'">
        <div>
          <p class="text-[9px] font-mono font-bold uppercase tracking-[0.2em] opacity-40 mb-0.5">{{ cat.subtitle }}</p>
          <h3 class="font-mono font-bold text-xs uppercase tracking-wider" :class="isDark ? 'text-white' : 'text-neutral-900'">{{ cat.title }}</h3>
        </div>
        <div class="flex items-center gap-2">
          <span class="text-[9px] font-mono font-bold px-2 py-0.5 border" :class="isDark ? 'bg-neutral-900 border-neutral-700 text-neutral-400' : 'bg-neutral-100 border-neutral-300 text-neutral-600'">{{ cat.patterns.length }} PATTERNS</span>
          <span class="material-symbols-outlined text-base transition-transform duration-200 opacity-60" :class="cat.open ? 'rotate-180' : ''">expand_more</span>
        </div>
      </button>
      <div v-show="cat.open">
        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 p-4 md:p-5">
          <div v-for="p in cat.patterns" :key="p.name" @click="activePattern=p" class="border p-3 flex flex-col transition-all hover:border-neutral-900 dark:hover:border-white cursor-pointer" :class="isDark ? 'bg-neutral-950/60 border-neutral-800' : 'bg-neutral-50 border-neutral-200'">
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
            <div class="mt-2 flex justify-center"><span class="text-[8px] font-black uppercase px-2 py-0.5 rounded-xl tracking-wider" :class="signalClass(p.signal)">{{p.signal}}</span></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Kategori Konsep Lanjutan (collapsible) -->
    <div v-for="cc in advConcepts" :key="cc.title" class="glass-panel rounded-xl border overflow-hidden" :class="isDark?'border-white/5':'border-slate-100'">
      <button @click="cc.open=!cc.open" class="w-full flex items-center justify-between p-5 text-left transition-colors" :class="isDark?'hover:bg-white/5':'hover:bg-slate-50'">
        <div>
          <p class="text-[9px] font-black uppercase tracking-[0.2em] mb-1" :class="isDark?'text-gray-600':'text-slate-400'">{{cc.subtitle}}</p>
          <h3 class="font-headline font-bold text-sm" :class="isDark?'text-white':'text-slate-900'">{{cc.title}}</h3>
        </div>
        <div class="flex items-center gap-2">
          <span class="text-[9px] font-bold px-2 py-0.5 rounded-xs" :class="isDark?'bg-white/10 text-gray-400':'bg-slate-100 text-slate-500'">{{ cc.concepts.length }}</span>
          <span class="material-symbols-outlined text-lg transition-transform duration-300" :class="cc.open?'rotate-180':''" style="opacity:0.4">expand_more</span>
        </div>
      </button>
      <div v-show="cc.open">
        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 px-5 pb-5">
          <div v-for="c in cc.concepts" :key="c.name" @click="openConcept(c,cc.title)" class="rounded-xl border p-4 flex flex-col items-center transition-all hover:scale-[1.02] cursor-pointer" :class="isDark?'bg-white/[0.03] border-white/10 hover:border-white/20':'bg-slate-50 border-slate-200 hover:border-slate-300'">
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
        <div v-if="activePattern" class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm" @click.self="activePattern=null">
          <div class="relative w-full max-w-lg max-h-[85vh] rounded-2xl border flex flex-col overflow-hidden shadow-2xl transition-all"
            :class="isDark ? 'bg-[#0e1017] border-white/[0.1] text-slate-100' : 'bg-white border-slate-200 text-slate-900'"
          >
            <!-- Header modal dengan badge signal & tombol tutup -->
            <div class="flex items-center justify-between px-5 sm:px-6 py-3.5 border-b shrink-0"
              :class="isDark ? 'border-white/[0.08] bg-[#0e1017]' : 'border-slate-100 bg-white'"
            >
              <div class="flex items-center gap-2">
                <span class="inline-block text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded border tracking-wider" :class="signalClass(activePattern.signal)">{{ activePattern.signal }}</span>
                <span class="text-[10px] font-mono font-bold" :class="activePattern.labelColor">{{ activePattern.label }}</span>
              </div>
              <button 
                @click="activePattern = null"
                class="w-7 h-7 rounded-lg border flex items-center justify-center transition-colors cursor-pointer"
                :class="isDark ? 'bg-white/[0.04] border-white/[0.08] text-slate-400 hover:text-white hover:bg-white/[0.08]' : 'bg-slate-100 border-slate-200 text-slate-600 hover:text-slate-900'"
                aria-label="Tutup modal"
              >
                <span class="material-symbols-outlined text-sm">close</span>
              </button>
            </div>

            <!-- Konten scrollable internal terisolasi di dalam border (mencegah scrollbar bocor) -->
            <div class="overflow-y-auto p-5 sm:p-6 space-y-4 flex-1">
              <!-- Judul dan deskripsi -->
              <div class="text-center">
                <h3 class="text-lg font-headline font-black tracking-tight" :class="isDark ? 'text-white' : 'text-slate-900'">{{ activePattern.name }}</h3>
                <p class="text-xs leading-relaxed mt-1" :class="isDark ? 'text-slate-400' : 'text-slate-600'">{{ activePattern.desc }}</p>
              </div>

              <!-- Visual kecil pola -->
              <div v-if="activePattern.harmonic" class="h-24 flex items-center justify-center py-2 rounded-xl border"
                :class="isDark ? 'bg-black/30 border-white/[0.06]' : 'bg-slate-50 border-slate-200'"
              >
                <svg width="100%" height="96" viewBox="0 0 200 120" class="max-w-full">
                  <template v-for="(pt,pi) in activePattern.harmonic.points" :key="'ml'+pi"><line v-if="pi<activePattern.harmonic.points.length-1" :x1="pt.x" :y1="pt.y" :x2="activePattern.harmonic.points[pi+1].x" :y2="activePattern.harmonic.points[pi+1].y" :stroke="activePattern.harmonic.points[pi+1].y<pt.y?'#10b981':'#ef4444'" stroke-width="2.5" stroke-linecap="round"/></template>
                  <circle v-for="(pt,pi) in activePattern.harmonic.points" :key="'mc'+pi" :cx="pt.x" :cy="pt.y" r="4" :fill="isDark?'#fff':'#1e293b'"/>
                  <text v-for="(pt,pi) in activePattern.harmonic.points" :key="'mt'+pi" :x="pt.x" :y="pt.y<60?pt.y-8:pt.y+15" text-anchor="middle" :fill="isDark?'#e2e8f0':'#334155'" font-size="11" font-weight="bold">{{pt.label}}</text>
                  <text v-for="(f,fi) in activePattern.harmonic.fibs" :key="'mf'+fi" :x="f.x" :y="f.y" :text-anchor="f.align||'middle'" fill="#a78bfa" font-size="9" font-weight="600">{{f.text}}</text>
                </svg>
              </div>
              <div v-else class="flex items-end justify-center gap-1.5 py-2 rounded-xl border"
                :class="isDark ? 'bg-black/30 border-white/[0.06]' : 'bg-slate-50 border-slate-200'"
                style="height:68px"
              >
                <svg v-for="(c,ci) in activePattern.candles" :key="ci" width="20" height="56" viewBox="0 0 16 60" class="flex-shrink-0">
                  <line :x1="8" :y1="c.wickTop" :x2="8" :y2="c.bodyTop" :stroke="c.color" stroke-width="1.5"/>
                  <rect :x="2" :y="c.bodyTop" :width="12" :height="Math.max(2,c.bodyBot-c.bodyTop)" :rx="2" :fill="c.color"/>
                  <line :x1="8" :y1="c.bodyBot" :x2="8" :y2="c.wickBot" :stroke="c.color" stroke-width="1.5"/>
                </svg>
              </div>

              <!-- Contoh Chart Real-Case dengan Konfirmasi Volume & Key Level -->
              <div v-if="chartData.candles?.length" class="rounded-xl p-3.5 border" :class="isDark ? 'bg-black/40 border-white/[0.06]' : 'bg-slate-50 border-slate-200'">
                <div class="flex flex-wrap items-center justify-between gap-1.5 mb-2">
                  <div class="flex items-center gap-1.5 text-[9px] font-mono font-bold uppercase tracking-wider" :class="isDark ? 'text-slate-400' : 'text-slate-500'">
                    <span class="material-symbols-outlined text-xs text-primary">analytics</span>
                    <span>{{ activePattern.harmonic ? 'Simulasi Real Market (Harmonic XABCD + Fibonacci PRZ)' : 'Simulasi Real Market (Price Action + VSA)' }}</span>
                  </div>
                  <div class="flex items-center gap-2 text-[8px] font-mono shrink-0">
                    <span class="inline-flex items-center gap-1 text-emerald-500"><span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>Buy</span>
                    <span class="inline-flex items-center gap-1 text-red-500"><span class="w-1.5 h-1.5 rounded-full bg-red-500"></span>Sell</span>
                    <span class="inline-flex items-center gap-1 text-amber-400"><span class="w-1.5 h-1.5 rounded-full bg-amber-400"></span>{{ activePattern.harmonic ? 'PRZ / Fib' : 'Spike' }}</span>
                  </div>
                </div>

                <svg width="100%" :viewBox="`0 0 ${chartData.w} 150`" class="w-full" style="height:170px">
                  <!-- Grid horizontal harga -->
                  <line v-for="gy in [32,58,84]" :key="gy" x1="0" :y1="gy" :x2="chartData.w" :y2="gy" :stroke="isDark?'#ffffff08':'#00000008'" stroke-width="1"/>
                  
                  <!-- Support / Resistance Key Level dinamis dengan Badge bersih di kiri (bebas tabrakan teks) -->
                  <g v-if="chartData.srY !== null">
                    <line x1="0" :y1="chartData.srY" :x2="chartData.w" :y2="chartData.srY" :stroke="activePattern.signal.includes('Bullish')?'#10b981':'#ef4444'" stroke-width="1" stroke-dasharray="4,4" opacity="0.6"/>
                    <rect :x="6" :y="chartData.srY - 11" width="108" height="12" rx="2" :fill="isDark ? '#0e1017' : '#ffffff'" :stroke="activePattern.signal.includes('Bullish')?'#10b98140':'#ef444440'" stroke-width="0.8"/>
                    <text :x="9" :y="chartData.srY - 2.5" text-anchor="start" :fill="activePattern.signal.includes('Bullish')?'#10b981':'#ef4444'" font-size="6" font-family="monospace" font-weight="bold">
                      {{ activePattern.signal.includes('Bullish') ? 'SUPPORT (DEMAND ZONE)' : 'RESISTANCE (SUPPLY ZONE)' }}
                    </text>
                  </g>

                  <!-- Highlight zona formasi pola -->
                  <rect :x="chartData.hlX" y="15" :width="chartData.hlW" height="88" rx="4" :fill="activePattern.signal.includes('Bullish')?'#10b98110':'#ef444410'" :stroke="activePattern.signal.includes('Bullish')?'#10b98135':'#ef444435'" stroke-width="1" stroke-dasharray="3,3"/>
                  
                  <!-- Candlesticks (Bodi Besar & Sumbu Tegas Persis Case Study) -->
                  <template v-for="(mc,mi) in chartData.candles" :key="'c'+mi">
                    <!-- Sumbu (Wick) -->
                    <line :x1="mc.cx" :y1="mc.hy" :x2="mc.cx" :y2="mc.ly" :stroke="mc.color" stroke-width="1.8"/>
                    <!-- Bodi Candle -->
                    <rect :x="mc.cx-mc.bw/2" :y="Math.min(mc.oy,mc.cy)" :width="mc.bw" :height="Math.max(2,Math.abs(mc.oy-mc.cy))" rx="1.5" :fill="mc.color" :opacity="mc.isPat?1:0.85"/>
                  </template>

                  <!-- Harmonic XABCD Geometry & Fibonacci Overlay -->
                  <template v-if="chartData.harmonicOverlay">
                    <!-- Garis Polyline Kaki XABCD -->
                    <path :d="chartData.harmonicOverlay.line" fill="none" stroke="#a78bfa" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" opacity="0.95"/>
                    <path :d="chartData.harmonicOverlay.line" fill="none" stroke="#f59e0b" stroke-width="1.2" stroke-dasharray="3,3" opacity="0.6"/>
                    
                    <!-- Titik Simpul & Badge Label X, A, B, C, D -->
                    <g v-for="(pt, pti) in chartData.harmonicOverlay.points" :key="'hpt'+pti">
                      <circle :cx="pt.cx" :cy="pt.cy" r="4.5" :fill="isDark ? '#0e1017' : '#ffffff'" stroke="#a78bfa" stroke-width="2"/>
                      <circle :cx="pt.cx" :cy="pt.cy" r="2" fill="#a78bfa"/>
                      <rect :x="pt.cx - 7" :y="pt.cy < 55 ? pt.cy - 16 : pt.cy + 6" width="14" height="10" rx="2" :fill="isDark ? '#0e1017' : '#ffffff'" stroke="#a78bfa60" stroke-width="0.8"/>
                      <text :x="pt.cx" :y="pt.cy < 55 ? pt.cy - 9 : pt.cy + 13" text-anchor="middle" fill="#a78bfa" font-size="7" font-family="monospace" font-weight="bold">{{ pt.label }}</text>
                    </g>

                    <!-- Label Rasio Fibonacci di Antara Kaki Pola -->
                    <template v-for="(fib, fibi) in chartData.harmonicOverlay.fibs" :key="'hfb'+fibi">
                      <rect :x="fib.x - 16" :y="fib.y - 6" width="32" height="11" rx="2" :fill="isDark ? '#0e1017' : '#ffffff'" stroke="#f59e0b60" stroke-width="0.8"/>
                      <text :x="fib.x" :y="fib.y + 2" text-anchor="middle" fill="#f59e0b" font-size="6.5" font-family="monospace" font-weight="bold">{{ fib.text }}</text>
                    </template>

                    <!-- Zona PRZ (Potential Reversal Zone) Emas di Titik D -->
                    <rect :x="chartData.harmonicOverlay.przX - 14" :y="chartData.harmonicOverlay.przY - 8" width="28" height="16" rx="3" fill="#f59e0b20" stroke="#f59e0b70" stroke-width="1" stroke-dasharray="2,2"/>
                    <text :x="chartData.harmonicOverlay.przX" :y="chartData.harmonicOverlay.przY < 55 ? chartData.harmonicOverlay.przY - 10 : chartData.harmonicOverlay.przY + 16" text-anchor="middle" fill="#f59e0b" font-size="6.5" font-family="monospace" font-weight="bold">PRZ ZONE</text>
                  </template>

                  <!-- Labels Tahapan Tren (Tepat di Atas Klaster Candle Masing-Masing) -->
                  <text :x="chartData.candles[0] ? (chartData.candles[0].cx + chartData.hlX) / 2 : chartData.w*0.2" y="11" text-anchor="middle" :fill="isDark?'#94a3b8':'#64748b'" font-size="7.5" font-weight="bold">
                    {{ activePattern.harmonic ? 'Harmonic Swing Leg' : (activePattern.signal.includes('Bullish')?'Prior Downtrend':activePattern.signal.includes('Bearish')?'Prior Uptrend':'Prior Trend') }}
                  </text>
                  <text :x="chartData.hlX+chartData.hlW/2" y="11" text-anchor="middle" fill="#a78bfa" font-size="7.5" font-weight="bold">{{activePattern.label}}</text>
                  <text :x="chartData.candles.length ? (chartData.hlX + chartData.hlW + chartData.candles[chartData.candles.length-1].cx) / 2 : chartData.w*0.82" y="11" text-anchor="middle" :fill="activePattern.signal.includes('Bullish')?'#10b981':activePattern.signal.includes('Bearish')?'#ef4444':'#64748b'" font-size="7.5" font-weight="bold">
                    {{ activePattern.harmonic ? (activePattern.signal.includes('Bullish') ? 'PRZ Reversal Up' : 'PRZ Reversal Down') : (activePattern.signal.includes('Bullish')?'Reversal Up':activePattern.signal.includes('Bearish')?'Reversal Down':'Continuation') }}
                  </text>

                  <!-- Marker Sinyal Konfirmasi Institusional (Panah Penunjuk Presisi) -->
                  <g v-if="chartData.confirmX && chartData.entryY !== null">
                    <template v-if="activePattern.signal.includes('Bullish')">
                      <polygon 
                        :points="`${chartData.confirmX},${chartData.confirmLow + 4} ${chartData.confirmX - 4},${chartData.confirmLow + 10} ${chartData.confirmX + 4},${chartData.confirmLow + 10}`" 
                        fill="#10b981"
                      />
                      <text :x="chartData.confirmX" :y="chartData.confirmLow + 17" text-anchor="middle" fill="#10b981" font-size="5.5" font-family="monospace" font-weight="bold">ENTRY</text>
                    </template>
                    <template v-else-if="activePattern.signal.includes('Bearish')">
                      <polygon 
                        :points="`${chartData.confirmX},${chartData.confirmHigh - 4} ${chartData.confirmX - 4},${chartData.confirmHigh - 10} ${chartData.confirmX + 4},${chartData.confirmHigh - 10}`" 
                        fill="#ef4444"
                      />
                      <text :x="chartData.confirmX" :y="chartData.confirmHigh - 12" text-anchor="middle" fill="#ef4444" font-size="5.5" font-family="monospace" font-weight="bold">CONFIRM</text>
                    </template>
                  </g>

                  <!-- Sub-panel Volume Histogram (Smart Money Confirmation) -->
                  <line x1="0" y1="106" :x2="chartData.w" y2="106" :stroke="isDark?'#ffffff15':'#00000015'" stroke-width="1"/>
                  <text x="6" y="115" :fill="isDark?'#64748b':'#94a3b8'" font-size="6" font-family="monospace" font-weight="bold">VOLUME (VSA CONFIRMATION)</text>

                  <!-- Histogram bar volume -->
                  <template v-for="(mc,mi) in chartData.candles" :key="'v'+mi">
                    <rect 
                      :x="mc.cx-mc.bw/2" 
                      :y="146 - mc.volH" 
                      :width="mc.bw" 
                      :height="mc.volH" 
                      rx="1" 
                      :fill="mc.color" 
                      :opacity="mc.isSpike ? 0.95 : (isDark ? 0.4 : 0.5)"
                    />
                    <!-- Spike dot marker -->
                    <circle v-if="mc.isSpike" :cx="mc.cx" :cy="146 - mc.volH - 2.5" r="2" fill="#f59e0b" />
                  </template>
                </svg>
              </div>

              <!-- Detail spesifik pola -->
              <div class="space-y-2.5">
                <div v-for="(s,si) in activePattern.detail" :key="si" class="p-3 rounded-lg border"
                  :class="isDark ? 'bg-white/[0.02] border-white/[0.06]' : 'bg-slate-50 border-slate-200'"
                >
                  <p class="text-[10px] font-mono font-bold uppercase tracking-wider mb-1 text-primary">{{s.title}}</p>
                  <p class="text-[11px] leading-relaxed" :class="isDark?'text-slate-300':'text-slate-700'">{{s.body}}</p>
                </div>
              </div>

              <!-- Panduan Trading Universal (Master Trader Playbook) -->
              <div class="border-t pt-4 space-y-3" :class="isDark?'border-white/[0.08]':'border-slate-200'">
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-1.5 text-[10px] font-mono font-bold uppercase tracking-wider text-amber-500">
                    <span class="material-symbols-outlined text-sm">workspace_premium</span>
                    <span>Master Trader Playbook // Doktrin Institusional</span>
                  </div>
                  <span class="text-[8px] font-mono px-2 py-0.5 rounded border border-amber-500/30 text-amber-400 bg-amber-500/10 font-bold tracking-wider">100% VALID</span>
                </div>

                <div class="space-y-2.5">
                  <div v-for="(g,gi) in tradingGuide" :key="gi" class="p-3.5 rounded-xl border transition-all"
                    :class="isDark ? 'bg-black/30 border-white/[0.06]' : 'bg-slate-50 border-slate-200'"
                  >
                    <div class="flex items-center justify-between mb-1.5">
                      <div class="flex items-center gap-2">
                        <div class="w-6 h-6 rounded-md flex items-center justify-center shrink-0 border" :class="g.tagColor">
                          <span class="material-symbols-outlined text-xs">{{ g.icon }}</span>
                        </div>
                        <div>
                          <p class="text-[10px] font-headline font-bold" :class="isDark?'text-white':'text-slate-900'">{{ g.title }}</p>
                          <p class="text-[8px] font-mono tracking-wider opacity-60 uppercase">{{ g.subtitle }}</p>
                        </div>
                      </div>
                      <span class="text-[8px] font-mono font-bold px-1.5 py-0.5 rounded border uppercase" :class="g.tagColor">{{ g.tag }}</span>
                    </div>
                    <p class="text-[11px] leading-relaxed whitespace-pre-line mt-2" :class="isDark?'text-slate-300':'text-slate-700'">{{ g.body }}</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Footer modal dengan tombol tutup -->
            <div class="p-3.5 sm:px-6 border-t shrink-0"
              :class="isDark ? 'border-white/[0.08] bg-[#0e1017]' : 'border-slate-100 bg-white'"
            >
              <button @click="activePattern=null" class="w-full py-2 rounded-lg text-xs font-mono font-bold uppercase tracking-wider border transition-colors cursor-pointer"
                :class="isDark ? 'bg-white/5 border-white/10 text-white hover:bg-white/10' : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Modal Detail Konsep (dengan ilustrasi + panduan) -->
    <Teleport to="body">
      <Transition enter-active-class="transition duration-200 ease-out" enter-from-class="opacity-0" enter-to-class="opacity-100"
        leave-active-class="transition duration-150 ease-in" leave-from-class="opacity-100" leave-to-class="opacity-0">
        <div v-if="activeConcept" class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm" @click.self="activeConcept=null">
          <div class="relative w-full max-w-lg max-h-[85vh] rounded-2xl border flex flex-col overflow-hidden shadow-2xl transition-all"
            :class="isDark ? 'bg-[#0e1017] border-white/[0.1] text-slate-100' : 'bg-white border-slate-200 text-slate-900'"
          >
            <!-- Header modal dengan ikon & tombol tutup -->
            <div class="flex items-center justify-between px-5 sm:px-6 py-3.5 border-b shrink-0"
              :class="isDark ? 'border-white/[0.08] bg-[#0e1017]' : 'border-slate-100 bg-white'"
            >
              <div class="flex items-center gap-2">
                <span class="material-symbols-outlined text-lg text-primary">{{activeConcept.icon}}</span>
                <span class="text-xs font-headline font-bold" :class="isDark ? 'text-white' : 'text-slate-900'">{{activeConcept.name}}</span>
              </div>
              <button 
                @click="activeConcept = null"
                class="w-7 h-7 rounded-lg border flex items-center justify-center transition-colors cursor-pointer"
                :class="isDark ? 'bg-white/[0.04] border-white/[0.08] text-slate-400 hover:text-white hover:bg-white/[0.08]' : 'bg-slate-100 border-slate-200 text-slate-600 hover:text-slate-900'"
                aria-label="Tutup modal"
              >
                <span class="material-symbols-outlined text-sm">close</span>
              </button>
            </div>

            <!-- Konten scrollable internal terisolasi -->
            <div class="overflow-y-auto p-5 sm:p-6 space-y-4 flex-1">
              <p class="text-xs leading-relaxed text-center" :class="isDark?'text-slate-400':'text-slate-600'">{{activeConcept.desc}}</p>

              <!-- Ilustrasi Chart SVG -->
              <div v-if="cIllust" class="rounded-xl p-3 border" :class="isDark?'bg-black/40 border-white/[0.06]':'bg-slate-50 border-slate-200'">
                <div class="flex items-center gap-1.5 mb-2 text-[9px] font-mono font-bold uppercase tracking-wider" :class="isDark ? 'text-slate-400' : 'text-slate-500'">
                  <span class="material-symbols-outlined text-xs text-primary">show_chart</span>
                  <span>Ilustrasi Visual</span>
                </div>
                <svg width="100%" viewBox="0 0 300 120" class="w-full" style="height:140px">
                  <line v-for="gy in [30,55,80]" :key="gy" x1="0" :y1="gy" x2="300" :y2="gy" :stroke="isDark?'#ffffff06':'#00000006'" stroke-width="1"/>
                  <!-- Garis Level Fibonacci Horizontal Real Case -->
                  <template v-if="cIllust.fibLevels">
                    <g v-for="(fl, fli) in cIllust.fibLevels" :key="'fl'+fli">
                      <line x1="0" :y1="fl.y" x2="300" :y2="fl.y" :stroke="fl.color" stroke-width="0.8" stroke-dasharray="3,3" opacity="0.6"/>
                      <text x="296" :y="fl.y - 2" text-anchor="end" :fill="fl.color" font-size="6.5" font-family="monospace" font-weight="bold">{{ fl.text }}</text>
                    </g>
                  </template>
                  <template v-if="cIllust.zones">
                    <rect v-for="(z,zi) in cIllust.zones" :key="'zr'+zi" x="0" :y="z.y" width="300" :height="z.h || 10" :fill="z.color" :opacity="z.opacity || 0.14" rx="2"/>
                    <line v-for="(z,zi) in cIllust.zones" :key="'zl'+zi" x1="0" :y1="z.y+(z.h?z.h/2:5)" x2="300" :y2="z.y+(z.h?z.h/2:5)" :stroke="z.color" stroke-width="1" stroke-dasharray="4,3" opacity="0.5"/>
                    <text v-for="(z,zi) in cIllust.zones" :key="'zt'+zi" x="6" :y="z.y-2" :fill="z.color" font-size="7" font-weight="bold" opacity="0.8">{{z.label}}</text>
                  </template>
                  <template v-for="(mc,mi) in cIllust.candles" :key="'cc'+mi">
                    <line :x1="mc.cx" :y1="mc.hy" :x2="mc.cx" :y2="mc.ly" :stroke="mc.color" stroke-width="1.5"/>
                    <rect :x="mc.cx-6" :y="Math.min(mc.oy,mc.cy)" width="12" :height="Math.max(2,Math.abs(mc.oy-mc.cy))" rx="1.5" :fill="mc.color" opacity="0.85"/>
                  </template>
                  <path v-if="cIllust.line" :d="cIllust.line" fill="none" stroke="#a78bfa" stroke-width="1.8" opacity="0.85" stroke-linecap="round"/>
                  <path v-if="cIllust.line2" :d="cIllust.line2" fill="none" stroke="#f59e0b" stroke-width="1.2" opacity="0.5" stroke-dasharray="3,3"/>
                  <path v-if="cIllust.line3" :d="cIllust.line3" fill="none" stroke="#f59e0b" stroke-width="1.2" opacity="0.5" stroke-dasharray="3,3"/>
                  <template v-if="cIllust.oscLine">
                    <line x1="0" y1="85" x2="300" y2="85" :stroke="isDark?'#ffffff15':'#00000010'" stroke-width="1"/>
                    <rect x="0" y="88" width="300" height="2" :fill="isDark?'#ef444420':'#ef444410'"/>
                    <rect x="0" y="112" width="300" height="2" :fill="isDark?'#10b98120':'#10b98110'"/>
                    <text x="4" y="96" fill="#ef4444" font-size="6" opacity="0.6">Overbought</text>
                    <text x="4" y="118" fill="#10b981" font-size="6" opacity="0.6">Oversold</text>
                    <path :d="cIllust.oscLine" fill="none" stroke="#a78bfa" stroke-width="1.5" opacity="0.8"/>
                  </template>
                  <text v-for="(lb,li) in (cIllust.labels||[])" :key="'lb'+li" :x="lb.x" :y="lb.y" :text-anchor="lb.anchor||'middle'" :fill="lb.color||'#94a3b8'" :font-size="lb.size||8" font-weight="bold" :font-style="lb.italic?'italic':'normal'">{{lb.text}}</text>
                </svg>
              </div>

              <!-- Detail spesifik konsep -->
              <div class="space-y-2.5">
                <div v-for="(s,si) in activeConcept.detail" :key="si" class="p-3 rounded-lg border"
                  :class="isDark ? 'bg-white/[0.02] border-white/[0.06]' : 'bg-slate-50 border-slate-200'"
                >
                  <p class="text-[10px] font-mono font-bold uppercase tracking-wider mb-1 text-primary">{{s.title}}</p>
                  <p class="text-[11px] leading-relaxed" :class="isDark?'text-slate-300':'text-slate-700'">{{s.body}}</p>
                </div>
              </div>

              <!-- Panduan Universal Konsep -->
              <div v-if="conceptGuide.length" class="border-t pt-4 space-y-2.5" :class="isDark?'border-white/[0.08]':'border-slate-200'">
                <div class="flex items-center gap-1.5 text-[10px] font-mono font-bold uppercase tracking-wider text-amber-500">
                  <span class="material-symbols-outlined text-sm">school</span>
                  <span>Panduan Praktis</span>
                </div>
                <div v-for="(g,gi) in conceptGuide" :key="gi" class="p-3 rounded-lg border"
                  :class="isDark ? 'bg-black/30 border-white/[0.06]' : 'bg-slate-50 border-slate-200'"
                >
                  <div class="flex items-center gap-1.5 mb-1 text-[10px] font-mono font-bold uppercase tracking-wider" :class="isDark?'text-slate-300':'text-slate-700'">
                    <span v-if="g.icon" class="material-symbols-outlined text-xs text-primary">{{ g.icon }}</span>
                    <span>{{ g.title }}</span>
                  </div>
                  <p class="text-[11px] leading-relaxed" :class="isDark?'text-slate-300':'text-slate-700'">{{g.body}}</p>
                </div>
              </div>
            </div>

            <!-- Footer modal dengan tombol tutup -->
            <div class="p-3.5 sm:px-6 border-t shrink-0"
              :class="isDark ? 'border-white/[0.08] bg-[#0e1017]' : 'border-slate-100 bg-white'"
            >
              <button @click="activeConcept=null" class="w-full py-2 rounded-lg text-xs font-mono font-bold uppercase tracking-wider border transition-colors cursor-pointer"
                :class="isDark ? 'bg-white/5 border-white/10 text-white hover:bg-white/10' : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'"
              >
                Tutup
              </button>
            </div>
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

interface MiniC {
  cx: number
  hy: number
  ly: number
  oy: number
  cy: number
  color: string
  bw: number
  isPat: boolean
  volH: number
  isSpike: boolean
}

interface TradingGuideItem {
  icon: string
  title: string
  subtitle: string
  tag: string
  tagColor: string
  body: string
}

interface HarmonicOverlay {
  line: string
  points: { label: string; cx: number; cy: number }[]
  fibs: { text: string; x: number; y: number }[]
  przX: number
  przY: number
}

const chartData = computed(() => {
  const p = activePattern.value
  if (!p || (!p.candles?.length && !p.harmonic)) {
    return {
      candles: [] as MiniC[],
      w: 320,
      hlX: 0,
      hlW: 0,
      srY: null as number | null,
      entryY: null as number | null,
      slY: null as number | null,
      confirmX: 0,
      confirmHigh: 0,
      confirmLow: 0
    }
  }

  // ═══ DUKUNGAN POLA HARMONIC FIBONACCI (XABCD REAL CASE) ═══
  if (p.harmonic) {
    const pts = p.harmonic.points
    const isBull = p.signal.includes('Bullish')
    
    // Normalisasi koordinat titik XABCD ke rentang canvas simulasi (Y: 22 s/d 88)
    const minY = Math.min(...pts.map(pt => pt.y))
    const maxY = Math.max(...pts.map(pt => pt.y))
    const toSimY = (y: number) => 22 + ((y - minY) / (maxY - minY || 1)) * 66

    interface RawHC { hy: number; ly: number; oy: number; cy: number; color: string; volH: number; isSpike: boolean }
    const rawHC: RawHC[] = []
    const swingCoords: { label: string; cx: number; cy: number }[] = []

    const spacing = 26
    const bw = 16

    let candleIdx = 0
    // Generate candle yang membentuk setiap kaki swing leg
    for (let k = 0; k < pts.length - 1; k++) {
      const p1 = pts[k]
      const p2 = pts[k + 1]
      const y1 = toSimY(p1.y)
      const y2 = toSimY(p2.y)
      const isLegUp = y2 < y1 // Di canvas SVG, y lebih kecil = harga lebih tinggi (naik)
      const legColor = isLegUp ? '#10b981' : '#ef4444'

      if (k === 0) {
        swingCoords.push({ label: p1.label, cx: candleIdx * spacing + spacing / 2 + 16, cy: y1 })
      }

      // Candle 1: Separuh perjalanan leg
      const midO = y1
      const midC = y1 + (y2 - y1) * 0.55
      rawHC.push({
        oy: isLegUp ? Math.max(midO, midC) : Math.min(midO, midC),
        cy: isLegUp ? Math.min(midO, midC) : Math.max(midO, midC),
        hy: Math.min(midO, midC) - 2,
        ly: Math.max(midO, midC) + 2,
        color: legColor,
        volH: 14,
        isSpike: false
      })
      candleIdx++

      // Candle 2: Mencapai titik puncak/lembah ekstrem (p2)
      const endO = midC
      const endC = y2
      rawHC.push({
        oy: isLegUp ? Math.max(endO, endC) : Math.min(endO, endC),
        cy: isLegUp ? Math.min(endO, endC) : Math.max(endO, endC),
        hy: isLegUp ? y2 : Math.min(endO, endC) - 2,
        ly: isLegUp ? Math.max(endO, endC) + 2 : y2,
        color: legColor,
        volH: 18,
        isSpike: false
      })
      swingCoords.push({ label: p2.label, cx: candleIdx * spacing + spacing / 2 + 16, cy: y2 })
      candleIdx++
    }

    // Titik D adalah titik terakhir pola Harmonic (PRZ - Potential Reversal Zone)
    const dCoord = swingCoords[swingCoords.length - 1]
    const przY = dCoord.cy
    const przX = dCoord.cx

    // Tambahkan 2 candle konfirmasi pembalikan (Reversal) setelah titik D
    const lastY = przY
    if (isBull) {
      // Reversal Up dari PRZ
      rawHC.push(
        { oy: lastY, cy: lastY - 24, hy: lastY - 26, ly: lastY + 2, color: '#10b981', volH: 38, isSpike: true },
        { oy: lastY - 24, cy: lastY - 42, hy: lastY - 45, ly: lastY - 22, color: '#10b981', volH: 26, isSpike: false }
      )
    } else {
      // Reversal Down dari PRZ
      rawHC.push(
        { oy: lastY, cy: lastY + 24, hy: lastY - 2, ly: lastY + 26, color: '#ef4444', volH: 38, isSpike: true },
        { oy: lastY + 24, cy: lastY + 42, hy: lastY + 22, ly: lastY + 45, color: '#ef4444', volH: 26, isSpike: false }
      )
    }

    const total = rawHC.length
    const W = total * spacing + 36

    const candles: MiniC[] = rawHC.map((item, i) => ({
      cx: i * spacing + spacing / 2 + 16,
      hy: Math.min(item.hy, item.ly),
      ly: Math.max(item.hy, item.ly),
      oy: item.oy,
      cy: item.cy,
      color: item.color,
      bw,
      isPat: i < total - 2,
      volH: item.volH,
      isSpike: item.isSpike
    }))

    // Bangun string path polyline X-A-B-C-D yang melewati cx dan cy swing point
    const linePath = swingCoords.map((pt, i) => `${i === 0 ? 'M' : 'L'}${pt.cx},${pt.cy}`).join(' ')

    // Skalakan posisi teks rasio Fibonacci
    const fibs = (p.harmonic.fibs || []).map((f, fi) => {
      const ptA = swingCoords[Math.min(fi, swingCoords.length - 2)]
      const ptB = swingCoords[Math.min(fi + 1, swingCoords.length - 1)]
      const fx = ptA && ptB ? (ptA.cx + ptB.cx) / 2 : 100
      const fy = ptA && ptB ? (ptA.cy + ptB.cy) / 2 - 6 : 50
      return { text: f.text, x: fx, y: fy }
    })

    const confirmCandle = candles[candles.length - 2]
    const confirmX = confirmCandle ? confirmCandle.cx : 0
    const confirmHigh = confirmCandle ? confirmCandle.hy : 0
    const confirmLow = confirmCandle ? confirmCandle.ly : 0

    return {
      candles,
      w: W,
      hlX: candles[0].cx - bw / 2 - 4,
      hlW: (dCoord.cx + bw / 2 + 4) - (candles[0].cx - bw / 2 - 4),
      srY: przY,
      entryY: confirmCandle ? confirmCandle.cy : null,
      slY: isBull ? przY + 8 : przY - 8,
      confirmX,
      confirmHigh,
      confirmLow,
      harmonicOverlay: {
        line: linePath,
        points: swingCoords,
        fibs,
        przX,
        przY
      }
    }
  }

  // ═══ DUKUNGAN POLA CANDLESTICK & CHART KLASIK ═══

  const isBull = p.signal.includes('Bullish')
  const isBear = p.signal.includes('Bearish')
  const patCandles = p.candles
  const nPat = patCandles.length

  // Proporsi studi kasus klasik (seperti di cheatsheet trading): 2-3 candle sebelum + pola + 2-3 candle sesudah
  const nBefore = nPat >= 5 ? 1 : nPat >= 3 ? 2 : 3
  const nAfter = nPat >= 5 ? 2 : 3
  const total = nBefore + nPat + nAfter

  const spacing = 28
  const bw = 18
  const W = total * spacing + 36

  // Ekstraksi koordinat batas pola asli dari kanvas 60px
  let minWick = 60, maxWick = 0
  patCandles.forEach(c => {
    if (c.wickTop < minWick) minWick = c.wickTop
    if (c.wickBot > maxWick) maxWick = c.wickBot
  })
  const patH = Math.max(16, maxWick - minWick)

  // Tentukan zona jangkar formasi pola pada kanvas simulasi (area chart: Y 18 s/d 96)
  let targetPatTop = 45
  let targetPatBot = 88
  let srLevelY = 88

  if (isBull) {
    // Bullish Reversal: Pola memantul tepat di Key Support dasar
    targetPatBot = 88
    const scH = Math.min(46, Math.max(26, patH * 0.95))
    targetPatTop = targetPatBot - scH
    srLevelY = 88
  } else if (isBear) {
    // Bearish Reversal: Pola menolak harga tepat di Key Resistance puncak
    targetPatTop = 22
    const scH = Math.min(46, Math.max(26, patH * 0.95))
    targetPatBot = targetPatTop + scH
    srLevelY = 22
  } else {
    // Netral / Continuation: Pola konsolidasi di area ekuilibrium
    targetPatTop = 36
    targetPatBot = 78
    srLevelY = 56
  }

  // Fungsi pemetaan Y untuk lilin pola menjaga rasio bodi & sumbu 100% akurat
  const mapPatY = (val: number) => {
    return targetPatTop + ((val - minWick) / (maxWick - minWick || 1)) * (targetPatBot - targetPatTop)
  }

  interface ChartItem {
    hy: number; ly: number; oy: number; cy: number;
    color: string; isPat: boolean; volH: number; isSpike: boolean
  }
  const rawItems: ChartItem[] = []

  // 1. Candle Konteks Tren Nyata Sebelum Pola (Prior Trend Case Study)
  if (isBull) {
    // Downtrend institusional nyata: tekanan jual masif menuju demand zone
    if (nBefore === 1) {
      rawItems.push({ hy: 28, oy: 32, cy: targetPatTop - 4, ly: targetPatTop - 2, color: '#ef4444', isPat: false, volH: 14, isSpike: false })
    } else if (nBefore === 2) {
      rawItems.push(
        { hy: 26, oy: 28, cy: 46, ly: 48, color: '#ef4444', isPat: false, volH: 12, isSpike: false },
        { hy: 46, oy: 48, cy: targetPatTop - 3, ly: targetPatTop, color: '#ef4444', isPat: false, volH: 16, isSpike: false }
      )
    } else {
      rawItems.push(
        { hy: 24, oy: 26, cy: 42, ly: 44, color: '#ef4444', isPat: false, volH: 12, isSpike: false },
        { hy: 42, oy: 44, cy: 62, ly: 64, color: '#ef4444', isPat: false, volH: 16, isSpike: false },
        { hy: 62, oy: 63, cy: targetPatTop - 2, ly: targetPatTop + 2, color: '#ef4444', isPat: false, volH: 14, isSpike: false }
      )
    }
  } else if (isBear) {
    // Uptrend institusional nyata: euforia buyer mendorong harga ke supply zone
    if (nBefore === 1) {
      rawItems.push({ ly: 82, oy: 78, cy: targetPatBot + 4, hy: targetPatBot + 2, color: '#10b981', isPat: false, volH: 14, isSpike: false })
    } else if (nBefore === 2) {
      rawItems.push(
        { ly: 84, oy: 82, cy: 62, hy: 60, color: '#10b981', isPat: false, volH: 12, isSpike: false },
        { ly: 62, oy: 60, cy: targetPatBot + 3, hy: targetPatBot, color: '#10b981', isPat: false, volH: 16, isSpike: false }
      )
    } else {
      rawItems.push(
        { ly: 86, oy: 84, cy: 66, hy: 64, color: '#10b981', isPat: false, volH: 12, isSpike: false },
        { ly: 66, oy: 64, cy: 46, hy: 44, color: '#10b981', isPat: false, volH: 16, isSpike: false },
        { ly: 46, oy: 45, cy: targetPatBot + 2, hy: targetPatBot - 2, color: '#10b981', isPat: false, volH: 14, isSpike: false }
      )
    }
  } else {
    // Netral / Continuation
    rawItems.push(
      { ly: 78, oy: 75, cy: 58, hy: 56, color: '#10b981', isPat: false, volH: 14, isSpike: false },
      { ly: 58, oy: 56, cy: 46, hy: 44, color: '#10b981', isPat: false, volH: 16, isSpike: false }
    )
  }

  // 2. Lilin Formasi Pola (Pattern Formation dengan Anatomi 100% Valid)
  patCandles.forEach((pc, i) => {
    const isG = pc.color === '#10b981'
    const hy = mapPatY(pc.wickTop)
    const ly = mapPatY(pc.wickBot)
    const oy = mapPatY(isG ? pc.bodyBot : pc.bodyTop)
    const cy = mapPatY(isG ? pc.bodyTop : pc.bodyBot)
    const isKeyCandle = i === nPat - 1
    const volH = isKeyCandle ? 24 : 15
    rawItems.push({ hy, ly, oy, cy, color: pc.color, isPat: true, volH, isSpike: false })
  })

  // 3. Konfirmasi & Kelanjutan Tren Nyata Sesudah Pola (Post-Pattern Confirmation)
  if (isBull) {
    // Reversal Up: Candle konfirmasi hijau panjang membobol resistance lokal + volume spike
    const lastPat = rawItems[rawItems.length - 1]
    const entryStart = Math.min(80, Math.max(58, lastPat.cy + 2))
    rawItems.push(
      // Candle Konfirmasi (Breakout Entry)
      { hy: 38, cy: 40, oy: entryStart, ly: entryStart + 3, color: '#10b981', isPat: false, volH: 36, isSpike: true },
      // Candle Lanjutan 1 (Higher High)
      { hy: 24, cy: 26, oy: 40, ly: 42, color: '#10b981', isPat: false, volH: 22, isSpike: false }
    )
    if (nAfter >= 3) {
      rawItems.push(
        // Candle Lanjutan 2 (Uptrend Expansion)
        { hy: 14, cy: 16, oy: 25, ly: 27, color: '#10b981', isPat: false, volH: 18, isSpike: false }
      )
    }
  } else if (isBear) {
    // Reversal Down: Candle konfirmasi merah panjang membanting support lokal + volume spike
    const lastPat = rawItems[rawItems.length - 1]
    const exitStart = Math.max(30, Math.min(50, lastPat.cy - 2))
    rawItems.push(
      // Candle Konfirmasi (Breakdown Exit)
      { hy: exitStart - 3, oy: exitStart, cy: 70, ly: 72, color: '#ef4444', isPat: false, volH: 36, isSpike: true },
      // Candle Lanjutan 1 (Lower Low)
      { hy: 69, oy: 70, cy: 84, ly: 86, color: '#ef4444', isPat: false, volH: 22, isSpike: false }
    )
    if (nAfter >= 3) {
      rawItems.push(
        // Candle Lanjutan 2 (Downtrend Sell-off)
        { hy: 83, oy: 84, cy: 94, ly: 96, color: '#ef4444', isPat: false, volH: 18, isSpike: false }
      )
    }
  } else {
    // Netral / Continuation
    rawItems.push(
      { hy: 32, cy: 34, oy: 48, ly: 50, color: '#10b981', isPat: false, volH: 32, isSpike: true },
      { hy: 20, cy: 22, oy: 33, ly: 35, color: '#10b981', isPat: false, volH: 20, isSpike: false }
    )
  }

  // Petakan ke array candles dengan koordinat X simetris & proporsional
  const candles: MiniC[] = rawItems.map((item, i) => ({
    cx: i * spacing + spacing / 2 + 18,
    hy: Math.min(item.hy, item.ly),
    ly: Math.max(item.hy, item.ly),
    oy: item.oy,
    cy: item.cy,
    color: item.color,
    bw,
    isPat: item.isPat,
    volH: item.volH,
    isSpike: item.isSpike
  }))

  const hlStartIndex = nBefore
  const hlEndIndex = nBefore + nPat - 1
  const hlX = candles[hlStartIndex].cx - bw / 2 - 5
  const hlW = (candles[hlEndIndex].cx + bw / 2 + 5) - hlX

  // Level Support / Resistance dan Sinyal Sniper Presisi
  const confirmIndex = nBefore + nPat
  const confirmCandle = candles[confirmIndex]
  let confirmX = 0, confirmHigh = 0, confirmLow = 0, entryY: number | null = null

  if (confirmCandle) {
    confirmX = confirmCandle.cx
    confirmHigh = confirmCandle.hy
    confirmLow = confirmCandle.ly
    entryY = confirmCandle.cy
  }

  return {
    candles,
    w: W,
    hlX,
    hlW,
    srY: srLevelY,
    entryY,
    slY: isBull ? srLevelY + 6 : srLevelY - 6,
    confirmX,
    confirmHigh,
    confirmLow
  }
})

// ─── Master Trader Playbook: 5 Pilar Institusional ───
const tradingGuide = computed<TradingGuideItem[]>(() => {
  const p = activePattern.value
  if (!p) return []
  const isBull = p.signal.includes('Bullish')
  const isBear = p.signal.includes('Bearish')
  const isCont = p.signal === 'Continuation'

  if (isBull) return [
    {
      icon: 'psychology',
      title: 'Dinamika Smart Money & Psikologi Pasar',
      subtitle: 'Market Maker Accumulation Phase',
      tag: 'Smart Money',
      tagColor: isDark.value ? 'bg-violet-500/15 text-violet-400 border-violet-500/30' : 'bg-violet-50 text-violet-600 border-violet-200',
      body: 'Retail panik menjual di dasar tren (panic selling & capitulation). Di fase ini, Smart Money (institusi & market maker) tidak membiarkan harga jatuh lebih dalam, melainkan menyerap seluruh antrean jual secara bertahap (liquidity absorption). Pola ini menandakan pasokan seller telah habis dan buyer institusional mulai mengambil kendali penuh atas pasar.'
    },
    {
      icon: 'fact_check',
      title: 'Checklist Validitas 100% (Konfirmasi Mutlak)',
      subtitle: 'Institutional Validity Filter',
      tag: 'Checklist',
      tagColor: isDark.value ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' : 'bg-emerald-50 text-emerald-600 border-emerald-200',
      body: '1. Lokasi Struktural: Wajib muncul di akhir downtrend yang matang atau tepat memantul di Key Support/Demand Zone harian.\n2. Volume Spike (VSA): Candle pembalikan atau candle berikutnya HARUS disertai lonjakan volume transaksi di atas rata-rata 20 periode sebagai bukti partisipasi modal besar.\n3. Konfirmasi Close: Wajib menunggu 1 candle berikutnya close HIJAU solid melewati level high pola sebelum menekan tombol Buy.'
    },
    {
      icon: 'my_location',
      title: 'Eksekusi Sniper: Entry, Stop Loss & Take Profit',
      subtitle: 'Precision Order Execution',
      tag: 'Execution',
      tagColor: isDark.value ? 'bg-sky-500/15 text-sky-400 border-sky-500/30' : 'bg-sky-50 text-sky-600 border-sky-200',
      body: '• Entry: Buy saat candle konfirmasi close, atau pasang Buy Limit di level 50% retracement body pola (retest entry).\n• Stop Loss (SL): Pasang 1-2 tick di bawah swing low terendah pola. Jika level ini tertembus, skenario batal seketika — cut loss tanpa kompromi!\n• Take Profit (TP): TP 1 di Resistance terdekat (minimal Risk:Reward 1:2). TP 2 pasang trailing stop membiarkan sisa posisi melaju mengikuti tren baru.'
    },
    {
      icon: 'warning',
      title: 'Jebakan Maut Retail (Trap Alert)',
      subtitle: 'Retail Liquidity Trap',
      tag: 'Trap Alert',
      tagColor: isDark.value ? 'bg-rose-500/15 text-rose-400 border-rose-500/30' : 'bg-rose-50 text-rose-600 border-rose-200',
      body: 'Waspadai pantulan semu (Dead Cat Bounce) jika pola terbentuk tanpa lonjakan volume. Bandar sering kali memompa harga sesaat untuk memancing pembeli retail (FOMO buy) di tengah tren turun tanpa akumulasi sungguhan, lalu membanting harga kembali untuk menyapu Stop Loss (Liquidity Hunt).'
    },
    {
      icon: 'verified',
      title: 'Mandat Disiplin Trader Kakap',
      subtitle: 'Capital Preservation Protocol',
      tag: 'Golden Rule',
      tagColor: isDark.value ? 'bg-amber-500/15 text-amber-400 border-amber-500/30' : 'bg-amber-50 text-amber-600 border-amber-200',
      body: 'Trading adalah bisnis probabilitas dan manajemen risiko, bukan perjudian tebak harga. Batasi risiko maksimal 1-2% dari total modal per transaksi. Jangan pernah menambah posisi rugi (average down) pada pola yang gagal!'
    }
  ]

  if (isBear) return [
    {
      icon: 'psychology',
      title: 'Dinamika Smart Money & Distribusi Pasar',
      subtitle: 'Smart Money Distribution Phase',
      tag: 'Smart Money',
      tagColor: isDark.value ? 'bg-violet-500/15 text-violet-400 border-violet-500/30' : 'bg-violet-50 text-violet-600 border-violet-200',
      body: 'Harga sengaja didorong naik ke puncak (euforia publik / FOMO retail). Di saat retail berebut membeli di harga tertinggi, Smart Money diam-diam mendistribusikan kepemilikan jutaan lembar secara masif ke pasar. Ekor atas panjang atau penolakan harga adalah jejak nyata institusi yang sedang keluar dari pasar.'
    },
    {
      icon: 'fact_check',
      title: 'Checklist Validitas 100% (Konfirmasi Mutlak)',
      subtitle: 'Institutional Validity Filter',
      tag: 'Checklist',
      tagColor: isDark.value ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' : 'bg-emerald-50 text-emerald-600 border-emerald-200',
      body: '1. Lokasi Struktural: Terbentuk di puncak uptrend yang sudah overextended atau tepat membentur Key Resistance/Supply Zone.\n2. Volume Distribusi: Volume sangat tinggi saat harga gagal naik lebih tinggi (churning / absorption failure).\n3. Konfirmasi Candle: Wajib ditutup MERAH solid di bawah low pola sebelum memutuskan exit atau sell.'
    },
    {
      icon: 'my_location',
      title: 'Eksekusi Sniper: Exit & Risk Protocol',
      subtitle: 'Capital Exit & Short Strategy',
      tag: 'Execution',
      tagColor: isDark.value ? 'bg-sky-500/15 text-sky-400 border-sky-500/30' : 'bg-sky-50 text-sky-600 border-sky-200',
      body: '• Pemegang Saham: Segera amankan profit (Take Profit) saat candle konfirmasi jebol ke bawah. Jangan biarkan profit berubah menjadi rugi.\n• Swing Trader: Hindari spekulasi beli. Jangan sekali-kali mencoba menangkap pisau jatuh saat institusi sedang melepas barang.\n• Stop Loss (jika Short): 1-2 tick di atas level tertinggi (high) pola.'
    },
    {
      icon: 'warning',
      title: 'Jebakan Maut Retail (Bull Trap Alert)',
      subtitle: 'Bull Trap & Stop Hunt Mechanics',
      tag: 'Trap Alert',
      tagColor: isDark.value ? 'bg-rose-500/15 text-rose-400 border-rose-500/30' : 'bg-rose-50 text-rose-600 border-rose-200',
      body: 'Waspada false breakout sesaat melewati resistance. Market maker sering menyundul harga sedikit ke atas resistance untuk memancing pembeli breakout dan memicu buy-stop order, lalu membanting harga dengan keras dalam hitungan menit (Upthrust / Bull Trap).'
    },
    {
      icon: 'verified',
      title: 'Mandat Disiplin Trader Kakap',
      subtitle: 'Protecting Realized Gains',
      tag: 'Golden Rule',
      tagColor: isDark.value ? 'bg-amber-500/15 text-amber-400 border-amber-500/30' : 'bg-amber-50 text-amber-600 border-amber-200',
      body: 'Mengamankan profit adalah kebijaksanaan tertinggi. Lebih baik membawa pulang uang tunai dan menyaksikan harga terbang lagi daripada terjebak nyangkut bertahun-tahun di pucuk karena keserakahan semu.'
    }
  ]

  if (isCont) return [
    {
      icon: 'psychology',
      title: 'Dinamika Smart Money & Re-Akumulasi',
      subtitle: 'Re-Accumulation & Pause Phase',
      tag: 'Smart Money',
      tagColor: isDark.value ? 'bg-violet-500/15 text-violet-400 border-violet-500/30' : 'bg-violet-50 text-violet-600 border-violet-200',
      body: 'Tren yang sehat selalu membutuhkan jeda istirahat (pullback/konsolidasi). Smart Money mengeringkan pasokan dengan membiarkan harga bergerak menyempit tanpa merusak struktur tren utama. Pola ini membuktikan bahwa penawaran pasar telah habis diserap, bersiap melesat ke gelombang ekspansi berikutnya.'
    },
    {
      icon: 'fact_check',
      title: 'Checklist Validitas 100% (Konfirmasi Mutlak)',
      subtitle: 'Continuation Validity Filter',
      tag: 'Checklist',
      tagColor: isDark.value ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' : 'bg-emerald-50 text-emerald-600 border-emerald-200',
      body: '1. Tren Dominan: Tren sebelum pola HARUS kuat dan searah (prior trend impulse).\n2. Volume Mengering (Dry Up): Volume transaksi wajib menyusut drastis selama fase konsolidasi berlangsung.\n3. Breakout Volume Explosion: Saat batas pola tertembus, volume wajib melonjak tajam (Volume Spike > 1.5x rata-rata).'
    },
    {
      icon: 'my_location',
      title: 'Eksekusi Sniper: Breakout & Pullback Entry',
      subtitle: 'Momentum Expansion Entry',
      tag: 'Execution',
      tagColor: isDark.value ? 'bg-sky-500/15 text-sky-400 border-sky-500/30' : 'bg-sky-50 text-sky-600 border-sky-200',
      body: '• Entry: Buy on Breakout saat candle menembus batas atas konsolidasi, atau tunggu Pullback Retest ke level breakout yang baru saja ditembus.\n• Stop Loss: Pasang tepat di bawah swing low konsolidasi terdekat.\n• Target Profit: Measured Move — proyeksikan tinggi tiang tren sebelumnya (impulse wave) dari titik breakout.'
    },
    {
      icon: 'warning',
      title: 'Jebakan Maut Retail (False Breakout Trap)',
      subtitle: 'Low Volume Breakout Trap',
      tag: 'Trap Alert',
      tagColor: isDark.value ? 'bg-rose-500/15 text-rose-400 border-rose-500/30' : 'bg-rose-50 text-rose-600 border-rose-200',
      body: 'Jangan pernah masuk breakout jika volumenya tipis atau di bawah rata-rata! Breakout tanpa volume institusi 80% berujung gagal dan berbalik masuk kembali ke dalam range (failed breakout). Selalu tunggu candle close konfirmasi di luar range.'
    },
    {
      icon: 'verified',
      title: 'Mandat Disiplin Trader Kakap',
      subtitle: 'Trend Riding Discipline',
      tag: 'Golden Rule',
      tagColor: isDark.value ? 'bg-amber-500/15 text-amber-400 border-amber-500/30' : 'bg-amber-50 text-amber-600 border-amber-200',
      body: 'Trend is your friend until the bend at the end. Jangan pernah mencoba melawan arus deras tren besar hanya demi mengejar profit sesaat. Selancarlah searah aliran dana institusional.'
    }
  ]

  // Netral / Indecision
  return [
    {
      icon: 'psychology',
      title: 'Dinamika Pasar & Ekuilibrium Likuiditas',
      subtitle: 'Market Indecision & Equilibrium',
      tag: 'Smart Money',
      tagColor: isDark.value ? 'bg-violet-500/15 text-violet-400 border-violet-500/30' : 'bg-violet-50 text-violet-600 border-violet-200',
      body: 'Kekuatan pembeli dan penjual berada dalam keseimbangan sementara (impasse). Pasar sedang mencerna berita atau menunggu rilis katalis makroekonomi berikutnya. Smart Money sedang mengamati respons likuiditas sebelum menentukan arah dorongan berikutnya.'
    },
    {
      icon: 'fact_check',
      title: 'Checklist Validitas 100% (Konfirmasi Mutlak)',
      subtitle: 'Indecision Trigger Filter',
      tag: 'Checklist',
      tagColor: isDark.value ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' : 'bg-emerald-50 text-emerald-600 border-emerald-200',
      body: '1. Lokasi adalah Segalanya: Doji di area Support berbobot potensi bullish; Doji di pucuk Resistance berbobot potensi bearish. Di tengah range tidak bernilai sama sekali (noise).\n2. Dilarang Berasumsi: Pola netral TIDAK BOLEH dijadikan sinyal eksekusi mandiri.\n3. Wajib Menunggu Pemenang: Tunggu candle ekspansi arah berikutnya (High/Low Doji ditembus solid).'
    },
    {
      icon: 'my_location',
      title: 'Eksekusi Sniper: Tactical Wait & See',
      subtitle: 'Patient Capital Preservation',
      tag: 'Execution',
      tagColor: isDark.value ? 'bg-sky-500/15 text-sky-400 border-sky-500/30' : 'bg-sky-50 text-sky-600 border-sky-200',
      body: '• Strategi: Cash is a Position! Duduk tenang dan biarkan retail amatir saling membantai di zona ketidakpastian.\n• Trigger Setup: Pasang Buy Stop 1 tick di atas high pola dan Sell Stop 1 tick di bawah low pola.\n• Stop Loss: Sisi berlawanan dari breakout candle.'
    },
    {
      icon: 'warning',
      title: 'Jebakan Maut Retail (Whipsaw Trap)',
      subtitle: 'Choppy Zone Churning',
      tag: 'Trap Alert',
      tagColor: isDark.value ? 'bg-rose-500/15 text-rose-400 border-rose-500/30' : 'bg-rose-50 text-rose-600 border-rose-200',
      body: 'Bahaya terbesar pada pola netral adalah Whipsaw (cambukan harga bolak-balik). Memaksa bertransaksi di dalam pola sempit hanya akan menguras saldo modal akibat biaya komisi dan terpicunya Stop Loss berulang kali.'
    },
    {
      icon: 'verified',
      title: 'Mandat Disiplin Trader Kakap',
      subtitle: 'Patience As An Edge',
      tag: 'Golden Rule',
      tagColor: isDark.value ? 'bg-amber-500/15 text-amber-400 border-amber-500/30' : 'bg-amber-50 text-amber-600 border-amber-200',
      body: 'Trader institusional dibayar bukan untuk sering bertransaksi, melainkan untuk sabar menunggu momen setup berkualitas A+. Jika setup tidak memenuhi kriteria 100%, jangan sentuh tombol order sama sekali.'
    }
  ]
})

// ─── Ilustrasi SVG untuk Konsep (procedural per kategori) ───
interface IllustC { cx:number; hy:number; ly:number; oy:number; cy:number; color:string }
interface IllustZone { y:number; color:string; label:string; h?:number; opacity?:number }
interface IllustLabel { x:number; y:number; text:string; color?:string; size?:number; anchor?:string; italic?:boolean }
interface IllustFibLevel { y:number; text:string; color:string }

const cIllust = computed(() => {
  const c = activeConcept.value
  const cat = activeConceptCat.value
  if (!c) return null
  const rng = seededRng(c.name)

  // Real Case Candlestick Khusus Fibonacci Retracement & Extension
  if (c.name.includes('Fibonacci')) {
    const f100 = 22
    const f786 = 36.1
    const f618 = 47.2 // Golden Ratio 61.8%
    const f500 = 55.0 // Equilibrium 50%
    const f382 = 62.8
    const f236 = 72.4
    const f000 = 88.0

    // Candle 0-3: Dorongan turun tajam dari Swing High (100%) ke Swing Low (0%)
    // Candle 4-5: Konsolidasi lantai di 0.0%
    // Candle 6-9: Retracement rally mendaki ke Golden Ratio 61.8%
    // Candle 10: Rejection Shooting Star di Golden Ratio 61.8%
    // Candle 11-15: Breakdown reversal down melanjutkan tren utama
    const fibRaw: { o: number; h: number; l: number; c: number; color: string }[] = [
      { o: 24, h: 22, c: 38, l: 40, color: '#ef4444' },
      { o: 38, h: 36, c: 54, l: 56, color: '#ef4444' },
      { o: 54, h: 52, c: 72, l: 74, color: '#ef4444' },
      { o: 72, h: 70, c: 86, l: 88, color: '#ef4444' },
      { o: 86, h: 84, c: 84, l: 88, color: '#10b981' },
      { o: 84, h: 82, c: 78, l: 86, color: '#10b981' },
      { o: 78, h: 72, c: 70, l: 80, color: '#10b981' },
      { o: 70, h: 62, c: 60, l: 72, color: '#10b981' },
      { o: 60, h: 54, c: 52, l: 62, color: '#10b981' },
      { o: 52, h: 46, c: 48, l: 54, color: '#10b981' },
      { o: 48, h: 46, c: 52, l: 54, color: '#ef4444' }, // Rejection di 61.8%
      { o: 52, h: 50, c: 64, l: 66, color: '#ef4444' },
      { o: 64, h: 62, c: 76, l: 78, color: '#ef4444' },
      { o: 76, h: 74, c: 88, l: 90, color: '#ef4444' },
      { o: 88, h: 86, c: 96, l: 98, color: '#ef4444' },
      { o: 96, h: 94, c: 104, l: 106, color: '#ef4444' }
    ]

    const sp = 300 / 16
    const candles: IllustC[] = fibRaw.map((p, i) => ({
      cx: i * sp + sp / 2,
      hy: p.h, ly: p.l, oy: p.o, cy: p.c,
      color: p.color
    }))

    const fibLevels: IllustFibLevel[] = [
      { y: f100, text: '100.0% (High)', color: '#94a3b8' },
      { y: f786, text: '78.6%', color: '#64748b' },
      { y: f618, text: '61.8% [GOLDEN RATIO]', color: '#f59e0b' },
      { y: f500, text: '50.0% [EQUILIBRIUM]', color: '#10b981' },
      { y: f382, text: '38.2%', color: '#64748b' },
      { y: f236, text: '23.6%', color: '#64748b' },
      { y: f000, text: '0.0% (Low)', color: '#94a3b8' }
    ]

    const zones: IllustZone[] = [
      { y: f618, h: f500 - f618, color: '#f59e0b', label: 'GOLDEN RATIO ZONE (50% - 61.8%)', opacity: 0.22 }
    ]

    const line = `M${candles[0].cx},${f100} L${candles[3].cx},${f000}`
    const line2 = `M${candles[3].cx},${f000} L${candles[10].cx},${f618}`

    const labels: IllustLabel[] = [
      { x: candles[10].cx, y: f618 - 8, text: 'Reversal Entry (Bounce 61.8%)', color: '#f59e0b', size: 7.5 },
      { x: candles[0].cx, y: f100 - 5, text: 'High', color: '#94a3b8', size: 7 },
      { x: candles[3].cx, y: f000 + 10, text: 'Low', color: '#94a3b8', size: 7 }
    ]

    return { candles, zones, line, line2, line3: '', oscLine: '', labels, fibLevels }
  }

  // Buat candle chart dasar (16 candle proporsional dan jelas)
  const raw: { o: number; h: number; l: number; c: number }[] = []
  let pr = 55

  const isUptrend = c.name.includes('Uptrend')
  const isDowntrend = c.name.includes('Downtrend')
  const isOnlySupport = c.name.startsWith('Support') && !c.name.includes('Resistance')
  const isOnlyResistance = c.name.startsWith('Resistance')

  for (let i = 0; i < 16; i++) {
    let dir = 0
    if (isUptrend) {
      // Struktur Higher Highs & Higher Lows nyata
      dir = (i % 4 === 3) ? -1.5 : (1.8 + rng() * 1.5)
    } else if (isDowntrend) {
      // Struktur Lower Highs & Lower Lows nyata
      dir = (i % 4 === 3) ? 1.5 : (-1.8 - rng() * 1.5)
    } else if (isOnlySupport) {
      // Gelombang memantul dari lantai support
      const phase = Math.sin((i / 15) * Math.PI * 2.5)
      dir = phase * 2.5 + (rng() - 0.5) * 1.5
    } else if (isOnlyResistance) {
      // Gelombang tertolak dari atap resistance
      const phase = -Math.sin((i / 15) * Math.PI * 2.5)
      dir = phase * 2.5 + (rng() - 0.5) * 1.5
    } else {
      dir = (rng() > 0.5 ? 1 : -1) * (0.5 + rng() * 2.5)
    }
    const o = pr
    const cc = o + dir + (rng() - 0.5) * 1.5
    raw.push({ o, c: cc, h: Math.max(o, cc) + rng() * 2.5, l: Math.min(o, cc) - rng() * 2.5 })
    pr = cc
  }
  let minP = Infinity, maxP = -Infinity
  raw.forEach(p => { if (p.l < minP) minP = p.l; if (p.h > maxP) maxP = p.h })
  const rr = maxP - minP || 1
  const toY = (v: number) => 80 - ((v - minP) / rr) * 65 - 5
  const sp = 300 / 16
  const candles: IllustC[] = raw.map((p, i) => ({
    cx: i * sp + sp / 2, hy: toY(p.h), ly: toY(p.l), oy: toY(p.o), cy: toY(p.c),
    color: p.c > p.o ? '#10b981' : '#ef4444'
  }))

  let zones: IllustZone[] | null = null
  let line = '', line2 = '', line3 = '', oscLine = ''
  const labels: IllustLabel[] = []

  if (cat.includes('Price Action')) {
    if (isUptrend) {
      // Trendline Support miring naik
      line = `M${candles[0].cx},${candles[0].ly + 4} L${candles[15].cx},${candles[15].ly + 4}`
      labels.push(
        { x: 60, y: 14, text: 'Higher Highs (HH)', color: '#10b981', size: 7 },
        { x: 200, y: 14, text: 'Higher Lows (HL)', color: '#10b981', size: 7 },
        { x: 280, y: candles[15].ly + 10, text: 'Trendline Support', color: '#10b981', size: 6.5, anchor: 'end' }
      )
    } else if (isDowntrend) {
      // Trendline Resistance miring turun
      line = `M${candles[0].cx},${candles[0].hy - 4} L${candles[15].cx},${candles[15].hy - 4}`
      labels.push(
        { x: 60, y: 14, text: 'Lower Highs (LH)', color: '#ef4444', size: 7 },
        { x: 200, y: 14, text: 'Lower Lows (LL)', color: '#ef4444', size: 7 },
        { x: 280, y: candles[15].hy - 8, text: 'Trendline Resistance', color: '#ef4444', size: 6.5, anchor: 'end' }
      )
    } else if (isOnlySupport) {
      const minL = Math.max(...candles.map(c => c.ly))
      zones = [{ y: minL - 2, color: '#10b981', label: 'SUPPORT (DEMAND FLOOR)' }]
      labels.push({ x: 150, y: minL - 8, text: 'Harga Memantul dari Support (Bounce)', color: '#10b981', size: 7.5 })
    } else if (isOnlyResistance) {
      const maxH = Math.min(...candles.map(c => c.hy))
      zones = [{ y: maxH - 2, color: '#ef4444', label: 'RESISTANCE (SUPPLY CEILING)' }]
      labels.push({ x: 150, y: maxH + 14, text: 'Harga Reject di Resistance (Reversal)', color: '#ef4444', size: 7.5 })
    } else {
      // Zona Support & Resistance umum
      const mids = raw.map(p => (p.o + p.c) / 2).sort((a, b) => a - b)
      const sLvl = mids[Math.floor(mids.length * 0.2)]
      const rLvl = mids[Math.floor(mids.length * 0.8)]
      zones = [
        { y: toY(sLvl) - 5, color: '#10b981', label: 'Support Zone' },
        { y: toY(rLvl) - 5, color: '#ef4444', label: 'Resistance Zone' }
      ]
      labels.push(
        { x: 280, y: toY(sLvl) + 3, text: 'Buyer Masuk', color: '#10b981', size: 7, anchor: 'end' },
        { x: 280, y: toY(rLvl) + 3, text: 'Seller Masuk', color: '#ef4444', size: 7, anchor: 'end' }
      )
    }
  } else if (cat.includes('Indikator')) {
    // Deteksi tipe indikator
    const isOsc = ['RSI', 'Stochastic', 'CCI', 'Williams', 'Momentum', 'ROC', 'TSI', 'Ultimate', 'Awesome', 'DPO', 'KST', 'MFI', 'Force', 'Klinger', 'Chaikin'].some(o => c.name.includes(o))
    const isBand = ['Bollinger', 'Keltner', 'Donchian', 'Channel'].some(o => c.name.includes(o))

    if (isOsc) {
      // Oscillator subplot (RSI-like)
      const oscVals: number[] = []
      let ov = 50
      for (let i = 0; i < 16; i++) {
        ov += (rng() - 0.48) * 15
        ov = Math.max(15, Math.min(85, ov))
        oscVals.push(ov)
      }
      oscLine = oscVals.map((v, i) => `${i === 0 ? 'M' : 'L'}${candles[i].cx},${112 - v * 0.3}`).join(' ')
      labels.push({ x: 150, y: 96, text: c.name.split('(')[0].trim(), color: '#a78bfa', size: 7 })
    } else if (isBand) {
      // Band overlay (upper + lower)
      const ma: number[] = []
      for (let i = 0; i < 16; i++) {
        const s = Math.max(0, i - 4)
        ma.push(raw.slice(s, i + 1).reduce((a, p) => a + (p.o + p.c) / 2, 0) / (i - s + 1))
      }
      const bw = 4 + rng() * 3
      line2 = ma.map((v, i) => `${i === 0 ? 'M' : 'L'}${candles[i].cx},${toY(v + bw + rng() * 1.5)}`).join(' ')
      line3 = ma.map((v, i) => `${i === 0 ? 'M' : 'L'}${candles[i].cx},${toY(v - bw - rng() * 1.5)}`).join(' ')
      line = ma.map((v, i) => `${i === 0 ? 'M' : 'L'}${candles[i].cx},${toY(v)}`).join(' ')
      labels.push({ x: 260, y: 16, text: 'Upper Band', color: '#f59e0b', size: 7 }, { x: 260, y: 78, text: 'Lower Band', color: '#f59e0b', size: 7 })
    } else {
      // MA overlay line
      const prd = c.name.includes('EMA') ? 4 : 6
      const ma: number[] = []
      for (let i = 0; i < 16; i++) {
        const s = Math.max(0, i - prd + 1)
        ma.push(raw.slice(s, i + 1).reduce((a, p) => a + (p.o + p.c) / 2, 0) / (i - s + 1))
      }
      line = ma.map((v, i) => `${i === 0 ? 'M' : 'L'}${candles[i].cx},${toY(v)}`).join(' ')
      labels.push({ x: candles[15].cx, y: toY(ma[15]) - 6, text: c.name.split('(')[0].trim(), color: '#a78bfa', size: 7, anchor: 'end' })
    }
  } else {
    // Teori & Jenis Chart: MA line + label fase
    const ma: number[] = []
    for (let i = 0; i < 16; i++) {
      const s = Math.max(0, i - 5)
      ma.push(raw.slice(s, i + 1).reduce((a, p) => a + (p.o + p.c) / 2, 0) / (i - s + 1))
    }
    line = ma.map((v, i) => `${i === 0 ? 'M' : 'L'}${candles[i].cx},${toY(v)}`).join(' ')
    if (cat.includes('Teori')) {
      labels.push({ x: 50, y: 12, text: 'Fase 1', color: '#64748b', size: 7, italic: true }, { x: 150, y: 12, text: 'Fase 2', color: '#64748b', size: 7, italic: true }, { x: 250, y: 12, text: 'Fase 3', color: '#64748b', size: 7, italic: true })
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
    { icon:'explore', title:'Cara Menentukan', body:'Cari level harga di mana harga memantul minimal 2-3 kali. Semakin sering diuji (disentuh tapi tidak tembus), semakin kuat level tersebut. Gunakan timeframe lebih tinggi (Daily/Weekly) untuk level utama.' },
    { icon:'login', title:'Cara Trading', body:'BUY: Saat harga mendekati support + muncul candle reversal bullish (hammer, engulfing). SELL: Saat harga mendekati resistance + muncul candle reversal bearish. Selalu tunggu KONFIRMASI — jangan entry hanya karena menyentuh level.' },
    { icon:'calculate', title:'Contoh Perhitungan', body:'Misal stocks BBCA memantul 3x di harga 8.500 (support) dan ditolak 3x di 9.200 (resistance). Range = 700. Entry beli: 8.550 setelah hammer. Stop loss: 8.450 (di bawah support). Target: 9.150 (dekat resistance). Risk = 100, Reward = 600. Risk:Reward = 1:6 — sangat baik!' },
    { icon:'warning', title:'Peringatan', body:'Level yang sering diuji AKHIRNYA akan ditembus. Saat tembus, level berubah peran (support → resistance, resistance → support). Jangan keras kepala mempertahankan level yang sudah break.' },
  ]
  if (cat.includes('Indikator')) return [
    { icon:'calculate', title:'Contoh Perhitungan', body:`Misal indikator ${c.name.split('(')[0].trim()}: Jika menggunakan periode 14, ambil data 14 hari terakhir. Hitung sesuai rumus indikator. Contoh SMA 14 = (Harga hari 1 + hari 2 + ... + hari 14) ÷ 14. Jika total = 140.000, maka SMA = 10.000. Besok: buang hari terlama, tambah hari baru.` },
    { icon:'insights', title:'Cara Membaca Sinyal', body:'Aturan umum: (1) Crossover — saat garis indikator memotong garis sinyal/level tertentu = sinyal entry/exit. (2) Divergence — indikator bergerak berlawanan dengan harga = peringatan dini reversal. (3) Overbought/Oversold — indikator di zona ekstrem = potensi pembalikan.' },
    { icon:'hub', title:'Kombinasi Terbaik', body:'Jangan gunakan 1 indikator saja! Kombinasi yang populer: (1) Trend indicator (MA/Supertrend) + Momentum (RSI/MACD) untuk konfirmasi. (2) Bollinger Bands + RSI: harga sentuh band bawah + RSI <30 = sinyal beli kuat. (3) MACD crossover + Volume naik = konfirmasi tren baru.' },
    { icon:'warning', title:'Kesalahan Umum', body:'(1) Terlalu banyak indikator = "analysis paralysis". Cukup 2-3. (2) Menggunakan indikator yang sama jenisnya (misalnya RSI + Stochastic = redundan, keduanya momentum). (3) Tidak memahami bahwa indikator LAGGING — mereka mengikuti harga, bukan memprediksi.' },
  ]
  if (cat.includes('Teori')) return [
    { icon:'menu_book', title:'Prinsip Utama', body:'Setiap teori/metode di atas adalah KERANGKA BERPIKIR, bukan formula ajaib. Mereka membantu menyusun analisis secara sistematis. Gunakan sebagai panduan, bukan aturan kaku. Konfirmasi selalu dengan price action (candle pattern) dan volume.' },
    { icon:'architecture', title:'Contoh Aplikasi', body:'Misal menggunakan Fibonacci Retracement: Harga naik dari 1.000 ke 2.000 (range 1.000). Level 61.8% = 2.000 - (1.000 × 0.618) = 1.382. Artinya jika harga koreksi ke 1.382, itu area potensial untuk rebound. Tunggu candle bullish di level ini untuk entry.' },
    { icon:'warning', title:'Keterbatasan', body:'Tidak ada teori yang 100% akurat. Elliott Wave sangat subjektif (beda analis beda hitungan). Fibonacci bukan sains eksak — ini "area", bukan titik pasti. Wyckoff butuh pengalaman bertahun-tahun. Mulai dari yang sederhana (Dow Theory, Fibonacci) sebelum yang kompleks.' },
  ]
  if (cat.includes('Chart')) return [
    { icon:'schedule', title:'Kapan Digunakan', body:'Setiap jenis chart memiliki kekuatan unik. Candlestick = paling populer, detail OHLC lengkap. Heikin Ashi = melihat tren tanpa noise. Renko = murni pergerakan harga tanpa waktu. Pilih berdasarkan gaya trading: scalper → Tick Chart, swing trader → Candlestick/Heikin Ashi.' },
    { icon:'check_circle', title:'Kelebihan', body:'Chart alternatif seperti Renko dan Kagi sangat baik untuk filter noise dan melihat tren bersih. P&F chart sangat baik untuk menentukan target harga. Volume chart (Tick, CandleVolume) menunjukkan aktivitas pasar yang sesungguhnya.' },
    { icon:'warning', title:'Kekurangan', body:'Semua chart non-candlestick memiliki LAG (keterlambatan). Renko/Kagi/P&F tidak menunjukkan waktu — Anda tidak tahu berapa lama pola terbentuk. Heikin Ashi mengubah Open/Close sehingga TIDAK cocok untuk menentukan entry/exit presisi.' },
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

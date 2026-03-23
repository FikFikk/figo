<template>
  <div class="space-y-8">
    <!-- Main Generator UI -->
    <div class="glass-panel rounded-xl p-6 md:p-8" :class="isDark ? 'border border-white/5' : 'border border-slate-100'">
      <div class="flex items-start justify-between gap-4 mb-8">
        <div class="flex items-start gap-3 min-w-0">
          <div class="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center mt-0.5" :class="isDark ? 'bg-primary/15' : 'bg-blue-50'">
            <span class="material-symbols-outlined text-xl text-primary">palette</span>
          </div>
          <div class="min-w-0">
            <h2 class="font-headline font-bold text-lg leading-tight truncate" :class="isDark ? 'text-white' : 'text-slate-900'">Color Palette Generator</h2>
            <p class="text-[10px] md:text-xs mt-0.5 line-clamp-1 opacity-60" :class="isDark ? 'text-gray-400' : 'text-slate-500'">Create harmonic palettes and explore shades</p>
          </div>
        </div>

        <div class="flex items-center gap-2 flex-shrink-0">
          <button 
            @click="generateHarmonicFromSeed"
            class="w-10 h-10 bg-primary/10 text-primary dark:text-primary rounded-xl font-headline font-bold hover:scale-[1.02] transition-transform flex items-center justify-center border border-primary/20"
            title="Mix Base - Generate matching colors"
          >
            <span class="material-symbols-outlined text-lg">shuffle</span>
          </button>

          <button 
            @click="generateRandomPalette"
            class="w-10 h-10 bg-primary text-on-primary rounded-xl font-headline font-bold hover:scale-[1.02] hover:shadow-lg transition-transform active:scale-[0.98] flex items-center justify-center"
            title="Randomize All Colors"
          >
            <span class="material-symbols-outlined text-lg">autorenew</span>
          </button>
        </div>
      </div>

      <!-- Hero Palette Display -->
      <div class="grid grid-cols-5 gap-1.5 md:gap-3 mb-6 md:mb-8 h-32 md:h-48 lg:h-64">
        <div 
          v-for="(color, index) in currentPalette" 
          :key="index"
          class="relative group rounded-[4px] md:rounded-[6px] overflow-hidden cursor-pointer shadow-sm border border-black/5 dark:border-white/5"
          @click="selectColor(color)"
        >
          <div 
            class="absolute inset-0 transition-transform duration-500 group-hover:scale-110"
            :style="{ backgroundColor: color }"
          ></div>
          <div class="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20 backdrop-blur-[2px]">
            <span class="material-symbols-outlined text-white text-base md:text-xl mb-1">content_copy</span>
            <span class="text-white text-[8px] md:text-[10px] font-bold tracking-tighter">Click to copy</span>
          </div>
          <div class="absolute bottom-2 md:bottom-3 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 pointer-events-none group-hover:opacity-0 transition-opacity w-full" :class="getContrastColor(color)">
            <span class="text-[10px] md:text-[12px] font-black px-1 text-center leading-tight capitalize line-clamp-2">
              {{ getColorName(color) }}
            </span>
            <span class="px-2 py-0.5 rounded backdrop-blur-md text-[8px] md:text-[9px] font-black uppercase tracking-wider" :class="getContrastColor(color) === 'text-white' ? 'bg-black/20 text-white/90' : 'bg-white/40 text-slate-800'">
              {{ color }}
            </span>
          </div>
        </div>
      </div>

      <!-- Desktop Unified Control Panel -->
      <div class="hidden sm:block mb-10">
        <div class="glass-panel py-8 px-10 rounded-3xl border border-slate-200/60 dark:border-white/10 shadow-[0_15px_30px_rgba(0,0,0,0.05)] dark:shadow-[0_15px_30px_rgba(0,0,0,0.5)] relative bg-white/40 dark:bg-black/40">
          <div class="grid grid-cols-1 lg:grid-cols-[2fr_1.5fr_1.5fr] gap-10 xl:gap-14 items-start">
            
            <!-- Column 1: Custom Color Editor -->
            <div class="flex flex-col gap-6 relative pr-2">
              <div class="flex items-center justify-between px-2 w-full">
                <div class="flex items-center gap-4">
                   <div class="w-10 h-10 rounded-full shadow-inner border border-black/10 dark:border-white/10" :style="{ backgroundColor: editColor }"></div>
                   <span class="text-2xl font-bold font-mono tracking-wide">{{ editColor }}</span>
                </div>
                <!-- Cycle Toggle -->
                <button @click="cycleColorMode" class="flex items-center gap-1 group focus:outline-none transition-transform active:scale-95 bg-transparent border-0 p-0 m-0">
                  <span class="text-xs font-bold uppercase tracking-widest opacity-60 group-hover:opacity-100 transition-opacity">{{ colorEditorMode }}</span>
                  <span class="material-symbols-outlined text-[14px] opacity-40 group-hover:opacity-100 transition-opacity">unfold_more</span>
                </button>
              </div>

              <!-- Form Inputs -->
              <div class="flex items-center bg-white/60 dark:bg-black/40 rounded-2xl p-2.5 shadow-sm border border-black/5 dark:border-white/5 w-full">
                <template v-if="colorEditorMode === 'rgb'">
                   <div class="flex-1 flex items-center justify-center gap-3">
                     <span class="text-xs font-bold opacity-40">R</span>
                     <input type="number" v-model.number="editR" min="0" max="255" class="w-12 bg-transparent text-base font-bold text-center outline-none custom-hide-arrows" />
                   </div>
                   <div class="w-px h-6 bg-black/10 dark:bg-white/10"></div>
                   <div class="flex-1 flex items-center justify-center gap-3">
                     <span class="text-xs font-bold opacity-40">G</span>
                     <input type="number" v-model.number="editG" min="0" max="255" class="w-12 bg-transparent text-base font-bold text-center outline-none custom-hide-arrows" />
                   </div>
                   <div class="w-px h-6 bg-black/10 dark:bg-white/10"></div>
                   <div class="flex-1 flex items-center justify-center gap-3">
                     <span class="text-xs font-bold opacity-40">B</span>
                     <input type="number" v-model.number="editB" min="0" max="255" class="w-12 bg-transparent text-base font-bold text-center outline-none custom-hide-arrows" />
                   </div>
                </template>
                <template v-else-if="colorEditorMode === 'hsl'">
                   <div class="flex-1 flex items-center justify-center gap-3">
                     <span class="text-xs font-bold opacity-40">H</span>
                     <input type="number" v-model.number="editH" min="0" max="360" class="w-12 bg-transparent text-base font-bold text-center outline-none custom-hide-arrows" />
                   </div>
                   <div class="w-px h-6 bg-black/10 dark:bg-white/10"></div>
                   <div class="flex-1 flex items-center justify-center gap-3">
                     <span class="text-xs font-bold opacity-40">S</span>
                     <div class="flex items-center"><input type="number" v-model.number="editS" min="0" max="100" class="w-10 bg-transparent text-base font-bold text-right outline-none custom-hide-arrows" /><span class="text-xs font-bold ml-1">%</span></div>
                   </div>
                   <div class="w-px h-6 bg-black/10 dark:bg-white/10"></div>
                   <div class="flex-1 flex items-center justify-center gap-3">
                     <span class="text-xs font-bold opacity-40">L</span>
                     <div class="flex items-center"><input type="number" v-model.number="editL" min="0" max="100" class="w-10 bg-transparent text-base font-bold text-right outline-none custom-hide-arrows" /><span class="text-xs font-bold ml-1">%</span></div>
                   </div>
                </template>
                <template v-else>
                   <div class="flex-1 flex items-center justify-center gap-3">
                     <span class="text-xs font-bold opacity-40">L</span>
                     <div class="flex items-center"><input type="number" step="1" v-model.number="editOklchL" min="0" max="100" class="w-10 bg-transparent text-base font-bold text-right outline-none custom-hide-arrows" /><span class="text-xs font-bold ml-1">%</span></div>
                   </div>
                   <div class="w-px h-6 bg-black/10 dark:bg-white/10"></div>
                   <div class="flex-1 flex items-center justify-center gap-3">
                     <span class="text-xs font-bold opacity-40">C</span>
                     <input type="number" step="0.01" v-model.number="editOklchC" min="0" max="0.37" class="w-12 bg-transparent text-base font-bold text-center outline-none custom-hide-arrows" />
                   </div>
                   <div class="w-px h-6 bg-black/10 dark:bg-white/10"></div>
                   <div class="flex-1 flex items-center justify-center gap-3">
                     <span class="text-xs font-bold opacity-40">H</span>
                     <input type="number" v-model.number="editOklchH" min="0" max="360" class="w-12 bg-transparent text-base font-bold text-center outline-none custom-hide-arrows" />
                   </div>
                </template>
              </div>

              <!-- Dynamic Sliders -->
              <div class="space-y-6 px-1 pb-1">
                <template v-if="colorEditorMode === 'rgb'">
                   <input type="range" v-model.number="editR" min="0" max="255" class="custom-color-slider w-full h-2 rounded-full appearance-none shadow-inner" :style="`background: linear-gradient(to right, rgb(0, ${editG}, ${editB}), rgb(255, ${editG}, ${editB}))`" />
                   <input type="range" v-model.number="editG" min="0" max="255" class="custom-color-slider w-full h-2 rounded-full appearance-none shadow-inner" :style="`background: linear-gradient(to right, rgb(${editR}, 0, ${editB}), rgb(${editR}, 255, ${editB}))`" />
                   <input type="range" v-model.number="editB" min="0" max="255" class="custom-color-slider w-full h-2 rounded-full appearance-none shadow-inner" :style="`background: linear-gradient(to right, rgb(${editR}, ${editG}, 0), rgb(${editR}, ${editG}, 255))`" />
                </template>
                <template v-else-if="colorEditorMode === 'hsl'">
                   <input type="range" v-model.number="editH" min="0" max="360" class="custom-color-slider w-full h-2 rounded-full appearance-none shadow-inner" style="background: linear-gradient(to right, #ff0000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff, #ff0000)" />
                   <input type="range" v-model.number="editS" min="0" max="100" class="custom-color-slider w-full h-2 rounded-full appearance-none shadow-inner" :style="`background: linear-gradient(to right, hsl(${editH}, 0%, ${editL}%), hsl(${editH}, 100%, ${editL}%))`" />
                   <input type="range" v-model.number="editL" min="0" max="100" class="custom-color-slider w-full h-2 rounded-full appearance-none shadow-inner" :style="`background: linear-gradient(to right, hsl(${editH}, ${editS}%, 0%), hsl(${editH}, ${editS}%, 50%), hsl(${editH}, ${editS}%, 100%))`" />
                </template>
                <template v-else>
                   <input type="range" v-model.number="editOklchL" min="0" max="100" step="1" class="custom-color-slider w-full h-2 rounded-full appearance-none shadow-inner" :style="`background: linear-gradient(to right, oklch(0% ${editOklchC} ${editOklchH}), oklch(100% ${editOklchC} ${editOklchH}))`" />
                   <input type="range" v-model.number="editOklchC" min="0" max="0.37" step="0.001" class="custom-color-slider w-full h-2 rounded-full appearance-none shadow-inner" :style="`background: linear-gradient(to right, oklch(${editOklchL}% 0 ${editOklchH}), oklch(${editOklchL}% 0.37 ${editOklchH}))`" />
                   <input type="range" v-model.number="editOklchH" min="0" max="360" class="custom-color-slider w-full h-2 rounded-full appearance-none shadow-inner" :style="`background: linear-gradient(to right, oklch(${editOklchL}% ${editOklchC} 0), oklch(${editOklchL}% ${editOklchC} 60), oklch(${editOklchL}% ${editOklchC} 120), oklch(${editOklchL}% ${editOklchC} 180), oklch(${editOklchL}% ${editOklchC} 240), oklch(${editOklchL}% ${editOklchC} 300), oklch(${editOklchL}% ${editOklchC} 360))`" />
                </template>
              </div>
            </div>

            <!-- Divider 1 -->
            <div class="hidden lg:block w-px h-[90%] bg-gradient-to-b from-transparent via-black/10 dark:via-white/10 to-transparent absolute left-[41.5%] top-[5%]"></div>

            <!-- Column 2: Algorithm & Contrast -->
            <div class="flex flex-col gap-10 mt-1 lg:pl-4">
               <!-- Algorithm -->
               <div class="flex flex-col gap-3">
                 <span class="text-[10px] font-bold uppercase tracking-widest opacity-40">Algorithm</span>
                 <div class="relative group">
                   <select v-model="shadeAlgorithm" @change="generateShades" class="w-full bg-transparent text-lg font-bold outline-none border-b-2 border-black/10 dark:border-white/10 group-hover:border-primary/50 transition-colors pb-1.5 cursor-pointer appearance-none pr-8">
                      <option value="linear" class="bg-white dark:bg-zinc-800">Linear (Std)</option>
                      <option value="radix" class="bg-white dark:bg-zinc-800">Radix UI</option>
                      <option value="lightness" class="bg-white dark:bg-zinc-800">Lightness Scale</option>
                      <option value="hue-shift" class="bg-white dark:bg-zinc-800">Hue Shift</option>
                      <option value="monochromatic" class="bg-white dark:bg-zinc-800">Monochromatic</option>
                      <option value="analogous" class="bg-white dark:bg-zinc-800">Analogous</option>
                      <option value="complementary" class="bg-white dark:bg-zinc-800">Complementary</option>
                   </select>
                   <span class="material-symbols-outlined absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none opacity-40 group-hover:opacity-100 transition-opacity">expand_more</span>
                 </div>
               </div>
               
               <!-- Contrast Shift -->
               <div class="flex flex-col gap-3">
                 <div class="flex items-center justify-between">
                   <span class="text-[10px] font-bold uppercase tracking-widest opacity-40">Contrast Shift</span>
                   <span class="text-[15px] font-bold opacity-80 font-mono">{{ contrastShift > 0 ? '+' : '' }}{{ contrastShift.toFixed(2) }}</span>
                 </div>
                 <input type="range" min="-20" max="20" v-model.number="contrastShift" @input="generateShades" class="custom-color-slider-small w-full h-1.5 rounded-full appearance-none shadow-inner bg-black/10 dark:bg-white/10 cursor-pointer" />
               </div>
            </div>

            <!-- Divider 2 -->
            <div class="hidden lg:block w-px h-[90%] bg-gradient-to-b from-transparent via-black/10 dark:via-white/10 to-transparent absolute left-[71%] top-[5%]"></div>

            <!-- Column 3: Pattern & Count -->
            <div class="flex flex-col gap-10 mt-1 lg:pl-4">
               <!-- Naming Pattern -->
               <div class="flex flex-col gap-3">
                 <span class="text-[10px] font-bold uppercase tracking-widest opacity-40">Naming Pattern</span>
                 <div class="relative group">
                   <select v-model="namingPattern" class="w-full bg-transparent text-lg font-bold outline-none border-b-2 border-black/10 dark:border-white/10 group-hover:border-primary/50 transition-colors pb-1.5 cursor-pointer appearance-none pr-8">
                     <option value="tailwind" class="bg-white dark:bg-zinc-800">50, 100...950</option>
                     <option value="1" class="bg-white dark:bg-zinc-800">1, 2, 3...</option>
                     <option value="10" class="bg-white dark:bg-zinc-800">10, 20...90</option>
                     <option value="100" class="bg-white dark:bg-zinc-800">100, 200...900</option>
                   </select>
                   <span class="material-symbols-outlined absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none opacity-40 group-hover:opacity-100 transition-opacity">expand_more</span>
                 </div>
               </div>
               
               <!-- Shade Count -->
               <div class="flex flex-col gap-3">
                 <span class="text-[10px] font-bold uppercase tracking-widest opacity-40">Shade Count</span>
                 <div class="flex items-center gap-4 bg-white/50 dark:bg-black/30 rounded-2xl w-fit p-1.5 shadow-sm border border-black/5 dark:border-white/5">
                   <button @click="shadeLevels > 5 && (shadeLevels--) && generateShades()" class="w-8 h-8 rounded-[10px] bg-white dark:bg-zinc-800 shadow flex items-center justify-center hover:scale-105 active:scale-95 transition-transform"><span class="material-symbols-outlined text-[16px]">remove</span></button>
                   <span class="text-xl font-bold min-w-[3ch] text-center font-mono opacity-80">{{ shadeLevels }}</span>
                   <button @click="shadeLevels < 30 && (shadeLevels++) && generateShades()" class="w-8 h-8 rounded-[10px] bg-white dark:bg-zinc-800 shadow flex items-center justify-center hover:scale-105 active:scale-95 transition-transform"><span class="material-symbols-outlined text-[16px]">add</span></button>
                 </div>
               </div>
            </div>

          </div>
        </div>
      </div>

      <!-- Shade Explorer and CSS Output Wrap -->
      <div>
        <!-- Shade Explorer -->
        <div ref="shadeGridRef">
          <div class="flex flex-col gap-3 mb-4 border-b border-black/5 dark:border-white/5 pb-4">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <span class="w-1.5 h-6 bg-primary rounded-full"></span>
              <h3 class="font-headline font-black text-[18px] md:text-xl capitalize tracking-tight" :class="isDark ? 'text-gray-100' : 'text-slate-800'">{{ getColorName(baseColor) }}</h3>
              <span class="text-[10px] sm:text-xs font-bold uppercase tracking-widest opacity-30 sm:ml-2">Shades</span>
            </div>
            <!-- Base Color Picker for Shade Explorer -->
            <div class="flex items-center gap-2 px-3 py-1.5 rounded-lg" :class="isDark ? 'bg-white/5' : 'bg-slate-50'">
              <input 
                type="color" 
                v-model="baseColor" 
                class="w-5 h-5 rounded overflow-hidden border-0 p-0 cursor-pointer bg-transparent"
                @input="generateShades"
              />
              <span class="text-[10px] font-mono font-bold uppercase" :class="isDark ? 'text-gray-400' : 'text-slate-500'">{{ baseColor }}</span>
            </div>
          </div>
          

        </div>
        
        <div class="grid grid-cols-5 md:grid-cols-10 gap-2 md:gap-3 w-full mb-8">
          <!-- Filled Shades -->
          <div 
            v-for="(shade, index) in shades" 
            :key="index"
            class="aspect-[4/5] relative group rounded-[4px] md:rounded-[6px] overflow-hidden cursor-pointer border border-black/10 dark:border-white/10 shadow-md md:shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all"
            @click="copyToClipboard(shade)"
          >
            <!-- Solid Color Background -->
            <div 
              class="absolute inset-0 transition-transform duration-300 group-hover:scale-[1.05]"
              :style="{ backgroundColor: shade }"
            ></div>
            
            <!-- Contrast-adjusted Text Labels -->
            <div class="absolute inset-2 md:inset-3 flex flex-col justify-between pointer-events-none text-left" :class="getContrastColor(shade)">
              <span class="text-[10px] md:text-[11px] font-bold opacity-80 drop-shadow-sm">{{ getShadeName(index) }}</span>
              <span class="text-[9px] md:text-[10px] font-black uppercase tracking-wider drop-shadow-sm">{{ shade }}</span>
            </div>

            <!-- Hover "Copy" Indicator -->
            <div class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/10 backdrop-blur-[2px]">
              <span class="material-symbols-outlined text-white text-base drop-shadow-md">content_copy</span>
            </div>
          </div>

          <!-- Empty Slots Placeholders -->
          <div 
            v-for="n in Math.max(0, 20 - shades.length)" 
            :key="'empty-'+n"
            class="aspect-[4/5] rounded-[4px] md:rounded-[6px] bg-slate-200/50 dark:bg-black/60 shadow-[inset_0_4px_8px_rgba(0,0,0,0.1)] dark:shadow-[inset_0_4px_8px_rgba(0,0,0,0.4)] border-none flex items-end justify-center pb-2 opacity-70"
          >
            <span class="text-[8px] font-bold text-black/30 dark:text-white/30 uppercase tracking-widest">Empty</span>
          </div>
        </div>
      </div>

      <!-- CSS Output -->
      <div ref="exportCardRef" class="glass-panel rounded-xl p-4 md:p-6 shadow-xl dark:shadow-none" :class="isDark ? 'border border-white/5 bg-black/20' : 'border border-slate-200/60 bg-white/70'">
        <div class="flex items-center justify-between mb-3">
          <div class="flex items-center gap-2">
             <span class="material-symbols-outlined text-sm opacity-50">data_object</span>
            <h4 class="font-bold text-xs uppercase tracking-widest" :class="isDark ? 'text-gray-400' : 'text-slate-500'">Export Variables</h4>
          </div>
          <button 
            @click="copyCssOutput"
            class="px-3 py-1.5 rounded bg-primary/10 text-primary hover:bg-primary/20 transition-colors text-[10px] font-bold uppercase tracking-wider flex items-center gap-1"
          >
            <span class="material-symbols-outlined text-[12px]">content_copy</span>
            Copy Code
          </button>
        </div>
        <pre class="text-[10px] sm:text-[11px] font-mono overflow-x-auto custom-scrollbar p-3 sm:p-4 rounded-lg select-all max-h-48 overflow-y-auto" :class="isDark ? 'bg-black/50 text-gray-300' : 'bg-white text-slate-600 border border-slate-200/50'">{{ cssOutput }}</pre>
      </div>
    </div>
    </div>

    <!-- Recommendations & Presets -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div class="glass-panel rounded-2xl p-6" :class="isDark ? 'border border-white/5' : 'border border-slate-100'">
        <h3 class="font-headline font-bold text-base mb-4" :class="isDark ? 'text-white' : 'text-slate-800'">Recommended Themes</h3>
        <div class="space-y-3">
          <div 
            v-for="theme in recommendedThemes" 
            :key="theme.name"
            class="group rounded-xl p-3 flex items-center justify-between cursor-pointer transition-all hover:bg-white/5 border border-transparent hover:border-white/10"
            @click="setPalette(theme.colors)"
          >
            <div class="flex items-center gap-3">
              <div class="flex -space-x-2">
                <div 
                  v-for="c in theme.colors.slice(0, 3)" 
                  :key="c"
                  class="w-6 h-6 rounded-full border-2"
                  :class="isDark ? 'border-zinc-900' : 'border-white'"
                  :style="{ backgroundColor: c }"
                ></div>
              </div>
              <span class="text-sm font-medium" :class="isDark ? 'text-gray-300' : 'text-slate-700'">{{ theme.name }}</span>
            </div>
            <span class="material-symbols-outlined text-sm opacity-0 group-hover:opacity-100 transition-opacity" :class="isDark ? 'text-gray-500' : 'text-slate-400'">arrow_forward</span>
          </div>
        </div>
      </div>

      <div class="glass-panel rounded-2xl p-6" :class="isDark ? 'border border-white/5' : 'border border-slate-100'">
        <h3 class="font-headline font-bold text-base mb-4" :class="isDark ? 'text-white' : 'text-slate-800'">Saved Palettes</h3>
        <div v-if="savedPalettes.length === 0" class="flex flex-col items-center justify-center py-8 text-center">
          <span class="material-symbols-outlined text-3xl mb-2 opacity-20">bookmarks</span>
          <p class="text-xs" :class="isDark ? 'text-gray-600' : 'text-slate-400'">No palettes saved yet. Click a color to copy or generate more.</p>
        </div>
        <div v-else class="max-h-56 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
          <div 
            v-for="(palette, index) in savedPalettes" 
            :key="index"
            class="group rounded-xl p-3 flex items-center justify-between transition-all hover:bg-white/5 border border-black/5 dark:border-white/5 hover:border-black/10 dark:hover:border-white/10"
          >
            <!-- Clickable area to set palette -->
            <div class="flex items-center gap-3 flex-1 cursor-pointer" @click="setPalette(palette)">
              <div class="flex -space-x-2">
                <div 
                  v-for="c in palette.slice(0, 3)" 
                  :key="c"
                  class="w-6 h-6 rounded-full border-2 border-white dark:border-zinc-900 shadow-sm"
                  :style="{ backgroundColor: c }"
                ></div>
              </div>
              <span class="text-xs font-bold opacity-70">Palette #{{ index + 1 }}</span>
            </div>
            <!-- Delete button -->
            <button 
              @click.stop="deleteSavedPalette(index)"
              class="w-7 h-7 flex items-center justify-center rounded-lg text-red-500/30 hover:text-red-500 hover:bg-red-500/10 transition-colors"
            >
              <span class="material-symbols-outlined text-[14px]">delete</span>
            </button>
          </div>
        </div>
        <button 
          @click="saveCurrentPalette"
          class="w-full mt-4 py-3 rounded-xl border border-dashed text-xs font-bold uppercase tracking-widest transition-all"
          :class="isDark ? 'border-white/10 text-gray-500 hover:bg-white/5' : 'border-slate-200 text-slate-400 hover:bg-slate-50'"
        >
          Save Current Selection
        </button>
      </div>
    </div>

    <!-- Mobile Bottom-Sheet Controls Modal -->
    <Transition
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="transform translate-y-full opacity-0"
      enter-to-class="transform translate-y-0 opacity-100"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="transform translate-y-0 opacity-100"
      leave-to-class="transform translate-y-full opacity-0"
    >
      <div v-if="showMobileControls" class="sm:hidden fixed inset-x-0 top-0 bottom-0 z-50 flex flex-col justify-end">
        <!-- Overlay -->
        <div @click="showMobileControls = false" class="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>
        
        <!-- Bottom modal content -->
        <div class="relative bg-white/95 dark:bg-[#0f111a]/95 backdrop-blur-3xl rounded-t-[32px] p-6 pb-28 flex flex-col space-y-4 shadow-[0_-10px_40px_rgba(0,0,0,0.5)] border-t border-white/50 dark:border-white/10 w-full overflow-y-auto max-h-[90vh]">
            <div class="flex items-center justify-between mb-2 mt-1 sticky top-0 bg-white/5 dark:bg-[#0f111a]/5 -mx-6 px-6 z-10">
              <h3 class="font-bold text-xs uppercase tracking-widest opacity-50">Shade Controls</h3>
              <button @click="showMobileControls = false" class="w-8 h-8 rounded-full bg-black/5 dark:bg-white/10 flex items-center justify-center hover:bg-black/10 dark:hover:bg-white/20 transition-all">
                <span class="material-symbols-outlined text-sm">close</span>
              </button>
            </div>

            <!-- Mobile Detailed Color Editor -->
            <div class="bg-black/5 dark:bg-white/5 p-5 rounded-3xl border border-black/5 dark:border-white/5 shadow-inner mb-2 relative">
              <div class="flex items-center justify-between mb-5 px-1">
                 <div class="flex items-center gap-3">
                    <div class="w-8 h-8 rounded-full shadow-inner border border-black/10 dark:border-white/10" :style="{ backgroundColor: editColor }"></div>
                    <span class="text-[15px] font-bold font-mono tracking-wide">{{ editColor }}</span>
                 </div>
                 
                 <!-- Mode Toggle (Cycle) -->
                 <button @click="cycleColorMode" class="flex items-center gap-1 group focus:outline-none transition-transform active:scale-95 bg-transparent border-0 p-0 m-0">
                   <span class="text-xs font-bold uppercase tracking-widest">{{ colorEditorMode }}</span>
                   <span class="material-symbols-outlined text-[14px] opacity-70 group-hover:opacity-100 transition-opacity">unfold_more</span>
                 </button>
              </div>

              <!-- Numeric Inputs -->
              <div class="flex items-center justify-between bg-white/50 dark:bg-black/20 rounded-xl p-1.5 shadow-sm border border-black/5 dark:border-white/5 mb-6">
                <template v-if="colorEditorMode === 'rgb'">
                   <div class="flex-1 flex items-center justify-center gap-1.5">
                     <span class="text-[10px] font-bold opacity-40">R</span>
                     <input type="number" v-model.number="editR" min="0" max="255" class="w-10 bg-transparent text-sm font-bold text-center outline-none custom-hide-arrows" />
                   </div>
                   <div class="w-px h-5 bg-black/10 dark:bg-white/10"></div>
                   <div class="flex-1 flex items-center justify-center gap-1.5">
                     <span class="text-[10px] font-bold opacity-40">G</span>
                     <input type="number" v-model.number="editG" min="0" max="255" class="w-10 bg-transparent text-sm font-bold text-center outline-none custom-hide-arrows" />
                   </div>
                   <div class="w-px h-5 bg-black/10 dark:bg-white/10"></div>
                   <div class="flex-1 flex items-center justify-center gap-1.5">
                     <span class="text-[10px] font-bold opacity-40">B</span>
                     <input type="number" v-model.number="editB" min="0" max="255" class="w-10 bg-transparent text-sm font-bold text-center outline-none custom-hide-arrows" />
                   </div>
                </template>
                <template v-else-if="colorEditorMode === 'hsl'">
                   <div class="flex-1 flex items-center justify-center gap-1.5">
                     <span class="text-[10px] font-bold opacity-40">H</span>
                     <input type="number" v-model.number="editH" min="0" max="360" class="w-10 bg-transparent text-sm font-bold text-center outline-none custom-hide-arrows" />
                   </div>
                   <div class="w-px h-5 bg-black/10 dark:bg-white/10"></div>
                   <div class="flex-1 flex items-center justify-center gap-1.5">
                     <span class="text-[10px] font-bold opacity-40">S</span>
                     <div class="flex items-center"><input type="number" v-model.number="editS" min="0" max="100" class="w-8 bg-transparent text-sm font-bold text-right outline-none custom-hide-arrows" /><span class="text-[10px] font-bold">%</span></div>
                   </div>
                   <div class="w-px h-5 bg-black/10 dark:bg-white/10"></div>
                   <div class="flex-1 flex items-center justify-center gap-1.5">
                     <span class="text-[10px] font-bold opacity-40">L</span>
                     <div class="flex items-center"><input type="number" v-model.number="editL" min="0" max="100" class="w-8 bg-transparent text-sm font-bold text-right outline-none custom-hide-arrows" /><span class="text-[10px] font-bold">%</span></div>
                   </div>
                </template>
                <template v-else>
                   <div class="flex-1 flex items-center justify-center gap-1.5">
                     <span class="text-[10px] font-bold opacity-40">L</span>
                     <div class="flex items-center"><input type="number" step="1" v-model.number="editOklchL" min="0" max="100" class="w-8 bg-transparent text-sm font-bold text-right outline-none custom-hide-arrows" /><span class="text-[10px] font-bold">%</span></div>
                   </div>
                   <div class="w-px h-5 bg-black/10 dark:bg-white/10"></div>
                   <div class="flex-1 flex items-center justify-center gap-1.5">
                     <span class="text-[10px] font-bold opacity-40">C</span>
                     <input type="number" step="0.01" v-model.number="editOklchC" min="0" max="0.37" class="w-10 bg-transparent text-sm font-bold text-center outline-none custom-hide-arrows" />
                   </div>
                   <div class="w-px h-5 bg-black/10 dark:bg-white/10"></div>
                   <div class="flex-1 flex items-center justify-center gap-1.5">
                     <span class="text-[10px] font-bold opacity-40">H</span>
                     <input type="number" v-model.number="editOklchH" min="0" max="360" class="w-10 bg-transparent text-sm font-bold text-center outline-none custom-hide-arrows" />
                   </div>
                </template>
              </div>

              <!-- Sliders -->
              <div class="space-y-6 pb-2">
                <template v-if="colorEditorMode === 'rgb'">
                   <input type="range" v-model.number="editR" min="0" max="255" class="custom-color-slider custom-color-slider-small w-full h-2 rounded-full appearance-none shadow-inner" :style="`background: linear-gradient(to right, rgb(0, ${editG}, ${editB}), rgb(255, ${editG}, ${editB}))`" />
                   <input type="range" v-model.number="editG" min="0" max="255" class="custom-color-slider custom-color-slider-small w-full h-2 rounded-full appearance-none shadow-inner" :style="`background: linear-gradient(to right, rgb(${editR}, 0, ${editB}), rgb(${editR}, 255, ${editB}))`" />
                   <input type="range" v-model.number="editB" min="0" max="255" class="custom-color-slider custom-color-slider-small w-full h-2 rounded-full appearance-none shadow-inner" :style="`background: linear-gradient(to right, rgb(${editR}, ${editG}, 0), rgb(${editR}, ${editG}, 255))`" />
                </template>
                <template v-else-if="colorEditorMode === 'hsl'">
                   <input type="range" v-model.number="editH" min="0" max="360" class="custom-color-slider custom-color-slider-small w-full h-2 rounded-full appearance-none shadow-inner" style="background: linear-gradient(to right, #ff0000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff, #ff0000)" />
                   <input type="range" v-model.number="editS" min="0" max="100" class="custom-color-slider custom-color-slider-small w-full h-2 rounded-full appearance-none shadow-inner" :style="`background: linear-gradient(to right, hsl(${editH}, 0%, ${editL}%), hsl(${editH}, 100%, ${editL}%))`" />
                   <input type="range" v-model.number="editL" min="0" max="100" class="custom-color-slider custom-color-slider-small w-full h-2 rounded-full appearance-none shadow-inner" :style="`background: linear-gradient(to right, hsl(${editH}, ${editS}%, 0%), hsl(${editH}, ${editS}%, 50%), hsl(${editH}, ${editS}%, 100%))`" />
                </template>
                <template v-else>
                   <input type="range" v-model.number="editOklchL" min="0" max="100" step="1" class="custom-color-slider custom-color-slider-small w-full h-2 rounded-full appearance-none shadow-inner" :style="`background: linear-gradient(to right, oklch(0% ${editOklchC} ${editOklchH}), oklch(100% ${editOklchC} ${editOklchH}))`" />
                   <input type="range" v-model.number="editOklchC" min="0" max="0.37" step="0.001" class="custom-color-slider custom-color-slider-small w-full h-2 rounded-full appearance-none shadow-inner" :style="`background: linear-gradient(to right, oklch(${editOklchL}% 0 ${editOklchH}), oklch(${editOklchL}% 0.37 ${editOklchH}))`" />
                   <input type="range" v-model.number="editOklchH" min="0" max="360" class="custom-color-slider custom-color-slider-small w-full h-2 rounded-full appearance-none shadow-inner" :style="`background: linear-gradient(to right, oklch(${editOklchL}% ${editOklchC} 0), oklch(${editOklchL}% ${editOklchC} 60), oklch(${editOklchL}% ${editOklchC} 120), oklch(${editOklchL}% ${editOklchC} 180), oklch(${editOklchL}% ${editOklchC} 240), oklch(${editOklchL}% ${editOklchC} 300), oklch(${editOklchL}% ${editOklchC} 360))`" />
                </template>
              </div>
            </div>

            <div class="w-full border-t border-black/5 dark:border-white/5 my-2"></div>

            <!-- Naming Pattern Dropdown -->
            <div class="flex items-center justify-between gap-2 px-5 py-3.5 rounded-2xl border border-black/5 dark:border-white/5 bg-black/5 dark:bg-white/5 shadow-inner">
              <span class="text-[10px] font-bold uppercase opacity-60">Pattern</span>
              <select 
                v-model="namingPattern" 
                class="text-[10px] font-bold uppercase tracking-wider border-0 outline-none cursor-pointer bg-transparent"
                :class="isDark ? 'text-gray-200' : 'text-slate-800'"
              >
                <option value="tailwind" class="bg-white dark:bg-zinc-800">Tailwind</option>
                <option value="1" class="bg-white dark:bg-zinc-800">1, 2, 3...</option>
                <option value="10" class="bg-white dark:bg-zinc-800">10, 20...</option>
                <option value="100" class="bg-white dark:bg-zinc-800">100, 200...</option>
              </select>
            </div>

            <!-- Algorithm Dropdown -->
            <div class="flex items-center justify-between gap-2 px-5 py-3.5 rounded-2xl border border-black/5 dark:border-white/5 bg-black/5 dark:bg-white/5 shadow-inner">
              <span class="text-[10px] font-bold uppercase opacity-60">Algorithm</span>
              <select 
                v-model="shadeAlgorithm"
                @change="generateShades"
                class="text-[10px] font-bold uppercase tracking-wider border-0 outline-none cursor-pointer bg-transparent"
                :class="isDark ? 'text-gray-200' : 'text-slate-800'"
              >
                <option value="linear" class="bg-white dark:bg-zinc-800">Linear (Std)</option>
                <option value="radix" class="bg-white dark:bg-zinc-800">Radix UI</option>
                <option value="lightness" class="bg-white dark:bg-zinc-800">Lightness Scale</option>
                <option value="hue-shift" class="bg-white dark:bg-zinc-800">Hue Shift</option>
                <option value="monochromatic" class="bg-white dark:bg-zinc-800">Monochromatic</option>
                <option value="analogous" class="bg-white dark:bg-zinc-800">Analogous</option>
                <option value="complementary" class="bg-white dark:bg-zinc-800">Complementary</option>
              </select>
            </div>

            <!-- Contrast Shift Slider -->
            <div class="flex items-center justify-between gap-4 px-5 py-3.5 rounded-2xl border border-black/5 dark:border-white/5 bg-black/5 dark:bg-white/5 shadow-inner">
              <span class="text-[10px] font-bold uppercase opacity-60 flex-shrink-0">Contrast</span>
              <input 
                type="range" 
                min="-20" max="20" 
                v-model.number="contrastShift"
                class="w-full h-1 bg-black/10 dark:bg-white/10 rounded-lg appearance-none cursor-pointer"
                @input="generateShades"
              />
            </div>

            <!-- Shade Level Adjuster -->
            <div class="flex items-center justify-between gap-1 px-5 py-3.5 rounded-2xl border border-black/5 dark:border-white/5 bg-black/5 dark:bg-white/5 shadow-inner">
              <span class="text-[10px] font-bold uppercase opacity-60 mr-1">Count</span>
              <div class="flex items-center bg-white/50 dark:bg-black/30 rounded-lg p-1">
                <button @click="shadeLevels > 3 && shadeLevels--; generateShades()" :disabled="shadeLevels <= 3" class="w-8 h-8 flex items-center justify-center rounded-md hover:bg-black/10 dark:hover:bg-white/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed">
                  <span class="material-symbols-outlined text-[14px]">remove</span>
                </button>
                <span class="text-[12px] font-mono font-bold w-10 text-center">{{ shadeLevels }}</span>
                <button @click="shadeLevels < 20 && shadeLevels++; generateShades()" :disabled="shadeLevels >= 20" class="w-8 h-8 flex items-center justify-center rounded-md hover:bg-black/10 dark:hover:bg-white/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed">
                  <span class="material-symbols-outlined text-[14px]">add</span>
                </button>
              </div>
            </div>
        </div>
      </div>
    </Transition>

    <!-- Scroll-Aware Mobile Floating Button -->
    <Transition
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="transform translate-y-8 opacity-0 scale-95"
      enter-to-class="transform translate-y-0 opacity-100 scale-100"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="transform translate-y-0 opacity-100 scale-100"
      leave-to-class="transform translate-y-8 opacity-0 scale-95"
    >
      <div v-show="isShadeExplorerVisible && !showMobileControls" class="sm:hidden fixed bottom-24 left-1/2 -translate-x-1/2 z-40 transition-transform">
        <button 
          @click="showMobileControls = true"
          class="px-5 py-3 rounded-full shadow-[0_10px_30px_rgba(0,0,0,0.3)] dark:shadow-[0_10px_40px_rgba(0,0,0,0.8)] font-black text-[10px] uppercase tracking-wider flex items-center gap-2 hover:scale-105 active:scale-95 transition-all border outline-none"
          :class="isDark ? 'bg-white/10 border-white/10 text-white backdrop-blur-xl hover:bg-white/20' : 'bg-white/70 border-white/50 text-slate-800 backdrop-blur-xl hover:bg-white/90'"
        >
          <span class="material-symbols-outlined text-[14px]">tune</span>
          Controls
        </button>
      </div>
    </Transition>

    <!-- Notification -->
    <Transition
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="transform translate-y-4 opacity-0"
      enter-to-class="transform translate-y-0 opacity-100"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="transform translate-y-0 opacity-100"
      leave-to-class="transform translate-y-4 opacity-0"
    >
      <div v-if="copiedColor" class="fixed bottom-8 left-1/2 -translate-x-1/2 z-50">
        <div class="bg-black/80 backdrop-blur-md text-white px-6 py-3 rounded-full flex items-center gap-3 shadow-2xl border border-white/10">
          <div class="w-4 h-4 rounded-full" :style="{ backgroundColor: copiedColor }"></div>
          <span class="text-sm font-bold">Copied {{ copiedColor }}</span>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import namer from 'color-namer';
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'

// Helper for human-readable color naming using the ntc dictionary
function getColorName(hex: string) {
  try {
    const names = namer(hex, { pick: ['ntc'] });
    return names?.ntc?.[0]?.name || 'Color';
  } catch (e) {
    return 'Color';
  }
}

const { isDark } = useColorMode()

// State
const currentPalette = ref<string[]>(['#6366f1', '#a855f7', '#ec4899', '#f43f5e', '#f59e0b'])
const paletteSeedColor = ref('#6366f1')
const baseColor = ref('#6366f1')
const shadeLevels = ref(10)
const namingPattern = ref('tailwind')
const shadeAlgorithm = ref('linear')
const contrastShift = ref(0)
const shades = ref<string[]>([])
const savedPalettes = ref<string[][]>([])
const copiedColor = ref<string | null>(null)
const showMobileControls = ref(false)
const shadeGridRef = ref<HTMLElement | null>(null)
const exportCardRef = ref<HTMLElement | null>(null)
const isShadeExplorerVisible = ref(false)

// Color Editor State
const colorEditorMode = ref<'rgb' | 'hsl' | 'oklch'>('oklch')

function cycleColorMode() {
  const modes: ('rgb' | 'hsl' | 'oklch')[] = ['rgb', 'hsl', 'oklch'];
  const currentIndex = modes.indexOf(colorEditorMode.value);
  colorEditorMode.value = modes[(currentIndex + 1) % modes.length] || 'rgb';
}

const editColor = computed({
  get: () => baseColor.value,
  set: (val) => {
    // Valid hex check
    if (!/^#[0-9A-F]{6}$/i.test(val)) return;
    baseColor.value = val;
    // Keep hero palette in sync
    if (currentPalette.value.length > 0) {
      const newPalette = [...currentPalette.value];
      const index = newPalette.indexOf(paletteSeedColor.value);
      if (index !== -1) {
        newPalette[index] = val;
      } else {
        newPalette[0] = val;
      }
      currentPalette.value = newPalette;
    }
    paletteSeedColor.value = val;
    generateShades();
  }
})

// Detailed RGB Editor Handlers
const editR = computed({ get: () => hexToRgb(editColor.value).r, set: (v) => editColor.value = rgbToHex(v, editG.value, editB.value) })
const editG = computed({ get: () => hexToRgb(editColor.value).g, set: (v) => editColor.value = rgbToHex(editR.value, v, editB.value) })
const editB = computed({ get: () => hexToRgb(editColor.value).b, set: (v) => editColor.value = rgbToHex(editR.value, editG.value, v) })

// Detailed HSL Editor Handlers
const editH = computed({ get: () => Math.round(hexToHsl(editColor.value).h), set: (v) => editColor.value = hslToHex(v, editS.value, editL.value) })
const editS = computed({ get: () => Math.round(hexToHsl(editColor.value).s), set: (v) => editColor.value = hslToHex(editH.value, v, editL.value) })
const editL = computed({ get: () => Math.round(hexToHsl(editColor.value).l), set: (v) => editColor.value = hslToHex(editH.value, editS.value, v) })

// Detailed OKLCH Editor Handlers
const editOklchL = computed({ get: () => Number(hexToOklch(editColor.value).l.toFixed(1)), set: (v) => editColor.value = oklchToHex(v, editOklchC.value, editOklchH.value) })
const editOklchC = computed({ get: () => Number(hexToOklch(editColor.value).c.toFixed(3)), set: (v) => editColor.value = oklchToHex(editOklchL.value, v, editOklchH.value) })
const editOklchH = computed({ get: () => Math.round(hexToOklch(editColor.value).h), set: (v) => editColor.value = oklchToHex(editOklchL.value, editOklchC.value, v) })

// Helper for RGB Parse
function hexToRgb(hex: string) {
  let r = 0, g = 0, b = 0;
  if(hex.length == 4){
    r = parseInt(hex[1] + hex[1], 16);
    g = parseInt(hex[2] + hex[2], 16);
    b = parseInt(hex[3] + hex[3], 16);
  }else if (hex.length >= 7){
    r = parseInt(hex.substring(1, 3), 16);
    g = parseInt(hex.substring(3, 5), 16);
    b = parseInt(hex.substring(5, 7), 16);
  }
  return {r,g,b};
}

// Helper for RGB Stringify
function rgbToHex(r: number, g: number, b: number) {
  return "#" + (1 << 24 | r << 16 | g << 8 | b).toString(16).slice(1).toUpperCase();
}

// Oklab base conversions
function srgbToLinear(c: number) {
  return c >= 0.04045 ? Math.pow((c + 0.055) / 1.055, 2.4) : c / 12.92;
}
function linearToSrgb(c: number) {
  return c >= 0.0031308 ? 1.055 * Math.pow(c, 1 / 2.4) - 0.055 : 12.92 * c;
}

// Convert Hex to exact Oklch
function hexToOklch(hex: string) {
  let {r, g, b} = hexToRgb(hex);
  r /= 255; g /= 255; b /= 255;
  let lr = srgbToLinear(r), lg = srgbToLinear(g), lb = srgbToLinear(b);
  
  let l = 0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb;
  let m = 0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb;
  let s = 0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb;

  let l_ = Math.cbrt(l), m_ = Math.cbrt(m), s_ = Math.cbrt(s);

  let L = 0.2104542553*l_ + 0.7936177850*m_ - 0.0040720468*s_;
  let a = 1.9779984951*l_ - 2.4285922050*m_ + 0.4505937099*s_;
  let b_ = 0.0259040371*l_ + 0.7827717662*m_ - 0.8086757660*s_;

  let C = Math.sqrt(a*a + b_*b_);
  let H = Math.atan2(b_, a) * 180 / Math.PI;
  if (H < 0) H += 360;
  
  return { l: L * 100, c: C, h: H };
}

// Convert Oklch back to Hex
function oklchToHex(L: number, C: number, H: number) {
  L = L / 100; // normalize
  let a = C * Math.cos(H * Math.PI / 180);
  let b_ = C * Math.sin(H * Math.PI / 180);

  let l_ = L + 0.3963377774 * a + 0.2158037573 * b_;
  let m_ = L - 0.1055613458 * a - 0.0638541728 * b_;
  let s_ = L - 0.0894841775 * a - 1.2914855480 * b_;

  let l = l_*l_*l_, m = m_*m_*m_, s = s_*s_*s_;

  let lr = +4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s;
  let lg = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s;
  let lb = -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s;

  let r = Math.round(linearToSrgb(lr) * 255);
  let g = Math.round(linearToSrgb(lg) * 255);
  let b = Math.round(linearToSrgb(lb) * 255);

  r = Math.max(0, Math.min(255, r));
  g = Math.max(0, Math.min(255, g));
  b = Math.max(0, Math.min(255, b));

  return rgbToHex(r, g, b);
}

// Computed CSS Output
const cssOutput = computed(() => {
  let css = '/* CSS Variables generated from FiGo */\n:root {\n'
  shades.value.forEach((shade, index) => {
    css += `  --color-primary-${getShadeName(index)}: ${shade};\n`
  })
  css += '}'
  return css
})

// Methods
function selectColor(color: string) {
  baseColor.value = color
  paletteSeedColor.value = color
  generateShades()
  copyToClipboard(color)
}

function generateHarmonicFromSeed() {
  const hex = paletteSeedColor.value
  const hsl = hexToHsl(hex)
  const newPalette: string[] = []
  
  // Randomize harmony strategy for variety
  const strategy = Math.floor(Math.random() * 4)
  let steps: number[] = []
  
  if (strategy === 0) {
    // Analogous
    const gap = 15 + Math.random() * 20
    steps = [0, gap, gap * 2, -gap, -gap * 2]
  } else if (strategy === 1) {
    // Triadic/Split
    steps = [0, 150, 210, 30, 330] 
  } else if (strategy === 2) {
    // Tetradic variation
    steps = [0, 90, 180, 270, 45]
  } else {
    // Random gap sequence
    const gap = 40 + Math.random() * 50
    steps = [0, gap, gap * 2, gap * 3, gap * 4]
  }
  
  for (let i = 0; i < 5; i++) {
    const stepObj = steps[i] || 0
    const h = (hsl.h + stepObj + 360) % 360
    // Dynamic variance based on seed and strategy
    const s = Math.max(20, Math.min(100, hsl.s + (Math.random() * 30 - 15)))
    const l = Math.max(20, Math.min(80, hsl.l + (i === 0 ? 0 : Math.random() * 40 - 20)))
    newPalette.push(hslToHex(h, s, l))
  }
  
  // Ensure the Base color is strictly locked at the starting point
  newPalette[0] = hex
  currentPalette.value = newPalette
  baseColor.value = hex
  generateShades()
}

function generateRandomPalette() {
  const baseHue = Math.floor(Math.random() * 360)
  const s = 60 + Math.random() * 30
  const l = 40 + Math.random() * 40
  paletteSeedColor.value = hslToHex(baseHue, s, l)
  generateHarmonicFromSeed()
}

function getShadeName(index: number) {
  const p = namingPattern.value
  
  if (p === '1') return (index + 1).toString()
  if (p === '10') return ((index + 1) * 10).toString()
  if (p === '100') return ((index + 1) * 100).toString()
  if (p === 'tailwind') {
    if (index === 0) return '50'
    if (index === 10) return '950'
    if (index > 10) return (index * 100 - 100).toString()
    return (index * 100).toString()
  }
  return index.toString()
}

function generateShades() {
  const hex = baseColor.value
  const hsl = hexToHsl(hex)
  const newShades: string[] = []
  
  const levels = shadeLevels.value
  const shift = contrastShift.value // -20 to 20
  const alg = shadeAlgorithm.value
  
  const minL = Math.max(2, 10 - shift) 
  const maxL = Math.min(98, 95 + shift)
  
  for (let i = 0; i < levels; i++) {
    // Percentage 0 (lightest) to 1 (darkest)
    const p = i / Math.max(1, levels - 1)
    
    let h = hsl.h
    let s = hsl.s
    let l = maxL - (p * (maxL - minL))

    if (alg === 'hue-shift') {
      h = (hsl.h + (i - (levels/2)) * 2.5 + 360) % 360
    } else if (alg === 'monochromatic') {
      s = hsl.s
    } else if (alg === 'analogous') {
      h = (hsl.h + (p * 45) + 360) % 360
    } else if (alg === 'complementary') {
      // Image 1 Style: Perceptual bridge to the complement
      h = (hsl.h + (p * 180) + 360) % 360
      // Boost saturation in mid-tones for that "vivid" look from the sample
      s = Math.min(100, s + (Math.sin(p * Math.PI) * 20))
    } else if (alg === 'radix') {
      // Image 2 Style: Radix UI inspired balance
      const curve = p < 0.5 
        ? 4 * p * p * p 
        : 1 - Math.pow(-2 * p + 2, 3) / 2
      l = 99 - (curve * 85) // Range 99% to 14%
      s = Math.max(5, s - (p * 10)) // Subtle desaturation in darker shades
    } else if (alg === 'lightness') {
      // Image 3 Style: Pure Lightness Scale
      l = 98 - (p * 96) // Range 98% to 2%
    }
    
    newShades.push(hslToHex(h, hsl.h === 0 && hsl.s === 0 ? 0 : s, l))
  }
  shades.value = newShades
}

function setPalette(colors: string[]) {
  if (!colors || colors.length === 0) return
  currentPalette.value = [...colors]
  baseColor.value = colors[0] || '#000000'
  paletteSeedColor.value = colors[0] || '#000000'
  generateShades()
}

function saveCurrentPalette() {
  const currentStr = JSON.stringify(currentPalette.value)
  const exists = savedPalettes.value.some(p => JSON.stringify(p) === currentStr)
  
  if (!exists) {
    savedPalettes.value.push([...currentPalette.value])
    
    // Show a quick success notification
    copiedColor.value = "Palette Saved!"
    setTimeout(() => copiedColor.value = null, 2000)
  } else {
    copiedColor.value = "Palette Already Saved!"
    setTimeout(() => copiedColor.value = null, 2000)
  }
}

function deleteSavedPalette(index: number) {
  savedPalettes.value.splice(index, 1)
}

const copyToClipboard = async (color: string) => {
  try {
    await navigator.clipboard.writeText(color.toUpperCase())
    copiedColor.value = color
    setTimeout(() => {
      copiedColor.value = null
    }, 2000)
  } catch (err) {
    console.error('Failed to copy!', err)
  }
}

const copyCssOutput = async () => {
  try {
    await navigator.clipboard.writeText(cssOutput.value)
    copiedColor.value = "Code Copied!"
    setTimeout(() => { copiedColor.value = null }, 2000)
  } catch (err) {
    console.error('Failed to copy code', err)
  }
}

// Color conversion helpers
function getContrastColor(hexcolor: string) {
  // If undefined or invalid, return default text
  if (!hexcolor || hexcolor.length < 4) return 'text-slate-900'
  
  // Strip hash and convert 3-char hex to 6-char hex if needed
  let hex = hexcolor.replace("#", "");
  if (hex.length === 3) {
    hex = hex.split('').map(c => c + c).join('')
  }
  
  // Parse RGB
  const r = parseInt(hex.slice(0, 2), 16) || 0;
  const g = parseInt(hex.slice(2, 4), 16) || 0;
  const b = parseInt(hex.slice(4, 6), 16) || 0;
  
  // Calculate relative luminance (YIQ color space)
  const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
  
  // Return dark or light text based on luminance threshold
  return (yiq >= 128) ? 'text-slate-900' : 'text-white';
}

function hexToHsl(hex: string) {
  let r = parseInt(hex.slice(1, 3), 16) / 255
  let g = parseInt(hex.slice(3, 5), 16) / 255
  let b = parseInt(hex.slice(5, 7), 16) / 255

  let max = Math.max(r, g, b), min = Math.min(r, g, b)
  let h, s, l = (max + min) / 2

  if (max === min) {
    h = s = 0 
  } else {
    let d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break
      case g: h = (b - r) / d + 2; break
      default: h = (r - g) / d + 4; break
    }
    h /= 6
  }

  return { h: h * 360, s: s * 100, l: l * 100 }
}

function hslToHex(h: number, s: number, l: number) {
  l /= 100
  const a = s * Math.min(l, 1 - l) / 100
  const f = (n: number) => {
    const k = (n + h / 30) % 12
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1)
    return Math.round(255 * color).toString(16).padStart(2, '0')
  }
  return `#${f(0)}${f(8)}${f(4)}`
}

const recommendedThemes = [
  { name: 'Modern Indigo', colors: ['#4f46e5', '#6366f1', '#818cf8', '#a5b4fc', '#c7d2fe'] },
  { name: 'Cyberpunk Neon', colors: ['#f0abfc', '#e879f9', '#d946ef', '#c026d3', '#a21caf'] },
  { name: 'Forest Spirit', colors: ['#064e3b', '#065f46', '#047857', '#059669', '#10b981'] },
  { name: 'Burning Sunset', colors: ['#7c2d12', '#9a3412', '#c2410c', '#ea580c', '#f97316'] },
  { name: 'Deep Ocean', colors: ['#0c4a6e', '#075985', '#0369a1', '#0284c7', '#0ea5e9'] },
  { name: 'Luxury Gold', colors: ['#451a03', '#78350f', '#92400e', '#b45309', '#d97706'] },
]

// Monitor and sync saved palettes with local storage
watch(savedPalettes, (newVal) => {
  if (process.client) {
    localStorage.setItem('figo_saved_palettes', JSON.stringify(newVal))
  }
}, { deep: true })

const handleScroll = () => {
  if (!shadeGridRef.value || !exportCardRef.value) return
  
  const gridRect = shadeGridRef.value.getBoundingClientRect()
  const expRect = exportCardRef.value.getBoundingClientRect()
  const vh = window.innerHeight || document.documentElement.clientHeight
  
  const sectionTop = gridRect.top
  const sectionBottom = expRect.bottom
  
  // Show button purely while grid or export card is visible on screen.
  // Fades out exactly when scrolling past Export card into Themes.
  // Safe-guard: only hide if we actively scrolled PAST the section (top < 0) 
  // and the bottom edge crossed the floating button area (bottom < vh - 60).
  if (sectionTop < 0 && sectionBottom < vh - 60) {
    isShadeExplorerVisible.value = false
  } else {
    // Otherwise, show it whenever it enters the screen from the bottom
    isShadeExplorerVisible.value = sectionTop < vh
  }
}

onMounted(() => {
  generateShades()
  
  // Set up robust scroll listener for mobile floating button visibility
  if (process.client) {
    window.addEventListener('scroll', handleScroll, { passive: true })
    // Ensure initial state is calculated after layout paints
    setTimeout(handleScroll, 100)
  }
  
  // Load saved palettes from browser session
  if (process.client) {
    const stored = localStorage.getItem('figo_saved_palettes')
    if (stored) {
      try {
        savedPalettes.value = JSON.parse(stored)
      } catch (e) {
        console.error('Failed to load saved palettes')
      }
    }
  }
})

onUnmounted(() => {
  if (process.client) {
    window.removeEventListener('scroll', handleScroll)
  }
})
</script>

<style scoped>
.glass-panel {
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}

/* Premium Color Sliders */
.custom-color-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: white;
  box-shadow: 0 2px 8px rgba(0,0,0,0.4);
  cursor: pointer;
  border: 1px solid rgba(0,0,0,0.1);
  transition: transform 0.1s;
}
.custom-color-slider::-webkit-slider-thumb:active {
  transform: scale(1.1);
}
.custom-color-slider::-moz-range-thumb {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: white;
  box-shadow: 0 2px 8px rgba(0,0,0,0.4);
  cursor: pointer;
  border: 1px solid rgba(0,0,0,0.1);
}

.custom-color-slider-small::-webkit-slider-thumb {
  width: 20px;
  height: 20px;
}
.custom-color-slider-small::-moz-range-thumb {
  width: 20px;
  height: 20px;
}

/* Precise Numeric Inputs */
.custom-hide-arrows::-webkit-outer-spin-button,
.custom-hide-arrows::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
.custom-hide-arrows {
  -moz-appearance: textfield;
}
</style>

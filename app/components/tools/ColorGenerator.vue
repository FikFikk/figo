<template>
  <div class="space-y-8">
    <!-- Main Generator UI -->
    <div class="glass-panel rounded-xl p-6 md:p-8" :class="isDark ? 'border border-white/5' : 'border border-slate-100'">
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-full flex items-center justify-center" :class="isDark ? 'bg-primary/15' : 'bg-blue-50'">
            <span class="material-symbols-outlined text-xl text-primary">palette</span>
          </div>
          <div>
            <h2 class="font-headline font-bold text-lg" :class="isDark ? 'text-white' : 'text-slate-900'">Color Palette Generator</h2>
            <p class="text-xs" :class="isDark ? 'text-gray-500' : 'text-slate-400'">Create harmonic palettes and explore shades</p>
          </div>
        </div>

        <div class="flex flex-wrap items-center gap-2">
          <!-- Base Color Picker -->
          <div class="flex items-center gap-2 px-3 py-2 rounded-xl border border-black/5 dark:border-white/5 bg-white/50 dark:bg-black/20" title="Lock a starting color">
            <input 
              type="color" 
              v-model="paletteSeedColor" 
              class="w-5 h-5 rounded overflow-hidden border-0 p-0 cursor-pointer bg-transparent"
              @input="generateHarmonicFromSeed"
            />
            <span class="text-[10px] font-bold uppercase opacity-60">Base</span>
          </div>

          <button 
            @click="generateHarmonicFromSeed"
            class="px-4 py-2.5 bg-primary/10 text-primary dark:text-primary rounded-xl font-headline font-bold text-sm hover:scale-[1.02] transition-all flex items-center gap-2 border border-primary/20"
            title="Generate matching colors for the Base"
          >
            <span class="material-symbols-outlined text-base">shuffle</span>
            <span class="hidden sm:inline">Mix Base</span>
          </button>

          <button 
            @click="generateRandomPalette"
            class="px-4 py-2.5 bg-primary text-on-primary rounded-xl font-headline font-bold text-sm hover:scale-[1.02] hover:shadow-lg transition-all active:scale-[0.98] flex items-center gap-2"
            title="Total Randomize"
          >
            <span class="material-symbols-outlined text-base">autorenew</span>
            <span class="hidden sm:inline">Random</span> All
          </button>
        </div>
      </div>

      <!-- Hero Palette Display -->
      <div class="grid grid-cols-5 gap-1.5 md:gap-3 mb-8 h-32 md:h-64">
        <div 
          v-for="(color, index) in currentPalette" 
          :key="index"
          class="relative group rounded-md md:rounded-lg overflow-hidden cursor-pointer shadow-sm border border-black/5 dark:border-white/5"
          @click="selectColor(color)"
        >
          <div 
            class="absolute inset-0 transition-transform duration-500 group-hover:scale-110"
            :style="{ backgroundColor: color }"
          ></div>
          <!-- Hover Overlay -->
          <div class="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20 backdrop-blur-[2px]">
            <span class="material-symbols-outlined text-white text-base md:text-xl mb-1">content_copy</span>
            <span class="text-white text-[8px] md:text-[10px] font-bold tracking-tighter">{{ color }}</span>
          </div>
          <!-- Static Hex Label (Centered Bottom) -->
          <div class="absolute bottom-3 left-0 right-0 flex justify-center pointer-events-none group-hover:opacity-0 transition-opacity">
            <span class="px-2 py-1 rounded bg-black/10 backdrop-blur-md text-white text-[8px] md:text-[10px] font-black uppercase tracking-wider">
              {{ color }}
            </span>
          </div>
        </div>
      </div>

      <!-- Shade Explorer -->
      <div>
        <div class="flex items-center justify-between mb-4 border-b border-black/5 dark:border-white/5 pb-3">
          <div class="flex items-center gap-2">
            <span class="w-1 h-4 bg-primary rounded-full"></span>
            <h3 class="font-headline font-bold text-xs uppercase tracking-widest" :class="isDark ? 'text-gray-400' : 'text-slate-500'">Shade Explorer</h3>
          </div>
          <div class="flex items-center gap-2 px-3 py-1.5 rounded-lg" :class="isDark ? 'bg-white/5' : 'bg-slate-50'">
            <!-- Shade Level Adjuster -->
            <button @click="shadeLevels > 3 && shadeLevels--; generateShades()" :disabled="shadeLevels <= 3" class="w-5 h-5 flex items-center justify-center rounded bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed">
              <span class="material-symbols-outlined text-[10px]">remove</span>
            </button>
            <span class="text-[10px] font-mono font-bold w-4 text-center">{{ shadeLevels }}</span>
            <button @click="shadeLevels < 25 && shadeLevels++; generateShades()" :disabled="shadeLevels >= 25" class="w-5 h-5 flex items-center justify-center rounded bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed">
              <span class="material-symbols-outlined text-[10px]">add</span>
            </button>
            <div class="w-px h-3 bg-black/10 dark:bg-white/10 mx-1"></div>

            <input 
              type="color" 
              v-model="baseColor" 
              class="w-5 h-5 rounded overflow-hidden border-0 p-0 cursor-pointer bg-transparent"
              @input="generateShades"
            />
            <span class="text-[10px] font-mono font-bold uppercase hidden sm:inline" :class="isDark ? 'text-gray-400' : 'text-slate-500'">{{ baseColor }}</span>
          </div>
        </div>
        
        <div class="flex gap-0.5 sm:gap-1 md:gap-2 h-16 md:h-20 w-full">
          <div 
            v-for="(shade, index) in shades" 
            :key="index"
            class="flex-1 relative group rounded-md md:rounded-sm overflow-hidden cursor-pointer border border-black/5 dark:border-white/5 min-w-[6px] sm:min-w-[12px]"
            @click="copyToClipboard(shade)"
          >
            <div 
              class="absolute inset-0 transition-all duration-300"
              :style="{ backgroundColor: shade }"
            ></div>
            <div class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30">
              <span class="text-white text-[8px] font-bold">{{ shade }}</span>
            </div>
          </div>
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
const { isDark } = useColorMode()

// State
const currentPalette = ref<string[]>(['#6366f1', '#a855f7', '#ec4899', '#f43f5e', '#f59e0b'])
const paletteSeedColor = ref('#6366f1')
const baseColor = ref('#6366f1')
const shadeLevels = ref(10)
const shades = ref<string[]>([])
const savedPalettes = ref<string[][]>([])
const copiedColor = ref<string | null>(null)

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
    const h = (hsl.h + steps[i] + 360) % 360
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

function generateShades() {
  const hex = baseColor.value
  const hsl = hexToHsl(hex)
  const newShades: string[] = []
  
  const levels = shadeLevels.value
  const minL = 10 // darkest 10% lightness
  const maxL = 95 // lightest 95% lightness
  const step = (maxL - minL) / Math.max(1, levels - 1)
  
  for (let i = 0; i < levels; i++) {
    const l = minL + (i * step)
    newShades.push(hslToHex(hsl.h, hsl.h === 0 && hsl.s === 0 ? 0 : hsl.s, l))
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

// Color conversion helpers
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

onMounted(() => {
  generateShades()
  
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
</script>

<style scoped>
.glass-panel {
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}
</style>

<template>
  <div class="min-h-screen transition-colors duration-500 font-sans p-4 lg:p-10 pt-28 lg:pt-36 selection:bg-primary/30 overflow-x-hidden"
    :class="isDark ? 'bg-[#050608] text-gray-300 bg-[radial-gradient(circle_at_50%_0%,rgba(56,189,248,0.05)_0%,transparent_50%)]' : 'bg-slate-50 text-slate-600'">
    
    <!-- Top Action Bar -->
    <header class="max-w-[1800px] mx-auto mb-10 lg:mb-16 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 animate-fade-in-down">
      <div class="flex items-center gap-4 lg:gap-6">
        <div class="relative group">
           <div class="absolute inset-0 bg-primary/30 blur-2xl group-hover:bg-primary/50 transition-all rounded-full"></div>
           <div class="relative w-12 h-12 lg:w-16 lg:h-16 rounded-2xl lg:rounded-[1.5rem] border flex items-center justify-center shadow-2xl transition-all"
             :class="isDark ? 'bg-gradient-to-br from-[#1e293b] to-[#0f172a] border-white/10' : 'bg-white border-slate-200'">
              <span class="material-symbols-outlined text-primary text-2xl lg:text-4xl font-light">auto_awesome</span>
           </div>
        </div>
        <div>
          <h1 class="text-2xl lg:text-5xl font-black tracking-tight font-headline drop-shadow-md"
            :class="isDark ? 'text-white' : 'text-slate-900'">
            AI Pro <span class="bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent">Studio</span>
          </h1>
          <p class="text-[9px] lg:text-[11px] font-bold uppercase tracking-[0.4em] mt-1 lg:mt-2 flex items-center gap-2"
            :class="isDark ? 'text-gray-500' : 'text-slate-400'">
            INTERFACE CORE <span class="w-1.5 h-1.5 rounded-full bg-primary/40"></span> v.4.8
          </p>
        </div>
      </div>

      <div class="flex items-center gap-3 w-full md:w-auto">
        <button v-if="imageLoaded" @click="resetFilters" 
          class="flex-1 md:flex-none h-12 lg:h-14 px-5 lg:px-7 rounded-2xl border transition-all flex items-center justify-center gap-3 group backdrop-blur-xl"
          :class="isDark ? 'bg-white/[0.03] border-white/5 hover:bg-red-500/10 hover:text-red-400' : 'bg-white border-slate-200 hover:bg-red-50 hover:text-red-500 shadow-sm'">
          <span class="material-symbols-outlined text-xl transition-transform group-hover:rotate-[-45deg]">restart_alt</span>
          <span class="text-[10px] font-black uppercase tracking-widest leading-none">Discard</span>
        </button>
        
        <button v-if="imageLoaded" @click="downloadImage" 
          class="flex-1 md:flex-none h-12 lg:h-14 px-7 lg:px-10 rounded-2xl bg-primary text-white font-black hover:shadow-[0_0_40px_rgba(59,130,246,0.6)] hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3 relative overflow-hidden group shadow-2xl">
          <span class="material-symbols-outlined text-xl">ios_share</span>
          <span class="text-[10px] font-black uppercase tracking-widest leading-none">Export</span>
          <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
        </button>
      </div>
    </header>

    <!-- Main Grid -->
    <div class="max-w-[1800px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
      
      <!-- Desktop Sidebar Left -->
      <aside class="hidden lg:block lg:col-span-3 space-y-8 animate-fade-in-left">
        <section class="pro-card group" :class="isDark ? 'bg-white/[0.03] border-white/5' : 'bg-white border-slate-200 shadow-xl'">
          <div class="flex items-center justify-between mb-5">
             <div class="flex items-center gap-2">
                <span class="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                <h3 class="text-[10px] font-black uppercase tracking-widest leading-none" :class="isDark ? 'text-gray-400' : 'text-slate-500'">Luminance Spectrum</h3>
             </div>
          </div>
          <div class="relative h-40 rounded-3xl border overflow-hidden shadow-inner" :class="isDark ? 'bg-black/60 border-white/5' : 'bg-slate-100 border-slate-200'">
             <canvas ref="histCanvas" class="w-full h-full mix-blend-multiply dark:mix-blend-screen"></canvas>
          </div>
        </section>

        <section class="pro-card" :class="isDark ? 'bg-white/[0.03] border-white/5' : 'bg-white border-slate-200 shadow-xl'">
           <h3 class="text-[10px] font-black text-primary uppercase tracking-[0.4em] mb-8 flex items-center gap-3">
              <span class="material-symbols-outlined text-base">neurology</span> AI Core Model
           </h3>
           <div class="space-y-3">
             <button v-for="model in aiModels" :key="model.id" @click="selectedModelId = model.id"
               class="w-full p-5 rounded-3xl text-left border-2 transition-all duration-300 relative group flex items-center gap-5 overflow-hidden"
               :class="selectedModelId === model.id ? 'bg-primary/20 border-primary/40 text-primary-content' : (isDark ? 'bg-white/[0.01] border-transparent text-gray-500 hover:bg-white/[0.04]' : 'bg-slate-50 border-transparent text-slate-400 hover:bg-slate-100')">
                <span class="material-symbols-outlined text-3xl" :class="selectedModelId === model.id ? 'text-primary' : 'opacity-40'">{{ model.icon }}</span>
                <div class="flex flex-col">
                  <span class="text-[11px] font-black uppercase tracking-widest leading-none" :class="selectedModelId === model.id ? 'text-primary' : ''">{{ model.label }}</span>
                  <span class="text-[9px] font-medium opacity-40 mt-1.5 leading-tight">{{ model.desc }}</span>
                </div>
             </button>
           </div>
        </section>
      </aside>

      <!-- Center Workspace -->
      <main class="lg:col-span-6 flex flex-col items-center transition-all duration-500" :class="activeSheet ? 'translate-y-[-10vh] lg:translate-y-0 scale-95 lg:scale-100 opacity-60 lg:opacity-100' : ''">
        <div class="relative w-full flex flex-col items-center justify-center min-h-[400px] lg:min-h-[700px]" ref="workspaceRef">
           <!-- Empty State -->
           <div v-if="!imageLoaded" @click="$refs.fileInput.click()" @drop.prevent="handleDrop"
             class="relative w-full aspect-square max-w-lg rounded-[3rem] lg:rounded-[4rem] border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all group duration-700 mx-4"
             :class="isDark ? 'bg-white/[0.02] border-white/5 hover:bg-white/[0.04] hover:border-primary/20' : 'bg-white border-slate-200 hover:bg-slate-50 hover:border-primary/30 shadow-sm'">
              <div class="relative flex flex-col items-center gap-6 lg:gap-8 group-hover:scale-105 transition-transform duration-700">
                 <div class="w-24 h-24 lg:w-32 lg:h-32 rounded-[2rem] lg:rounded-[2.5rem] border flex items-center justify-center shadow-2xl relative rotate-[-6deg] group-hover:rotate-0 transition-all duration-700"
                   :class="isDark ? 'bg-primary/10 border-primary/20' : 'bg-primary/5 border-primary/10'">
                    <span class="material-symbols-outlined text-primary text-5xl lg:text-6xl font-extralight">add_a_photo</span>
                 </div>
                 <div class="text-center space-y-2 px-6">
                   <h2 class="text-2xl lg:text-3xl font-black tracking-tighter" :class="isDark ? 'text-white' : 'text-slate-800'">Enter The Studio</h2>
                   <p class="text-xs lg:text-sm font-medium tracking-tight" :class="isDark ? 'text-gray-500' : 'text-slate-400'">Drop your image or browse local storage.</p>
                 </div>
              </div>
              <input type="file" ref="fileInput" class="hidden" accept="image/*" @change="handleFileSelect" />
           </div>

           <!-- Editor UI -->
           <div v-show="imageLoaded" class="w-full flex flex-col items-center animate-fade-in relative">
              <div class="relative rounded-3xl lg:rounded-[3.5rem] shadow-[0_60px_150px_rgba(0,0,0,0.5)] lg:shadow-[0_60px_150px_rgba(0,0,0,0.9)] border-4 lg:border-[6px] overflow-hidden transition-all duration-700 active:scale-[1.005]"
                :class="isDark ? 'border-[#111827] bg-[#090b0f]' : 'border-white bg-[#f8fafc]'"
                :style="{ aspectRatio: `${imgWidth}/${imgHeight}`, maxWidth: '100%', maxHeight: '72vh', width: imgWidth >= imgHeight ? '100%' : 'auto', height: imgHeight > imgWidth ? '72vh' : 'auto' }">
                 
                 <!-- Badges -->
                 <div class="absolute top-4 lg:top-6 left-4 lg:left-6 z-40 px-3 lg:px-5 py-1.5 lg:py-2.5 rounded-xl lg:rounded-2xl backdrop-blur-2xl border text-[8px] lg:text-[9px] font-black uppercase tracking-[0.4em] pointer-events-none"
                   :class="isDark ? 'bg-black/40 border-white/10 text-gray-500' : 'bg-white/60 border-slate-200 text-slate-400'">Raw</div>
                 <div class="absolute top-4 lg:top-6 right-4 lg:right-6 z-40 px-4 lg:px-5 py-1.5 lg:py-2.5 rounded-xl lg:rounded-2xl backdrop-blur-2xl border text-[8px] lg:text-[9px] font-black uppercase tracking-[0.4em] pointer-events-none"
                   :class="isDark ? 'bg-primary/20 border-primary/20 text-primary' : 'bg-primary/10 border-primary/10 text-primary'">Enhanced</div>

                 <canvas ref="originalCanvas" class="absolute inset-0 w-full h-full object-contain"></canvas>
                 <canvas ref="processedCanvas" class="absolute inset-0 w-full h-full object-contain pointer-events-none" :style="{ clipPath: `inset(0 0 0 ${splitPos}%)` }"></canvas>

                 <!-- Handle -->
                 <div class="absolute top-0 bottom-0 z-40 w-16 -ml-8 flex items-center justify-center cursor-col-resize" :style="{ left: `${splitPos}%` }" @mousedown="startDrag" @touchstart="startDrag">
                    <div class="absolute inset-y-0 left-1/2 w-[2px] lg:w-[3px] transition-colors" :class="isDark ? 'bg-white/20' : 'bg-black/10'"></div>
                    <div class="relative w-10 h-10 lg:w-12 lg:h-12 rounded-full backdrop-blur-3xl border-2 flex items-center justify-center shadow-2xl transition-all"
                      :class="isDark ? 'bg-[#050608]/90 border-white/10' : 'bg-white/90 border-slate-200'">
                       <span class="material-symbols-outlined text-xl lg:text-2xl opacity-50" :class="isDark ? 'text-white' : 'text-slate-800'">unfold_more_double</span>
                    </div>
                 </div>

                 <!-- Loading -->
                 <div v-show="isApplying" class="absolute inset-0 z-50 bg-black/10 backdrop-blur-[1px] flex items-center justify-center">
                    <div class="w-10 h-10 rounded-full border-4 border-primary/20 border-t-primary animate-spin"></div>
                 </div>
              </div>

              <!-- Badges Mobile Bottom -->
              <div v-if="!activeSheet" class="flex justify-center gap-3 mt-6 animate-fade-in-up md:hidden">
                 <div class="px-3 py-1.5 rounded-lg border backdrop-blur-md flex items-center gap-2" :class="isDark ? 'bg-white/[0.02] border-white/5' : 'bg-white border-slate-200'">
                    <span class="text-[8px] font-black uppercase tracking-widest leading-none opacity-40">Res</span>
                    <span class="text-[10px] font-bold">{{ imgWidth }}x{{ imgHeight }}</span>
                 </div>
              </div>
           </div>
        </div>
      </main>

      <!-- Desktop Sidebar Right -->
      <aside class="hidden lg:block lg:col-span-3 space-y-8 animate-fade-in-right">
        <section class="pro-card" :class="isDark ? 'bg-white/[0.03] border-white/5' : 'bg-white border-slate-200 shadow-xl'">
           <h3 class="text-[10px] font-black uppercase tracking-[0.4em] mb-8 flex items-center gap-3" :class="isDark ? 'text-gray-500' : 'text-slate-500'">
              <span class="material-symbols-outlined text-base">tune</span> Adjustments
           </h3>
           <div class="space-y-4">
              <FilterSlider v-model="filters.brightness" label="Exposure" icon="light_mode" min="-100" max="100" />
              <FilterSlider v-model="filters.contrast" label="Contrast" icon="contrast" min="-100" max="100" />
              <FilterSlider v-model="filters.saturation" label="Saturation" icon="palette" min="0" max="200" />
           </div>
        </section>
        <section class="pro-card border-t-4 border-t-primary/20" :class="isDark ? 'bg-white/[0.03] border-white/5' : 'bg-white border-slate-200 shadow-xl'">
           <h3 class="text-[10px] font-black text-primary uppercase tracking-[0.4em] mb-8 flex items-center gap-3">
              <span class="material-symbols-outlined text-base">auto_fix_high</span> AI Precision
           </h3>
           <div class="space-y-4">
              <FilterSlider v-model="filters.sharpen" label="Clarity Core" icon="auto_highlight" min="0" max="10" step="0.5" />
              <FilterSlider v-model="filters.denoise" label="Denoise Master" icon="opacity" min="0" max="10" step="0.5" />
           </div>
        </section>
      </aside>

    </div>

    <!-- MOBILE FLOATING CONTROLS (NON-MODAL PREVIEW) -->
    <Transition name="slide-up">
      <div v-show="imageLoaded" class="lg:hidden fixed bottom-12 left-0 right-0 z-[70] px-4 pointer-events-none">
        
        <!-- Bottom Sheet (Inline Preview Mode) -->
        <Transition name="sheet-fold">
          <div v-if="activeSheet" class="w-full max-w-lg mx-auto mb-6 pointer-events-auto rounded-[2.5rem] border shadow-2xl overflow-hidden transition-all duration-500 transform origin-bottom"
            :class="isDark ? 'bg-[#0d1017]/90 backdrop-blur-3xl border-white/10' : 'bg-white/95 backdrop-blur-3xl border-slate-200'">
             
             <!-- Pull Bar -->
             <div class="w-10 h-1 bg-gray-500/20 rounded-full mx-auto mt-3 mb-1" @click="activeSheet = null"></div>
             
             <div class="p-6 pt-2">
                <header class="flex items-center justify-between mb-6">
                   <h3 class="text-[10px] font-black uppercase tracking-[0.3em] text-primary">{{ sheetTitle }}</h3>
                   <button @click="activeSheet = null" class="w-8 h-8 rounded-full flex items-center justify-center" :class="isDark ? 'bg-white/5' : 'bg-slate-100'">
                      <span class="material-symbols-outlined text-sm">close</span>
                   </button>
                </header>

                <div class="space-y-6">
                   <template v-if="activeSheet === 'models'">
                      <div class="grid grid-cols-1 gap-2">
                        <button v-for="model in aiModels" :key="model.id" @click="selectedModelId = model.id"
                          class="p-4 rounded-2xl border transition-all text-left flex items-center gap-4"
                          :class="selectedModelId === model.id ? 'bg-primary/20 border-primary/40' : (isDark ? 'bg-white/[0.03] border-transparent text-gray-500' : 'bg-slate-50 border-transparent text-slate-500')">
                           <span class="material-symbols-outlined text-xl" :class="selectedModelId === model.id ? 'text-primary' : ''">{{ model.icon }}</span>
                           <span class="text-[10px] font-black uppercase tracking-widest leading-none">{{ model.label }}</span>
                        </button>
                      </div>
                   </template>

                   <template v-if="activeSheet === 'tune'">
                      <div class="space-y-4">
                         <FilterSlider v-model="filters.brightness" label="Exp" icon="light_mode" min="-100" max="100" />
                         <FilterSlider v-model="filters.contrast" label="Con" icon="contrast" min="-100" max="100" />
                         <FilterSlider v-model="filters.saturation" label="Sat" icon="palette" min="0" max="200" />
                      </div>
                   </template>

                   <template v-if="activeSheet === 'precision'">
                      <div class="space-y-4">
                         <FilterSlider v-model="filters.sharpen" label="Sharp" icon="auto_highlight" min="0" max="10" step="0.5" />
                         <FilterSlider v-model="filters.denoise" label="Denoise" icon="opacity" min="0" max="10" step="0.5" />
                      </div>
                   </template>
                </div>
             </div>
          </div>
        </Transition>

        <!-- Main Nav Pills -->
        <div class="bg-black/95 dark:bg-[#111827]/80 backdrop-blur-3xl border border-white/10 rounded-full p-2 flex items-center justify-between shadow-2xl pointer-events-auto max-w-xs mx-auto">
           <button @click="toggleSheet('models')" class="flex-1 h-12 rounded-full flex flex-col items-center justify-center gap-1 transition-all" :class="activeSheet === 'models' ? 'text-primary' : 'text-gray-400'">
              <span class="material-symbols-outlined text-lg">neurology</span>
              <span class="text-[7px] font-black uppercase tracking-tighter">AI Core</span>
           </button>
           <button @click="toggleSheet('tune')" class="flex-1 h-12 rounded-full flex flex-col items-center justify-center gap-1 transition-all" :class="activeSheet === 'tune' ? 'text-primary' : 'text-gray-400'">
              <span class="material-symbols-outlined text-lg">tune</span>
              <span class="text-[7px] font-black uppercase tracking-tighter">Adjust</span>
           </button>
           <button @click="toggleSheet('precision')" class="flex-1 h-12 rounded-full flex flex-col items-center justify-center gap-1 transition-all" :class="activeSheet === 'precision' ? 'text-primary' : 'text-gray-400'">
              <span class="material-symbols-outlined text-lg">auto_fix_high</span>
              <span class="text-[7px] font-black uppercase tracking-tighter">Detail</span>
           </button>
        </div>
      </div>
    </Transition>

  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch, computed } from 'vue'

const { isDark } = useColorMode()

const aiModels = [
  { id: 'balanced', label: 'Balanced AI', icon: 'auto_awesome', desc: 'Hybrid detail model' },
  { id: 'hd_clarity', label: 'Pro HD Clarity', icon: 'center_focus_strong', desc: 'Ultra detail focus' },
  { id: 'denoise', label: 'Soft Master', icon: 'blur_on', desc: 'Smooth noise removal' }
]

const histCanvas = ref<HTMLCanvasElement | null>(null), originalCanvas = ref<HTMLCanvasElement | null>(null), processedCanvas = ref<HTMLCanvasElement | null>(null)
const fileInput = ref<HTMLInputElement | null>(null), workspaceRef = ref<HTMLElement | null>(null)

const imageLoaded = ref(false), isDraggingInput = ref(false), isDraggingSplit = ref(false), isApplying = ref(false), splitPos = ref(50)
const imgWidth = ref(0), imgHeight = ref(0), selectedModelId = ref('balanced'), activeSheet = ref<string | null>(null)

const sheetTitle = computed(() => {
  if (activeSheet.value === 'models') return 'AI Core Mode'
  if (activeSheet.value === 'tune') return 'Visual Tune'
  if (activeSheet.value === 'precision') return 'Detail Pro'
  return ''
})

function toggleSheet(val: string) {
  if (activeSheet.value === val) activeSheet.value = null
  else activeSheet.value = val
}

const filters = reactive({ brightness: 0, contrast: 0, saturation: 100, sharpen: 0, denoise: 0 })
let originalImgObj: HTMLImageElement | null = null, bufferCanvas: HTMLCanvasElement | null = null, bufferCtx: CanvasRenderingContext2D | null = null

function resetFilters() { filters.brightness = 0; filters.contrast = 0; filters.saturation = 100; filters.sharpen = 0; filters.denoise = 0; applyFilters() }
function handleDrop(e: DragEvent) { isDraggingInput.value = false; const file = e.dataTransfer?.files[0]; if (file?.type.startsWith('image/')) loadImage(file) }
function handleFileSelect(e: Event) { const file = (e.target as HTMLInputElement).files?.[0]; if (file) loadImage(file) }

function loadImage(file: File) {
  const reader = new FileReader()
  reader.onload = (e) => {
    originalImgObj = new Image()
    originalImgObj.onload = () => { imgWidth.value = originalImgObj!.width; imgHeight.value = originalImgObj!.height; imageLoaded.value = true; setupCanvases(); applyFilters() }
    originalImgObj.src = e.target?.result as string
  }
  reader.readAsDataURL(file)
}

function setupCanvases() {
  if (!originalImgObj || !originalCanvas.value || !processedCanvas.value) return
  const w = originalImgObj.width, h = originalImgObj.height
  originalCanvas.value.width = w; originalCanvas.value.height = h; processedCanvas.value.width = w; processedCanvas.value.height = h
  originalCanvas.value.getContext('2d')!.drawImage(originalImgObj, 0, 0)
  if (!bufferCanvas) bufferCanvas = document.createElement('canvas')
  bufferCanvas.width = w; bufferCanvas.height = h; bufferCtx = bufferCanvas.getContext('2d', { willReadFrequently: true })
}

function startDrag(e: MouseEvent | TouchEvent) {
  isDraggingSplit.value = true
  const move = (ev: MouseEvent | TouchEvent) => onDrag(ev)
  const end = () => {
    isDraggingSplit.value = false; document.removeEventListener('mousemove', move); document.removeEventListener('mouseup', end); document.removeEventListener('touchmove', move); document.removeEventListener('touchend', end)
  }
  document.addEventListener('mousemove', move); document.addEventListener('mouseup', end); document.addEventListener('touchmove', move); document.addEventListener('touchend', end)
}

function onDrag(e: MouseEvent | TouchEvent) {
  if (!isDraggingSplit.value || !workspaceRef.value) return
  const rect = workspaceRef.value.getBoundingClientRect(), x = (e instanceof MouseEvent ? e.clientX : e.touches[0].clientX) - rect.left
  splitPos.value = Math.max(0, Math.min(100, (x / rect.width) * 100))
}

watch(filters, () => imageLoaded.value && applyFilters(), { deep: true })
watch(selectedModelId, () => imageLoaded.value && applyFilters())

async function applyFilters() {
  if (!originalImgObj || !bufferCtx || !processedCanvas.value) return
  isApplying.value = true; requestAnimationFrame(() => {
    bufferCtx!.drawImage(originalImgObj!, 0, 0); let imageData = bufferCtx!.getImageData(0, 0, bufferCanvas!.width, bufferCanvas!.height), pix = imageData.data
    const b = filters.brightness, c = (filters.contrast + 100) / 100, s = filters.saturation / 100
    for (let i = 0; i < pix.length; i += 4) {
      pix[i]+=b; pix[i+1]+=b; pix[i+2]+=b
      for (let j=0; j<3; j++) pix[i+j] = (pix[i+j]-128)*c+128
      if (s !== 1) { 
        const l = 0.299*pix[i]+0.587*pix[i+1]+0.114*pix[i+2]
        pix[i]=pix[i]*s+l*(1-s); pix[i+1]=pix[i+1]*s+l*(1-s); pix[i+2]=pix[i+2]*s+l*(1-s) 
      }
    }
    if (filters.sharpen > 0) imageData = applySharpen(imageData, filters.sharpen, selectedModelId.value)
    if (filters.denoise > 0) imageData = applyDenoise(imageData, filters.denoise)
    processedCanvas.value!.getContext('2d')!.putImageData(imageData, 0, 0); updateHistogram(imageData); isApplying.value = false
  })
}

function applySharpen(imageData: ImageData, amount: number, model: string) {
  const w = imageData.width, h = imageData.height, pix = imageData.data, o = new Uint8ClampedArray(pix.length)
  let p = amount; if (model === 'hd_clarity') p *= 2.8; if (model === 'denoise') p *= 0.5
  const cv = 1+p, nv = -(p/8)
  for(let i=3; i<pix.length; i+=4) o[i] = pix[i] || 255
  for (let y=1; y<h-1; y++) for (let x=1; x<w-1; x++) for (let c=0; c<3; c++) {
    const i = (y*w+x)*4+c; let v = (pix[i]||0)*cv + ((pix[((y-1)*w+x-1)*4+c]||0)+(pix[((y-1)*w+x)*4+c]||0)+(pix[((y-1)*w+x+1)*4+c]||0)+(pix[(y*w+x-1)*4+c]||0)+(pix[(y*w+x+1)*4+c]||0)+(pix[((y+1)*w+x-1)*4+c]||0)+(pix[((y+1)*w+x)*4+c]||0)+(pix[((y+1)*w+x+1)*4+c]||0))*nv
    if (model === 'hd_clarity' && amount > 2) v = (v-128)*1.1+128 
    o[i] = Math.min(255, Math.max(0, v))
  }
  return new ImageData(o, w, h)
}

function applyDenoise(imageData: ImageData, amount: number) {
  const w = imageData.width, h = imageData.height, pix = imageData.data, o = new Uint8ClampedArray(pix.length), r = Math.floor(amount/2)||1
  for (let y=0; y<h; y++) for (let x=0; x<w; x++) {
    let rv=0, gv=0, bv=0, ct=0
    for (let dy=-r; dy<=r; dy++) for (let dx=-r; dx<=r; dx++) {
      const nx=x+dx, ny=y+dy; if (nx>=0 && nx<w && ny>=0 && ny<h) { const i=(ny*w+nx)*4; rv+=pix[i]||0; gv+=pix[i+1]||0; bv+=pix[i+2]||0; ct++ }
    }
    const i=(y*w+x)*4; o[i]=rv/ct; o[i+1]=gv/ct; o[i+2]=bv/ct; o[i+3]=pix[i+3]||255
  }
  return new ImageData(o, w, h)
}

function updateHistogram(imageData: ImageData) {
  if (!histCanvas.value) return
  const ctx = histCanvas.value.getContext('2d')!, w = histCanvas.value.width, h = histCanvas.value.height
  ctx.clearRect(0, 0, w, h); const d = imageData.data, r = new Uint32Array(256), g = new Uint32Array(256), b = new Uint32Array(256)
  for (let i=0; i<d.length; i+=4) { r[d[i]||0]++; g[d[i+1]||0]++; b[d[i+2]||0]++ }
  const m = Math.max(...r, ...g, ...b); const draw = (data: Uint32Array, col: string) => {
    ctx.beginPath(); ctx.strokeStyle = col; ctx.lineWidth = 1; ctx.globalCompositeOperation = 'screen'
    for (let i=0; i<256; i++) { const x = (i/255)*w, y = h-(data[i]/m)*h; i===0 ? ctx.moveTo(x,y) : ctx.lineTo(x,y) }
    ctx.stroke()
  }
  draw(r, '#ef4444'); draw(g, '#22c55e'); draw(b, '#3b82f6')
}

function downloadImage() { if (!processedCanvas.value) return; const l = document.createElement('a'); l.download = `Figo_AI_Pro_${Date.now()}.jpg`; l.href = processedCanvas.value.toDataURL('image/jpeg', 1.0); l.click() }
</script>

<style scoped>
.pro-card { @apply p-8 rounded-[2.5rem] border transition-all duration-500 backdrop-blur-3xl; }
.font-headline { font-family: 'Outfit', sans-serif; }
.slide-up-enter-active, .slide-up-leave-active { transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1); }
.slide-up-enter-from { transform: translateY(100px); opacity: 0; }
.sheet-fold-enter-active, .sheet-fold-leave-active { transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
.sheet-fold-enter-from, .sheet-fold-leave-to { transform: scaleY(0.5) translateY(100%); opacity: 0; }
@keyframes fade-in-down { from { opacity: 0; transform: translateY(-30px); } to { opacity: 1; transform: translateY(0); } }
@keyframes fade-in-left { from { opacity: 0; transform: translateX(-30px); } to { opacity: 1; transform: translateX(0); } }
.animate-fade-in-down { animation: fade-in-down 0.8s ease forwards; }
.animate-fade-in-left { animation: fade-in-left 0.8s ease forwards; }
.animate-fade-in { animation: opacity 1s ease forwards; }
@keyframes opacity { from { opacity: 0; } to { opacity: 1; } }
.material-symbols-outlined { font-variation-settings: 'FILL' 1, 'wght' 200, 'GRAD' 0, 'opsz' 24; }
</style>

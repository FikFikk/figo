<template>
  <div class="min-h-screen bg-[#050608] bg-[radial-gradient(circle_at_50%_0%,rgba(56,189,248,0.05)_0%,transparent_50%)] text-gray-300 font-sans p-6 lg:p-10 pt-32 lg:pt-36 selection:bg-primary/30 overflow-x-hidden">
    
    <!-- Top Action Bar -->
    <header class="max-w-[1800px] mx-auto mb-16 flex flex-col md:flex-row justify-between items-start md:items-center gap-8 animate-fade-in-down">
      <div class="flex items-center gap-6">
        <div class="relative group">
           <div class="absolute inset-0 bg-primary/30 blur-2xl group-hover:bg-primary/50 transition-all rounded-full"></div>
           <div class="relative w-16 h-16 rounded-[1.5rem] bg-gradient-to-br from-[#1e293b] to-[#0f172a] border border-white/10 flex items-center justify-center shadow-2xl">
              <span class="material-symbols-outlined text-primary text-4xl font-light">auto_awesome</span>
           </div>
        </div>
        <div>
          <h1 class="text-4xl lg:text-5xl font-black tracking-tight font-headline text-white drop-shadow-md">
            AI Pro <span class="bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent">Studio</span>
          </h1>
          <p class="text-[11px] font-bold text-gray-500 uppercase tracking-[0.5em] mt-2 flex items-center gap-2">
            NEURAL ENHANCEMENT INTERFACE <span class="w-1.5 h-1.5 rounded-full bg-primary/40"></span> v.4.2
          </p>
        </div>
      </div>

      <div class="flex items-center gap-4">
        <button 
          v-if="imageLoaded"
          @click="resetFilters" 
          class="h-14 px-7 rounded-2xl bg-white/[0.03] hover:bg-red-500/10 hover:text-red-400 border border-white/5 transition-all flex items-center gap-3 group backdrop-blur-xl"
        >
          <span class="material-symbols-outlined text-xl transition-transform group-hover:rotate-[-45deg] duration-500">restart_alt</span>
          <span class="text-[11px] font-black uppercase tracking-widest leading-none">Discard Changes</span>
        </button>
        
        <button 
          v-if="imageLoaded"
          @click="downloadImage" 
          class="h-14 px-10 rounded-2xl bg-primary text-white font-black hover:shadow-[0_0_40px_rgba(59,130,246,0.6)] hover:scale-105 active:scale-95 transition-all flex items-center gap-3 relative overflow-hidden group shadow-2xl"
        >
          <span class="material-symbols-outlined text-xl">ios_share</span>
          <span class="text-[11px] font-black uppercase tracking-widest leading-none">Export Master</span>
          <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
        </button>
      </div>
    </header>

    <!-- 3-Column Surround Layout -->
    <div class="max-w-[1800px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
      
      <!-- Column 1: Scopes & AI Models (Left) -->
      <aside class="lg:col-span-3 space-y-8 animate-fade-in-left order-2 lg:order-1">
        
        <!-- Live Scopes -->
        <section class="pro-card group">
          <div class="flex items-center justify-between mb-5">
             <div class="flex items-center gap-2">
                <span class="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                <h3 class="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">Luminance Spectrum</h3>
             </div>
             <span class="text-[8px] font-bold text-gray-600 uppercase tracking-tighter">HD Trace</span>
          </div>
          <div class="relative h-40 bg-black/60 rounded-3xl border border-white/5 overflow-hidden ring-1 ring-white/5 shadow-inner">
             <canvas ref="histCanvas" class="w-full h-full mix-blend-screen"></canvas>
             <div v-if="!imageLoaded" class="absolute inset-0 flex flex-col items-center justify-center gap-3 opacity-20">
                <span class="material-symbols-outlined text-4xl">analytics</span>
                <span class="text-[9px] font-bold uppercase tracking-widest">Awaiting Input</span>
             </div>
          </div>
        </section>

        <!-- AI Engine Selector -->
        <section class="pro-card">
           <h3 class="text-[10px] font-black text-primary uppercase tracking-[0.4em] mb-8 flex items-center gap-3">
              <span class="material-symbols-outlined text-base">neurology</span>
              AI Processing Core
           </h3>
           <div class="space-y-3">
             <button 
               v-for="model in aiModels" 
               :key="model.id"
               @click="selectedModelId = model.id"
               class="w-full p-5 rounded-3xl text-left border-2 transition-all duration-300 relative group flex items-center gap-5 overflow-hidden"
               :class="selectedModelId === model.id 
                 ? 'bg-primary/20 border-primary/40 text-white' 
                 : 'bg-white/[0.01] border-transparent text-gray-500 hover:bg-white/[0.04]'"
             >
                <span class="material-symbols-outlined text-3xl transition-transform group-hover:scale-110" :class="selectedModelId === model.id ? 'text-primary' : 'opacity-40'">
                  {{ model.icon }}
                </span>
                <div class="flex flex-col">
                  <span class="text-[11px] font-black uppercase tracking-widest leading-none">{{ model.label }}</span>
                  <span class="text-[9px] font-medium opacity-40 mt-1.5 leading-tight">{{ model.desc }}</span>
                </div>
                <div v-if="selectedModelId === model.id" class="absolute right-4 top-1/2 -translate-y-1/2">
                   <span class="material-symbols-outlined text-primary text-xl">verified</span>
                </div>
             </button>
           </div>
        </section>
      </aside>

      <!-- Column 2: The Master Workspace (Center) -->
      <main class="lg:col-span-6 flex flex-col items-center order-1 lg:order-2">
        <div 
          class="relative w-full flex flex-col items-center justify-center min-h-[500px] lg:min-h-[700px]"
          ref="workspaceRef"
        >
           <!-- Empty State Container -->
           <div 
             v-if="!imageLoaded"
             class="relative w-full aspect-square max-w-lg rounded-[4rem] bg-white/[0.02] border-2 border-dashed border-white/5 flex flex-col items-center justify-center cursor-pointer hover:bg-white/[0.04] hover:border-primary/20 transition-all group duration-700"
             @click="$refs.fileInput.click()"
             @dragover.prevent="isDraggingInput = true"
             @dragleave.prevent="isDraggingInput = false"
             @drop.prevent="handleDrop"
           >
              <div class="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(59,130,246,0.1)_0%,transparent_70%)] opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
              
              <div class="relative flex flex-col items-center gap-8 group-hover:scale-105 transition-transform duration-700">
                 <div class="w-32 h-32 rounded-[2.5rem] bg-primary/10 border border-primary/20 flex items-center justify-center shadow-2xl relative rotate-[-6deg] group-hover:rotate-0 transition-all duration-700">
                    <span class="material-symbols-outlined text-primary text-6xl font-extralight">add_a_photo</span>
                    <div class="absolute -bottom-3 -right-3 w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center border-8 border-[#050608] shadow-2xl">
                       <span class="material-symbols-outlined text-xl">add</span>
                    </div>
                 </div>
                 <div class="text-center space-y-2">
                   <h2 class="text-3xl font-black text-white tracking-tighter">Enter The Studio</h2>
                   <p class="text-gray-500 text-sm font-medium tracking-tight">Drop your RAW image or click to start.<br/><span class="opacity-30 text-[9px] uppercase font-black tracking-[0.4em] block mt-2">Maximum Detail Engine Enabled</span></p>
                 </div>
              </div>
              <input type="file" ref="fileInput" class="hidden" accept="image/*" @change="handleFileSelect" />
           </div>

           <!-- Professional Workspace -->
           <div v-show="imageLoaded" class="w-full flex flex-col items-center animate-fade-in">
              <div 
                class="relative rounded-[3.5rem] shadow-[0_60px_150px_rgba(0,0,0,0.9),0_0_60px_rgba(59,130,246,0.15)] border-[6px] border-[#111827] overflow-hidden bg-[#090b0f] transition-all duration-700 active:scale-[1.005] group/image"
                :style="{ 
                   aspectRatio: `${imgWidth}/${imgHeight}`,
                   maxWidth: '100%',
                   maxHeight: '75vh',
                   width: imgWidth >= imgHeight ? '100%' : 'auto',
                   height: imgHeight > imgWidth ? '75vh' : 'auto'
                }"
              >
                 <!-- Labels -->
                 <div class="absolute top-6 left-6 z-50 pointer-events-none group-hover/image:translate-x-2 transition-transform duration-700">
                    <div class="px-5 py-2.5 rounded-2xl bg-black/40 backdrop-blur-2xl border border-white/10 text-[9px] font-black uppercase text-gray-500 tracking-[0.4em] shadow-2xl">
                       Original Raw
                    </div>
                 </div>
                 <div class="absolute top-6 right-6 z-50 pointer-events-none group-hover/image:-translate-x-2 transition-transform duration-700">
                    <div class="px-5 py-2.5 rounded-2xl bg-primary/20 backdrop-blur-2xl border border-primary/20 text-[9px] font-black uppercase text-primary tracking-[0.4em] shadow-2xl">
                       AI Enhanced
                    </div>
                 </div>

                 <!-- Layering -->
                 <canvas ref="originalCanvas" class="absolute inset-0 w-full h-full object-contain"></canvas>
                 <canvas ref="processedCanvas" class="absolute inset-0 w-full h-full object-contain pointer-events-none" :style="{ clipPath: `inset(0 0 0 ${splitPos}%)` }"></canvas>

                 <!-- Premium Split Handle -->
                 <div 
                   class="absolute top-0 bottom-0 z-40 group/handle cursor-col-resize w-20 -ml-10 flex items-center justify-center transition-none"
                   :style="{ left: `${splitPos}%` }"
                   @mousedown="startDrag"
                   @touchstart="startDrag"
                 >
                    <div class="absolute inset-y-0 left-1/2 w-[3px] bg-white/20 group-hover/handle:bg-primary/80 transition-colors shadow-[0_0_40px_rgba(59,130,246,0.7)]"></div>
                    <div class="relative w-12 h-12 rounded-full bg-[#050608]/90 backdrop-blur-3xl border-2 border-white/10 flex items-center justify-center shadow-[0_15px_60px_rgba(0,0,0,0.8)] group-hover/handle:scale-125 group-hover/handle:border-primary transition-all duration-500">
                       <span class="material-symbols-outlined text-white text-2xl opacity-50 group-hover/handle:opacity-100">unfold_more_double</span>
                       <div class="absolute -right-14 px-3 py-1.5 rounded-xl bg-primary text-white text-[10px] font-black opacity-0 group-hover/handle:opacity-100 transition-all pointer-events-none">
                         {{ Math.round(splitPos) }}%
                       </div>
                    </div>
                 </div>

                 <!-- Sync Overlay -->
                 <div v-show="isApplying" class="absolute inset-0 z-50 bg-[#050608]/20 backdrop-blur-[2px] flex flex-col items-center justify-center gap-5">
                    <div class="w-14 h-14 rounded-full border-4 border-primary/10 border-t-primary animate-spin"></div>
                    <span class="text-[10px] font-black text-white uppercase tracking-[0.6em] animate-pulse">Syncing...</span>
                 </div>
              </div>

              <!-- Status Footer -->
              <div class="flex flex-wrap justify-center gap-4 mt-10">
                 <div class="px-6 py-3 rounded-2xl bg-white/[0.02] border border-white/5 backdrop-blur-md flex items-center gap-4 group hover:bg-white/[0.04] transition-all">
                    <span class="text-[10px] font-black text-gray-600 uppercase tracking-widest leading-none">Resolution</span>
                    <span class="h-4 w-[1px] bg-white/10"></span>
                    <span class="text-[11px] font-bold text-white tracking-tight">{{ imgWidth }} × {{ imgHeight }} @ 72DPI</span>
                 </div>
                 <div class="px-6 py-3 rounded-2xl bg-primary/10 border border-primary/10 backdrop-blur-md flex items-center gap-3">
                    <div class="w-2 h-2 rounded-full bg-primary animate-ping"></div>
                    <span class="text-[11px] font-black text-primary uppercase tracking-[0.2em] leading-none">Neural Core Active</span>
                 </div>
              </div>
           </div>
        </div>
      </main>

      <!-- Column 3: Fine Tuning (Right) -->
      <aside class="lg:col-span-3 space-y-8 animate-fade-in-right order-3">
        
        <!-- Adjustments Base -->
        <section class="pro-card">
           <h3 class="text-[10px] font-black text-gray-500 uppercase tracking-[0.4em] mb-8 flex items-center gap-3">
              <span class="material-symbols-outlined text-base">tune</span>
              Visual Adjustments
           </h3>
           <div class="space-y-4">
              <FilterSlider v-model="filters.brightness" label="Exposure" icon="light_mode" min="-100" max="100" :disabled="!imageLoaded" />
              <FilterSlider v-model="filters.contrast" label="Contrast" icon="contrast" min="-100" max="100" :disabled="!imageLoaded" />
              <FilterSlider v-model="filters.saturation" label="Saturation" icon="palette" min="0" max="200" :disabled="!imageLoaded" />
           </div>
        </section>

        <!-- Sharpening & Denoising -->
        <section class="pro-card border-t-4 border-t-primary/20">
           <h3 class="text-[10px] font-black text-primary uppercase tracking-[0.4em] mb-8 flex items-center gap-3">
              <span class="material-symbols-outlined text-base">auto_fix_high</span>
              AI Precision Tools
           </h3>
           <div class="space-y-4">
              <FilterSlider v-model="filters.sharpen" label="Clarity Core" icon="multiline_chart" min="0" max="10" step="0.5" :disabled="!imageLoaded" />
              <FilterSlider v-model="filters.denoise" label="Denoiser Master" icon="opacity" min="0" max="10" step="0.5" :disabled="!imageLoaded" />
           </div>
           
           <!-- Quick Action -->
           <div class="mt-10 p-5 rounded-3xl bg-primary/5 border border-primary/10 relative overflow-hidden group">
              <div class="absolute top-0 right-0 p-3 opacity-20 group-hover:rotate-12 transition-transform">
                 <span class="material-symbols-outlined text-3xl text-primary">verified</span>
              </div>
              <p class="text-[10px] font-bold text-primary/80 uppercase tracking-widest leading-relaxed">
                Using highly-optimized Convolution Kernels for real-time processing.
              </p>
           </div>
        </section>
      </aside>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch, computed } from 'vue'

const aiModels = [
  { id: 'balanced', label: 'Balanced AI', icon: 'auto_awesome', desc: 'Hybrid detail & smoothing' },
  { id: 'hd_clarity', label: 'Pro HD Clarity', icon: 'center_focus_strong', desc: 'Aggressive edge enhancement' },
  { id: 'denoise', label: 'Soft Master', icon: 'blur_on', desc: 'Noise removal focus' }
]

const histCanvas = ref<HTMLCanvasElement | null>(null), originalCanvas = ref<HTMLCanvasElement | null>(null), processedCanvas = ref<HTMLCanvasElement | null>(null)
const fileInput = ref<HTMLInputElement | null>(null), workspaceRef = ref<HTMLElement | null>(null)

const imageLoaded = ref(false), isDraggingInput = ref(false), isDraggingSplit = ref(false), isApplying = ref(false), splitPos = ref(50)
const imgWidth = ref(0), imgHeight = ref(0), selectedModelId = ref('balanced')

const selectedModel = computed(() => aiModels.find(m => m.id === selectedModelId.value) || aiModels[0])
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
  originalCanvas.value.width = w; originalCanvas.value.height = h
  processedCanvas.value.width = w; processedCanvas.value.height = h
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
      if (s!==1) { const l = 0.299*pix[i]+0.587*pix[i+1]+0.114*pix[i+2]; pix[i]=pix[i]*s+l*(1-s); pix[i+1]=pix[i+1]*s+l*(1-s); pix[i+2]=pix[i+2]*s+l*(1-s) }
    }
    if (filters.sharpen > 0) imageData = applySharpen(imageData, filters.sharpen)
    if (filters.denoise > 0) imageData = applyDenoise(imageData, filters.denoise)
    processedCanvas.value!.getContext('2d')!.putImageData(imageData, 0, 0); updateHistogram(imageData); isApplying.value = false
  })
}

function applySharpen(imageData: ImageData, amount: number) {
  const w = imageData.width, h = imageData.height, pix = imageData.data
  const o = new Uint8ClampedArray(pix.length)
  
  // Power Kernel: 8-neighbor detail extraction
  const cv = 1 + amount 
  const nv = -(amount / 8) // Distributed across all surrounding pixels

  for(let i=3; i<pix.length; i+=4) o[i] = pix[i] || 255

  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      for (let c = 0; c < 3; c++) {
        const i = (y * w + x) * 4 + c
        
        // Kernel calculation (8-point)
        let v = (pix[i] || 0) * cv + (
          (pix[((y-1)*w + x-1)*4 + c] || 0) + (pix[((y-1)*w + x)*4 + c] || 0) + (pix[((y-1)*w + x+1)*4 + c] || 0) +
          (pix[(y*w + x-1)*4 + c] || 0)                                     + (pix[(y*w + x+1)*4 + c] || 0) +
          (pix[((y+1)*w + x-1)*4 + c] || 0) + (pix[((y+1)*w + x)*4 + c] || 0) + (pix[((y+1)*w + x+1)*4 + c] || 0)
        ) * nv
        
        o[i] = Math.min(255, Math.max(0, v))
      }
    }
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
.pro-card {
  @apply bg-white/[0.03] backdrop-blur-2xl rounded-[2.5rem] border border-white/5 p-8 shadow-2xl;
}
.font-headline { font-family: 'Outfit', sans-serif; }
@keyframes fade-in-down { from { opacity: 0; transform: translateY(-30px); } to { opacity: 1; transform: translateY(0); } }
@keyframes fade-in-left { from { opacity: 0; transform: translateX(-30px); } to { opacity: 1; transform: translateX(0); } }
@keyframes fade-in-right { from { opacity: 0; transform: translateX(30px); } to { opacity: 1; transform: translateX(0); } }
@keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
.animate-fade-in-down { animation: fade-in-down 1s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
.animate-fade-in-left { animation: fade-in-left 1s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
.animate-fade-in-right { animation: fade-in-right 1s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
.animate-fade-in { animation: fade-in 1.2s ease-out forwards; }
.material-symbols-outlined { font-variation-settings: 'FILL' 0, 'wght' 200, 'GRAD' 0, 'opsz' 24; }
</style>

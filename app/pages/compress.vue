<template>
  <div class="pt-24 pb-20 px-6 md:px-8 max-w-4xl mx-auto min-h-screen">
    <!-- Header -->
    <div class="text-center mb-12">
      <div class="inline-block px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase mb-6"
        :class="isDark ? 'bg-tertiary/15 text-tertiary' : 'bg-purple-50 text-tertiary'">
        <span class="material-symbols-outlined text-sm align-middle mr-1">layers</span>
        File Compressor
      </div>
      <h1 class="text-3xl md:text-5xl font-headline font-extrabold tracking-tight mb-4"
        :class="isDark ? 'text-white' : 'text-slate-900'">Compress &amp; Optimize</h1>
      <p class="text-base md:text-lg max-w-xl mx-auto" :class="isDark ? 'text-gray-400' : 'text-secondary'">
        Reduce file sizes up to 80% without losing quality. Smart compression per file type.
      </p>
    </div>

    <!-- Supported Formats Grid -->
    <div v-if="status === 'idle' && files.length === 0" class="mb-6">
      <p class="text-center text-[10px] font-bold uppercase tracking-widest mb-3" :class="isDark ? 'text-gray-600' : 'text-slate-400'">Supported Formats</p>
      <div class="flex flex-wrap justify-center gap-2">
        <div v-for="fmt in supportedFormats" :key="fmt.ext"
          class="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider"
          :class="isDark ? 'bg-white/5 text-gray-400 border border-white/5' : 'bg-slate-50 text-slate-500 border border-slate-100'">
          <span class="material-symbols-outlined text-xs" :class="fmt.color">{{ fmt.icon }}</span>
          {{ fmt.ext }}
        </div>
      </div>
    </div>

    <!-- Upload Zone -->
    <div
      v-if="status === 'idle' && files.length === 0"
      class="glass-panel rounded-2xl p-8 md:p-12 text-center cursor-pointer transition-all duration-300 group"
      :class="[
        isDark ? 'border-2 border-dashed border-white/10 hover:border-tertiary/40' : 'border-2 border-dashed border-slate-200 hover:border-tertiary/40',
        isDragging ? '!border-tertiary bg-tertiary/5 scale-[1.01]' : ''
      ]"
      @dragover.prevent="isDragging = true"
      @dragleave="isDragging = false"
      @drop.prevent="handleDrop"
      @click="triggerInput"
    >
      <input ref="fileInput" type="file" class="hidden" multiple @change="handleFileSelect" />
      <div class="mb-4">
        <span class="material-symbols-outlined text-5xl transition-transform duration-300 group-hover:scale-110"
          :class="isDragging ? 'text-tertiary' : (isDark ? 'text-gray-500' : 'text-slate-400')">compress</span>
      </div>
      <p class="font-headline font-bold text-lg mb-2" :class="isDark ? 'text-white' : 'text-slate-900'">
        {{ isDragging ? 'Drop files here!' : 'Drag & drop files to compress' }}
      </p>
      <p class="text-sm" :class="isDark ? 'text-gray-500' : 'text-slate-400'">
        or <span class="text-tertiary font-medium">click to browse</span> • Max 50MB per file
      </p>
    </div>

    <!-- Files Loaded -->
    <div v-if="files.length > 0 && status === 'idle'" class="mt-4 space-y-4">
      <!-- Detected Badge -->
      <div class="flex items-center justify-center gap-2 mb-2">
        <div class="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold"
          :class="isDark ? 'bg-tertiary/15 text-tertiary border border-tertiary/20' : 'bg-purple-50 text-tertiary border border-purple-100'">
          <span class="material-symbols-outlined text-sm">{{ detectedCategory.icon }}</span>
          Terdeteksi: {{ detectedCategory.label }}
        </div>
      </div>

      <!-- Quality Slider (image only) -->
      <div v-if="detectedCategory.type === 'image'" class="glass-panel rounded-xl p-5" :class="isDark ? 'border border-white/5' : 'border border-slate-100'">
        <div class="flex justify-between items-center mb-3">
          <span class="font-headline font-bold text-sm" :class="isDark ? 'text-white' : 'text-slate-900'">Compression Level</span>
          <span class="text-sm font-bold font-mono" :class="quality > 70 ? 'text-green-500' : quality > 40 ? 'text-yellow-500' : 'text-red-500'">
            {{ quality }}%
          </span>
        </div>
        <input type="range" min="10" max="100" step="5" v-model.number="quality"
          class="w-full h-2 rounded-full appearance-none cursor-pointer"
          :class="isDark ? 'bg-white/10' : 'bg-slate-200'"
          style="accent-color: #6b38d4;" />
        <div class="flex justify-between text-[10px] mt-2" :class="isDark ? 'text-gray-600' : 'text-slate-400'">
          <span>Smallest file</span>
          <span>Best quality</span>
        </div>
      </div>

      <!-- DOCX/PPTX/XLSX Info -->
      <div v-if="detectedCategory.type === 'office'"
        class="flex items-start gap-3 px-4 py-3 rounded-xl text-xs"
        :class="isDark ? 'bg-blue-500/10 text-blue-300 border border-blue-500/20' : 'bg-blue-50 text-blue-700 border border-blue-100'">
        <span class="material-symbols-outlined text-sm mt-0.5">info</span>
        <div>
          <p class="font-bold mb-0.5">Gambar di dalam dokumen akan di-compress.</p>
          <p class="opacity-70">Struktur XML + styles tidak diubah. Gambar &gt; 10KB di folder media/ akan di-optimasi.</p>
        </div>
      </div>

      <!-- PDF Info -->
      <div v-if="detectedCategory.type === 'pdf'"
        class="flex items-start gap-3 px-4 py-3 rounded-xl text-xs"
        :class="isDark ? 'bg-red-500/10 text-red-300 border border-red-500/20' : 'bg-red-50 text-red-700 border border-red-100'">
        <span class="material-symbols-outlined text-sm mt-0.5">picture_as_pdf</span>
        <div>
          <p class="font-bold mb-0.5">Metadata akan di-strip untuk mengurangi ukuran.</p>
          <p class="opacity-70">Unused objects dihapus. Tanpa Ghostscript — kompresi ringan tapi aman.</p>
        </div>
      </div>

      <!-- File List -->
      <div v-for="(file, idx) in files" :key="idx"
        class="glass-panel rounded-xl p-4 flex items-center gap-4"
        :class="isDark ? 'border border-white/5' : 'border border-slate-100'">
        <span class="material-symbols-outlined text-2xl text-tertiary">{{ getFileIcon(file.name) }}</span>
        <div class="flex-1 min-w-0">
          <p class="font-medium truncate text-sm" :class="isDark ? 'text-white' : 'text-slate-900'">{{ file.name }}</p>
          <p class="text-xs" :class="isDark ? 'text-gray-500' : 'text-slate-400'">
            {{ formatSize(file.size) }} → <span class="text-green-500 font-bold">~{{ estimateSize(file.size) }}</span>
          </p>
        </div>
        <button @click="files.splice(idx, 1)" class="hover:text-red-500 transition-colors"
          :class="isDark ? 'text-gray-500' : 'text-slate-400'">
          <span class="material-symbols-outlined text-lg">close</span>
        </button>
      </div>

      <!-- Compress Button -->
      <div class="flex gap-3">
        <button
          class="flex-1 py-4 rounded-full font-headline font-bold text-lg hover:scale-[1.01] hover:shadow-xl transition-all active:scale-[0.99] flex items-center justify-center gap-2 bg-tertiary text-white shadow-lg shadow-tertiary/20 hover:shadow-tertiary/30"
          @click="startCompression"
        >
          <span class="material-symbols-outlined">bolt</span>
          Compress {{ files.length }} file{{ files.length > 1 ? 's' : '' }}
        </button>
        <button class="px-6 py-4 rounded-full font-headline font-bold text-sm transition-all"
          :class="isDark ? 'bg-white/5 text-gray-400 hover:bg-white/10' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'"
          @click="clearAll">Clear</button>
      </div>
    </div>

    <!-- Compressing State -->
    <div v-if="status === 'compressing'" class="mt-8">
      <div class="glass-panel rounded-2xl p-8 text-center" :class="isDark ? 'border border-white/5' : 'border border-slate-100'">
        <div class="relative w-20 h-20 mx-auto mb-6">
          <svg class="w-full h-full animate-spin-slow" viewBox="0 0 80 80">
            <circle cx="40" cy="40" r="34" fill="none" stroke-width="4" :stroke="isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'" />
            <circle cx="40" cy="40" r="34" fill="none" stroke-width="4" stroke="#6b38d4"
              stroke-dasharray="160" stroke-dashoffset="120" stroke-linecap="round" />
          </svg>
          <span class="material-symbols-outlined text-3xl text-tertiary absolute inset-0 flex items-center justify-center">compress</span>
        </div>
        <p class="font-headline font-bold text-xl mb-2" :class="isDark ? 'text-white' : 'text-slate-900'">Compressing...</p>
        <p class="text-sm" :class="isDark ? 'text-gray-500' : 'text-slate-400'">{{ progressText }}</p>
      </div>
    </div>

    <!-- Results -->
    <div v-if="status === 'done'" class="mt-8 space-y-4">
      <!-- Summary Banner -->
      <div class="glass-panel rounded-2xl p-6 text-center" :class="isDark ? 'border border-green-500/20' : 'border border-green-200'">
        <span class="material-symbols-outlined text-4xl text-green-500 mb-2">check_circle</span>
        <p class="font-headline font-bold text-lg" :class="isDark ? 'text-white' : 'text-slate-900'">
          {{ results.length }} file{{ results.length > 1 ? 's' : '' }} compressed!
        </p>
        <div class="flex justify-center gap-6 mt-3">
          <div class="text-center">
            <p class="text-[10px] font-bold uppercase tracking-widest opacity-50">Before</p>
            <p class="font-mono font-bold text-sm" :class="isDark ? 'text-white' : 'text-slate-900'">{{ formatSize(totalOriginal) }}</p>
          </div>
          <div class="text-center">
            <p class="text-[10px] font-bold uppercase tracking-widest opacity-50">After</p>
            <p class="font-mono font-bold text-sm text-green-500">{{ formatSize(totalCompressed) }}</p>
          </div>
          <div class="text-center">
            <p class="text-[10px] font-bold uppercase tracking-widest opacity-50">Saved</p>
            <p class="font-mono font-bold text-sm text-tertiary">{{ totalSavings }}%</p>
          </div>
        </div>
        <p class="text-xs mt-2 opacity-40">{{ conversionTime }}</p>
      </div>

      <!-- Result Items -->
      <div v-for="(r, idx) in results" :key="idx"
        class="glass-panel rounded-xl p-4 flex items-center gap-4"
        :class="isDark ? 'border border-white/5' : 'border border-slate-100'">
        <span class="material-symbols-outlined text-2xl text-green-500">{{ getFileIcon(r.name) }}</span>
        <div class="flex-1 min-w-0">
          <p class="font-medium truncate text-sm" :class="isDark ? 'text-white' : 'text-slate-900'">{{ r.name }}</p>
          <p class="text-xs" :class="isDark ? 'text-gray-500' : 'text-slate-400'">
            {{ formatSize(r.originalSize) }} → <span class="text-green-500 font-bold">{{ formatSize(r.size) }}</span>
            <span class="text-tertiary ml-1">({{ ((1 - r.size / r.originalSize) * 100).toFixed(0) }}% saved)</span>
          </p>
        </div>
        <button @click="downloadFile(r)"
          class="px-4 py-2 bg-tertiary text-white rounded-full text-xs font-bold hover:shadow-lg hover:shadow-tertiary/20 transition-all active:scale-95 flex items-center gap-1.5">
          <span class="material-symbols-outlined text-sm">download</span>
          Download
        </button>
      </div>

      <!-- Actions -->
      <div class="flex gap-3">
        <button v-if="results.length > 1"
          class="flex-1 py-4 bg-tertiary text-white rounded-full font-headline font-bold text-base hover:scale-[1.01] hover:shadow-xl hover:shadow-tertiary/20 transition-all active:scale-[0.99] flex items-center justify-center gap-2"
          @click="downloadAllZip">
          <span class="material-symbols-outlined">folder_zip</span>
          Download All (.zip)
        </button>
        <button
          class="flex-1 py-4 rounded-full font-headline font-bold text-base transition-all flex items-center justify-center gap-2"
          :class="isDark ? 'bg-white/5 text-gray-300 hover:bg-white/10' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'"
          @click="resetAll">
          <span class="material-symbols-outlined">refresh</span>
          New Compression
        </button>
      </div>
    </div>

    <!-- Error -->
    <div v-if="status === 'error'" class="mt-8">
      <div class="glass-panel rounded-2xl p-6 text-center" :class="isDark ? 'border border-red-500/20' : 'border border-red-200'">
        <span class="material-symbols-outlined text-4xl text-red-500 mb-2">error</span>
        <p class="font-headline font-bold text-lg mb-1" :class="isDark ? 'text-white' : 'text-slate-900'">Compression Failed</p>
        <p class="text-sm mb-4" :class="isDark ? 'text-gray-400' : 'text-slate-500'">{{ errorMessage }}</p>
        <button class="px-6 py-3 bg-tertiary text-white rounded-full font-headline font-bold text-sm transition-all hover:shadow-lg" @click="resetAll">
          Try Again
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * Smart File Compressor — deteksi tipe file, kompresi optimal per format
 * Image: Sharp (mozjpeg/png9/webp), Office: JSZip+Sharp, PDF: pdf-lib
 */
useSeoMeta({ title: 'Compress — FiGo' })
const { isDark } = useColorMode()
const { increment } = useHistoryCounter()

type Status = 'idle' | 'compressing' | 'done' | 'error'
interface CompressedFile { name: string; size: number; originalSize: number; blob: Blob }

const fileInput = ref<HTMLInputElement | null>(null)
const files = ref<File[]>([])
const isDragging = ref(false)
const quality = ref(75)
const status = ref<Status>('idle')
const results = ref<CompressedFile[]>([])
const errorMessage = ref('')
const conversionTime = ref('')
const progressText = ref('Processing...')

// Supported formats
const supportedFormats = [
  { ext: 'PNG', icon: 'image', color: 'text-blue-500' },
  { ext: 'JPG', icon: 'image', color: 'text-amber-500' },
  { ext: 'WEBP', icon: 'image', color: 'text-emerald-500' },
  { ext: 'GIF', icon: 'gif_box', color: 'text-purple-500' },
  { ext: 'AVIF', icon: 'image', color: 'text-cyan-500' },
  { ext: 'TIFF', icon: 'image', color: 'text-indigo-500' },
  { ext: 'PDF', icon: 'picture_as_pdf', color: 'text-red-500' },
  { ext: 'DOCX', icon: 'description', color: 'text-blue-600' },
  { ext: 'PPTX', icon: 'slideshow', color: 'text-orange-500' },
  { ext: 'XLSX', icon: 'table_chart', color: 'text-green-600' },
]

type FileCategory = { type: 'image' | 'office' | 'pdf' | 'unknown'; label: string; icon: string }
const detectedCategory = computed<FileCategory>(() => {
  if (files.value.length === 0) return { type: 'unknown', label: 'Unknown', icon: 'help' }
  const ext = (files.value[0]?.name.split('.').pop() || '').toUpperCase()
  if (['PNG','JPG','JPEG','WEBP','GIF','AVIF','TIFF','BMP'].includes(ext))
    return { type: 'image', label: 'Image File', icon: 'image' }
  if (['DOCX','PPTX','XLSX'].includes(ext))
    return { type: 'office', label: 'Office Document', icon: 'description' }
  if (ext === 'PDF')
    return { type: 'pdf', label: 'PDF Document', icon: 'picture_as_pdf' }
  return { type: 'unknown', label: ext + ' File', icon: 'description' }
})

function getFileIcon(name: string): string {
  const ext = (name.split('.').pop() || '').toLowerCase()
  if (['png','jpg','jpeg','webp','gif','avif','tiff','bmp'].includes(ext)) return 'image'
  if (ext === 'pdf') return 'picture_as_pdf'
  if (['docx'].includes(ext)) return 'description'
  if (['pptx'].includes(ext)) return 'slideshow'
  if (['xlsx'].includes(ext)) return 'table_chart'
  return 'description'
}

const totalOriginal = computed(() => results.value.reduce((s, r) => s + r.originalSize, 0))
const totalCompressed = computed(() => results.value.reduce((s, r) => s + r.size, 0))
const totalSavings = computed(() => totalOriginal.value > 0 ? ((1 - totalCompressed.value / totalOriginal.value) * 100).toFixed(0) : '0')

function triggerInput() { fileInput.value?.click() }
function handleFileSelect(e: Event) {
  const input = e.target as HTMLInputElement
  if (input.files) files.value.push(...Array.from(input.files))
  input.value = ''
}
function handleDrop(e: DragEvent) {
  isDragging.value = false
  if (e.dataTransfer?.files) files.value.push(...Array.from(e.dataTransfer.files))
}
function formatSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}
function estimateSize(size: number): string {
  const ratio = detectedCategory.value.type === 'image' ? (1 - (100 - quality.value) / 120) : 0.85
  return formatSize(Math.floor(size * ratio))
}
function clearAll() { files.value = []; quality.value = 75 }
function resetAll() {
  results.value = []; files.value = []; status.value = 'idle'; errorMessage.value = ''; quality.value = 75
}

async function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.style.display = 'none'; a.href = url; a.download = filename
  document.body.appendChild(a); a.click()
  setTimeout(() => { document.body.removeChild(a); URL.revokeObjectURL(url) }, 1000)
}

function downloadFile(r: CompressedFile) { triggerDownload(r.blob, r.name) }

async function startCompression() {
  if (files.value.length === 0) return
  status.value = 'compressing'
  errorMessage.value = ''
  progressText.value = `Compressing ${files.value.length} file(s)...`
  const startTime = performance.now()

  try {
    const allResults: CompressedFile[] = []

    for (let i = 0; i < files.value.length; i++) {
      const file = files.value[i]
      progressText.value = `Compressing ${i + 1} / ${files.value.length}: ${file.name}`

      const formData = new FormData()
      formData.append('quality', String(quality.value))
      formData.append('files', file)

      const response = await fetch('/api/compress', { method: 'POST', body: formData })
      if (!response.ok) {
        const err = await response.json().catch(() => ({ message: 'Unknown error' }))
        throw new Error(err.message || `Server returned ${response.status}`)
      }

      const blob = await response.blob()
      const outputName = response.headers.get('X-Output-Name') || `${file.name.replace(/\.[^.]+$/, '')}-compressed.${file.name.split('.').pop()}`
      const originalSize = parseInt(response.headers.get('X-Original-Size') || String(file.size), 10)

      allResults.push({ name: outputName, size: blob.size, originalSize, blob })
    }

    results.value = allResults
    conversionTime.value = `Completed in ${((performance.now() - startTime) / 1000).toFixed(1)}s`
    increment(files.value.length)
    status.value = 'done'
  } catch (err: any) {
    errorMessage.value = err.message || 'Compression failed'
    status.value = 'error'
  }
}

async function downloadAllZip() {
  if (results.value.length <= 1) return
  for (const r of results.value) {
    await triggerDownload(r.blob, r.name)
    await new Promise(res => setTimeout(res, 300))
  }
}
</script>

<style scoped>
@keyframes spin-slow {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
.animate-spin-slow { animation: spin-slow 2s linear infinite; }
</style>

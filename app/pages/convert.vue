<template>
  <div class="pt-24 pb-20 px-6 md:px-8 max-w-4xl mx-auto min-h-screen">
    <!-- Header -->
    <div class="text-center mb-12">
      <div class="inline-block px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase mb-6"
        :class="isDark ? 'bg-primary/15 text-primary' : 'bg-primary-fixed text-on-primary-fixed'">
        <span class="material-symbols-outlined text-sm align-middle mr-1">transform</span>
        File Converter
      </div>
      <h1 class="text-3xl md:text-5xl font-headline font-extrabold tracking-tight mb-4"
        :class="isDark ? 'text-white' : 'text-slate-900'">Convert Anything</h1>
      <p class="text-base md:text-lg max-w-xl mx-auto" :class="isDark ? 'text-gray-400' : 'text-secondary'">
        Smart file detection — upload any file and we'll show you what's possible.
      </p>
    </div>

    <!-- Supported Formats Badge Grid (tampil saat idle) -->
    <div v-if="status === 'idle' && files.length === 0" class="mb-6">
      <p class="text-center text-[10px] font-bold uppercase tracking-widest mb-3" :class="isDark ? 'text-gray-600' : 'text-slate-400'">Supported Input Formats</p>
      <div class="flex flex-wrap justify-center gap-2">
        <div v-for="fmt in allSupportedInputs" :key="fmt.ext"
          class="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all"
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
        isDark ? 'border-2 border-dashed border-white/10 hover:border-primary/40' : 'border-2 border-dashed border-slate-200 hover:border-primary/40',
        isDragging ? '!border-primary bg-primary/5 scale-[1.01]' : ''
      ]"
      @dragover.prevent="isDragging = true"
      @dragleave="isDragging = false"
      @drop.prevent="handleDrop"
      @click="triggerInput"
    >
      <input ref="fileInput" type="file" class="hidden" multiple @change="handleFileSelect" />
      <div class="mb-4">
        <span class="material-symbols-outlined text-5xl transition-transform duration-300 group-hover:scale-110"
          :class="isDragging ? 'text-primary' : (isDark ? 'text-gray-500' : 'text-slate-400')"
        >upload_file</span>
      </div>
      <p class="font-headline font-bold text-lg mb-2" :class="isDark ? 'text-white' : 'text-slate-900'">
        {{ isDragging ? 'Drop files here!' : 'Drag & drop files here' }}
      </p>
      <p class="text-sm" :class="isDark ? 'text-gray-500' : 'text-slate-400'">
        or <span class="text-primary font-medium">click to browse</span> • Max 50MB per file
      </p>
    </div>

    <!-- Selected Files (pre-conversion) -->
    <div v-if="files.length > 0 && status === 'idle'" class="mt-4 space-y-4">
      <!-- Detected File Type Badge -->
      <div class="flex items-center justify-center gap-2 mb-2">
        <div class="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold"
          :class="isDark ? 'bg-primary/15 text-primary border border-primary/20' : 'bg-blue-50 text-primary border border-blue-100'">
          <span class="material-symbols-outlined text-sm">{{ detectedCategory.icon }}</span>
          Terdeteksi: {{ detectedCategory.label }}
        </div>
      </div>

      <!-- Output Format -->
      <div class="flex items-center gap-3 flex-wrap">
        <span class="text-sm font-bold" :class="isDark ? 'text-gray-400' : 'text-slate-500'">Convert to:</span>
        <button
          v-for="fmt in availableFormats"
          :key="fmt"
          class="px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all"
          :class="selectedFormat === fmt
            ? 'bg-primary text-on-primary shadow-lg shadow-primary/20'
            : (isDark ? 'bg-white/5 text-gray-400 hover:bg-white/10' : 'bg-slate-100 text-slate-600 hover:bg-slate-200')"
          @click="selectedFormat = fmt"
        >{{ fmt }}</button>
      </div>

      <!-- File List -->
      <div
        v-for="(file, idx) in files"
        :key="idx"
        class="glass-panel rounded-xl p-4 flex items-center gap-4 transition-all"
        :class="isDark ? 'border border-white/5' : 'border border-slate-100'"
      >
        <span class="material-symbols-outlined text-2xl text-primary">{{ getFileIcon(file.name) }}</span>
        <div class="flex-1 min-w-0">
          <p class="font-medium truncate text-sm" :class="isDark ? 'text-white' : 'text-slate-900'">{{ file.name }}</p>
          <p class="text-xs" :class="isDark ? 'text-gray-500' : 'text-slate-400'">{{ formatSize(file.size) }}</p>
        </div>
        <span class="material-symbols-outlined text-lg" :class="isDark ? 'text-gray-600' : 'text-slate-300'">arrow_forward</span>
        <span class="text-xs font-bold uppercase tracking-wider text-primary">{{ selectedFormat }}</span>
        <button @click="removeFile(idx)" class="ml-2 hover:text-red-500 transition-colors"
          :class="isDark ? 'text-gray-500' : 'text-slate-400'">
          <span class="material-symbols-outlined text-lg">close</span>
        </button>
      </div>

      <!-- PDF halaman info -->
      <div v-if="detectedCategory.type === 'pdf' && pdfPageCount > 0"
        class="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold"
        :class="isDark ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'bg-amber-50 text-amber-700 border border-amber-100'">
        <span class="material-symbols-outlined text-sm">info</span>
        PDF memiliki {{ pdfPageCount }} halaman — setiap halaman akan menjadi 1 file {{ selectedFormat }}.
      </div>

      <!-- Action Buttons -->
      <div class="flex gap-3">
        <button
          class="flex-1 py-4 bg-primary text-on-primary rounded-full font-headline font-bold text-lg hover:scale-[1.01] hover:shadow-xl hover:shadow-primary/20 transition-all active:scale-[0.99] flex items-center justify-center gap-2"
          @click="startConversion"
        >
          <span class="material-symbols-outlined">bolt</span>
          Convert {{ files.length }} file{{ files.length > 1 ? 's' : '' }}
        </button>
        <button
          class="px-6 py-4 rounded-full font-headline font-bold text-sm transition-all"
          :class="isDark ? 'bg-white/5 text-gray-400 hover:bg-white/10' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'"
          @click="clearAll"
        >Clear</button>
      </div>
    </div>

    <!-- Converting State -->
    <div v-if="status === 'converting'" class="mt-8">
      <div class="glass-panel rounded-2xl p-8 text-center" :class="isDark ? 'border border-white/5' : 'border border-slate-100'">
        <div class="relative w-20 h-20 mx-auto mb-6">
          <svg class="w-full h-full animate-spin-slow" viewBox="0 0 80 80">
            <circle cx="40" cy="40" r="34" fill="none" stroke-width="4"
              :stroke="isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'" />
            <circle cx="40" cy="40" r="34" fill="none" stroke-width="4"
              stroke="currentColor" class="text-primary"
              stroke-dasharray="160" stroke-dashoffset="120"
              stroke-linecap="round" />
          </svg>
          <span class="material-symbols-outlined text-3xl text-primary absolute inset-0 flex items-center justify-center">bolt</span>
        </div>
        <p class="font-headline font-bold text-xl mb-2" :class="isDark ? 'text-white' : 'text-slate-900'">Converting...</p>
        <p class="text-sm" :class="isDark ? 'text-gray-500' : 'text-slate-400'">
          {{ progressText }}
        </p>
      </div>
    </div>

    <!-- Results -->
    <div v-if="status === 'done'" class="mt-8 space-y-4">
      <div class="glass-panel rounded-2xl p-6 text-center" :class="isDark ? 'border border-green-500/20' : 'border border-green-200'">
        <span class="material-symbols-outlined text-4xl text-green-500 mb-2">check_circle</span>
        <p class="font-headline font-bold text-lg" :class="isDark ? 'text-white' : 'text-slate-900'">
          {{ results.length }} file{{ results.length > 1 ? 's' : '' }} converted successfully!
        </p>
        <p class="text-xs mt-1" :class="isDark ? 'text-gray-500' : 'text-slate-400'">{{ conversionTime }}</p>
      </div>

      <div
        v-for="(result, idx) in results"
        :key="idx"
        class="glass-panel rounded-xl p-4 flex items-center gap-4 transition-all"
        :class="isDark ? 'border border-white/5' : 'border border-slate-100'"
      >
        <span class="material-symbols-outlined text-2xl text-green-500">image</span>
        <div class="flex-1 min-w-0">
          <p class="font-medium truncate text-sm" :class="isDark ? 'text-white' : 'text-slate-900'">{{ result.name }}</p>
          <p class="text-xs" :class="isDark ? 'text-gray-500' : 'text-slate-400'">{{ formatSize(result.size) }}</p>
        </div>
        <button
          @click="downloadFile(result)"
          class="px-4 py-2 bg-primary text-on-primary rounded-full text-xs font-bold hover:shadow-lg hover:shadow-primary/20 transition-all active:scale-95 flex items-center gap-1.5"
        >
          <span class="material-symbols-outlined text-sm">download</span>
          Download
        </button>
      </div>

      <div class="flex gap-3">
        <button
          v-if="results.length > 1"
          class="flex-1 py-4 bg-primary text-on-primary rounded-full font-headline font-bold text-base hover:scale-[1.01] hover:shadow-xl hover:shadow-primary/20 transition-all active:scale-[0.99] flex items-center justify-center gap-2"
          @click="downloadAllZip"
        >
          <span class="material-symbols-outlined">folder_zip</span>
          Download All (.zip)
        </button>
        <button
          class="flex-1 py-4 rounded-full font-headline font-bold text-base transition-all flex items-center justify-center gap-2"
          :class="isDark ? 'bg-white/5 text-gray-300 hover:bg-white/10' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'"
          @click="resetAll"
        >
          <span class="material-symbols-outlined">refresh</span>
          New Conversion
        </button>
      </div>
    </div>

    <!-- Error State -->
    <div v-if="status === 'error'" class="mt-8">
      <div class="glass-panel rounded-2xl p-6 text-center" :class="isDark ? 'border border-red-500/20' : 'border border-red-200'">
        <span class="material-symbols-outlined text-4xl text-red-500 mb-2">error</span>
        <p class="font-headline font-bold text-lg mb-1" :class="isDark ? 'text-white' : 'text-slate-900'">Conversion Failed</p>
        <p class="text-sm mb-4" :class="isDark ? 'text-gray-400' : 'text-slate-500'">{{ errorMessage }}</p>
        <button
          class="px-6 py-3 bg-primary text-on-primary rounded-full font-headline font-bold text-sm transition-all hover:shadow-lg"
          @click="resetAll"
        >Try Again</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * Smart File Converter — deteksi tipe file otomatis, format output dinamis
 * Mendukung: Image (sharp), Spreadsheet (xlsx), PDF→Image (pdfjs-dist client-side)
 */
useSeoMeta({ title: 'Convert — FiGo' })
const { isDark } = useColorMode()
const { increment } = useHistoryCounter()

type ConversionStatus = 'idle' | 'converting' | 'done' | 'error'

interface ConvertedFile {
  name: string
  size: number
  url: string
  blob: Blob
}

const fileInput = ref<HTMLInputElement | null>(null)
const files = ref<File[]>([])
const isDragging = ref(false)
const selectedFormat = ref('WEBP')
const status = ref<ConversionStatus>('idle')
const results = ref<ConvertedFile[]>([])
const errorMessage = ref('')
const conversionTime = ref('')
const progressText = ref('Processing...')
const pdfPageCount = ref(0)

// Helper: inisialisasi pdfjs-dist dengan worker dari /public
async function initPdfJs() {
  const pdfjsLib = await import('pdfjs-dist')
  pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs'
  return pdfjsLib
}

// Semua format input yang didukung
const allSupportedInputs = [
  { ext: 'PNG', icon: 'image', color: 'text-blue-500' },
  { ext: 'JPG', icon: 'image', color: 'text-amber-500' },
  { ext: 'WEBP', icon: 'image', color: 'text-emerald-500' },
  { ext: 'GIF', icon: 'gif_box', color: 'text-purple-500' },
  { ext: 'AVIF', icon: 'image', color: 'text-cyan-500' },
  { ext: 'TIFF', icon: 'image', color: 'text-indigo-500' },
  { ext: 'PDF', icon: 'picture_as_pdf', color: 'text-red-500' },
  { ext: 'XLSX', icon: 'table_chart', color: 'text-green-600' },
  { ext: 'CSV', icon: 'csv', color: 'text-teal-500' },
  { ext: 'XLS', icon: 'table_chart', color: 'text-green-700' },
]

const IMAGE_FORMATS = ['WEBP', 'PNG', 'JPG', 'GIF', 'AVIF', 'TIFF']
const SHEET_FORMATS = ['XLSX', 'CSV', 'TXT', 'HTML']
const PDF_OUTPUT_FORMATS = ['PNG', 'JPG', 'WEBP', 'HTML']

// Deteksi kategori file berdasarkan ekstensi
type FileCategory = { type: 'image' | 'sheet' | 'pdf' | 'unknown'; label: string; icon: string }

const detectedCategory = computed<FileCategory>(() => {
  if (files.value.length === 0) return { type: 'unknown', label: 'Unknown', icon: 'help' }
  const ext = files.value[0]?.name.split('.').pop()?.toUpperCase() || ''
  if (['PNG', 'JPG', 'JPEG', 'WEBP', 'GIF', 'AVIF', 'TIFF', 'BMP', 'SVG'].includes(ext))
    return { type: 'image', label: 'Image File', icon: 'image' }
  if (['XLSX', 'XLS', 'CSV', 'TXT'].includes(ext))
    return { type: 'sheet', label: 'Spreadsheet', icon: 'table_chart' }
  if (ext === 'PDF')
    return { type: 'pdf', label: 'PDF Document', icon: 'picture_as_pdf' }
  return { type: 'unknown', label: ext + ' File', icon: 'description' }
})

// Format output yang tersedia berdasarkan tipe file
const availableFormats = computed(() => {
  const cat = detectedCategory.value.type
  let filterList: string[]
  if (cat === 'pdf') filterList = PDF_OUTPUT_FORMATS
  else if (cat === 'sheet') filterList = SHEET_FORMATS
  else filterList = IMAGE_FORMATS

  // Hapus format yang sama dengan input
  const inputExtensions = new Set(
    files.value.map(f => {
      const ext = f.name.split('.').pop()?.toUpperCase() || ''
      return ext === 'JPEG' ? 'JPG' : ext
    })
  )
  const filtered = filterList.filter(fmt => !inputExtensions.has(fmt))

  // Auto-select pertama jika format terpilih tidak valid
  if (!filtered.includes(selectedFormat.value) && filtered.length > 0) {
    selectedFormat.value = filtered[0]!
  }
  return filtered
})

// Ikon file berdasarkan ekstensi
function getFileIcon(name: string): string {
  const ext = name.split('.').pop()?.toLowerCase() || ''
  if (['png', 'jpg', 'jpeg', 'webp', 'gif', 'avif', 'tiff', 'bmp'].includes(ext)) return 'image'
  if (ext === 'pdf') return 'picture_as_pdf'
  if (['xlsx', 'xls', 'csv'].includes(ext)) return 'table_chart'
  return 'description'
}

function triggerInput() { fileInput.value?.click() }

function handleFileSelect(e: Event) {
  const input = e.target as HTMLInputElement
  if (input.files) addFiles(Array.from(input.files))
  input.value = ''
}

function handleDrop(e: DragEvent) {
  isDragging.value = false
  if (e.dataTransfer?.files) addFiles(Array.from(e.dataTransfer.files))
}

async function addFiles(newFiles: File[]) {
  files.value.push(...newFiles)
  // Jika PDF, hitung jumlah halaman
  if (detectedCategory.value.type === 'pdf' && files.value.length === 1) {
    try {
      const pdfjsLib = await initPdfJs()
      const arrayBuf = await files.value[0].arrayBuffer()
      const pdf = await pdfjsLib.getDocument({ data: arrayBuf }).promise
      pdfPageCount.value = pdf.numPages
      pdf.destroy()
    } catch { pdfPageCount.value = 0 }
  }
}

function removeFile(idx: number) {
  files.value.splice(idx, 1)
  if (files.value.length === 0) pdfPageCount.value = 0
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

function clearAll() {
  files.value = []
  selectedFormat.value = 'WEBP'
  pdfPageCount.value = 0
}

function resetAll() {
  results.value.forEach(r => URL.revokeObjectURL(r.url))
  results.value = []
  files.value = []
  status.value = 'idle'
  errorMessage.value = ''
  selectedFormat.value = 'WEBP'
  pdfPageCount.value = 0
}

async function triggerDownload(blob: Blob, filename: string) {
  if (typeof (window.navigator as any).msSaveOrOpenBlob !== 'undefined') {
    (window.navigator as any).msSaveOrOpenBlob(blob, filename)
    return
  }
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.style.display = 'none'
  a.href = url
  a.download = filename || 'download.file'
  document.body.appendChild(a)
  a.click()
  setTimeout(() => { document.body.removeChild(a); URL.revokeObjectURL(url) }, 1000)
}

function downloadFile(result: ConvertedFile) {
  triggerDownload(result.blob, result.name)
}

// Konversi PDF → Image (client-side via pdfjs-dist + Canvas)
async function convertPdfToImages(file: File, format: string): Promise<ConvertedFile[]> {
  const pdfjsLib = await initPdfJs()

  const arrayBuf = await file.arrayBuffer()
  const pdf = await pdfjsLib.getDocument({ data: arrayBuf }).promise
  const output: ConvertedFile[] = []
  const baseName = file.name.replace(/\.[^.]+$/, '')
  const mimeMap: Record<string, string> = { png: 'image/png', jpg: 'image/jpeg', webp: 'image/webp' }
  const mime = mimeMap[format.toLowerCase()] || 'image/png'
  const quality = format.toLowerCase() === 'png' ? undefined : 0.9

  for (let i = 1; i <= pdf.numPages; i++) {
    progressText.value = `Rendering halaman ${i} / ${pdf.numPages}...`
    const page = await pdf.getPage(i)
    const scale = 2 // 2x untuk kualitas tinggi
    const viewport = page.getViewport({ scale })

    const canvas = document.createElement('canvas')
    canvas.width = viewport.width
    canvas.height = viewport.height
    const ctx = canvas.getContext('2d')!

    await page.render({ canvasContext: ctx, viewport }).promise

    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (b) => b ? resolve(b) : reject(new Error('Canvas toBlob failed')),
        mime,
        quality
      )
    })

    const ts = Date.now()
    const outputName = `${baseName}-page${i}-figo-${ts}.${format.toLowerCase()}`
    output.push({
      name: outputName,
      size: blob.size,
      url: URL.createObjectURL(blob),
      blob,
    })
    page.cleanup()
  }
  pdf.destroy()
  return output
}

// Konversi PDF → HTML (client-side via pdfjs-dist text extraction + visual render)
async function convertPdfToHtml(file: File): Promise<ConvertedFile[]> {
  const pdfjsLib = await initPdfJs()

  const arrayBuf = await file.arrayBuffer()
  const pdf = await pdfjsLib.getDocument({ data: arrayBuf }).promise
  const baseName = file.name.replace(/\.[^.]+$/, '')
  const pages: string[] = []

  for (let i = 1; i <= pdf.numPages; i++) {
    progressText.value = `Extracting halaman ${i} / ${pdf.numPages}...`
    const page = await pdf.getPage(i)
    
    // Gunakan scale besar (2x) untuk kualitas gambar yang tajam
    const renderScale = 2.0
    const renderViewport = page.getViewport({ scale: renderScale })
    
    // Render halaman ke canvas untuk menangkap SEMUA visual (gambar, background, vector, dll)
    const canvas = document.createElement('canvas')
    canvas.width = renderViewport.width
    canvas.height = renderViewport.height
    const ctx = canvas.getContext('2d')!
    await page.render({ canvasContext: ctx, viewport: renderViewport }).promise
    
    // Konversi canvas menjadi base64 image (kualitas 0.85 cukup baik dan tidak terlalu besar)
    const imgDataUrl = canvas.toDataURL('image/jpeg', 0.85)

    // Untuk text layer, kita pakai scale 1x agar sesuai dengan ukuran CSS asli
    const cssViewport = page.getViewport({ scale: 1.0 })
    const textContent = await page.getTextContent()

    // Bangun HTML per halaman: Background Image + Transparent Text Layer (agar bisa di-block/copy)
    let pageHtml = `<div class="pdf-page" style="position:relative;width:${Math.round(cssViewport.width)}px;height:${Math.round(cssViewport.height)}px;margin:0 auto 24px;overflow:hidden;background:#fff;box-shadow:0 2px 8px rgba(0,0,0,.15);">`
    
    // Layer 1: Visual (Gambar dari canvas)
    pageHtml += `<img src="${imgDataUrl}" style="position:absolute;top:0;left:0;width:100%;height:100%;object-fit:contain;pointer-events:none;" alt="Page ${i} background" />`
    
    // Layer 2: Text Layer (Teks transparan yang posisinya persis di atas gambar)
    pageHtml += `<div class="text-layer" style="position:absolute;top:0;left:0;width:100%;height:100%;color:transparent;">`
    
    for (const item of textContent.items) {
      if (!('str' in item) || !item.str.trim()) continue
      const tx = (item as any).transform
      if (!tx) continue
      
      // Hitung ukuran font & posisi berdasarkan matrix transform
      const fontSize = Math.round(Math.sqrt(tx[0] * tx[0] + tx[1] * tx[1]))
      const left = tx[4]
      const top = cssViewport.height - tx[5]
      
      const escaped = item.str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      // Menggunakan transparent color dan selection warna agar bisa dicopy
      pageHtml += `<span style="position:absolute;left:${left}px;top:${top}px;font-size:${fontSize}px;line-height:1;white-space:pre;transform:translateY(-100%); transform-origin: left bottom;font-family:sans-serif;">${escaped}</span>`
    }
    
    pageHtml += `</div></div>`
    pages.push(pageHtml)
    page.cleanup()
  }
  pdf.destroy()

  // Gabungkan semua halaman ke satu file HTML standalone
  const fullHtml = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>${baseName} — Converted by FiGo</title>
  <style>
    * { margin:0; padding:0; box-sizing:border-box; }
    body { background:#e2e8f0; padding:32px 16px; font-family:sans-serif; }
    .pdf-page::selection, .pdf-page *::selection { background: rgba(59, 130, 246, 0.3); color: transparent; }
  </style>
</head>
<body>
  ${pages.join('\n')}
</body>
</html>`

  const blob = new Blob([fullHtml], { type: 'text/html;charset=utf-8' })
  return [{
    name: `${baseName}-figo-${Date.now()}.html`,
    size: blob.size,
    url: URL.createObjectURL(blob),
    blob,
  }]
}

// Konversi image/spreadsheet via server
async function convertViaServer(file: File, format: string): Promise<ConvertedFile> {
  const formData = new FormData()
  formData.append('format', format.toLowerCase())
  formData.append('files', file)

  const response = await fetch('/api/convert', { method: 'POST', body: formData })
  if (!response.ok) {
    const errData = await response.json().catch(() => ({ message: 'Unknown error' }))
    throw new Error(errData.message || `Server returned ${response.status}`)
  }

  const blob = await response.blob()
  let outputName = response.headers.get('X-Output-Name')
  if (!outputName) {
    const baseName = file.name.replace(/\.[^.]+$/, '')
    outputName = `${baseName}-figo-${Date.now()}.${format.toLowerCase()}`
  }

  return { name: outputName, size: blob.size, url: URL.createObjectURL(blob), blob }
}

async function startConversion() {
  if (files.value.length === 0) return
  status.value = 'converting'
  errorMessage.value = ''
  progressText.value = 'Processing...'
  const startTime = performance.now()

  try {
    const cat = detectedCategory.value.type
    let allResults: ConvertedFile[] = []

    if (cat === 'pdf') {
      // PDF → Image atau HTML: client-side
      for (const file of files.value) {
        if (selectedFormat.value === 'HTML') {
          const htmlResults = await convertPdfToHtml(file)
          allResults.push(...htmlResults)
        } else {
          const pageResults = await convertPdfToImages(file, selectedFormat.value)
          allResults.push(...pageResults)
        }
      }
    } else {
      // Image / Spreadsheet → server-side
      progressText.value = `Converting ${files.value.length} file(s) to ${selectedFormat.value}...`
      const promises = files.value.map(f => convertViaServer(f, selectedFormat.value))
      allResults = await Promise.all(promises)
    }

    results.value = allResults
    const elapsed = ((performance.now() - startTime) / 1000).toFixed(1)
    conversionTime.value = `Completed in ${elapsed}s`
    increment(files.value.length)
    status.value = 'done'
  } catch (err: any) {
    errorMessage.value = err.message || 'Conversion failed'
    status.value = 'error'
  }
}

async function downloadAllZip() {
  if (results.value.length <= 1) return
  try {
    // Jika dari server (image/sheet), kirim ulang sebagai batch
    if (detectedCategory.value.type !== 'pdf') {
      const prevStatus = status.value
      status.value = 'converting'
      progressText.value = 'Creating ZIP...'

      const formData = new FormData()
      formData.append('format', selectedFormat.value.toLowerCase())
      for (const file of files.value) formData.append('files', file)

      const response = await fetch('/api/convert', { method: 'POST', body: formData })
      if (!response.ok) throw new Error('Failed to create ZIP')
      const blob = await response.blob()
      await triggerDownload(blob, `figo-converted-${Date.now()}.zip`)
      status.value = prevStatus
      return
    }

    // Untuk PDF results, buat ZIP di client via JSZip-style manual (download satu per satu fallback)
    for (const result of results.value) {
      await triggerDownload(result.blob, result.name)
      // Delay kecil antar download agar browser tidak block
      await new Promise(r => setTimeout(r, 300))
    }
  } catch (err: any) {
    console.error(err)
    alert('Gagal mendownload: ' + err.message)
    status.value = 'done'
  }
}
</script>

<style scoped>
@keyframes spin-slow {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
.animate-spin-slow {
  animation: spin-slow 2s linear infinite;
}
</style>

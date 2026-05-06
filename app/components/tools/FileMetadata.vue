<template>
  <div class="glass-panel rounded-2xl p-6 md:p-8 mb-10" :class="isDark ? 'border border-white/5' : 'border border-slate-100'">
    <div class="flex items-center gap-3 mb-6">
      <div class="w-10 h-10 rounded-full flex items-center justify-center" :class="isDark ? 'bg-primary/15' : 'bg-blue-50'">
        <span class="material-symbols-outlined text-xl text-primary">analytics</span>
      </div>
      <div>
        <h2 class="font-headline font-bold text-lg" :class="isDark ? 'text-white' : 'text-slate-900'">File Metadata Inspector</h2>
        <p class="text-xs" :class="isDark ? 'text-gray-500' : 'text-slate-400'">Extract hidden EXIF, hashes, and properties</p>
      </div>
    </div>

    <!-- Upload Zone -->
    <div
      v-if="!file"
      class="border-2 border-dashed rounded-2xl p-8 md:p-12 text-center cursor-pointer transition-all duration-300 group"
      :class="[
        isDark ? 'border-white/10 hover:border-primary/40' : 'border-slate-200 hover:border-primary/40',
        isDragging ? '!border-primary bg-primary/5 scale-[1.01]' : ''
      ]"
      @dragover.prevent="isDragging = true"
      @dragleave="isDragging = false"
      @drop.prevent="handleDrop"
      @click="triggerInput"
    >
      <input ref="fileInput" type="file" class="hidden" @change="handleFileSelect" />
      <div class="mb-4">
        <span class="material-symbols-outlined text-5xl transition-transform duration-300 group-hover:scale-110"
          :class="isDragging ? 'text-primary' : (isDark ? 'text-gray-500' : 'text-slate-400')"
        >plagiarism</span>
      </div>
      <p class="font-headline font-bold text-lg mb-2" :class="isDark ? 'text-white' : 'text-slate-900'">
        {{ isDragging ? 'Drop file to analyze!' : 'Drag & drop a file here' }}
      </p>
      <p class="text-sm" :class="isDark ? 'text-gray-500' : 'text-slate-400'">
        or <span class="text-primary font-medium">click to browse</span>
      </p>
    </div>

    <!-- Loading -->
    <div v-else-if="isAnalyzing" class="text-center py-12">
      <div class="relative w-16 h-16 mx-auto mb-4">
        <svg class="w-full h-full animate-spin-slow" viewBox="0 0 80 80">
          <circle cx="40" cy="40" r="34" fill="none" stroke-width="4" :stroke="isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'" />
          <circle cx="40" cy="40" r="34" fill="none" stroke-width="4" stroke="currentColor" class="text-primary" stroke-dasharray="160" stroke-dashoffset="120" stroke-linecap="round" />
        </svg>
        <span class="material-symbols-outlined text-2xl text-primary absolute inset-0 flex items-center justify-center">analytics</span>
      </div>
      <p class="font-bold text-lg" :class="isDark ? 'text-white' : 'text-slate-900'">Analyzing File...</p>
      <p class="text-sm mt-1" :class="isDark ? 'text-gray-500' : 'text-slate-400'">Extracting metadata and computing hashes</p>
    </div>

    <!-- Results -->
    <div v-else class="space-y-4">
      <div class="flex justify-between items-center mb-2">
        <h3 class="font-bold text-sm uppercase tracking-wider opacity-60">Analysis Complete</h3>
        <div class="flex gap-2">
          <button @click="exportAsJson" class="px-3 py-1.5 rounded-2xl text-xs font-bold transition-colors border" :class="isDark ? 'bg-white/5 border-white/10 hover:bg-white/10' : 'bg-slate-50 border-slate-200 hover:bg-slate-100'">Export JSON</button>
          <button @click="resetAll" class="px-3 py-1.5 rounded-2xl text-xs font-bold bg-primary/10 text-primary hover:bg-primary/20 transition-colors">Analyze New File</button>
        </div>
      </div>

      <!-- Threat Detection Banner -->
      <div v-if="threats.length > 0" class="rounded-2xl p-4 border bg-red-500/10 border-red-500/20">
        <div class="flex items-center gap-2 mb-3 text-red-500">
          <span class="material-symbols-outlined text-base">warning</span>
          <span class="text-xs font-bold uppercase tracking-wider">Security Warning</span>
        </div>
        <div class="space-y-2">
          <div v-for="(threat, idx) in threats" :key="idx" class="flex items-start gap-2 bg-red-500/10 p-3 rounded-2xl border border-red-500/20">
            <span class="material-symbols-outlined text-red-500 text-sm mt-0.5">{{ threat.severity === 'high' ? 'gpp_bad' : 'error' }}</span>
            <div class="flex-1">
              <p class="text-sm font-bold text-red-600 dark:text-red-400">{{ threat.message }}</p>
              <div v-if="threat.advice" class="text-xs font-medium text-red-500 dark:text-red-300 opacity-90 border-t border-red-500/20 pt-1.5 mt-1.5">
                <span class="font-bold uppercase tracking-wider text-[10px]">Solusi:</span> {{ threat.advice }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- General Info -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="rounded-2xl p-4 border" :class="isDark ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-100'">
          <div class="flex items-center gap-2 mb-3 opacity-60">
            <span class="material-symbols-outlined text-sm">description</span>
            <span class="text-xs font-bold uppercase tracking-wider">File Overview</span>
          </div>
          <div class="space-y-2 text-sm">
            <div class="flex justify-between"><span class="opacity-60">Name</span><span class="font-medium truncate max-w-[200px]" :title="file.name">{{ file.name }}</span></div>
            <div class="flex justify-between"><span class="opacity-60">Size</span><span class="font-medium font-mono">{{ formatSize(file.size) }}</span></div>
            <div class="flex justify-between"><span class="opacity-60">Type</span><span class="font-medium">{{ file.type || 'unknown' }}</span></div>
            <div class="flex justify-between"><span class="opacity-60">Modified</span><span class="font-medium">{{ new Date(file.lastModified).toLocaleString() }}</span></div>
          </div>
        </div>

        <div class="rounded-2xl p-4 border" :class="isDark ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-100'">
          <div class="flex items-center gap-2 mb-3 opacity-60">
            <span class="material-symbols-outlined text-sm">fingerprint</span>
            <span class="text-xs font-bold uppercase tracking-wider">File Hashes</span>
          </div>
          <div class="space-y-2 text-xs font-mono">
            <div class="flex items-center justify-between group">
              <span class="opacity-60 font-sans text-xs">MD5</span>
              <div class="flex items-center gap-2">
                <span class="truncate max-w-[150px] md:max-w-[200px]" :title="hashes.md5">{{ hashes.md5 || 'computing...' }}</span>
                <button @click="copy(hashes.md5)" v-if="hashes.md5" class="opacity-0 group-hover:opacity-100 transition-opacity text-primary hover:scale-110"><span class="material-symbols-outlined text-sm">content_copy</span></button>
              </div>
            </div>
            <div class="flex items-center justify-between group">
              <span class="opacity-60 font-sans text-xs">SHA-1</span>
              <div class="flex items-center gap-2">
                <span class="truncate max-w-[150px] md:max-w-[200px]" :title="hashes.sha1">{{ hashes.sha1 || 'computing...' }}</span>
                <button @click="copy(hashes.sha1)" v-if="hashes.sha1" class="opacity-0 group-hover:opacity-100 transition-opacity text-primary hover:scale-110"><span class="material-symbols-outlined text-sm">content_copy</span></button>
              </div>
            </div>
            <div class="flex items-center justify-between group">
              <span class="opacity-60 font-sans text-xs">SHA-256</span>
              <div class="flex items-center gap-2">
                <span class="truncate max-w-[150px] md:max-w-[200px]" :title="hashes.sha256">{{ hashes.sha256 || 'computing...' }}</span>
                <button @click="copy(hashes.sha256)" v-if="hashes.sha256" class="opacity-0 group-hover:opacity-100 transition-opacity text-primary hover:scale-110"><span class="material-symbols-outlined text-sm">content_copy</span></button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Image EXIF Info -->
      <template v-if="exifData && Object.keys(exifData).length > 0">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div v-if="cameraInfo.make || cameraInfo.model" class="rounded-2xl p-4 border" :class="isDark ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-100'">
            <div class="flex items-center gap-2 mb-3 opacity-60">
              <span class="material-symbols-outlined text-sm">photo_camera</span>
              <span class="text-xs font-bold uppercase tracking-wider">Camera Info</span>
            </div>
            <div class="space-y-2 text-sm">
              <div v-if="cameraInfo.make" class="flex justify-between"><span class="opacity-60">Make</span><span class="font-medium">{{ cameraInfo.make }}</span></div>
              <div v-if="cameraInfo.model" class="flex justify-between"><span class="opacity-60">Model</span><span class="font-medium">{{ cameraInfo.model }}</span></div>
              <div v-if="cameraInfo.lens" class="flex justify-between"><span class="opacity-60">Lens</span><span class="font-medium truncate max-w-[180px]">{{ cameraInfo.lens }}</span></div>
              <div v-if="cameraInfo.software" class="flex justify-between"><span class="opacity-60">Software</span><span class="font-medium truncate max-w-[180px]">{{ cameraInfo.software }}</span></div>
              <div v-if="cameraInfo.date" class="flex justify-between"><span class="opacity-60">Original Date</span><span class="font-medium">{{ cameraInfo.date }}</span></div>
            </div>
          </div>

          <div v-if="cameraSettings.focalLength || cameraSettings.iso" class="rounded-2xl p-4 border" :class="isDark ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-100'">
            <div class="flex items-center gap-2 mb-3 opacity-60">
              <span class="material-symbols-outlined text-sm">tune</span>
              <span class="text-xs font-bold uppercase tracking-wider">Settings</span>
            </div>
            <div class="grid grid-cols-2 gap-3 text-sm">
              <div v-if="cameraSettings.focalLength" class="bg-black/5 dark:bg-white/5 p-2 rounded-xl text-center">
                <div class="text-[10px] opacity-60 uppercase mb-0.5">Focal Length</div>
                <div class="font-bold">{{ cameraSettings.focalLength }}</div>
              </div>
              <div v-if="cameraSettings.aperture" class="bg-black/5 dark:bg-white/5 p-2 rounded-xl text-center">
                <div class="text-[10px] opacity-60 uppercase mb-0.5">Aperture</div>
                <div class="font-bold">{{ cameraSettings.aperture }}</div>
              </div>
              <div v-if="cameraSettings.shutterSpeed" class="bg-black/5 dark:bg-white/5 p-2 rounded-xl text-center">
                <div class="text-[10px] opacity-60 uppercase mb-0.5">Shutter</div>
                <div class="font-bold">{{ cameraSettings.shutterSpeed }}</div>
              </div>
              <div v-if="cameraSettings.iso" class="bg-black/5 dark:bg-white/5 p-2 rounded-xl text-center">
                <div class="text-[10px] opacity-60 uppercase mb-0.5">ISO</div>
                <div class="font-bold">{{ cameraSettings.iso }}</div>
              </div>
              <div v-if="cameraSettings.exposureProgram" class="bg-black/5 dark:bg-white/5 p-2 rounded-xl text-center">
                <div class="text-[10px] opacity-60 uppercase mb-0.5">Exposure</div>
                <div class="font-bold truncate" :title="cameraSettings.exposureProgram">{{ cameraSettings.exposureProgram }}</div>
              </div>
              <div v-if="cameraSettings.flash" class="bg-black/5 dark:bg-white/5 p-2 rounded-xl text-center">
                <div class="text-[10px] opacity-60 uppercase mb-0.5">Flash</div>
                <div class="font-bold truncate" :title="cameraSettings.flash">{{ cameraSettings.flash }}</div>
              </div>
              <div v-if="cameraSettings.meteringMode" class="bg-black/5 dark:bg-white/5 p-2 rounded-xl text-center">
                <div class="text-[10px] opacity-60 uppercase mb-0.5">Metering</div>
                <div class="font-bold truncate" :title="cameraSettings.meteringMode">{{ cameraSettings.meteringMode }}</div>
              </div>
              <div v-if="cameraSettings.whiteBalance" class="bg-black/5 dark:bg-white/5 p-2 rounded-xl text-center">
                <div class="text-[10px] opacity-60 uppercase mb-0.5">White Bal.</div>
                <div class="font-bold truncate" :title="cameraSettings.whiteBalance">{{ cameraSettings.whiteBalance }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- GPS Data -->
        <div v-if="gpsInfo.latitude && gpsInfo.longitude" class="rounded-2xl p-4 border" :class="isDark ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-100'">
          <div class="flex justify-between items-start mb-3">
            <div class="flex items-center gap-2 opacity-60">
              <span class="material-symbols-outlined text-sm">location_on</span>
              <span class="text-xs font-bold uppercase tracking-wider">Location Data</span>
            </div>
            <a :href="`https://www.google.com/maps/search/?api=1&query=${gpsInfo.latitude},${gpsInfo.longitude}`" target="_blank" class="text-xs text-primary hover:underline flex items-center gap-1">
              Open Map <span class="material-symbols-outlined text-[10px]">open_in_new</span>
            </a>
          </div>
          <div class="flex flex-col md:flex-row gap-4">
            <div class="flex-1 space-y-2 text-sm">
              <div class="flex justify-between"><span class="opacity-60">Latitude</span><span class="font-medium font-mono">{{ gpsInfo.latitude }}</span></div>
              <div class="flex justify-between"><span class="opacity-60">Longitude</span><span class="font-medium font-mono">{{ gpsInfo.longitude }}</span></div>
              <div v-if="gpsInfo.altitude" class="flex justify-between"><span class="opacity-60">Altitude</span><span class="font-medium">{{ gpsInfo.altitude }}</span></div>
            </div>
            <!-- Static Map Placeholder (OpenStreetMap) -->
            <div class="w-full md:w-48 h-24 bg-black/10 dark:bg-white/10 rounded-2xl overflow-hidden relative border border-black/5 dark:border-white/5">
               <img :src="`https://static-maps.yandex.ru/1.x/?ll=${gpsInfo.longitude},${gpsInfo.latitude}&z=14&l=map&pt=${gpsInfo.longitude},${gpsInfo.latitude},pm2rdm`" class="w-full h-full object-cover" alt="Map" onerror="this.style.display='none'">
            </div>
          </div>
        </div>
      </template>
      
      <!-- PDF Info -->
      <div v-if="pdfInfo" class="rounded-2xl p-4 border" :class="isDark ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-100'">
         <div class="flex items-center gap-2 mb-3 opacity-60">
            <span class="material-symbols-outlined text-sm">picture_as_pdf</span>
            <span class="text-xs font-bold uppercase tracking-wider">PDF Information</span>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2 text-sm">
            <div v-for="(val, key) in pdfInfo" :key="key" class="flex justify-between">
              <span class="opacity-60 capitalize">{{ key }}</span>
              <span class="font-medium truncate max-w-[200px]" :title="String(val)">{{ val }}</span>
            </div>
          </div>
      </div>

      <!-- Media Info (Audio/Video) -->
      <div v-if="mediaInfo && Object.keys(mediaInfo).length > 0" class="rounded-2xl p-4 border" :class="isDark ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-100'">
         <div class="flex items-center gap-2 mb-3 opacity-60">
            <span class="material-symbols-outlined text-sm">{{ file?.type.startsWith('video/') ? 'movie' : 'audiotrack' }}</span>
            <span class="text-xs font-bold uppercase tracking-wider">Media Information</span>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2 text-sm">
            <div v-for="(val, key) in mediaInfo" :key="key" class="flex justify-between">
              <span class="opacity-60 capitalize">{{ key }}</span>
              <span class="font-medium truncate max-w-[200px]">{{ val }}</span>
            </div>
          </div>
      </div>
      
      <!-- Basic Image Info (Dimensions) -->
      <div v-if="imageInfo && Object.keys(imageInfo).length > 0 && !cameraInfo.make" class="rounded-2xl p-4 border" :class="isDark ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-100'">
         <div class="flex items-center gap-2 mb-3 opacity-60">
            <span class="material-symbols-outlined text-sm">image</span>
            <span class="text-xs font-bold uppercase tracking-wider">Image Information</span>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2 text-sm">
            <div v-for="(val, key) in imageInfo" :key="key" class="flex justify-between">
              <span class="opacity-60 capitalize">{{ key }}</span>
              <span class="font-medium truncate max-w-[200px]">{{ val }}</span>
            </div>
          </div>
      </div>

      <!-- Raw Metadata -->
      <div class="rounded-2xl border overflow-hidden" :class="isDark ? 'bg-black/20 border-white/10' : 'bg-white border-slate-200'">
        <button @click="showRaw = !showRaw" class="w-full flex items-center justify-between p-4 hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
          <div class="flex items-center gap-2 opacity-80">
            <span class="material-symbols-outlined text-sm">data_object</span>
            <span class="text-xs font-bold uppercase tracking-wider">Raw Metadata JSON</span>
          </div>
          <span class="material-symbols-outlined transition-transform" :class="showRaw ? 'rotate-180' : ''">expand_more</span>
        </button>
        <div v-if="showRaw" class="p-4 border-t border-black/5 dark:border-white/10 bg-black/5 dark:bg-black/50">
          <pre class="text-[10px] md:text-xs font-mono overflow-x-auto max-h-96 custom-scrollbar text-slate-800 dark:text-gray-300">{{ JSON.stringify(rawMetadata, null, 2) }}</pre>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import ExifReader from 'exifreader'
import SparkMD5 from 'spark-md5'

const { isDark } = useColorMode()
const { increment } = useHistoryCounter()

const fileInput = ref<HTMLInputElement | null>(null)
const isDragging = ref(false)
const file = ref<File | null>(null)
const isAnalyzing = ref(false)
const showRaw = ref(false)

const hashes = reactive({ md5: '', sha1: '', sha256: '' })
const exifData = ref<any>(null)
const pdfInfo = ref<any>(null)
const mediaInfo = ref<any>(null)
const imageInfo = ref<any>(null)
const rawMetadata = ref<any>({})
const threats = ref<{severity: 'high'|'medium', message: string, advice: string}[]>([])

const cameraInfo = reactive({ make: '', model: '', lens: '', software: '', date: '', orientation: '' })
const cameraSettings = reactive({ focalLength: '', aperture: '', shutterSpeed: '', iso: '', exposureProgram: '', flash: '', meteringMode: '', whiteBalance: '' })
const gpsInfo = reactive({ latitude: '', longitude: '', altitude: '' })

function triggerInput() { fileInput.value?.click() }

function handleFileSelect(e: Event) {
  const input = e.target as HTMLInputElement
  if (input.files && input.files[0]) processFile(input.files[0])
  input.value = ''
}

function handleDrop(e: DragEvent) {
  isDragging.value = false
  if (e.dataTransfer?.files && e.dataTransfer.files[0]) processFile(e.dataTransfer.files[0])
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

function resetAll() {
  file.value = null
  isAnalyzing.value = false
  showRaw.value = false
  hashes.md5 = ''; hashes.sha1 = ''; hashes.sha256 = ''
  exifData.value = null
  pdfInfo.value = null
  mediaInfo.value = null
  imageInfo.value = null
  rawMetadata.value = {}
  threats.value = []
  Object.assign(cameraInfo, { make: '', model: '', lens: '', software: '', date: '', orientation: '' })
  Object.assign(cameraSettings, { focalLength: '', aperture: '', shutterSpeed: '', iso: '', exposureProgram: '', flash: '', meteringMode: '', whiteBalance: '' })
  Object.assign(gpsInfo, { latitude: '', longitude: '', altitude: '' })
}

async function processFile(f: File) {
  resetAll()
  file.value = f
  isAnalyzing.value = true
  rawMetadata.value.file = { name: f.name, size: f.size, type: f.type, lastModified: f.lastModified }

  try {
    const arrayBuffer = await f.arrayBuffer()
    
    // 0. Security Threat Analysis
    analyzeThreats(f, arrayBuffer)

    // 1. Hash Calculation
    computeHashes(arrayBuffer)
    
    // 2. EXIF & Image Dimensions for Images
    if (f.type.startsWith('image/')) {
      extractExif(arrayBuffer)
      await extractImageDimensions(f)
    }
    
    // 3. PDF Metadata
    if (f.type === 'application/pdf') {
      await extractPdfMeta(arrayBuffer)
    }

    // 4. Media Metadata (Audio/Video)
    if (f.type.startsWith('video/') || f.type.startsWith('audio/')) {
      await extractMediaMeta(f)
    }

    increment()
  } catch (e) {
    console.error("Metadata extraction error:", e)
  } finally {
    isAnalyzing.value = false
  }
}

function computeHashes(buffer: ArrayBuffer) {
  // MD5
  const spark = new SparkMD5.ArrayBuffer()
  spark.append(buffer)
  hashes.md5 = spark.end()

  // Web Crypto for SHA-1 & SHA-256
  if (window.crypto && window.crypto.subtle) {
    window.crypto.subtle.digest('SHA-1', buffer).then(hashBuffer => {
      hashes.sha1 = Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('')
    })
    window.crypto.subtle.digest('SHA-256', buffer).then(hashBuffer => {
      hashes.sha256 = Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('')
    })
  }
}

function analyzeThreats(f: File, buffer: ArrayBuffer) {
  // 1. Check double extension (e.g., image.png.exe)
  const parts = f.name.split('.')
  if (parts.length > 2) {
    const ext1 = parts[parts.length - 2].toLowerCase()
    const ext2 = parts[parts.length - 1].toLowerCase()
    if (['exe', 'bat', 'cmd', 'vbs', 'js', 'scr'].includes(ext2) && ['pdf', 'doc', 'jpg', 'png', 'txt'].includes(ext1)) {
      threats.value.push({ 
        severity: 'high', 
        message: 'Ekstensi Ganda Terdeteksi: File mencoba menyamar sebagai dokumen aman (contoh: file.pdf.exe). Ini adalah teknik manipulasi standar dari malware.',
        advice: 'Segera hapus file ini jika Anda mendownloadnya dari internet. Jangan pernah diklik dua kali di Windows Explorer.'
      })
    }
  }

  // 2. Check Magic Bytes for MZ header (Windows Executable)
  const view = new Uint8Array(buffer, 0, Math.min(buffer.byteLength, 2))
  if (view.length >= 2 && view[0] === 0x4D && view[1] === 0x5A) {
    if (!f.name.toLowerCase().endsWith('.exe') && !f.name.toLowerCase().endsWith('.dll')) {
      threats.value.push({ 
        severity: 'high', 
        message: 'Sangat Berbahaya (Hidden Executable): File aslinya adalah program aplikasi (.exe) yang memanipulasi nama agar terlihat seperti file biasa. Pasti virus/malware.',
        advice: 'Jangan pernah dieksekusi atau dibuka. Hapus file ini permanen dari perangkat Anda.'
      })
    }
  }

  // 3. Static PDF Analysis
  if (f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf')) {
    // Only check first 5MB to prevent memory issues with massive PDFs
    const checkLength = Math.min(buffer.byteLength, 5 * 1024 * 1024)
    const pdfView = new Uint8Array(buffer, 0, checkLength)
    // Decode ascii fast
    let str = ''
    for (let i = 0; i < pdfView.length; i += 10000) {
      str += String.fromCharCode.apply(null, Array.from(pdfView.subarray(i, i + 10000)))
    }
    
    // Gunakan Regex dengan boundary untuk menghindari false positive pada binary stream
    if (/\/JavaScript[\s\/<\[]|\/JS[\s\/<\[]/.test(str)) {
      threats.value.push({ 
        severity: 'medium', 
        message: 'Peringatan /JavaScript: Ada skrip aktif tertanam di dalam PDF. Biasa dipakai hacker untuk mengeksploitasi celah di PDF Reader.',
        advice: 'Buka menggunakan Browser Web (Chrome/Edge/Firefox) karena browser akan otomatis memblokir eksekusi skrip PDF. Hindari pakai Adobe Acrobat versi lama.'
      })
    }
    
    // Check for Launch actions
    if (/\/Launch[\s\/<\[]/.test(str)) {
      threats.value.push({ 
        severity: 'high', 
        message: 'Sangat Berbahaya (/Launch): PDF ini secara paksa mencoba meluncurkan program aplikasi lain di komputer Anda. Ini adalah indikator kuat virus pencuri data.',
        advice: 'Sangat direkomendasikan untuk langsung menghapus file ini kecuali Anda sangat yakin ini adalah dokumen internal kantor yang valid.'
      })
    }
  }

  // 4. SVG XSS Check
  if (f.type === 'image/svg+xml' || f.name.toLowerCase().endsWith('.svg')) {
    const decoder = new TextDecoder('utf-8', { fatal: false })
    const str = decoder.decode(buffer)
    if (str.includes('<script') || str.includes('javascript:')) {
      threats.value.push({ 
        severity: 'high', 
        message: 'XSS Risk pada SVG: Gambar ini disisipi skrip. Jika gambar ini di-preview secara langsung di tab browser baru, skripnya bisa mencuri sesi login Anda.',
        advice: 'Aman jika hanya dirender via tag <img> biasa. Jangan pernah membuka URL gambar ini secara langsung di tab baru.'
      })
    }
  }
}

function extractExif(buffer: ArrayBuffer) {
  try {
    const tags = ExifReader.load(buffer, { expanded: true })
    exifData.value = tags
    rawMetadata.value.exif = tags

    if (tags.exif) {
      cameraInfo.make = tags.exif.Make?.description || ''
      cameraInfo.model = tags.exif.Model?.description || ''
      cameraInfo.lens = tags.exif.LensModel?.description || ''
      cameraInfo.software = tags.exif.Software?.description || ''
      cameraInfo.date = tags.exif.DateTimeOriginal?.description || tags.exif.DateTime?.description || ''
      cameraInfo.orientation = tags.exif.Orientation?.description || ''

      cameraSettings.focalLength = tags.exif.FocalLength?.description || ''
      cameraSettings.aperture = tags.exif.FNumber?.description || ''
      cameraSettings.shutterSpeed = tags.exif.ExposureTime?.description || ''
      cameraSettings.iso = tags.exif.ISOSpeedRatings?.description || ''
      cameraSettings.exposureProgram = tags.exif.ExposureProgram?.description || ''
      cameraSettings.flash = tags.exif.Flash?.description || ''
      cameraSettings.meteringMode = tags.exif.MeteringMode?.description || ''
      cameraSettings.whiteBalance = tags.exif.WhiteBalance?.description || ''
    }

    if (tags.gps) {
      gpsInfo.latitude = tags.gps.Latitude?.toString() || ''
      gpsInfo.longitude = tags.gps.Longitude?.toString() || ''
      gpsInfo.altitude = tags.gps.Altitude?.description || ''
    }
  } catch (e) {
    console.log("No EXIF data found")
  }
}

async function extractPdfMeta(buffer: ArrayBuffer) {
  try {
    const pdfjsLib = await import('pdfjs-dist')
    pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs'
    const pdf = await pdfjsLib.getDocument({ data: buffer }).promise
    const metaData = await pdf.getMetadata()
    
    pdfInfo.value = {
      pages: pdf.numPages,
      version: metaData.info?.PDFFormatVersion || '',
      creator: metaData.info?.Creator || '',
      producer: metaData.info?.Producer || '',
      creationDate: metaData.info?.CreationDate || '',
      modifiedDate: metaData.info?.ModDate || '',
      title: metaData.info?.Title || '',
      author: metaData.info?.Author || '',
      subject: metaData.info?.Subject || '',
      keywords: metaData.info?.Keywords || '',
      encrypted: metaData.info?.IsEncrypted ? 'Yes' : 'No'
    }
    
    // Clean up empty fields
    for (const key in pdfInfo.value) {
      if (!pdfInfo.value[key] || pdfInfo.value[key] === '') {
        delete pdfInfo.value[key]
      }
    }
    
    rawMetadata.value.pdf = metaData
    pdf.destroy()
  } catch (e) {
    console.error("PDF Meta error", e)
  }
}

function extractImageDimensions(f: File): Promise<void> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(f)
    const img = new Image()
    img.onload = () => {
      imageInfo.value = {
        width: `${img.naturalWidth} px`,
        height: `${img.naturalHeight} px`,
        aspectRatio: (img.naturalWidth / img.naturalHeight).toFixed(2)
      }
      rawMetadata.value.dimensions = imageInfo.value
      URL.revokeObjectURL(url)
      resolve()
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      resolve()
    }
    img.src = url
  })
}

function extractMediaMeta(f: File): Promise<void> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(f)
    const media = document.createElement(f.type.startsWith('video/') ? 'video' : 'audio')
    
    media.onloadedmetadata = () => {
      mediaInfo.value = {
        duration: formatDuration(media.duration)
      }
      if (media instanceof HTMLVideoElement) {
        mediaInfo.value.resolution = `${media.videoWidth} × ${media.videoHeight}`
        mediaInfo.value.aspectRatio = (media.videoWidth / media.videoHeight).toFixed(2)
      }
      rawMetadata.value.media = mediaInfo.value
      URL.revokeObjectURL(url)
      resolve()
    }
    media.onerror = () => {
      URL.revokeObjectURL(url)
      resolve()
    }
    media.src = url
  })
}

function formatDuration(seconds: number): string {
  if (!seconds || !isFinite(seconds)) return 'Unknown'
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = Math.floor(seconds % 60)
  if (h > 0) return `${h}h ${m}m ${s}s`
  if (m > 0) return `${m}m ${s}s`
  return `${s}s`
}

function copy(text: string) {
  if (navigator.clipboard) navigator.clipboard.writeText(text)
}

function exportAsJson() {
  if (!file.value) return
  const data = JSON.stringify(rawMetadata.value, null, 2)
  const blob = new Blob([data], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${file.value.name}-metadata.json`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
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
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: rgba(100, 100, 100, 0.3);
  border-radius: 10px;
}
</style>

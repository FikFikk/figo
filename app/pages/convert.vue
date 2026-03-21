<template>
  <div class="pt-24 pb-20 px-6 md:px-8 max-w-4xl mx-auto min-h-screen">
    <!-- Header -->
    <div class="text-center mb-12">
      <div class="inline-block px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase mb-6"
        :class="isDark ? 'bg-primary/15 text-primary' : 'bg-primary-fixed text-on-primary-fixed'"
      >
        <span class="material-symbols-outlined text-sm align-middle mr-1">transform</span>
        File Converter
      </div>
      <h1 class="text-3xl md:text-5xl font-headline font-extrabold tracking-tight mb-4"
        :class="isDark ? 'text-white' : 'text-slate-900'"
      >Convert Anything</h1>
      <p class="text-base md:text-lg max-w-xl mx-auto" :class="isDark ? 'text-gray-400' : 'text-secondary'">
        Lossless multi-threaded translation between any file format. PNG, WEBP, JPG, GIF, AVIF — and more.
      </p>
    </div>

    <!-- Upload Zone -->
    <div
      v-if="status === 'idle'"
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
      <input ref="fileInput" type="file" class="hidden" multiple accept="image/*" @change="handleFileSelect" />
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
    <div v-if="files.length > 0 && status === 'idle'" class="mt-8 space-y-4">
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
        <span class="material-symbols-outlined text-2xl text-primary">description</span>
        <div class="flex-1 min-w-0">
          <p class="font-medium truncate text-sm" :class="isDark ? 'text-white' : 'text-slate-900'">{{ file.name }}</p>
          <p class="text-xs" :class="isDark ? 'text-gray-500' : 'text-slate-400'">{{ formatSize(file.size) }}</p>
        </div>
        <span class="material-symbols-outlined text-lg" :class="isDark ? 'text-gray-600' : 'text-slate-300'">arrow_forward</span>
        <span class="text-xs font-bold uppercase tracking-wider text-primary">{{ selectedFormat }}</span>
        <button @click="removeFile(idx)" class="ml-2 hover:text-red-500 transition-colors"
          :class="isDark ? 'text-gray-500' : 'text-slate-400'"
        >
          <span class="material-symbols-outlined text-lg">close</span>
        </button>
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
        >
          Clear
        </button>
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
        <p class="font-headline font-bold text-xl mb-2" :class="isDark ? 'text-white' : 'text-slate-900'">
          Converting...
        </p>
        <p class="text-sm" :class="isDark ? 'text-gray-500' : 'text-slate-400'">
          Processing {{ files.length }} file{{ files.length > 1 ? 's' : '' }} to {{ selectedFormat }}
        </p>
      </div>
    </div>

    <!-- Results -->
    <div v-if="status === 'done'" class="mt-8 space-y-4">
      <!-- Success Banner -->
      <div class="glass-panel rounded-2xl p-6 text-center" :class="isDark ? 'border border-green-500/20' : 'border border-green-200'">
        <span class="material-symbols-outlined text-4xl text-green-500 mb-2">check_circle</span>
        <p class="font-headline font-bold text-lg" :class="isDark ? 'text-white' : 'text-slate-900'">
          {{ results.length }} file{{ results.length > 1 ? 's' : '' }} converted successfully!
        </p>
        <p class="text-xs mt-1" :class="isDark ? 'text-gray-500' : 'text-slate-400'">{{ conversionTime }}</p>
      </div>

      <!-- Result Items -->
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

      <!-- Download All + New Conversion -->
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
        >
          Try Again
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
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

const ALL_FORMATS = ['WEBP', 'PNG', 'JPG', 'GIF', 'AVIF', 'TIFF']

// Smart format filtering: hide the input file's format from the options
const availableFormats = computed(() => {
  if (files.value.length === 0) return ALL_FORMATS

  // Collect all unique extensions from uploaded files
  const inputExtensions = new Set(
    files.value.map(f => {
      const ext = f.name.split('.').pop()?.toUpperCase() || ''
      return ext === 'JPEG' ? 'JPG' : ext
    })
  )

  const filtered = ALL_FORMATS.filter(fmt => !inputExtensions.has(fmt))

  // If the currently selected format was removed, auto-select the first available
  if (!filtered.includes(selectedFormat.value) && filtered.length > 0) {
    selectedFormat.value = filtered[0]!
  }

  return filtered
})

function triggerInput() { fileInput.value?.click() }

function handleFileSelect(e: Event) {
  const input = e.target as HTMLInputElement
  if (input.files) files.value.push(...Array.from(input.files))
  // Reset input so same file can be re-selected
  input.value = ''
}

function handleDrop(e: DragEvent) {
  isDragging.value = false
  if (e.dataTransfer?.files) files.value.push(...Array.from(e.dataTransfer.files))
}

function removeFile(idx: number) { files.value.splice(idx, 1) }

function formatSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

function clearAll() {
  files.value = []
  selectedFormat.value = 'WEBP'
}

function resetAll() {
  // Revoke any blob URLs to free memory
  results.value.forEach(r => URL.revokeObjectURL(r.url))
  results.value = []
  files.value = []
  status.value = 'idle'
  errorMessage.value = ''
  selectedFormat.value = 'WEBP'
}

async function triggerDownload(blob: Blob, filename: string) {
  // 1. Prioritize File System Access API (Bypasses IDM natively and ensures perfect filename)
  if ('showSaveFilePicker' in window) {
    try {
      const handle = await (window as any).showSaveFilePicker({
        suggestedName: filename,
      })
      const writable = await handle.createWritable()
      await writable.write(blob)
      await writable.close()
      return // Success!
    } catch (err: any) {
      // User cancelled or error, fall through to fallback
      if (err.name === 'AbortError') return
      console.warn('showSaveFilePicker failed:', err)
    }
  }

  // 2. IE/Edge fallback
  if (typeof (window.navigator as any).msSaveOrOpenBlob !== 'undefined') {
    (window.navigator as any).msSaveOrOpenBlob(blob, filename)
    return
  }
  
  // 3. Last resort fallback (Object URL + anchor element)
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.style.display = 'none'
  a.href = url
  a.download = filename || 'download.file'
  a.target = '_blank' // Sometimes helps IDM back off
  document.body.appendChild(a)
  a.click()
  
  setTimeout(() => {
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }, 1000)
}

function downloadFile(result: ConvertedFile) {
  triggerDownload(result.blob, result.name)
}

async function startConversion() {
  if (files.value.length === 0) return

  status.value = 'converting'
  errorMessage.value = ''
  const startTime = performance.now()

  try {
    const promises = files.value.map(async (file) => {
      const formData = new FormData()
      formData.append('format', selectedFormat.value.toLowerCase())
      formData.append('files', file) // Send individually

      const response = await fetch('/api/convert', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const errData = await response.json().catch(() => ({ message: 'Unknown error' }))
        throw new Error(errData.message || `Server returned ${response.status}`)
      }

      const blob = await response.blob()
      let outputName = response.headers.get('X-Output-Name')
      if (!outputName) {
        const baseName = file.name.replace(/\.[^.]+$/, '')
        outputName = `${baseName}.${selectedFormat.value.toLowerCase()}`
      }

      return {
        name: outputName,
        size: blob.size,
        url: URL.createObjectURL(blob), // Still used for display preview if needed
        blob,
      }
    })

    results.value = await Promise.all(promises)

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
  if (files.value.length === 0) return

  try {
    const prevStatus = status.value
    status.value = 'converting' // Show spinner
    
    const formData = new FormData()
    formData.append('format', selectedFormat.value.toLowerCase())
    for (const file of files.value) {
      formData.append('files', file)
    }

    const response = await fetch('/api/convert', {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) throw new Error('Failed to create ZIP')

    const blob = await response.blob()
    await triggerDownload(blob, 'figo-converted.zip')
    
    status.value = prevStatus
  } catch (err: any) {
    console.error(err)
    alert('Gagal mendownload ZIP: ' + err.message)
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

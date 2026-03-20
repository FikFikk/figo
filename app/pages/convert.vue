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
        Lossless multi-threaded translation between any file format. PNG, WEBP, PDF, MP4, GIF — and more.
      </p>
    </div>

    <!-- Upload Zone -->
    <div
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

    <!-- Selected Files -->
    <div v-if="files.length > 0" class="mt-8 space-y-4">
      <!-- Output Format -->
      <div class="flex items-center gap-4 flex-wrap">
        <span class="text-sm font-bold" :class="isDark ? 'text-gray-400' : 'text-slate-500'">Convert to:</span>
        <button
          v-for="fmt in formats"
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

      <!-- Convert Button -->
      <button
        class="w-full py-4 bg-primary text-on-primary rounded-full font-headline font-bold text-lg hover:scale-[1.01] hover:shadow-xl hover:shadow-primary/20 transition-all active:scale-[0.99] flex items-center justify-center gap-2"
        @click="convert"
      >
        <span class="material-symbols-outlined">bolt</span>
        Convert {{ files.length }} file{{ files.length > 1 ? 's' : '' }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
useSeoMeta({ title: 'Convert — FiGo' })
const { isDark } = useColorMode()
const { increment } = useHistoryCounter()

const fileInput = ref<HTMLInputElement | null>(null)
const files = ref<File[]>([])
const isDragging = ref(false)
const selectedFormat = ref('WEBP')
const formats = ['WEBP', 'PNG', 'JPG', 'PDF', 'GIF', 'SVG']

function triggerInput() { fileInput.value?.click() }

function handleFileSelect(e: Event) {
  const input = e.target as HTMLInputElement
  if (input.files) files.value.push(...Array.from(input.files))
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

function convert() {
  increment(files.value.length)
  alert(`Converting ${files.value.length} file(s) to ${selectedFormat.value}... (UI demo — backend not connected)`)
}
</script>

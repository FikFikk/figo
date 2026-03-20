<template>
  <div class="pt-24 pb-20 px-6 md:px-8 max-w-4xl mx-auto min-h-screen">
    <!-- Header -->
    <div class="text-center mb-12">
      <div class="inline-block px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase mb-6"
        :class="isDark ? 'bg-tertiary/15 text-tertiary' : 'bg-purple-50 text-tertiary'"
      >
        <span class="material-symbols-outlined text-sm align-middle mr-1">layers</span>
        File Compressor
      </div>
      <h1 class="text-3xl md:text-5xl font-headline font-extrabold tracking-tight mb-4"
        :class="isDark ? 'text-white' : 'text-slate-900'"
      >Compress &amp; Optimize</h1>
      <p class="text-base md:text-lg max-w-xl mx-auto" :class="isDark ? 'text-gray-400' : 'text-secondary'">
        Reduce file sizes by up to 80% without losing quality. Images, videos, PDFs, and archives.
      </p>
    </div>

    <!-- Upload Zone -->
    <div
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
          :class="isDragging ? 'text-tertiary' : (isDark ? 'text-gray-500' : 'text-slate-400')"
        >compress</span>
      </div>
      <p class="font-headline font-bold text-lg mb-2" :class="isDark ? 'text-white' : 'text-slate-900'">
        {{ isDragging ? 'Drop files here!' : 'Drag & drop files to compress' }}
      </p>
      <p class="text-sm" :class="isDark ? 'text-gray-500' : 'text-slate-400'">
        or <span class="text-tertiary font-medium">click to browse</span> • Images, Videos, PDFs
      </p>
    </div>

    <!-- Quality Slider -->
    <div v-if="files.length > 0" class="mt-8 space-y-6">
      <div class="glass-panel rounded-xl p-6" :class="isDark ? 'border border-white/5' : 'border border-slate-100'">
        <div class="flex justify-between items-center mb-4">
          <span class="font-headline font-bold text-sm" :class="isDark ? 'text-white' : 'text-slate-900'">Compression Level</span>
          <span class="text-sm font-bold" :class="quality > 70 ? 'text-green-500' : quality > 40 ? 'text-yellow-500' : 'text-red-500'">
            {{ quality }}% Quality
          </span>
        </div>
        <input type="range" min="10" max="100" step="5" v-model.number="quality"
          class="w-full h-2 rounded-full appearance-none cursor-pointer"
          :class="isDark ? 'bg-white/10' : 'bg-slate-200'"
          style="accent-color: #6b38d4;"
        />
        <div class="flex justify-between text-xs mt-2" :class="isDark ? 'text-gray-600' : 'text-slate-400'">
          <span>Smallest file</span>
          <span>Best quality</span>
        </div>
      </div>

      <!-- File List -->
      <div
        v-for="(file, idx) in files"
        :key="idx"
        class="glass-panel rounded-xl p-4 flex items-center gap-4"
        :class="isDark ? 'border border-white/5' : 'border border-slate-100'"
      >
        <span class="material-symbols-outlined text-2xl text-tertiary">description</span>
        <div class="flex-1 min-w-0">
          <p class="font-medium truncate text-sm" :class="isDark ? 'text-white' : 'text-slate-900'">{{ file.name }}</p>
          <p class="text-xs" :class="isDark ? 'text-gray-500' : 'text-slate-400'">
            {{ formatSize(file.size) }} → <span class="text-green-500 font-bold">~{{ formatSize(Math.floor(file.size * (1 - (100 - quality) / 120))) }}</span>
          </p>
        </div>
        <button @click="files.splice(idx, 1)" class="hover:text-red-500 transition-colors"
          :class="isDark ? 'text-gray-500' : 'text-slate-400'"
        >
          <span class="material-symbols-outlined text-lg">close</span>
        </button>
      </div>

      <!-- Compress Button -->
      <button
        class="w-full py-4 rounded-full font-headline font-bold text-lg hover:scale-[1.01] hover:shadow-xl transition-all active:scale-[0.99] flex items-center justify-center gap-2 bg-tertiary text-white shadow-lg shadow-tertiary/20 hover:shadow-tertiary/30"
        @click="compress"
      >
        <span class="material-symbols-outlined">bolt</span>
        Compress {{ files.length }} file{{ files.length > 1 ? 's' : '' }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
useSeoMeta({ title: 'Compress — FiGo' })
const { isDark } = useColorMode()
const { increment } = useHistoryCounter()

const fileInput = ref<HTMLInputElement | null>(null)
const files = ref<File[]>([])
const isDragging = ref(false)
const quality = ref(75)

function triggerInput() { fileInput.value?.click() }
function handleFileSelect(e: Event) {
  const input = e.target as HTMLInputElement
  if (input.files) files.value.push(...Array.from(input.files))
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
function compress() {
  increment(files.value.length)
  alert(`Compressing ${files.value.length} file(s) at ${quality.value}% quality... (UI demo)`)
}
</script>

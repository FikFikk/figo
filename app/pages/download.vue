<template>
  <div class="pt-24 pb-20 px-6 md:px-8 max-w-4xl mx-auto min-h-screen">
    <!-- Header -->
    <div class="text-center mb-12">
      <div class="inline-block px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase mb-6"
        :class="isDark ? 'bg-primary/15 text-primary' : 'bg-primary-fixed text-on-primary-fixed'"
      >
        <span class="material-symbols-outlined text-sm align-middle mr-1">download</span>
        Link Downloader
      </div>
      <h1 class="text-3xl md:text-5xl font-headline font-extrabold tracking-tight mb-4"
        :class="isDark ? 'text-white' : 'text-slate-900'"
      >Download Anything</h1>
      <p class="text-base md:text-lg max-w-xl mx-auto" :class="isDark ? 'text-gray-400' : 'text-secondary'">
        Paste a link from YouTube, TikTok, Instagram, or Twitter and download the content instantly.
      </p>
    </div>

    <!-- URL Input -->
    <div class="glass-panel rounded-2xl p-6 md:p-8" :class="isDark ? 'border border-white/5' : 'border border-slate-100'">
      <div class="flex flex-col sm:flex-row gap-4">
        <div class="flex-1 relative">
          <!-- Dynamic Platform Icon -->
          <div class="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center pointer-events-none transition-all duration-300">
            <img v-if="detectedIcon" :src="detectedIcon" class="w-full h-full object-cover rounded-lg shadow-sm bg-white" />
            <span v-else class="material-symbols-outlined text-xl"
              :class="isDark ? 'text-gray-500' : 'text-slate-400'"
            >link</span>
          </div>
          <input
            v-model="url"
            type="url"
            placeholder="Paste URL here... (YouTube, TikTok, Instagram, Twitter)"
            class="w-full pl-12 pr-12 py-4 rounded-xl text-sm font-medium transition-all outline-none"
            :class="isDark
              ? 'bg-white/5 text-white placeholder-gray-600 border border-white/10 focus:border-primary/40 focus:bg-white/8'
              : 'bg-slate-50 text-slate-900 placeholder-slate-400 border border-slate-200 focus:border-primary focus:bg-white'"
            @keydown.enter="fetchInfo"
            :disabled="isLoading"
          />
          <!-- Clear Button -->
          <button
            v-if="url"
            class="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:bg-black/5 dark:hover:bg-white/5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            @click="resetAll"
          >
            <span class="material-symbols-outlined text-lg">close</span>
          </button>
        </div>
        <button
          class="px-8 py-4 bg-primary text-on-primary rounded-xl font-headline font-bold text-sm hover:scale-[1.02] hover:shadow-lg hover:shadow-primary/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2 whitespace-nowrap"
          @click="fetchInfo"
          :disabled="!url.trim() || isLoading"
          :class="{ 'opacity-50 cursor-not-allowed': !url.trim() || isLoading }"
        >
          <span v-if="isLoading" class="material-symbols-outlined text-lg animate-spin">progress_activity</span>
          <span v-else class="material-symbols-outlined text-lg">search</span>
          {{ isLoading ? 'Fetching...' : 'Fetch Info' }}
        </button>
      </div>
    </div>

    <!-- Error Message -->
    <div v-if="error" class="mt-8 p-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl text-red-600 dark:text-red-400 text-sm flex items-start gap-3 animate-fade-in shadow-sm">
      <span class="material-symbols-outlined text-lg mt-0.5">error</span>
      <p class="font-medium flex-1">{{ error }}</p>
    </div>

    <!-- ============ STEP 2: Quality Picker ============ -->
    <div v-if="videoInfo" class="mt-8 animate-fade-in">
      <div class="glass-panel rounded-2xl p-6 md:p-8 border" :class="isDark ? 'border-white/5' : 'border-slate-100'">
        <!-- Video Preview -->
        <div class="flex flex-col md:flex-row gap-6 mb-8">
          <div class="w-full md:w-64 shrink-0 rounded-xl overflow-hidden shadow-lg aspect-video bg-black/10">
            <img v-if="videoInfo.thumb" :src="videoInfo.thumb" class="w-full h-full object-cover" alt="Thumbnail" />
            <div v-else class="w-full h-full flex items-center justify-center">
              <span class="material-symbols-outlined text-4xl text-gray-500">movie</span>
            </div>
          </div>
          <div class="flex-1 min-w-0">
            <h3 class="font-headline font-bold text-lg md:text-xl mb-2 line-clamp-2" :class="isDark ? 'text-white' : 'text-slate-900'">
              {{ videoInfo.title }}
            </h3>
            <div class="flex flex-wrap gap-3 text-xs" :class="isDark ? 'text-gray-400' : 'text-slate-500'">
              <span v-if="videoInfo.uploader" class="flex items-center gap-1">
                <span class="material-symbols-outlined text-sm">person</span>
                {{ videoInfo.uploader }}
              </span>
              <span v-if="videoInfo.duration" class="flex items-center gap-1">
                <span class="material-symbols-outlined text-sm">schedule</span>
                {{ formatDuration(videoInfo.duration) }}
              </span>
              <span class="flex items-center gap-1">
                <span class="material-symbols-outlined text-sm">tune</span>
                {{ videoInfo.qualities.length }} format{{ videoInfo.qualities.length > 1 ? 's' : '' }} available
              </span>
            </div>
          </div>
        </div>

        <!-- Quality Options -->
        <h4 class="font-headline font-bold text-sm uppercase tracking-widest mb-4" :class="isDark ? 'text-gray-400' : 'text-slate-500'">
          <span class="material-symbols-outlined text-sm align-middle mr-1">high_quality</span>
          Select Quality
        </h4>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
          <button
            v-for="q in videoInfo.qualities"
            :key="q.formatId"
            @click="selectedFormat = q.formatId"
            class="p-4 rounded-xl text-left transition-all border-2 group"
            :class="selectedFormat === q.formatId
              ? 'border-primary bg-primary/10 shadow-lg shadow-primary/10 scale-[1.02]'
              : isDark
                ? 'border-white/5 bg-white/[0.02] hover:border-white/15 hover:bg-white/5'
                : 'border-slate-100 bg-slate-50/50 hover:border-primary/30 hover:bg-primary/5'"
          >
            <div class="flex items-center gap-3">
              <!-- Radio indicator -->
              <div class="w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all"
                :class="selectedFormat === q.formatId
                  ? 'border-primary bg-primary'
                  : isDark ? 'border-gray-600' : 'border-slate-300'"
              >
                <div v-if="selectedFormat === q.formatId" class="w-2 h-2 rounded-full bg-white"></div>
              </div>
              <div class="flex-1 min-w-0">
                <p class="font-bold text-sm truncate" :class="isDark ? 'text-white' : 'text-slate-900'">
                  {{ q.resolution }}
                </p>
                <p class="text-xs mt-0.5" :class="isDark ? 'text-gray-500' : 'text-slate-400'">
                  {{ q.ext.toUpperCase() }}
                  <span v-if="q.note" class="text-primary/80 font-semibold"> • {{ q.note }}</span>
                  <span class="text-green-500 font-semibold"> • Audio ✓</span>
                  <span v-if="q.filesize"> • ~{{ formatSize(q.filesize) }}</span>
                </p>
              </div>
            </div>
          </button>
        </div>

        <!-- Download Button -->
        <button
          @click="downloadSelected"
          :disabled="!selectedFormat || isProcessing"
          class="w-full py-4 bg-primary text-on-primary font-headline font-bold text-sm rounded-xl hover:scale-[1.01] hover:shadow-lg hover:shadow-primary/20 transition-all active:scale-[0.99] flex items-center justify-center gap-2"
          :class="{ 'opacity-50 cursor-not-allowed': !selectedFormat || isProcessing }"
        >
          <span v-if="isProcessing" class="material-symbols-outlined text-lg animate-spin">progress_activity</span>
          <span v-else class="material-symbols-outlined text-lg">download</span>
          {{ isProcessing ? 'Memproses Video & Audio... (Mungkin butuh waktu 1-3 menit)' : (selectedFormat ? 'Download Selected Quality' : 'Select a quality first') }}
        </button>
      </div>
    </div>


    <!-- Supported Platforms -->
    <div class="mt-10 grid grid-cols-2 md:grid-cols-4 gap-4">
      <div
        v-for="platform in platforms"
        :key="platform.name"
        class="glass-panel rounded-xl p-5 text-center transition-all duration-300 group hover:scale-[1.02] cursor-pointer overflow-hidden border"
        :class="isDark 
          ? 'border-white/5 hover:border-primary/30 bg-white/[0.02]' 
          : 'border-slate-100 hover:border-primary/30 bg-slate-50/50'"
        @click="url = platform.example"
      >
        <div class="w-16 h-16 mx-auto mb-4 flex items-center justify-center transition-transform group-hover:scale-110 shadow-lg rounded-2xl overflow-hidden bg-white">
          <img :src="platform.icon" :alt="platform.name" class="w-full h-full object-cover" />
        </div>
        <p class="font-headline font-bold text-sm" :class="isDark ? 'text-white' : 'text-slate-900'">{{ platform.name }}</p>
        <p class="text-xs mt-1" :class="isDark ? 'text-gray-500' : 'text-slate-400'">{{ platform.tag }}</p>
      </div>
    </div>

    <!-- Download History -->
    <div v-if="history.length > 0" class="mt-10">
      <h3 class="font-headline font-bold text-lg mb-4" :class="isDark ? 'text-white' : 'text-slate-900'">Recent Downloads</h3>
      <div class="space-y-3">
        <div
          v-for="(item, idx) in history"
          :key="idx"
          class="glass-panel rounded-xl p-4 flex items-center gap-4"
          :class="isDark ? 'border border-white/5' : 'border border-slate-100'"
        >
          <div class="w-10 h-10 flex items-center justify-center shrink-0 shadow-sm rounded-xl overflow-hidden bg-white">
            <img v-if="item.icon" :src="item.icon" class="w-full h-full object-cover" />
            <span v-else class="material-symbols-outlined text-xl text-slate-400">link</span>
          </div>
          <div class="flex-1 min-w-0">
            <p class="font-medium truncate text-sm" :class="isDark ? 'text-white' : 'text-slate-900'">{{ item.url }}</p>
            <p class="text-xs" :class="isDark ? 'text-gray-500' : 'text-slate-400'">{{ item.platform }} • {{ item.time }}</p>
          </div>
          <span class="material-symbols-outlined text-green-500 text-lg">check_circle</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
useSeoMeta({ title: 'Download — FiGo' })
const { isDark } = useColorMode()
const { increment } = useHistoryCounter()

const url = ref('')
const history = ref<{ url: string; platform: string; icon: string; time: string }[]>([])

const platforms = [
  { 
    name: 'YouTube', 
    icon: 'https://static.vecteezy.com/system/resources/thumbnails/018/930/572/small_2x/youtube-logo-youtube-icon-transparent-free-png.png', 
    tag: 'Videos & Shorts', 
    example: 'https://youtube.com/watch?v=example' 
  },
  { 
    name: 'TikTok', 
    icon: 'https://img.freepik.com/premium-vector/tik-tok-logo_578229-290.jpg?semt=ais_hybrid&w=740&q=80', 
    tag: 'Videos & Slides', 
    example: 'https://tiktok.com/@user/video/123' 
  },
  { 
    name: 'Instagram', 
    icon: 'https://unblast.com/wp-content/uploads/2025/07/instagram-logo-colored.jpg', 
    tag: 'Reels & Posts', 
    example: 'https://instagram.com/reel/example' 
  },
  { 
    name: 'Twitter/X', 
    icon: 'https://cdn.worldvectorlogo.com/logos/twitter-logo-2.svg', 
    tag: 'Videos & Spaces', 
    example: 'https://x.com/user/status/123' 
  },
]

const detectedIcon = computed(() => {
  if (!url.value.trim()) return null
  return detectPlatform(url.value).icon
})

function detectPlatform(link: string): { name: string; icon: string } {
  const lowUrl = link.toLowerCase()
  if (lowUrl.includes('youtube') || lowUrl.includes('youtu.be')) return { name: 'YouTube', icon: platforms[0]!.icon }
  if (lowUrl.includes('tiktok')) return { name: 'TikTok', icon: platforms[1]!.icon }
  if (lowUrl.includes('instagram')) return { name: 'Instagram', icon: platforms[2]!.icon }
  if (lowUrl.includes('twitter') || lowUrl.includes('x.com')) return { name: 'Twitter/X', icon: platforms[3]!.icon }
  return { name: 'Web', icon: '' }
}

// State
const isLoading = ref(false)
const isDownloading = ref(false)
const error = ref('')
const videoInfo = ref<any>(null)
const selectedFormat = ref<string>('')

function resetAll() {
  url.value = ''
  error.value = ''
  videoInfo.value = null
  selectedFormat.value = ''
}

// Helpers
function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = Math.floor(seconds % 60)
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  return `${m}:${String(s).padStart(2, '0')}`
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB'
  if (bytes < 1073741824) return (bytes / 1048576).toFixed(1) + ' MB'
  return (bytes / 1073741824).toFixed(2) + ' GB'
}

// STEP 1: Fetch video info & available qualities
async function fetchInfo() {
  if (!url.value.trim() || isLoading.value) return

  isLoading.value = true
  error.value = ''
  videoInfo.value = null
  selectedFormat.value = ''

  try {
    const response = await $fetch('/api/download', {
      method: 'POST',
      body: { url: url.value, mode: 'info' }
    }) as any

    if (response.qualities && response.qualities.length > 0) {
      videoInfo.value = response
      // Auto-select the first combined (audio+video) format
      selectedFormat.value = response.qualities[0].formatId
    } else {
      error.value = 'Tidak ada format yang tersedia untuk URL ini.'
    }
  } catch (err: any) {
    error.value = err.data?.message || 'Gagal mengambil info video.'
  } finally {
    isLoading.value = false
  }
}

// Polling state
const isProcessing = ref(false)
const pollInterval = ref<any>(null)

// Clean up polling if user navigates away
onUnmounted(() => {
  if (pollInterval.value) clearInterval(pollInterval.value)
})

// STEP 2: Download with selected quality — polls job status until ready
async function downloadSelected() {
  if (!selectedFormat.value || isDownloading.value || isProcessing.value) return

  isProcessing.value = true
  error.value = ''

  try {
    const targetUrl = url.value || videoInfo.value?._originalUrl || ''
    const response = await $fetch('/api/download', {
      method: 'POST',
      body: { 
        url: targetUrl, 
        mode: 'download', 
        formatId: selectedFormat.value,
        title: videoInfo.value?.title || 'Video'
      }
    }) as any

    const jobId = response.jobId

    // Start polling status
    pollInterval.value = setInterval(async () => {
      try {
        const { status, error: jobErr } = await $fetch(`/api/job-status?id=${jobId}`) as any
        
        if (status === 'done') {
          clearInterval(pollInterval.value)
          isProcessing.value = false
          
          // Trigger the actual download natively in the browser
          window.location.href = `/api/download-file?id=${jobId}`

          // Add to history
          const { name, icon } = detectPlatform(targetUrl)
          history.value.unshift({
            url: targetUrl, platform: name, icon, time: new Date().toLocaleTimeString(),
          })
          increment()
          
        } else if (status === 'error') {
          clearInterval(pollInterval.value)
          isProcessing.value = false
          error.value = 'Gagal memproses video: ' + (jobErr || 'Unknown error')
        } else if (status === 'not_found') {
          clearInterval(pollInterval.value)
          isProcessing.value = false
          error.value = 'Tugas download tidak ditemukan / kadaluarsa.'
        }
      } catch (e: any) {
        console.error('Polling error:', e)
      }
    }, 2000)

  } catch (err: any) {
    isProcessing.value = false
    error.value = err.data?.message || 'Gagal memulai unduhan.'
  }
}
</script>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.hide-scroll {
  scrollbar-width: none;
  -ms-overflow-style: none;
}
.hide-scroll::-webkit-scrollbar {
  display: none;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>

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
            <img v-if="detectedIcon" :src="detectedIcon" class="w-full h-full object-cover rounded-md shadow-sm bg-white" />
            <span v-else class="material-symbols-outlined text-xl"
              :class="isDark ? 'text-gray-500' : 'text-slate-400'"
            >link</span>
          </div>
          <input
            v-model="url"
            type="url"
            placeholder="Paste URL here... (YouTube, TikTok, Instagram, Twitter)"
            class="w-full pl-14 pr-12 py-4 rounded-md text-sm font-medium transition-all outline-none"
            :class="isDark
              ? 'bg-white/5 text-white placeholder-gray-600 border border-white/10 focus:border-primary/40 focus:bg-white/8'
              : 'bg-slate-50 text-slate-900 placeholder-slate-400 border border-slate-200 focus:border-primary focus:bg-white'"
            @keydown.enter="fetchInfo"
            :disabled="isLoading"
          />
          <!-- Clear Button -->
          <button
            v-if="url"
            class="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-md flex items-center justify-center transition-all hover:bg-black/5 dark:hover:bg-white/5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            @click="resetAll"
          >
            <span class="material-symbols-outlined text-lg">close</span>
          </button>
        </div>
        <button
          class="px-8 py-4 bg-primary text-on-primary rounded-md font-headline font-bold text-sm hover:scale-[1.02] hover:shadow-lg hover:shadow-primary/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2 whitespace-nowrap"
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
    <div v-if="error" class="mt-8 p-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-2xl text-red-600 dark:text-red-400 text-sm flex items-start gap-3 animate-fade-in shadow-sm">
      <span class="material-symbols-outlined text-lg mt-0.5">error</span>
      <p class="font-medium flex-1">{{ error }}</p>
    </div>

    <!-- ============ STEP 2: Quality Picker (Default YT-DLP) ============ -->
    <div v-if="videoInfo && videoInfo.source !== 'twitter'" class="mt-8 animate-fade-in">
      <div class="glass-panel rounded-2xl p-6 md:p-8 border" :class="isDark ? 'border-white/5' : 'border-slate-100'">
        <!-- Video Preview -->
        <div class="flex flex-col md:flex-row gap-6 mb-8">
          <div class="w-full md:w-64 shrink-0 rounded-md overflow-hidden shadow-lg aspect-video bg-black/10">
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
            class="p-4 rounded-md text-left transition-all border-2 group"
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
          class="w-full py-4 bg-primary text-on-primary font-headline font-bold text-sm rounded-md hover:scale-[1.01] hover:shadow-lg hover:shadow-primary/20 transition-all active:scale-[0.99] flex items-center justify-center gap-2"
          :class="{ 'opacity-50 cursor-not-allowed': !selectedFormat || isProcessing }"
        >
          <span v-if="isProcessing" class="material-symbols-outlined text-lg animate-spin">progress_activity</span>
          <span v-else class="material-symbols-outlined text-lg">download</span>
          {{ isProcessing ? 'Memproses Video & Audio...' : (selectedFormat ? 'Download Selected Quality' : 'Select a quality first') }}
        </button>
      </div>
    </div>

    <!-- ============ STEP 2.5: Twitter/X Media List ============ -->
    <div v-if="videoInfo && videoInfo.source === 'twitter'" class="mt-8 animate-fade-in">
      <div class="glass-panel rounded-2xl p-6 md:p-8 border" :class="isDark ? 'border-white/5' : 'border-slate-100'">
        <!-- Tweet Header -->
        <div class="flex items-start gap-4 mb-6">
          <div class="w-12 h-12 shrink-0 rounded-full overflow-hidden bg-black/10 border" :class="isDark ? 'border-white/10' : 'border-slate-200'">
            <img v-if="videoInfo.thumb" :src="videoInfo.thumb" class="w-full h-full object-cover" />
            <span v-else class="material-symbols-outlined text-2xl w-full h-full flex items-center justify-center text-gray-400">person</span>
          </div>
          <div class="flex-1 min-w-0">
             <span class="text-sm font-semibold text-primary block mb-1">
               {{ videoInfo.uploader }}
             </span>
             <h3 class="font-medium text-sm md:text-base line-clamp-3" :class="isDark ? 'text-gray-300' : 'text-slate-700'">
               {{ videoInfo.title }}
             </h3>
          </div>
        </div>

        <h4 class="font-headline font-bold text-sm uppercase tracking-widest mb-4" :class="isDark ? 'text-gray-400' : 'text-slate-500'">
          <span class="material-symbols-outlined text-sm align-middle mr-1">perm_media</span>
          Available Media
        </h4>

        <div class="space-y-4">
          <div v-for="(item, idx) in videoInfo.mediaItems" :key="idx" class="flex flex-col sm:flex-row gap-4 p-4 rounded-xl border transition-all hover:shadow-md" :class="isDark ? 'border-white/5 bg-white/5 hover:border-white/10' : 'border-slate-100 bg-slate-50/50 hover:bg-slate-50'">
            <div class="w-full sm:w-48 shrink-0 rounded-lg overflow-hidden shadow-sm aspect-video bg-black/10 relative">
               <img v-if="item.thumbnail || item.url" :src="item.thumbnail || item.url" class="w-full h-full object-cover" />
               <div v-if="item.type === 'video' || item.type === 'gif'" class="absolute inset-0 flex items-center justify-center bg-black/20">
                 <span class="material-symbols-outlined text-3xl text-white drop-shadow-md shadow-black">play_circle</span>
               </div>
            </div>
            
            <div class="flex-1 min-w-0 flex flex-col justify-center">
              <div class="mb-3 flex flex-wrap gap-2 items-center">
                <span class="inline-flex items-center gap-1 px-2 py-1 rounded-2xl text-xs font-semibold uppercase tracking-wider" :class="item.type === 'photo' ? 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300' : 'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300'">
                  <span class="material-symbols-outlined text-[12px]">{{ item.type === 'photo' ? 'image' : 'movie' }}</span>
                  {{ item.type }}
                </span>
                <span v-if="item.duration" class="text-xs font-medium" :class="isDark ? 'text-gray-400' : 'text-slate-500'">
                  <span class="material-symbols-outlined text-[12px] align-text-bottom">schedule</span> {{ formatDuration(item.duration) }}
                </span>
              </div>

              <!-- Content for Video -->
              <div v-if="item.type === 'video' || item.type === 'gif'" class="space-y-2 mt-auto">
                 <div v-for="q in item.qualities" :key="q.url" class="flex items-center justify-between p-2 rounded-md border" :class="isDark ? 'border-white/5 bg-black/20' : 'border-slate-200 bg-white'">
                   <span class="font-bold text-sm" :class="isDark ? 'text-gray-200' : 'text-slate-700'">{{ q.height ? q.height + 'p' : 'Original' }}</span>
                   <button @click="downloadTwitterMedia(q.url, 'video', videoInfo.uploader, q.height ? q.height + 'p' : 'Orig')" class="px-3 py-1.5 bg-primary/10 text-primary hover:bg-primary hover:text-white font-semibold text-xs rounded transition-colors flex items-center gap-1">
                     <span class="material-symbols-outlined text-[14px]">download</span> Download
                   </button>
                 </div>
              </div>

              <!-- Content for Photo -->
              <button v-if="item.type === 'photo'" @click="downloadTwitterMedia(item.url, item.type, videoInfo.uploader, 'Photo')" class="w-full mt-auto py-2.5 bg-primary text-on-primary font-headline font-bold text-sm rounded hover:scale-[1.01] hover:shadow transition-all active:scale-[0.99] flex items-center justify-center gap-2">
                <span class="material-symbols-outlined text-base">download</span>
                Download Photo
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Download History -->
    <div v-if="history.length > 0" class="mt-10">
      <h3 class="font-headline font-bold text-lg mb-4" :class="isDark ? 'text-white' : 'text-slate-900'">Recent Downloads</h3>
      <div class="space-y-3">
        <div
          v-for="(item, idx) in history"
          :key="idx"
          class="glass-panel rounded-2xl p-4 flex items-center gap-4"
          :class="isDark ? 'border border-white/5' : 'border border-slate-100'"
        >
          <div class="w-10 h-10 flex items-center justify-center shrink-0 shadow-sm rounded-md overflow-hidden bg-white">
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
const STORAGE_KEY = 'figo_recent_downloads'

onMounted(() => {
  if (process.client) {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      try {
        history.value = JSON.parse(saved)
      } catch (e) {
        console.error('Failed to parse history from local storage', e)
      }
    }
  }
})

// Platform configuration for dynamic icon detection
const PLATFORMS_CONFIG = {
  YOUTUBE: { name: 'YouTube', icon: 'https://static.vecteezy.com/system/resources/thumbnails/018/930/572/small_2x/youtube-logo-youtube-icon-transparent-free-png.png' },
  TIKTOK: { name: 'TikTok', icon: 'https://img.freepik.com/premium-vector/tik-tok-logo_578229-290.jpg?semt=ais_hybrid&w=740&q=80' },
  INSTAGRAM: { name: 'Instagram', icon: 'https://unblast.com/wp-content/uploads/2025/07/instagram-logo-colored.jpg' },
  TWITTER: { name: 'Twitter/X', icon: 'https://cdn.worldvectorlogo.com/logos/twitter-logo-2.svg' },
}

const detectedIcon = computed(() => {
  if (!url.value.trim()) return null
  return detectPlatform(url.value).icon
})

function detectPlatform(link: string): { name: string; icon: string } {
  const lowUrl = link.toLowerCase()
  if (lowUrl.includes('youtube') || lowUrl.includes('youtu.be')) return PLATFORMS_CONFIG.YOUTUBE
  if (lowUrl.includes('tiktok')) return PLATFORMS_CONFIG.TIKTOK
  if (lowUrl.includes('instagram')) return PLATFORMS_CONFIG.INSTAGRAM
  if (lowUrl.includes('twitter') || lowUrl.includes('x.com')) return PLATFORMS_CONFIG.TWITTER
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

    if (response.source === 'twitter') {
      videoInfo.value = response
      console.log(`[Figo] Fetch Info Success in ${response.fetchDuration}ms (Twitter)`)
      return
    }

    if (response.qualities && response.qualities.length > 0) {
      // Filter: Only 360p+ and Audio
      response.qualities = response.qualities.filter((q: any) => {
        if (q.resolution === 'Audio') return true
        const res = parseInt(q.resolution)
        return !isNaN(res) && res >= 360
      })

      videoInfo.value = response

      // Default to "Audio" if available, else first quality
      const audioFormat = response.qualities.find((q: any) => q.resolution === 'Audio')
      if (audioFormat) {
        selectedFormat.value = audioFormat.formatId
      } else if (response.qualities.length > 0) {
        selectedFormat.value = response.qualities[0].formatId
      }

      console.log(`[Figo] Fetch Info Success in ${response.fetchDuration}ms`)
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
          
          // Persist top 5 to local storage
          if (history.value.length > 5) {
            history.value = history.value.slice(0, 5)
          }
          if (process.client) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(history.value))
          }

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

// Download direct URL via proxy untuk media Twitter
function downloadTwitterMedia(mediaUrl: string, type: string, username?: string, resolution?: string) {
  // Membersihkan karakter "@" atau spasi berlebih
  const safeUsername = (username || 'User').replace(/[^a-zA-Z0-9_\-]/g, '').trim()
  const safeRes = resolution || (type === 'photo' ? 'Orig' : 'Video')
  const filename = `figo-${Date.now()}-${safeUsername}-${safeRes}`
  window.location.href = `/api/download-twitter?url=${encodeURIComponent(mediaUrl)}&type=${type}&filename=${encodeURIComponent(filename)}`
  
  // Add to history
  const targetUrl = url.value
  const { name, icon } = detectPlatform(targetUrl)
  history.value.unshift({
    url: targetUrl, platform: name || 'Twitter/X', icon: icon || PLATFORMS_CONFIG.TWITTER.icon, time: new Date().toLocaleTimeString(),
  })
  
  if (history.value.length > 5) {
    history.value = history.value.slice(0, 5)
  }
  if (process.client) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history.value))
  }
  increment()
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

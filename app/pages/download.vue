<template>
  <div class="pt-24 pb-8 px-6 md:px-8 max-w-4xl mx-auto min-h-screen">
    <!-- Header -->
    <div class="text-center mb-12">
      <div class="inline-block px-4 py-1.5 rounded-2xl text-xs font-bold tracking-widest uppercase mb-6"
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
          <!-- Clear/Paste Button -->
          <button
            class="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-md flex items-center justify-center transition-all hover:bg-black/5 dark:hover:bg-white/5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            @click="url ? resetAll() : pasteFromClipboard()"
          >
            <span class="material-symbols-outlined text-lg">{{ url ? 'close' : 'content_paste' }}</span>
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
    <div v-if="videoInfo && !['twitter', 'instagram', 'tiktok'].includes(videoInfo.source)" class="mt-8 animate-fade-in">
      <div class="glass-panel rounded-2xl p-6 md:p-8 border" :class="isDark ? 'border-white/5' : 'border-slate-100'">
        <!-- Video Preview -->
        <div class="flex flex-col md:flex-row gap-6 mb-8">
          <div class="w-full md:w-64 shrink-0 rounded-md overflow-hidden shadow-lg aspect-video bg-black/10">
            <img v-if="videoInfo.thumb" :src="getProxiedMediaUrl(videoInfo.thumb)" class="w-full h-full object-cover" alt="Thumbnail" />
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
              <div class="w-5 h-5 rounded-2xl border-2 flex items-center justify-center shrink-0 transition-all"
                :class="selectedFormat === q.formatId
                  ? 'border-primary bg-primary'
                  : isDark ? 'border-gray-600' : 'border-slate-300'"
              >
                <div v-if="selectedFormat === q.formatId" class="w-2 h-2 rounded-2xl bg-white"></div>
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

    <!-- ============ STEP 2.5: Twitter/X/Instagram/TikTok Media List ============ -->
    <div v-if="videoInfo && ['twitter', 'instagram', 'tiktok'].includes(videoInfo.source)" class="mt-8 animate-fade-in">
      <div class="glass-panel rounded-2xl p-6 md:p-8 border" :class="isDark ? 'border-white/5' : 'border-slate-100'">
        <!-- Post Header -->
        <div class="flex items-start gap-4 mb-6">
          <div class="w-12 h-12 shrink-0 rounded-2xl overflow-hidden bg-black/10 border" :class="isDark ? 'border-white/10' : 'border-slate-200'">
            <img 
              v-if="videoInfo.avatar" 
              :src="getProxiedMediaUrl(videoInfo.avatar)" 
              class="w-full h-full object-cover" 
              @error="(e) => (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(videoInfo.uploader.replace('@', ''))}&background=E1306C&color=fff&size=128`"
            />
            <img v-else-if="videoInfo.uploader" :src="`https://ui-avatars.com/api/?name=${encodeURIComponent(videoInfo.uploader.replace('@', ''))}&background=random&color=fff&size=128&font-size=0.4`" class="w-full h-full object-cover" />
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
          <div v-for="(item, idx) in videoInfo.mediaItems" :key="idx" class="flex flex-col sm:flex-row gap-4 p-4 rounded-2xl border transition-all hover:shadow-md" :class="isDark ? 'border-white/5 bg-white/5 hover:border-white/10' : 'border-slate-100 bg-slate-50/50 hover:bg-slate-50'">
            <div class="w-full sm:w-48 shrink-0 rounded-2xl overflow-hidden shadow-sm aspect-video bg-black/10 relative">
               <img v-if="item.thumbnail || item.url" :src="getProxiedMediaUrl(item.thumbnail || item.url)" class="w-full h-full object-cover" />
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
                   <button @click="downloadTwitterMedia(q.url, 'video', videoInfo.uploader, q.height ? q.height + 'p' : 'Orig')" class="px-3 py-1.5 bg-primary/10 text-primary hover:bg-primary hover:text-white font-semibold text-xs rounded-2xl transition-colors flex items-center gap-1">
                     <span class="material-symbols-outlined text-[14px]">download</span> Download
                   </button>
                 </div>
              </div>

              <!-- Content for Photo -->
              <button v-if="item.type === 'photo'" @click="downloadTwitterMedia(item.url, item.type, videoInfo.uploader, 'Photo')" class="w-full mt-auto py-2.5 bg-primary text-on-primary font-headline font-bold text-sm rounded-2xl hover:scale-[1.01] hover:shadow transition-all active:scale-[0.99] flex items-center justify-center gap-2">
                <span class="material-symbols-outlined text-base">download</span>
                Download Photo
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Download History (Carousel) -->
    <div v-if="history.length > 0" class="mt-12">
      <div class="flex items-center justify-between mb-6">
        <h3 class="font-headline font-bold text-xl" :class="isDark ? 'text-white' : 'text-slate-900'">Recent Downloads</h3>
        <div class="flex gap-2">
          <button @click="(($refs.historyScroll as any).scrollBy({ left: -300, behavior: 'smooth' }))" class="w-8 h-8 rounded-full border flex items-center justify-center transition-all hover:bg-black/5 dark:hover:bg-white/5" :class="isDark ? 'border-white/10 text-white' : 'border-slate-200 text-slate-600'">
            <span class="material-symbols-outlined text-sm">arrow_back</span>
          </button>
          <button @click="(($refs.historyScroll as any).scrollBy({ left: 300, behavior: 'smooth' }))" class="w-8 h-8 rounded-full border flex items-center justify-center transition-all hover:bg-black/5 dark:hover:bg-white/5" :class="isDark ? 'border-white/10 text-white' : 'border-slate-200 text-slate-600'">
            <span class="material-symbols-outlined text-sm">arrow_forward</span>
          </button>
        </div>
      </div>

      <div 
        ref="historyScroll"
        class="flex gap-5 overflow-x-auto pb-5 px-1 snap-x snap-mandatory hide-scroll scroll-smooth"
      >
        <div
          v-for="(item, idx) in history"
          :key="idx"
          class="flex-none w-[280px] snap-start"
        >
          <div 
            class="group relative aspect-[16/10] rounded-2xl overflow-hidden glass-panel border shadow-sm transition-all hover:shadow-xl hover:scale-[1.02] bg-black/20"
            :class="isDark ? 'border-white/5' : 'border-slate-100'"
          >
            <!-- Thumbnail Background -->
            <img 
              v-if="item.thumbnail" 
              :src="getProxiedMediaUrl(item.thumbnail)" 
              class="absolute inset-0 w-full h-full object-cover opacity-50 group-hover:opacity-70 transition-opacity"
            />
            <div v-else class="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900">
               <span class="material-symbols-outlined text-4xl text-white/20">movie</span>
            </div>

            <!-- Content Overlay -->
            <div class="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black via-black/80 to-transparent">
              <div class="flex items-center gap-2 mb-1.5">
                <div class="w-5 h-5 rounded-full overflow-hidden bg-white/10 backdrop-blur-sm shadow-sm flex items-center justify-center shrink-0 border border-white/10">
                  <img v-if="item.platformIcon" :src="item.platformIcon" class="w-3.5 h-3.5 object-contain" />
                  <span v-else class="material-symbols-outlined text-[10px] text-slate-400">link</span>
                </div>
                <span class="text-[10px] font-bold text-white/70 uppercase tracking-widest truncate">
                  {{ item.platform }} <span v-if="item.uploader" class="text-white/40 font-medium normal-case"> • {{ item.uploader }}</span>
                </span>
              </div>
              <h4 class="text-white font-bold text-sm line-clamp-1 mb-1">{{ item.caption || item.title || 'Untitled' }}</h4>
              <div class="flex items-center justify-between">
                <p class="text-white/50 text-[10px]">{{ item.time }}</p>
                <!-- Stats Indicators -->
                <div v-if="item.metadata?.statistics?.likes || item.metadata?.statistics?.comments" class="flex gap-2">
                  <div v-if="item.metadata.statistics.likes" class="flex items-center gap-0.5 text-white/40 text-[9px]">
                    <span class="material-symbols-outlined" style="font-size: 9px; line-height: 1;">favorite</span>
                    <span>{{ item.metadata.statistics.likes }}</span>
                  </div>
                  <div v-if="item.metadata.statistics.comments" class="flex items-center gap-0.5 text-white/40 text-[9px]">
                    <span class="material-symbols-outlined" style="font-size: 9px; line-height: 1;">chat_bubble</span>
                    <span>{{ item.metadata.statistics.comments }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Download Action Button -->
            <button 
              @click="reDownloadFromHistory(item)"
              class="absolute top-3 right-3 w-10 h-10 rounded-full bg-primary text-on-primary flex items-center justify-center shadow-lg transform translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 active:scale-95"
              title="Download Again"
            >
              <span class="material-symbols-outlined text-xl">download</span>
            </button>
          </div>
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
const history = ref<any[]>([])
const STORAGE_KEY = 'figo_recent_downloads_v2' // Update version to avoid parsing errors with old schema

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
  YOUTUBE: { name: 'YouTube', icon: 'https://api.iconify.design/logos:youtube-icon.svg' },
  TIKTOK: { name: 'TikTok', icon: 'https://api.iconify.design/logos:tiktok-icon.svg' },
  INSTAGRAM: { name: 'Instagram', icon: 'https://api.iconify.design/skill-icons:instagram.svg' },
  TWITTER: { name: 'Twitter/X', icon: 'https://api.iconify.design/ri:twitter-x-fill.svg?color=%23ffffff' },
}

const detectedIcon = computed(() => {
  if (!url.value.trim()) return null
  return detectPlatform(url.value).icon
})

function detectPlatform(link: string): { name: string; icon: string } {
  const lowUrl = link.toLowerCase()
  if (lowUrl.includes('youtube') || lowUrl.includes('youtu.be')) return PLATFORMS_CONFIG.YOUTUBE
  if (lowUrl.includes('tiktok')) return PLATFORMS_CONFIG.TIKTOK
  if (lowUrl.includes('instagram') || lowUrl.includes('ig.me')) return PLATFORMS_CONFIG.INSTAGRAM
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

async function pasteFromClipboard() {
  if (process.client && typeof navigator !== 'undefined' && navigator.clipboard) {
    try {
      const text = await navigator.clipboard.readText()
      if (text) {
        url.value = text
        fetchInfo()
      }
    } catch (err) {
      console.error('Gagal membaca clipboard:', err)
    }
  }
}

// History Helper
function addToHistory(payload: any) {
  const { name, icon } = detectPlatform(payload.url)
  const newItem = {
    url: payload.url,
    title: payload.title || 'Untitled',
    uploader: payload.uploader || '',
    caption: payload.caption || payload.title || '',
    thumbnail: payload.thumbnail || '',
    platform: name,
    platformIcon: icon,
    time: new Date().toLocaleString('id-ID', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short' }),
    source: payload.source || 'web',
    metadata: {
      ...(payload.metadata || {}),
      statistics: payload.statistics || payload.metadata?.statistics || {}
    }
  }

  // Remove duplicate by URL
  history.value = history.value.filter(h => h.url !== newItem.url)
  history.value.unshift(newItem)

  if (history.value.length > 20) {
    history.value = history.value.slice(0, 20)
  }

  if (process.client) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history.value))
  }
}

async function reDownloadFromHistory(item: any) {
  if (isProcessing.value) return
  
  error.value = ''
  
  if (['twitter', 'instagram', 'tiktok'].includes(item.source)) {
    downloadTwitterMedia(
      item.metadata.mediaUrl, 
      item.metadata.type, 
      item.metadata.uploader, 
      item.metadata.resolution
    )
    return
  }

  if (item.metadata.formatId) {
    await startDownloadJob({
      url: item.url,
      mode: 'download',
      formatId: item.metadata.formatId,
      title: item.title,
      uploader: item.metadata.uploader || 'Unknown',
      resolution: item.metadata.resolutionLabel || 'Media'
    })
  }
}

// Polling Helper
async function startDownloadJob(body: any) {
  isProcessing.value = true
  error.value = ''

  try {
    const response = await $fetch('/api/download', {
      method: 'POST',
      body
    }) as any

    const jobId = response.jobId

    if (pollInterval.value) clearInterval(pollInterval.value)
    
    pollInterval.value = setInterval(async () => {
      try {
        const { status, error: jobErr } = await $fetch(`/api/job-status?id=${jobId}`) as any
        
        if (status === 'done') {
          clearInterval(pollInterval.value)
          isProcessing.value = false
          window.location.href = `/api/download-file?id=${jobId}`
          increment()
        } else if (status === 'error') {
          clearInterval(pollInterval.value)
          isProcessing.value = false
          error.value = 'Gagal memproses video: ' + (jobErr || 'Unknown error')
        } else if (status === 'not_found') {
          clearInterval(pollInterval.value)
          isProcessing.value = false
          error.value = 'Tugas download tidak ditemukan.'
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

// Helpers
function getProxiedMediaUrl(mediaUrl: string, type: 'photo' | 'video' = 'photo') {
  if (!mediaUrl) return ''
  // Deteksi domain yg diblokir CORS Hotlink (IG, Twitter CDN, FB)
  const isCORS = mediaUrl.includes('instagram') || mediaUrl.includes('cdninstagram') || mediaUrl.includes('twimg') || mediaUrl.includes('fbcdn') || mediaUrl.includes('ig_')
  if (isCORS) {
    return `/api/download-twitter?url=${encodeURIComponent(mediaUrl)}&type=${type}&inline=true`
  }
  return mediaUrl
}
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

    if (['twitter', 'instagram', 'tiktok'].includes(response.source)) {
      videoInfo.value = response
      console.log(`[Figo] Fetch Info Success in ${response.fetchDuration}ms (${response.source})`)
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

  const targetUrl = url.value || videoInfo.value?._originalUrl || ''
  const selectedObj = videoInfo.value?.qualities?.find((q: any) => q.formatId === selectedFormat.value)
  
  const payload = { 
    url: targetUrl, 
    mode: 'download', 
    formatId: selectedFormat.value,
    title: videoInfo.value?.title || 'Video',
    uploader: videoInfo.value?.uploader || 'Unknown',
    resolutionLabel: selectedObj ? selectedObj.label || 'Media' : 'Media'
  }

  await startDownloadJob(payload)

  // Add to history
  addToHistory({
    url: targetUrl,
    title: videoInfo.value?.title,
    caption: videoInfo.value?.title,
    uploader: videoInfo.value?.uploader,
    thumbnail: videoInfo.value?.thumb,
    statistics: videoInfo.value?.statistics,
    source: videoInfo.value?.source || 'web',
    metadata: {
      formatId: selectedFormat.value,
      uploader: videoInfo.value?.uploader,
      resolutionLabel: payload.resolutionLabel,
      statistics: videoInfo.value?.statistics
    }
  })
}

// Download direct URL via proxy untuk media Twitter
function downloadTwitterMedia(mediaUrl: string, type: string, username?: string, resolution?: string) {
  // Membersihkan karakter "@" atau spasi berlebih
  const safeUsername = (username || 'User').replace(/[^a-zA-Z0-9_\-]/g, '').trim()
  const safeRes = resolution || (type === 'photo' ? 'Original' : 'Video')
  const filename = `figo-${Date.now()}-${safeUsername} - ${safeRes}`
  window.location.href = `/api/download-twitter?url=${encodeURIComponent(mediaUrl)}&type=${type}&filename=${encodeURIComponent(filename)}`
  
  // Add to history
  const targetUrl = url.value
  addToHistory({
    url: targetUrl,
    title: videoInfo.value?.title || `${type.toUpperCase()} from ${username}`,
    caption: videoInfo.value?.title,
    uploader: username,
    statistics: videoInfo.value?.statistics,
    thumbnail: videoInfo.value?.mediaItems?.[0]?.thumbnail || videoInfo.value?.mediaItems?.[0]?.url,
    source: videoInfo.value?.source || 'twitter',
    metadata: {
      mediaUrl,
      type,
      uploader: username,
      resolution: safeRes,
      statistics: videoInfo.value?.statistics
    }
  })

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

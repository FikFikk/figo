<template>
  <div class="glass-panel rounded-3xl p-6 md:p-8" :class="isDark ? 'border border-white/5 bg-neutral-900/40' : 'border border-slate-100 bg-white'">
    <div class="mb-8">
      <h2 class="text-2xl font-headline font-black tracking-tight" :class="isDark ? 'text-white' : 'text-slate-900'">
        HLS Stream Player
      </h2>
      <p class="text-xs opacity-50 mt-1">Ekstrak dan tonton HLS streaming langsung dari TMDB ID film atau episode TV.</p>
    </div>

    <!-- Extraction Control Form -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <div class="md:col-span-2">
        <label class="block text-xs font-bold uppercase tracking-wider mb-2 opacity-60">TMDB Movie/TV ID</label>
        <div class="relative">
          <span class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 material-symbols-outlined text-lg">movie</span>
          <input
            v-model="tmdbId"
            type="number"
            placeholder="Contoh: 1049082 (Jumbo), 550"
            class="w-full pl-11 pr-4 py-3 rounded-2xl text-sm font-headline font-bold transition-all"
            :class="isDark 
              ? 'bg-white/5 border border-white/10 text-white focus:border-primary/50 focus:bg-white/10' 
              : 'bg-slate-50 border border-slate-200 text-slate-900 focus:border-primary/50 focus:bg-white'"
            @keyup.enter="startStreamSearch"
          />
        </div>
      </div>

      <div>
        <label class="block text-xs font-bold uppercase tracking-wider mb-2 opacity-60">Tipe Konten</label>
        <select
          v-model="mediaType"
          class="w-full px-4 py-3 rounded-2xl text-sm font-headline font-bold transition-all appearance-none cursor-pointer"
          :class="isDark 
            ? 'bg-white/5 border border-white/10 text-white focus:border-primary/50' 
            : 'bg-slate-50 border border-slate-200 text-slate-900 focus:border-primary/50'"
        >
          <option value="movie">Movie</option>
          <option value="tv">TV Episode</option>
        </select>
      </div>

      <div class="flex items-end">
        <button
          @click="startStreamSearch"
          :disabled="loading || !tmdbId"
          class="w-full flex items-center justify-center gap-2 py-3 px-6 rounded-2xl font-headline font-black text-sm text-on-primary bg-primary hover:bg-opacity-90 active:scale-95 transition-all shadow-lg shadow-primary/20 disabled:opacity-50 disabled:pointer-events-none"
        >
          <span v-if="loading" class="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></span>
          <span v-else class="material-symbols-outlined text-base">play_circle</span>
          {{ loading ? 'Mencari...' : 'Putar Stream' }}
        </button>
      </div>
    </div>

    <!-- TV Episode Season & Episode Selector -->
    <Transition
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="transform -translate-y-2 opacity-0"
      enter-to-class="transform translate-y-0 opacity-100"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="transform translate-y-0 opacity-100"
      leave-to-class="transform -translate-y-2 opacity-0"
    >
      <div v-if="mediaType === 'tv'" class="grid grid-cols-2 gap-4 mb-6 p-4 rounded-2xl" :class="isDark ? 'bg-white/5' : 'bg-slate-50'">
        <div>
          <label class="block text-xs font-bold uppercase tracking-wider mb-2 opacity-60">Season</label>
          <input
            v-model="season"
            type="number"
            min="1"
            class="w-full px-4 py-2.5 rounded-xl text-sm font-bold"
            :class="isDark ? 'bg-white/5 text-white border border-white/10' : 'bg-white text-slate-900 border border-slate-200'"
          />
        </div>
        <div>
          <label class="block text-xs font-bold uppercase tracking-wider mb-2 opacity-60">Episode</label>
          <input
            v-model="episode"
            type="number"
            min="1"
            class="w-full px-4 py-2.5 rounded-xl text-sm font-bold"
            :class="isDark ? 'bg-white/5 text-white border border-white/10' : 'bg-white text-slate-900 border border-slate-200'"
          />
        </div>
      </div>
    </Transition>

    <!-- Loading, Error & Playing Indicator states -->
    <div v-if="error" class="mb-6 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm font-bold flex items-start gap-3">
      <span class="material-symbols-outlined text-lg flex-shrink-0 mt-0.5">error</span>
      <div>
        <p>{{ error }}</p>
        <p class="text-xs opacity-60 mt-1 font-normal" v-if="debugInfo">Detail: {{ debugInfo }}</p>
      </div>
    </div>

    <!-- Active Video Player Section -->
    <div v-if="activeHlsUrl" class="space-y-4 mb-6">
      <div class="relative w-full aspect-video rounded-2xl overflow-hidden shadow-2xl bg-black border border-white/5">
        <video
          ref="videoElement"
          controls
          autoplay
          playsinline
          class="w-full h-full object-contain"
        ></video>
      </div>

      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl border"
        :class="isDark ? 'bg-white/5 border-white/5 text-white' : 'bg-slate-50 border-slate-100 text-slate-900'">
        <div class="space-y-1">
          <p class="text-xs font-bold uppercase tracking-wider opacity-60">Active Provider Source</p>
          <p class="text-sm font-headline font-black">{{ activeProvider }}</p>
          <p class="text-[10px] opacity-40 font-mono break-all">{{ activeHlsUrl }}</p>
        </div>
        <button
          @click="copyStreamLink"
          class="flex-shrink-0 flex items-center justify-center gap-2 py-2 px-4 rounded-xl text-xs font-headline font-black border"
          :class="isDark 
            ? 'border-white/10 hover:bg-white/5 text-white' 
            : 'border-slate-200 hover:bg-slate-100 text-slate-700'"
        >
          <span class="material-symbols-outlined text-sm">content_copy</span>
          Copy HLS Link
        </button>
      </div>
    </div>

    <!-- Empty/Intro Stage -->
    <div v-else-if="!loading" class="flex flex-col items-center justify-center py-12 px-6 text-center border-2 border-dashed rounded-3xl"
      :class="isDark ? 'border-white/10 text-gray-500' : 'border-slate-200 text-slate-400'">
      <span class="material-symbols-outlined text-5xl opacity-40 mb-4">tv</span>
      <h3 class="text-sm font-headline font-black mb-1" :class="isDark ? 'text-white' : 'text-slate-800'">Menunggu Input Stream</h3>
      <p class="text-xs max-w-sm opacity-60">Masukkan TMDB ID di atas dan klik "Putar Stream" untuk mencari dan memulai streaming HLS video secara langsung.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onBeforeUnmount } from 'vue'

const { isDark } = useColorMode()

const tmdbId = ref<number | null>(null)
const mediaType = ref<'movie' | 'tv'>('movie')
const season = ref<number>(1)
const episode = ref<number>(1)

const loading = ref(false)
const error = ref<string | null>(null)
const debugInfo = ref<string | null>(null)

const activeHlsUrl = ref<string | null>(null)
const activeProvider = ref<string>('none')
const videoElement = ref<HTMLVideoElement | null>(null)

let hlsInstance: any = null

// Load HLS script dynamically from CDN on runtime to prevent bundle bloating
const loadHlsScript = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    if ((window as any).Hls) {
      resolve()
      return
    }
    const script = document.createElement('script')
    script.src = 'https://cdn.jsdelivr.net/npm/hls.js@1.5.0/dist/hls.min.js'
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('Gagal memuat HLS.js player dari global CDN.'))
    document.head.appendChild(script)
  })
}

// Clean up HLS on unmount
const destroyHls = () => {
  if (hlsInstance) {
    hlsInstance.destroy()
    hlsInstance = null
  }
}

onBeforeUnmount(() => {
  destroyHls()
})

const startStreamSearch = async () => {
  if (!tmdbId.value) return
  
  loading.value = true
  error.value = null
  debugInfo.value = null
  activeHlsUrl.value = null
  destroyHls()

  try {
    const response = await $fetch<any>('/api/stream', {
      query: {
        id: tmdbId.value,
        type: mediaType.value,
        season: mediaType.value === 'tv' ? season.value : undefined,
        episode: mediaType.value === 'tv' ? episode.value : undefined
      }
    })

    if (response && response.success && response.hls_urls && response.hls_urls.length > 0) {
      const selectedHlsUrl = response.hls_urls[0]
      activeHlsUrl.value = selectedHlsUrl
      activeProvider.value = response.provider || 'unknown'
      
      // Wait for DOM layout update
      await nextTick()
      
      // Wait dynamic load of script
      await loadHlsScript()
      
      if (videoElement.value) {
        const video = videoElement.value
        
        // Hls player initialization
        if ((window as any).Hls.isSupported()) {
          destroyHls()
          hlsInstance = new (window as any).Hls()
          hlsInstance.loadSource(selectedHlsUrl)
          hlsInstance.attachMedia(video)
          hlsInstance.on((window as any).Hls.Events.MANIFEST_PARSED, () => {
            video.play().catch(() => {
              // Handle autoplayer restrictions
            })
          })
          
          hlsInstance.on((window as any).Hls.Events.ERROR, (event: any, data: any) => {
            if (data.fatal) {
              switch (data.type) {
                case 'networkError':
                  hlsInstance.startLoad()
                  break
                case 'mediaError':
                  hlsInstance.recoverMediaError()
                  break
                default:
                  destroyHls()
                  break
              }
            }
          })
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
          // Native Safari player
          video.src = selectedHlsUrl
          video.addEventListener('loadedmetadata', () => {
            video.play().catch(() => {
              // Handle autoplayer restrictions
            })
          })
        } else {
          error.value = 'Browser Anda tidak mendukung player HLS / m3u8 streaming secara langsung.'
        }
      }
    } else {
      error.value = 'Tidak menemukan HLS streaming URL yang valid dari provider.'
      if (response && response.errors && response.errors.length > 0) {
        debugInfo.value = response.errors.join(' | ')
      }
    }
  } catch (err: any) {
    error.value = 'Gagal menghubungi server API streaming FiGo.'
    debugInfo.value = err.message || JSON.stringify(err)
  } finally {
    loading.value = false
  }
}

const copyStreamLink = () => {
  if (!activeHlsUrl.value) return
  navigator.clipboard.writeText(activeHlsUrl.value)
    .then(() => alert('Link HLS (.m3u8) telah disalin ke clipboard!'))
    .catch(() => alert('Gagal menyalin link.'))
}
</script>

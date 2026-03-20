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
            @keydown.enter="download"
          />
          <!-- Clear Button -->
          <button
            v-if="url"
            class="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:bg-black/5 dark:hover:bg-white/5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            @click="url = ''"
          >
            <span class="material-symbols-outlined text-lg">close</span>
          </button>
        </div>
        <button
          class="px-8 py-4 bg-primary text-on-primary rounded-xl font-headline font-bold text-sm hover:scale-[1.02] hover:shadow-lg hover:shadow-primary/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2 whitespace-nowrap"
          @click="download"
          :disabled="!url.trim()"
          :class="{ 'opacity-50 cursor-not-allowed': !url.trim() }"
        >
          <span class="material-symbols-outlined text-lg">download</span>
          Download
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

function download() {
  if (!url.value.trim()) return
  const { name, icon } = detectPlatform(url.value)
  const now = new Date()
  history.value.unshift({
    url: url.value,
    platform: name,
    icon,
    time: now.toLocaleTimeString(),
  })
  increment()
  alert(`Downloading from ${name}... (UI demo — backend not connected)`)
  url.value = ''
}
</script>

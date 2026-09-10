<template>
  <!-- Swiss Precision Top Navigation Header -->
  <nav class="fixed top-0 w-full z-50 backdrop-blur-md transition-colors duration-200 border-b font-mono"
    :class="isDark ? 'bg-[#090b10]/90 border-neutral-800 text-white' : 'bg-white/95 border-neutral-200 text-neutral-900 shadow-xs'"
  >
    <div class="flex justify-between items-center px-4 sm:px-6 md:px-8 py-3 max-w-7xl mx-auto">
      <!-- Swiss Brand Logo -->
      <div class="flex items-center gap-2.5">
        <NuxtLink to="/" class="flex items-center gap-2 group">
          <span class="px-2 py-0.5 text-xs font-black tracking-widest uppercase border transition-colors"
            :class="isDark ? 'bg-white text-neutral-950 border-white group-hover:bg-neutral-200' : 'bg-neutral-950 text-white border-neutral-950 group-hover:bg-neutral-800'"
          >
            FIGO
          </span>
          <span class="text-[10px] font-bold tracking-wider opacity-60 hidden sm:inline">
            // SYS.26
          </span>
        </NuxtLink>
      </div>

      <!-- Desktop Nav Links (Swiss Modular Grid) -->
      <div class="hidden md:flex items-center space-x-1">
        <NuxtLink
          v-for="link in navLinks"
          :key="link.to"
          :to="link.to"
          class="px-3 py-1.5 rounded-xs text-xs font-bold uppercase tracking-wider transition-all border"
          :class="isActive(link.to)
            ? (isDark ? 'bg-white text-neutral-950 border-white font-black' : 'bg-neutral-950 text-white border-neutral-950 font-black')
            : (isDark ? 'text-neutral-400 border-transparent hover:text-white hover:border-neutral-800 hover:bg-neutral-900/50' : 'text-neutral-600 border-transparent hover:text-neutral-950 hover:border-neutral-300 hover:bg-neutral-100')"
        >
          {{ link.label }}
        </NuxtLink>
      </div>

      <!-- Header Controls: Support + Theme Toggle + CTA -->
      <div class="flex items-center gap-2">
        <!-- Support Button -->
        <button
          class="px-3 py-1.5 rounded-xs text-xs font-bold uppercase tracking-wider transition-all border flex items-center gap-1.5 cursor-pointer"
          :class="isDark 
            ? 'bg-neutral-900 border-neutral-800 text-neutral-300 hover:text-white hover:border-neutral-700' 
            : 'bg-neutral-100 border-neutral-300 text-neutral-700 hover:text-neutral-950 hover:border-neutral-400'"
          @click="open()"
        >
          <span class="material-symbols-outlined text-[15px] text-red-500 animate-pulse">favorite</span>
          <span class="hidden sm:inline">SUPPORT</span>
        </button>

        <!-- Theme Toggle Button -->
        <button
          class="w-8 h-8 rounded-xs flex items-center justify-center transition-all border cursor-pointer"
          :class="isDark ? 'bg-neutral-900 border-neutral-800 text-yellow-400 hover:border-neutral-700' : 'bg-neutral-100 border-neutral-300 text-neutral-700 hover:border-neutral-400'"
          @click="toggle"
          :aria-label="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
        >
          <span class="material-symbols-outlined text-[16px]">{{ isDark ? 'light_mode' : 'dark_mode' }}</span>
        </button>

        <!-- Get Started / Tools CTA -->
        <NuxtLink
          to="/tools"
          class="px-3.5 py-1.5 rounded-xs text-xs font-black uppercase tracking-wider transition-all border hidden sm:flex items-center gap-1"
          :class="isDark
            ? 'bg-white text-neutral-950 border-white hover:bg-neutral-200'
            : 'bg-neutral-950 text-white border-neutral-950 hover:bg-neutral-800'"
        >
          <span>TOOLS</span>
          <span class="material-symbols-outlined text-[14px]">arrow_forward</span>
        </NuxtLink>
      </div>
    </div>
  </nav>

  <!-- Mobile Bottom Navigation (Swiss Modular Hairline Grid) -->
  <nav class="md:hidden fixed bottom-0 left-0 w-full z-[60] border-t backdrop-blur-md transition-colors duration-200 pb-safe font-mono"
    :class="isDark ? 'bg-[#090b10]/95 border-neutral-800' : 'bg-white/95 border-neutral-200 shadow-lg'"
  >
    <div class="grid grid-cols-5 divide-x" :class="isDark ? 'divide-neutral-800/80' : 'divide-neutral-200'">
      <NuxtLink
        v-for="link in navLinks"
        :key="link.to"
        :to="link.to"
        class="flex flex-col items-center justify-center py-2.5 px-1 transition-all"
        :class="isActive(link.to) 
          ? (isDark ? 'bg-neutral-900 text-white' : 'bg-neutral-100 text-neutral-950 font-black')
          : (isDark ? 'text-neutral-500 hover:text-neutral-300' : 'text-neutral-400 hover:text-neutral-900')"
      >
        <span class="material-symbols-outlined text-[18px] mb-0.5" 
          :class="isActive(link.to) ? 'text-emerald-500' : ''"
        >
          {{ link.icon }}
        </span>
        <span class="text-[9px] font-bold uppercase tracking-tight truncate max-w-full">{{ link.label }}</span>
      </NuxtLink>
    </div>
  </nav>

  <!-- Support Modal (Swiss Modular Ledger) -->
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="isOpen" 
        class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs font-mono"
        @click.self="close()"
      >
        <div 
          class="relative w-full max-w-sm p-5 rounded-xs shadow-2xl transition-all border"
          :class="isDark ? 'bg-[#090b10] border-neutral-700 text-white' : 'bg-white border-neutral-300 text-neutral-900'"
        >
          <!-- Close Button -->
          <button 
            @click="close()"
            class="absolute top-3.5 right-3.5 w-7 h-7 rounded-xs border flex items-center justify-center transition-all cursor-pointer"
            :class="isDark ? 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white hover:border-neutral-600' : 'bg-neutral-100 border-neutral-300 text-neutral-600 hover:text-neutral-950'"
          >
            <span class="material-symbols-outlined text-sm">close</span>
          </button>

          <!-- Modal Header -->
          <div class="mb-4">
            <div class="flex items-center gap-2 mb-1">
              <span class="px-1.5 py-0.5 text-[9px] font-bold uppercase bg-red-500/20 text-red-400 border border-red-500/40 rounded-xs">
                [ DONATION ]
              </span>
              <h3 class="font-headline text-sm font-black uppercase tracking-wider">SUPPORT FIGO</h3>
            </div>
            <p class="text-[11px] opacity-70 font-sans leading-tight">
              Bantu operasional server &amp; pengembangan tools presisi tinggi.
            </p>
          </div>

          <!-- Tabs (Swiss Bordered Selector) -->
          <div class="grid grid-cols-2 gap-1 p-1 border rounded-xs mb-3" :class="isDark ? 'bg-neutral-900/60 border-neutral-800' : 'bg-neutral-100 border-neutral-200'">
            <button 
              v-for="tab in supportTabs"
              :key="tab.id"
              @click="activeTab = tab.id"
              class="py-1.5 px-2 text-[10px] font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1 cursor-pointer rounded-xs"
              :class="activeTab === tab.id 
                ? (isDark ? 'bg-white text-neutral-950 font-black shadow-xs' : 'bg-neutral-950 text-white font-black shadow-xs') 
                : (isDark ? 'text-neutral-400 hover:text-white' : 'text-neutral-600 hover:text-neutral-950')"
            >
              <span class="material-symbols-outlined text-[13px]">{{ tab.icon }}</span>
              {{ tab.name }}
            </button>
          </div>
          
          <p class="text-[10px] min-h-[28px] opacity-80 font-sans mb-3 text-center leading-tight">
            {{ currentTab.description }}
          </p>

          <!-- QR Code Container (Swiss Hairline Frame) -->
          <div class="flex justify-center py-2 mb-3">
            <div 
              class="p-3 rounded-xs bg-white border flex flex-col items-center justify-center shadow-sm"
              :class="activeTab === 'trakteer' ? 'border-[#FF3850]' : 'border-neutral-300'"
            >
              <img 
                :src="qrUrl" 
                :alt="currentTab.name + ' QR Code'" 
                class="w-44 h-44"
                loading="lazy"
              />
              <span class="text-[8px] text-neutral-500 font-bold tracking-widest uppercase mt-1.5 font-mono">
                [ SCAN TO DONATE ]
              </span>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex flex-col gap-1.5">
            <a 
              :target="_blank"
              :href="donationUrl"
              rel="noopener noreferrer"
              class="w-full py-2 rounded-xs text-xs font-bold uppercase tracking-wider text-center flex items-center justify-center gap-1.5 text-white transition-all border cursor-pointer"
              :class="activeTab === 'trakteer' 
                ? 'bg-[#FF3850] hover:bg-[#e02e44] border-[#FF3850]' 
                : 'bg-[#FF5E5B] hover:bg-[#e64c49] border-[#FF5E5B]'"
            >
              <span class="material-symbols-outlined text-[14px]">open_in_new</span>
              BUKA {{ currentTab.name }}
            </a>
            
            <button 
              @click="copyDonationLink"
              class="w-full py-2 rounded-xs text-xs font-bold uppercase tracking-wider border transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              :class="isDark 
                ? 'border-neutral-800 hover:bg-neutral-900 text-neutral-300 hover:text-white' 
                : 'border-neutral-300 hover:bg-neutral-100 text-neutral-700'"
            >
              <span class="material-symbols-outlined text-[14px]">{{ isCopied ? 'done' : 'content_copy' }}</span>
              {{ isCopied ? 'TAUTAN DISALIN!' : `SALIN TAUTAN ${currentTab.name}` }}
            </button>
          </div>

          <!-- Creator Portfolio Footer -->
          <div class="mt-3 pt-3 border-t" :class="isDark ? 'border-neutral-800' : 'border-neutral-200'">
            <a 
              href="https://fikfikk.my.id/" 
              target="_blank" 
              rel="noopener noreferrer"
              class="flex items-center justify-between p-2 rounded-xs border transition-all"
              :class="isDark 
                ? 'bg-neutral-900/60 border-neutral-800 hover:border-neutral-700 text-white' 
                : 'bg-neutral-50 border-neutral-200 hover:border-neutral-300 text-neutral-900'"
            >
              <div class="flex items-center gap-2 text-left">
                <span class="material-symbols-outlined text-[16px] text-emerald-500">terminal</span>
                <div>
                  <p class="text-[8px] opacity-50 font-bold uppercase tracking-wider leading-none mb-0.5">CREATOR</p>
                  <p class="text-[11px] font-bold">fikfikk.my.id</p>
                </div>
              </div>
              <span class="material-symbols-outlined text-[14px] opacity-50">arrow_forward</span>
            </a>
          </div>

        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
const { isDark, toggle } = useColorMode()
const route = useRoute()

const navLinks = [
  { to: '/convert', label: 'Convert', icon: 'transform' },
  { to: '/compress', label: 'Compress', icon: 'layers' },
  { to: '/download', label: 'Download', icon: 'download' },
  { to: '/tools', label: 'Tools', icon: 'build' },
  { to: '/stocks', label: 'Stocks', icon: 'candlestick_chart' },
]

function isActive(path: string): boolean {
  if (path.startsWith('/tools')) return route.path.startsWith('/tools')
  return route.path === path
}

const { isOpen, close, open } = useSupportModal()
const isCopied = ref(false)

const supportTabs = [
  {
    id: 'trakteer',
    name: 'Trakteer',
    url: 'https://trakteer.id/8glcaxeiv6nrtxa4ykur/tip?open=true',
    description: 'Dukung melalui e-wallet Indonesia (GoPay, OVO, Dana, LinkAja, atau QRIS) via Trakteer.',
    icon: 'payments'
  },
  {
    id: 'kofi',
    name: 'Ko-fi',
    url: 'https://ko-fi.com/fikfikk',
    description: 'Support globally using Credit Card, PayPal, or Google Pay via Ko-fi.',
    icon: 'coffee'
  }
]

const activeTab = ref<'trakteer' | 'kofi'>('trakteer')

const currentTab = computed(() => supportTabs.find(t => t.id === activeTab.value) || supportTabs[0])
const donationUrl = computed(() => currentTab.value.url)

const qrUrl = computed(() => {
  const dark = encodeURIComponent('#090b10')
  const light = encodeURIComponent('#ffffff')
  return `/api/tools/qr?text=${encodeURIComponent(donationUrl.value)}&size=300&format=svg&dark=${dark}&light=${light}&margin=2`
})

async function copyDonationLink() {
  try {
    await navigator.clipboard.writeText(donationUrl.value)
    isCopied.value = true
    setTimeout(() => {
      isCopied.value = false
    }, 2000)
  } catch (err) {
    console.warn('Gagal menyalin tautan:', err)
  }
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s cubic-bezier(0.16, 1, 0.3, 1), transform 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: scale(0.97);
}
</style>

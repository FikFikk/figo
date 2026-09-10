<template>
  <!-- Linear / Vercel Dark Minimalist Navigation Header -->
  <nav class="fixed top-0 w-full z-50 backdrop-blur-xl transition-colors duration-200 border-b"
    :class="isDark ? 'bg-[#08090d]/85 border-white/[0.08] text-slate-100' : 'bg-white/85 border-slate-200/80 text-slate-900 shadow-xs'"
  >
    <div class="flex justify-between items-center px-4 sm:px-6 md:px-8 py-3 max-w-7xl mx-auto">
      <!-- Brand Logo -->
      <div class="flex items-center gap-3">
        <NuxtLink to="/" class="flex items-center gap-2.5 group">
          <div class="w-8 h-8 rounded-xl flex items-center justify-center font-black text-sm transition-all shadow-md"
            :class="isDark ? 'bg-gradient-to-br from-primary to-blue-600 text-white shadow-primary/25 group-hover:shadow-primary/40' : 'bg-slate-900 text-white group-hover:bg-slate-800 shadow-slate-900/20'"
          >
            F
          </div>
          <span class="font-headline font-black text-base tracking-tight" :class="isDark ? 'text-white' : 'text-slate-900'">
            Fi<span class="text-primary">Go</span>
          </span>
          <span class="px-2 py-0.5 rounded-lg text-[9px] font-mono font-semibold tracking-wide border hidden sm:inline"
            :class="isDark ? 'bg-white/[0.04] border-white/[0.08] text-slate-400' : 'bg-slate-100 border-slate-200 text-slate-600'"
          >
            v2.6
          </span>
        </NuxtLink>
      </div>

      <!-- Desktop Nav Links (Linear Minimalist Pills) -->
      <div class="hidden md:flex items-center p-1 rounded-2xl border backdrop-blur-md"
        :class="isDark ? 'bg-white/[0.03] border-white/[0.06]' : 'bg-slate-100/80 border-slate-200/60'"
      >
        <NuxtLink
          v-for="link in navLinks"
          :key="link.to"
          :to="link.to"
          class="px-4 py-1.5 rounded-xl text-xs font-medium tracking-tight transition-all relative flex items-center gap-1.5"
          :class="isActive(link.to)
            ? (isDark ? 'bg-white/[0.1] text-white font-semibold shadow-xs' : 'bg-white text-slate-900 font-semibold shadow-xs')
            : (isDark ? 'text-slate-400 hover:text-white hover:bg-white/[0.04]' : 'text-slate-600 hover:text-slate-900 hover:bg-white/60')"
        >
          <span class="material-symbols-outlined text-[15px] opacity-70">{{ link.icon }}</span>
          <span>{{ link.label }}</span>
        </NuxtLink>
      </div>

      <!-- Header Controls: Support + Theme Toggle + Launch CTA -->
      <div class="flex items-center gap-2">
        <!-- Support Button -->
        <button
          class="px-3.5 py-1.5 rounded-xl text-xs font-semibold tracking-tight transition-all border flex items-center gap-1.5 cursor-pointer"
          :class="isDark 
            ? 'bg-white/[0.04] border-white/[0.08] text-slate-300 hover:text-white hover:bg-white/[0.08] hover:border-white/[0.15]' 
            : 'bg-white border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-50 shadow-xs'"
          @click="open()"
        >
          <span class="material-symbols-outlined text-[14px] text-rose-500 fill-current animate-pulse">favorite</span>
          <span class="hidden sm:inline">Support</span>
        </button>

        <!-- Theme Toggle Button -->
        <button
          class="w-8 h-8 rounded-xl flex items-center justify-center transition-all border cursor-pointer"
          :class="isDark ? 'bg-white/[0.04] border-white/[0.08] text-amber-400 hover:bg-white/[0.08]' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 shadow-xs'"
          @click="toggle"
          :aria-label="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
        >
          <span class="material-symbols-outlined text-[16px]">{{ isDark ? 'light_mode' : 'dark_mode' }}</span>
        </button>

        <!-- Get Started / Tools CTA -->
        <NuxtLink
          to="/tools"
          class="px-4 py-1.5 rounded-xl text-xs font-semibold tracking-tight transition-all border hidden sm:flex items-center gap-1 shadow-sm"
          :class="isDark
            ? 'bg-gradient-to-r from-primary to-blue-600 text-white border-primary/40 hover:brightness-110 shadow-primary/20'
            : 'bg-slate-900 text-white border-slate-800 hover:bg-slate-800 shadow-slate-900/10'"
        >
          <span>Tools</span>
          <span class="material-symbols-outlined text-[14px]">arrow_forward</span>
        </NuxtLink>
      </div>
    </div>
  </nav>

  <!-- Mobile Bottom Navigation (Linear Floating Dock) -->
  <nav class="md:hidden fixed bottom-3 left-4 right-4 z-[60] backdrop-blur-2xl rounded-2xl border transition-all duration-200 shadow-2xl p-1"
    :class="isDark ? 'bg-[#0d0f17]/90 border-white/[0.12] shadow-black/80' : 'bg-white/90 border-slate-200/90 shadow-slate-400/20'"
  >
    <div class="grid grid-cols-5 gap-1">
      <NuxtLink
        v-for="link in navLinks"
        :key="link.to"
        :to="link.to"
        class="flex flex-col items-center justify-center py-2 px-1 rounded-xl transition-all"
        :class="isActive(link.to) 
          ? (isDark ? 'bg-primary/20 text-primary font-bold shadow-xs' : 'bg-primary/10 text-primary font-bold shadow-xs')
          : (isDark ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-900')"
      >
        <span class="material-symbols-outlined text-[19px] mb-0.5" 
          :class="isActive(link.to) ? 'text-primary' : ''"
        >
          {{ link.icon }}
        </span>
        <span class="text-[9.5px] tracking-tight truncate max-w-full font-sans">{{ link.label }}</span>
      </NuxtLink>
    </div>
  </nav>

  <!-- Support Modal (Linear / Vercel Minimalist Card) -->
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="isOpen" 
        class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm"
        @click.self="close()"
      >
        <div 
          class="relative w-full max-w-sm p-6 rounded-2xl shadow-2xl transition-all border"
          :class="isDark ? 'bg-[#0d0f17] border-white/[0.1] text-slate-100' : 'bg-white border-slate-200 text-slate-900'"
        >
          <!-- Close Button -->
          <button 
            @click="close()"
            class="absolute top-4 right-4 w-8 h-8 rounded-xl border flex items-center justify-center transition-all cursor-pointer"
            :class="isDark ? 'bg-white/[0.04] border-white/[0.08] text-slate-400 hover:text-white hover:bg-white/[0.08]' : 'bg-slate-100 border-slate-200 text-slate-600 hover:text-slate-900'"
          >
            <span class="material-symbols-outlined text-sm">close</span>
          </button>

          <!-- Modal Header -->
          <div class="mb-4 text-center">
            <div class="w-10 h-10 rounded-xl mx-auto mb-2 flex items-center justify-center bg-rose-500/10 border border-rose-500/20 text-rose-500">
              <span class="material-symbols-outlined text-xl animate-pulse">favorite</span>
            </div>
            <h3 class="font-headline text-base font-bold tracking-tight">Support FiGo Ecosystem</h3>
            <p class="text-xs opacity-70 mt-1 leading-relaxed">
              Bantu operasional server, kuota AI &amp; pemeliharaan tools publik.
            </p>
          </div>

          <!-- Tabs (Linear Segmented Selector) -->
          <div class="grid grid-cols-2 gap-1 p-1 border rounded-xl mb-3" :class="isDark ? 'bg-white/[0.03] border-white/[0.06]' : 'bg-slate-100 border-slate-200'">
            <button 
              v-for="tab in supportTabs"
              :key="tab.id"
              @click="activeTab = tab.id"
              class="py-2 px-3 text-xs font-semibold tracking-tight transition-all flex items-center justify-center gap-1.5 cursor-pointer rounded-lg"
              :class="activeTab === tab.id 
                ? (isDark ? 'bg-white/[0.12] text-white shadow-xs' : 'bg-white text-slate-900 shadow-xs') 
                : (isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900')"
            >
              <span class="material-symbols-outlined text-sm">{{ tab.icon }}</span>
              {{ tab.name }}
            </button>
          </div>
          
          <p class="text-[11px] min-h-[28px] opacity-75 text-center leading-tight mb-3">
            {{ currentTab.description }}
          </p>

          <!-- QR Code Container -->
          <div class="flex justify-center py-1 mb-4">
            <div 
              class="p-3.5 rounded-xl bg-white border border-slate-200 shadow-lg flex flex-col items-center justify-center"
            >
              <img 
                :src="qrUrl" 
                :alt="currentTab.name + ' QR Code'" 
                class="w-44 h-44 rounded-lg"
                loading="lazy"
              />
              <span class="text-[9px] text-slate-400 font-mono font-semibold tracking-wider uppercase mt-1.5">
                Scan via E-Wallet / Bank
              </span>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex flex-col gap-2">
            <a 
              :target="_blank"
              :href="donationUrl"
              rel="noopener noreferrer"
              class="w-full py-2.5 rounded-xl text-xs font-bold tracking-tight text-center flex items-center justify-center gap-1.5 text-white transition-all shadow-md cursor-pointer"
              :class="activeTab === 'trakteer' 
                ? 'bg-gradient-to-r from-[#FF3850] to-[#ff5d72] hover:brightness-105 shadow-[#FF3850]/20' 
                : 'bg-gradient-to-r from-[#FF5E5B] to-[#ff8481] hover:brightness-105 shadow-[#FF5E5B]/20'"
            >
              <span class="material-symbols-outlined text-sm">open_in_new</span>
              Buka Halaman {{ currentTab.name }}
            </a>
            
            <button 
              @click="copyDonationLink"
              class="w-full py-2 rounded-xl text-xs font-semibold tracking-tight border transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              :class="isDark 
                ? 'border-white/[0.08] hover:bg-white/[0.04] text-slate-300 hover:text-white' 
                : 'border-slate-200 hover:bg-slate-50 text-slate-700'"
            >
              <span class="material-symbols-outlined text-sm">{{ isCopied ? 'done' : 'content_copy' }}</span>
              {{ isCopied ? 'Tautan Berhasil Disalin!' : `Salin Tautan ${currentTab.name}` }}
            </button>
          </div>

          <!-- Creator Portfolio -->
          <div class="mt-4 pt-3 border-t" :class="isDark ? 'border-white/[0.08]' : 'border-slate-100'">
            <a 
              href="https://fikfikk.my.id/" 
              target="_blank" 
              rel="noopener noreferrer"
              class="flex items-center justify-between p-2 rounded-xl border transition-all"
              :class="isDark 
                ? 'bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.06] text-slate-200' 
                : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-800'"
            >
              <div class="flex items-center gap-2 text-left">
                <span class="material-symbols-outlined text-base text-primary">person</span>
                <div>
                  <p class="text-[9px] opacity-60 uppercase font-mono tracking-wider leading-none mb-0.5">Creator</p>
                  <p class="text-xs font-bold">fikfikk.my.id</p>
                </div>
              </div>
              <span class="material-symbols-outlined text-sm opacity-50">arrow_forward</span>
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
    description: 'Dukung via QRIS, GoPay, OVO, Dana, LinkAja, atau ShopeePay.',
    icon: 'payments'
  },
  {
    id: 'kofi',
    name: 'Ko-fi',
    url: 'https://ko-fi.com/fikfikk',
    description: 'Support globally using PayPal, Card, or Google Pay.',
    icon: 'coffee'
  }
]

const activeTab = ref<'trakteer' | 'kofi'>('trakteer')

const currentTab = computed(() => supportTabs.find(t => t.id === activeTab.value) || supportTabs[0])
const donationUrl = computed(() => currentTab.value.url)

const qrUrl = computed(() => {
  const dark = encodeURIComponent('#08090d')
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

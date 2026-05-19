<template>
  <nav class="fixed top-0 w-full z-50 backdrop-blur-xl shadow-[0_4px_20px_rgba(0,0,0,0.04)] transition-colors duration-300"
    :class="isDark ? 'bg-[#0f1117]/80 border-b border-white/5' : 'bg-white/70'"
  >
    <div class="flex justify-between items-center px-6 md:px-8 py-4 max-w-7xl mx-auto">
      <!-- Logo -->
      <NuxtLink to="/" class="text-xl font-bold tracking-tighter font-headline"
        :class="isDark ? 'text-white' : 'text-slate-900'"
      >
        Fi<span class="text-primary">Go</span>
      </NuxtLink>

      <!-- Desktop Nav -->
      <div class="hidden md:flex items-center space-x-1">
        <NuxtLink
          v-for="link in navLinks"
          :key="link.to"
          :to="link.to"
          class="px-4 py-2 rounded-2xl font-headline text-sm font-medium tracking-tight transition-all duration-300"
          :class="isActive(link.to)
            ? (isDark ? 'bg-primary/15 text-primary' : 'bg-primary/10 text-primary')
            : (isDark ? 'text-gray-400 hover:text-white hover:bg-white/5' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50')"
        >
          {{ link.label }}
        </NuxtLink>
      </div>

      <!-- CTA + Theme Toggle + Hamburger -->
      <div class="flex items-center gap-3">
        <!-- Tombol Support -->
        <button
          class="px-4 py-2.5 rounded-2xl font-headline text-sm font-bold transition-all duration-300 hover:scale-105 active:scale-95 flex items-center gap-1.5 border"
          :class="isDark 
            ? 'bg-white/5 text-white hover:bg-white/10 border-white/10' 
            : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border-slate-200'"
          @click="open()"
        >
          <span class="material-symbols-outlined text-sm text-red-500 fill-current animate-pulse">favorite</span>
          <span class="hidden sm:inline">Support</span>
        </button>

        <!-- Dark/Light toggle (Always in Top Header) -->
        <button
          class="w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95"
          :class="isDark ? 'bg-white/10 text-yellow-400 hover:bg-white/15' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'"
          @click="toggle"
          :aria-label="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
        >
          <span class="material-symbols-outlined text-xl">{{ isDark ? 'light_mode' : 'dark_mode' }}</span>
        </button>

        <!-- Get Started -->
        <NuxtLink
          to="/tools/color-palette"
          class="px-6 py-2.5 rounded-2xl font-headline text-sm font-semibold hover:scale-102 transition-all ease-out active:scale-95 hidden md:block shadow-lg"
          :class="isDark
            ? 'bg-gradient-to-r from-primary to-[#4d8ef7] text-white shadow-primary/30 hover:shadow-primary/50'
            : 'bg-primary text-on-primary shadow-primary/20 hover:shadow-primary/40'"
        >
          Get Started
        </NuxtLink>

      </div>
    </div>
  </nav>

  <!-- Mobile Bottom Navigation -->
  <nav class="md:hidden fixed bottom-0 left-0 w-full z-[60] border-t backdrop-blur-3xl transition-colors duration-300 pb-safe px-4"
    :class="isDark ? 'bg-[#0f1117]/80 border-white/5' : 'bg-white/80 border-slate-100'"
  >
    <div class="flex justify-around items-center py-3">
      <NuxtLink
        v-for="link in navLinks"
        :key="link.to"
        :to="link.to"
        class="flex flex-col items-center justify-center min-w-[64px] h-12 rounded-2xl transition-all"
        :class="isActive(link.to) 
          ? 'text-primary' 
          : (isDark ? 'text-gray-500 hover:text-gray-300' : 'text-slate-500 hover:text-slate-800')"
      >
        <span class="material-symbols-outlined text-[24px] mb-1" 
          :class="isActive(link.to) ? '!font-bold' : ''"
        >
          {{ link.icon }}
        </span>
        <span class="text-[10px] font-headline font-bold tracking-tight">{{ link.label }}</span>
      </NuxtLink>
    </div>
  </nav>

  <!-- Modal Support Modern Multi-Platform -->
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="isOpen" 
        class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md"
        @click.self="close()"
      >
        <div 
          class="relative w-full max-w-sm p-6 rounded-2xl shadow-2xl transition-all duration-300 border"
          :class="isDark ? 'bg-[#0f1117] border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900'"
        >
          <!-- Tombol Tutup -->
          <button 
            @click="close()"
            class="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center transition-all"
            :class="isDark ? 'hover:bg-white/10 text-gray-400 hover:text-white' : 'hover:bg-slate-100 text-slate-500 hover:text-slate-900'"
          >
            <span class="material-symbols-outlined text-lg">close</span>
          </button>

          <!-- Konten Modal -->
          <div class="text-center space-y-4 mt-2">
            <div class="inline-flex p-3 rounded-full bg-primary/10 text-primary">
              <span class="material-symbols-outlined text-2xl animate-pulse">volunteer_activism</span>
            </div>
            
            <h3 class="font-headline text-lg font-bold">Support FiGo</h3>

            <!-- Segmented Control untuk Tabs -->
            <div class="flex p-1 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200/50 dark:border-white/10">
              <button 
                v-for="tab in supportTabs"
                :key="tab.id"
                @click="activeTab = tab.id"
                class="flex-1 py-2 px-3 rounded-lg text-xs font-bold font-headline transition-all duration-300 flex items-center justify-center gap-1.5"
                :class="activeTab === tab.id 
                  ? (isDark ? 'bg-white/10 text-white shadow-md' : 'bg-white text-slate-900 shadow-sm') 
                  : (isDark ? 'text-gray-400 hover:text-white' : 'text-slate-500 hover:text-slate-800')"
              >
                <span class="material-symbols-outlined text-sm">{{ tab.icon }}</span>
                {{ tab.name }}
              </button>
            </div>
            
            <p class="text-xs transition-colors duration-300 min-h-[32px] px-2" :class="isDark ? 'text-gray-400' : 'text-slate-500'">
              {{ currentTab.description }}
            </p>

            <!-- QR Code Container -->
            <div class="flex justify-center py-1">
              <div 
                class="p-4 rounded-2xl bg-white border border-slate-100 shadow-md flex flex-col items-center justify-center transition-all duration-500 transform hover:scale-102"
                :style="`border-top: 4px solid ${activeTab === 'trakteer' ? '#FF3850' : '#FF5E5B'}`"
              >
                <img 
                  :src="qrUrl" 
                  :alt="currentTab.name + ' QR Code'" 
                  class="w-48 h-48 transition-opacity duration-300"
                  loading="lazy"
                />
                <span class="text-[9px] text-slate-400 font-semibold tracking-wider uppercase mt-2">Scan to Support</span>
              </div>
            </div>

            <!-- Aksi Tambahan -->
            <div class="flex flex-col gap-2 pt-1">
              <a 
                :target="_blank"
                :href="donationUrl"
                rel="noopener noreferrer"
                class="w-full py-2.5 rounded-xl font-headline text-xs font-bold hover:scale-102 transition-all active:scale-95 text-center flex items-center justify-center gap-1.5 text-white shadow-lg"
                :class="activeTab === 'trakteer' 
                  ? 'bg-gradient-to-r from-[#FF3850] to-[#ff5d72] shadow-[#FF3850]/20' 
                  : 'bg-gradient-to-r from-[#FF5E5B] to-[#ff8481] shadow-[#FF5E5B]/20'"
              >
                <span class="material-symbols-outlined text-sm">open_in_new</span>
                Buka Tautan {{ currentTab.name }}
              </a>
              
              <button 
                @click="copyDonationLink"
                class="w-full py-2.5 rounded-xl font-headline text-xs font-semibold border transition-all hover:scale-102 active:scale-95 flex items-center justify-center gap-1.5"
                :class="isDark 
                  ? 'border-white/10 hover:bg-white/5 text-white' 
                  : 'border-slate-200 hover:bg-slate-50 text-slate-700'"
              >
                <span class="material-symbols-outlined text-sm">{{ isCopied ? 'done' : 'content_copy' }}</span>
                {{ isCopied ? 'Tautan Disalin!' : `Salin Tautan ${currentTab.name}` }}
              </button>
            </div>

            <!-- Bagian Portofolio Pembuat -->
            <div class="pt-4 border-t border-dashed" :class="isDark ? 'border-white/10' : 'border-slate-200'">
              <a 
                href="https://fikfikk.my.id/" 
                target="_blank" 
                rel="noopener noreferrer"
                class="group flex items-center justify-between p-3 rounded-xl border transition-all duration-300"
                :class="isDark 
                  ? 'bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/10 text-white' 
                  : 'bg-slate-50 border-slate-100 hover:bg-slate-100 hover:border-slate-200 text-slate-800'"
              >
                <div class="flex items-center gap-2.5 text-left">
                  <span class="material-symbols-outlined text-lg text-primary">person</span>
                  <div>
                    <p class="text-[10px] text-slate-400 dark:text-gray-500 font-semibold tracking-wider uppercase leading-none mb-0.5">Creator Portfolio</p>
                    <p class="text-xs font-bold font-headline">fikfikk.my.id</p>
                  </div>
                </div>
                <span class="material-symbols-outlined text-sm text-slate-400 group-hover:text-primary transition-all duration-300 transform group-hover:translate-x-0.5">arrow_forward</span>
              </a>
            </div>

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
  { to: '/tools/color-palette', label: 'Tools', icon: 'build' },
  { to: '/stocks', label: 'Stocks', icon: 'candlestick_chart' },
]

function isActive(path: string): boolean {
  if (path.startsWith('/tools')) return route.path.startsWith('/tools')
  return route.path === path
}

// State global untuk mengontrol visibilitas modal support
const { isOpen, close, open } = useSupportModal()
const isCopied = ref(false)

// Konfigurasi platform support (Trakteer & Ko-fi)
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

// Tab aktif saat ini
const activeTab = ref<'trakteer' | 'kofi'>('trakteer')

// Menghitung tab aktif dan URL donasi saat ini
const currentTab = computed(() => supportTabs.find(t => t.id === activeTab.value) || supportTabs[0])
const donationUrl = computed(() => currentTab.value.url)

// Menghitung URL QR Code secara dinamis menggunakan API internal /api/tools/qr
const qrUrl = computed(() => {
  // QR Code selalu digenerate dengan warna gelap (#0f1117) di atas latar putih (#ffffff)
  // untuk memastikan pemindaian 100% sukses dan tampilan kartu fisik yang bersih dengan padding.
  const dark = encodeURIComponent('#0f1117')
  const light = encodeURIComponent('#ffffff')
  return `/api/tools/qr?text=${encodeURIComponent(donationUrl.value)}&size=300&format=svg&dark=${dark}&light=${light}&margin=2`
})

// Fungsi untuk menyalin tautan donasi aktif ke clipboard
async function copyDonationLink() {
  try {
    await navigator.clipboard.writeText(donationUrl.value)
    isCopied.value = true
    setTimeout(() => {
      isCopied.value = false
    }, 2000)
  } catch (err) {
    // Log kegagalan non-blokir jika terjadi kesalahan saat menyalin
    console.warn('Gagal menyalin tautan:', err)
  }
}
</script>

<style scoped>
/* Transisi untuk animasi modal donasi */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s cubic-bezier(0.16, 1, 0.3, 1), transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: scale(0.95);
}
</style>


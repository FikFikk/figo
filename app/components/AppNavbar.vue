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
        <!-- Tombol Dukung (Trakteer QR) -->
        <button
          class="px-4 py-2.5 rounded-2xl font-headline text-sm font-bold transition-all duration-300 hover:scale-105 active:scale-95 flex items-center gap-1.5 border"
          :class="isDark 
            ? 'bg-white/5 text-white hover:bg-white/10 border-white/10' 
            : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border-slate-200'"
          @click="showQrModal = true"
        >
          <span class="material-symbols-outlined text-sm text-red-500 fill-current animate-pulse">favorite</span>
          <span class="hidden sm:inline">Dukung</span>
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

  <!-- Modal Donasi QRIS Modern -->
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="showQrModal" 
        class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md"
        @click.self="showQrModal = false"
      >
        <div 
          class="relative w-full max-w-sm p-6 rounded-2xl shadow-2xl transition-all duration-300 border"
          :class="isDark ? 'bg-[#0f1117] border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900'"
        >
          <!-- Tombol Tutup -->
          <button 
            @click="showQrModal = false"
            class="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center transition-all"
            :class="isDark ? 'hover:bg-white/10 text-gray-400 hover:text-white' : 'hover:bg-slate-100 text-slate-500 hover:text-slate-900'"
          >
            <span class="material-symbols-outlined text-lg">close</span>
          </button>

          <!-- Konten Modal -->
          <div class="text-center space-y-4 mt-2">
            <div class="inline-flex p-3 rounded-full bg-primary/10 text-primary">
              <span class="material-symbols-outlined text-2xl">volunteer_activism</span>
            </div>
            
            <h3 class="font-headline text-lg font-bold">Dukung FiGo</h3>
            
            <p class="text-xs" :class="isDark ? 'text-gray-400' : 'text-slate-500'">
              Pindai QR Code di bawah dengan e-wallet (GoPay, OVO, Dana, LinkAja, dsb) untuk donasi langsung via Trakteer.
            </p>

            <!-- QR Code Container -->
            <div class="flex justify-center py-2">
              <div class="p-4 rounded-2xl bg-white border border-slate-100 shadow-sm flex items-center justify-center">
                <img 
                  :src="qrUrl" 
                  alt="Trakteer QR Code" 
                  class="w-48 h-48"
                  loading="lazy"
                />
              </div>
            </div>

            <!-- Aksi Tambahan -->
            <div class="flex flex-col gap-2 pt-2">
              <a 
                href="https://trakteer.id/8glcaxeiv6nrtxa4ykur/tip?open=true"
                target="_blank"
                rel="noopener noreferrer"
                class="w-full py-2.5 bg-primary text-on-primary rounded-xl font-headline text-xs font-bold hover:scale-102 transition-all active:scale-95 text-center flex items-center justify-center gap-1.5"
              >
                <span class="material-symbols-outlined text-sm">open_in_new</span>
                Buka Tautan Trakteer
              </a>
              
              <button 
                @click="copyDonationLink"
                class="w-full py-2.5 rounded-xl font-headline text-xs font-semibold border transition-all hover:scale-102 active:scale-95 flex items-center justify-center gap-1.5"
                :class="isDark 
                  ? 'border-white/10 hover:bg-white/5 text-white' 
                  : 'border-slate-200 hover:bg-slate-50 text-slate-700'"
              >
                <span class="material-symbols-outlined text-sm">{{ isCopied ? 'done' : 'content_copy' }}</span>
                {{ isCopied ? 'Tautan Disalin!' : 'Salin Tautan Donasi' }}
              </button>
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

// State untuk mengontrol tampilan modal QR
const showQrModal = ref(false)
const isCopied = ref(false)

// URL tujuan Trakteer
const donationUrl = 'https://trakteer.id/8glcaxeiv6nrtxa4ykur/tip?open=true'

// Menghitung URL QR Code secara dinamis menggunakan API internal /api/tools/qr
const qrUrl = computed(() => {
  // QR Code selalu digenerate dengan warna gelap (#0f1117) di atas latar putih (#ffffff)
  // untuk memastikan pemindaian 100% sukses dan tampilan kartu fisik yang bersih dengan padding.
  const dark = encodeURIComponent('#0f1117')
  const light = encodeURIComponent('#ffffff')
  return `/api/tools/qr?text=${encodeURIComponent(donationUrl)}&size=300&format=svg&dark=${dark}&light=${light}&margin=2`
})

// Fungsi untuk menyalin tautan donasi ke papan klip
async function copyDonationLink() {
  try {
    await navigator.clipboard.writeText(donationUrl)
    isCopied.value = true
    setTimeout(() => {
      isCopied.value = false
    }, 2000)
  } catch (err) {
    // Log kegagalan non-blokir
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


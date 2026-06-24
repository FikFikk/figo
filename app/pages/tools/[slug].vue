<template>
  <div class="pt-24 pb-20 px-6 md:px-8 max-w-7xl mx-auto min-h-screen">
    <div class="flex flex-col lg:flex-row gap-8">
      
      <!-- Mobile Navigation (Sticky) -->
      <div class="lg:hidden sticky top-[72px] z-30 -mx-6 px-6 py-3 bg-neutral-50/80 dark:bg-neutral-900/80 backdrop-blur-md border-b border-black/5 dark:border-white/5 mb-6 overflow-x-auto no-scrollbar">
        <div class="flex items-center gap-2 min-w-max">
          <NuxtLink
            v-for="tool in availableTools"
            :key="tool.id"
            :to="tool.external || `/tools/${tool.slug}`"
            class="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap"
            :style="activeTool === tool.id ? 'transform: scale(1.05)' : ''"
            :class="activeTool === tool.id 
              ? 'bg-primary text-on-primary shadow-md shadow-primary/20' 
              : (isDark ? 'bg-white/5 text-gray-400' : 'bg-white text-slate-500 border border-slate-100')"
          >
            <span class="material-symbols-outlined text-base">{{ tool.icon }}</span>
            {{ tool.name }}
          </NuxtLink>
        </div>
      </div>

      <!-- Desktop Sidebar -->
      <aside class="hidden lg:block lg:w-72 flex-shrink-0 border-r border-black/5 dark:border-white/5 pr-8">
        <div class="sticky top-28">
          <div class="mb-10">
            <div class="inline-block px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase mb-4"
              :class="isDark ? 'bg-primary/10 text-primary border border-primary/20' : 'bg-primary-fixed text-on-primary-fixed'"
            >
              Toolkit v1.2
            </div>
            <h1 class="text-3xl font-headline font-black tracking-tight" :class="isDark ? 'text-white' : 'text-slate-900'">
              Developer Tools
            </h1>
          </div>

          <!-- Tool List (Desktop) -->
          <nav class="space-y-1.5">
            <NuxtLink 
              v-for="tool in availableTools"
              :key="tool.id"
              :to="tool.external || `/tools/${tool.slug}`"
              class="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-300 group relative overflow-hidden"
              :class="activeTool === tool.id 
                ? (isDark ? 'bg-primary/20 text-white border border-primary/30' : 'bg-primary text-white shadow-lg shadow-primary/20')
                : (isDark ? 'text-gray-500 hover:text-gray-300 hover:bg-white/5' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100')"
            >
              <div v-if="activeTool === tool.id && !isDark" class="absolute left-0 top-0 bottom-0 w-1.5 bg-white/20"></div>
              <span class="material-symbols-outlined text-xl transition-transform duration-300 group-hover:scale-110">
                {{ tool.icon }}
              </span>
              <span class="font-headline font-bold text-sm">{{ tool.name }}</span>
            </NuxtLink>
          </nav>

          <!-- Soon Section (Desktop Sidebar) -->
          <div class="mt-12 space-y-4">
            <p class="px-4 text-[10px] font-black uppercase tracking-[0.2em] opacity-30">Incoming Tools</p>
            <div class="space-y-1">
              <div 
                v-for="tool in soonTools" 
                :key="tool.name"
                class="flex items-center gap-3 px-4 py-2 opacity-25 grayscale cursor-default"
              >
                <span class="material-symbols-outlined text-lg">{{ tool.icon }}</span>
                <span class="text-xs font-bold">{{ tool.name }}</span>
              </div>
            </div>
          </div>
        </div>
      </aside>

      <!-- Main Content Area -->
      <main class="flex-1 min-w-0">
        <Transition
          mode="out-in"
          enter-active-class="transition duration-300 ease-out"
          enter-from-class="transform translate-y-4 opacity-0"
          enter-to-class="transform translate-y-0 opacity-100"
          leave-active-class="transition duration-200 ease-in"
          leave-from-class="transform translate-y-0 opacity-100"
          leave-to-class="transform translate-y-4 opacity-0"
        >
          <!-- Tool Components -->
          <div :key="activeTool">
            <div v-if="activeTool === 'safety'">
              <ToolsLinkSafety />
            </div>
            <div v-else-if="activeTool === 'color'">
              <ToolsColorGenerator />
            </div>
            <div v-else-if="activeTool === 'metadata'">
              <ToolsFileMetadata />
            </div>
            <div v-else-if="activeTool === 'generator'">
              <ToolsSecureGenerator />
            </div>
            <div v-else-if="activeTool === 'qr'">
              <ToolsQrEngine />
            </div>
            <div v-else-if="activeTool === 'stream'">
              <ToolsStreamPlayer />
            </div>
            
            <!-- Default Welcome (unlikely but safe) -->
            <div v-else class="glass-panel rounded-3xl p-12 text-center" :class="isDark ? 'border border-white/5' : 'border border-slate-100'">
              <span class="material-symbols-outlined text-6xl text-primary opacity-20 mb-6 block">auto_fix_high</span>
              <h2 class="text-xl font-headline font-bold mb-2">Select a Tool</h2>
              <p class="text-sm opacity-50 max-w-xs mx-auto">Choose a tool from the sidebar to start your development workflow.</p>
            </div>
          </div>
        </Transition>

        <!-- Tool Footer / Info -->
        <div class="mt-8 px-4 flex items-center justify-between opacity-30">
          <p class="text-[10px] font-bold uppercase tracking-widest">FiGo Forge Collective</p>
          <div class="flex gap-4">
            <span class="material-symbols-outlined text-sm">terminal</span>
            <span class="material-symbols-outlined text-sm">code</span>
            <span class="material-symbols-outlined text-sm">api</span>
          </div>
        </div>
      </main>

    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * Tools Page - Dynamic URL routing per tool
 * URL: /tools/[slug] → resolves to tool component
 */
// SEO dinamis berdasarkan tool yang aktif
const toolSeoMap: Record<string, { title: string; description: string }> = {
  'color-palette': {
    title: 'Color Palette Generator Online Gratis — FiGo Tools',
    description: 'Generate color palette dan gradient secara otomatis. Pilih warna, lihat kode HEX/RGB/HSL, copy langsung ke clipboard. Gratis untuk desainer dan developer.'
  },
  'link-safety': {
    title: 'Cek Keamanan Link Online — Link Safety Checker — FiGo Tools',
    description: 'Periksa apakah sebuah link/URL aman atau berbahaya sebelum diklik. Deteksi phishing, malware, dan situs mencurigakan. Gratis dan instan.'
  },
  'file-metadata': {
    title: 'Cek Metadata File Online — EXIF, Size & Info — FiGo Tools',
    description: 'Analisis metadata file: ukuran, tipe MIME, EXIF data foto, dimensi gambar, dan informasi teknis lainnya. Upload file dan lihat detailnya secara gratis.'
  },
  'secure-generator': {
    title: 'Password Generator Online — Buat Password Kuat & Aman — FiGo Tools',
    description: 'Generate password kuat dan aman secara acak. Atur panjang, huruf besar/kecil, angka, simbol. Copy langsung ke clipboard. 100% gratis dan aman.'
  },
  'qr-engine': {
    title: 'QR Code Generator Online Gratis — Buat QR Code Instan — FiGo Tools',
    description: 'Buat QR code dari teks, URL, nomor telepon, atau data apapun secara gratis. Download QR code sebagai gambar PNG. Instan, tanpa login, tanpa batas.'
  },
  'stream': {
    title: 'FiGo Bioskop — Katalog Film & Series — FiGo Tools',
    description: 'Jelajahi katalog film dan series, lihat detail episode per season, dan putar lewat proxy aman. Akses dilindungi PIN.'
  },
}

const route = useRoute()
const currentSlug = computed(() => route.params.slug as string)
const currentSeo = computed(() => toolSeoMap[currentSlug.value] || {
  title: 'Developer Tools — QR Code, Password Generator & More — FiGo',
  description: 'Koleksi developer tools gratis: QR code generator, password generator, color palette, link checker, file metadata analyzer. Semua gratis, tanpa signup.'
})

useSeoMeta({
  title: () => currentSeo.value.title,
  ogTitle: () => currentSeo.value.title,
  description: () => currentSeo.value.description,
  ogDescription: () => currentSeo.value.description,
  twitterCard: 'summary_large_image',
})

const { isDark } = useColorMode()

// Mapping slug → tool id
const slugToId: Record<string, string> = {
  'color-palette': 'color',
  'link-safety': 'safety',
  'file-metadata': 'metadata',
  'secure-generator': 'generator',
  'qr-engine': 'qr',
  'stream': 'stream',
}

// Configuration for active tools (with URL slug)
const availableTools = [
  { id: 'calendar', slug: 'calendar', name: 'Calendar 2026', icon: 'calendar_month', external: '/kalender' },
  { id: 'editor', slug: 'editor', name: 'AI Image Editor', icon: 'photo_filter', external: '/editor' },
  { id: 'recipes', slug: 'recipes', name: 'Resep Makanan', icon: 'restaurant', external: '/recipes' },
  { id: 'nutrition', slug: 'nutrition', name: 'Nutrition Facts', icon: 'nutrition', external: '/foods' },
  { id: 'color', slug: 'color-palette', name: 'Color Palette', icon: 'palette' },
  { id: 'safety', slug: 'link-safety', name: 'Link Safety', icon: 'shield_lock' },
  { id: 'metadata', slug: 'file-metadata', name: 'File Metadata', icon: 'analytics' },
  { id: 'generator', slug: 'secure-generator', name: 'Secure Generator', icon: 'vpn_key' },
  { id: 'qr', slug: 'qr-engine', name: 'QR Engine', icon: 'qr_code_2' },
  { id: 'stream', slug: 'stream', name: 'Bioskop', icon: 'movie' },
]

// Resolve active tool dari slug di URL
const activeTool = computed(() => {
  const slug = route.params.slug as string
  return slugToId[slug] || 'color'
})

// Configuration for upcoming tools
const soonTools = [
  { name: 'Base64 Stream', icon: 'text_format' },
]
</script>

<style scoped>
.glass-panel {
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}

/* Custom scrollbar for sticky sidebar if content overflows */
aside ::-webkit-scrollbar {
  width: 4px;
}
aside ::-webkit-scrollbar-track {
  background: transparent;
}
aside ::-webkit-scrollbar-thumb {
  background: rgba(var(--primary-rgb), 0.1);
  border-radius: 10px;
}
</style>

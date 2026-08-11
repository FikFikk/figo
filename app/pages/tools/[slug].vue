<template>
  <!-- Full-screen layout untuk stream -->
  <div v-if="activeTool === 'stream'" class="min-h-screen">
    <ToolsStreamPlayer />
  </div>

  <div v-else class="tools-root pt-20 min-h-screen" :class="isDark ? 'bg-[#0f1117]' : 'bg-slate-50'">

    <!-- ══════════════════════════════════════════
         MOBILE: Sticky Pill Nav
    ══════════════════════════════════════════ -->
    <div class="lg:hidden sticky top-[64px] z-30 border-b"
      :class="isDark ? 'bg-[#0f1117]/90 border-white/5' : 'bg-slate-50/90 border-black/5'"
      style="backdrop-filter: blur(16px)"
    >
      <div class="flex items-center gap-2 overflow-x-auto no-scrollbar px-4 py-3">
        <NuxtLink
          v-for="tool in availableTools"
          :key="tool.id"
          :to="tool.external || `/tools/${tool.slug}`"
          class="flex-shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-full text-[11px] font-bold transition-all duration-200"
          :class="activeTool === tool.id
            ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/30'
            : (isDark ? 'bg-white/5 text-slate-400 hover:bg-white/10' : 'bg-white text-slate-500 border border-slate-200 hover:border-indigo-300')"
        >
          <span class="material-symbols-outlined" style="font-size:14px">{{ tool.icon }}</span>
          {{ tool.name }}
        </NuxtLink>
      </div>
    </div>

    <!-- ══════════════════════════════════════════
         DESKTOP LAYOUT: Sidebar + Content
    ══════════════════════════════════════════ -->
    <div class="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 pb-24">
      <div class="flex gap-6 lg:gap-8 items-start">

        <!-- ── Sidebar ──────────────────────────── -->
        <aside
          class="hidden lg:flex flex-col w-60 xl:w-64 flex-shrink-0 sticky top-24 self-start"
          style="max-height: calc(100vh - 6rem); overflow-y: auto"
        >
          <!-- Header -->
          <div class="mb-6 pt-6">
            <p class="text-[10px] font-black uppercase tracking-[0.18em] mb-1"
              :class="isDark ? 'text-indigo-400' : 'text-indigo-500'"
            >Toolkit v1.2</p>
            <h1 class="text-xl font-black tracking-tight"
              :class="isDark ? 'text-white' : 'text-slate-900'"
            >Developer<br>Tools</h1>
          </div>

          <!-- Tool List -->
          <nav class="space-y-0.5 flex-1">
            <NuxtLink
              v-for="tool in availableTools"
              :key="tool.id"
              :to="tool.external || `/tools/${tool.slug}`"
              class="flex items-center gap-3 px-3 py-2.5 rounded-2xl text-sm font-semibold transition-all duration-200 group"
              :class="activeTool === tool.id
                ? (isDark
                    ? 'bg-indigo-500/15 text-indigo-300 border border-indigo-500/20'
                    : 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20')
                : (isDark
                    ? 'text-slate-500 hover:text-slate-200 hover:bg-white/5'
                    : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100')"
            >
              <span
                class="material-symbols-outlined transition-transform duration-200 group-hover:scale-110 flex-shrink-0"
                style="font-size:18px"
              >{{ tool.icon }}</span>
              <span class="truncate">{{ tool.name }}</span>

              <!-- Active indicator dot -->
              <span
                v-if="activeTool === tool.id"
                class="ml-auto w-1.5 h-1.5 rounded-full flex-shrink-0"
                :class="isDark ? 'bg-indigo-400' : 'bg-white/70'"
              />
            </NuxtLink>
          </nav>

          <!-- Divider -->
          <div class="my-4 border-t" :class="isDark ? 'border-white/5' : 'border-slate-100'" />

          <!-- Coming Soon -->
          <div>
            <p class="px-3 text-[9px] font-black uppercase tracking-[0.2em] mb-2"
              :class="isDark ? 'text-slate-600' : 'text-slate-300'"
            >Coming Soon</p>
            <div
              v-for="tool in soonTools"
              :key="tool.name"
              class="flex items-center gap-3 px-3 py-2 rounded-2xl opacity-30 cursor-default select-none"
            >
              <span class="material-symbols-outlined" style="font-size:16px">{{ tool.icon }}</span>
              <span class="text-xs font-semibold">{{ tool.name }}</span>
            </div>
          </div>
        </aside>

        <!-- ── Main Content ─────────────────────── -->
        <main class="flex-1 min-w-0 pt-6">

          <!-- Breadcrumb -->
          <div class="flex items-center gap-2 mb-5 text-xs"
            :class="isDark ? 'text-slate-600' : 'text-slate-400'"
          >
            <NuxtLink to="/" class="hover:text-indigo-500 transition-colors">Home</NuxtLink>
            <span class="material-symbols-outlined" style="font-size:14px">chevron_right</span>
            <span>Tools</span>
            <span class="material-symbols-outlined" style="font-size:14px">chevron_right</span>
            <span :class="isDark ? 'text-slate-300' : 'text-slate-700'" class="font-semibold">
              {{ currentToolName }}
            </span>
          </div>

          <!-- Tool Content with Transition -->
          <Transition
            mode="out-in"
            enter-active-class="transition duration-250 ease-out"
            enter-from-class="opacity-0 translate-y-3"
            enter-to-class="opacity-100 translate-y-0"
            leave-active-class="transition duration-150 ease-in"
            leave-from-class="opacity-100 translate-y-0"
            leave-to-class="opacity-0 translate-y-2"
          >
            <div :key="activeTool">
              <div v-if="activeTool === 'safety'"><ToolsLinkSafety /></div>
              <div v-else-if="activeTool === 'color'"><ToolsColorGenerator /></div>
              <div v-else-if="activeTool === 'metadata'"><ToolsFileMetadata /></div>
              <div v-else-if="activeTool === 'generator'"><ToolsSecureGenerator /></div>
              <div v-else-if="activeTool === 'qr'"><ToolsQrEngine /></div>
              <div v-else-if="activeTool === 'forex'"><ToolsForexResearch /></div>
              <div v-else-if="activeTool === 'hls-player'"><ToolsStreamingPlayer /></div>
              <!-- Fallback -->
              <div v-else class="rounded-2xl border p-16 text-center"
                :class="isDark ? 'border-white/5 bg-white/3' : 'border-slate-100 bg-white'"
              >
                <span class="material-symbols-outlined text-5xl mb-4 block opacity-20"
                  :class="isDark ? 'text-indigo-400' : 'text-indigo-500'"
                >auto_fix_high</span>
                <h2 class="text-base font-bold mb-1"
                  :class="isDark ? 'text-slate-300' : 'text-slate-700'"
                >Pilih Tool</h2>
                <p class="text-xs opacity-40 max-w-xs mx-auto">
                  Pilih tool dari sidebar untuk memulai.
                </p>
              </div>
            </div>
          </Transition>

          <!-- Footer strip -->
          <div class="mt-10 flex items-center justify-between"
            :class="isDark ? 'text-slate-700' : 'text-slate-300'"
          >
            <span class="text-[10px] font-bold uppercase tracking-widest">FiGo Forge Collective</span>
            <div class="flex items-center gap-3">
              <span class="material-symbols-outlined" style="font-size:14px">terminal</span>
              <span class="material-symbols-outlined" style="font-size:14px">code</span>
              <span class="material-symbols-outlined" style="font-size:14px">api</span>
            </div>
          </div>
        </main>

      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
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
  'forex-research': {
    title: 'Forex Research Dashboard — Signal Score, Bias & Reasoning — FiGo Tools',
    description: 'Dashboard riset forex untuk melihat signal score, bias BUY/SELL, dan reasoning JSON dari collector lokal. Research mode, bukan auto-trading.'
  },
  'stream': {
    title: 'FiGo Bioskop — Katalog Film & Series — FiGo Tools',
    description: 'Jelajahi katalog film dan series, lihat detail episode per season, dan putar lewat proxy aman. Akses dilindungi PIN.'
  },
  'hls-player': {
    title: 'HLS Stream Player Online — Nonton & Ekstrak M3U8 — FiGo Tools',
    description: 'Ekstrak link HLS .m3u8 streaming secara otomatis berdasarkan TMDB Movie/TV show ID. Putar video langsung di browser secara gratis.'
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

const slugToId: Record<string, string> = {
  'color-palette': 'color',
  'link-safety': 'safety',
  'file-metadata': 'metadata',
  'secure-generator': 'generator',
  'qr-engine': 'qr',
  'forex-research': 'forex',
  'stream': 'stream',
  'hls-player': 'hls-player',
}

const availableTools = [
  { id: 'calendar',   slug: 'calendar',          name: 'Calendar 2026',    icon: 'calendar_month', external: '/kalender' },
  { id: 'editor',     slug: 'editor',             name: 'AI Image Editor',  icon: 'photo_filter',   external: '/editor' },
  { id: 'recipes',    slug: 'recipes',            name: 'Resep Makanan',    icon: 'restaurant',     external: '/recipes' },
  { id: 'nutrition',  slug: 'nutrition',          name: 'Nutrition Facts',  icon: 'nutrition',      external: '/foods' },
  { id: 'color',      slug: 'color-palette',      name: 'Color Palette',    icon: 'palette' },
  { id: 'safety',     slug: 'link-safety',        name: 'Link Safety',      icon: 'shield_lock' },
  { id: 'metadata',   slug: 'file-metadata',      name: 'File Metadata',    icon: 'analytics' },
  { id: 'generator',  slug: 'secure-generator',   name: 'Secure Generator', icon: 'vpn_key' },
  { id: 'qr',         slug: 'qr-engine',          name: 'QR Engine',        icon: 'qr_code_2' },
  { id: 'forex',      slug: 'forex-research',     name: 'Forex Research',   icon: 'monitoring' },
  { id: 'stream',     slug: 'stream',             name: 'Bioskop',          icon: 'movie' },
]

const activeTool = computed(() => {
  const slug = route.params.slug as string
  return slugToId[slug] || 'color'
})

const currentToolName = computed(() => {
  return availableTools.find(t => t.id === activeTool.value)?.name ?? 'Tools'
})

const soonTools = [
  { name: 'Base64 Stream', icon: 'text_format' },
]
</script>

<style scoped>
.tools-root {
  transition: background-color 0.2s ease;
}

/* Hide sidebar scrollbar */
aside::-webkit-scrollbar { width: 0; }

/* Mobile no-scrollbar */
.no-scrollbar::-webkit-scrollbar { display: none; }
.no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
</style>

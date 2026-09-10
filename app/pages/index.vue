<template>
  <div class="min-h-screen">
    <!-- Hero Section -->
    <HeroSection />

    <!-- Technical Telemetry & Stats Bar -->
    <StatsCounter />

    <!-- Section 01: Core File Modules (Bento Grid) -->
    <section id="tools" class="py-16 md:py-24 px-4 sm:px-6 md:px-8 max-w-7xl mx-auto">
      <div class="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10 md:mb-14 pb-6 border-b border-neutral-200 dark:border-neutral-800">
        <div>
          <div class="inline-flex items-center gap-2 px-2.5 py-1 rounded border border-neutral-200 dark:border-neutral-800 font-mono text-[10px] font-bold tracking-widest uppercase mb-3"
            :class="isDark ? 'bg-neutral-900 text-neutral-300' : 'bg-neutral-100 text-neutral-700'"
          >
            INDEX // 01 — CORE SUITE
          </div>
          <h2 class="text-3xl sm:text-4xl md:text-5xl font-headline font-black tracking-tight"
            :class="isDark ? 'text-white' : 'text-neutral-950'"
          >
            MODUL UTAMA
          </h2>
        </div>
        <p class="max-w-md text-sm md:text-base font-sans leading-relaxed" :class="isDark ? 'text-neutral-400' : 'text-neutral-600'">
          Alat pemrosesan berkas utama untuk konversi, optimasi ukuran, ekstraksi media, dan pembacaan arsip.
        </p>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <ToolCard
          v-for="(tool, idx) in coreTools"
          :key="tool.title"
          :icon="tool.icon"
          :title="tool.title"
          :description="tool.description"
          :action-label="tool.actionLabel"
          :icon-bg-class="isDark ? tool.iconBgDark : tool.iconBgClass"
          :icon-color-class="tool.iconColorClass"
          :delay="idx * 80"
          @action="handleToolAction(tool.title)"
        />
      </div>
    </section>

    <!-- Section 02: Ecosystem Hub -->
    <section class="py-16 md:py-24 px-4 sm:px-6 md:px-8 max-w-7xl mx-auto border-t border-neutral-200 dark:border-neutral-800">
      <div class="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10 md:mb-14 pb-6 border-b border-neutral-200 dark:border-neutral-800">
        <div>
          <div class="inline-flex items-center gap-2 px-2.5 py-1 rounded border border-neutral-200 dark:border-neutral-800 font-mono text-[10px] font-bold tracking-widest uppercase mb-3"
            :class="isDark ? 'bg-neutral-900 text-neutral-300' : 'bg-neutral-100 text-neutral-700'"
          >
            INDEX // 02 — ECOSYSTEM
          </div>
          <h2 class="text-3xl sm:text-4xl md:text-5xl font-headline font-black tracking-tight"
            :class="isDark ? 'text-white' : 'text-neutral-950'"
          >
            EKOSISTEM MODUL
          </h2>
        </div>
        <p class="max-w-md text-sm md:text-base font-sans leading-relaxed" :class="isDark ? 'text-neutral-400' : 'text-neutral-600'">
          Modul cerdas untuk produktivitas, basis data gizi, kuliner global, kalender, dan studio visual.
        </p>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div
          v-for="tool in ecosystemTools"
          :key="tool.title"
          @click="router.push(tool.route)"
          class="group p-6 md:p-8 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white/70 dark:bg-neutral-900/50 hover:border-neutral-950 dark:hover:border-neutral-200 transition-all duration-300 cursor-pointer flex flex-col justify-between min-h-[260px] shadow-sm hover:shadow-md"
        >
          <div>
            <div class="w-12 h-12 rounded-xl mb-6 flex items-center justify-center text-2xl transition-transform duration-300 group-hover:scale-105" :class="tool.bg">
              <span class="material-symbols-outlined">{{ tool.icon }}</span>
            </div>
            <h3 class="font-headline font-black text-lg md:text-xl mb-2 transition-colors" :class="isDark ? 'text-white group-hover:text-primary' : 'text-neutral-950 group-hover:text-primary'">
              {{ tool.title }}
            </h3>
            <p class="text-sm leading-relaxed line-clamp-2" :class="isDark ? 'text-neutral-400' : 'text-neutral-600'">
              {{ tool.description }}
            </p>
          </div>

          <div class="pt-6 border-t border-neutral-100 dark:border-neutral-850 flex items-center justify-between text-xs font-mono uppercase font-bold text-primary">
            <span>Buka Modul</span>
            <span class="material-symbols-outlined text-sm transform group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform">north_east</span>
          </div>
        </div>
      </div>

      <!-- Section 03: Micro Utilities Matrix -->
      <div class="mt-16 md:mt-24 pt-12 border-t border-neutral-200 dark:border-neutral-800">
        <div class="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-8">
          <div>
            <div class="text-[10px] font-mono font-bold uppercase tracking-widest text-primary mb-1">
              INDEX // 03 — MICRO UTILITIES
            </div>
            <h3 class="font-headline text-2xl font-black" :class="isDark ? 'text-white' : 'text-neutral-950'">
              ALAT CEPAT &amp; PRAKTIS
            </h3>
          </div>
          <p class="text-xs md:text-sm font-sans" :class="isDark ? 'text-neutral-400' : 'text-neutral-600'">
            Utilitas instan yang berjalan 100% di browser tanpa upload data.
          </p>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 font-mono">
          <NuxtLink
            v-for="tool in miniTools"
            :key="tool.name"
            :to="tool.route"
            class="group p-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white/50 dark:bg-neutral-900/30 hover:border-primary dark:hover:border-primary transition-all duration-300 flex flex-col justify-between min-h-[130px] shadow-sm hover:shadow"
          >
            <div class="flex items-center justify-between">
              <div class="w-8 h-8 rounded-lg bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-600 dark:text-neutral-300 group-hover:bg-primary group-hover:text-white transition-colors">
                <span class="material-symbols-outlined text-lg">{{ tool.icon }}</span>
              </div>
              <span class="material-symbols-outlined text-sm text-primary opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all">arrow_forward</span>
            </div>

            <div class="mt-3">
              <div class="text-xs font-bold font-headline transition-colors" :class="isDark ? 'text-white group-hover:text-primary' : 'text-neutral-950 group-hover:text-primary'">
                {{ tool.name }}
              </div>
              <div class="text-[11px] font-sans mt-0.5 line-clamp-1" :class="isDark ? 'text-neutral-400' : 'text-neutral-500'">
                {{ tool.description }}
              </div>
            </div>
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- Swiss Call to Action Poster -->
    <CtaSection />
  </div>
</template>

<script setup lang="ts">
useSeoMeta({
  title: 'FiGo — Universal Online File Engine: Download, Compress, Convert',
  ogTitle: 'FiGo — Universal Online File Tools & Utilities',
  description: 'FiGo is a free all-in-one platform to download videos from TikTok, YouTube, Instagram & Twitter, compress images & PDFs up to 80%, convert files between PNG, JPG, WEBP, PDF, and more. No signup. No limits.',
  ogDescription: 'Download videos from TikTok, YouTube, Instagram for free. Compress images & PDFs. Convert files between any format. Generate QR codes, check link safety, and more.',
  twitterCard: 'summary_large_image',
})

useHead({
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'FiGo',
        url: 'https://go.fikfikk.my.id',
        applicationCategory: 'UtilitiesApplication',
        operatingSystem: 'All',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
        description: 'Free online tools to download videos from TikTok, YouTube, Instagram, compress images & PDFs, convert file formats, generate QR codes.',
        featureList: 'Video Downloader, Image Compressor, File Converter, QR Code Generator, Password Generator, Color Palette Generator'
      })
    }
  ]
})

const { isDark } = useColorMode()
const router = useRouter()

const coreTools = [
  {
    icon: 'menu_book',
    title: 'Arsip Pengetahuan',
    description: 'Arsip spiritual, tasawuf, dekonstruksi sejarah nusantara, dan kitab esoterik lengkap.',
    actionLabel: 'Baca Naskah',
    iconBgClass: 'bg-neutral-100 dark:bg-neutral-800',
    iconBgDark: 'bg-neutral-800',
    iconColorClass: 'text-indigo-500',
    route: '/articles'
  },
  {
    icon: 'transform',
    title: 'Konverter Berkas',
    description: 'Konversi format gambar, dokumen, dan media tanpa kompromi kualitas (PNG, WEBP, PDF, DOCX).',
    actionLabel: 'Mulai Konversi',
    iconBgClass: 'bg-neutral-100 dark:bg-neutral-800',
    iconBgDark: 'bg-neutral-800',
    iconColorClass: 'text-blue-500',
    route: '/convert',
  },
  {
    icon: 'layers',
    title: 'Kompresi Cerdas',
    description: 'Algoritma kompresi presisi untuk mereduksi ukuran file hingga 80% dengan fidelitas tinggi.',
    actionLabel: 'Optimasi Ukuran',
    iconBgClass: 'bg-neutral-100 dark:bg-neutral-800',
    iconBgDark: 'bg-neutral-800',
    iconColorClass: 'text-purple-500',
    route: '/compress',
  },
  {
    icon: 'download',
    title: 'Pengunduh Media',
    description: 'Unduh video dan audio resolusi tinggi dari TikTok, Instagram, YouTube tanpa watermark.',
    actionLabel: 'Unduh Sekarang',
    iconBgClass: 'bg-neutral-100 dark:bg-neutral-800',
    iconBgDark: 'bg-neutral-800',
    iconColorClass: 'text-emerald-500',
    route: '/download',
  },
]

const ecosystemTools = [
  {
    icon: 'restaurant',
    title: 'Global Recipes',
    description: 'Koleksi resep masakan internasional dengan penskalaan porsi real-time.',
    route: '/recipes',
    bg: 'bg-orange-50 text-orange-600 dark:bg-orange-950/40 dark:text-orange-400',
  },
  {
    icon: 'nutrition',
    title: 'Nutrition Index',
    description: 'Basis data nutrisi dan kandungan gizi ribuan produk pangan.',
    route: '/foods',
    bg: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400',
  },
  {
    icon: 'calendar_month',
    title: 'Smart Calendar',
    description: 'Kalender cerdas & manajemen jadwal hari libur serta produktivitas.',
    route: '/kalender',
    bg: 'bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400',
  },
  {
    icon: 'photo_filter',
    title: 'Image Studio',
    description: 'Editor gambar ringan berbasis browser untuk filter dan cropping cepat.',
    route: '/editor',
    bg: 'bg-purple-50 text-purple-600 dark:bg-purple-950/40 dark:text-purple-400',
  },
]

const miniTools = [
  { name: 'Color Palette', description: 'Ekstraktor & pembuat palet warna.', icon: 'palette', route: '/tools/color-palette' },
  { name: 'Link Safety', description: 'Pemeriksa keamanan URL & redirect.', icon: 'shield_lock', route: '/tools/link-safety' },
  { name: 'File Metadata', description: 'Inspeksi EXIF dan metadata berkas.', icon: 'analytics', route: '/tools/file-metadata' },
  { name: 'Password Gen', description: 'Generator kata sandi kriptografis.', icon: 'vpn_key', route: '/tools/secure-generator' },
  { name: 'QR Engine', description: 'Generator kode QR dinamis & SVG.', icon: 'qr_code_2', route: '/tools/qr-engine' },
]

function handleToolAction(toolName: string) {
  const tool = coreTools.find(t => t.title === toolName)
  if (tool) router.push(tool.route)
}
</script>

<style scoped>
/* Clean Swiss Grid */
</style>

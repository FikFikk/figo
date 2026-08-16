<template>
  <div>
    <HeroSection />
    <StatsCounter />

    <!-- Feature Bento Grid -->
    <section id="tools" class="py-16 md:py-24 px-6 md:px-8 max-w-7xl mx-auto">
      <div class="max-w-3xl mb-10 md:mb-12">
        <div class="inline-flex items-center gap-2 px-3 py-1 rounded-md text-[11px] font-bold tracking-[0.16em] uppercase mb-4"
          :class="isDark ? 'bg-primary/15 text-primary' : 'bg-primary-fixed text-on-primary-fixed'"
        >
          Core Engine
        </div>
        <h2 class="text-3xl md:text-5xl font-headline font-extrabold tracking-tight mb-3"
          :class="isDark ? 'text-white' : 'text-slate-900'"
        >
          Start with a file task
        </h2>
        <p class="max-w-2xl text-sm md:text-base leading-relaxed" :class="isDark ? 'text-gray-400' : 'text-secondary'">
          The fastest path to convert, compress, download, or explore FiGo tools.
        </p>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5 max-w-7xl mx-auto">
        <ToolCard
          v-for="(tool, idx) in coreTools"
          :key="tool.title"
          :icon="tool.icon"
          :title="tool.title"
          :description="tool.description"
          :action-label="tool.actionLabel"
          :icon-bg-class="isDark ? tool.iconBgDark : tool.iconBgClass"
          :icon-color-class="tool.iconColorClass"
          :delay="idx * 120"
          @action="handleToolAction(tool.title)"
        />
      </div>
    </section>

    <!-- Ecosystem Section -->
    <section class="py-16 md:py-20 px-6 md:px-8 max-w-7xl mx-auto border-t border-black/5 dark:border-white/5 relative overflow-hidden">
      <!-- Subtle Background Glow -->
      <div class="absolute -top-24 -right-24 w-96 h-96 bg-primary/5 rounded-full blur-[100px] pointer-events-none"></div>
      
      <div class="mb-10 relative z-10">
        <div class="inline-flex px-3 py-1 rounded-md text-[10px] font-black tracking-[0.18em] uppercase mb-4"
          :class="isDark ? 'bg-tertiary/15 text-tertiary border border-tertiary/20' : 'bg-slate-100 text-slate-500'"
        >
          Ecosystem Hub
        </div>
        <h2 class="text-3xl md:text-5xl font-headline font-black tracking-tight mb-4"
          :class="isDark ? 'text-white' : 'text-slate-900'"
        >
          More ways to use FiGo
        </h2>
        <p class="text-secondary max-w-2xl text-sm md:text-base leading-relaxed">Explore focused tools for planning, creative work, research, and everyday utilities.</p>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
        <div 
          v-for="tool in ecosystemTools" 
          :key="tool.title"
          @click="router.push(tool.route)"
          class="group relative p-6 rounded-2xl border border-black/[0.03] dark:border-white/[0.03] bg-white/40 dark:bg-slate-900/40 backdrop-blur-sm hover:bg-white dark:hover:bg-slate-900 transition-all duration-300 cursor-pointer hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1 overflow-hidden"
        >
          <!-- Hover Accent Gradient -->
          <div class="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

          <div class="w-12 h-12 rounded-lg mb-5 flex items-center justify-center text-2xl shadow-sm transition-transform duration-300 group-hover:scale-105" :class="tool.bg">
            <span class="material-symbols-outlined">{{ tool.icon }}</span>
          </div>
          <h3 class="font-headline font-black text-lg mb-2 transition-colors duration-300" :class="isDark ? 'text-white group-hover:text-primary' : 'text-slate-900 group-hover:text-primary'">{{ tool.title }}</h3>
          <p class="text-sm text-secondary leading-relaxed line-clamp-2 opacity-80">{{ tool.description }}</p>
          
          <div class="mt-5 flex items-center text-[10px] font-black uppercase tracking-[0.18em] text-primary transition-all duration-300">
            Open Module <span class="material-symbols-outlined text-sm ml-2">north_east</span>
          </div>
        </div>
      </div>

      <!-- Mini Utilities Grid -->
      <div class="mt-16 md:mt-20 relative z-10">
        <div class="flex flex-col md:flex-row md:items-end md:justify-between gap-3 mb-7">
          <div>
            <p class="text-[10px] font-black uppercase tracking-[0.2em] text-primary mb-2">Quick tools</p>
            <h3 class="font-headline text-xl md:text-2xl font-black" :class="isDark ? 'text-white' : 'text-slate-900'">Small tasks, done in seconds</h3>
          </div>
          <p class="text-sm text-secondary max-w-md">Useful utilities that run directly from your browser whenever you need them.</p>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 md:gap-4">
          <NuxtLink 
            v-for="tool in miniTools" 
            :key="tool.name"
            :to="tool.route"
            class="group min-h-[112px] p-4 rounded-2xl border border-black/[0.05] dark:border-white/[0.06] bg-white/50 dark:bg-white/[0.02] hover:bg-primary/5 dark:hover:bg-primary/10 hover:border-primary/25 hover:-translate-y-0.5 transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <div class="w-10 h-10 rounded-lg bg-white dark:bg-slate-800 flex items-center justify-center shadow-sm group-hover:shadow-md group-hover:scale-105 transition-all mb-3">
              <span class="material-symbols-outlined text-xl opacity-40 group-hover:text-primary group-hover:opacity-100 transition-all">{{ tool.icon }}</span>
            </div>
            <div class="flex items-center justify-between gap-2 mb-1">
              <span class="text-xs font-black tracking-tight group-hover:text-primary transition-colors">{{ tool.name }}</span>
              <span class="material-symbols-outlined text-sm text-primary opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all">arrow_forward</span>
            </div>
            <p class="text-[11px] leading-relaxed text-secondary">{{ tool.description }}</p>
          </NuxtLink>
        </div>
      </div>
    </section>
<!-- <HowItWorks /> -->
    <CtaSection />
  </div>
</template>

<script setup lang="ts">
useSeoMeta({
  title: 'FiGo — Free Online File Tools: Download Video, Compress, Convert',
  ogTitle: 'FiGo — Free Online Tools: Download TikTok, YouTube, Instagram Videos',
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
    icon: 'Book',
    title: 'Artikel',
    description: 'Arsip spiritual, tasawuf, dekonstruksi sejarah, dan kitab esoterik.',
    actionLabel: 'Read Now',
    iconBgClass: 'bg-indigo-50',
    iconBgDark: 'bg-indigo-500/15',
    iconColorClass: 'text-indigo-500',
    route: '/tools/artikel'
  },
  {
    icon: 'transform',
    title: 'Convert',
    description: 'Convert any file format without quality loss between any file format. From PNG to WEBP, MP4 to GIF, DOCX to PDF — with 99.9% quality retained.',
    actionLabel: 'Convert Now',
    iconBgClass: 'bg-blue-50',
    iconBgDark: 'bg-primary/15',
    iconColorClass: 'text-primary',
    route: '/convert',
  },
  {
    icon: 'layers',
    title: 'Compress',
    description: 'Advanced algorithms reducing file size by up to 80% without touching quality. Images, videos, PDFs, and archives.',
    actionLabel: 'Optimize Now',
    iconBgClass: 'bg-purple-50',
    iconBgDark: 'bg-tertiary/15',
    iconColorClass: 'text-tertiary',
    route: '/compress',
  },
  {
    icon: 'download',
    title: 'Download',
    description: 'Instant, high-bandwidth delivery from any URL. Paste a link and download the content directly — no accounts, no waiting.',
    actionLabel: 'Start Downloading',
    iconBgClass: 'bg-blue-50',
    iconBgDark: 'bg-primary/15',
    iconColorClass: 'text-primary',
    route: '/download',
  },
]

const ecosystemTools = [
  {
    icon: 'restaurant',
    title: 'The Global Recipes',
    description: 'Explore a curated collection of international high-fidelity recipes with real-time scaling.',
    route: '/recipes',
    bg: 'bg-orange-50 text-orange-500 dark:bg-orange-500/10 dark:text-orange-400',
  },
  {
    icon: 'nutrition',
    title: 'Nutrition Index',
    description: 'High-fidelity nutritional data registry for thousands of global products.',
    route: '/foods',
    bg: 'bg-green-50 text-green-500 dark:bg-green-500/10 dark:text-green-400',
  },
  {
    icon: 'calendar_month',
    title: 'Smart Calendar',
    description: 'Advanced scheduling and time management tool for high-productivity workflows.',
    route: '/kalender',
    bg: 'bg-blue-50 text-blue-500 dark:bg-blue-500/10 dark:text-blue-400',
  },
  {
    icon: 'photo_filter',
    title: 'Image Studio',
    description: 'Powerful, browser-based image editor for quick adjustments and filters.',
    route: '/editor',
    bg: 'bg-purple-50 text-purple-500 dark:bg-purple-500/10 dark:text-purple-400',
  },
]

const miniTools = [
  { name: 'Color Palette', description: 'Find matching colors.', icon: 'palette', route: '/tools/color-palette' },
  { name: 'Link Safety', description: 'Check a link before opening.', icon: 'shield_lock', route: '/tools/link-safety' },
  { name: 'File Metadata', description: 'Inspect hidden file details.', icon: 'analytics', route: '/tools/file-metadata' },
  { name: 'Secure Password', description: 'Create a stronger password.', icon: 'vpn_key', route: '/tools/secure-generator' },
  { name: 'QR Generator', description: 'Turn text or links into QR.', icon: 'qr_code_2', route: '/tools/qr-engine' },
]

function handleToolAction(toolName: string) {
  const tool = coreTools.find(t => t.title === toolName)
  if (tool) router.push(tool.route)
}
</script>

<style scoped>
/* Vite parser fix */
</style>

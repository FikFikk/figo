<template>
  <div>
    <HeroSection />
    <StatsCounter />

    <!-- Feature Bento Grid -->
    <section id="tools" class="py-20 md:py-32 px-6 md:px-8 max-w-7xl mx-auto">
      <div class="text-center mb-12 md:mb-16">
        <div class="inline-block px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase mb-6"
          :class="isDark ? 'bg-primary/15 text-primary' : 'bg-primary-fixed text-on-primary-fixed'"
        >
          Core Engine
        </div>
        <h2 class="text-3xl md:text-5xl font-headline font-extrabold tracking-tight"
          :class="isDark ? 'text-white' : 'text-slate-900'"
        >
          The Processing Suite
        </h2>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
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
    <section class="py-24 px-6 md:px-8 max-w-7xl mx-auto border-t border-black/5 dark:border-white/5 relative overflow-hidden">
      <!-- Subtle Background Glow -->
      <div class="absolute -top-24 -right-24 w-96 h-96 bg-primary/5 rounded-full blur-[100px] pointer-events-none"></div>
      
      <div class="mb-14 relative z-10">
        <div class="inline-block px-4 py-1.5 rounded-2xl text-[10px] font-black tracking-[0.2em] uppercase mb-5"
          :class="isDark ? 'bg-tertiary/15 text-tertiary border border-tertiary/20' : 'bg-slate-100 text-slate-500'"
        >
          Ecosystem Hub
        </div>
        <h2 class="text-3xl md:text-5xl font-headline font-black tracking-tight mb-4"
          :class="isDark ? 'text-white' : 'text-slate-900'"
        >
          Lifestyle & Creative
        </h2>
        <p class="text-secondary max-w-2xl text-base md:text-lg leading-relaxed">Sophisticated tools designed to integrate seamlessly into your daily high-performance workflow.</p>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
        <div 
          v-for="tool in ecosystemTools" 
          :key="tool.title"
          @click="router.push(tool.route)"
          class="group relative p-8 rounded-2xl border border-black/[0.03] dark:border-white/[0.03] bg-white/40 dark:bg-slate-900/40 backdrop-blur-sm hover:bg-white dark:hover:bg-slate-900 transition-all duration-500 cursor-pointer hover:shadow-2xl hover:shadow-primary/5 hover:-translate-y-2 overflow-hidden"
        >
          <!-- Hover Accent Gradient -->
          <div class="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

          <div class="w-14 h-14 rounded-md mb-6 flex items-center justify-center text-3xl shadow-sm transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3" :class="tool.bg">
            <span class="material-symbols-outlined">{{ tool.icon }}</span>
          </div>
          <h3 class="font-headline font-black text-xl mb-2 transition-colors duration-300" :class="isDark ? 'text-white group-hover:text-primary' : 'text-slate-900 group-hover:text-primary'">{{ tool.title }}</h3>
          <p class="text-sm text-secondary leading-relaxed line-clamp-2 opacity-80">{{ tool.description }}</p>
          
          <div class="mt-6 flex items-center text-[10px] font-black uppercase tracking-[0.2em] text-primary translate-x-[-10px] opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-500">
            Open Module <span class="material-symbols-outlined text-sm ml-2">north_east</span>
          </div>
        </div>
      </div>

      <!-- Mini Utilities Grid -->
      <div class="mt-20 relative z-10">
        <p class="text-center text-[10px] font-black uppercase tracking-[0.3em] opacity-30 mb-8">Integrated Utilities</p>
        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <NuxtLink 
            v-for="tool in miniTools" 
            :key="tool.name"
            :to="tool.route"
            class="flex items-center gap-4 p-5 rounded-2xl border border-black/[0.03] dark:border-white/[0.03] bg-black/[0.01] dark:bg-white/[0.01] hover:bg-primary/5 dark:hover:bg-primary/10 hover:border-primary/20 transition-all duration-300 group"
          >
            <div class="w-10 h-10 rounded-md bg-white dark:bg-slate-800 flex items-center justify-center shadow-sm group-hover:shadow-md group-hover:scale-110 transition-all">
              <span class="material-symbols-outlined text-xl opacity-40 group-hover:text-primary group-hover:opacity-100 transition-all">{{ tool.icon }}</span>
            </div>
            <span class="text-[11px] font-black uppercase tracking-widest opacity-50 group-hover:opacity-100 group-hover:text-primary transition-colors">{{ tool.name }}</span>
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
  title: 'FiGo — The Ethereal Engine',
  ogTitle: 'FiGo — The Ethereal Engine',
  description: 'High-performance file processing. Compress, convert, download via URL, check links, analyze files — one platform, zero limits.',
  ogDescription: 'Convert, compress, and download anything. No account. No fee. No nonsense.',
})

const { isDark } = useColorMode()
const router = useRouter()

const coreTools = [
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
  { name: 'Color Palette', icon: 'palette', route: '/tools/color-palette' },
  { name: 'Link Safety', icon: 'shield_lock', route: '/tools/link-safety' },
  { name: 'File Metadata', icon: 'analytics', route: '/tools/file-metadata' },
  { name: 'Secure Pass', icon: 'vpn_key', route: '/tools/secure-generator' },
  { name: 'QR Engine', icon: 'qr_code_2', route: '/tools/qr-engine' },
]

function handleToolAction(toolName: string) {
  const tool = coreTools.find(t => t.title === toolName)
  if (tool) router.push(tool.route)
}
</script>

<style scoped>
/* Vite parser fix */
</style>

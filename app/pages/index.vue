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

    <HowItWorks />
    <CtaSection />
  </div>
</template>

<script setup lang="ts">
useSeoMeta({
  title: 'FiGo — The Ethereal Engine',
  ogTitle: 'FiGo — The Ethereal Engine',
  description: 'High-performance file processing. Compress, convert, download via URL, check links, analyze files — one platform, zero limits.',
  ogDescription: 'High-performance file processing. One platform, zero limits.',
})

const { isDark } = useColorMode()
const router = useRouter()

const coreTools = [
  {
    icon: 'transform',
    title: 'Convert',
    description: 'Lossless multi-threaded translation between any file format. From PNG to WEBP, MP4 to GIF, DOCX to PDF — with 99.9% integrity.',
    actionLabel: 'Start Engine',
    iconBgClass: 'bg-blue-50',
    iconBgDark: 'bg-primary/15',
    iconColorClass: 'text-primary',
    route: '/convert',
  },
  {
    icon: 'layers',
    title: 'Compress',
    description: 'Advanced algorithms reducing payload size by up to 80% without touching quality. Images, videos, PDFs, and archives.',
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
    actionLabel: 'Access Edge',
    iconBgClass: 'bg-blue-50',
    iconBgDark: 'bg-primary/15',
    iconColorClass: 'text-primary',
    route: '/download',
  },
]

function handleToolAction(toolName: string) {
  const tool = coreTools.find(t => t.title === toolName)
  if (tool) router.push(tool.route)
}
</script>

<style scoped>
/* Vite parser fix */
</style>

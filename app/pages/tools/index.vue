<template>
  <div class="tools-catalog min-h-screen pt-24 pb-24 relative overflow-hidden" :class="isDark ? 'bg-[#0f1117]' : 'bg-slate-50'">
    <div aria-hidden="true" class="catalog-grid absolute inset-0 pointer-events-none opacity-40" :class="isDark ? 'catalog-grid-dark' : ''"></div>
    <div aria-hidden="true" class="absolute -top-40 right-[-10rem] w-[32rem] h-[32rem] rounded-full blur-[120px] pointer-events-none" :class="isDark ? 'bg-primary/10' : 'bg-primary/5'"></div>
    <main class="max-w-7xl mx-auto px-6 md:px-8">
      <header class="max-w-3xl mb-10 md:mb-14 relative">
        <p class="text-[10px] font-black uppercase tracking-[0.2em] text-primary mb-3">FiGo toolkit</p>
        <h1 class="text-4xl md:text-6xl font-headline font-black tracking-tight mb-4"
          :class="isDark ? 'text-white' : 'text-slate-900'"
        >Tools for the small things.</h1>
        <p class="text-base md:text-lg leading-relaxed" :class="isDark ? 'text-gray-400' : 'text-secondary'">
          Pick a tool, get something done, and move on. Everything runs in your browser.
        </p>
      </header>

      <div class="flex flex-col sm:flex-row gap-3 mb-8 md:mb-10">
        <label class="relative flex-1">
          <span class="sr-only">Search tools</span>
          <span class="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-xl opacity-50">search</span>
          <input
            v-model="query"
            type="search"
            placeholder="Search tools..."
            class="w-full min-h-12 pl-12 pr-4 rounded-2xl border bg-transparent text-sm outline-none focus:ring-2 focus:ring-primary"
            :class="isDark ? 'border-white/10 text-white placeholder:text-gray-600' : 'border-slate-200 text-slate-900 placeholder:text-slate-400 bg-white'"
          />
        </label>
        <NuxtLink to="/" class="min-h-12 px-5 rounded-2xl border flex items-center justify-center gap-2 text-sm font-bold transition-colors hover:bg-primary/10"
          :class="isDark ? 'border-white/10 text-gray-300' : 'border-slate-200 text-slate-700 bg-white'"
        >
          <span class="material-symbols-outlined text-lg">home</span>
          Back home
        </NuxtLink>
      </div>

      <section aria-labelledby="tool-grid-title">
        <div class="flex items-center justify-between mb-5">
          <h2 id="tool-grid-title" class="text-sm font-bold" :class="isDark ? 'text-gray-300' : 'text-slate-700'">
            {{ filteredTools.length }} tools available
          </h2>
          <span class="text-xs" :class="isDark ? 'text-gray-600' : 'text-slate-400'">Click any tool to open it</span>
        </div>

        <div v-if="filteredTools.length" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <NuxtLink
            v-for="tool in filteredTools"
            :key="tool.slug"
            :to="tool.external || `/tools/${tool.slug}`"
            class="tool-tile group min-h-[210px] p-6 rounded-2xl border transition-all duration-300 hover:-translate-y-1 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary active:translate-y-0"
            :class="isDark ? 'border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.06]' : 'border-slate-200 bg-white hover:border-primary/20'"
          >
            <svg aria-hidden="true" viewBox="0 0 360 180" preserveAspectRatio="none" class="card-wave absolute inset-x-0 bottom-0 z-0 w-full h-[205px] pointer-events-none">
              <g class="wave-layer" fill="none" :stroke="isDark ? 'rgba(0,255,136,0.52)' : 'rgba(0,88,190,0.3)'" stroke-width="0.8">
                <path v-for="y in 8" :key="`h-${y}`" class="wave-row" :d="wavePath(y)" :opacity="0.25 + y * 0.085" />
                <path v-for="x in 13" :key="`v-${x}`" class="wave-column" :d="verticalPath(x)" opacity="0.52" />
              </g>
            </svg>
            <div class="relative z-10 flex items-start justify-between gap-4 mb-6">
              <div class="tool-icon w-12 h-12 rounded-2xl flex items-center justify-center" :class="tool.color">
                <span class="material-symbols-outlined text-2xl">{{ tool.icon }}</span>
              </div>
              <span class="material-symbols-outlined text-lg opacity-30 group-hover:text-primary group-hover:opacity-100 transition-all">arrow_outward</span>
            </div>
            <h3 class="relative z-10 text-lg font-headline font-bold mb-2" :class="isDark ? 'text-white' : 'text-slate-900'">{{ tool.name }}</h3>
            <p class="relative z-10 text-sm leading-relaxed" :class="isDark ? 'text-gray-400' : 'text-secondary'">{{ tool.description }}</p>
            <div class="relative z-10 flex items-center gap-2 mt-4 text-[10px] font-bold uppercase tracking-[0.14em]" :class="isDark ? 'text-gray-600' : 'text-slate-400'">
              <span class="w-1.5 h-1.5 rounded-full bg-primary"></span>
              Browser tool
            </div>
          </NuxtLink>
        </div>

        <div v-else class="py-20 text-center rounded-2xl border border-dashed" :class="isDark ? 'border-white/10 text-gray-500' : 'border-slate-200 text-slate-500'">
          <span class="material-symbols-outlined text-4xl opacity-40 mb-3">search_off</span>
          <p class="font-bold">No tools found</p>
          <button class="mt-3 text-sm text-primary font-semibold" @click="query = ''">Clear search</button>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
const { isDark } = useColorMode()
const query = ref('')

function wavePath(row: number) {
  const progress = row / 8
  const y = 22 + Math.pow(progress, 1.45) * 154
  const amplitude = 3 + progress * 15
  return `M -10 ${y} C 45 ${y - amplitude}, 92 ${y + amplitude}, 145 ${y} S 238 ${y - amplitude}, 292 ${y} S 345 ${y + amplitude * 0.8}, 380 ${y - 2}`
}

function verticalPath(column: number) {
  const bottomX = column * 30
  const topX = 180 + (bottomX - 180) * 0.34
  const controlX = 180 + (bottomX - 180) * 0.68
  return `M ${topX} 20 C ${topX - 3} 58, ${controlX + 5} 112, ${bottomX} 180`
}

useSeoMeta({
  title: 'All Tools â€” FiGo',
  description: 'Browse FiGo browser-based tools for files, links, passwords, colors, QR codes, research, and more.',
})

const tools = [
  { slug: 'color-palette', name: 'Color Palette', description: 'Find matching colors and copy HEX, RGB, or HSL values.', icon: 'palette', color: 'bg-purple-100 text-purple-600 dark:bg-purple-500/15 dark:text-purple-300' },
  { slug: 'link-safety', name: 'Link Safety', description: 'Check a URL before opening it.', icon: 'shield_lock', color: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300' },
  { slug: 'file-metadata', name: 'File Metadata', description: 'Inspect file size, type, dimensions, and hidden details.', icon: 'analytics', color: 'bg-blue-100 text-blue-600 dark:bg-blue-500/15 dark:text-blue-300' },
  { slug: 'secure-generator', name: 'Secure Password', description: 'Generate strong passwords with the options you choose.', icon: 'vpn_key', color: 'bg-amber-100 text-amber-600 dark:bg-amber-500/15 dark:text-amber-300' },
  { slug: 'qr-engine', name: 'QR Generator', description: 'Turn links and text into a downloadable QR code.', icon: 'qr_code_2', color: 'bg-cyan-100 text-cyan-600 dark:bg-cyan-500/15 dark:text-cyan-300' },
  { slug: 'forex-research', name: 'Forex Research', description: 'Explore market signals and research context.', icon: 'monitoring', color: 'bg-rose-100 text-rose-600 dark:bg-rose-500/15 dark:text-rose-300' },
  { slug: 'calendar', name: 'Smart Calendar', description: 'Explore dates, calendars, and useful time tools.', icon: 'calendar_month', external: '/kalender', color: 'bg-sky-100 text-sky-600 dark:bg-sky-500/15 dark:text-sky-300' },
  { slug: 'editor', name: 'Image Studio', description: 'Make quick adjustments to images in your browser.', icon: 'photo_filter', external: '/editor', color: 'bg-fuchsia-100 text-fuchsia-600 dark:bg-fuchsia-500/15 dark:text-fuchsia-300' },
  { slug: 'recipes', name: 'Recipes', description: 'Browse recipes and scale ingredients for your needs.', icon: 'restaurant', external: '/recipes', color: 'bg-orange-100 text-orange-600 dark:bg-orange-500/15 dark:text-orange-300' },
  { slug: 'nutrition', name: 'Nutrition Facts', description: 'Look up nutritional information for everyday foods.', icon: 'nutrition', external: '/foods', color: 'bg-green-100 text-green-600 dark:bg-green-500/15 dark:text-green-300' },
]

const filteredTools = computed(() => {
  const normalized = query.value.trim().toLowerCase()
  if (!normalized) return tools
  return tools.filter(tool => `${tool.name} ${tool.description}`.toLowerCase().includes(normalized))
})
</script>

<style scoped>
.catalog-grid {
  background-image:
    linear-gradient(rgba(0, 88, 190, 0.045) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0, 88, 190, 0.045) 1px, transparent 1px);
  background-size: 42px 42px;
  mask-image: linear-gradient(to bottom, black, transparent 80%);
}

.catalog-grid-dark {
  background-image:
    linear-gradient(rgba(0, 255, 136, 0.06) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0, 255, 136, 0.06) 1px, transparent 1px);
}

.tool-tile {
  position: relative;
  isolation: isolate;
  overflow: hidden;
}

.tool-tile::after {
  content: '';
  position: absolute;
  inset: 0;
  z-index: -1;
  opacity: 0;
  background: radial-gradient(circle at 12% 5%, rgba(0, 88, 190, 0.14), transparent 42%);
  transition: opacity 300ms ease;
}

.tool-tile:hover::after,
.tool-tile:active::after {
  opacity: 1;
}

.tool-icon {
  transition: transform 300ms ease, box-shadow 300ms ease;
}

.card-wave {
  opacity: 0;
  transform: perspective(420px) rotateX(58deg) translateY(34px) scale(1.08);
  transform-origin: center bottom;
  transition: opacity 250ms ease;
  filter: drop-shadow(0 8px 10px rgba(0, 255, 136, 0.12));
}

.tool-tile:hover .card-wave,
.tool-tile:focus-visible .card-wave,
.tool-tile:active .card-wave {
  opacity: 0.88;
  animation: mesh-camera 5.2s cubic-bezier(0.45, 0, 0.55, 1) infinite alternate;
}

.wave-layer {
  transform-origin: center;
}

.tool-tile:hover .wave-layer,
.tool-tile:focus-visible .wave-layer,
.tool-tile:active .wave-layer {
  animation: surface-drift 4.6s cubic-bezier(0.45, 0, 0.55, 1) infinite alternate;
}

@keyframes surface-drift {
  0% { transform: translate3d(-7px, 4px, 0) scaleX(1.015) scaleY(0.98); }
  50% { transform: translate3d(2px, -5px, 0) scaleX(1.035) scaleY(1.025); }
  100% { transform: translate3d(8px, 1px, 0) scaleX(1.01) scaleY(0.99); }
}

@keyframes mesh-camera {
  0% { transform: perspective(420px) rotateX(59deg) rotateZ(-1.2deg) translateY(38px) scale(1.08); }
  50% { transform: perspective(420px) rotateX(55deg) rotateZ(0.6deg) translateY(25px) scale(1.1); }
  100% { transform: perspective(420px) rotateX(57deg) rotateZ(-0.4deg) translateY(14px) scale(1.09); }
}

.wave-row,
.wave-column {
  transform-box: fill-box;
  transform-origin: center;
}

.tool-tile:hover .tool-icon,
.tool-tile:active .tool-icon {
  transform: scale(1.08) rotate(-3deg);
  box-shadow: 0 0 0 6px rgba(0, 88, 190, 0.08), 0 10px 24px rgba(0, 88, 190, 0.14);
}

@media (prefers-reduced-motion: reduce) {
  .tool-tile,
  .tool-icon,
  .card-wave,
  .wave-layer,
  .wave-row,
  .wave-column { transition: none; animation: none; }
}
</style>

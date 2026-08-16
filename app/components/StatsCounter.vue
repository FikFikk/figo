<template>
  <section id="stats" class="relative overflow-hidden text-white"
    :class="isDark ? 'bg-[#080a10]' : 'bg-slate-900'"
  >
    <div class="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(0,88,190,0.18),transparent_35%)] pointer-events-none"></div>

    <div class="relative max-w-7xl mx-auto px-6 md:px-8 py-10 md:py-12 grid grid-cols-1 md:grid-cols-[1fr_1px_1fr_1px_1.2fr] items-center gap-7 md:gap-10">
      <div class="text-center md:text-left">
        <div class="flex items-center justify-center md:justify-start gap-2 text-primary-fixed-dim text-[11px] font-bold tracking-[0.16em] uppercase mb-2">
          <span class="material-symbols-outlined text-base">apps</span>
          Ready to explore
        </div>
        <div class="text-4xl md:text-5xl font-headline font-black tracking-tight">12+ tools</div>
        <p class="text-sm text-slate-400 mt-2">For files, research, planning, and creative work.</p>
      </div>

      <div class="hidden md:block h-16 w-px bg-white/10"></div>

      <div class="text-center md:text-left">
        <div class="flex items-center justify-center md:justify-start gap-2 text-primary-fixed-dim text-[11px] font-bold tracking-[0.16em] uppercase mb-2">
          <span class="material-symbols-outlined text-base">lock_open</span>
          Easy access
        </div>
        <div class="text-4xl md:text-5xl font-headline font-black tracking-tight">Free to use</div>
        <p class="text-sm text-slate-400 mt-2">Open a tool and start—no account required.</p>
      </div>

      <div class="hidden md:block h-16 w-px bg-white/10"></div>

      <div class="text-center md:text-left md:pl-2">
        <p class="text-sm text-slate-300 mb-4">Not sure where to begin? Let FiGo pick something for you.</p>
        <button
          class="min-h-11 px-5 py-3 bg-primary text-on-primary rounded-2xl font-headline text-sm font-bold hover:bg-primary-container hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/25 transition-all active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
          @click="openRandomTool"
        >
          <span class="flex items-center justify-center gap-2">
            <span class="material-symbols-outlined text-lg">casino</span>
            Surprise me
          </span>
        </button>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
const { isDark } = useColorMode()
const router = useRouter()

const playfulRoutes = [
  '/convert',
  '/compress',
  '/download',
  '/tools/color-palette',
  '/tools/qr-engine',
  '/tools/secure-generator',
  '/kalender',
  '/recipes',
]

function openRandomTool() {
  const route = playfulRoutes[Math.floor(Math.random() * playfulRoutes.length)]
  if (route) router.push(route)
}
</script>

<style scoped>
/* Component-specific styles are expressed with utility classes. */
</style>

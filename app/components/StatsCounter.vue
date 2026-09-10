<template>
  <section id="stats" class="border-y border-neutral-200 dark:border-neutral-800 transition-colors duration-300"
    :class="isDark ? 'bg-neutral-950 text-white' : 'bg-neutral-50 text-neutral-900'"
  >
    <div class="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
      <div class="grid grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-neutral-200 dark:divide-neutral-800 font-mono">
        <!-- Metric 01 -->
        <div class="p-6 md:p-8 flex flex-col justify-between">
          <div class="text-[10px] text-neutral-400 dark:text-neutral-500 uppercase tracking-widest mb-3">
            METRIC // 01
          </div>
          <div>
            <div class="text-3xl md:text-5xl font-black font-headline tracking-tight">12+</div>
            <div class="text-xs uppercase tracking-wider font-bold mt-1" :class="isDark ? 'text-neutral-300' : 'text-neutral-700'">
              Active Tools
            </div>
            <p class="text-[11px] text-neutral-500 mt-1 font-sans">Files, research, planning &amp; utilities.</p>
          </div>
        </div>

        <!-- Metric 02 -->
        <div class="p-6 md:p-8 flex flex-col justify-between">
          <div class="text-[10px] text-neutral-400 dark:text-neutral-500 uppercase tracking-widest mb-3">
            METRIC // 02
          </div>
          <div>
            <div class="text-3xl md:text-5xl font-black font-headline tracking-tight text-primary">100%</div>
            <div class="text-xs uppercase tracking-wider font-bold mt-1" :class="isDark ? 'text-neutral-300' : 'text-neutral-700'">
              Free Forever
            </div>
            <p class="text-[11px] text-neutral-500 mt-1 font-sans">No fees, paywalls, or hidden tiers.</p>
          </div>
        </div>

        <!-- Metric 03 -->
        <div class="p-6 md:p-8 flex flex-col justify-between">
          <div class="text-[10px] text-neutral-400 dark:text-neutral-500 uppercase tracking-widest mb-3">
            METRIC // 03
          </div>
          <div>
            <div class="text-3xl md:text-5xl font-black font-headline tracking-tight">0.0<span class="text-xs text-neutral-400">s</span></div>
            <div class="text-xs uppercase tracking-wider font-bold mt-1" :class="isDark ? 'text-neutral-300' : 'text-neutral-700'">
              Auth Overhead
            </div>
            <p class="text-[11px] text-neutral-500 mt-1 font-sans">Direct browser execution without login.</p>
          </div>
        </div>

        <!-- Metric 04: Interactive Randomizer -->
        <div class="p-6 md:p-8 flex flex-col justify-between col-span-2 sm:col-span-1">
          <div class="text-[10px] text-neutral-400 dark:text-neutral-500 uppercase tracking-widest mb-3">
            ROUTER // 04
          </div>
          <div>
            <button
              @click="openRandomTool"
              class="w-full p-3 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 hover:border-primary dark:hover:border-primary hover:text-primary transition-all flex items-center justify-between group text-left shadow-sm active:scale-98"
            >
              <div>
                <div class="text-[10px] uppercase font-bold text-neutral-400">Quick Discovery</div>
                <div class="text-sm font-bold font-headline mt-0.5" :class="isDark ? 'text-white' : 'text-neutral-900'">Surprise Me</div>
              </div>
              <span class="material-symbols-outlined text-xl group-hover:rotate-45 transition-transform text-primary">casino</span>
            </button>
            <p class="text-[11px] text-neutral-500 mt-2 font-sans">Launch an instant tool at random.</p>
          </div>
        </div>
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
  '/articles',
]

function openRandomTool() {
  const route = playfulRoutes[Math.floor(Math.random() * playfulRoutes.length)]
  if (route) router.push(route)
}
</script>

<style scoped>
/* Clean Swiss Styling */
</style>

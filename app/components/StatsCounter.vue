<template>
  <section id="stats" class="py-12 md:py-16 text-white relative overflow-hidden"
    :class="isDark ? 'bg-[#080a10]' : 'bg-slate-900'"
  >
    <div class="max-w-7xl mx-auto px-6 md:px-8 flex flex-col md:flex-row justify-around items-center gap-8 md:gap-12">
      <!-- Total Tasks -->
      <div class="text-center group">
        <div class="text-primary text-xs md:text-sm font-bold tracking-[0.2em] uppercase mb-2">Total Tasks Processed</div>
        <div class="text-5xl md:text-7xl font-headline font-black tabular-nums tracking-tighter">
          {{ formattedCount }}
        </div>
      </div>

      <div class="h-px w-full md:h-16 md:w-px bg-white/10"></div>

      <!-- Average Latency -->
      <div class="text-center group">
        <div class="text-primary text-xs md:text-sm font-bold tracking-[0.2em] uppercase mb-2">Average Latency</div>
        <div class="text-5xl md:text-7xl font-headline font-black tracking-tighter">
          12<span class="text-primary-fixed-dim text-3xl md:text-4xl ml-2">ms</span>
        </div>
      </div>

      <div class="h-px w-full md:h-16 md:w-px bg-white/10"></div>

      <!-- Simulate -->
      <div class="text-center">
        <div class="text-primary text-xs md:text-sm font-bold tracking-[0.2em] uppercase mb-3">Live Engine</div>
        <button
          class="px-6 py-3 bg-primary text-on-primary rounded-full font-headline text-sm font-semibold hover:scale-105 hover:shadow-lg hover:shadow-primary/30 transition-all active:scale-95"
          @click="simulateAction"
        >
          <span class="flex items-center gap-2">
            <span class="material-symbols-outlined text-lg">bolt</span>
            Simulate Task
          </span>
        </button>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
const { isDark } = useColorMode()
const { formattedCount, increment } = useHistoryCounter()

function simulateAction() {
  const amount = Math.floor(Math.random() * 5) + 1
  increment(amount)
}
</script>

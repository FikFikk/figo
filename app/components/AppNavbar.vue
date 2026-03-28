<template>
  <nav class="fixed top-0 w-full z-50 backdrop-blur-xl shadow-[0_4px_20px_rgba(0,0,0,0.04)] transition-colors duration-300"
    :class="isDark ? 'bg-[#0f1117]/80 border-b border-white/5' : 'bg-white/70'"
  >
    <div class="flex justify-between items-center px-6 md:px-8 py-4 max-w-7xl mx-auto">
      <!-- Logo -->
      <NuxtLink to="/" class="text-xl font-bold tracking-tighter font-headline"
        :class="isDark ? 'text-white' : 'text-slate-900'"
      >
        Fi<span class="text-primary">Go</span>
      </NuxtLink>

      <!-- Desktop Nav -->
      <div class="hidden md:flex items-center space-x-1">
        <NuxtLink
          v-for="link in navLinks"
          :key="link.to"
          :to="link.to"
          class="px-4 py-2 rounded-2xl font-headline text-sm font-medium tracking-tight transition-all duration-300"
          :class="isActive(link.to)
            ? (isDark ? 'bg-primary/15 text-primary' : 'bg-primary/10 text-primary')
            : (isDark ? 'text-gray-400 hover:text-white hover:bg-white/5' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50')"
        >
          {{ link.label }}
        </NuxtLink>
      </div>

      <!-- CTA + Theme Toggle + Hamburger -->
      <div class="flex items-center gap-3">
        <!-- Dark/Light toggle (Always in Top Header) -->
        <button
          class="w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95"
          :class="isDark ? 'bg-white/10 text-yellow-400 hover:bg-white/15' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'"
          @click="toggle"
          :aria-label="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
        >
          <span class="material-symbols-outlined text-xl">{{ isDark ? 'light_mode' : 'dark_mode' }}</span>
        </button>

        <!-- Get Started -->
        <NuxtLink
          to="/tools"
          class="px-6 py-2.5 rounded-2xl font-headline text-sm font-semibold hover:scale-102 transition-all ease-out active:scale-95 hidden md:block shadow-lg"
          :class="isDark
            ? 'bg-gradient-to-r from-primary to-[#4d8ef7] text-white shadow-primary/30 hover:shadow-primary/50'
            : 'bg-primary text-on-primary shadow-primary/20 hover:shadow-primary/40'"
        >
          Get Started
        </NuxtLink>

      </div>
    </div>
  </nav>

  <!-- Mobile Bottom Navigation -->
  <nav class="md:hidden fixed bottom-0 left-0 w-full z-[60] border-t backdrop-blur-3xl transition-colors duration-300 pb-safe px-4"
    :class="isDark ? 'bg-[#0f1117]/80 border-white/5' : 'bg-white/80 border-slate-100'"
  >
    <div class="flex justify-around items-center py-3">
      <NuxtLink
        v-for="link in navLinks"
        :key="link.to"
        :to="link.to"
        class="flex flex-col items-center justify-center min-w-[64px] h-12 rounded-2xl transition-all"
        :class="isActive(link.to) 
          ? 'text-primary' 
          : (isDark ? 'text-gray-500 hover:text-gray-300' : 'text-slate-500 hover:text-slate-800')"
      >
        <span class="material-symbols-outlined text-[24px] mb-1" 
          :class="isActive(link.to) ? '!font-bold' : ''"
        >
          {{ link.icon }}
        </span>
        <span class="text-[10px] font-headline font-bold tracking-tight">{{ link.label }}</span>
      </NuxtLink>
    </div>
  </nav>
</template>

<script setup lang="ts">
const { isDark, toggle } = useColorMode()
const route = useRoute()

const navLinks = [
  { to: '/convert', label: 'Convert', icon: 'transform' },
  { to: '/compress', label: 'Compress', icon: 'layers' },
  { to: '/download', label: 'Download', icon: 'download' },
  { to: '/tools', label: 'Tools', icon: 'build' },
  { to: '/saham', label: 'Saham', icon: 'candlestick_chart' },
]

function isActive(path: string): boolean {
  return route.path === path
}
</script>

<style scoped>
/* fix */
</style>


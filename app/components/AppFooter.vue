<template>
  <!-- Sleek Minimalist Footer with Safe Mobile Dock Padding -->
  <footer class="w-full border-t transition-colors duration-200 pb-28 md:pb-12 pt-12 mt-12"
    :class="isDark ? 'border-white/[0.08] bg-[#08090d]/80 text-slate-400' : 'border-slate-200 bg-white/80 text-slate-600'"
  >
    <div class="max-w-6xl mx-auto px-4 sm:px-6 md:px-8">
      
      <!-- Top Section: Brand + Support Pill -->
      <div class="flex flex-col md:flex-row items-center justify-between gap-6 pb-8 border-b"
        :class="isDark ? 'border-white/[0.06]' : 'border-slate-100'"
      >
        <!-- Brand -->
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm bg-gradient-to-br from-primary to-blue-600 text-white shadow-md shadow-primary/20">
            F
          </div>
          <div>
            <div class="flex items-center gap-2">
              <span class="font-headline font-black text-base tracking-tight" :class="isDark ? 'text-white' : 'text-slate-900'">
                Fi<span class="text-primary">Go</span> Engine
              </span>
              <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            </div>
            <p class="text-xs opacity-65 font-sans">
              High-precision utilities &amp; quantitative stock suite.
            </p>
          </div>
        </div>

        <!-- Quick Links Pills -->
        <div class="flex flex-wrap items-center justify-center gap-2 text-xs font-medium">
          <NuxtLink to="/stocks" class="px-3 py-1.5 rounded-xl border transition-all hover:text-primary"
            :class="isDark ? 'bg-white/[0.03] border-white/[0.08] hover:bg-white/[0.08] text-slate-300' : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700'"
          >
            Stocks Quant
          </NuxtLink>
          <NuxtLink to="/tradingplan" class="px-3 py-1.5 rounded-xl border transition-all hover:text-primary"
            :class="isDark ? 'bg-white/[0.03] border-white/[0.08] hover:bg-white/[0.08] text-slate-300' : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700'"
          >
            Trading Plan
          </NuxtLink>
          <NuxtLink to="/download" class="px-3 py-1.5 rounded-xl border transition-all hover:text-primary"
            :class="isDark ? 'bg-white/[0.03] border-white/[0.08] hover:bg-white/[0.08] text-slate-300' : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700'"
          >
            Downloader
          </NuxtLink>
          <NuxtLink to="/convert" class="px-3 py-1.5 rounded-xl border transition-all hover:text-primary"
            :class="isDark ? 'bg-white/[0.03] border-white/[0.08] hover:bg-white/[0.08] text-slate-300' : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700'"
          >
            Converter
          </NuxtLink>
          <NuxtLink to="/compress" class="px-3 py-1.5 rounded-xl border transition-all hover:text-primary"
            :class="isDark ? 'bg-white/[0.03] border-white/[0.08] hover:bg-white/[0.08] text-slate-300' : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700'"
          >
            Compressor
          </NuxtLink>
        </div>

        <!-- Support CTA -->
        <button @click="openSupport"
          class="px-4 py-2 text-xs font-semibold rounded-xl border transition-all flex items-center gap-2 cursor-pointer shadow-xs"
          :class="isDark ? 'bg-white/[0.05] border-white/[0.12] text-white hover:bg-white/[0.1]' : 'bg-slate-900 border-slate-800 text-white hover:bg-slate-800'"
        >
          <span class="material-symbols-outlined text-sm text-rose-400 fill-current animate-pulse">favorite</span>
          <span>Dukung FiGo</span>
        </button>
      </div>

      <!-- Bottom Meta -->
      <div class="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs opacity-65">
        <p>© {{ currentYear }} FiGo. Crafted with precision.</p>
        <div class="flex items-center gap-4">
          <a href="https://fikfikk.my.id/" target="_blank" rel="noopener noreferrer" class="hover:text-primary transition-colors flex items-center gap-1 font-mono text-[11px]">
            <span>Creator: fikfikk.my.id</span>
            <span class="material-symbols-outlined text-xs">open_in_new</span>
          </a>
          <span>•</span>
          <span class="font-mono text-[11px]">Jakarta, ID</span>
        </div>
      </div>

    </div>
  </footer>
</template>

<script setup lang="ts">
const { isDark } = useColorMode()
const currentYear = new Date().getFullYear()
const { open: openSupport } = useSupportModal()
</script>

<style scoped>
/* Scoped footer */
</style>

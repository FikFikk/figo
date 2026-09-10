<template>
  <!-- Linear / Vercel Minimalist Footer -->
  <footer class="w-full border-t transition-colors duration-200"
    :class="isDark ? 'border-white/[0.08] bg-[#08090d] text-slate-400' : 'border-slate-200/80 bg-white text-slate-600'"
  >
    <div class="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-10">
      <!-- Main Columns -->
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 pb-8 border-b"
        :class="isDark ? 'border-white/[0.06]' : 'border-slate-100'"
      >
        <!-- Col 1: Brand -->
        <div class="space-y-3">
          <div class="flex items-center gap-2">
            <div class="w-6 h-6 rounded-md flex items-center justify-center font-bold text-xs bg-primary text-white shadow-xs">
              F
            </div>
            <span class="font-headline font-black text-sm tracking-tight" :class="isDark ? 'text-white' : 'text-slate-900'">
              FiGo Engine
            </span>
          </div>
          <p class="text-xs leading-relaxed opacity-70 max-w-[240px]">
            High-precision utility toolkit, quantitative stock intelligence &amp; media streaming workspace.
          </p>
          <div class="inline-flex items-center gap-2 px-2.5 py-1 rounded-full border text-[10px] font-medium"
            :class="isDark ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-emerald-50 text-emerald-600 border-emerald-200'"
          >
            <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>All systems normal</span>
          </div>
        </div>

        <!-- Col 2: Core Tools -->
        <div>
          <h5 class="text-xs font-bold tracking-tight mb-3" :class="isDark ? 'text-white' : 'text-slate-900'">
            Core Tools
          </h5>
          <ul class="space-y-2 text-xs">
            <li><NuxtLink to="/stocks" class="hover:text-primary transition-colors">Stocks Quant &amp; Chart</NuxtLink></li>
            <li><NuxtLink to="/tradingplan" class="hover:text-primary transition-colors">Smart Trading Plan</NuxtLink></li>
            <li><NuxtLink to="/convert" class="hover:text-primary transition-colors">File Converter</NuxtLink></li>
            <li><NuxtLink to="/compress" class="hover:text-primary transition-colors">File Compressor</NuxtLink></li>
            <li><NuxtLink to="/download" class="hover:text-primary transition-colors">Media Downloader</NuxtLink></li>
          </ul>
        </div>

        <!-- Col 3: Ecosystem -->
        <div>
          <h5 class="text-xs font-bold tracking-tight mb-3" :class="isDark ? 'text-white' : 'text-slate-900'">
            Ecosystem
          </h5>
          <ul class="space-y-2 text-xs">
            <li><NuxtLink to="/tools" class="hover:text-primary transition-colors">All Utilities</NuxtLink></li>
            <li><NuxtLink to="/bioskop" class="hover:text-primary transition-colors">Bioskop Stream Player</NuxtLink></li>
            <li><NuxtLink to="/kalender" class="hover:text-primary transition-colors">Kalender Indonesia</NuxtLink></li>
            <li><a href="https://fikfikk.my.id/" target="_blank" rel="noopener noreferrer" class="hover:text-primary transition-colors">Creator Portfolio ↗</a></li>
          </ul>
        </div>

        <!-- Col 4: Support -->
        <div>
          <h5 class="text-xs font-bold tracking-tight mb-3" :class="isDark ? 'text-white' : 'text-slate-900'">
            Support &amp; Community
          </h5>
          <p class="text-xs leading-relaxed opacity-70 mb-3">
            Bantu ketersediaan server &amp; API publik gratis tanpa batas.
          </p>
          <button @click="openSupport"
            class="px-3.5 py-1.5 text-xs font-semibold rounded-lg border transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
            :class="isDark ? 'bg-white/[0.04] border-white/[0.1] text-white hover:bg-white/[0.08]' : 'bg-white border-slate-200 text-slate-800 hover:bg-slate-50'"
          >
            <span class="material-symbols-outlined text-xs text-rose-500 fill-current">favorite</span>
            <span>Dukung FiGo</span>
          </button>
        </div>
      </div>

      <!-- Bottom Bar -->
      <div class="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs opacity-60">
        <p>© {{ currentYear }} FiGo. Crafted with high precision.</p>
        <p class="font-mono text-[10px]">Jakarta / Indonesia</p>
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

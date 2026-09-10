<template>
  <!-- Swiss Modular Layout Footer -->
  <footer class="w-full border-t font-mono transition-colors duration-200"
    :class="isDark ? 'border-neutral-800 bg-[#090b10] text-neutral-400' : 'border-neutral-200 bg-white text-neutral-600'"
  >
    <div class="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-8 sm:py-10">
      <!-- Top Grid: Brand, Status, Navigation Links -->
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 pb-8 border-b"
        :class="isDark ? 'border-neutral-800/80' : 'border-neutral-200'"
      >
        <!-- Col 1: Brand Info -->
        <div class="space-y-2">
          <div class="flex items-center gap-2">
            <span class="px-2 py-0.5 text-xs font-black uppercase tracking-widest border"
              :class="isDark ? 'bg-white text-neutral-950 border-white' : 'bg-neutral-950 text-white border-neutral-950'"
            >
              FIGO
            </span>
            <span class="text-[10px] font-bold tracking-wider opacity-60">
              // SUITE
            </span>
          </div>
          <p class="text-xs font-sans opacity-70 leading-relaxed max-w-[240px]">
            High-precision utility toolkit, stock quant engine, and media streaming workspace.
          </p>
          <div class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-xs border text-[9px] font-bold"
            :class="isDark ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-emerald-50 text-emerald-600 border-emerald-300'"
          >
            <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>SYSTEMS OPERATIONAL</span>
          </div>
        </div>

        <!-- Col 2: Navigation Ledger -->
        <div>
          <h5 class="text-[10px] font-black uppercase tracking-widest mb-3" :class="isDark ? 'text-white' : 'text-neutral-900'">
            // CORE TOOLS
          </h5>
          <ul class="space-y-1.5 text-xs">
            <li><NuxtLink to="/stocks" class="hover:text-emerald-500 transition-colors">[ STOCKS QUANT ]</NuxtLink></li>
            <li><NuxtLink to="/tradingplan" class="hover:text-emerald-500 transition-colors">[ TRADING PLAN ]</NuxtLink></li>
            <li><NuxtLink to="/convert" class="hover:text-emerald-500 transition-colors">[ MEDIA CONVERT ]</NuxtLink></li>
            <li><NuxtLink to="/compress" class="hover:text-emerald-500 transition-colors">[ COMPRESSOR ]</NuxtLink></li>
            <li><NuxtLink to="/download" class="hover:text-emerald-500 transition-colors">[ DOWNLOADER ]</NuxtLink></li>
          </ul>
        </div>

        <!-- Col 3: Resources -->
        <div>
          <h5 class="text-[10px] font-black uppercase tracking-widest mb-3" :class="isDark ? 'text-white' : 'text-neutral-900'">
            // ECOSYSTEM
          </h5>
          <ul class="space-y-1.5 text-xs">
            <li><NuxtLink to="/tools" class="hover:text-emerald-500 transition-colors">[ ALL UTILITIES ]</NuxtLink></li>
            <li><NuxtLink to="/bioskop" class="hover:text-emerald-500 transition-colors">[ BIOSKOP PLAYER ]</NuxtLink></li>
            <li><NuxtLink to="/kalender" class="hover:text-emerald-500 transition-colors">[ KALENDER INDO ]</NuxtLink></li>
            <li><a href="https://fikfikk.my.id/" target="_blank" rel="noopener noreferrer" class="hover:text-emerald-500 transition-colors">[ PORTFOLIO ]</a></li>
          </ul>
        </div>

        <!-- Col 4: Support & Ledger -->
        <div>
          <h5 class="text-[10px] font-black uppercase tracking-widest mb-3" :class="isDark ? 'text-white' : 'text-neutral-900'">
            // CONTRIBUTIONS
          </h5>
          <p class="text-xs font-sans opacity-70 mb-3">
            Dukung server &amp; pemeliharaan API publik tanpa batas.
          </p>
          <button @click="openSupport"
            class="px-3 py-1.5 text-xs font-bold uppercase tracking-wider border rounded-xs transition-all flex items-center gap-1.5 cursor-pointer"
            :class="isDark ? 'bg-neutral-900 border-neutral-700 text-white hover:bg-white hover:text-black' : 'bg-neutral-100 border-neutral-300 text-neutral-900 hover:bg-black hover:text-white'"
          >
            <span class="material-symbols-outlined text-xs text-red-500">favorite</span>
            <span>SUPPORT CREATOR</span>
          </button>
        </div>
      </div>

      <!-- Bottom Bar -->
      <div class="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-[10px] opacity-70">
        <p>© {{ currentYear }} FIGO // PRECISION QUANT SUITE. ALL RIGHTS RESERVED.</p>
        <p class="tracking-widest uppercase">LATENCY: LOW // JKT-ID</p>
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
/* Scoped Swiss Layout */
</style>

<template>
  <!-- Footer minimalis tipografi murni bergaya Geist tanpa card button -->
  <footer class="w-full border-t transition-colors duration-200 pb-28 md:pb-10 pt-10 mt-16"
    :class="isDark ? 'border-white/[0.08] bg-[#08090d]/90 text-neutral-400' : 'border-neutral-200 bg-white/90 text-neutral-600'"
  >
    <div class="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
      
      <!-- Baris atas: Identitas brand di kiri, tautan teks murni di kanan -->
      <div class="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-8 border-b"
        :class="isDark ? 'border-white/[0.08]' : 'border-neutral-100'"
      >
        <!-- Identitas brand -->
        <div class="flex flex-col items-start gap-1">
          <div class="flex items-center gap-2">
            <span class="font-headline font-bold text-base tracking-tight" :class="isDark ? 'text-white' : 'text-neutral-900'">
              Fi<span class="text-primary">Go</span> Engine
            </span>
            <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          </div>
          <p class="text-xs text-neutral-500 font-sans max-w-sm">
            High-precision utilities &amp; quantitative stock suite.
          </p>
        </div>

        <!-- Tautan navigasi teks murni (tanpa kotak / card button) -->
        <nav class="flex flex-wrap items-center gap-x-6 gap-y-3 text-xs">
          <NuxtLink to="/stocks" class="transition-colors hover:text-primary"
            :class="isDark ? 'text-neutral-400 hover:text-white' : 'text-neutral-600 hover:text-neutral-900'"
          >
            Stocks Quant
          </NuxtLink>
          <NuxtLink to="/tradingplan" class="transition-colors hover:text-primary"
            :class="isDark ? 'text-neutral-400 hover:text-white' : 'text-neutral-600 hover:text-neutral-900'"
          >
            Trading Plan
          </NuxtLink>
          <NuxtLink to="/download" class="transition-colors hover:text-primary"
            :class="isDark ? 'text-neutral-400 hover:text-white' : 'text-neutral-600 hover:text-neutral-900'"
          >
            Downloader
          </NuxtLink>
          <NuxtLink to="/convert" class="transition-colors hover:text-primary"
            :class="isDark ? 'text-neutral-400 hover:text-white' : 'text-neutral-600 hover:text-neutral-900'"
          >
            Converter
          </NuxtLink>
          <NuxtLink to="/compress" class="transition-colors hover:text-primary"
            :class="isDark ? 'text-neutral-400 hover:text-white' : 'text-neutral-600 hover:text-neutral-900'"
          >
            Compressor
          </NuxtLink>
          <button @click="openSupport"
            class="transition-colors flex items-center gap-1.5 cursor-pointer font-medium"
            :class="isDark ? 'text-neutral-300 hover:text-rose-400' : 'text-neutral-700 hover:text-rose-600'"
          >
            <span class="material-symbols-outlined text-[14px] text-rose-500 fill-current">favorite</span>
            <span>Dukung FiGo</span>
          </button>
        </nav>
      </div>

      <!-- Baris bawah: Metadata hak cipta dan lokasi -->
      <div class="pt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-neutral-500">
        <p class="font-sans">© {{ currentYear }} FiGo. Crafted with precision.</p>
        <div class="flex items-center gap-3 font-mono text-[11px]">
          <a href="https://fikfikk.my.id/" target="_blank" rel="noopener noreferrer" class="hover:text-primary transition-colors flex items-center gap-1">
            <span>Creator: fikfikk.my.id</span>
            <span class="material-symbols-outlined text-[13px]">north_east</span>
          </a>
          <span class="opacity-40">•</span>
          <span>Surabaya, ID</span>
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
/* Gaya CSS footer terisolasi */
</style>

<template>
  <section class="space-y-3" aria-label="Filter koleksi artikel">
    <!-- Baris 1: Kolom Pencarian Penuh yang Ramping -->
    <div class="relative block">
      <span class="sr-only">Cari artikel</span>
      <svg class="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
        <circle cx="11" cy="11" r="6" />
        <path d="m16 16 4 4" />
      </svg>
      <input
        :value="searchQuery"
        type="search"
        aria-label="Cari artikel"
        placeholder="Cari judul, tokoh, atau tema…"
        class="h-10 sm:h-11 w-full rounded-2xl border border-slate-200/90 bg-white py-2 pl-10 pr-10 text-xs sm:text-sm text-slate-900 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 dark:border-white/[0.08] dark:bg-slate-900/60 dark:text-slate-100 placeholder:text-slate-400"
        @input="emit('update:searchQuery', ($event.target as HTMLInputElement).value)"
      >
      <button
        v-if="searchQuery"
        type="button"
        class="absolute right-1 top-1/2 grid size-9 -translate-y-1/2 place-items-center rounded-2xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-slate-100"
        aria-label="Hapus pencarian"
        @click="emit('update:searchQuery', '')"
      >
        <svg class="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18" /></svg>
      </button>
    </div>

    <!-- Baris 2: Kategori Horizontal Chips (1 Baris Rapi, Swipeable) -->
    <div class="flex items-center gap-1.5 overflow-x-auto pb-0.5 -mx-4 px-4 sm:mx-0 sm:px-0 no-scrollbar" aria-label="Kategori artikel">
      <button
        v-for="category in categories"
        :key="category"
        type="button"
        :aria-pressed="selectedCategory === category"
        class="h-8 sm:h-9 rounded-full border px-3 sm:px-3.5 text-xs font-medium transition shrink-0 whitespace-nowrap focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600"
        :class="selectedCategory === category
          ? 'border-emerald-600 bg-emerald-600 text-white shadow-sm dark:border-emerald-500 dark:bg-emerald-500 dark:text-slate-950 font-semibold'
          : 'border-slate-200/80 bg-white/80 text-slate-600 hover:border-emerald-600 hover:text-emerald-700 dark:border-white/[0.08] dark:bg-slate-900/50 dark:text-slate-400 dark:hover:border-emerald-400 dark:hover:text-emerald-300'"
        @click="emit('update:selectedCategory', category)"
      >
        {{ category }}
      </button>
    </div>

    <!-- Baris 3: Status Hasil & Pilihan Urutan Inline (Tidak Memakan Baris Penuh!) -->
    <div class="flex items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400 px-0.5">
      <div class="flex items-center gap-2">
        <span>Menampilkan <strong class="font-semibold text-slate-800 dark:text-slate-200">{{ resultCount }}</strong> artikel</span>
        <button
          v-if="hasActiveFilters"
          type="button"
          class="font-semibold text-emerald-600 underline decoration-emerald-300 underline-offset-2 hover:text-emerald-800 dark:text-emerald-400"
          @click="emit('reset')"
        >
          Reset filter
        </button>
      </div>

      <label class="inline-flex items-center gap-1.5 rounded-full border border-slate-200/70 bg-white/70 px-2.5 py-1 dark:border-white/[0.08] dark:bg-slate-900/50 cursor-pointer">
        <svg class="size-3 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="m3 16 4 4 4-4M7 20V4m14 4-4-4-4 4m4-4v16" /></svg>
        <select
          :value="sortMode"
          class="bg-transparent text-[11px] font-medium text-slate-700 dark:text-slate-300 outline-none cursor-pointer pr-0.5"
          aria-label="Urutkan artikel"
          @change="emit('update:sortMode', ($event.target as HTMLSelectElement).value)"
        >
          <option value="new_old">Terbaru</option>
          <option value="old_new">Terlama</option>
          <option value="az">A–Z</option>
          <option value="za">Z–A</option>
        </select>
      </label>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  categories: string[]
  searchQuery: string
  selectedCategory: string
  sortMode: string
  resultCount: number
}>()

const emit = defineEmits<{
  'update:searchQuery': [value: string]
  'update:selectedCategory': [value: string]
  'update:sortMode': [value: string]
  reset: []
}>()

const hasActiveFilters = computed(() => (
  props.searchQuery.length > 0
  || props.selectedCategory !== 'Semua'
  || props.sortMode !== 'new_old'
))
</script>

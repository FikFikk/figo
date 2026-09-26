<template>
  <section class="space-y-3 sm:space-y-4" aria-label="Filter koleksi artikel">
    <!-- Baris 1: Kolom Pencarian & Pilihan Urutan -->
    <div class="flex flex-col sm:flex-row gap-2.5 sm:gap-3">
      <label class="relative flex-1 block">
        <span class="sr-only">Cari artikel</span>
        <svg class="pointer-events-none absolute left-4 top-1/2 size-4 sm:size-5 -translate-y-1/2 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
          <circle cx="11" cy="11" r="6" />
          <path d="m16 16 4 4" />
        </svg>
        <input
          :value="searchQuery"
          type="search"
          aria-label="Cari artikel"
          placeholder="Cari judul, tokoh, atau tema…"
          class="min-h-11 w-full rounded-2xl border border-slate-200 bg-white py-2.5 pl-11 pr-11 text-sm text-slate-900 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-100 placeholder:text-slate-400"
          @input="emit('update:searchQuery', ($event.target as HTMLInputElement).value)"
        >
        <button
          v-if="searchQuery"
          type="button"
          class="absolute right-1 top-1/2 grid size-10 -translate-y-1/2 place-items-center rounded-2xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-slate-100"
          aria-label="Hapus pencarian"
          @click="emit('update:searchQuery', '')"
        >
          <svg class="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18" /></svg>
        </button>
      </label>

      <label class="flex min-h-11 items-center gap-2.5 rounded-2xl border border-slate-200 bg-white px-3.5 text-xs sm:text-sm text-slate-700 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-200 shrink-0">
        <span class="whitespace-nowrap text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">Urutkan</span>
        <select
          :value="sortMode"
          class="bg-transparent text-xs sm:text-sm font-medium outline-none cursor-pointer pr-1"
          aria-label="Urutkan artikel"
          @change="emit('update:sortMode', ($event.target as HTMLSelectElement).value)"
        >
          <option value="new_old">Terbaru</option>
          <option value="old_new">Terlama</option>
          <option value="az">Judul A–Z</option>
          <option value="za">Judul Z–A</option>
        </select>
      </label>
    </div>

    <!-- Baris 2: Kategori Horizontal Scroll Chips (Satu baris rapi & swipeable) -->
    <div class="flex items-center gap-2 overflow-x-auto pb-1 -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap no-scrollbar" aria-label="Kategori artikel">
      <button
        v-for="category in categories"
        :key="category"
        type="button"
        :aria-pressed="selectedCategory === category"
        class="min-h-9 sm:min-h-10 rounded-2xl border px-3.5 sm:px-4 text-xs sm:text-sm font-medium transition shrink-0 whitespace-nowrap focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600"
        :class="selectedCategory === category
          ? 'border-emerald-700 bg-emerald-700 text-white dark:border-emerald-500 dark:bg-emerald-500 dark:text-slate-950 shadow-sm'
          : 'border-slate-200 bg-white text-slate-700 hover:border-emerald-600 hover:text-emerald-700 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-300 dark:hover:border-emerald-400 dark:hover:text-emerald-300'"
        @click="emit('update:selectedCategory', category)"
      >
        {{ category }}
      </button>
    </div>

    <!-- Baris 3: Status Hasil & Tombol Reset Filter -->
    <div class="flex items-center justify-between gap-3 text-xs sm:text-sm text-slate-500 dark:text-slate-400 pt-0.5">
      <p>Menampilkan <span class="font-semibold text-slate-800 dark:text-slate-200">{{ resultCount }}</span> artikel</p>
      <button
        v-if="hasActiveFilters"
        type="button"
        class="font-semibold text-emerald-700 underline decoration-emerald-300 underline-offset-4 transition hover:text-emerald-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 dark:text-emerald-400 dark:hover:text-emerald-200"
        @click="emit('reset')"
      >
        Reset filter
      </button>
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

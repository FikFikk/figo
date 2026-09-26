<template>
  <section class="w-full min-w-0" aria-label="Katalog artikel">
    <div v-if="articles.length" class="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 w-full min-w-0">
      <ArticleCard
        v-for="article in articles"
        :key="article.id"
        :article="article"
        :pinned="pinnedIds.includes(article.id)"
        :progress="progress[article.id]"
        @toggle-pin="$emit('toggle-pin', article.id)"
      />
    </div>

    <div v-else role="status" class="rounded-2xl border border-dashed border-slate-200 bg-white/50 px-6 py-14 text-center backdrop-blur-sm dark:border-white/[0.1] dark:bg-slate-900/30">
      <svg class="mx-auto size-10 text-slate-400 dark:text-slate-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H12v18H6.5A2.5 2.5 0 0 0 4 23V5.5ZM20 5.5A2.5 2.5 0 0 0 17.5 3H12v18h5.5A2.5 2.5 0 0 1 20 23V5.5Z" /></svg>
      <h2 class="mt-4 font-serif text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100">Artikel tidak ditemukan</h2>
      <p class="mx-auto mt-1.5 max-w-md text-xs sm:text-sm leading-relaxed text-slate-500 dark:text-slate-400">Ubah kata kunci atau pilih kategori lain untuk melihat koleksi.</p>
      <button type="button" class="mt-5 h-9 rounded-xl border border-emerald-600 bg-emerald-50/50 px-4 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 dark:border-emerald-500 dark:bg-emerald-950/30 dark:text-emerald-400 dark:hover:bg-emerald-950/60" @click="$emit('reset')">Reset filter</button>
    </div>

    <nav v-if="totalPages > 1" class="mt-8 flex items-center justify-center gap-1.5" aria-label="Halaman katalog">
      <button type="button" class="grid size-9 sm:size-10 place-items-center rounded-xl border border-slate-200/80 bg-white/80 text-slate-700 transition hover:border-emerald-600 disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 dark:border-white/[0.08] dark:bg-slate-900/50 dark:text-slate-200" :disabled="page === 1" aria-label="Halaman sebelumnya" @click="$emit('previous-page')">
        <svg class="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="m15 18-6-6 6-6" /></svg>
      </button>
      <button
        v-for="number in totalPages"
        :key="number"
        type="button"
        class="grid size-9 sm:size-10 place-items-center rounded-xl border text-xs sm:text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600"
        :class="number === page ? 'border-emerald-600 bg-emerald-600 text-white dark:border-emerald-500 dark:bg-emerald-500 dark:text-slate-950 shadow-sm' : 'border-slate-200/80 bg-white/80 text-slate-700 hover:border-emerald-600 dark:border-white/[0.08] dark:bg-slate-900/50 dark:text-slate-300'"
        :aria-current="number === page ? 'page' : undefined"
        :aria-label="`Halaman ${number}`"
        @click="$emit('update:page', number)"
      >{{ number }}</button>
      <button type="button" class="grid size-9 sm:size-10 place-items-center rounded-xl border border-slate-200/80 bg-white/80 text-slate-700 transition hover:border-emerald-600 disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 dark:border-white/[0.08] dark:bg-slate-900/50 dark:text-slate-200" :disabled="page === totalPages" aria-label="Halaman selanjutnya" @click="$emit('next-page')">
        <svg class="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="m9 18 6-6-6-6" /></svg>
      </button>
    </nav>
  </section>
</template>

<script setup lang="ts">
import ArticleCard from '~/components/articles/ArticleCard.vue'
import type { ArticleSummary, ReadingProgress } from '~/types/articles'

defineProps<{
  articles: ArticleSummary[]
  pinnedIds: string[]
  progress: Record<string, ReadingProgress>
  page: number
  totalPages: number
}>()

defineEmits<{
  'toggle-pin': [id: string]
  'update:page': [page: number]
  'previous-page': []
  'next-page': []
  reset: []
}>()
</script>

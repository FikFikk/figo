<template>
  <article class="group flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-emerald-600/50 hover:shadow-sm dark:border-slate-800 dark:bg-slate-950">
    <div class="flex items-start justify-between gap-3">
      <span class="max-w-[80%] rounded-2xl border border-emerald-100 bg-emerald-50 px-3 py-1 text-[0.6875rem] font-semibold uppercase tracking-[0.1em] text-emerald-800 dark:border-emerald-900/70 dark:bg-emerald-950/40 dark:text-emerald-300">
        {{ article.kategori }}
      </span>
      <button
        type="button"
        class="grid size-11 shrink-0 place-items-center rounded-2xl text-slate-500 transition hover:bg-emerald-50 hover:text-emerald-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 dark:text-slate-400 dark:hover:bg-emerald-950/40 dark:hover:text-emerald-300"
        :aria-label="pinned ? 'Lepas simpan artikel' : 'Simpan artikel'"
        :aria-pressed="pinned"
        @click="$emit('toggle-pin')"
      >
        <svg class="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
          <path d="M6 4.75A1.75 1.75 0 0 1 7.75 3h8.5A1.75 1.75 0 0 1 18 4.75V21l-6-3.5L6 21V4.75Z" :fill="pinned ? 'currentColor' : 'none'" />
        </svg>
      </button>
    </div>

    <NuxtLink :to="readerLink" class="mt-5 outline-none focus-visible:rounded-2xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald-600">
      <h2 class="font-serif text-xl font-semibold leading-snug text-slate-900 transition group-hover:text-emerald-800 dark:text-slate-50 dark:group-hover:text-emerald-300">
        {{ article.judul }}
      </h2>
      <p class="mt-2 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">{{ article.tokoh }}</p>
      <p class="mt-4 line-clamp-3 text-sm leading-6 text-slate-600 dark:text-slate-300">{{ article.deskripsi }}</p>
    </NuxtLink>

    <div class="mt-auto pt-5">
      <div v-if="progress && progress.percent > 0" class="space-y-2" aria-label="Progres membaca">
        <div class="flex items-center justify-between text-xs font-semibold text-indigo-700 dark:text-indigo-300">
          <span>Lanjut baca</span><span>{{ progress.percent }}%</span>
        </div>
        <div class="h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
          <div class="h-full rounded-full bg-indigo-600 dark:bg-indigo-400" :style="{ width: `${progress.percent}%` }" />
        </div>
      </div>
      <NuxtLink :to="readerLink" class="mt-4 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-emerald-800 transition hover:text-emerald-950 focus-visible:rounded-2xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald-600 dark:text-emerald-300 dark:hover:text-emerald-100">
        {{ progress && progress.percent > 0 ? 'Lanjut baca' : 'Baca artikel' }}
        <svg class="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="m9 18 6-6-6-6" /></svg>
      </NuxtLink>
    </div>
  </article>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { ArticleSummary, ReadingProgress } from '~/types/articles'

const props = defineProps<{
  article: ArticleSummary
  pinned: boolean
  progress?: ReadingProgress
}>()

defineEmits<{ 'toggle-pin': [] }>()

const readerLink = computed(() => ({
  path: '/articles',
  query: { id: props.article.id, page: props.progress?.page || 1 },
}))
</script>

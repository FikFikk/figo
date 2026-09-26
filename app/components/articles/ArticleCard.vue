<template>
  <article class="group flex h-full flex-col rounded-2xl border border-slate-200/80 bg-white/80 p-4 sm:p-5 shadow-sm hover:shadow-md backdrop-blur-sm transition-all duration-300 dark:border-white/[0.08] dark:bg-slate-900/40 dark:hover:bg-slate-900/80 dark:hover:border-emerald-500/30">
    <div class="flex items-start justify-between gap-3">
      <span class="max-w-[80%] rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
        {{ article.kategori }}
      </span>
      <button
        type="button"
        class="grid size-8 sm:size-9 shrink-0 place-items-center rounded-xl transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600"
        :class="pinned
          ? 'bg-amber-500/10 text-amber-600 dark:bg-amber-400/10 dark:text-amber-400 border border-amber-500/20'
          : 'text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200'"
        :aria-label="pinned ? 'Lepas simpan artikel' : 'Simpan artikel'"
        :aria-pressed="pinned"
        @click="$emit('toggle-pin')"
      >
        <svg class="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
          <path d="M6 4.75A1.75 1.75 0 0 1 7.75 3h8.5A1.75 1.75 0 0 1 18 4.75V21l-6-3.5L6 21V4.75Z" :fill="pinned ? 'currentColor' : 'none'" />
        </svg>
      </button>
    </div>

    <NuxtLink :to="readerLink" class="mt-3.5 outline-none focus-visible:rounded-2xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald-600">
      <h2 class="font-serif text-lg sm:text-xl font-bold leading-snug text-slate-900 transition group-hover:text-emerald-700 dark:text-slate-100 dark:group-hover:text-emerald-300">
        {{ article.judul }}
      </h2>
      <p class="mt-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">{{ article.tokoh }}</p>
      <p class="mt-2.5 line-clamp-2 text-xs sm:text-sm leading-relaxed text-slate-600 dark:text-slate-400">{{ article.deskripsi }}</p>
    </NuxtLink>

    <div class="mt-auto pt-4 border-t border-slate-100 dark:border-white/[0.06]">
      <div v-if="progress && progress.percent > 0" class="space-y-1.5 mb-3" aria-label="Progres membaca">
        <div class="flex items-center justify-between text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
          <span>Progres baca</span><span>{{ progress.percent }}%</span>
        </div>
        <div class="h-1 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
          <div class="h-full rounded-full bg-emerald-500" :style="{ width: `${progress.percent}%` }" />
        </div>
      </div>
      <NuxtLink :to="readerLink" class="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-emerald-700 transition group-hover:text-emerald-900 dark:text-emerald-400 dark:group-hover:text-emerald-200">
        <span>{{ progress && progress.percent > 0 ? 'Lanjut baca' : 'Baca artikel' }}</span>
        <svg class="size-3.5 transition-transform group-hover:translate-x-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="m9 18 6-6-6-6" /></svg>
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

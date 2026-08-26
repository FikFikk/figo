<template>
  <aside class="space-y-4" aria-label="Navigasi pembaca">
    <section class="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
      <h2 class="text-sm font-semibold text-slate-900 dark:text-slate-100">Daftar isi</h2>
      <ol class="mt-3 space-y-1">
        <li v-for="item in items" :key="item.page">
          <button
            type="button"
            class="w-full rounded-2xl px-3 py-2 text-left text-sm leading-5 transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600"
            :class="item.page === currentPage ? 'bg-emerald-50 font-semibold text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-900 dark:hover:text-white'"
            :aria-current="item.page === currentPage ? 'page' : undefined"
            @click="$emit('go-to-page', item.page)"
          >
            <span class="mr-2 text-xs tabular-nums text-slate-400 dark:text-slate-500">{{ item.page }}.</span>{{ item.title }}
          </button>
        </li>
      </ol>
    </section>

    <section class="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
      <div class="flex items-center justify-between gap-3"><h2 class="text-sm font-semibold text-slate-900 dark:text-slate-100">Sorotan tersimpan</h2><span class="text-xs tabular-nums text-slate-500 dark:text-slate-400">{{ highlights.length }}</span></div>
      <p v-if="!highlights.length" class="mt-3 text-sm leading-6 text-slate-500 dark:text-slate-400">Pilih teks dalam artikel untuk menyimpan sorotan.</p>
      <ul v-else class="mt-3 space-y-2">
        <li v-for="highlight in highlights" :key="`${highlight.page}-${highlight.pIdx}-${highlight.text}`">
          <button type="button" class="w-full rounded-2xl border-l-4 bg-slate-50 px-3 py-2 text-left text-xs leading-5 text-slate-700 transition hover:bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800" :class="borderColor(highlight.color)" @click="$emit('go-to-highlight', highlight)">
            <span class="block text-[0.6875rem] font-semibold uppercase tracking-[0.1em] text-slate-500 dark:text-slate-400">Bagian {{ highlight.page }}</span>{{ highlight.text }}
          </button>
        </li>
      </ul>
    </section>
  </aside>
</template>

<script setup lang="ts">
import type { ArticleHighlight } from '~/app/types/articles'

defineProps<{
  items: Array<{ page: number; title: string }>
  currentPage: number
  highlights: ArticleHighlight[]
}>()

defineEmits<{ 'go-to-page': [page: number]; 'go-to-highlight': [highlight: ArticleHighlight] }>()

const borderColor = (color: ArticleHighlight['color']) => ({
  yellow: 'border-amber-400',
  emerald: 'border-emerald-500',
  indigo: 'border-indigo-500',
}[color])
</script>

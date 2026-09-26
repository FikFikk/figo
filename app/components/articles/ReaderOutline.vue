<template>
  <!-- Navigasi outline dan sorotan pembaca -->
  <aside :class="variant === 'sheet' ? 'space-y-3' : 'space-y-4'" aria-label="Navigasi pembaca">
    <!-- Bagian daftar isi bab / halaman -->
    <section
      v-if="effectiveTab === 'all' || effectiveTab === 'outline'"
      :class="variant === 'sheet' ? '' : 'rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950'"
    >
      <h2 v-if="variant !== 'sheet'" class="text-sm font-semibold text-slate-900 dark:text-slate-100">Daftar isi</h2>
      <ol :class="variant === 'sheet' ? 'space-y-1.5' : 'mt-3 space-y-1'">
        <li v-for="item in items" :key="item.page">
          <button
            type="button"
            class="w-full rounded-2xl px-3.5 py-2.5 text-left text-sm leading-5 transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 flex items-center justify-between gap-3 group"
            :class="item.page === currentPage
              ? 'bg-emerald-50 font-semibold text-emerald-900 border border-emerald-200 dark:border-emerald-800/80 dark:bg-emerald-950/40 dark:text-emerald-200 shadow-sm'
              : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-900 dark:hover:text-white border border-transparent'"
            :aria-current="item.page === currentPage ? 'page' : undefined"
            @click="$emit('go-to-page', item.page)"
          >
            <div class="flex items-center min-w-0 gap-2.5">
              <span
                class="size-6 shrink-0 grid place-items-center rounded-lg text-xs font-semibold tabular-nums"
                :class="item.page === currentPage
                  ? 'bg-emerald-600 text-white dark:bg-emerald-400 dark:text-slate-950'
                  : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400 group-hover:bg-slate-200 dark:group-hover:bg-slate-700'"
              >
                {{ item.page }}
              </span>
              <span class="truncate">{{ item.title }}</span>
            </div>
            <span
              v-if="item.page === currentPage"
              class="shrink-0 text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-900/60 px-2 py-0.5 rounded-full"
            >
              Aktif
            </span>
          </button>
        </li>
      </ol>
    </section>

    <!-- Bagian daftar sorotan atau bookmark yang tersimpan -->
    <section
      v-if="effectiveTab === 'all' || effectiveTab === 'highlights'"
      :class="variant === 'sheet' ? '' : 'rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950'"
    >
      <div v-if="variant !== 'sheet'" class="flex items-center justify-between gap-3">
        <h2 class="text-sm font-semibold text-slate-900 dark:text-slate-100">Sorotan tersimpan</h2>
        <span class="text-xs tabular-nums text-slate-500 dark:text-slate-400">{{ highlights.length }}</span>
      </div>

      <!-- Tampilan kosong jika belum ada sorotan tersimpan -->
      <div v-if="!highlights.length" class="text-center" :class="variant === 'sheet' ? 'py-10' : 'mt-3'">
        <div class="mx-auto mb-3 grid size-12 place-items-center rounded-2xl bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400">
          <svg class="size-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" /></svg>
        </div>
        <p class="text-sm font-semibold text-slate-800 dark:text-slate-200">Belum ada sorotan</p>
        <p class="mt-1 text-xs text-slate-500 dark:text-slate-400 max-w-[260px] mx-auto leading-relaxed">
          Pilih atau sorot teks kalimat dalam artikel untuk menyimpan rangkuman dan kutipan penting.
        </p>
      </div>

      <!-- Daftar sorotan tersimpan -->
      <ul v-else :class="variant === 'sheet' ? 'space-y-2.5' : 'mt-3 space-y-2'">
        <li v-for="highlight in highlights" :key="`${highlight.page}-${highlight.pIdx}-${highlight.text}`">
          <button
            type="button"
            class="w-full rounded-2xl border-l-4 bg-slate-50 p-3 text-left transition hover:bg-slate-100 hover:shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800/90 group"
            :class="borderColor(highlight.color)"
            @click="$emit('go-to-highlight', highlight)"
          >
            <div class="flex items-center justify-between gap-2 mb-1.5">
              <span class="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                <span class="size-2 rounded-full" :class="dotColor(highlight.color)" />
                Bagian {{ highlight.page }}
              </span>
              <span class="text-[11px] text-emerald-700 dark:text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity font-medium flex items-center gap-0.5">
                Lompat
                <svg class="size-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="m9 18 6-6-6-6" /></svg>
              </span>
            </div>
            <p class="text-xs leading-5 text-slate-700 dark:text-slate-200 line-clamp-3 italic">
              "{{ highlight.text }}"
            </p>
          </button>
        </li>
      </ul>
    </section>
  </aside>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { ArticleHighlight } from '~/types/articles'

const props = withDefaults(defineProps<{
  items: Array<{ page: number; title: string }>
  currentPage: number
  highlights: ArticleHighlight[]
  activeTab?: 'all' | 'outline' | 'highlights'
  variant?: 'sidebar' | 'sheet'
}>(), {
  activeTab: 'all',
  variant: 'sidebar'
})

defineEmits<{
  'go-to-page': [page: number]
  'go-to-highlight': [highlight: ArticleHighlight]
}>()

// Menentukan tab efektif berdasarkan mode sheet atau sidebar
const effectiveTab = computed(() => {
  if (props.variant === 'sheet') {
    return props.activeTab
  }
  return 'all'
})

// Kelas warna border samping kartu sorotan
const borderColor = (color: ArticleHighlight['color']) => ({
  yellow: 'border-amber-400',
  emerald: 'border-emerald-500',
  indigo: 'border-indigo-500',
}[color])

// Kelas warna titik penanda warna sorotan
const dotColor = (color: ArticleHighlight['color']) => ({
  yellow: 'bg-amber-400',
  emerald: 'bg-emerald-500',
  indigo: 'bg-indigo-500',
}[color])
</script>

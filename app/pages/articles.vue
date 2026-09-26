<template>
  <div class="min-h-[100dvh] w-full max-w-full overflow-x-clip px-4 pb-36 pt-20 text-slate-800 transition-colors duration-200 sm:px-6 md:px-8 md:pt-24 dark:text-slate-200">
    <div class="mx-auto max-w-7xl">
      <Transition name="slide-down">
        <div v-if="showHighlightMenu" class="fixed left-1/2 top-24 z-[60] flex -translate-x-1/2 items-center gap-1 rounded-2xl border border-slate-200 bg-white/95 p-2 shadow-xl backdrop-blur dark:border-slate-700 dark:bg-slate-950/95" role="toolbar" aria-label="Pilih warna sorotan">
          <button v-for="color in highlightColors" :key="color" type="button" class="grid size-11 place-items-center rounded-2xl transition hover:bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 dark:hover:bg-slate-800" :aria-label="`Simpan sorotan ${color}`" @click="applyHighlight(color)"><span class="size-5 rounded-full" :class="colorDotClass(color)" /></button>
          <button type="button" class="min-h-11 rounded-2xl px-3 text-sm font-semibold text-slate-600 hover:bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 dark:text-slate-300 dark:hover:bg-slate-800" @click="showHighlightMenu = false">Batal</button>
        </div>
      </Transition>

      <!-- Header katalog koleksi utama: tampilan editorial yang bersih & modern -->
      <header v-if="!selectedDoc" class="mb-5 pb-4 border-b border-slate-200/80 dark:border-white/[0.08]">
        <div class="flex items-start justify-between gap-4">
          <div class="space-y-1">
            <div class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              <span class="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
              FiGo Koleksi Terbuka
            </div>
            <h1 class="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-slate-950 dark:text-white pt-0.5">
              Pengetahuan Nusantara
            </h1>
            <p class="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-xl leading-relaxed">
              Arsip spiritual, sastra, sejarah, dan pemikiran Nusantara. Baca pelan, simpan jejak, lanjutkan kapan saja.
            </p>
          </div>
          <NuxtLink
            to="/"
            class="hidden sm:inline-flex min-h-9 items-center gap-1.5 rounded-2xl border border-slate-200 bg-white/80 px-3 text-xs font-semibold text-slate-700 transition hover:border-emerald-600 hover:text-emerald-800 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-300 dark:hover:text-emerald-400 shrink-0"
          >
            <svg class="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="m15 18-6-6 6-6" /></svg>
            Beranda
          </NuxtLink>
        </div>
      </header>

      <div v-if="loading" class="grid min-h-64 place-items-center" role="status"><div class="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300"><span class="size-4 animate-pulse rounded-full bg-emerald-600" />Memuat arsip…</div></div>

      <template v-else-if="!selectedDoc">
        <!-- Filter katalog terpadu: langsung menyatu tanpa kotak/judul duplikat -->
        <ArticleFilters
          class="mb-6 md:mb-8"
          :categories="categories"
          :search-query="searchQuery"
          :selected-category="selectedCategory"
          :sort-mode="sortMode"
          :result-count="filteredDocuments.length"
          @update:search-query="searchQuery = $event"
          @update:selected-category="selectedCategory = $event"
          @update:sort-mode="sortMode = $event"
          @reset="resetFilters"
        />
        <ArticleCatalogue
          :articles="paginatedDocuments"
          :pinned-ids="pinnedIds"
          :progress="progress"
          :page="currentGridPage"
          :total-pages="totalGridPages"
          @toggle-pin="togglePin"
          @update:page="goToCataloguePage"
          @previous-page="prevGridPage"
          @next-page="nextGridPage"
          @reset="resetFilters"
        />
      </template>

      <ArticleReader
        v-else-if="currentSection"
        :title="articleTitle"
        :category="selectedDoc.data?.kategori_akademik || selectedDoc.kategori"
        :author="selectedDoc.data?.author || selectedDoc.tokoh"
        :section-title="sectionTitle"
        :current-page="currentPage"
        :total-pages="totalPages"
        :progress-percent="currentProgress"
        :outline="outline"
        :highlights="docHighlights"
        :settings="readerSettings"
        @previous-page="previousPage"
        @next-page="nextPage"
        @go-to-page="goToPage"
        @go-to-highlight="jumpToHighlight"
        @update:settings="readerSettings = $event"
        @reset-settings="resetReaderSettings"
      >
        <template #prose>
          <p v-if="currentSection.teori_akademik" class="mb-7 border-l-2 border-emerald-600 pl-4 text-sm leading-6 text-emerald-900 dark:border-emerald-400 dark:text-emerald-200">{{ currentSection.teori_akademik }}</p>
          <div :class="[readerSettings.fontFamily, readerSettings.textAlign]" :style="{ fontSize: `${readerSettings.fontSize}px` }" class="space-y-6 leading-[1.9] text-slate-800 selection:bg-emerald-200 dark:text-slate-200 dark:selection:bg-emerald-800">
            <div v-for="(paragraph, index) in paragraphs" :key="index" :data-pidx="index" class="break-words reader-block" v-html="renderParagraph(paragraph, index)" />
          </div>
          <p v-if="currentPage === totalPages" class="mt-12 border-t border-slate-200 pt-6 text-center text-xs leading-6 text-slate-500 dark:border-slate-800 dark:text-slate-400">Temukan kekeliruan atau ingin bertanya soal sumber? <a href="mailto:figo@fikfikk.my.id" class="font-semibold text-emerald-800 underline decoration-emerald-300 underline-offset-4 dark:text-emerald-300">figo@fikfikk.my.id</a></p>
        </template>
      </ArticleReader>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import ArticleFilters from '~/components/articles/ArticleFilters.vue'
import ArticleCatalogue from '~/components/articles/ArticleCatalogue.vue'
import ArticleReader from '~/components/articles/ArticleReader.vue'
import { ARTICLE_DOCUMENTS } from '~/data/articleDocuments'
import { useArticleCatalogue } from '~/composables/useArticleCatalogue'
import { useArticleReading } from '~/composables/useArticleReading'
import { useArticleStorage } from '~/composables/useArticleStorage'
import type { ArticleData, ArticleHighlight, ArticleSummary } from '~/types/articles'

type SelectedArticle = ArticleSummary

const route = useRoute()
const router = useRouter()
const storage = useArticleStorage()
const documents = ref<SelectedArticle[]>(ARTICLE_DOCUMENTS.map((article) => ({ ...article, data: null })))
const selectedDoc = ref<SelectedArticle | null>(null)
const currentPage = ref(1)
const loading = ref(false)
const pinnedIds = ref<string[]>([])
const categories = ['Semua', 'Filsafat & Sastra', 'Babad & Sejarah', 'Suluk & Tasawuf', 'Artikel Kajian']
const {
  searchQuery,
  selectedCategory,
  sortMode,
  currentGridPage,
  cataloguePage,
  filteredDocuments,
  paginatedDocuments,
  totalGridPages,
  resetFilters,
  nextGridPage,
  prevGridPage,
} = useArticleCatalogue(documents, pinnedIds)

const totalPages = computed(() => selectedDoc.value?.data?.arsip_pengetahuan?.length || 0)
const currentSection = computed(() => selectedDoc.value?.data?.arsip_pengetahuan?.[currentPage.value - 1] || null)
const { readerSettings, progress, docHighlights, loadReaderState, attachProgressTracking, detachProgressTracking, calculateProgress, resetReaderSettings, saveHighlight, removeHighlight } = useArticleReading(selectedDoc, currentPage, totalPages)
const articleTitle = computed(() => selectedDoc.value?.data?.buku_referensi || selectedDoc.value?.judul || '')
const sectionTitle = computed(() => currentSection.value?.nama_wahyu || currentSection.value?.tema_utama || currentSection.value?.id_bab || `Bagian ${currentPage.value}`)
const paragraphs = computed(() => String(currentSection.value?.penjabaran_detail || currentSection.value?.deskripsi || '').split('\n\n').map((item) => item.trim()).filter(Boolean))
const outline = computed(() => (selectedDoc.value?.data?.arsip_pengetahuan || []).map((section, index) => ({ page: index + 1, title: section.nama_wahyu || section.tema_utama || section.id_bab || `Bagian ${index + 1}` })))
const currentProgress = computed(() => progress.value[selectedDoc.value?.id || '']?.percent || 0)
const selection = ref<{ text: string; pIdx: number } | null>(null)
const showHighlightMenu = ref(false)
const highlightColors: ArticleHighlight['color'][] = ['yellow', 'emerald', 'indigo']

useSeoMeta({
  title: () => selectedDoc.value ? `${selectedDoc.value.judul} - Pengetahuan Nusantara FiGo` : 'Pengetahuan Nusantara - FiGo',
  description: () => selectedDoc.value?.deskripsi || 'Pusat arsip spiritual, literatur Kejawen, Tasawuf, dan peninggalan Nusantara.',
  ogTitle: () => selectedDoc.value ? `${selectedDoc.value.judul} - Pengetahuan Nusantara FiGo` : 'Pengetahuan Nusantara FiGo',
  ogDescription: () => selectedDoc.value?.deskripsi || 'Pusat arsip spiritual dan literatur Nusantara bebas akses.',
  twitterCard: 'summary_large_image',
})

const loadArticle = async (article: SelectedArticle) => {
  if (article.data) return true
  loading.value = true
  try {
    const result = await $fetch<ArticleData | string>(`${article.url}?v=${Date.now()}`)
    article.data = typeof result === 'string' ? JSON.parse(result) as ArticleData : result
    return true
  } catch {
    alert('Gagal memuat arsip artikel.')
    return false
  } finally { loading.value = false }
}

const openFromRoute = async () => {
  const id = typeof route.query.id === 'string' ? route.query.id : ''
  if (!id) { selectedDoc.value = null; return }
  const article = documents.value.find((item) => item.id === id)
  if (!article || !await loadArticle(article)) return
  selectedDoc.value = article
  const requestedPage = Number(route.query.page)
  currentPage.value = Math.min(totalPages.value || 1, Math.max(1, Number.isFinite(requestedPage) ? requestedPage : 1))
}

const replaceReaderQuery = () => {
  if (!selectedDoc.value) return
  router.replace({ query: { id: selectedDoc.value.id, page: currentPage.value } })
}

const togglePin = (id: string) => {
  pinnedIds.value = pinnedIds.value.includes(id) ? pinnedIds.value.filter((item) => item !== id) : [...pinnedIds.value, id]
  storage.savePins(pinnedIds.value)
}
const goToCataloguePage = (page: number) => { currentGridPage.value = page; window.scrollTo({ top: 0, behavior: 'smooth' }) }
const scrollReaderTop = () => nextTick(() => document.querySelector('#baca-top')?.scrollIntoView({ behavior: 'smooth', block: 'start' }))
const goToPage = (page: number) => { currentPage.value = Math.min(totalPages.value, Math.max(1, page)); scrollReaderTop() }
const nextPage = () => goToPage(currentPage.value + 1)
const previousPage = () => goToPage(currentPage.value - 1)
const colorDotClass = (color: ArticleHighlight['color']) => ({ yellow: 'bg-amber-400', emerald: 'bg-emerald-500', indigo: 'bg-indigo-500' }[color])

const handleTextSelection = () => {
  const selected = window.getSelection()
  const text = selected?.toString().replace(/\s+/g, ' ').trim() || ''
  const node = selected?.anchorNode?.parentElement
  const paragraph = node?.closest('[data-pidx]')
  if (!selectedDoc.value || text.length < 3 || !paragraph) { showHighlightMenu.value = false; return }
  selection.value = { text, pIdx: Number((paragraph as HTMLElement).dataset.pidx) }
  showHighlightMenu.value = true
}
const applyHighlight = (color: ArticleHighlight['color']) => {
  if (!selectedDoc.value || !selection.value) return
  saveHighlight({ ...selection.value, color, docId: selectedDoc.value.id, page: currentPage.value })
  showHighlightMenu.value = false
  window.getSelection()?.removeAllRanges()
}
const escapeHtml = (value: string) => value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;')
const safeUrl = (value: string) => {
  try {
    const unescaped = value.replace(/&amp;/g, '&')
    const url = new URL(unescaped)
    return ['http:', 'https:'].includes(url.protocol) ? url.href : ''
  } catch { return '' }
}
const renderParagraph = (value: string, pIdx: number) => {
  let rendered = escapeHtml(value)

  // 1. Terapkan sorotan (highlight) yang tersimpan
  for (const highlight of docHighlights.value.filter((item) => item.page === currentPage.value && item.pIdx === pIdx)) {
    const text = escapeHtml(highlight.text)
    if (rendered.includes(text)) rendered = rendered.replace(text, `<mark data-highlight="${highlight.pIdx}" class="${highlightClass(highlight.color)}">${text}</mark>`)
  }

  // 2. Media aset visual
  rendered = rendered.replace(/\[IMAGE_ASSET:\s*(https?:\/\/[^\]]+)\]/gi, (_all, val) => {
    const url = safeUrl(val)
    return url ? `<img src="${url}" alt="Ilustrasi pendukung artikel" class="my-8 mx-auto max-w-full rounded-2xl border border-slate-200 dark:border-slate-800" loading="lazy">` : ''
  })
  rendered = rendered.replace(/\[FLIPBOOK:\s*(https?:\/\/[^\]]+)\]/gi, (_all, val) => {
    const url = safeUrl(val)
    return url ? `<iframe src="${url}" title="Flipbook artikel" class="my-8 h-[65vh] w-full rounded-2xl border border-slate-200 dark:border-slate-800" loading="lazy"></iframe>` : ''
  })

  // 3. Garis pembatas horizontal (--- atau ***)
  rendered = rendered.replace(/^(?:---|[*]{3}|_{3})$/gm, '<div class="my-7 flex items-center justify-center gap-2"><span class="h-px flex-1 bg-slate-200 dark:bg-white/[0.08]"></span><span class="text-xs text-slate-400">✦</span><span class="h-px flex-1 bg-slate-200 dark:bg-white/[0.08]"></span></div>')

  // 4. Heading Markdown: ### (H3), #### (H4), ## (H2)
  rendered = rendered.replace(/^### (.*$)/gm, '<h3 class="font-serif text-lg sm:text-xl font-bold text-emerald-800 dark:text-emerald-400 mt-7 mb-2.5 flex items-center gap-2.5"><span class="w-1.5 h-4 rounded-full bg-emerald-500 inline-block shrink-0"></span><span>$1</span></h3>')
  rendered = rendered.replace(/^#### (.*$)/gm, '<h4 class="font-sans text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100 mt-5 mb-2">$1</h4>')
  rendered = rendered.replace(/^## (.*$)/gm, '<h2 class="font-serif text-xl sm:text-2xl font-bold text-slate-950 dark:text-white mt-8 mb-3.5 border-b border-slate-200/60 pb-2 dark:border-white/[0.08]">$1</h2>')

  // 5. Blockquotes (> kutipan)
  rendered = rendered.replace(/^>\s*(.*$)/gm, '<blockquote class="my-3.5 border-l-3 border-emerald-500 bg-emerald-500/5 px-4 py-2.5 rounded-r-xl italic text-slate-700 dark:text-slate-300 text-sm sm:text-base leading-relaxed">$1</blockquote>')

  // Pastikan butir nomor (1., 2., dst.) selalu pindah ke baris baru baik dari awal kalimat maupun yang tersambung
  rendered = rendered.replace(/(?:^|\n|(?<=[\.\:\;\?\!])\s+|\s{2,})(\d{1,2})\.\s+/g, '\n$1. ')
  // Pastikan butir bertanda bintang (* ) atau strip (- ) selalu berada di baris baru tersendiri
  rendered = rendered.replace(/(?:^|\n|(?<=[\.\:\;\?\!])\s+|\s{2,})[\*\-]\s+/g, '\n* ')

  // 6. Daftar List (* item, - item, 1. item) dengan indentasi dan penataan rapi
  rendered = rendered.replace(/^\s*[\*\-]\s+(.*$)/gm, '<div class="flex items-start gap-3 my-2 text-sm sm:text-base leading-relaxed w-full"><span class="size-2 rounded-full bg-emerald-500 mt-2 shrink-0"></span><div class="flex-1 min-w-0">$1</div></div>')
  rendered = rendered.replace(/^\s*(\d+)\.\s+(.*$)/gm, '<div class="flex items-start gap-3 my-2.5 text-sm sm:text-base leading-relaxed w-full"><span class="min-w-6 h-6 px-1.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-xs font-bold inline-flex items-center justify-center shrink-0 mt-0.5 border border-emerald-500/25 shadow-2xs">$1</span><div class="flex-1 min-w-0">$2</div></div>')

  // 7. Format Bold, Italic, Code
  rendered = rendered.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-slate-950 dark:text-white">$1</strong>')
  rendered = rendered.replace(/\*(.*?)\*/g, '<em class="italic text-slate-700 dark:text-slate-300">$1</em>')
  rendered = rendered.replace(/`([^`]+)`/g, '<code class="rounded-md bg-slate-100 dark:bg-white/[0.06] px-1.5 py-0.5 text-xs font-mono text-emerald-700 dark:text-emerald-400 border border-slate-200/60 dark:border-white/[0.08]">$1</code>')

  // 8. Format Tautan Markdown: [label](url) dengan lencana ringkas dan ikon tautan eksternal
  rendered = rendered.replace(/\[([^\]]*)\]\((https?:\/\/[^\s\)]+)\)/g, (_match, label, url) => {
    const cleanUrl = safeUrl(url)
    if (!cleanUrl) return label || ''
    const displayText = label.trim()
    const isIconOnly = !displayText || displayText === '↗' || displayText.toLowerCase() === 'icon'
    return `<a href="${cleanUrl}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium text-emerald-700 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 dark:text-emerald-300 dark:bg-emerald-500/15 dark:hover:bg-emerald-500/25 dark:border-emerald-500/30 transition-all select-none no-underline ml-1.5 align-middle" title="Buka rujukan validasi: ${cleanUrl}">${isIconOnly ? '' : `<span>${displayText}</span>`}<svg class="size-3 shrink-0 inline-block opacity-80" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/></svg></a>`
  })

  // 9. Format terjemahan
  rendered = rendered.replace(/↳\s*Terjemahan:\s*(.*)/gi, '<div class="mt-2.5 mb-2 rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-4 py-2 text-xs sm:text-sm italic text-emerald-900 dark:text-emerald-200 leading-relaxed"><span class="font-semibold not-italic text-emerald-700 dark:text-emerald-400">Terjemahan: </span>$1</div>')

  // 9. Format Teks Arab dan pemisahan baris teks biasa agar baris baru selalu dihormati browser
  const lines = rendered.split('\n')
  const formatted = lines.map((line) => {
    const trimmed = line.trim()
    if (!trimmed) return ''
    const arabicMatch = trimmed.match(/[\u0600-\u06FF]/g)
    if (arabicMatch && arabicMatch.length >= 8 && !trimmed.startsWith('<h') && !trimmed.startsWith('<div') && !trimmed.startsWith('<blockquote')) {
      return `<div class="my-4 p-3.5 sm:p-5 rounded-2xl bg-emerald-500/[0.04] border border-emerald-500/15 dark:bg-emerald-950/20 text-right select-text shadow-xs" dir="rtl"><p class="font-serif text-2xl sm:text-3xl leading-[2.3] tracking-wide text-emerald-900 dark:text-emerald-200 font-medium">${trimmed}</p></div>`
    }
    // Jika bukan elemen blok HTML, bungkus dalam paragraf teks biasa agar baris baru selalu dihormati browser
    if (!trimmed.startsWith('<h') && !trimmed.startsWith('<div') && !trimmed.startsWith('<blockquote') && !trimmed.startsWith('<img') && !trimmed.startsWith('<iframe')) {
      return `<p class="leading-relaxed my-2">${trimmed}</p>`
    }
    return trimmed
  }).filter(Boolean)

  return formatted.join('')
}
const highlightClass = (color: ArticleHighlight['color']) => ({ yellow: 'rounded-sm bg-amber-200 px-1 text-slate-950 dark:bg-amber-500/40 dark:text-white', emerald: 'rounded-sm bg-emerald-200 px-1 text-slate-950 dark:bg-emerald-500/40 dark:text-white', indigo: 'rounded-sm bg-indigo-200 px-1 text-slate-950 dark:bg-indigo-500/40 dark:text-white' }[color])
const jumpToHighlight = (highlight: ArticleHighlight) => {
  goToPage(highlight.page)
  setTimeout(() => document.querySelector(`[data-highlight="${highlight.pIdx}"]`)?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 300)
}

onMounted(async () => {
  pinnedIds.value = storage.loadPins()
  sortMode.value = storage.loadSort()
  loadReaderState()
  attachProgressTracking()
  document.addEventListener('selectionchange', handleTextSelection)
  await openFromRoute()
})
onUnmounted(() => { detachProgressTracking(); document.removeEventListener('selectionchange', handleTextSelection) })
watch(() => route.query.id, openFromRoute)
watch([selectedDoc, currentPage], () => { if (selectedDoc.value) replaceReaderQuery() })
watch(sortMode, (sort) => storage.saveSort(sort))
watch(currentPage, () => setTimeout(calculateProgress, 300))
</script>

<style scoped>
:global(footer), :global(.footer), :global([class*="footer"]), :global(#footer) { display: none !important; }
.slide-down-enter-active, .slide-down-leave-active { transition: opacity .2s ease, transform .2s ease; }
.slide-down-enter-from, .slide-down-leave-to { opacity: 0; transform: translate(-50%, -1rem); }
</style>
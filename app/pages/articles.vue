<template>
  <div class="min-h-[100dvh] px-4 pb-36 pt-20 text-slate-800 transition-colors duration-200 md:px-6 md:pt-24 dark:text-slate-200">
    <div class="mx-auto max-w-7xl">
      <Transition name="slide-down">
        <div v-if="showHighlightMenu" class="fixed left-1/2 top-24 z-[60] flex -translate-x-1/2 items-center gap-1 rounded-2xl border border-slate-200 bg-white/95 p-2 shadow-xl backdrop-blur dark:border-slate-700 dark:bg-slate-950/95" role="toolbar" aria-label="Pilih warna sorotan">
          <button v-for="color in highlightColors" :key="color" type="button" class="grid size-11 place-items-center rounded-2xl transition hover:bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 dark:hover:bg-slate-800" :aria-label="`Simpan sorotan ${color}`" @click="applyHighlight(color)"><span class="size-5 rounded-full" :class="colorDotClass(color)" /></button>
          <button type="button" class="min-h-11 rounded-2xl px-3 text-sm font-semibold text-slate-600 hover:bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 dark:text-slate-300 dark:hover:bg-slate-800" @click="showHighlightMenu = false">Batal</button>
        </div>
      </Transition>

      <header class="mb-8 flex flex-wrap items-end justify-between gap-5 border-b border-slate-200 pb-6 dark:border-slate-800">
        <div>
          <p class="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-800 dark:text-emerald-300">FiGo · Koleksi terbuka</p>
          <h1 class="mt-2 font-serif text-3xl font-semibold tracking-tight text-slate-950 md:text-4xl dark:text-white">Pengetahuan Nusantara</h1>
          <p class="mt-2 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300">Arsip spiritual, sastra, sejarah, dan pemikiran Nusantara. Baca pelan, simpan jejak, lanjutkan kapan saja.</p>
        </div>
        <NuxtLink to="/" class="inline-flex min-h-11 items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:border-emerald-600 hover:text-emerald-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:hover:text-emerald-300"><svg class="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="m15 18-6-6 6-6" /></svg>Beranda</NuxtLink>
      </header>

      <div v-if="loading" class="grid min-h-64 place-items-center" role="status"><div class="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300"><span class="size-4 animate-pulse rounded-full bg-emerald-600" />Memuat arsip…</div></div>

      <template v-else-if="!selectedDoc">
        <section class="mb-8 rounded-2xl border border-slate-200 bg-slate-50/70 p-5 dark:border-slate-800 dark:bg-slate-900/30"><div class="max-w-4xl"><h2 class="font-serif text-2xl font-semibold text-slate-950 dark:text-white">Telusuri koleksi</h2><p class="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">Gunakan pencarian, kategori, atau daftar simpanan untuk menemukan bacaan.</p><ArticleFilters class="mt-5" :categories="categories" :search-query="catalogue.searchQuery.value" :selected-category="catalogue.selectedCategory.value" :sort-mode="catalogue.sortMode.value" :result-count="catalogue.filteredDocuments.value.length" @update:search-query="catalogue.searchQuery.value = $event" @update:selected-category="catalogue.selectedCategory.value = $event" @update:sort-mode="catalogue.sortMode.value = $event" @reset="catalogue.resetFilters" /></div></section>
        <ArticleCatalogue :articles="catalogue.paginatedDocuments.value" :pinned-ids="pinnedIds" :progress="progress" :page="catalogue.currentGridPage.value" :total-pages="catalogue.totalGridPages.value" @toggle-pin="togglePin" @update:page="goToCataloguePage" @previous-page="catalogue.prevGridPage" @next-page="catalogue.nextGridPage" @reset="catalogue.resetFilters" />
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
          <div :class="[readerSettings.fontFamily, readerSettings.textAlign]" :style="{ fontSize: `${readerSettings.fontSize}px` }" class="space-y-7 leading-[1.9] text-slate-800 selection:bg-emerald-200 dark:text-slate-200 dark:selection:bg-emerald-800">
            <p v-for="(paragraph, index) in paragraphs" :key="index" :data-pidx="index" class="break-words" v-html="renderParagraph(paragraph, index)" />
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
const catalogue = useArticleCatalogue(documents, pinnedIds)
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
    const result = await $fetch<ArticleData | string>(article.url)
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
const goToCataloguePage = (page: number) => { catalogue.currentGridPage.value = page; window.scrollTo({ top: 0, behavior: 'smooth' }) }
const scrollReaderTop = () => nextTick(() => document.querySelector('#baca-top')?.scrollIntoView({ behavior: 'smooth', block: 'start' }))
const goToPage = (page: number) => { currentPage.value = Math.min(totalPages.value, Math.max(1, page)); scrollReaderTop() }
const nextPage = () => goToPage(currentPage.value + 1)
const previousPage = () => goToPage(currentPage.value - 1)
const colorDotClass = (color: ArticleHighlight['color']) => ({ yellow: 'bg-amber-400', emerald: 'bg-emerald-500', indigo: 'bg-indigo-500' }[color])

const handleTextSelection = () => {
  const selected = window.getSelection()
  const text = selected?.toString().replace(/\s+/g, ' ').trim() || ''
  const node = selected?.anchorNode?.parentElement
  const paragraph = node?.closest('p[data-pidx]')
  if (!selectedDoc.value || text.length < 3 || !paragraph) { showHighlightMenu.value = false; return }
  selection.value = { text, pIdx: Number(paragraph.dataset.pidx) }
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
    const url = new URL(value)
    return ['http:', 'https:'].includes(url.protocol) ? url.href : ''
  } catch { return '' }
}
const renderParagraph = (value: string, pIdx: number) => {
  let rendered = escapeHtml(value)
  for (const highlight of docHighlights.value.filter((item) => item.page === currentPage.value && item.pIdx === pIdx)) {
    const text = escapeHtml(highlight.text)
    if (rendered.includes(text)) rendered = rendered.replace(text, `<mark data-highlight="${highlight.pIdx}" class="${highlightClass(highlight.color)}">${text}</mark>`)
  }
  rendered = rendered.replace(/\[IMAGE_ASSET:\s*(https?:\/\/[^\]]+)\]/gi, (_all, value) => {
    const url = safeUrl(value)
    return url ? `<img src="${url}" alt="Ilustrasi pendukung artikel" class="my-8 mx-auto max-w-full rounded-2xl border border-slate-200 dark:border-slate-800" loading="lazy">` : ''
  })
  rendered = rendered.replace(/\[FLIPBOOK:\s*(https?:\/\/[^\]]+)\]/gi, (_all, value) => {
    const url = safeUrl(value)
    return url ? `<iframe src="${url}" title="Flipbook artikel" class="my-8 h-[65vh] w-full rounded-2xl border border-slate-200 dark:border-slate-800" loading="lazy"></iframe>` : ''
  })
  return rendered.replace(/↳\s*Terjemahan:\s*(.*)/gi, '<span class="mt-4 block border-l-2 border-emerald-600 pl-4 text-sm italic text-emerald-900 dark:border-emerald-400 dark:text-emerald-200">Terjemahan: $1</span>')
}
const highlightClass = (color: ArticleHighlight['color']) => ({ yellow: 'rounded-sm bg-amber-200 px-1 text-slate-950 dark:bg-amber-500/40 dark:text-white', emerald: 'rounded-sm bg-emerald-200 px-1 text-slate-950 dark:bg-emerald-500/40 dark:text-white', indigo: 'rounded-sm bg-indigo-200 px-1 text-slate-950 dark:bg-indigo-500/40 dark:text-white' }[color])
const jumpToHighlight = (highlight: ArticleHighlight) => {
  goToPage(highlight.page)
  setTimeout(() => document.querySelector(`[data-highlight="${highlight.pIdx}"]`)?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 300)
}

onMounted(async () => {
  pinnedIds.value = storage.loadPins()
  catalogue.sortMode.value = storage.loadSort()
  loadReaderState()
  attachProgressTracking()
  document.addEventListener('selectionchange', handleTextSelection)
  await openFromRoute()
})
onUnmounted(() => { detachProgressTracking(); document.removeEventListener('selectionchange', handleTextSelection) })
watch(() => route.query.id, openFromRoute)
watch([selectedDoc, currentPage], () => { if (selectedDoc.value) replaceReaderQuery() })
watch(() => catalogue.sortMode.value, (sort) => storage.saveSort(sort))
watch(currentPage, () => setTimeout(calculateProgress, 300))
</script>

<style scoped>
:global(footer), :global(.footer), :global([class*="footer"]), :global(#footer) { display: none !important; }
.slide-down-enter-active, .slide-down-leave-active { transition: opacity .2s ease, transform .2s ease; }
.slide-down-enter-from, .slide-down-leave-to { opacity: 0; transform: translate(-50%, -1rem); }
</style>

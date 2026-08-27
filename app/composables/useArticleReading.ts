import { computed, onUnmounted, ref, watch, type Ref } from 'vue'
import type { ArticleHighlight, ArticleSummary, ReaderSettings, ReadingProgress } from '~/types/articles'
import { DEFAULT_READER_SETTINGS } from '~/types/articles'
import { useArticleStorage } from '~/composables/useArticleStorage'

export function useArticleReading(
  selectedDoc: Ref<ArticleSummary | null>,
  currentPage: Ref<number>,
  totalPages: Ref<number>,
) {
  const storage = useArticleStorage()
  const readerSettings = ref<ReaderSettings>({ ...DEFAULT_READER_SETTINGS })
  const progress = ref<Record<string, ReadingProgress>>({})
  const highlights = ref<ArticleHighlight[]>([])
  let timer: ReturnType<typeof setTimeout> | undefined

  const docHighlights = computed(() => selectedDoc.value
    ? highlights.value.filter((item) => item.docId === selectedDoc.value?.id)
    : [])

  const loadReaderState = () => {
    readerSettings.value = storage.loadSettings()
    progress.value = storage.loadProgress()
    highlights.value = storage.loadHighlights()
  }

  const saveProgress = (percent: number) => {
    const doc = selectedDoc.value
    if (!doc) return
    progress.value = {
      ...progress.value,
      [doc.id]: {
        docId: doc.id,
        docTitle: doc.judul,
        page: currentPage.value,
        percent: Math.min(100, Math.max(0, Math.floor(percent))),
        timestamp: Date.now(),
      },
    }
    storage.saveProgress(progress.value)
  }

  const calculateProgress = () => {
    if (typeof window === 'undefined' || !selectedDoc.value || !totalPages.value) return
    const scrollableHeight = Math.max(1, document.documentElement.scrollHeight - window.innerHeight)
    const scrollFraction = Math.min(1, Math.max(0, window.scrollY / scrollableHeight))
    saveProgress((((currentPage.value - 1) + scrollFraction) / totalPages.value) * 100)
  }

  const attachProgressTracking = () => {
    if (typeof window === 'undefined') return
    const schedule = () => {
      if (timer) return
      timer = setTimeout(() => {
        timer = undefined
        calculateProgress()
      }, 200)
    }
    window.addEventListener('scroll', schedule, { passive: true })
    watch([selectedDoc, currentPage], () => setTimeout(calculateProgress, 250))
    onUnmounted(() => window.removeEventListener('scroll', schedule))
  }

  const detachProgressTracking = () => {
    if (timer) clearTimeout(timer)
    timer = undefined
  }

  const resetReaderSettings = () => {
    readerSettings.value = { ...DEFAULT_READER_SETTINGS }
  }

  const saveHighlight = (highlight: ArticleHighlight) => {
    const existing = highlights.value.findIndex((item) => (
      item.docId === highlight.docId
      && item.page === highlight.page
      && item.pIdx === highlight.pIdx
      && item.text === highlight.text
    ))
    if (existing >= 0) highlights.value[existing] = highlight
    else highlights.value.push(highlight)
    storage.saveHighlights(highlights.value)
  }

  const removeHighlight = (highlight: ArticleHighlight) => {
    highlights.value = highlights.value.filter((item) => !(
      item.docId === highlight.docId
      && item.page === highlight.page
      && item.pIdx === highlight.pIdx
      && item.text === highlight.text
    ))
    storage.saveHighlights(highlights.value)
  }

  watch(readerSettings, (settings) => storage.saveSettings(settings), { deep: true })

  return {
    readerSettings,
    progress,
    highlights,
    docHighlights,
    loadReaderState,
    attachProgressTracking,
    detachProgressTracking,
    calculateProgress,
    saveProgress,
    resetReaderSettings,
    saveHighlight,
    removeHighlight,
  }
}

import { computed, ref, watch, type Ref } from 'vue'
import type { ArticleSummary } from '~/app/types/articles'

const PAGE_SIZE = 9
const DEFAULT_CATEGORY = 'Semua'
const DEFAULT_SORT = 'new_old'

export const ARTICLE_CATALOGUE_DEFAULTS = {
  category: DEFAULT_CATEGORY,
  sort: DEFAULT_SORT,
  pageSize: PAGE_SIZE,
} as const

export function useArticleCatalogue(
  documents: Ref<ArticleSummary[]>,
  pinnedIds: Ref<string[]>,
) {
  const searchQuery = ref('')
  const selectedCategory = ref(DEFAULT_CATEGORY)
  const sortMode = ref(DEFAULT_SORT)
  const currentGridPage = ref(1)
  const cataloguePage = currentGridPage

  const filteredDocuments = computed(() => {
    const query = searchQuery.value.trim().toLocaleLowerCase('id-ID')
    const documentsMatchingFilters = documents.value.filter((article) => {
      const searchableText = [
        article.judul,
        article.tokoh,
        article.deskripsi,
        article.kategori,
        ...article.tags,
      ]
        .join(' ')
        .toLocaleLowerCase('id-ID')

      return (!query || searchableText.includes(query))
        && (selectedCategory.value === DEFAULT_CATEGORY || article.kategori === selectedCategory.value)
    })

    const sorted = [...documentsMatchingFilters]
    if (sortMode.value === 'old_new') sorted.reverse()
    if (sortMode.value === 'az') sorted.sort((a, b) => a.judul.localeCompare(b.judul, 'id'))
    if (sortMode.value === 'za') sorted.sort((a, b) => b.judul.localeCompare(a.judul, 'id'))

    return sorted.sort((a, b) => (
      Number(pinnedIds.value.includes(b.id)) - Number(pinnedIds.value.includes(a.id))
    ))
  })

  const totalGridPages = computed(() => Math.max(1, Math.ceil(filteredDocuments.value.length / PAGE_SIZE)))
  const paginatedDocuments = computed(() => {
    const offset = (currentGridPage.value - 1) * PAGE_SIZE
    return filteredDocuments.value.slice(offset, offset + PAGE_SIZE)
  })

  const resetFilters = () => {
    searchQuery.value = ''
    selectedCategory.value = DEFAULT_CATEGORY
    sortMode.value = DEFAULT_SORT
  }

  const nextGridPage = () => {
    currentGridPage.value = Math.min(totalGridPages.value, currentGridPage.value + 1)
  }

  const prevGridPage = () => {
    currentGridPage.value = Math.max(1, currentGridPage.value - 1)
  }

  watch([searchQuery, selectedCategory, sortMode], () => {
    currentGridPage.value = 1
  })

  watch(totalGridPages, (total) => {
    currentGridPage.value = Math.min(currentGridPage.value, total)
  })

  return {
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
  }
}

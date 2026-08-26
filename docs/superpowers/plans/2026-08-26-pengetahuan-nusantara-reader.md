# Pengetahuan Nusantara Reader Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make `/articles` a calm, accessible, responsive Nusantara library catalogue and reader while preserving datasets, query links, saved state, highlights, and reading progress.

**Architecture:** Keep `app/pages/articles.vue` as route-level orchestration initially, but move pure catalogue/reader state into composables and focused visual units into `app/components/articles/`. Use Vue props/events for presentation boundaries and `useRoute`/`useRouter` for shareable state. Keep localStorage keys backward-compatible while introducing explicit, validated helper functions.

**Tech Stack:** Nuxt 4.4.2, Vue 3.5.30 Composition API, Vue Router 5.0.3, Tailwind CSS 6.14.0, native browser accessibility APIs/localStorage.

**Spec:** `docs/superpowers/specs/2026-08-26-pengetahuan-nusantara-reader-design.md`

## Global Constraints

- Preserve existing datasets, route compatibility for `?id=...&page=...`, pagination, saved items, highlights, and read progress.
- Use Tailwind light/dark utilities; no new hard-coded dark backgrounds such as `dark:bg-[#121212]` in redesigned article units.
- Use `rounded-2xl` for major panels; restrained shadows; no emoji in UI.
- Do not modify unrelated local changes: `app/pages/index.vue`, `app/pages/tools/artikel.vue`, `backend-go/figo-api`, `nuxt.config.ts`, `patch_nuxt.js`, `scripts/check_vue.cjs`, `scripts/update_dataset_ui.cjs`, or article datasets unless a tested route dependency requires it.
- Normal text contrast must meet 4.5:1; all standalone pointer controls target at least 44×44px; icon-only controls need visible tooltip/title and `aria-label`.
- Use real `button`, `NuxtLink`, `label`, `input`, and `select` semantics. Never use click handlers on generic card containers as the sole open behavior.
- Every behavior change begins with a failing test/check, followed by minimal code, verification, then a focused commit.

---

## File Structure

| File | Responsibility |
|---|---|
| `app/types/articles.ts` | Shared Article, progress, settings, highlight, and catalogue query contracts. |
| `app/composables/useArticleStorage.ts` | Safe, SSR-guarded localStorage read/write for pins, progress, settings, and highlights. |
| `app/composables/useArticleCatalogue.ts` | Search/filter/sort/page derivation plus URL query serialization/parsing. |
| `app/components/articles/ArticleFilters.vue` | Accessible search, sorting, category chips, result count, reset action. |
| `app/components/articles/ArticleCard.vue` | Semantically linked article preview and independent save action. |
| `app/components/articles/ArticleCatalogue.vue` | Skeleton/error/empty/grid/pagination composition. |
| `app/components/articles/ReaderSettings.vue` | Reusable readable-setting controls for desktop panel or mobile sheet. |
| `app/components/articles/ReaderOutline.vue` | Article navigation and highlight list UI for sidebar/drawer. |
| `app/components/articles/ArticleReader.vue` | Three-column desktop and drawer/sheet mobile reader composition. |
| `app/pages/articles.vue` | Article data, dataset loading, route adapter, retained text rendering, and composition of catalogue/reader. |
| `scripts/test_articles_ui.mjs` | Deterministic static/component-contract checks when project has no existing unit test runner. |

## Task 1: Establish shared contracts and storage behavior

**Files:**
- Create: `app/types/articles.ts`
- Create: `app/composables/useArticleStorage.ts`
- Create: `scripts/test_articles_ui.mjs`
- Modify: `package.json` — add `test:articles` script

**Interfaces:**
- Produces `ArticleSummary`, `ReadingProgress`, `ReaderSettings`, `ArticleHighlight`, `DEFAULT_READER_SETTINGS`.
- Produces `useArticleStorage()` returning `{ loadPins, savePins, loadProgress, saveProgress, loadSettings, saveSettings, loadHighlights, saveHighlights }`.
- Existing compatibility keys: `figo_pinned_articles`, `figo_article_progress_map`, `figo_reader_settings`, `figo_article_highlights`.

- [ ] **Step 1: Write static failing test/check for storage contracts**

Create `scripts/test_articles_ui.mjs`:

```js
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const storage = readFileSync('app/composables/useArticleStorage.ts', 'utf8')
for (const token of [
  'figo_pinned_articles',
  'figo_article_progress_map',
  'figo_reader_settings',
  'figo_article_highlights',
  'typeof window === \'undefined\'',
]) {
  assert.ok(storage.includes(token), `Missing storage contract: ${token}`)
}
console.log('article storage contracts pass')
```

Add to `package.json` scripts:

```json
"test:articles": "node scripts/test_articles_ui.mjs"
```

- [ ] **Step 2: Run check and verify RED**

Run: `npm run test:articles`

Expected: FAIL because `app/composables/useArticleStorage.ts` does not exist.

- [ ] **Step 3: Create shared type contracts**

Create `app/types/articles.ts`:

```ts
export interface ArticleSummary {
  id: string
  judul: string
  tokoh: string
  kategori: string
  tags: string[]
  deskripsi: string
  url: string
  data: Record<string, unknown> | null
}

export interface ReadingProgress {
  docId: string
  docTitle: string
  page: number
  percent: number
  timestamp: number
}

export interface ReaderSettings {
  fontSize: number
  fontFamily: 'font-serif' | 'font-sans'
  textAlign: 'text-left' | 'text-justify'
}

export interface ArticleHighlight {
  text: string
  color: 'yellow' | 'emerald' | 'indigo'
  docId: string
  page: number
  pIdx: number
}

export const DEFAULT_READER_SETTINGS: ReaderSettings = {
  fontSize: 18,
  fontFamily: 'font-serif',
  textAlign: 'text-left',
}
```

- [ ] **Step 4: Create minimal SSR-safe storage composable**

Create `app/composables/useArticleStorage.ts`:

```ts
import type { ArticleHighlight, ReaderSettings, ReadingProgress } from '~/app/types/articles'
import { DEFAULT_READER_SETTINGS } from '~/app/types/articles'

const KEYS = {
  pins: 'figo_pinned_articles',
  progress: 'figo_article_progress_map',
  settings: 'figo_reader_settings',
  highlights: 'figo_article_highlights',
} as const

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback
  try {
    const value = window.localStorage.getItem(key)
    return value ? JSON.parse(value) as T : fallback
  } catch {
    return fallback
  }
}

function writeJson<T>(key: string, value: T): void {
  if (typeof window !== 'undefined') window.localStorage.setItem(key, JSON.stringify(value))
}

export function useArticleStorage() {
  return {
    loadPins: () => readJson<string[]>(KEYS.pins, []),
    savePins: (pins: string[]) => writeJson(KEYS.pins, pins),
    loadProgress: () => readJson<Record<string, ReadingProgress>>(KEYS.progress, {}),
    saveProgress: (progress: Record<string, ReadingProgress>) => writeJson(KEYS.progress, progress),
    loadSettings: () => ({ ...DEFAULT_READER_SETTINGS, ...readJson<Partial<ReaderSettings>>(KEYS.settings, {}) }),
    saveSettings: (settings: ReaderSettings) => writeJson(KEYS.settings, settings),
    loadHighlights: () => readJson<ArticleHighlight[]>(KEYS.highlights, []),
    saveHighlights: (highlights: ArticleHighlight[]) => writeJson(KEYS.highlights, highlights),
  }
}
```

- [ ] **Step 5: Run check and verify GREEN**

Run: `npm run test:articles`

Expected: PASS with `article storage contracts pass`.

- [ ] **Step 6: Run Vue syntax verification**

Run: `node scripts/check_vue.cjs`

Expected: Existing article page remains valid; no new error caused by types/composable.

- [ ] **Step 7: Commit**

```bash
git add package.json app/types/articles.ts app/composables/useArticleStorage.ts scripts/test_articles_ui.mjs
git commit -m "feat: add article reader storage contracts"
```

## Task 2: Extract shareable catalogue state

**Files:**
- Create: `app/composables/useArticleCatalogue.ts`
- Modify: `scripts/test_articles_ui.mjs`
- Modify: `app/pages/articles.vue:397-495, 910-947`

**Interfaces:**
- Consumes: `ArticleSummary` from `app/types/articles.ts`.
- Produces `useArticleCatalogue(documents, pinnedIds)` returning `{ searchQuery, selectedCategory, sortMode, currentGridPage, filteredDocuments, paginatedDocuments, totalGridPages, resetFilters, nextGridPage, prevGridPage }`. Route-query parsing and synchronization stay in `app/pages/articles.vue`, where reader and catalogue state must remain merged.
- Catalogue query keys: `q`, `category`, `sort`, `cataloguePage`. Reader keys remain `id`, `page`.

- [ ] **Step 1: Extend static check with catalogue requirements**

Append to `scripts/test_articles_ui.mjs`:

```js
const catalogue = readFileSync('app/composables/useArticleCatalogue.ts', 'utf8')
for (const token of ['filteredDocuments', 'resetFilters', 'cataloguePage', 'selectedCategory']) {
  assert.ok(catalogue.includes(token), `Missing catalogue contract: ${token}`)
}
```

- [ ] **Step 2: Run check and verify RED**

Run: `npm run test:articles`

Expected: FAIL because `app/composables/useArticleCatalogue.ts` does not exist.

- [ ] **Step 3: Implement `useArticleCatalogue`**

Create `app/composables/useArticleCatalogue.ts` with this public shape:

```ts
import { computed, ref, watch, type Ref } from 'vue'
import type { ArticleSummary } from '~/app/types/articles'

const PAGE_SIZE = 9
const DEFAULT_CATEGORY = 'Semua'
const DEFAULT_SORT = 'new_old'

export function useArticleCatalogue(documents: Ref<ArticleSummary[]>, pinnedIds: Ref<string[]>) {
  const searchQuery = ref('')
  const selectedCategory = ref(DEFAULT_CATEGORY)
  const sortMode = ref(DEFAULT_SORT)
  const currentGridPage = ref(1)

  const filteredDocuments = computed(() => {
    const query = searchQuery.value.trim().toLocaleLowerCase('id-ID')
    const list = documents.value.filter((document) => {
      const searchable = [document.judul, document.tokoh, document.deskripsi, document.kategori, ...document.tags]
        .join(' ')
        .toLocaleLowerCase('id-ID')
      return (!query || searchable.includes(query))
        && (selectedCategory.value === DEFAULT_CATEGORY || document.kategori === selectedCategory.value)
    })

    const sorted = [...list]
    if (sortMode.value === 'old_new') sorted.reverse()
    if (sortMode.value === 'az') sorted.sort((a, b) => a.judul.localeCompare(b.judul, 'id'))
    if (sortMode.value === 'za') sorted.sort((a, b) => b.judul.localeCompare(a.judul, 'id'))
    return sorted.sort((a, b) => Number(pinnedIds.value.includes(b.id)) - Number(pinnedIds.value.includes(a.id)))
  })

  const totalGridPages = computed(() => Math.max(1, Math.ceil(filteredDocuments.value.length / PAGE_SIZE)))
  const paginatedDocuments = computed(() => filteredDocuments.value.slice((currentGridPage.value - 1) * PAGE_SIZE, currentGridPage.value * PAGE_SIZE))
  const resetFilters = () => { searchQuery.value = ''; selectedCategory.value = DEFAULT_CATEGORY; sortMode.value = DEFAULT_SORT }
  const nextGridPage = () => { currentGridPage.value = Math.min(totalGridPages.value, currentGridPage.value + 1) }
  const prevGridPage = () => { currentGridPage.value = Math.max(1, currentGridPage.value - 1) }

  watch([searchQuery, selectedCategory, sortMode], () => { currentGridPage.value = 1 })
  watch(totalGridPages, (pages) => { currentGridPage.value = Math.min(currentGridPage.value, pages) })

  return { searchQuery, selectedCategory, sortMode, currentGridPage, filteredDocuments, paginatedDocuments, totalGridPages, resetFilters, nextGridPage, prevGridPage }
}
```

- [ ] **Step 4: Replace duplicated catalogue state in page**

In `app/pages/articles.vue`:

- Import `useArticleCatalogue`, `ArticleSummary`, and `useArticleStorage`.
- Replace direct `searchQuery`, `selectedCategory`, `sortMode`, grid paging, filter/sort computed values, and page methods with composable results.
- Initialize `pinnedIds` and persisted sort in `onMounted` before catalogue interaction.
- Preserve existing query `id` and `page`; do not drop reader links.

- [ ] **Step 5: Add query synchronisation**

Implement a dedicated page-level watch that preserves both reader and catalogue keys:

```ts
watch([searchQuery, selectedCategory, sortMode, currentGridPage, selectedDoc, currentPage], () => {
  router.replace({
    query: {
      ...(selectedDoc.value ? { id: selectedDoc.value.id, page: String(currentPage.value) } : {}),
      ...(searchQuery.value ? { q: searchQuery.value } : {}),
      ...(selectedCategory.value !== 'Semua' ? { category: selectedCategory.value } : {}),
      ...(sortMode.value !== 'new_old' ? { sort: sortMode.value } : {}),
      ...(currentGridPage.value > 1 ? { cataloguePage: String(currentGridPage.value) } : {}),
    },
  })
})
```

At mounting, validate incoming query values against categories/sort options before setting state. Use `Number.parseInt` and clamp catalogue page later through computed total pages.

- [ ] **Step 6: Run checks and build**

Run:

```bash
npm run test:articles
node scripts/check_vue.cjs
npm run build
```

Expected: all pass.

- [ ] **Step 7: Commit**

```bash
git add app/composables/useArticleCatalogue.ts app/pages/articles.vue scripts/test_articles_ui.mjs
git commit -m "feat: preserve article catalogue state in URL"
```

## Task 3: Build accessible catalogue controls and cards

**Files:**
- Create: `app/components/articles/ArticleFilters.vue`
- Create: `app/components/articles/ArticleCard.vue`
- Create: `app/components/articles/ArticleCatalogue.vue`
- Modify: `app/pages/articles.vue:27-151`
- Modify: `scripts/test_articles_ui.mjs`

**Interfaces:**
- `ArticleFilters` props: `categories`, `searchQuery`, `selectedCategory`, `sortMode`, `resultCount`; emits `update:searchQuery`, `update:selectedCategory`, `update:sortMode`, `reset`.
- `ArticleCard` props: `document: ArticleSummary`, `progress?: ReadingProgress`, `isPinned`; emits `toggle-pin`.
- `ArticleCatalogue` props: all catalogue data plus `loading`, `error`; emits `open`, `toggle-pin`, `previous-page`, `next-page`, `go-to-page`, and filter update events.

- [ ] **Step 1: Extend static check for UI accessibility markers**

Append to `scripts/test_articles_ui.mjs`:

```js
for (const [file, tokens] of Object.entries({
  'app/components/articles/ArticleFilters.vue': ['aria-label="Cari artikel"', 'aria-pressed', 'Reset filter'],
  'app/components/articles/ArticleCard.vue': ['NuxtLink', 'aria-label="Simpan artikel"', 'Baca artikel', 'Lanjut baca'],
  'app/components/articles/ArticleCatalogue.vue': ['role="status"', 'Artikel tidak ditemukan', 'aria-current="page"'],
})) {
  const content = readFileSync(file, 'utf8')
  for (const token of tokens) assert.ok(content.includes(token), `${file} missing ${token}`)
}
```

- [ ] **Step 2: Run check and verify RED**

Run: `npm run test:articles`

Expected: FAIL because article components do not exist.

- [ ] **Step 3: Implement `ArticleFilters.vue`**

Use native controls and exact interaction contract:

```vue
<script setup lang="ts">
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
const hasActiveFilters = computed(() => props.searchQuery.length > 0 || props.selectedCategory !== 'Semua' || props.sortMode !== 'new_old')
</script>
```

Template requirements:

- Search label visually hidden; `aria-label="Cari artikel"`.
- Clear-search button is 44px square with `aria-label="Hapus pencarian"`.
- Sort label is visible to assistive tech and uses a native select.
- Category buttons use `:aria-pressed="selectedCategory === category"`.
- Active category uses background, border, and text changes.
- Result count copy: `Menampilkan {{ resultCount }} artikel`.
- Reset button renders only when `hasActiveFilters` and uses text `Reset filter`.
- Use responsive Tailwind controls: full-width controls at mobile and `md:grid-cols-[minmax(0,1fr)_auto]` from tablet.

- [ ] **Step 4: Implement `ArticleCard.vue`**

Use `NuxtLink` to preserve semantics. The card should not have a generic `@click` container.

```vue
<script setup lang="ts">
import type { ArticleSummary, ReadingProgress } from '~/app/types/articles'

const props = defineProps<{
  document: ArticleSummary
  progress?: ReadingProgress
  isPinned: boolean
}>()
defineEmits<{ 'toggle-pin': [id: string] }>()
const hasProgress = computed(() => Boolean(props.progress && props.progress.percent > 0))
</script>
```

Template requirements:

- Outer panel: `rounded-2xl`, flex column; dark/light Tailwind surface styles only.
- A `NuxtLink` to `{ path: '/articles', query: { id: document.id, page: progress?.page || 1 } }` wraps text title/excerpt area.
- Category badge uses sentence case, not all-uppercase author text.
- Pin is a separate 44px button. Dynamic label exactly `Simpan artikel` or `Hapus dari tersimpan`.
- Excerpt has `line-clamp-3`, `text-sm md:text-base`, readable body color.
- Footer has exact new/resume labels: `Baca artikel` / `Lanjut baca · {{ progress?.percent }}%`.
- Resumable progress has `<div role="progressbar" :aria-valuenow="progress.percent" aria-label="Progres baca Anda">`.
- Visible `focus-visible:ring-2` styles on link and pin.

- [ ] **Step 5: Implement `ArticleCatalogue.vue`**

Compose `ArticleFilters` and `ArticleCard`; no data calculation belongs here.

Requirements:

- Loading state: three `aria-busy="true"` card-shaped skeletons labelled `Memuat artikel`.
- Empty state: `role="status"`, title `Artikel tidak ditemukan`, sentence guiding reset, reset action emits `reset`.
- Grid class exactly follows one/two/three responsive pattern: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`.
- Pagination has native previous/next buttons, disabled correctly, current page uses `aria-current="page"`, all buttons have at least `min-h-11 min-w-11`.
- `@open` emits document id, `@toggle-pin` emits id.

- [ ] **Step 6: Replace old catalogue template in page**

Replace lines 27–151 catalogue header/search/grid/pagination with:

```vue
<ArticleCatalogue
  v-if="!selectedDoc"
  :categories="categories"
  :documents="paginatedDocuments"
  :search-query="searchQuery"
  :selected-category="selectedCategory"
  :sort-mode="sortMode"
  :result-count="filteredDocuments.length"
  :current-page="currentGridPage"
  :total-pages="totalGridPages"
  :pinned-ids="pinnedIds"
  :progress-map="allProgress"
  :loading="loading"
  @update:search-query="searchQuery = $event"
  @update:selected-category="selectedCategory = $event"
  @update:sort-mode="sortMode = $event"
  @reset="resetFilters"
  @open="openDetailById"
  @toggle-pin="togglePin"
  @previous-page="prevGridPage"
  @next-page="nextGridPage"
  @go-to-page="currentGridPage = $event"
/>
```

Add `openDetailById(id: string)` to find the document, call existing `openDetail`, and scroll to `article-top` only after selection.

- [ ] **Step 7: Run checks and build**

Run:

```bash
npm run test:articles
node scripts/check_vue.cjs
npm run build
```

Expected: all pass.

- [ ] **Step 8: Commit**

```bash
git add app/components/articles/ArticleFilters.vue app/components/articles/ArticleCard.vue app/components/articles/ArticleCatalogue.vue app/pages/articles.vue scripts/test_articles_ui.mjs
git commit -m "feat: add accessible article catalogue"
```

## Task 4: Extract safe reading preferences and progress lifecycle

**Files:**
- Create: `app/composables/useArticleReading.ts`
- Modify: `app/pages/articles.vue:496-516, 840-955`
- Modify: `scripts/test_articles_ui.mjs`

**Interfaces:**
- Consumes `ReaderSettings`, `ReadingProgress`, `ArticleHighlight`, `useArticleStorage`.
- Produces `useArticleReading()` returning `{ readerSettings, allProgress, highlights, load, resetReaderSettings, saveProgress, attachProgressTracking, detachProgressTracking }`.
- `saveProgress({ docId, docTitle, page, totalPages, scrollFraction })` clamps percent to `[0, 100]`.

- [ ] **Step 1: Add static check for reader lifecycle**

Append:

```js
const reading = readFileSync('app/composables/useArticleReading.ts', 'utf8')
for (const token of ['DEFAULT_READER_SETTINGS', 'Math.min(100', 'Math.max(0', 'detachProgressTracking']) {
  assert.ok(reading.includes(token), `Missing reader lifecycle contract: ${token}`)
}
```

- [ ] **Step 2: Run check and verify RED**

Run: `npm run test:articles`

Expected: FAIL because `app/composables/useArticleReading.ts` does not exist.

- [ ] **Step 3: Implement `useArticleReading.ts`**

Implement this core behavior:

```ts
import { ref, watch } from 'vue'
import type { ArticleHighlight, ReaderSettings, ReadingProgress } from '~/app/types/articles'
import { DEFAULT_READER_SETTINGS } from '~/app/types/articles'
import { useArticleStorage } from '~/app/composables/useArticleStorage'

export function useArticleReading() {
  const storage = useArticleStorage()
  const readerSettings = ref<ReaderSettings>({ ...DEFAULT_READER_SETTINGS })
  const allProgress = ref<Record<string, ReadingProgress>>({})
  const highlights = ref<ArticleHighlight[]>([])
  let timer: ReturnType<typeof setTimeout> | undefined

  const load = () => {
    readerSettings.value = storage.loadSettings()
    allProgress.value = storage.loadProgress()
    highlights.value = storage.loadHighlights()
  }
  const resetReaderSettings = () => { readerSettings.value = { ...DEFAULT_READER_SETTINGS } }
  const saveProgress = ({ docId, docTitle, page, totalPages, scrollFraction }: { docId: string; docTitle: string; page: number; totalPages: number; scrollFraction: number }) => {
    const percent = Math.min(100, Math.max(0, Math.floor((((page - 1) + scrollFraction) / Math.max(1, totalPages)) * 100)))
    allProgress.value = { ...allProgress.value, [docId]: { docId, docTitle, page, percent, timestamp: Date.now() } }
    storage.saveProgress(allProgress.value)
  }

  watch(readerSettings, (value) => storage.saveSettings(value), { deep: true })
  watch(highlights, (value) => storage.saveHighlights(value), { deep: true })

  const attachProgressTracking = (getPayload: () => Parameters<typeof saveProgress>[0] | null) => {
    const onScroll = () => {
      if (timer) return
      timer = setTimeout(() => { const payload = getPayload(); if (payload) saveProgress(payload); timer = undefined }, 250)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }
  const detachProgressTracking = () => { if (timer) clearTimeout(timer); timer = undefined }
  return { readerSettings, allProgress, highlights, load, resetReaderSettings, saveProgress, attachProgressTracking, detachProgressTracking }
}
```

- [ ] **Step 4: Replace page-local persistence/watch code**

In `articles.vue`:

- Remove direct `localStorage` references for reader settings, highlights, and progress.
- Use `const { readerSettings, allProgress, highlights, load: loadReading, resetReaderSettings, saveProgress, attachProgressTracking, detachProgressTracking } = useArticleReading()`.
- Call `loadReading()` only inside `onMounted`.
- Register scroll cleanup returned by `attachProgressTracking` and execute it in `onUnmounted`.
- Use existing current article/page data to calculate scroll fraction from reader content bounds, preferring `#baca-top` and article content height over whole-document chrome.
- Keep progress map format backward-compatible.

- [ ] **Step 5: Run checks and build**

Run:

```bash
npm run test:articles
node scripts/check_vue.cjs
npm run build
```

Expected: all pass.

- [ ] **Step 6: Commit**

```bash
git add app/composables/useArticleReading.ts app/pages/articles.vue scripts/test_articles_ui.mjs
git commit -m "refactor: isolate article reading persistence"
```

## Task 5: Build reader controls and outline components

**Files:**
- Create: `app/components/articles/ReaderSettings.vue`
- Create: `app/components/articles/ReaderOutline.vue`
- Modify: `scripts/test_articles_ui.mjs`
- Modify: `app/pages/articles.vue:156-313`

**Interfaces:**
- `ReaderSettings` props: `modelValue: ReaderSettings`, `headingId`; emits `update:modelValue`, `reset`, `close`.
- `ReaderOutline` props: `items: { page: number; label: string }[]`, `currentPage`, `highlights`; emits `navigate`, `remove-highlight`, `jump-to-highlight`, `close`.

- [ ] **Step 1: Add failing static accessibility checks**

Append:

```js
for (const [file, tokens] of Object.entries({
  'app/components/articles/ReaderSettings.vue': ['aria-label="Kurangi ukuran teks"', 'aria-label="Tambah ukuran teks"', 'Kembalikan bawaan'],
  'app/components/articles/ReaderOutline.vue': ['Daftar isi', 'aria-current', 'Sorotan tersimpan'],
})) {
  const content = readFileSync(file, 'utf8')
  for (const token of tokens) assert.ok(content.includes(token), `${file} missing ${token}`)
}
```

- [ ] **Step 2: Run check and verify RED**

Run: `npm run test:articles`

Expected: FAIL because reader components do not exist.

- [ ] **Step 3: Implement `ReaderSettings.vue`**

Requirements:

- Uses a `<section :aria-labelledby="headingId">`.
- Minus/plus are `min-h-11 min-w-11` buttons with exact accessible labels.
- Range input `min="16" max="28"`; update through copied object rather than mutating prop.
- Serif/sans and left/justify use semantic buttons and `aria-pressed`.
- Reset uses visible `Kembalikan bawaan` and emits `reset`.
- Style all substantial panels with `rounded-2xl`, `bg-white dark:bg-slate-950`, `border-slate-200 dark:border-slate-800`.

- [ ] **Step 4: Implement `ReaderOutline.vue`**

Requirements:

- Renders a semantic `<nav aria-label="Daftar isi artikel">` with each part as a real button.
- Current page button receives `aria-current="page"`.
- Renders `Sorotan tersimpan` list with empty text `Belum ada sorotan tersimpan.`.
- Each highlight jump is a real button; delete has `aria-label="Hapus sorotan"` and a 44px hit target.
- Use sentence-case labels, not all-caps utility text.

- [ ] **Step 5: Replace duplicated controls in page**

Replace mobile sheets and desktop accordion markup (existing lines 156–313) with shared components:

- Desktop left column holds `ReaderOutline` and `ReaderSettings` panels.
- Mobile uses two 44px labelled controls: `Tampilan baca` and `Daftar isi` that open existing overlays/bottom sheets.
- Bottom sheets render shared `ReaderSettings`/`ReaderOutline` components and include a real close button.
- Maintain `showMobileSettings`, `showMobileSidebar`, `docHighlights`, `jumpToHighlight`, and `removeHighlightByObject` behavior.

- [ ] **Step 6: Run checks and build**

Run:

```bash
npm run test:articles
node scripts/check_vue.cjs
npm run build
```

Expected: all pass.

- [ ] **Step 7: Commit**

```bash
git add app/components/articles/ReaderSettings.vue app/components/articles/ReaderOutline.vue app/pages/articles.vue scripts/test_articles_ui.mjs
git commit -m "feat: add reusable article reader controls"
```

## Task 6: Compose desktop/mobile reader and improve prose hierarchy

**Files:**
- Create: `app/components/articles/ArticleReader.vue`
- Modify: `app/pages/articles.vue:153-390, 1069-1141`
- Modify: `scripts/test_articles_ui.mjs`

**Interfaces:**
- `ArticleReader` props: `document`, `chapter`, `currentPage`, `totalPages`, `readerSettings`, `progress`, `outlineItems`, `highlights`.
- Emits: `close`, `previous-page`, `next-page`, `go-to-page`, `update:readerSettings`, `reset-settings`, `open-settings`, `open-outline`, `jump-to-highlight`, `remove-highlight`.
- Slot `prose` receives reader content placement so page retains existing safe paragraph/render logic.

- [ ] **Step 1: Add failing reader composition checks**

Append:

```js
const reader = readFileSync('app/components/articles/ArticleReader.vue', 'utf8')
for (const token of ['lg:grid-cols-12', 'max-w-[680px]', 'Progres baca Anda', 'Artikel sebelumnya', 'Artikel berikutnya', '<slot name="prose"']) {
  assert.ok(reader.includes(token), `ArticleReader missing ${token}`)
}
```

- [ ] **Step 2: Run check and verify RED**

Run: `npm run test:articles`

Expected: FAIL because `ArticleReader.vue` does not exist.

- [ ] **Step 3: Implement `ArticleReader.vue`**

Requirements:

- Uses `grid grid-cols-1 lg:grid-cols-12`; left navigation `lg:col-span-3`, prose `lg:col-span-6`, right tools `lg:col-span-3`.
- Left/right areas use `lg:sticky lg:top-28 lg:self-start`; page parent must not introduce `overflow-hidden`.
- Main column centers at `max-w-[680px]`.
- Reader header shows category, title, author/source, optional reading estimate only if passed, and readable progress phrase `Progres baca Anda: N%`.
- Main prose panel uses `rounded-2xl bg-white dark:bg-slate-950 border...`; no raw hex values.
- Mobile action buttons show visible text `Tampilan baca` and `Daftar isi`, each `min-h-11`, and emit corresponding action.
- Top header only contains return to collection. Do not render page arrows there.
- Bottom navigation includes text labels `Artikel sebelumnya` and `Artikel berikutnya`; disabled states work.
- Current chapter paging uses native buttons and `aria-current="page"` for selected page.
- Slot `prose` is inside prose panel.

- [ ] **Step 4: Move page template reader shell to `ArticleReader`**

In `articles.vue`, retain only page-specific data rendering in a named slot:

```vue
<ArticleReader
  v-else
  :document="selectedDoc"
  :chapter="currentBab"
  :current-page="currentPage"
  :total-pages="totalPages"
  :reader-settings="readerSettings"
  :progress="allProgress[selectedDoc.id]"
  :outline-items="outlineItems"
  :highlights="docHighlights"
  @close="closeDetail"
  @previous-page="prevPage"
  @next-page="nextPage"
  @go-to-page="goToPage"
  @update:reader-settings="readerSettings = $event"
  @reset-settings="resetReaderSettings"
  @open-settings="showMobileSettings = true"
  @open-outline="showMobileSidebar = true"
  @jump-to-highlight="jumpToHighlight"
  @remove-highlight="removeHighlightByObject"
>
  <template #prose>
    <!-- existing getParagraphs/renderParagraph v-html loop, retained here -->
  </template>
</ArticleReader>
```

Add computed `outlineItems` from current article archive records:

```ts
const outlineItems = computed(() => (selectedDoc.value?.data?.arsip_pengetahuan ?? []).map((item, index) => ({
  page: index + 1,
  label: item.nama_wahyu || item.tema_utama || item.id_bab || `Bagian ${index + 1}`,
})))
```

Ensure article data is loaded before reader is mounted. Keep all existing optional fields guarded.

- [ ] **Step 5: Fix highlight rendering scope without a global replace**

Update `renderParagraph(rawHTML, pIdx)` only after add a small pure helper inside page/composable that restricts each stored highlight to matching `docId`, `page`, and `pIdx`, then replaces the first matching escaped exact text in that paragraph.

Add this check to `scripts/test_articles_ui.mjs`:

```js
const page = readFileSync('app/pages/articles.vue', 'utf8')
assert.ok(page.includes('h.pIdx === pIdx'), 'Highlight must stay paragraph-scoped')
assert.ok(!page.includes('replaceAll(h.text'), 'Highlight must not globally replace repeated text')
```

Keep sanitize-first behavior before injecting highlight markup. Retain image/flipbook transforms. Do not introduce a raw `v-html` path for unescaped article text.

- [ ] **Step 6: Run checks and build**

Run:

```bash
npm run test:articles
node scripts/check_vue.cjs
npm run build
```

Expected: all pass.

- [ ] **Step 7: Commit**

```bash
git add app/components/articles/ArticleReader.vue app/pages/articles.vue scripts/test_articles_ui.mjs
git commit -m "feat: compose responsive Nusantara article reader"
```

## Task 7: Visual QA, accessibility checks, and safe release review

**Files:**
- Modify: `scripts/test_articles_ui.mjs`
- Modify only if issue found: files created in Tasks 1–6

**Interfaces:**
- No new runtime interface.
- Produces a repeatable visual/accessibility acceptance checklist recorded in commit body or release note.

- [ ] **Step 1: Add final static contract checks**

Add exact file checks to `scripts/test_articles_ui.mjs`:

```js
const forbiddenDarkHex = /dark:bg-\[#(?:121212|1C1C1E|0a0a0a|1a1a1a)\]/
for (const file of [
  'app/components/articles/ArticleFilters.vue',
  'app/components/articles/ArticleCard.vue',
  'app/components/articles/ArticleCatalogue.vue',
  'app/components/articles/ReaderSettings.vue',
  'app/components/articles/ReaderOutline.vue',
  'app/components/articles/ArticleReader.vue',
]) {
  assert.ok(!forbiddenDarkHex.test(readFileSync(file, 'utf8')), `${file} has forbidden hard-coded dark surface`)
}
```

- [ ] **Step 2: Run static and build verification**

Run:

```bash
npm run test:articles
node scripts/check_vue.cjs
npm run build
```

Expected: all pass with no article component contract error.

- [ ] **Step 3: Start local server for manual responsive QA**

Run:

```bash
npm run dev
```

Open `/articles` and verify at 320px, 375px, 768px, 1024px, 1440px.

Acceptance list:

```text
[ ] Catalogue is 1/2/3 columns at specified breakpoints.
[ ] Search and sort never overflow viewport.
[ ] Category chips are horizontally reachable at mobile.
[ ] Result count and Reset filter state update correctly.
[ ] Card link opens reader; save button does not open reader.
[ ] Return to catalogue retains q/category/sort/cataloguePage state.
[ ] Existing ?id=syaichona_kholil_bangkalan&page=3 still opens page 3.
[ ] Reader prose remains one readable centered column on mobile.
[ ] Desktop reader has working outline/settings side panels without prose overlap.
[ ] Text settings persist after reload.
[ ] Scroll changes progress; catalogue shows Lanjut baca · N% afterwards.
[ ] Text highlight saves only within selected paragraph and repeat words elsewhere stay unchanged.
[ ] Tab navigation reaches every control with visible focus.
[ ] Light and dark body text remain readable.
```

- [ ] **Step 4: Inspect final diff and secrets**

Run:

```bash
git diff --check
git diff -- app/pages/articles.vue app/components/articles app/composables app/types scripts/test_articles_ui.mjs package.json
git status --short
```

Expected: only plan-scope paths plus user pre-existing changes; no credentials or unrelated modifications staged.

- [ ] **Step 5: Commit final QA corrections, only if needed**

```bash
git add app/pages/articles.vue app/components/articles app/composables app/types scripts/test_articles_ui.mjs package.json
git commit -m "fix: polish article reader accessibility"
```

Do not create an empty commit.

## Sources

- Vue component composition: https://vuejs.org/guide/essentials/component-basics.html
- Nuxt file-based pages: https://nuxt.com/docs/4.x/guide/directory-structure/app/pages
- MDN accessibility: https://developer.mozilla.org/en-US/docs/Web/Accessibility
- WCAG contrast: https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html
- WCAG target size: https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html
- Project UI rules: `frontend-ui-engineering/references/fikri-ux-guidelines.md`

## Plan Self-Review

- **Spec coverage:** Tasks 1–2 preserve storage, routes, search/filter/sort and query state. Task 3 delivers accessible catalogue/cards/states. Tasks 4–6 deliver persistent reader control, safe highlights, progress, desktop 3-column reader, mobile drawers, and sequential navigation. Task 7 verifies all breakpoints and accessibility requirements.
- **Placeholder scan:** No incomplete plan markers. Every task specifies files, public interfaces, commands, expected test outcomes, and commit scope.
- **Type consistency:** `ArticleSummary`, `ReadingProgress`, `ReaderSettings`, and `ArticleHighlight` originate in Task 1 and are consumed under identical names by all later tasks. Reader events use `update:readerSettings` consistently in Task 6.
- **Risk scope:** Every task confines changes to article-specific page/components/composables/types and test script, preserving user’s unrelated working tree modifications.

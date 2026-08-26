import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const read = (path) => readFileSync(path, 'utf8')

const storage = read('app/composables/useArticleStorage.ts')
for (const token of [
  'figo_pinned_articles',
  'figo_art_sort',
  'loadSort',
  'saveSort',
  'figo_article_progress_map',
  'figo_reader_settings',
  'figo_article_highlights',
  "typeof window === 'undefined'",
]) {
  assert.ok(storage.includes(token), `Missing storage contract: ${token}`)
}

const catalogue = read('app/composables/useArticleCatalogue.ts')
for (const token of ['filteredDocuments', 'resetFilters', 'cataloguePage', 'selectedCategory']) {
  assert.ok(catalogue.includes(token), `Missing catalogue contract: ${token}`)
}

for (const [file, tokens] of Object.entries({
  'app/components/articles/ArticleFilters.vue': ['aria-label="Cari artikel"', 'aria-pressed', 'Reset filter'],
  'app/components/articles/ArticleCard.vue': ['NuxtLink', "'Simpan artikel'", 'Baca artikel', 'Lanjut baca'],
  'app/components/articles/ArticleCatalogue.vue': ['role="status"', 'Artikel tidak ditemukan', 'aria-current'],
  'app/composables/useArticleReading.ts': ['DEFAULT_READER_SETTINGS', 'Math.min(100', 'Math.max(0', 'detachProgressTracking'],
  'app/components/articles/ReaderSettings.vue': ['aria-label="Kurangi ukuran teks"', 'aria-label="Tambah ukuran teks"', 'Kembalikan bawaan'],
  'app/components/articles/ReaderOutline.vue': ['Daftar isi', 'aria-current', 'Sorotan tersimpan'],
  'app/components/articles/ArticleReader.vue': ['lg:grid-cols-12', 'max-w-[680px]', 'Progres baca Anda', 'Artikel sebelumnya', 'Artikel berikutnya', '<slot name="prose"'],
})) {
  const content = read(file)
  for (const token of tokens) assert.ok(content.includes(token), `${file} missing ${token}`)
}

console.log('article catalogue and reader contracts pass')

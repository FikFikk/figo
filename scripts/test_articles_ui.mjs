import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const read = (path) => readFileSync(path, 'utf8')

const storage = read('app/composables/useArticleStorage.ts')
for (const token of [
  'figo_pinned_articles',
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

console.log('article storage and catalogue contracts pass')

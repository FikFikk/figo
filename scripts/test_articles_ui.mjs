import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const storage = readFileSync('app/composables/useArticleStorage.ts', 'utf8')
for (const token of [
  'figo_pinned_articles',
  'figo_article_progress_map',
  'figo_reader_settings',
  'figo_article_highlights',
  "typeof window === 'undefined'",
]) {
  assert.ok(storage.includes(token), `Missing storage contract: ${token}`)
}

console.log('article storage contracts pass')

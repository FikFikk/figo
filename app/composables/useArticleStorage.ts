import type { ArticleHighlight, ReaderSettings, ReadingProgress } from '~/types/articles'
import { DEFAULT_READER_SETTINGS } from '~/types/articles'

const KEYS = {
  pins: 'figo_pinned_articles',
  sort: 'figo_art_sort',
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
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(key, JSON.stringify(value))
  }
}

export function useArticleStorage() {
  return {
    loadPins: () => readJson<string[]>(KEYS.pins, []),
    savePins: (pins: string[]) => writeJson(KEYS.pins, pins),
    loadSort: () => readJson<string>(KEYS.sort, 'new_old'),
    saveSort: (sort: string) => writeJson(KEYS.sort, sort),
    loadProgress: () => readJson<Record<string, ReadingProgress>>(KEYS.progress, {}),
    saveProgress: (progress: Record<string, ReadingProgress>) => writeJson(KEYS.progress, progress),
    loadSettings: () => ({
      ...DEFAULT_READER_SETTINGS,
      ...readJson<Partial<ReaderSettings>>(KEYS.settings, {}),
    }),
    saveSettings: (settings: ReaderSettings) => writeJson(KEYS.settings, settings),
    loadHighlights: () => readJson<ArticleHighlight[]>(KEYS.highlights, []),
    saveHighlights: (highlights: ArticleHighlight[]) => writeJson(KEYS.highlights, highlights),
  }
}

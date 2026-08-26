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

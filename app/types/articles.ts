export interface ArticleSection {
  id_bab?: string
  nama_wahyu?: string
  tema_utama?: string
  teori_akademik?: string
  penjabaran_detail?: string
  deskripsi?: string
}

export interface ArticleData {
  buku_referensi?: string
  kategori_akademik?: string
  author?: string
  tanggal_posting?: string
  arsip_pengetahuan?: ArticleSection[]
  [key: string]: unknown
}

export interface ArticleSummary {
  id: string
  judul: string
  tokoh: string
  kategori: string
  tags: string[]
  deskripsi: string
  url: string
  data: ArticleData | null
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

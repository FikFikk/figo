// ============================================================
// Shared types untuk seluruh media downloader system
// ============================================================

/** Item kualitas video/audio yang tersedia */
export interface Quality {
  height: number
  url: string
  filesize?: number | null
  label?: string
}

/** Satu item media (foto, video, atau GIF) */
export interface MediaItem {
  type: 'photo' | 'video' | 'gif'
  url: string
  thumbnail: string
  width: number
  height: number
  duration?: number
  qualities?: Quality[]
}

/** Statistik engagement dari platform */
export interface MediaStatistics {
  likes?: number | string
  comments?: number | string
  retweets?: number
  shares?: number
  views?: number
}

/** Hasil fetch info dari platform manapun — kontrak seragam */
export interface PlatformResult {
  source: string
  id?: string
  title: string
  uploader: string
  thumb: string | null
  avatar: string | null
  duration?: number | null
  mediaItems: MediaItem[]
  statistics?: MediaStatistics
}

/** Status job download background */
export interface DownloadJob {
  status: 'processing' | 'done' | 'error'
  filePath?: string
  ext?: string
  mimeType?: string
  error?: string
  title?: string
  /** Timestamp pembuatan job (ms) — dipakai untuk TTL sweep & cleanup orphan */
  createdAt?: number
}

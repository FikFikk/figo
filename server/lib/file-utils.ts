// ============================================================
// File utilities — download dir, cleanup, find hasil download
// ============================================================

import { join, dirname, basename } from 'path'
import { readdirSync, existsSync, unlinkSync, statSync, mkdirSync } from 'fs'

// Singleton — resolve path hanya 1x, bukan setiap request
let _downloadDir: string | null = null

/**
 * Gunakan directory di disk utama, bukan /tmp (sering tmpfs kecil).
 * Directory dibuat di <project>/.downloads/ agar pakai disk utama.
 * Singleton: hanya resolve 1x per process lifetime.
 */
export function getDownloadDir(): string {
  if (_downloadDir) return _downloadDir
  const dir = join(process.cwd(), '.downloads')
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true })
    console.log(`[Init] Created download dir: ${dir}`)
  }
  _downloadDir = dir
  return dir
}

// Debounce cleanup — jalankan max 1x per 5 menit
let _lastCleanup = 0
const CLEANUP_INTERVAL = 5 * 60 * 1000 // 5 menit

/**
 * Bersihkan file figo-* lama (lebih dari 30 menit).
 * Mencegah disk penuh karena partial download yang gagal.
 * Debounced: skip jika sudah jalan dalam 5 menit terakhir.
 */
export function cleanupStaleTempFiles(): { cleaned: number; freedMB: number } {
  const now = Date.now()
  // Skip jika sudah cleanup dalam interval
  if (now - _lastCleanup < CLEANUP_INTERVAL) {
    return { cleaned: 0, freedMB: 0 }
  }
  _lastCleanup = now

  const tmp = getDownloadDir()
  let cleaned = 0
  let freedBytes = 0
  const maxAge = 30 * 60 * 1000 // 30 menit

  try {
    const files = readdirSync(tmp)
    for (const f of files) {
      if (!f.startsWith('figo-')) continue
      const fullPath = join(tmp, f)
      try {
        const info = statSync(fullPath)
        if (now - info.mtimeMs > maxAge) {
          freedBytes += info.size
          unlinkSync(fullPath)
          cleaned++
        }
      } catch {}
    }
  } catch {}

  return { cleaned, freedMB: Math.round(freedBytes / 1048576) }
}

/**
 * Bersihkan partial files (.part, .ytdl) untuk jobId tertentu.
 */
export function cleanupPartialFiles(tmpFile: string): void {
  const dir = dirname(tmpFile)
  const base = basename(tmpFile).replace(/\.[^.]+$/, '')
  try {
    const files = readdirSync(dir)
    for (const f of files) {
      if (f.startsWith(base) && (f.endsWith('.part') || f.endsWith('.ytdl') || f.endsWith('.part-Frag0'))) {
        try { unlinkSync(join(dir, f)) } catch {}
      }
    }
  } catch {}
}

/**
 * Cari file hasil download yt-dlp.
 * Prioritas: merged file (tanpa fragment pattern) → fragment terbesar.
 */
export function findDownloadedFile(downloadDir: string, jobId: string): {
  file: string | null
  fragments: string[]
  merged: string | null
} {
  const allMatches: { path: string; size: number; name: string }[] = []
  try {
    const files = readdirSync(downloadDir)
    for (const f of files) {
      if (!f.includes(jobId)) continue
      if (f.endsWith('.part') || f.endsWith('.ytdl')) continue
      try {
        const fullPath = join(downloadDir, f)
        const info = statSync(fullPath)
        allMatches.push({ path: fullPath, size: info.size, name: f })
      } catch {}
    }
  } catch {}

  if (allMatches.length === 0) {
    console.error(`[FindFile] Tidak ada file untuk job ${jobId} di ${downloadDir}`)
    return { file: null, fragments: [], merged: null }
  }

  console.log(`[FindFile] Ditemukan: ${allMatches.map(m => `${m.name} (${(m.size / 1048576).toFixed(1)}MB)`).join(', ')}`)

  const fragmentPattern = /\.f\d+\./
  const mergedFiles = allMatches.filter(m => !fragmentPattern.test(m.name))
  const fragmentFiles = allMatches.filter(m => fragmentPattern.test(m.name))

  if (mergedFiles.length > 0) {
    mergedFiles.sort((a, b) => b.size - a.size)
    return {
      file: mergedFiles[0]?.path || null,
      fragments: fragmentFiles.map(f => f.path),
      merged: mergedFiles[0]?.path || null,
    }
  }

  return { file: null, fragments: fragmentFiles.map(f => f.path), merged: null }
}

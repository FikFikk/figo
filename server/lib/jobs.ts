// Job store — shared state untuk download background jobs
import { existsSync, unlinkSync } from 'fs'
import type { DownloadJob } from './types'
import { cleanupStaleTempFiles } from './file-utils'

export type { DownloadJob }
export const downloadJobs = new Map<string, DownloadJob>()

// ============================================================
// TTL sweep — pembersihan aktif job menggantung & temp orphan
// ============================================================

/** Job 'done' yang tak pernah di-download user: hapus setelah 15 menit */
const TTL_DONE = 15 * 60 * 1000
/** Job 'error': hapus entry setelah 5 menit (file sudah tidak ada) */
const TTL_ERROR = 5 * 60 * 1000
/** Job 'processing' yang stuck (proses mati tanpa update status): 20 menit */
const TTL_PROCESSING = 20 * 60 * 1000
/** Interval sweep berjalan */
const SWEEP_INTERVAL = 5 * 60 * 1000

/** Hapus file temp milik job dengan aman (abaikan error) */
function safeUnlink(filePath?: string): void {
  if (!filePath) return
  try {
    if (existsSync(filePath)) unlinkSync(filePath)
  } catch {}
}

/**
 * Sapu job map: buang entry kadaluarsa & hapus temp file orphan.
 * Tidak bergantung pada traffic — dijalankan oleh timer mandiri.
 */
function sweepJobs(): void {
  const now = Date.now()
  let removed = 0

  for (const [id, job] of downloadJobs) {
    // Job lama tanpa createdAt (mis. dibuat sebelum upgrade) → anggap usang
    const age = now - (job.createdAt ?? 0)

    let expired = false
    if (job.status === 'done' && age > TTL_DONE) {
      safeUnlink(job.filePath) // hapus file yang tak pernah diunduh
      expired = true
    } else if (job.status === 'error' && age > TTL_ERROR) {
      expired = true
    } else if (job.status === 'processing' && age > TTL_PROCESSING) {
      safeUnlink(job.filePath)
      expired = true
    }

    if (expired) {
      downloadJobs.delete(id)
      removed++
    }
  }

  // Sekalian bersihkan file figo-* lama yang yatim di disk (debounced internal)
  const fileCleanup = cleanupStaleTempFiles()

  if (removed > 0 || fileCleanup.cleaned > 0) {
    console.log(`[Sweep] Jobs dihapus: ${removed} | Temp files: ${fileCleanup.cleaned} (${fileCleanup.freedMB}MB) | Sisa job: ${downloadJobs.size}`)
  }
}

// Timer mandiri — unref() agar tidak menahan process exit
const _sweepTimer = setInterval(sweepJobs, SWEEP_INTERVAL)
if (typeof _sweepTimer.unref === 'function') _sweepTimer.unref()

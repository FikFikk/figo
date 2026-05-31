// ============================================================
// Concurrency limiter — semaphore untuk batasi proses berat
// (yt-dlp + ffmpeg) agar VPS tidak OOM saat traffic tinggi.
// ============================================================

/**
 * Semaphore sederhana berbasis Promise.
 * Membatasi jumlah task yang berjalan bersamaan; sisanya antri (FIFO).
 */
class Semaphore {
  private active = 0
  private readonly queue: Array<() => void> = []

  constructor(private readonly maxConcurrent: number) {}

  /** Jumlah task yang sedang berjalan saat ini */
  get running(): number {
    return this.active
  }

  /** Jumlah task yang sedang mengantri */
  get waiting(): number {
    return this.queue.length
  }

  /** Tunggu sampai slot tersedia, lalu tandai 1 slot terpakai */
  private acquire(): Promise<void> {
    if (this.active < this.maxConcurrent) {
      this.active++
      return Promise.resolve()
    }
    // Tidak ada slot — masuk antrian, resolve saat slot dibebaskan
    return new Promise<void>((resolve) => {
      this.queue.push(resolve)
    })
  }

  /** Bebaskan 1 slot, dan jalankan task antrian berikutnya jika ada */
  private release(): void {
    const next = this.queue.shift()
    if (next) {
      // Slot langsung dipindahtangankan ke task antrian (active tetap)
      next()
    } else {
      this.active--
    }
  }

  /**
   * Jalankan fn dalam batasan concurrency.
   * Slot otomatis dibebaskan walau fn melempar error.
   */
  async run<T>(fn: () => Promise<T>): Promise<T> {
    await this.acquire()
    try {
      return await fn()
    } finally {
      this.release()
    }
  }
}

/**
 * Limiter global untuk job download (yt-dlp + ffmpeg merge).
 * Default 3 job paralel — aman untuk VPS 2 vCPU. Override via env DOWNLOAD_CONCURRENCY.
 */
const MAX_DOWNLOAD_CONCURRENCY = Math.max(
  1,
  parseInt(process.env.DOWNLOAD_CONCURRENCY || '3', 10) || 3,
)

export const downloadSemaphore = new Semaphore(MAX_DOWNLOAD_CONCURRENCY)

/**
 * Limiter untuk pemrosesan gambar/dokumen (Sharp, JSZip, pdf-lib).
 * Sharp/libvips bersifat CPU-bound; tanpa batas, Promise.all banyak file
 * akan oversubscribe core dan memicu OOM. Default 2 paralel.
 * Override via env IMAGE_CONCURRENCY.
 */
const MAX_IMAGE_CONCURRENCY = Math.max(
  1,
  parseInt(process.env.IMAGE_CONCURRENCY || '2', 10) || 2,
)

export const imageSemaphore = new Semaphore(MAX_IMAGE_CONCURRENCY)

/**
 * Jalankan daftar task dengan batasan concurrency, hasil tetap berurutan
 * sesuai input (seperti Promise.all tapi throttled).
 */
export async function mapWithLimit<T, R>(
  items: T[],
  semaphore: Semaphore,
  fn: (item: T, index: number) => Promise<R>,
): Promise<R[]> {
  return Promise.all(items.map((item, i) => semaphore.run(() => fn(item, i))))
}

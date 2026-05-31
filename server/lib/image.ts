// ============================================================
// Sharp helper — konfigurasi aman & terpusat untuk image processing
// Dipakai oleh /api/convert dan /api/compress.
// ============================================================

import sharp from 'sharp'

// libvips default-nya multi-thread per pipeline. Saat banyak file diproses
// paralel (Promise.all), ini oversubscribe CPU & memicu OOM di VPS kecil.
// Set 1 thread per pipeline — konkurensi antar-file diatur via semaphore.
sharp.concurrency(1)
// Matikan cache global libvips (tiap file one-shot, cache hanya makan RAM).
sharp.cache(false)

/**
 * Batas pixel input untuk cegah decompression bomb.
 * 100MP (~10000x10000) cukup untuk foto kamera modern, tapi jauh di bawah
 * level yang bikin raw RGBA membengkak ke >1GB RAM.
 */
export const SAFE_PIXEL_LIMIT = 100_000_000

/** Format gambar yang bisa menyimpan animasi (multi-frame) */
const ANIMATED_FORMATS = new Set(['gif', 'webp'])

/**
 * Buat instance Sharp dengan setting aman.
 * Animasi dipertahankan hanya bila source DAN target sama-sama mendukungnya.
 */
export function createSharp(
  buffer: Buffer,
  sourceExt: string,
  targetExt: string,
): sharp.Sharp {
  const src = sourceExt.toLowerCase()
  const tgt = targetExt.toLowerCase()
  // Baca semua frame hanya jika source animatable dan output juga animatable,
  // supaya GIF/WebP animasi tidak terpotong jadi 1 frame.
  const keepAnimation = ANIMATED_FORMATS.has(src) && ANIMATED_FORMATS.has(tgt)

  return sharp(buffer, {
    sequentialRead: true,
    limitInputPixels: SAFE_PIXEL_LIMIT,
    animated: keepAnimation,
    failOn: 'none', // toleran terhadap file sedikit korup (jangan langsung throw)
  })
}

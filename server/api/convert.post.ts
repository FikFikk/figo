import archiver from 'archiver'
import { PassThrough } from 'stream'
import * as XLSX from 'xlsx'
import { createSharp } from '../lib/image'
import { imageSemaphore, mapWithLimit } from '../lib/concurrency'
import {
  validateMagicBytes,
  sanitizeFilename,
  checkRateLimit,
  safeContentDisposition,
  getClientIp,
  guardContentLength,
  UPLOAD_LIMITS,
} from '../lib/security'

// Supported output formats
const IMAGE_FORMATS = ['webp', 'png', 'jpg', 'jpeg', 'gif', 'avif', 'tiff'] as const
const SHEET_FORMATS = ['xlsx', 'csv', 'txt', 'html'] as const
const SUPPORTED_FORMATS = [...IMAGE_FORMATS, ...SHEET_FORMATS] as const
type SupportedFormat = typeof SUPPORTED_FORMATS[number]

function isImageFormat(fmt: string): boolean {
  return (IMAGE_FORMATS as readonly string[]).includes(fmt)
}

function isSheetFormat(fmt: string): boolean {
  return (SHEET_FORMATS as readonly string[]).includes(fmt)
}

function isSupportedFormat(fmt: string): fmt is SupportedFormat {
  return (SUPPORTED_FORMATS as readonly string[]).includes(fmt.toLowerCase())
}

function normalizeFormat(fmt: string): SupportedFormat {
  const lower = fmt.toLowerCase()
  if (lower === 'jpg') return 'jpeg'
  return lower as SupportedFormat
}

function getOutputMime(fmt: SupportedFormat): string {
  const mimeMap: Record<string, string> = {
    webp: 'image/webp',
    png: 'image/png',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    gif: 'image/gif',
    avif: 'image/avif',
    tiff: 'image/tiff',
    xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    csv: 'text/csv',
    txt: 'text/plain',
    html: 'text/html',
  }
  return mimeMap[fmt] || 'application/octet-stream'
}

// Convert a single buffer using sharp or xlsx — zero intermediate copies
async function convertBuffer(
  inputBuffer: Buffer,
  targetFormat: SupportedFormat,
  sourceExt: string,
): Promise<Buffer> {
  if (isImageFormat(targetFormat)) {
    // createSharp menangani limit pixel, single-thread, & deteksi animasi
    let pipeline = createSharp(inputBuffer, sourceExt, targetFormat)

    // Apply format-specific optimizations for speed
    switch (targetFormat) {
      case 'webp':
        pipeline = pipeline.webp({ effort: 2, quality: 85 })
        break
      case 'png':
        pipeline = pipeline.png({ compressionLevel: 4, adaptiveFiltering: true })
        break
      case 'jpeg':
      case 'jpg':
        pipeline = pipeline.jpeg({ quality: 85, mozjpeg: false })
        break
      case 'gif':
        pipeline = pipeline.gif()
        break
      case 'avif':
        pipeline = pipeline.avif({ effort: 2, quality: 70 })
        break
      case 'tiff':
        pipeline = pipeline.tiff({ compression: 'lzw' })
        break
    }

    return pipeline.toBuffer()
  } 
  
  if (isSheetFormat(targetFormat)) {
    // Read the spreadsheet directly from the memory buffer
    const workbook = XLSX.read(inputBuffer, { type: 'buffer' })
    
    // SheetJS uses bookType 'txt' for UTF-16 tab-separated text
    const bookType: any = targetFormat
    
    // Write back directly into a Buffer instead of a file
    return XLSX.write(workbook, { type: 'buffer', bookType })
  }

  throw new Error(`Fallback failure: Target format unsupported -> ${targetFormat}`)
}

export default defineEventHandler(async (event) => {
  const reqStartTime = performance.now()
  try {
    // === SECURITY: Rate limiting ===
    const clientIp = getClientIp(event)
    const rl = checkRateLimit(clientIp, 'convert', UPLOAD_LIMITS.RATE_LIMIT_REQUESTS, UPLOAD_LIMITS.RATE_LIMIT_WINDOW_MS)
    setResponseHeader(event, 'X-RateLimit-Remaining', String(rl.remaining))
    if (!rl.allowed) {
      throw createError({ statusCode: 429, message: 'Terlalu banyak request. Coba lagi dalam 1 menit.' })
    }

    // === SECURITY: Tolak payload raksasa sebelum di-buffer ke memori ===
    guardContentLength(event, UPLOAD_LIMITS.MAX_TOTAL_SIZE)

    const parseStartTime = performance.now()
    const formData = await readMultipartFormData(event)
    const parseTime = performance.now() - parseStartTime

    if (!formData || formData.length === 0) {
      throw createError({ statusCode: 400, message: 'No files provided' })
    }

    // Extract target format
    const formatField = formData.find(f => f.name === 'format')
    const targetFormatRaw = formatField?.data?.toString().trim().toLowerCase() || 'webp'

    if (!isSupportedFormat(targetFormatRaw)) {
      throw createError({ statusCode: 400, message: `Unsupported format: ${targetFormatRaw}` })
    }

    const targetFormat = normalizeFormat(targetFormatRaw)

    // Collect file entries (skip the 'format' field)
    const fileEntries = formData.filter(f => f.name === 'files' && f.data && f.data.length > 0)
    if (fileEntries.length === 0) {
      throw createError({ statusCode: 400, message: 'No file data found' })
    }

    // === SECURITY: Batas jumlah file ===
    if (fileEntries.length > UPLOAD_LIMITS.MAX_FILE_COUNT) {
      throw createError({ statusCode: 400, message: `Maksimal ${UPLOAD_LIMITS.MAX_FILE_COUNT} file per request` })
    }

    // === SECURITY: Batas ukuran per file + total ===
    let totalSize = 0
    for (const entry of fileEntries) {
      if (entry.data.length > UPLOAD_LIMITS.MAX_FILE_SIZE) {
        throw createError({ statusCode: 413, message: `File too large: ${sanitizeFilename(entry.filename)} (max 50MB)` })
      }
      totalSize += entry.data.length
    }
    if (totalSize > UPLOAD_LIMITS.MAX_TOTAL_SIZE) {
      throw createError({ statusCode: 413, message: `Total upload terlalu besar (max 200MB)` })
    }

    // === SECURITY: Validasi magic bytes setiap file ===
    for (const entry of fileEntries) {
      const safeName = sanitizeFilename(entry.filename)
      const ext = (safeName.split('.').pop() || '').toLowerCase()
      if (!validateMagicBytes(entry.data, ext)) {
        console.warn(`[convert] BLOCKED: Magic bytes mismatch — ${safeName} (claimed .${ext})`)
        throw createError({ statusCode: 400, message: `File ditolak: ${safeName} — isi file tidak sesuai format yang diklaim` })
      }
    }

    // === SINGLE FILE: direct response ===
    if (fileEntries.length === 1) {
      const entry = fileEntries[0]!
      const originalName = sanitizeFilename(entry.filename)
      const sourceExt = (originalName.split('.').pop() || '').toLowerCase()
      const baseName = originalName.replace(/\.[^.]+$/, '')
      const timestamp = Date.now()
      const outputName = `${baseName}-figo-${timestamp}.${targetFormat === 'jpeg' ? 'jpg' : targetFormat}`

      const convertStartTime = performance.now()
      const converted = await imageSemaphore.run(() => convertBuffer(entry.data, targetFormat, sourceExt))
      const convertTime = performance.now() - convertStartTime

      setResponseHeaders(event, {
        'Content-Type': getOutputMime(targetFormat),
        'Content-Disposition': safeContentDisposition(outputName),
        'Content-Length': String(converted.length),
        'X-Original-Name': encodeURIComponent(originalName),
        'X-Output-Name': encodeURIComponent(outputName),
        'X-Output-Size': String(converted.length),
      })

      const totalTime = performance.now() - reqStartTime
      console.log(`[convert] [Single] OK: Parse=${parseTime.toFixed(1)}ms | Sharp=${convertTime.toFixed(1)}ms | Total=${totalTime.toFixed(1)}ms | Image=${originalName}`)
      return converted
    }

    // === MULTIPLE FILES: convert all (throttled), stream as ZIP ===
    // Konkurensi dibatasi semaphore agar tidak oversubscribe CPU/RAM
    const convertStartTime = performance.now()
    const batchTs = Date.now()
    const convertedFiles = await mapWithLimit(fileEntries, imageSemaphore, async (entry, idx) => {
      const originalName = sanitizeFilename(entry.filename)
      const sourceExt = (originalName.split('.').pop() || '').toLowerCase()
      const baseName = originalName.replace(/\.[^.]+$/, '')
      // Pakai index agar nama unik walau diproses dalam batch yang sama
      const outputName = `${baseName}-figo-${batchTs}-${idx + 1}.${targetFormat === 'jpeg' ? 'jpg' : targetFormat}`
      const buffer = await convertBuffer(entry.data, targetFormat, sourceExt)
      return { outputName, buffer }
    })

    // Stream ZIP response directly — no temp files
    const zipFilename = `figo-converted-${Date.now()}.zip`
    setResponseHeaders(event, {
      'Content-Type': 'application/zip',
      'Content-Disposition': safeContentDisposition(zipFilename),
    })

    const passThrough = new PassThrough()
    const archive = archiver('zip', { zlib: { level: 1 } }) // Fast compression

    archive.pipe(passThrough)

    for (const { outputName, buffer } of convertedFiles) {
      archive.append(buffer, { name: outputName })
    }

    // Finalize the archive (no await — it streams)
    archive.finalize()

    const convertTime = performance.now() - convertStartTime
    const totalTime = performance.now() - reqStartTime
    console.log(`[convert] [ZIP] OK (${fileEntries.length} files): Parse=${parseTime.toFixed(1)}ms | Sharp/Zip Init=${convertTime.toFixed(1)}ms | Total=${totalTime.toFixed(1)}ms`)

    return sendStream(event, passThrough)
  } catch (err: any) {
    if (err.statusCode) throw err
    console.error('[convert] Error:', err)
    throw createError({ statusCode: 500, message: err.message || 'Conversion failed' })
  }
})

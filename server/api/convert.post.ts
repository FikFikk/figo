import sharp from 'sharp'
import archiver from 'archiver'
import { Readable, PassThrough } from 'stream'

// Supported output formats
const SUPPORTED_FORMATS = ['webp', 'png', 'jpg', 'jpeg', 'gif', 'avif', 'tiff'] as const
type SupportedFormat = typeof SUPPORTED_FORMATS[number]

function isSupportedFormat(fmt: string): fmt is SupportedFormat {
  return SUPPORTED_FORMATS.includes(fmt.toLowerCase() as SupportedFormat)
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
  }
  return mimeMap[fmt] || 'application/octet-stream'
}

// Convert a single buffer using sharp — streaming pipeline, zero intermediate copies
async function convertBuffer(
  inputBuffer: Buffer,
  targetFormat: SupportedFormat
): Promise<Buffer> {
  let pipeline = sharp(inputBuffer, {
    // Disable cache to reduce memory — each file is one-shot
    limitInputPixels: 268_402_689,  // ~16384x16384
    sequentialRead: true,           // Lower memory for sequential access
  })

  // Apply format-specific optimizations for speed
  switch (targetFormat) {
    case 'webp':
      pipeline = pipeline.webp({ effort: 2, quality: 85 })
      break
    case 'png':
      pipeline = pipeline.png({ compressionLevel: 4, adaptiveFiltering: true })
      break
    case 'jpeg':
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

export default defineEventHandler(async (event) => {
  try {
    const formData = await readMultipartFormData(event)
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

    // Enforce size limit (50MB per file)
    const MAX_SIZE = 50 * 1024 * 1024
    for (const entry of fileEntries) {
      if (entry.data.length > MAX_SIZE) {
        throw createError({ statusCode: 413, message: `File too large: ${entry.filename} (max 50MB)` })
      }
    }

    // === SINGLE FILE: direct response ===
    if (fileEntries.length === 1) {
      const entry = fileEntries[0]!
      const originalName = entry.filename || 'file'
      const baseName = originalName.replace(/\.[^.]+$/, '')
      const outputName = `${baseName}.${targetFormat === 'jpeg' ? 'jpg' : targetFormat}`

      const converted = await convertBuffer(entry.data, targetFormat)

      setResponseHeaders(event, {
        'Content-Type': getOutputMime(targetFormat),
        'Content-Disposition': `attachment; filename="${outputName}"`,
        'Content-Length': String(converted.length),
        'X-Original-Name': originalName,
        'X-Output-Name': outputName,
        'X-Output-Size': String(converted.length),
      })

      return converted
    }

    // === MULTIPLE FILES: convert all concurrently, stream as ZIP ===
    // Convert all files in parallel for maximum throughput
    const convertedFiles = await Promise.all(
      fileEntries.map(async (entry) => {
        const originalName = entry.filename || 'file'
        const baseName = originalName.replace(/\.[^.]+$/, '')
        const outputName = `${baseName}.${targetFormat === 'jpeg' ? 'jpg' : targetFormat}`
        const buffer = await convertBuffer(entry.data, targetFormat)
        return { outputName, buffer }
      })
    )

    // Stream ZIP response directly — no temp files
    setResponseHeaders(event, {
      'Content-Type': 'application/zip',
      'Content-Disposition': `attachment; filename="figo-converted.zip"`,
    })

    const passThrough = new PassThrough()
    const archive = archiver('zip', { zlib: { level: 1 } }) // Fast compression

    archive.pipe(passThrough)

    for (const { outputName, buffer } of convertedFiles) {
      archive.append(buffer, { name: outputName })
    }

    // Finalize the archive (no await — it streams)
    archive.finalize()

    return sendStream(event, passThrough)
  } catch (err: any) {
    if (err.statusCode) throw err
    console.error('[convert] Error:', err)
    throw createError({ statusCode: 500, message: err.message || 'Conversion failed' })
  }
})

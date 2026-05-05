import sharp from 'sharp'
import JSZip from 'jszip'
import { PDFDocument } from 'pdf-lib'
import { PassThrough } from 'stream'
import archiver from 'archiver'

// Ekstensi yang didukung per kategori
const IMAGE_EXTS = ['png', 'jpg', 'jpeg', 'webp', 'gif', 'avif', 'tiff', 'bmp']
const OFFICE_EXTS = ['docx', 'pptx', 'xlsx']

function getExt(filename: string): string {
  return (filename.split('.').pop() || '').toLowerCase()
}

// Kompresi gambar via Sharp berdasarkan quality (0-100)
async function compressImage(buf: Buffer, ext: string, quality: number): Promise<Buffer> {
  let pipeline = sharp(buf, { sequentialRead: true, limitInputPixels: 268_402_689 })

  // Strip metadata selalu
  pipeline = pipeline.rotate() // Auto-rotate lalu strip EXIF

  const fmt = ext === 'jpg' ? 'jpeg' : ext
  switch (fmt) {
    case 'png':
      // PNG: compressionLevel 9 = max, strip metadata
      pipeline = pipeline.png({ compressionLevel: 9, adaptiveFiltering: true, palette: quality < 50 })
      break
    case 'jpeg':
      // JPG: mozjpeg untuk kompresi lebih efisien
      pipeline = pipeline.jpeg({ quality, mozjpeg: true })
      break
    case 'webp':
      pipeline = pipeline.webp({ quality, effort: 4 })
      break
    case 'gif':
      pipeline = pipeline.gif()
      break
    case 'avif':
      pipeline = pipeline.avif({ quality, effort: 4 })
      break
    case 'tiff':
      pipeline = pipeline.tiff({ compression: 'lzw', quality })
      break
    default:
      // Fallback: convert ke webp
      pipeline = pipeline.webp({ quality })
  }

  return pipeline.toBuffer()
}

// Kompresi DOCX/PPTX/XLSX — extract, compress gambar di media/, rezip
async function compressOfficeDoc(buf: Buffer, quality: number): Promise<Buffer> {
  const zip = await JSZip.loadAsync(buf)
  const mediaFolders = ['word/media/', 'ppt/media/', 'xl/media/']

  const promises: Promise<void>[] = []

  zip.forEach((relativePath, file) => {
    // Cari file gambar di dalam folder media
    const isMedia = mediaFolders.some(f => relativePath.startsWith(f))
    if (!isMedia || file.dir) return

    const imgExt = getExt(relativePath)
    if (!['png', 'jpg', 'jpeg', 'gif', 'bmp', 'tiff'].includes(imgExt)) return

    promises.push(
      (async () => {
        try {
          const imgBuf = await file.async('nodebuffer')
          // Skip gambar kecil (< 10KB)
          if (imgBuf.length < 10_000) return

          const compressed = await compressImage(imgBuf, imgExt, quality)
          // Hanya replace jika hasil lebih kecil
          if (compressed.length < imgBuf.length) {
            zip.file(relativePath, compressed)
          }
        } catch {
          // Skip gambar yang gagal di-compress (format aneh/corrupt)
        }
      })()
    )
  })

  await Promise.all(promises)

  return zip.generateAsync({
    type: 'nodebuffer',
    compression: 'DEFLATE',
    compressionOptions: { level: 6 },
  }) as Promise<Buffer>
}

// Kompresi PDF — strip metadata, compress streams
async function compressPdf(buf: Buffer): Promise<Buffer> {
  try {
    const pdfDoc = await PDFDocument.load(buf, { ignoreEncryption: true })

    // Strip metadata
    pdfDoc.setTitle('')
    pdfDoc.setAuthor('')
    pdfDoc.setSubject('')
    pdfDoc.setKeywords([])
    pdfDoc.setProducer('FiGo Compressor')
    pdfDoc.setCreator('')

    // Save dengan objectsPerTick tinggi untuk kecepatan
    const compressed = await pdfDoc.save({
      useObjectStreams: true,
      addDefaultPage: false,
      objectsPerTick: 100,
    })

    return Buffer.from(compressed)
  } catch {
    // Jika PDF encrypted/corrupt, kembalikan apa adanya
    return buf
  }
}

export default defineEventHandler(async (event) => {
  const startTime = performance.now()

  try {
    const formData = await readMultipartFormData(event)
    if (!formData || formData.length === 0) {
      throw createError({ statusCode: 400, message: 'No files provided' })
    }

    // Ambil quality dari form
    const qualityField = formData.find(f => f.name === 'quality')
    const quality = Math.min(100, Math.max(1, parseInt(qualityField?.data?.toString() || '75', 10)))

    // Kumpulkan file entries
    const fileEntries = formData.filter(f => f.name === 'files' && f.data && f.data.length > 0)
    if (fileEntries.length === 0) {
      throw createError({ statusCode: 400, message: 'No file data found' })
    }

    // Batas 50MB per file
    const MAX_SIZE = 50 * 1024 * 1024
    for (const entry of fileEntries) {
      if (entry.data.length > MAX_SIZE) {
        throw createError({ statusCode: 413, message: `File terlalu besar: ${entry.filename} (max 50MB)` })
      }
    }

    // === SINGLE FILE ===
    if (fileEntries.length === 1) {
      const entry = fileEntries[0]!
      const filename = entry.filename || 'file'
      const ext = getExt(filename)
      const originalSize = entry.data.length

      let compressed: Buffer

      if (IMAGE_EXTS.includes(ext)) {
        compressed = await compressImage(entry.data, ext, quality)
      } else if (OFFICE_EXTS.includes(ext)) {
        compressed = await compressOfficeDoc(entry.data, quality)
      } else if (ext === 'pdf') {
        compressed = await compressPdf(entry.data)
      } else {
        throw createError({ statusCode: 400, message: `Format tidak didukung: .${ext}` })
      }

      const baseName = filename.replace(/\.[^.]+$/, '')
      const outputName = `${baseName}-compressed.${ext}`

      setResponseHeaders(event, {
        'Content-Type': 'application/octet-stream',
        'Content-Disposition': `attachment; filename="${outputName}"`,
        'Content-Length': String(compressed.length),
        'X-Original-Size': String(originalSize),
        'X-Compressed-Size': String(compressed.length),
        'X-Output-Name': outputName,
      })

      const elapsed = (performance.now() - startTime).toFixed(1)
      const savings = ((1 - compressed.length / originalSize) * 100).toFixed(1)
      console.log(`[compress] OK: ${filename} | ${originalSize}→${compressed.length} (${savings}% saved) | ${elapsed}ms`)

      return compressed
    }

    // === MULTIPLE FILES → ZIP ===
    const compressedFiles = await Promise.all(
      fileEntries.map(async (entry) => {
        const filename = entry.filename || 'file'
        const ext = getExt(filename)
        let compressed: Buffer

        try {
          if (IMAGE_EXTS.includes(ext)) {
            compressed = await compressImage(entry.data, ext, quality)
          } else if (OFFICE_EXTS.includes(ext)) {
            compressed = await compressOfficeDoc(entry.data, quality)
          } else if (ext === 'pdf') {
            compressed = await compressPdf(entry.data)
          } else {
            compressed = entry.data // Format tidak didukung, kembalikan apa adanya
          }
        } catch {
          compressed = entry.data
        }

        const baseName = filename.replace(/\.[^.]+$/, '')
        return { outputName: `${baseName}-compressed.${ext}`, buffer: compressed, originalSize: entry.data.length }
      })
    )

    setResponseHeaders(event, {
      'Content-Type': 'application/zip',
      'Content-Disposition': `attachment; filename="figo-compressed-${Date.now()}.zip"`,
    })

    const passThrough = new PassThrough()
    const archive = archiver('zip', { zlib: { level: 1 } })
    archive.pipe(passThrough)

    for (const { outputName, buffer } of compressedFiles) {
      archive.append(buffer, { name: outputName })
    }
    archive.finalize()

    const elapsed = (performance.now() - startTime).toFixed(1)
    console.log(`[compress] ZIP OK (${fileEntries.length} files) | ${elapsed}ms`)

    return sendStream(event, passThrough)
  } catch (err: any) {
    if (err.statusCode) throw err
    console.error('[compress] Error:', err)
    throw createError({ statusCode: 500, message: err.message || 'Compression failed' })
  }
})

import { defineEventHandler, getQuery, createError, sendStream, setResponseHeaders } from 'h3'
import { createReadStream, unlinkSync, existsSync } from 'fs'
import { stat } from 'fs/promises'
import { Readable } from 'stream'
import { downloadJobs } from '../lib/jobs'

const GO_DOWNLOAD_API_URL = process.env.GO_DOWNLOAD_API_URL || 'http://127.0.0.1:5001'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const id = query.id as string
  
  if (!id) {
    throw createError({ statusCode: 400, message: 'Valid Job ID parameter is required.' })
  }

  try {
    const response = await fetch(`${GO_DOWNLOAD_API_URL}/download-file?id=${encodeURIComponent(id)}`)
    if (response.ok && response.body) {
      const contentType = response.headers.get('content-type')
      const contentDisposition = response.headers.get('content-disposition')
      const contentLength = response.headers.get('content-length')

      setResponseHeaders(event, {
        ...(contentType ? { 'Content-Type': contentType } : {}),
        ...(contentDisposition ? { 'Content-Disposition': contentDisposition } : {}),
        ...(contentLength ? { 'Content-Length': contentLength } : {}),
      })

      return sendStream(event, Readable.fromWeb(response.body as any))
    }

    if (response.status !== 404) {
      const errorText = await response.text().catch(() => '')
      throw createError({ statusCode: response.status, message: errorText || 'Gagal mengambil file dari Go download API.' })
    }
  } catch (err: any) {
    if (err.statusCode) throw err
    console.error('[Go Download File Error]', err.message || String(err))
  }

  const job = downloadJobs.get(id)

  if (!job) {
     throw createError({ statusCode: 404, message: 'Tugas unduhan tidak ditemukan atau kadaluarsa.' })
  }

  if (job.status !== 'done' || !job.filePath) {
    throw createError({ statusCode: 400, message: 'File belum siap diunduh.' })
  }

  const tmpFile = job.filePath

  // Verify file still exists on disk
  if (!existsSync(tmpFile)) {
    throw createError({ statusCode: 500, message: 'File hilang dari server.' })
  }

  try {
    const fileInfo = await stat(tmpFile)
    const mimeType = job.mimeType || 'application/octet-stream'
    const title = job.title || 'Video'
    const filename = `${title}.${job.ext || 'mp4'}`

    console.log(`[Job ${id}] Streaming file to client... Size: ${(fileInfo.size / 1048576).toFixed(1)} MB`)

    // Set response headers for file download (with proper encoding for special characters)
    setResponseHeaders(event, {
      'Content-Type': mimeType,
      'Content-Disposition': `attachment; filename="${filename}"; filename*=UTF-8''${encodeURIComponent(filename)}`,
      'Content-Length': String(fileInfo.size),
    })

    // Stream the file to the client
    const stream = createReadStream(tmpFile)

    // Clean up temp file after streaming
    stream.on('end', () => {
      try { unlinkSync(tmpFile) } catch {}
      downloadJobs.delete(id)
      console.log(`[Job ${id}] Cleanup done.`)
    })
    
    stream.on('error', () => {
      try { unlinkSync(tmpFile) } catch {}
      downloadJobs.delete(id)
    })

    return sendStream(event, stream)

  } catch (err: any) {
    // Clean up temp file on error
    try { if (existsSync(tmpFile)) unlinkSync(tmpFile) } catch {}
    downloadJobs.delete(id)

    console.error(`[Job ${id}] Download File Error:`, err)
    if (err.statusCode) throw err

    throw createError({
      statusCode: 500,
      message: 'Download failed: ' + (err.message || String(err))
    })
  }
})

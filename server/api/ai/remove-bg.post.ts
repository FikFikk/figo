/**
 * POST /api/ai/remove-bg
 * Proxy ke Go backend → Python rembg worker
 * Body: multipart/form-data dengan field 'image'
 */
const GO_API = process.env.GO_DOWNLOAD_API_URL || 'http://127.0.0.1:5001'

export default defineEventHandler(async (event) => {
  const request = event.node.req
  const response = event.node.res

  // Forward raw request ke Go backend
  const goUrl = `${GO_API}/ai/remove-bg`

  try {
    // Baca raw body dari request
    const chunks: Buffer[] = []
    await new Promise<void>((resolve, reject) => {
      request.on('data', (chunk: Buffer) => chunks.push(chunk))
      request.on('end', () => resolve())
      request.on('error', reject)
    })

    const rawBody = Buffer.concat(chunks)
    const contentType = request.headers['content-type'] || 'application/octet-stream'

    // Forward ke Go
    const goResponse = await $fetch.raw(goUrl, {
      method: 'POST',
      body: rawBody,
      headers: {
        'content-type': contentType,
      },
    })

    return await goResponse._data
  } catch (e: any) {
    const statusCode = e.statusCode || 500
    const message = e.data?.error || e.message || 'AI processing failed'
    throw createError({ statusCode, message })
  }
})

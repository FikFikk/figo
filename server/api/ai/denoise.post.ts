/**
 * POST /api/ai/denoise
 * Proxy ke Go backend → Python denoise worker
 */
const GO_API = process.env.GO_DOWNLOAD_API_URL || 'http://127.0.0.1:5001'

export default defineEventHandler(async (event) => {
  const request = event.node.req

  const goUrl = `${GO_API}/ai/denoise`

  try {
    const chunks: Buffer[] = []
    await new Promise<void>((resolve, reject) => {
      request.on('data', (chunk: Buffer) => chunks.push(chunk))
      request.on('end', () => resolve())
      request.on('error', reject)
    })

    const rawBody = Buffer.concat(chunks)
    const contentType = request.headers['content-type'] || 'application/octet-stream'

    const goResponse = await $fetch.raw(goUrl, {
      method: 'POST',
      body: rawBody,
      headers: { 'content-type': contentType },
    })

    return await goResponse._data
  } catch (e: any) {
    throw createError({ statusCode: e.statusCode || 500, message: e.data?.error || e.message || 'Denoise failed' })
  }
})

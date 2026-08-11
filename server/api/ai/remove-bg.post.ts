/**
 * POST /api/ai/remove-bg
 * Proxy ke Go backend → Python rembg worker
 * Body: multipart/form-data dengan field 'image'
 *
 * Pakai SSE keep-alive agar Cloudflare tidak 524 timeout
 * (inferensi ARM64 bisa 3 menit, CF default timeout 100s)
 */
const GO_API = process.env.GO_DOWNLOAD_API_URL || 'http://127.0.0.1:5001'

export default defineEventHandler(async (event) => {
  const request = event.node.req
  const response = event.node.res

  const goUrl = `${GO_API}/ai/remove-bg`

  // Set header SSE agar Cloudflare tahu ada data mengalir (cegah 524)
  response.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'X-Accel-Buffering': 'no',
    'Connection': 'keep-alive',
  })

  // Keep-alive: kirim comment SSE setiap 15s agar CF tidak timeout
  const keepAlive = setInterval(() => {
    try { response.write(': keep-alive\n\n') } catch {}
  }, 15000)

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

    // Forward ke Go (bisa makan 3 menit di ARM64 CPU)
    const goResponse = await $fetch.raw(goUrl, {
      method: 'POST',
      body: rawBody,
      headers: { 'content-type': contentType },
    })

    const data = await goResponse._data as any

    clearInterval(keepAlive)

    // Kirim result sebagai SSE event "done"
    response.write(`event: done\ndata: ${JSON.stringify(data)}\n\n`)
    response.end()

  } catch (e: any) {
    clearInterval(keepAlive)
    const statusCode = e.statusCode || 500
    const message = e.data?.error || e.message || 'AI processing failed'
    const errData = { error: message, statusCode }
    response.write(`event: error\ndata: ${JSON.stringify(errData)}\n\n`)
    response.end()
  }
})

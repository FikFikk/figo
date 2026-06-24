import { defineEventHandler, getQuery, getHeader, createError, setResponseHeaders, setResponseStatus } from 'h3'
import { assertUnlocked } from '../../lib/stream-auth'
import { REALISTIC_USER_AGENT, isBlocked } from '../../lib/constants'

/**
 * Streaming proxy — mem-pipe video dari upstream (mis. Real-Debrid)
 * melalui IP server tunggal. Mendukung HTTP Range (206) agar seeking
 * di video player berfungsi tanpa download ulang dari awal.
 *
 * Akses dijaga PIN gate: cookie unlock httpOnly wajib valid.
 * Query: url (URL stream upstream)
 */

/** Hanya izinkan host upstream yang dikenal (anti SSRF) */
const ALLOWED_STREAM_HOSTS = [
  'real-debrid.com',
  'download.real-debrid.com',
  'rdb.so',
  'debrid.it',
  'alldebrid.com',
  'debrid-link.com',
  'premiumize.me',
]

/** Validasi URL upstream — protokol http/https, bukan IP internal, host whitelist */
function validateUpstream(raw: string): URL {
  let parsed: URL
  try {
    parsed = new URL(raw)
  } catch {
    throw createError({ statusCode: 400, statusMessage: 'URL stream tidak valid.' })
  }

  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    throw createError({ statusCode: 400, statusMessage: 'Protokol tidak diizinkan.' })
  }

  const host = parsed.hostname.toLowerCase()

  // Tolak target ke jaringan internal (SSRF guard)
  const isPrivate =
    host === 'localhost' ||
    host === '0.0.0.0' ||
    /^127\./.test(host) ||
    /^10\./.test(host) ||
    /^192\.168\./.test(host) ||
    /^169\.254\./.test(host) ||
    /^172\.(1[6-9]|2\d|3[01])\./.test(host) ||
    host.endsWith('.local') ||
    host.endsWith('.internal')

  if (isPrivate) {
    throw createError({ statusCode: 403, statusMessage: 'Target tidak diizinkan.' })
  }

  if (isBlocked(raw)) {
    throw createError({ statusCode: 403, statusMessage: 'Konten diblokir.' })
  }

  const allowed = ALLOWED_STREAM_HOSTS.some(d => host === d || host.endsWith(`.${d}`))
  if (!allowed) {
    throw createError({ statusCode: 403, statusMessage: 'Sumber stream tidak diizinkan.' })
  }

  return parsed
}

export default defineEventHandler(async (event) => {
  // Gate PIN — wajib unlock dulu
  assertUnlocked(event)

  const query = getQuery(event)
  const streamUrl = String(query.url || '')
  if (!streamUrl) {
    throw createError({ statusCode: 400, statusMessage: 'URL stream kosong.' })
  }

  validateUpstream(streamUrl)

  // Teruskan Range header dari player browser bila ada
  const rangeHeader = getHeader(event, 'range')
  const upstreamHeaders: Record<string, string> = {
    'User-Agent': REALISTIC_USER_AGENT,
    'Accept': '*/*',
  }
  if (rangeHeader) upstreamHeaders['Range'] = rangeHeader

  // Batalkan fetch ke upstream bila client memutus koneksi (hemat resource)
  const controller = new AbortController()
  event.node.req.on('close', () => controller.abort())

  let response: Response
  try {
    response = await fetch(streamUrl, {
      headers: upstreamHeaders,
      signal: controller.signal,
      redirect: 'follow',
    })
  } catch (err: any) {
    if (err?.name === 'AbortError') {
      // Client menutup koneksi — bukan error sebenarnya
      return
    }
    console.info(`[Stream Proxy] Gagal fetch upstream: ${err?.message || String(err)}`)
    throw createError({ statusCode: 502, statusMessage: 'Gagal mengambil stream dari upstream.' })
  }

  if (!response.ok && response.status !== 206) {
    throw createError({
      statusCode: response.status,
      statusMessage: `Upstream menolak: ${response.status}`,
    })
  }

  // Salin header penting agar seeking & metadata jalan
  const passthrough = ['content-type', 'content-length', 'content-range', 'accept-ranges']
  const responseHeaders: Record<string, string> = {}
  passthrough.forEach((h) => {
    const val = response.headers.get(h)
    if (val) responseHeaders[h] = val
  })
  // Pastikan player tahu server mendukung byte-range
  if (!responseHeaders['accept-ranges']) responseHeaders['accept-ranges'] = 'bytes'
  responseHeaders['Cache-Control'] = 'no-store'

  setResponseHeaders(event, responseHeaders)
  setResponseStatus(event, response.status)

  if (!response.body) {
    throw createError({ statusCode: 502, statusMessage: 'Upstream tidak mengirim body.' })
  }

  // Pipe stream langsung — tidak memuat seluruh file ke RAM
  return response.body
})

// ============================================================
// Stream Auth — proteksi PIN untuk tool streaming proxy
// PIN diverifikasi di server, lalu dibuatkan token HMAC yang
// disimpan di cookie httpOnly. Token berlaku 1 hari (di-cache).
// ============================================================

import { createHmac, timingSafeEqual } from 'node:crypto'
import type { H3Event } from 'h3'
import { getCookie, setCookie, deleteCookie } from 'h3'

/** Nama cookie unlock yang dipakai gate stream */
export const STREAM_COOKIE = 'stream_unlock'

/** Masa berlaku unlock: 1 hari (detik) */
export const STREAM_TTL_SECONDS = 60 * 60 * 24

/** Ambil PIN & secret dari runtime config (server-only, tidak bocor ke client) */
function getStreamSecrets(event: H3Event): { pin: string; secret: string } {
  const config = useRuntimeConfig(event)
  const pin = String(config.streamPin || '')
  // Secret untuk HMAC — fallback ke PIN bila secret tidak diset (tetap aman karena server-only)
  const secret = String(config.streamSecret || config.streamPin || '')
  return { pin, secret }
}

/** Bandingkan dua string secara konstan-waktu (anti timing attack) */
function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a)
  const bufB = Buffer.from(b)
  // timingSafeEqual butuh panjang sama; samakan dulu agar tidak throw
  if (bufA.length !== bufB.length) return false
  return timingSafeEqual(bufA, bufB)
}

/** Buat signature token berisi expiry — format: "<expiryMs>.<hmacHex>" */
export function createUnlockToken(event: H3Event): string {
  const { secret } = getStreamSecrets(event)
  const expiry = Date.now() + STREAM_TTL_SECONDS * 1000
  const payload = String(expiry)
  const sig = createHmac('sha256', secret).update(payload).digest('hex')
  return `${payload}.${sig}`
}

/** Validasi token unlock — cek signature & expiry */
export function isValidUnlockToken(event: H3Event, token: string | undefined): boolean {
  if (!token) return false
  const dot = token.indexOf('.')
  if (dot < 0) return false

  const payload = token.slice(0, dot)
  const sig = token.slice(dot + 1)
  const expiry = Number(payload)
  if (!Number.isFinite(expiry) || expiry < Date.now()) return false

  const { secret } = getStreamSecrets(event)
  const expected = createHmac('sha256', secret).update(payload).digest('hex')
  return safeEqual(sig, expected)
}

/** Verifikasi PIN yang dikirim user terhadap PIN di server */
export function verifyPin(event: H3Event, input: string): boolean {
  const { pin } = getStreamSecrets(event)
  if (!pin) return false
  return safeEqual(input, pin)
}

/** Set cookie unlock httpOnly selama TTL */
export function setUnlockCookie(event: H3Event): void {
  const token = createUnlockToken(event)
  setCookie(event, STREAM_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: !import.meta.dev,
    path: '/',
    maxAge: STREAM_TTL_SECONDS,
  })
}

/** Hapus cookie unlock (logout/lock kembali) */
export function clearUnlockCookie(event: H3Event): void {
  deleteCookie(event, STREAM_COOKIE, { path: '/' })
}

/** Guard utama: pastikan request sudah unlock, kalau tidak lempar 401 */
export function assertUnlocked(event: H3Event): void {
  const token = getCookie(event, STREAM_COOKIE)
  if (!isValidUnlockToken(event, token)) {
    throw createError({ statusCode: 401, statusMessage: 'Stream terkunci. Masukkan PIN dulu.' })
  }
}

/** Cek status unlock tanpa melempar error */
export function isUnlocked(event: H3Event): boolean {
  const token = getCookie(event, STREAM_COOKIE)
  return isValidUnlockToken(event, token)
}

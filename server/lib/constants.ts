// ============================================================
// Konstanta global — blocklist, user-agent, error patterns
// ============================================================

/** User-Agent realistis untuk bypass fingerprinting */
export const REALISTIC_USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36'

/** Blocklist domain dewasa */
export const BLOCKED_DOMAINS = [
  'xvideos.com', 'xnxx.com', 'xhamster.com', 'redtube.com',
  'youporn.com', 'spankbang.com', 'eporner.com', 'beeg.com', 'chaturbate.com',
  'onlyfans.com', 'rule34.xxx',
]

/** Error pattern yang tidak perlu di-retry (masalah server, bukan upstream) */
export const NON_RETRYABLE_PATTERNS = [
  'No space left on device',
  'Permission denied',
  'ENOSPC',
  'EACCES',
]

/** Cek apakah URL termasuk blocklist */
export function isBlocked(url: string): boolean {
  try {
    const hostname = new URL(url).hostname.toLowerCase()
    return BLOCKED_DOMAINS.some(domain => hostname.includes(domain))
  } catch {
    return false
  }
}

/** Normalisasi URL — pastikan ada protocol */
export function normalizeUrl(raw: string): string {
  let url = raw.trim()
  if (!url.startsWith('http://') && !url.startsWith('https://')) url = 'https://' + url
  return url
}

/** Cek apakah error bersifat fatal (tidak perlu retry) */
export function isNonRetryableError(msg: string): boolean {
  return NON_RETRYABLE_PATTERNS.some(p => msg.includes(p))
}

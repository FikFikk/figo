// ============================================================
// Security Utilities — Proteksi upload file dari serangan
// Magic bytes, sanitasi filename, rate limiter, batas upload
// ============================================================

// --- Magic Bytes Signatures ---
// Validasi header file sesuai format yang diklaim user
const MAGIC_BYTES: Record<string, { bytes: number[]; offset?: number }[]> = {
  // Gambar
  png:  [{ bytes: [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A] }],
  jpg:  [{ bytes: [0xFF, 0xD8, 0xFF] }],
  jpeg: [{ bytes: [0xFF, 0xD8, 0xFF] }],
  gif:  [{ bytes: [0x47, 0x49, 0x46, 0x38] }], // GIF8
  webp: [{ bytes: [0x52, 0x49, 0x46, 0x46] }], // RIFF (WebP container)
  bmp:  [{ bytes: [0x42, 0x4D] }],              // BM
  tiff: [
    { bytes: [0x49, 0x49, 0x2A, 0x00] },        // Little-endian
    { bytes: [0x4D, 0x4D, 0x00, 0x2A] },        // Big-endian
  ],
  avif: [{ bytes: [0x00, 0x00, 0x00], offset: 0 }], // ftyp box — cek partial saja

  // Dokumen Office (ZIP-based: PK header)
  docx: [{ bytes: [0x50, 0x4B, 0x03, 0x04] }],
  pptx: [{ bytes: [0x50, 0x4B, 0x03, 0x04] }],
  xlsx: [{ bytes: [0x50, 0x4B, 0x03, 0x04] }],

  // PDF
  pdf:  [{ bytes: [0x25, 0x50, 0x44, 0x46] }],  // %PDF

  // Spreadsheet legacy
  xls:  [{ bytes: [0xD0, 0xCF, 0x11, 0xE0] }],  // OLE2 Compound
  csv:  [],                                       // Text-based, skip magic check
  txt:  [],                                       // Text-based, skip magic check
}

// Ekstensi executable yang TIDAK BOLEH diproses dalam kondisi apapun
const DANGEROUS_EXTENSIONS = new Set([
  'exe', 'bat', 'cmd', 'com', 'scr', 'pif', 'vbs', 'vbe',
  'js', 'jse', 'wsf', 'wsh', 'ps1', 'msi', 'msp', 'mst',
  'cpl', 'hta', 'inf', 'ins', 'isp', 'reg', 'rgs', 'sct',
  'shb', 'shs', 'ws', 'wsc', 'lnk', 'dll', 'sys', 'drv',
  'sh', 'bash', 'csh', 'ksh', 'py', 'pl', 'rb', 'php',
])

/**
 * Validasi magic bytes file — pastikan isi sesuai ekstensi yang diklaim
 * Return: true jika valid, false jika mismatch (kemungkinan malicious)
 */
export function validateMagicBytes(buffer: Buffer, claimedExt: string): boolean {
  const ext = claimedExt.toLowerCase()

  // Blokir ekstensi berbahaya tanpa kompromi
  if (DANGEROUS_EXTENSIONS.has(ext)) return false

  // Cek apakah file sebenarnya executable (MZ header) tapi diklaim bukan
  if (buffer.length >= 2 && buffer[0] === 0x4D && buffer[1] === 0x5A) {
    // File ini executable Windows, blokir kecuali ekstensi memang .exe/.dll
    if (!['exe', 'dll'].includes(ext)) return false
  }

  // Cek ELF binary (Linux executable)
  if (buffer.length >= 4 && buffer[0] === 0x7F && buffer[1] === 0x45 && buffer[2] === 0x4C && buffer[3] === 0x46) {
    return false
  }

  // Cek Mach-O binary (macOS executable)
  if (buffer.length >= 4) {
    const macho = (buffer[0]! << 24 | buffer[1]! << 16 | buffer[2]! << 8 | buffer[3]!) >>> 0
    if (macho === 0xFEEDFACE || macho === 0xFEEDFACF || macho === 0xCEFAEDFE || macho === 0xCFFAEDFE) {
      return false
    }
  }

  const signatures = MAGIC_BYTES[ext]
  // Ekstensi yang tidak punya magic bytes (csv, txt) — izinkan
  if (!signatures || signatures.length === 0) return true

  // Cocokkan minimal 1 signature
  return signatures.some(sig => {
    const offset = sig.offset ?? 0
    if (buffer.length < offset + sig.bytes.length) return false
    return sig.bytes.every((byte, i) => buffer[offset + i] === byte)
  })
}

/**
 * Sanitasi nama file — hapus path traversal, null bytes, karakter berbahaya
 * Enforce panjang maksimum dan karakter aman
 */
export function sanitizeFilename(raw: string | undefined): string {
  if (!raw) return `file-${Date.now()}`

  let name = raw
    // Hapus null bytes
    .replace(/\0/g, '')
    // Hapus path traversal (../ atau ..\\)
    .replace(/\.\.\//g, '')
    .replace(/\.\.\\/g, '')
    // Hapus absolute path prefix (C:\, /, \\)
    .replace(/^[a-zA-Z]:[\\\/]/, '')
    .replace(/^[\\\/]+/, '')
    // Ambil hanya basename (hapus semua directory path)
    .replace(/.*[\\\/]/, '')
    // Hapus karakter kontrol dan non-printable
    .replace(/[\x00-\x1F\x7F]/g, '')
    // Hapus karakter yang berbahaya di HTTP header
    .replace(/[\r\n"]/g, '')
    // Hapus karakter yang berbahaya di filesystem
    .replace(/[<>:"|?*]/g, '')

  // Trim whitespace dan dots di awal/akhir
  name = name.replace(/^[\s.]+|[\s.]+$/g, '')

  // Fallback jika kosong setelah sanitasi
  if (!name || name.length === 0) {
    return `file-${Date.now()}`
  }

  // Potong panjang nama (max 200 karakter)
  if (name.length > 200) {
    const ext = name.split('.').pop() || ''
    const base = name.substring(0, 190)
    name = ext ? `${base}.${ext}` : base
  }

  return name
}

/**
 * Deteksi double extension (contoh: image.jpg.exe)
 * Return: true jika berbahaya
 */
export function hasDoubleExtension(filename: string): boolean {
  const parts = filename.split('.')
  if (parts.length <= 2) return false

  const lastExt = (parts.pop() || '').toLowerCase()
  const secondLastExt = (parts.pop() || '').toLowerCase()

  // Cek apakah ekstensi terakhir berbahaya
  if (DANGEROUS_EXTENSIONS.has(lastExt)) return true

  // Cek kombinasi: document/image ext + executable ext
  const docExts = new Set(['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'jpg', 'png', 'gif', 'txt'])
  if (docExts.has(secondLastExt) && DANGEROUS_EXTENSIONS.has(lastExt)) return true

  return false
}

// --- Rate Limiter (In-Memory) ---
interface RateLimitEntry {
  count: number
  resetTime: number
}

// Map per endpoint → per IP
const rateLimitStore = new Map<string, Map<string, RateLimitEntry>>()

// Bersihkan entry expired setiap 60 detik
setInterval(() => {
  const now = Date.now()
  for (const [, ipMap] of rateLimitStore) {
    for (const [ip, entry] of ipMap) {
      if (now > entry.resetTime) ipMap.delete(ip)
    }
  }
}, 60_000)

/**
 * Rate limiter per IP per endpoint
 * Default: 30 request per menit
 */
export function checkRateLimit(
  ip: string,
  endpoint: string,
  maxRequests = 30,
  windowMs = 60_000
): { allowed: boolean; remaining: number; resetIn: number } {
  const now = Date.now()

  if (!rateLimitStore.has(endpoint)) {
    rateLimitStore.set(endpoint, new Map())
  }
  const ipMap = rateLimitStore.get(endpoint)!

  const entry = ipMap.get(ip)

  // Entry baru atau sudah expired
  if (!entry || now > entry.resetTime) {
    ipMap.set(ip, { count: 1, resetTime: now + windowMs })
    return { allowed: true, remaining: maxRequests - 1, resetIn: windowMs }
  }

  // Increment counter
  entry.count++

  if (entry.count > maxRequests) {
    return { allowed: false, remaining: 0, resetIn: entry.resetTime - now }
  }

  return { allowed: true, remaining: maxRequests - entry.count, resetIn: entry.resetTime - now }
}

// --- Upload Limits ---
export const UPLOAD_LIMITS = {
  MAX_FILE_SIZE: 50 * 1024 * 1024,     // 50MB per file
  MAX_TOTAL_SIZE: 200 * 1024 * 1024,   // 200MB total per request
  MAX_FILE_COUNT: 10,                   // Maksimal 10 file per request
  RATE_LIMIT_REQUESTS: 30,             // 30 request per window
  RATE_LIMIT_WINDOW_MS: 60_000,        // 1 menit window
} as const

/**
 * Encode filename aman untuk Content-Disposition header (RFC 5987)
 * Mencegah header injection via filename
 */
export function safeContentDisposition(filename: string): string {
  const sanitized = sanitizeFilename(filename)
  // ASCII-safe encoding untuk header
  const encoded = encodeURIComponent(sanitized).replace(/['()]/g, escape)
  return `attachment; filename*=UTF-8''${encoded}`
}

/**
 * Ambil IP dari event H3 — support X-Forwarded-For (reverse proxy)
 */
export function getClientIp(event: any): string {
  const xff = getRequestHeader(event, 'x-forwarded-for')
  if (xff) {
    // Ambil IP pertama (client asli)
    return xff.split(',')[0]!.trim()
  }
  const realIp = getRequestHeader(event, 'x-real-ip')
  if (realIp) return realIp.trim()
  
  // Fallback ke remote address
  return event.node?.req?.socket?.remoteAddress || '0.0.0.0'
}

/**
 * Konfigurasi dan utility untuk IDX Stock API proxy
 * Base URL, headers, in-memory TTL cache, dan retry logic
 */

// Base URL untuk IDX API via RapidAPI
export const IDX_BASE_URL = 'https://indonesia-stock-exchange-idx.p.rapidapi.com'

// Header default untuk RapidAPI
export function getIdxHeaders(): Record<string, string> {
  const apiKey = process.env.RAPIDAPI_KEY || ''
  if (!apiKey) {
    throw createError({
      statusCode: 500,
      statusMessage: 'RAPIDAPI_KEY belum dikonfigurasi di environment variables',
    })
  }
  return {
    'x-rapidapi-key': apiKey,
    'x-rapidapi-host': 'indonesia-stock-exchange-idx.p.rapidapi.com',
    'Content-Type': 'application/json',
  }
}

// Simple in-memory cache dengan TTL
interface CacheEntry<T> {
  data: T
  expiry: number
}

const cache = new Map<string, CacheEntry<any>>()

/**
 * Fetch dengan retry saat kena 429 rate limit
 * Max 3 kali percobaan, delay bertambah tiap retry
 */
export async function fetchWithRetry<T>(
  url: string,
  options: Record<string, any>,
  maxRetries: number = 2
): Promise<T> {
  let lastError: any

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await $fetch<T>(url, options)
    } catch (err: any) {
      lastError = err
      const status = err?.status || err?.statusCode || err?.response?.status || 0

      // Hanya retry jika 429 (rate limit) dan masih ada kesempatan
      if (status === 429 && attempt < maxRetries) {
        const delay = (attempt + 1) * 2000 // 2s, 4s
        console.warn(`[IDX API] 429 Rate Limited, retry ${attempt + 1}/${maxRetries} in ${delay}ms...`)
        await new Promise(resolve => setTimeout(resolve, delay))
        continue
      }

      // Throw error yang user-friendly
      if (status === 429) {
        throw createError({
          statusCode: 429,
          statusMessage: 'API rate limit tercapai. Coba lagi dalam beberapa detik.',
        })
      }

      throw createError({
        statusCode: status || 500,
        statusMessage: err?.message || 'Gagal mengambil data dari IDX API',
      })
    }
  }

  throw lastError
}

/**
 * Ambil data dari cache atau fetch baru jika expired
 * @param key - Unique cache key
 * @param ttlMs - Time-to-live dalam milliseconds
 * @param fetcher - Fungsi async untuk fetch data
 */
export async function cachedFetch<T>(
  key: string,
  ttlMs: number,
  fetcher: () => Promise<T>
): Promise<T> {
  const now = Date.now()
  const cached = cache.get(key)

  // Return cache jika masih valid
  if (cached && cached.expiry > now) {
    return cached.data as T
  }

  try {
    const data = await fetcher()
    cache.set(key, { data, expiry: now + ttlMs })
    return data
  } catch (err: any) {
    // Kalau fetch gagal tapi ada stale cache, return stale data
    if (cached) {
      console.warn(`[IDX API] Fetch gagal, return stale cache untuk key: ${key}`)
      return cached.data as T
    }
    throw err
  }
}

// TTL presets — diperbesar untuk hemat quota plan gratis
export const CACHE_TTL = {
  REALTIME: 60 * 1000,          // 1 menit — data harga
  SHORT: 5 * 60 * 1000,          // 5 menit — trending, movers
  MEDIUM: 10 * 60 * 1000,        // 10 menit — chart, technical
  LONG: 30 * 60 * 1000,          // 30 menit — info emiten
  SEARCH: 60 * 60 * 1000,        // 1 jam — search results
}

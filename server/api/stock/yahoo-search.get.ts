/**
 * GET /api/stock/yahoo-search?q=BBCA
 * Pencarian saham via Yahoo Finance — prioritas IDX (.JK)
 * Melakukan 2 pencarian paralel: query mentah + query.JK
 * Hasilnya digabung dengan saham IDX di posisi paling atas
 */
export default defineEventHandler(async (event) => {
  const { q } = getQuery(event) as { q?: string }

  if (!q || q.trim().length < 1) {
    throw createError({ statusCode: 400, statusMessage: 'Parameter q diperlukan' })
  }

  const query = q.trim().toUpperCase()
  const cacheKey = `yahoo:search:${query}`

  return cachedFetch(cacheKey, CACHE_TTL.SEARCH, async () => {
    const headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }

    const searchParams = {
      quotesCount: 15,
      newsCount: 0,
      listsCount: 0,
      lang: 'en-US',
      region: 'ID'
    }

    try {
      // Parallel: cari query biasa + query.JK (khusus IDX)
      const [generalRes, idxRes] = await Promise.allSettled([
        $fetch<any>('https://query1.finance.yahoo.com/v1/finance/search', {
          params: { ...searchParams, q: query },
          headers
        }),
        $fetch<any>('https://query1.finance.yahoo.com/v1/finance/search', {
          params: { ...searchParams, q: `${query}.JK` },
          headers
        })
      ])

      const generalQuotes: any[] = generalRes.status === 'fulfilled' ? (generalRes.value?.quotes || []) : []
      const idxQuotes: any[] = idxRes.status === 'fulfilled' ? (idxRes.value?.quotes || []) : []

      // Gabungkan semua hasil
      const allQuotes = [...idxQuotes, ...generalQuotes]

      // Deduplicate berdasarkan symbol
      const seen = new Set<string>()
      const unique = allQuotes.filter((q: any) => {
        if (!q.symbol || seen.has(q.symbol)) return false
        // Hanya equity & ETF
        if (q.quoteType !== 'EQUITY' && q.quoteType !== 'ETF') return false
        seen.add(q.symbol)
        return true
      })

      // Sort: IDX (.JK) di atas, lalu sisanya
      const sorted = unique.sort((a: any, b: any) => {
        const aIsIDX = a.symbol?.endsWith('.JK') ? 0 : 1
        const bIsIDX = b.symbol?.endsWith('.JK') ? 0 : 1
        return aIsIDX - bIsIDX
      })

      return sorted.map((q: any) => {
        const isIDX = q.symbol?.endsWith('.JK') || false
        return {
          symbol: isIDX ? q.symbol.replace('.JK', '') : q.symbol,
          name: q.longname || q.shortname || q.symbol || '',
          exchange: q.exchange || '',
          type: q.quoteType || 'EQUITY',
          isIDX,
          yahooSymbol: q.symbol || '',
          // Badge untuk UI
          tag: isIDX ? 'IDX' : (q.exchange || '')
        }
      })
    } catch (err: any) {
      throw createError({
        statusCode: err?.status || 500,
        statusMessage: err?.message || 'Gagal mencari saham via Yahoo Finance'
      })
    }
  })
})

// Server proxy ke API resmi OpenFoodFacts
export default defineCachedEventHandler(async (event) => {
  // Mengambil query parameter dari request
  const query = getQuery(event)
  const page = Math.max(1, Number(query.page) || 1)
  const limit = Math.min(100, Math.max(1, Number(query.limit) || 20))
  const search = (query.search as string || '').trim()

  try {
    // Gunakan API v1 OpenFoodFacts (cgi/search.pl) yang mendukung full-text search
    const apiUrl = 'https://world.openfoodfacts.org/cgi/search.pl'
    
    // Parameter dasar untuk API v1
    const apiQuery: Record<string, any> = {
      action: 'process',
      json: 1,
      page,
      page_size: limit,
      sort_by: 'unique_scans_n',
      fields: 'code,product_name,brands,nutriments,image_front_url,countries_tags,labels_tags,nutriscore_grade,nova_group,quantity,categories'
    }

    if (search) {
      apiQuery.search_simple = 1
      apiQuery.search_terms = search
    } else {
      // Jika tidak ada search, gunakan filter bahasa Inggris agar data selalu muncul
      apiQuery.tagtype_0 = 'languages'
      apiQuery.tag_contains_0 = 'contains'
      apiQuery.tag_0 = 'en'
    }

    const data: any = await $fetch(apiUrl, {
      query: apiQuery,
      headers: {
        'User-Agent': 'FiGoApp - Nuxt/3.0 - https://figo.com',
      }
    })

    // Transform response menjadi format yang rapi untuk frontend (sesuai ekspektasi UI)
    const foods = (data.products || []).map((row: any, index: number) => {
      // Ekstrak nutrisi (menggunakan per 100g)
      const n = row.nutriments || {}
      const nutrients = {
        kcal: n['energy-kcal_100g'] != null ? Math.round(n['energy-kcal_100g']) : null,
        protein: n['proteins_100g'] != null ? Math.round(n['proteins_100g'] * 10) / 10 : null,
        fat: n['fat_100g'] != null ? Math.round(n['fat_100g'] * 10) / 10 : null,
        carbs: n['carbohydrates_100g'] != null ? Math.round(n['carbohydrates_100g'] * 10) / 10 : null,
        sugar: n['sugars_100g'] != null ? Math.round(n['sugars_100g'] * 10) / 10 : null,
        salt: n['salt_100g'] != null ? Math.round(n['salt_100g'] * 10) / 10 : null,
      }

      // Ekstrak negara (hilangkan prefix en:)
      const countries = (row.countries_tags || []).map((tag: string) =>
        tag.replace(/^[a-z]{2}:/, '')
      )

      // Ekstrak label pertama
      let firstLabel = null
      if (row.labels_tags && row.labels_tags.length > 0) {
        const clean = row.labels_tags[0].replace(/^[a-z]{2}:/, '')
        firstLabel = clean.split('-').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
      }

      return {
        idx: index,
        code: row.code || '',
        name: row.product_name || 'Unknown Product',
        brand: row.brands || '',
        categories: row.categories || '',
        countries,
        imageUrl: row.image_front_url || null,
        nutrients,
        nutriscoreGrade: ['a', 'b', 'c', 'd', 'e'].includes(row.nutriscore_grade?.toLowerCase()) ? row.nutriscore_grade.toLowerCase() : null,
        novaGroup: row.nova_group || null,
        quantity: row.quantity || '',
        labels: firstLabel,
        lang: 'en',
      }
    })

    const rawTotalPages = Math.ceil((data.count || 0) / limit) || 1
    
    return {
      foods,
      total: data.count || 0,
      page,
      limit,
      totalPages: rawTotalPages,
    }
  } catch (error: any) {
    console.error('[foods] API error:', error?.message || error)

    throw createError({
      statusCode: error?.statusCode || 502,
      statusMessage: `Gagal mengambil data dari OpenFoodFacts: ${error?.message || 'Unknown error'}`,
    })
  }
}, {
  maxAge: 60 * 60 * 24, // Simpan data di cache selama 24 jam untuk performa maksimal
  swr: true,
})

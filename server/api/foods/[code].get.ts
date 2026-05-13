// Detail produk nutrisi dari OpenFoodFacts
export default defineCachedEventHandler(async (event) => {
  const code = getRouterParam(event, 'code')

  if (!code) {
    throw createError({ statusCode: 400, statusMessage: 'Kode produk wajib diisi' })
  }

  try {
    // Ambil data detail produk dari OpenFoodFacts API v2
    const data: any = await $fetch(`https://world.openfoodfacts.org/api/v2/product/${code}.json`, {
      headers: {
        'User-Agent': 'FiGoApp - Nuxt/3.0 - https://figo.com',
      },
    })

    if (!data?.product) {
      throw createError({ statusCode: 404, statusMessage: 'Produk tidak ditemukan' })
    }

    const p = data.product
    const n = p.nutriments || {}

    // Helper: bulatkan ke 1 desimal, return null jika tidak ada
    const round1 = (val: any) => val != null ? Math.round(Number(val) * 10) / 10 : null

    // Ekstrak nutrisi utama (per 100g)
    const mainNutrients = {
      calories: n['energy-kcal_100g'] != null ? Math.round(n['energy-kcal_100g']) : null,
      totalFat: round1(n['fat_100g']),
      saturatedFat: round1(n['saturated-fat_100g']),
      carbohydrates: round1(n['carbohydrates_100g']),
      fiber: round1(n['fiber_100g']),
      sugars: round1(n['sugars_100g']),
      protein: round1(n['proteins_100g']),
      salt: round1(n['salt_100g']),
      sodium: round1(n['sodium_100g']),
    }

    // Ekstrak vitamin yang tersedia
    const vitaminKeys = [
      { key: 'vitamin-a_100g', name: 'Vitamin A', unit: 'µg' },
      { key: 'vitamin-c_100g', name: 'Vitamin C', unit: 'mg' },
      { key: 'vitamin-d_100g', name: 'Vitamin D', unit: 'µg' },
      { key: 'vitamin-e_100g', name: 'Vitamin E', unit: 'mg' },
      { key: 'vitamin-b1_100g', name: 'Vitamin B1', unit: 'mg' },
      { key: 'vitamin-b2_100g', name: 'Vitamin B2', unit: 'mg' },
      { key: 'vitamin-b6_100g', name: 'Vitamin B6', unit: 'mg' },
      { key: 'vitamin-b9_100g', name: 'Vitamin B9', unit: 'µg' },
      { key: 'vitamin-b12_100g', name: 'Vitamin B12', unit: 'µg' },
    ]
    const vitamins = vitaminKeys
      .filter(v => n[v.key] != null && Number(n[v.key]) > 0)
      .map(v => ({ name: v.name, value: round1(n[v.key]), unit: v.unit }))

    // Ekstrak mineral yang tersedia
    const mineralKeys = [
      { key: 'calcium_100g', name: 'Calcium', unit: 'mg' },
      { key: 'iron_100g', name: 'Iron', unit: 'mg' },
      { key: 'magnesium_100g', name: 'Magnesium', unit: 'mg' },
      { key: 'potassium_100g', name: 'Potassium', unit: 'mg' },
      { key: 'zinc_100g', name: 'Zinc', unit: 'mg' },
      { key: 'phosphorus_100g', name: 'Phosphorus', unit: 'mg' },
    ]
    const minerals = mineralKeys
      .filter(m => n[m.key] != null && Number(n[m.key]) > 0)
      .map(m => ({ name: m.name, value: round1(n[m.key]), unit: m.unit }))

    // Ekstrak negara asal
    const countries = (p.countries_tags || []).map((tag: string) =>
      tag.replace(/^[a-z]{2}:/, '').split('-').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
    )

    // Alergen
    const allergens = (p.allergens_tags || []).map((tag: string) =>
      tag.replace(/^[a-z]{2}:/, '').split('-').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
    )

    // Hitung Health Score berdasarkan nutriscore_grade (estimasi skor 0-100)
    const nutriscoreGrade = ['a', 'b', 'c', 'd', 'e'].includes(p.nutriscore_grade?.toLowerCase())
      ? p.nutriscore_grade.toLowerCase()
      : null

    const healthScoreMap: Record<string, number> = { a: 92, b: 78, c: 60, d: 40, e: 20 }
    const healthRatingMap: Record<string, string> = { a: 'Excellent', b: 'Good', c: 'Average', d: 'Below Average', e: 'Poor' }

    const healthScore = nutriscoreGrade ? healthScoreMap[nutriscoreGrade] : null
    const healthRating = nutriscoreGrade ? healthRatingMap[nutriscoreGrade] : null

    // Buat deskripsi dan benefits berdasarkan data nutrisi
    const benefits: string[] = []
    if (mainNutrients.protein && mainNutrients.protein >= 10) benefits.push('High in Protein')
    if (mainNutrients.fiber && mainNutrients.fiber >= 5) benefits.push('Good Source of Fiber')
    if (mainNutrients.totalFat != null && mainNutrients.totalFat < 3) benefits.push('Low Fat Content')
    if (mainNutrients.sugars != null && mainNutrients.sugars < 5) benefits.push('Low in Sugar')
    if (mainNutrients.salt != null && mainNutrients.salt < 0.3) benefits.push('Low Sodium')
    if (vitamins.length > 0) benefits.push(`Contains ${vitamins.length} Vitamins`)
    if (minerals.length > 0) benefits.push(`Rich in ${minerals.length} Minerals`)
    if (nutriscoreGrade === 'a') benefits.push('Top Nutritional Quality')
    if (benefits.length === 0) benefits.push('Basic Nutritional Value')

    // Deskripsi health impact berdasarkan profil nutrisi
    const healthDescriptions: Record<string, string> = {
      a: 'Outstanding nutritional profile with excellent balance of macro and micronutrients.',
      b: 'Good nutritional quality with balanced macronutrients and moderate benefits.',
      c: 'Average nutritional profile. Suitable for moderate consumption.',
      d: 'Below average nutrition. Should be consumed sparingly.',
      e: 'Low nutritional quality. Consider healthier alternatives.',
    }
    const healthDescription = nutriscoreGrade ? healthDescriptions[nutriscoreGrade] : 'Nutritional data available for review.'

    return {
      code: p.code,
      name: p.product_name || 'Unknown Product',
      brand: p.brands || '',
      quantity: p.quantity || '',
      categories: p.categories || '',
      ingredients: p.ingredients_text || '',
      imageUrl: p.image_front_url || null,
      countries,
      allergens,
      nutriscoreGrade,
      novaGroup: p.nova_group || null,
      mainNutrients,
      vitamins,
      minerals,
      healthScore,
      healthRating,
      healthDescription,
      benefits,
    }
  } catch (error: any) {
    if (error.statusCode) throw error
    console.error('[foods/detail] API error:', error?.message || error)
    throw createError({
      statusCode: 502,
      statusMessage: `Gagal mengambil detail produk: ${error?.message || 'Unknown error'}`,
    })
  }
}, {
  maxAge: 60 * 60 * 24, // Cache 24 jam karena data nutrisi jarang berubah
  swr: true,
})

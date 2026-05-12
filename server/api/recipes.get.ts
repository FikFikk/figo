// server/api/recipes.get.ts
import { readFileSync, existsSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

// Membaca index judul resep dari file lokal (dimuat sekali saat server start)
let titleIndex: { idx: number; title: string; ni: number; ns: number }[] | null = null

function loadTitleIndex() {
  if (titleIndex) return titleIndex
  try {
    // Coba beberapa path karena Nitro bisa mengubah working directory
    const candidates = [
      resolve(process.cwd(), 'server', 'data', 'recipe-titles.json'),
      resolve(dirname(fileURLToPath(import.meta.url)), '..', 'data', 'recipe-titles.json'),
      resolve(dirname(fileURLToPath(import.meta.url)), '..', '..', 'server', 'data', 'recipe-titles.json'),
    ]

    for (const filePath of candidates) {
      if (existsSync(filePath)) {
        console.log('[recipes] Index ditemukan di:', filePath)
        titleIndex = JSON.parse(readFileSync(filePath, 'utf-8'))
        return titleIndex
      }
    }

    console.error('[recipes] Index tidak ditemukan di:', candidates)
    return null
  } catch (err) {
    console.error('[recipes] Gagal memuat index:', err)
    return null
  }
}

export default defineEventHandler(async (event) => {
  // Mengambil token dari environment variable
  const token = process.env.HF_TOKEN || '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'

  // Mengambil query parameter dari request
  const query = getQuery(event)
  const page = Math.max(1, Number(query.page) || 1)
  const limit = Math.min(100, Math.max(1, Number(query.limit) || 20))
  const search = (query.search as string || '').trim().toLowerCase()

  // === MODE PENCARIAN: Gunakan index lokal ===
  if (search) {
    const index = loadTitleIndex()
    if (!index) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Index resep belum dibuat. Jalankan: npx tsx scripts/build-recipe-index.ts'
      })
    }

    // Filter berdasarkan judul (harus mengandung semua kata kunci)
    const searchWords = search.split(/\s+/).filter(word => word.length > 0)
    const matched = index.filter(r => {
      const titleLower = r.title.toLowerCase()
      return searchWords.every(word => titleLower.includes(word))
    })
    const total = matched.length
    const offset = (page - 1) * limit
    const paged = matched.slice(offset, offset + limit)

    return {
      recipes: paged.map(r => ({
        idx: r.idx,
        title: r.title,
        numIngredients: r.ni,
        numSteps: r.ns,
      })),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    }
  }

  // === MODE NORMAL: Fetch dari HuggingFace API ===
  const offset = (page - 1) * limit

  try {
    const data: any = await $fetch('https://datasets-server.huggingface.co/rows', {
      headers: {
        'Authorization': `Bearer ${token}`
      },
      query: {
        dataset: 'junwatu/indonesian-recipes',
        config: 'default',
        split: 'train',
        offset,
        limit
      }
    })

    // Mengembalikan data yang sudah diformat untuk frontend (batasi sesuai limit)
    return {
      recipes: data.rows.slice(0, limit).map((item: any) => ({
        idx: item.row_idx,
        title: item.row.title,
        numIngredients: item.row.num_ingredients,
        numSteps: item.row.num_steps,
      })),
      total: data.num_rows_total || 0,
      page,
      limit,
      totalPages: Math.ceil((data.num_rows_total || 0) / limit),
    }
  } catch (error: any) {
    // Penanganan error jika API gagal diakses
    throw createError({
      statusCode: error?.statusCode || 500,
      statusMessage: 'Gagal mengambil data resep dari Hugging Face'
    })
  }
})

// server/api/recipes/[id].get.ts
// Mengambil detail resep berdasarkan row index dari HuggingFace Dataset
export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const rowIdx = Number(id)

  // Validasi parameter
  if (isNaN(rowIdx) || rowIdx < 0) {
    throw createError({
      statusCode: 400,
      statusMessage: 'ID resep tidak valid'
    })
  }

  const token = process.env.HF_TOKEN || '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'

  try {
    // Fetch satu baris data dari offset = rowIdx, limit = 1
    const data: any = await $fetch('https://datasets-server.huggingface.co/rows', {
      headers: {
        'Authorization': `Bearer ${token}`
      },
      query: {
        dataset: 'junwatu/indonesian-recipes',
        config: 'default',
        split: 'train',
        offset: rowIdx,
        limit: 1
      }
    })

    // Pastikan data ditemukan
    if (!data.rows || data.rows.length === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Resep tidak ditemukan'
      })
    }

    const row = data.rows[0].row

    return {
      idx: data.rows[0].row_idx,
      title: row.title,
      ingredients: row.ingredients,
      steps: row.steps,
      numIngredients: row.num_ingredients,
      numSteps: row.num_steps,
      charCount: row.char_count,
    }
  } catch (error: any) {
    // Re-throw jika sudah berupa createError
    if (error.statusCode) throw error

    throw createError({
      statusCode: 500,
      statusMessage: 'Gagal mengambil detail resep'
    })
  }
})

// server/api/recipes.get.ts
import { readFileSync, existsSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

let titleIndex: { idx: number; title: string; ni: number; ns: number }[] | null = null

function loadTitleIndex() {
  if (titleIndex) return titleIndex
  try {
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
    return null
  } catch (err) {
    return null
  }
}

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const page = Math.max(1, Number(query.page) || 1)
  const limit = Math.min(100, Math.max(1, Number(query.limit) || 20))
  const search = (query.search as string || '').trim().toLowerCase()

  const index = loadTitleIndex()
  if (!index) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Index resep lokal belum tersedia.'
    })
  }

  let matched = index
  if (search) {
    const searchWords = search.split(/\s+/).filter(word => word.length > 0)
    matched = index.filter(r => {
      const titleLower = r.title.toLowerCase()
      return searchWords.every(word => titleLower.includes(word))
    })
  }

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
})

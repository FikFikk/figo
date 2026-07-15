// server/api/recipes/[id].get.ts
import { readFileSync, existsSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

let titleIndex: { idx: number; title: string; ni: number; ns: number }[] | null = null

function loadTitleIndex() {
  if (titleIndex) return titleIndex
  try {
    const candidates = [
      resolve(process.cwd(), 'server', 'data', 'recipe-titles.json'),
      resolve(dirname(fileURLToPath(import.meta.url)), '..', '..', 'data', 'recipe-titles.json'),
      resolve(dirname(fileURLToPath(import.meta.url)), '..', '..', '..', 'server', 'data', 'recipe-titles.json'),
    ]

    for (const filePath of candidates) {
      if (existsSync(filePath)) {
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
  const id = getRouterParam(event, 'id')
  const rowIdx = Number(id)

  if (isNaN(rowIdx) || rowIdx < 0) {
    throw createError({ statusCode: 400, statusMessage: 'ID resep tidak valid' })
  }

  const index = loadTitleIndex()
  if (!index) {
    throw createError({ statusCode: 500, statusMessage: 'Index lokal tidak ditemukan' })
  }

  const recipeBasic = index.find(r => r.idx === rowIdx)
  if (!recipeBasic) {
    throw createError({ statusCode: 404, statusMessage: 'Resep tidak ditemukan di index lokal' })
  }

  // Generate mock array for missing ingredients and steps
  // because HF API is gated/down.
  const ingredients = Array.from({ length: Math.max(1, recipeBasic.ni) }).map((_, i) => `Bahan rahasia ${i + 1} untuk ${recipeBasic.title}`)
  const steps = Array.from({ length: Math.max(1, recipeBasic.ns) }).map((_, i) => `Langkah ke-${i + 1}: Siapkan bahan masakan dan olah dengan teknik yang tepat hingga matang.`)

  return {
    idx: recipeBasic.idx,
    title: recipeBasic.title,
    ingredients: ingredients,
    steps: steps,
    numIngredients: recipeBasic.ni,
    numSteps: recipeBasic.ns,
    charCount: recipeBasic.title.length * 5,
    note: "Data detail asli tidak dapat ditarik dari Hugging Face (Gated). Ini adalah data simulasi."
  }
})

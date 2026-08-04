import { defineEventHandler } from 'h3'
import { promises as fs } from 'node:fs'
import { resolve } from 'node:path'

/**
 * GET /api/forex/signals
 * Read exported forex research signals from local research service.
 * Data hanya bisa diakses dari local path — tidak perlu PIN gate tambahan.
 */
export default defineEventHandler(async (_event) => {
  const filePath = resolve('/root/figo/services/forex-research/storage/signals_export.json')

  try {
    const raw = await fs.readFile(filePath, 'utf8')
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
})

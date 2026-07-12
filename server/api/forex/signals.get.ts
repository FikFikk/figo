import { defineEventHandler } from 'h3'
import { promises as fs } from 'node:fs'
import { resolve } from 'node:path'
import { assertUnlocked } from '../../lib/stream-auth'

/**
 * GET /api/forex/signals
 * Read exported forex research signals from local research service.
 * Protected by same PIN gate as streaming tools.
 */
export default defineEventHandler(async (event) => {
  assertUnlocked(event)

  const filePath = resolve('/root/figo/services/forex-research/storage/signals_export.json')

  try {
    const raw = await fs.readFile(filePath, 'utf8')
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
})

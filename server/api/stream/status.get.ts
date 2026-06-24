import { defineEventHandler } from 'h3'
import { isUnlocked } from '../../lib/stream-auth'

/**
 * Cek apakah sesi stream sudah ter-unlock (cookie valid & belum expired).
 * Dipakai frontend untuk menentukan tampil PIN gate atau player.
 */
export default defineEventHandler((event) => {
  return { unlocked: isUnlocked(event) }
})

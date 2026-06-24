import { defineEventHandler } from 'h3'
import { clearUnlockCookie } from '../../lib/stream-auth'

/**
 * Kunci kembali sesi stream — hapus cookie unlock.
 */
export default defineEventHandler((event) => {
  clearUnlockCookie(event)
  return { unlocked: false }
})

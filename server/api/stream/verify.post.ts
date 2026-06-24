import { defineEventHandler, readBody, createError } from 'h3'
import { verifyPin, setUnlockCookie, STREAM_TTL_SECONDS } from '../../lib/stream-auth'

/**
 * Verifikasi PIN streaming. Jika benar, set cookie unlock httpOnly
 * yang berlaku 1 hari. Body: { pin: string }
 */
export default defineEventHandler(async (event) => {
  let body: { pin?: string }
  try {
    body = await readBody(event)
  } catch {
    throw createError({ statusCode: 400, statusMessage: 'Body tidak valid.' })
  }

  const pin = String(body?.pin || '').trim()
  if (!pin) {
    throw createError({ statusCode: 400, statusMessage: 'PIN wajib diisi.' })
  }

  if (!verifyPin(event, pin)) {
    // Jangan bocorkan apakah PIN ada/tidak — pesan generik
    throw createError({ statusCode: 401, statusMessage: 'PIN salah.' })
  }

  setUnlockCookie(event)

  return {
    unlocked: true,
    expiresIn: STREAM_TTL_SECONDS,
  }
})

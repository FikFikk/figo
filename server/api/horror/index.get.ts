import { assertUnlocked } from '../../lib/stream-auth'

export default defineEventHandler(async (event) => {
  // Validasi PIN sebelum akses
  assertUnlocked(event);

  const config = useRuntimeConfig();
  const GO_DOWNLOAD_API_URL = config.public.GO_DOWNLOAD_API_URL || 'http://localhost:5001';

  try {
    const data = await $fetch(`${GO_DOWNLOAD_API_URL}/catalog/horror`);
    return data;
  } catch (error: any) {
    throw createError({
      statusCode: error?.response?.status || 500,
      message: error?.message || 'Gagal memuat katalog Horror',
    });
  }
});

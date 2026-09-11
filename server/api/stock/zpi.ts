import { defineEventHandler, getQuery } from 'h3'
import { $fetch } from 'ofetch'

const ZPI_KEY = 'zpi_h577gbn8dgh8agm268yta1auv5'
const BASE_URL = 'https://api.zpi.web.id/v1/finance:tradingview'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const endpoint = query.endpoint as string
  const url = `${BASE_URL}/${endpoint}`
  // remove endpoint from query
  const { endpoint: _, ...params } = query
  
  try {
    const data = await $fetch(url, {
      params,
      headers: {
        'x-api-key': ZPI_KEY
      }
    })
    return data
  } catch (error: any) {
    const status = error.statusCode || error.response?.status || 500
    const errData = error.response?._data || {}
    const msg = errData?.message || (status === 429 ? 'Kuota bulanan TradingView (ZPI) telah habis (600/600 request). Reset pada tanggal 1.' : 'Gagal mengambil data dari TradingView (ZPI)')
    throw createError({
      statusCode: status,
      statusMessage: msg,
      data: errData
    })
  }
})

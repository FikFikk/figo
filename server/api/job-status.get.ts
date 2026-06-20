import { defineEventHandler, getQuery } from 'h3'
import { downloadJobs } from '../lib/jobs'

const GO_DOWNLOAD_API_URL = process.env.GO_DOWNLOAD_API_URL || 'http://127.0.0.1:5001'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const id = query.id as string
  
  if (!id) return { status: 'error', error: 'Missing job ID' }

  try {
    return await $fetch(`${GO_DOWNLOAD_API_URL}/job-status`, {
      query: { id },
      timeout: 5_000,
    })
  } catch (err: any) {
    console.error('[Go Job Status Error]', err.data?.message || err.message || String(err))
  }
  
  const job = downloadJobs.get(id)
  if (!job) return { status: 'not_found', error: 'Job not found or expired.' }
  
  return {
    status: job.status,
    error: job.error
  }
})

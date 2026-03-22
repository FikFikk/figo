import { defineEventHandler, getQuery } from 'h3'
import { downloadJobs } from '../lib/jobs'

export default defineEventHandler((event) => {
  const query = getQuery(event)
  const id = query.id as string
  
  if (!id) return { status: 'error', error: 'Missing job ID' }
  
  const job = downloadJobs.get(id)
  if (!job) return { status: 'not_found', error: 'Job not found or expired.' }
  
  return {
    status: job.status,
    error: job.error
  }
})

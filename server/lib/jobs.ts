// Job store — shared state untuk download background jobs
import type { DownloadJob } from './types'

export type { DownloadJob }
export const downloadJobs = new Map<string, DownloadJob>()

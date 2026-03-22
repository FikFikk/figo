interface DownloadJob {
  status: 'processing' | 'done' | 'error';
  filePath?: string;
  ext?: string;
  mimeType?: string;
  error?: string;
  title?: string;
}

export const downloadJobs = new Map<string, DownloadJob>()

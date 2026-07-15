import fs from 'node:fs'
import path from 'node:path'
import { defineEventHandler, getQuery, createError } from 'h3'

const VAULT_DIR = '/root/ObsidianVault'

function walkDir(dir: string, fileList: string[] = []): string[] {
  if (!fs.existsSync(dir)) return fileList
  const files = fs.readdirSync(dir)
  for (const file of files) {
    const stat = fs.statSync(path.join(dir, file))
    if (stat.isDirectory()) {
      walkDir(path.join(dir, file), fileList)
    } else if (file.endsWith('.md')) {
      fileList.push(path.join(dir, file))
    }
  }
  return fileList
}

export default defineEventHandler((event) => {
  const query = getQuery(event)
  
  if (query.pin !== '112233') {
    throw createError({
      statusCode: 403,
      statusMessage: 'Forbidden: Invalid PIN',
    })
  }

  const files = walkDir(VAULT_DIR)
  
  const nodes: { id: string; label: string; group?: string; content?: string }[] = []
  const edges: { from: string; to: string }[] = []
  
  const nodeExists = new Map<string, any>()

  // Pass 1: Add existing files
  for (const p of files) {
    const baseName = path.basename(p, '.md')
    const content = fs.readFileSync(p, 'utf-8')
    
    if (!nodeExists.has(baseName)) {
      const node = { id: baseName, label: baseName, group: 'file', content }
      nodes.push(node)
      nodeExists.set(baseName, node)
    }
    
    // Parse [[Links]]
    const linkRegex = /\[\[(.*?)\]\]/g
    let match
    while ((match = linkRegex.exec(content)) !== null) {
      const target = match[1].split('|')[0]
      edges.push({ from: baseName, to: target })
    }
  }

  // Pass 2: Add unresolved nodes (targets that aren't actual files)
  const allTargets = [...new Set(edges.map(e => e.to))]
  for (const target of allTargets) {
    if (!nodeExists.has(target)) {
      nodes.push({ id: target, label: target, group: 'unresolved' })
      nodeExists.set(target, true)
    }
  }

  return { nodes, edges }
})

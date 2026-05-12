/**
 * Script untuk mendownload dataset resep dari HuggingFace
 * dan mengekstrak semua judul menjadi JSON index untuk fitur pencarian.
 * 
 * Jalankan: node --loader ts-node/esm scripts/build-recipe-index.ts
 * atau: npx tsx scripts/build-recipe-index.ts
 */
import { readFileSync, writeFileSync, mkdirSync } from 'fs'
import { resolve } from 'path'
import { parquetRead } from 'hyparquet'
import { compressors } from 'hyparquet-compressors'

const HF_TOKEN = process.env.HF_TOKEN || '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'
const PARQUET_URL = 'https://huggingface.co/api/datasets/junwatu/indonesian-recipes/parquet/default/train/0.parquet'
const OUTPUT_DIR = resolve(import.meta.dirname || '.', '..', 'server', 'data')
const OUTPUT_FILE = resolve(OUTPUT_DIR, 'recipe-titles.json')

async function main() {
  console.log('📥 Mendownload file parquet dari HuggingFace...')
  
  // Download file parquet
  const response = await fetch(PARQUET_URL, {
    headers: { 'Authorization': `Bearer ${HF_TOKEN}` }
  })
  
  if (!response.ok) {
    throw new Error(`Gagal download: ${response.status} ${response.statusText}`)
  }
  
  const buffer = await response.arrayBuffer()
  console.log(`✅ Download selesai: ${(buffer.byteLength / 1024 / 1024).toFixed(2)} MB`)
  
  // Parse parquet dan ekstrak judul + metadata
  console.log('🔍 Mengekstrak judul resep dari file parquet...')
  
  const titles: { idx: number; title: string; ni: number; ns: number }[] = []
  
  await parquetRead({
    file: { byteLength: buffer.byteLength, slice: (start: number, end: number) => buffer.slice(start, end) },
    columns: ['title', 'num_ingredients', 'num_steps'],
    compressors,
    onComplete: (data: any[]) => {
      // Format: data = array of rows, setiap row = [title, num_ingredients, num_steps]
      for (let i = 0; i < data.length; i++) {
        const row = data[i]
        titles.push({
          idx: i,
          title: String(row[0] || ''),
          ni: Number(row[1]) || 0,
          ns: Number(row[2]) || 0,
        })
      }
    }
  })
  
  console.log(`✅ Berhasil mengekstrak ${titles.length} judul resep`)
  
  // Simpan ke file JSON
  mkdirSync(OUTPUT_DIR, { recursive: true })
  writeFileSync(OUTPUT_FILE, JSON.stringify(titles))
  
  const fileSize = readFileSync(OUTPUT_FILE).byteLength
  console.log(`💾 Disimpan ke: ${OUTPUT_FILE} (${(fileSize / 1024).toFixed(1)} KB)`)
  console.log('🎉 Selesai!')
}

main().catch(err => {
  console.error('❌ Error:', err.message)
  process.exit(1)
})

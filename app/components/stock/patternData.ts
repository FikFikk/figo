// 8 kategori utama ensiklopedia saham — Types & re-exports
// Data di-split ke file terpisah per kategori untuk maintainability

// ═══ TYPE DEFINITIONS ═══
export interface CandleDef { wickTop: number; bodyTop: number; bodyBot: number; wickBot: number; color: string; hollow?: boolean; w?: number }
export interface DetailSection { title: string; body: string }
export interface HarmonicPoint { label: string; x: number; y: number }
export interface HarmonicFib { text: string; x: number; y: number; align?: string }
export interface HarmonicDef { points: HarmonicPoint[]; fibs: HarmonicFib[] }
export interface PatternDef { name: string; label: string; labelColor: string; desc: string; signal: string; candles: CandleDef[]; detail: DetailSection[]; harmonic?: HarmonicDef }
export interface CategoryDef { title: string; subtitle: string; open: boolean; patterns: PatternDef[] }
export interface ConceptDef { name: string; icon: string; desc: string; detail: DetailSection[] }
export interface ConceptCategoryDef { title: string; subtitle: string; open: boolean; concepts: ConceptDef[] }

// ═══ RE-EXPORTS dari file data ═══
// Kategori 1-3: Pola Candlestick (18 single + 17 double + 23 triple = 58)
export { candleCategories } from './candlePatternsData'
// Kategori 4-5: Pola Chart Klasik (26) + Harmonic (8) = 34
export { chartCategories } from './chartPatternsData'
// Kategori 6-8: Indikator (44) + SMC (16) + Teori (13) + Jenis Chart (8) = 81
export { advancedConceptCategories } from './advancedConceptsData'

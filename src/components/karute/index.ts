/**
 * Karute component types — standalone type definitions for Phase 4 (free tier).
 * When phases merge, these will be replaced by the full component barrel exports.
 */

export interface TranscriptSegment {
  text: string
  startTime: number
  endTime: number
  speakerLabel?: string | null
}

export type EntryCategory =
  | 'SYMPTOM'
  | 'TREATMENT'
  | 'BODY_AREA'
  | 'PREFERENCE'
  | 'LIFESTYLE'
  | 'NEXT_VISIT'
  | 'PRODUCT'
  | 'OTHER'

export interface KaruteEntryData {
  id: string
  category: EntryCategory
  content: string
  originalQuote?: string | null
  confidence: number
  tags: string[]
  sortOrder: number
}

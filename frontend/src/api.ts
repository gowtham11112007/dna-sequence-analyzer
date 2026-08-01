/**
 * API service — communicates with the FastAPI backend.
 * All endpoints are proxied through Vite dev server (see vite.config.ts).
 */

// --- Types matching backend response shapes ---

export interface AminoAcid {
  letter: string
  name: string
  three_letter: string
  chemical_class: 'nonpolar' | 'polar' | 'acidic' | 'basic' | 'unknown'
  position: number
}

export interface ProteinMatch {
  name: string
  uniprot_accession: string | null
  description: string
  match_percentage: number
  is_exact_match: boolean
  reference_length: number
  query_length: number
}

export interface UniProtEnrichment {
  protein_name: string
  function_description: string
  organism: string
  uniprot_url: string
}

export interface AnalyzeResult {
  dna_sequence: string
  mrna_sequence: string
  codons: string[]
  protein_sequence: string
  amino_acids: AminoAcid[]
  protein_match: ProteinMatch
  uniprot_enrichment: UniProtEnrichment | null
}

export interface Mutation {
  type: 'Substitution' | 'Insertion' | 'Deletion'
  position: number
  reference_base: string
  sample_base: string
  length?: number
  is_frameshift?: boolean
  reference_amino_acid?: string | null
  sample_amino_acid?: string | null
  amino_acid_effect?: string
  effect: string
}

export interface CompareResult {
  mutations: Mutation[]
  mutation_count: number
  reference_protein: string | null
  sample_protein: string | null
  alignment_score: number
}

// --- API error type ---
export interface ApiError {
  detail: string | { msg: string }[]
}

/**
 * Parse error response from FastAPI.
 * FastAPI validation errors return an array of objects; regular HTTPExceptions return a string.
 */
function parseError(data: ApiError): string {
  if (typeof data.detail === 'string') {
    return data.detail
  }
  if (Array.isArray(data.detail) && data.detail.length > 0) {
    // Pydantic validation error — extract the message from the first error
    return data.detail.map((e) => e.msg).join('; ')
  }
  return 'An unknown error occurred'
}

/**
 * POST /analyze — full DNA analysis pipeline
 */
export async function analyzeDNA(dnaSequence: string): Promise<AnalyzeResult> {
  const resp = await fetch('/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ dna_sequence: dnaSequence }),
  })

  const data = await resp.json()

  if (!resp.ok) {
    throw new Error(parseError(data))
  }

  return data as AnalyzeResult
}

/**
 * POST /compare — mutation detection between reference and sample
 */
export async function compareDNA(
  referenceDna: string,
  sampleDna: string
): Promise<CompareResult> {
  const resp = await fetch('/compare', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ reference_dna: referenceDna, sample_dna: sampleDna }),
  })

  const data = await resp.json()

  if (!resp.ok) {
    throw new Error(parseError(data))
  }

  return data as CompareResult
}

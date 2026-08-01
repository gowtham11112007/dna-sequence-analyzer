/**
 * ResultsDisplay — renders the full analysis results:
 *   • Multi-stage animated pipeline loader
 *   • mRNA sequence grouped into codon triplets with hover highlights
 *   • Amino acid chain with full names & staggered entry animations
 *   • Protein match with animated match percentage progress bar & UniProt enrichment
 *   • Interactive mutation report cards with alignment visualization
 */

import React, { useEffect, useState } from 'react'
import type { AnalyzeResult, CompareResult, Mutation } from './api'

// ─── Chemical class color legend ───────────────────────────────────────
const LEGEND = [
  { cls: 'nonpolar', label: 'Nonpolar', color: '#818cf8' },
  { cls: 'polar', label: 'Polar', color: '#34d399' },
  { cls: 'acidic', label: 'Acidic', color: '#f87171' },
  { cls: 'basic', label: 'Basic', color: '#60a5fa' },
]

// ─── Multi-stage Loading Overlay Component ─────────────────────────────
function AnimatedPipelineLoader() {
  const [stage, setStage] = useState(1)

  useEffect(() => {
    const t1 = setTimeout(() => setStage(2), 600)
    const t2 = setTimeout(() => setStage(3), 1200)
    const t3 = setTimeout(() => setStage(4), 1800)
    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
      clearTimeout(t3)
    }
  }, [])

  const stages = [
    { num: 1, text: 'Transcribing DNA → mRNA using Biopython' },
    { num: 2, text: 'Translating codons starting at first AUG' },
    { num: 3, text: 'Querying local database & UniProt REST API' },
    { num: 4, text: 'Running pairwise alignment & mutation analysis' },
  ]

  return (
    <div className="glass-card loading-overlay animate-in">
      <div className="spinner-container">
        <div className="spinner-glow" />
        <div className="spinner" />
      </div>

      <h3 className="loading-title">Running Biological Pipeline</h3>

      <div className="pipeline-steps">
        {stages.map((s) => (
          <div
            key={s.num}
            className={`pipeline-step ${stage >= s.num ? 'active' : ''} ${
              stage > s.num ? 'completed' : ''
            }`}
          >
            <span className="step-icon">
              {stage > s.num ? '✓' : stage === s.num ? '⚡' : '○'}
            </span>
            <span className="step-text">{s.text}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── mRNA Section ──────────────────────────────────────────────────────
function MRNASection({ mrna, codons }: { mrna: string; codons: string[] }) {
  return (
    <div className="glass-card animate-in glow-hover-card">
      <div className="card-title">
        <span className="icon-pulse">📝</span>
        mRNA Transcript (Grouped by Codons)
      </div>

      <div className="mrna-display">
        {codons.map((codon, i) => (
          <span
            key={i}
            className="codon codon-animated"
            style={{ animationDelay: `${i * 30}ms` }}
            title={`Codon ${i + 1}: ${codon}`}
          >
            <span className="codon-num">{i + 1}</span>
            <span className="codon-text">{codon}</span>
          </span>
        ))}
      </div>

      <div className="base-counter" style={{ marginTop: 12 }}>
        <span>
          <span className="count">{mrna.length}</span> mRNA nucleotides
        </span>
        <span>
          <span className="count">{codons.length}</span> codon triplets translated
        </span>
      </div>
    </div>
  )
}

// ─── Amino Acid Chain ──────────────────────────────────────────────────
function AminoAcidSection({
  aminoAcids,
}: {
  aminoAcids: AnalyzeResult['amino_acids']
}) {
  return (
    <div className="glass-card animate-in glow-hover-card">
      <div className="card-title">
        <span className="icon-pulse">🔗</span>
        Translated Amino Acid Chain
      </div>

      {/* Color legend */}
      <div className="aa-legend">
        {LEGEND.map((l) => (
          <div key={l.cls} className="aa-legend-item">
            <div
              className="aa-legend-swatch"
              style={{ background: l.color }}
            />
            {l.label}
          </div>
        ))}
      </div>

      {/* Amino acid badges with staggered animation */}
      <div className="amino-acid-chain">
        {aminoAcids.map((aa, idx) => (
          <div
            key={aa.position}
            className={`amino-acid-badge aa-${aa.chemical_class} aa-badge-anim`}
            style={{ animationDelay: `${idx * 40}ms` }}
            title={`${aa.name} (${aa.three_letter}) — Position ${aa.position}`}
          >
            <span className="aa-pos">#{aa.position}</span>
            <span className="aa-letter">{aa.letter}</span>
            <span className="aa-name">{aa.name}</span>
          </div>
        ))}
      </div>

      <div className="base-counter" style={{ marginTop: 12 }}>
        <span>
          <span className="count">{aminoAcids.length}</span> amino acids in chain
        </span>
      </div>
    </div>
  )
}

// ─── Protein Match Section ─────────────────────────────────────────────
function ProteinMatchSection({
  match,
  enrichment,
}: {
  match: AnalyzeResult['protein_match']
  enrichment: AnalyzeResult['uniprot_enrichment']
}) {
  const percentage = Math.min(100, Math.max(0, match.match_percentage))

  return (
    <div className="glass-card protein-match-card animate-in glow-hover-card">
      <div className="card-title">
        <span className="icon-pulse">🎯</span>
        Identified Protein Match
      </div>

      <div className="match-header">
        <span className="match-name">{match.name}</span>
        <span
          className={`match-badge ${match.is_exact_match ? 'exact' : 'partial'}`}
        >
          {match.is_exact_match ? '★ 100% Exact Match' : `${match.match_percentage}% Match`}
        </span>
      </div>

      {/* Animated Match Progress Bar */}
      <div className="match-progress-container">
        <div className="match-progress-bar-bg">
          <div
            className={`match-progress-bar-fill ${match.is_exact_match ? 'exact' : ''}`}
            style={{ width: `${percentage}%` }}
          />
        </div>
        <div className="match-progress-label">
          Match Similarity Score: <strong>{match.match_percentage}%</strong>
        </div>
      </div>

      <div className="protein-details">
        {match.uniprot_accession && (
          <div className="protein-detail-row">
            <span className="detail-label">UniProt ID</span>
            <span className="detail-value">
              <a
                href={`https://www.uniprot.org/uniprot/${match.uniprot_accession}`}
                target="_blank"
                rel="noopener noreferrer"
                className="uniprot-link"
              >
                {match.uniprot_accession} ↗
              </a>
            </span>
          </div>
        )}

        <div className="protein-detail-row">
          <span className="detail-label">Function</span>
          <span className="detail-value">{match.description}</span>
        </div>

        <div className="protein-detail-row">
          <span className="detail-label">Sequence Info</span>
          <span className="detail-value">
            Translated length: {match.query_length} aa | Reference length: {match.reference_length} aa
          </span>
        </div>

        {/* UniProt enrichment data */}
        {enrichment && (
          <div className="uniprot-enriched-box animate-in">
            <div className="uniprot-badge">🌐 Live UniProt Enrichment</div>
            <div className="protein-detail-row">
              <span className="detail-label">Official Name</span>
              <span className="detail-value">{enrichment.protein_name}</span>
            </div>
            <div className="protein-detail-row">
              <span className="detail-label">Organism</span>
              <span className="detail-value">🧫 {enrichment.organism}</span>
            </div>
            <div className="protein-detail-row">
              <span className="detail-label">Full Function</span>
              <span className="detail-value">{enrichment.function_description}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Mutation Card ─────────────────────────────────────────────────────
function MutationCard({ mutation, index }: { mutation: Mutation; index: number }) {
  const typeLower = mutation.type.toLowerCase()
  return (
    <div
      className={`glass-card mutation-card ${typeLower} animate-in`}
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <div className="mutation-card-header">
        <span className={`mutation-type-badge ${typeLower}`}>
          {mutation.type}
        </span>
        <span className="mutation-position-tag">Position #{mutation.position}</span>
      </div>

      <div className="mutation-change">
        <span className="ref-base" title="Reference Base">
          {mutation.reference_base}
        </span>
        <span className="arrow-pulse">➔</span>
        <span className="sam-base" title="Sample Base">
          {mutation.sample_base}
        </span>

        {mutation.amino_acid_effect && (
          <span className={`effect-pill ${mutation.amino_acid_effect.toLowerCase()}`}>
            {mutation.amino_acid_effect}
          </span>
        )}
      </div>

      <div className="mutation-effect">{mutation.effect}</div>

      {mutation.is_frameshift && (
        <div className="frameshift-warning">
          ⚠️ Frameshift Mutation (Indel not multiple of 3)
        </div>
      )}
    </div>
  )
}

// ─── Mutation Report ───────────────────────────────────────────────────
function MutationReport({ compare }: { compare: CompareResult }) {
  return (
    <div className="animate-in">
      <div className="card-title" style={{ marginBottom: 16 }}>
        <span className="icon-pulse">🔬</span>
        Mutation & Alignment Analysis
        <span className="mutation-count-pill">
          {compare.mutation_count} mutation(s) found
        </span>
      </div>

      {compare.mutation_count === 0 ? (
        <div className="glass-card no-mutations glow-success animate-in">
          <span className="check-icon-bounce">✅</span>
          <h3>100% Sequence Alignment Match</h3>
          <p>No mutations detected — sample DNA perfectly matches the reference strand.</p>
        </div>
      ) : (
        <div className="mutation-cards-list">
          {compare.mutations.map((mut, i) => (
            <MutationCard key={i} mutation={mut} index={i} />
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Main ResultsDisplay ───────────────────────────────────────────────

interface ResultsDisplayProps {
  analyzeResult: AnalyzeResult | null
  compareResult: CompareResult | null
  loading: boolean
  error: string | null
}

export default function ResultsDisplay({
  analyzeResult,
  compareResult,
  loading,
  error,
}: ResultsDisplayProps) {
  if (loading) {
    return (
      <div className="results-panel">
        <AnimatedPipelineLoader />
      </div>
    )
  }

  if (error) {
    return (
      <div className="results-panel">
        <div className="glass-card error-card animate-in">
          <div className="error-title">⚠️ Pipeline Error</div>
          <div className="error-message">{error}</div>
        </div>
      </div>
    )
  }

  if (!analyzeResult) {
    return (
      <div className="results-panel">
        <div className="glass-card results-placeholder glow-hover-card">
          <span className="placeholder-icon floating-icon">🧪</span>
          <h3>Ready for Analysis</h3>
          <p>
            Build your DNA sequence using the <strong>A, T, G, C</strong> buttons
            on the left, then click <strong>Analyze Sequence</strong> to trigger the full prediction pipeline.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="results-panel">
      <MRNASection mrna={analyzeResult.mrna_sequence} codons={analyzeResult.codons} />
      <AminoAcidSection aminoAcids={analyzeResult.amino_acids} />
      <ProteinMatchSection
        match={analyzeResult.protein_match}
        enrichment={analyzeResult.uniprot_enrichment}
      />
      {compareResult && <MutationReport compare={compareResult} />}
    </div>
  )
}

/**
 * ResultsDisplay — modular results dashboard.
 * Features:
 *   • Multi-stage animated pipeline loader
 *   • Clean Executive Summary Card (Default view)
 *   • Toggleable Detail Panels (mRNA Transcript, Amino Acid Chain, UniProt Info)
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
    { num: 1, text: 'Transcribing DNA → mRNA' },
    { num: 2, text: 'Translating codons to peptide chain' },
    { num: 3, text: 'Querying protein reference database' },
    { num: 4, text: 'Executing mutation analysis' },
  ]

  return (
    <div className="glass-card loading-overlay animate-in">
      <div className="spinner-container">
        <div className="spinner-glow" />
        <div className="spinner" />
      </div>

      <h3 className="loading-title">Running Prediction Pipeline</h3>

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
    <div className="results-detail-panel animate-in">
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
function AminoAcidSection({ aminoAcids }: { aminoAcids: AnalyzeResult['amino_acids'] }) {
  return (
    <div className="results-detail-panel animate-in">
      <div className="aa-legend">
        {LEGEND.map((l) => (
          <div key={l.cls} className="aa-legend-item">
            <div className="aa-legend-swatch" style={{ background: l.color }} />
            {l.label}
          </div>
        ))}
      </div>

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

// ─── UniProt Context ───────────────────────────────────────────────────
function UniProtSection({ enrichment }: { enrichment: AnalyzeResult['uniprot_enrichment'] }) {
  if (!enrichment) return null
  return (
    <div className="results-detail-panel animate-in">
      <div className="uniprot-enriched-box">
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
  const [activePanel, setActivePanel] = useState<'mrna' | 'aa' | 'uniprot' | null>(null)

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
            Build your DNA sequence or load a preset, then click <strong>Analyze Sequence</strong> to trigger the pipeline.
          </p>
        </div>
      </div>
    )
  }

  const { match_percentage, is_exact_match, name, description, uniprot_accession } = analyzeResult.protein_match
  const percentage = Math.min(100, Math.max(0, match_percentage))

  return (
    <div className="results-panel">
      {/* Executive Summary Card */}
      <div className="glass-card results-summary-card animate-in glow-hover-card">
        <div className="card-title">
          <span className="icon-pulse">🎯</span>
          Protein Prediction Summary
        </div>

        <div className="match-header">
          <span className="match-name">{name}</span>
          <span className={`match-badge ${is_exact_match ? 'exact' : 'partial'}`}>
            {is_exact_match ? '★ 100% Exact Match' : `${match_percentage}% Match`}
          </span>
        </div>

        <div className="match-progress-container">
          <div className="match-progress-bar-bg">
            <div
              className={`match-progress-bar-fill ${is_exact_match ? 'exact' : ''}`}
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>

        <p className="summary-desc">{description}</p>
        
        {uniprot_accession && (
          <div className="summary-uniprot">
            UniProt ID:{' '}
            <a
              href={`https://www.uniprot.org/uniprot/${uniprot_accession}`}
              target="_blank"
              rel="noopener noreferrer"
              className="uniprot-link"
            >
              {uniprot_accession} ↗
            </a>
          </div>
        )}

        {/* Clean Interactive Action Buttons Bar for details */}
        <div className="results-action-pills" style={{ marginTop: 16 }}>
          <button
            type="button"
            className={`action-pill-btn ${activePanel === 'mrna' ? 'active' : ''}`}
            onClick={() => setActivePanel(activePanel === 'mrna' ? null : 'mrna')}
          >
            📝 {activePanel === 'mrna' ? 'Hide mRNA' : 'View mRNA Transcript'}
          </button>
          <button
            type="button"
            className={`action-pill-btn ${activePanel === 'aa' ? 'active' : ''}`}
            onClick={() => setActivePanel(activePanel === 'aa' ? null : 'aa')}
          >
            🔬 {activePanel === 'aa' ? 'Hide Amino Acids' : 'View Amino Acid Chain'}
          </button>
          {analyzeResult.uniprot_enrichment && (
            <button
              type="button"
              className={`action-pill-btn ${activePanel === 'uniprot' ? 'active' : ''}`}
              onClick={() => setActivePanel(activePanel === 'uniprot' ? null : 'uniprot')}
            >
              🌐 {activePanel === 'uniprot' ? 'Hide UniProt Info' : 'View UniProt Details'}
            </button>
          )}
        </div>
      </div>

      {/* Render selected detailed panel */}
      {activePanel === 'mrna' && (
        <div className="glass-card detailed-panel-container animate-in">
          <MRNASection mrna={analyzeResult.mrna_sequence} codons={analyzeResult.codons} />
        </div>
      )}
      {activePanel === 'aa' && (
        <div className="glass-card detailed-panel-container animate-in">
          <AminoAcidSection aminoAcids={analyzeResult.amino_acids} />
        </div>
      )}
      {activePanel === 'uniprot' && analyzeResult.uniprot_enrichment && (
        <div className="glass-card detailed-panel-container animate-in">
          <UniProtSection enrichment={analyzeResult.uniprot_enrichment} />
        </div>
      )}
    </div>
  )
}

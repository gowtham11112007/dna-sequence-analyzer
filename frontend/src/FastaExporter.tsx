/**
 * FastaExporter Component
 * Dedicated spacious view for FASTA sequence formatting, 1-click clipboard copy,
 * and JSON analysis report download.
 */

import React, { useState } from 'react'
import type { AnalyzeResult } from './api'

interface FastaExporterProps {
  sampleSeq: string
  analyzeResult: AnalyzeResult | null
}

export default function FastaExporter({
  sampleSeq,
  analyzeResult,
}: FastaExporterProps) {
  const [copied, setCopied] = useState(false)

  if (!sampleSeq) {
    return (
      <div className="glass-card export-card animate-in glow-hover-card">
        <div className="card-title">
          <span className="icon-pulse">💾</span>
          Export Sequence & Report
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          No sequence built yet. Please build a DNA sequence on the <strong>Builder</strong> screen first.
        </p>
      </div>
    )
  }

  // Generate FASTA formatted text
  const fullFasta = `>Sample_DNA_Sequence length=${sampleSeq.length}bp\n${sampleSeq.match(/.{1,60}/g)?.join('\n') || sampleSeq}`

  const handleCopyFasta = () => {
    navigator.clipboard.writeText(fullFasta)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownloadJson = () => {
    const reportData = {
      timestamp: new Date().toISOString(),
      sample_dna: sampleSeq,
      analysis: analyzeResult,
    }

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `dna_analysis_report_${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="glass-card export-card animate-in glow-hover-card">
      <div className="card-title">
        <span className="icon-pulse">💾</span>
        Export Sequence Data & Reports
      </div>

      <p className="export-intro-text">
        Download your analyzed sequence in standard bioinformatics formats (FASTA & JSON) for publication, sharing, or offline storage.
      </p>

      {/* FASTA Display Container */}
      <div className="fasta-box-container">
        <div className="fasta-header">
          <span className="fasta-label">FASTA FORMAT (.fasta)</span>
          <button className="btn-copy-fasta" onClick={handleCopyFasta} type="button">
            {copied ? '✓ Copied FASTA!' : '📋 Copy FASTA'}
          </button>
        </div>
        <pre className="fasta-display">{fullFasta}</pre>
      </div>

      {/* Primary Action Buttons */}
      <div className="export-download-section">
        <button
          className="btn-download-json pulse-glow-btn big-mobile-btn"
          onClick={handleDownloadJson}
          type="button"
        >
          📥 Download Full JSON Analysis Report
        </button>

        <button
          className="btn-copy-full-text"
          onClick={handleCopyFasta}
          type="button"
        >
          {copied ? '✓ FASTA Copied to Clipboard!' : '📋 Copy FASTA to Clipboard'}
        </button>
      </div>

      {/* Report Summary Details */}
      {analyzeResult && (
        <div className="export-summary-box animate-in">
          <div className="summary-box-title">📋 Included Analysis Summary</div>
          <div className="summary-item">
            <span>DNA Sequence:</span> <strong>{sampleSeq.length} bases</strong>
          </div>
          <div className="summary-item">
            <span>mRNA Nucleotides:</span> <strong>{analyzeResult.mrna_sequence.length} bases</strong>
          </div>
          <div className="summary-item">
            <span>Amino Acids:</span> <strong>{analyzeResult.amino_acids.length} residues</strong>
          </div>
          <div className="summary-item">
            <span>Matched Protein:</span> <strong>{analyzeResult.protein_match.name}</strong>
          </div>
          {analyzeResult.uniprot_enrichment && (
            <div className="summary-item">
              <span>UniProt Accession:</span> <strong>{analyzeResult.protein_match.uniprot_accession}</strong>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

/**
 * FastaExporter Component
 * Provides FASTA sequence formatting, 1-click clipboard copy,
 * and JSON report download functionality.
 */

import React, { useState } from 'react'
import type { AnalyzeResult } from './api'

interface FastaExporterProps {
  sampleSeq: string
  analyzeResult: AnalyzeResult | null
  compareResult?: null
}

export default function FastaExporter({
  sampleSeq,
  analyzeResult,
}: FastaExporterProps) {
  const [copied, setCopied] = useState(false)

  if (!sampleSeq) return null

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
    a.download = `dna_analysis_${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="glass-card export-card animate-in glow-hover-card" style={{ marginTop: 20 }}>
      <div className="card-title">
        <span className="icon-pulse">💾</span>
        Export Sequence & Report (FASTA & JSON)
      </div>

      <div className="fasta-box-container">
        <div className="fasta-header">
          <span className="fasta-label">FASTA FORMAT</span>
          <button className="btn-copy-fasta" onClick={handleCopyFasta} type="button">
            {copied ? '✓ Copied FASTA!' : '📋 Copy FASTA'}
          </button>
        </div>
        <pre className="fasta-display">{fullFasta}</pre>
      </div>

      <div className="export-actions-row">
        <button
          className="btn-download-json pulse-glow-btn"
          onClick={handleDownloadJson}
          type="button"
        >
          📥 Download Full JSON Analysis Report
        </button>
      </div>
    </div>
  )
}

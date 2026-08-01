/**
 * App — root component for the DNA Sequence Analyzer.
 * Features 3D DNA Canvas title background, state management,
 * biophysical analytics, interactive codon matrix, FASTA exporter, and responsive layout.
 */

import React, { useState, useCallback } from 'react'
import SequenceBuilder from './SequenceBuilder'
import ResultsDisplay from './ResultsDisplay'
import DnaHelixCanvas from './DnaHelixCanvas'
import SequenceAnalytics from './SequenceAnalytics'
import CodonWheel from './CodonWheel'
import FastaExporter from './FastaExporter'
import { analyzeDNA } from './api'
import type { AnalyzeResult } from './api'

export default function App() {
  // --- State ---
  const [sampleSeq, setSampleSeq] = useState('')
  const [activeTab, setActiveTab] = useState<'analyzer' | 'matrix'>('analyzer')

  const [analyzeResult, setAnalyzeResult] = useState<AnalyzeResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // --- Validation ---
  const isValid = sampleSeq.length >= 3

  // --- Submit handler ---
  const handleSubmit = useCallback(async () => {
    if (!isValid) return

    setLoading(true)
    setError(null)
    setAnalyzeResult(null)

    try {
      // Run analysis on the sample sequence
      const analysis = await analyzeDNA(sampleSeq)
      setAnalyzeResult(analysis)
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred during biological pipeline execution.')
    } finally {
      setLoading(false)
    }
  }, [sampleSeq, isValid])

  return (
    <div className="app">
      {/* Header with integrated 3D DNA Canvas Title Background */}
      <header className="app-header-container">
        <DnaHelixCanvas />
        <div className="header-title-overlay">
          <div className="title-badge">🧬 BIOLOGICAL SEQUENCE PREDICTION</div>
          <h1>DNA Sequence Analyzer</h1>
          <p className="subtitle">
            Interactive Base Builder · Real-Time mRNA Transcription · Protein Identification · Biophysics Analytics
          </p>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="app-nav-tabs">
        <button
          className={`nav-tab-btn ${activeTab === 'analyzer' ? 'active' : ''}`}
          onClick={() => setActiveTab('analyzer')}
          type="button"
        >
          🔬 Sequence Analyzer & Prediction Pipeline
        </button>
        <button
          className={`nav-tab-btn ${activeTab === 'matrix' ? 'active' : ''}`}
          onClick={() => setActiveTab('matrix')}
          type="button"
        >
          📖 Genetic Codon Matrix (64 Codons)
        </button>
      </div>

      {activeTab === 'analyzer' ? (
        /* Main two-panel layout */
        <div className="main-layout">
          {/* LEFT: Sequence Builder & Analytics Panel */}
          <div className="builder-panel">
            {/* Sample sequence builder */}
            <div className="glass-card glow-hover-card" style={{ marginBottom: 16 }}>
              <SequenceBuilder
                sequence={sampleSeq}
                onSequenceChange={setSampleSeq}
                label="DNA Sequence Builder"
              />
            </div>

            {/* Live Biophysical Analytics (GC Content, Tm, Molecular Weight) */}
            <SequenceAnalytics sequence={sampleSeq} />

            {/* Submit button */}
            <button
              className="btn-submit pulse-glow-btn"
              onClick={handleSubmit}
              disabled={!isValid || loading}
              type="button"
            >
              <span className="btn-content">
                {loading ? (
                  <>⚡ Executing Prediction Pipeline...</>
                ) : (
                  <>🧪 Analyze DNA Sequence</>
                )}
              </span>
            </button>

            {/* FASTA & JSON Exporter */}
            <FastaExporter
              sampleSeq={sampleSeq}
              analyzeResult={analyzeResult}
              compareResult={null}
            />
          </div>

          {/* RIGHT: Results Panel */}
          <ResultsDisplay
            analyzeResult={analyzeResult}
            compareResult={null}
            loading={loading}
            error={error}
          />
        </div>
      ) : (
        /* Genetic Codon Matrix Tab */
        <CodonWheel activeSequence={sampleSeq} />
      )}
    </div>
  )
}

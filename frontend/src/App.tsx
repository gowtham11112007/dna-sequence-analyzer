/**
 * App — root component for the DNA Sequence Analyzer.
 * Features a mobile-first multi-screen architecture:
 *   • Screen 1: Sequence Builder & Biophysics Analytics
 *   • Screen 2: Dedicated Prediction Results View
 *   • Screen 3: Dedicated Export & Download Page (FASTA / JSON)
 *   • Screen 4: 64-Codon Genetic Reference Matrix
 *   • Mobile Bottom Navigation Bar & Top Screen Headers
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

export type ScreenType = 'builder' | 'results' | 'export' | 'codons'

export default function App() {
  // --- State ---
  const [sampleSeq, setSampleSeq] = useState('')
  const [currentScreen, setCurrentScreen] = useState<ScreenType>('builder')

  const [analyzeResult, setAnalyzeResult] = useState<AnalyzeResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // --- Validation ---
  const isValid = sampleSeq.length >= 3

  // --- Submit handler (triggers analysis and navigates to Results screen) ---
  const handleSubmit = useCallback(async () => {
    if (!isValid) return

    setLoading(true)
    setError(null)
    setAnalyzeResult(null)
    // Switch to Results screen immediately to display the multi-stage pipeline loader
    setCurrentScreen('results')

    try {
      const analysis = await analyzeDNA(sampleSeq)
      setAnalyzeResult(analysis)
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred during biological pipeline execution.')
    } finally {
      setLoading(false)
    }
  }, [sampleSeq, isValid])

  return (
    <div className="app phone-optimized-app">
      {/* Header with integrated 3D DNA Canvas Title Background */}
      <header className="app-header-container">
        <DnaHelixCanvas />
        <div className="header-title-overlay">
          <div className="title-badge">🧬 BIOLOGICAL SEQUENCE PREDICTION</div>
          <h1>DNA Sequence Analyzer</h1>
          <p className="subtitle">
            Interactive Base Builder · mRNA Transcription · Protein Match · Biophysics Analytics
          </p>
        </div>
      </header>

      {/* Screen Navigation Bar (Top Desktop / Mobile Switcher) */}
      <div className="screen-nav-bar">
        <button
          className={`screen-nav-btn ${currentScreen === 'builder' ? 'active' : ''}`}
          onClick={() => setCurrentScreen('builder')}
          type="button"
        >
          🧬 Builder
        </button>
        <button
          className={`screen-nav-btn ${currentScreen === 'results' ? 'active' : ''} ${
            analyzeResult ? 'has-results' : ''
          }`}
          onClick={() => setCurrentScreen('results')}
          type="button"
        >
          📊 Results
          {analyzeResult && <span className="nav-pulse-dot" />}
        </button>
        <button
          className={`screen-nav-btn ${currentScreen === 'export' ? 'active' : ''}`}
          onClick={() => setCurrentScreen('export')}
          disabled={sampleSeq.length === 0}
          type="button"
        >
          💾 Export / Download
        </button>
        <button
          className={`screen-nav-btn ${currentScreen === 'codons' ? 'active' : ''}`}
          onClick={() => setCurrentScreen('codons')}
          type="button"
        >
          📖 Codon Matrix
        </button>
      </div>

      {/* =========================================================
          SCREEN 1: SEQUENCE BUILDER & BIOPHYSICS ANALYTICS
         ========================================================= */}
      {currentScreen === 'builder' && (
        <div className="screen-view builder-screen animate-in">
          {/* Sequence builder card */}
          <div className="glass-card glow-hover-card" style={{ marginBottom: 16 }}>
            <SequenceBuilder
              sequence={sampleSeq}
              onSequenceChange={setSampleSeq}
              label="DNA Sequence Builder"
            />
          </div>

          {/* Live Biophysical Analytics (GC Content, Tm, Molecular Weight) */}
          <SequenceAnalytics sequence={sampleSeq} />

          {/* Submit button -> Navigates to Results View */}
          <button
            className="btn-submit pulse-glow-btn big-mobile-btn"
            onClick={handleSubmit}
            disabled={!isValid || loading}
            type="button"
            style={{ marginTop: 20 }}
          >
            <span className="btn-content">
              {loading ? (
                <>⚡ Executing Prediction Pipeline...</>
              ) : (
                <>🧪 Analyze Sequence & Predict Protein →</>
              )}
            </span>
          </button>

          {/* Shortcut to Codon Reference */}
          <div className="builder-footer-tip" onClick={() => setCurrentScreen('codons')}>
            📖 Need to check amino acid codons? Open 64-Codon Reference Matrix ➔
          </div>
        </div>
      )}

      {/* =========================================================
          SCREEN 2: DEDICATED PREDICTION RESULTS VIEW
         ========================================================= */}
      {currentScreen === 'results' && (
        <div className="screen-view results-screen animate-in">
          {/* Navigation Sub-header */}
          <div className="view-action-bar">
            <button
              className="btn-back-nav"
              onClick={() => setCurrentScreen('builder')}
              type="button"
            >
              ← Edit DNA Sequence
            </button>
            {analyzeResult && (
              <button
                className="btn-forward-nav"
                onClick={() => setCurrentScreen('export')}
                type="button"
              >
                📥 Download Results File →
              </button>
            )}
          </div>

          {/* Results display panel */}
          <ResultsDisplay
            analyzeResult={analyzeResult}
            compareResult={null}
            loading={loading}
            error={error}
          />

          {/* Bottom Action Footer on Results Screen */}
          {analyzeResult && (
            <div className="results-footer-action animate-in">
              <button
                className="btn-submit pulse-glow-btn"
                onClick={() => setCurrentScreen('export')}
                type="button"
              >
                💾 Export & Download Report Files (FASTA / JSON) →
              </button>
            </div>
          )}
        </div>
      )}

      {/* =========================================================
          SCREEN 3: DEDICATED EXPORT & DOWNLOAD PAGE
         ========================================================= */}
      {currentScreen === 'export' && (
        <div className="screen-view export-screen animate-in">
          <div className="view-action-bar">
            <button
              className="btn-back-nav"
              onClick={() => setCurrentScreen(analyzeResult ? 'results' : 'builder')}
              type="button"
            >
              ← {analyzeResult ? 'Back to Results' : 'Back to Builder'}
            </button>
          </div>

          <FastaExporter
            sampleSeq={sampleSeq}
            analyzeResult={analyzeResult}
          />
        </div>
      )}

      {/* =========================================================
          SCREEN 4: 64-CODON GENETIC MATRIX REFERENCE
         ========================================================= */}
      {currentScreen === 'codons' && (
        <div className="screen-view codons-screen animate-in">
          <div className="view-action-bar">
            <button
              className="btn-back-nav"
              onClick={() => setCurrentScreen('builder')}
              type="button"
            >
              ← Back to Sequence Builder
            </button>
          </div>

          <CodonWheel activeSequence={sampleSeq} />
        </div>
      )}

      {/* =========================================================
          MOBILE BOTTOM NAVIGATION BAR (FIXED ON PHONE SCREENS)
         ========================================================= */}
      <nav className="mobile-bottom-nav">
        <button
          className={`mobile-nav-item ${currentScreen === 'builder' ? 'active' : ''}`}
          onClick={() => setCurrentScreen('builder')}
          type="button"
        >
          <span className="mobile-nav-icon">🧬</span>
          <span className="mobile-nav-label">Builder</span>
        </button>

        <button
          className={`mobile-nav-item ${currentScreen === 'results' ? 'active' : ''}`}
          onClick={() => setCurrentScreen('results')}
          type="button"
        >
          <span className="mobile-nav-icon">📊</span>
          <span className="mobile-nav-label">Results</span>
          {analyzeResult && <span className="mobile-badge-dot" />}
        </button>

        <button
          className={`mobile-nav-item ${currentScreen === 'export' ? 'active' : ''}`}
          onClick={() => setCurrentScreen('export')}
          disabled={sampleSeq.length === 0}
          type="button"
        >
          <span className="mobile-nav-icon">💾</span>
          <span className="mobile-nav-label">Export</span>
        </button>

        <button
          className={`mobile-nav-item ${currentScreen === 'codons' ? 'active' : ''}`}
          onClick={() => setCurrentScreen('codons')}
          type="button"
        >
          <span className="mobile-nav-icon">📖</span>
          <span className="mobile-nav-label">Codons</span>
        </button>
      </nav>
    </div>
  )
}

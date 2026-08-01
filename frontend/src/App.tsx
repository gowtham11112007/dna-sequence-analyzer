/**
 * App — root component for the DNA Sequence Analyzer.
 * Features a mobile-first multi-screen architecture:
 *   • Screen 1: Sequence Builder & Biophysics Analytics
 *   • Screen 2: Dedicated Prediction Results View
 *   • Screen 3: Dedicated Export & Download Page (FASTA / JSON)
 *   • Screen 4: 64-Codon Genetic Reference Matrix
 *   • Mobile Bottom Navigation Bar & Top Screen Headers
 */

import React, { useState, useCallback, useMemo } from 'react'
import SequenceBuilder from './SequenceBuilder'
import ResultsDisplay from './ResultsDisplay'
import DnaHelixCanvas from './DnaHelixCanvas'
import SequenceAnalytics from './SequenceAnalytics'
import CodonWheel from './CodonWheel'
import FastaExporter from './FastaExporter'
import { analyzeDNA } from './api'
import type { AnalyzeResult } from './api'
import Dock from './Dock'
import type { DockItemData } from './Dock'

export type ScreenType = 'builder' | 'results' | 'codons'

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

  // --- Dock navigation items (memoized for Dock component) ---
  const dockItems: DockItemData[] = useMemo(
    () => [
      {
        icon: <span style={{ fontSize: 22 }}>🧬</span>,
        label: 'Builder',
        onClick: () => setCurrentScreen('builder'),
        className: currentScreen === 'builder' ? 'dock-item-active' : '',
      },
      {
        icon: <span style={{ fontSize: 22 }}>📊</span>,
        label: 'Results',
        onClick: () => setCurrentScreen('results'),
        className: currentScreen === 'results' ? 'dock-item-active' : '',
      },
      {
        icon: <span style={{ fontSize: 22 }}>📖</span>,
        label: 'Codons',
        onClick: () => setCurrentScreen('codons'),
        className: currentScreen === 'codons' ? 'dock-item-active' : '',
      },
    ],
    [currentScreen]
  )

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
          </div>

          {/* Results display panel — full width */}
          <ResultsDisplay
            analyzeResult={analyzeResult}
            compareResult={null}
            loading={loading}
            error={error}
          />

          {/* Export section inlined at the bottom of Results */}
          {analyzeResult && sampleSeq.length > 0 && (
            <div className="results-inline-export animate-in">
              <FastaExporter
                sampleSeq={sampleSeq}
                analyzeResult={analyzeResult}
              />
            </div>
          )}
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
          ANIMATED DOCK NAVIGATION (REPLACES STATIC BOTTOM NAV)
         ========================================================= */}
      <div className="dock-nav-wrapper">
        <Dock
          items={dockItems}
          panelHeight={64}
          baseItemSize={48}
          magnification={68}
          distance={150}
        />
      </div>
    </div>
  )
}

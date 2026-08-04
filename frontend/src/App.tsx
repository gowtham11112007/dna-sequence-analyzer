/**
 * App — root component for the DNA Sequence Analyzer.
 * Features a Core Workflow via Bottom Dock and Extra Features via Top Menu Bar.
 *   • Bottom Dock: Builder, Library, Results
 *   • Top Menu Bar: Pro Tool Suite, Codon Matrix, About
 */

import React, { useState, useCallback, useMemo } from 'react'
import SequenceBuilder from './SequenceBuilder'
import ResultsDisplay from './ResultsDisplay'
import DnaHelixCanvas from './DnaHelixCanvas'
import SequenceAnalytics from './SequenceAnalytics'
import CodonWheel from './CodonWheel'
import FastaExporter from './FastaExporter'
import SequenceLibrary from './SequenceLibrary'
import ProTools from './ProTools'
import { analyzeDNA } from './api'
import type { AnalyzeResult } from './api'
import Dock from './Dock'
import type { DockItemData } from './Dock'

export type ScreenType = 'builder' | 'library' | 'protools' | 'results' | 'codons'

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

  // --- Load Sequence from Library or ProTools ---
  const handleLoadSequence = useCallback((seq: string) => {
    setSampleSeq(seq)
    setCurrentScreen('builder')
  }, [])

  // --- Core Dock navigation items (memoized for Dock component) ---
  const dockItems: DockItemData[] = useMemo(
    () => [
      {
        icon: <span style={{ fontSize: 22 }}>🧬</span>,
        label: 'Builder',
        onClick: () => setCurrentScreen('builder'),
        className: currentScreen === 'builder' ? 'dock-item-active' : '',
      },
      {
        icon: <span style={{ fontSize: 22 }}>📚</span>,
        label: 'Library',
        onClick: () => setCurrentScreen('library'),
        className: currentScreen === 'library' ? 'dock-item-active' : '',
      },
      {
        icon: (
          <div style={{ position: 'relative' }}>
            <span style={{ fontSize: 22 }}>📊</span>
            {analyzeResult && <span className="dock-pulse-dot" style={{ position: 'absolute', top: -4, right: -4, width: 8, height: 8, background: '#34d399', borderRadius: '50%', boxShadow: '0 0 8px #34d399' }} />}
          </div>
        ),
        label: 'Results',
        onClick: () => setCurrentScreen('results'),
        className: currentScreen === 'results' ? 'dock-item-active' : '',
      }
    ],
    [currentScreen, analyzeResult]
  )

  return (
    <div className="app">
      {/* 🚀 EXTRA FEATURES TOP MENU BAR */}
      <div className="top-menu-bar glass-card">
        <div className="menu-brand">
          <span className="brand-icon">🧬</span>
          <span className="brand-name">DNA Analyzer Pro</span>
        </div>
        <div className="menu-links">
          <button 
            className={`menu-btn ${currentScreen === 'protools' ? 'active' : ''}`}
            onClick={() => setCurrentScreen('protools')}
          >
            ⚡ Pro Tools
          </button>
          <button 
            className={`menu-btn ${currentScreen === 'codons' ? 'active' : ''}`}
            onClick={() => setCurrentScreen('codons')}
          >
            📖 Codon Matrix
          </button>
        </div>
      </div>

      {/* Header with integrated 3D DNA Canvas Title Background */}
      <header className="app-header-container" style={{ marginTop: '70px' }}>
        <DnaHelixCanvas />
        <div className="header-title-overlay">
          <div className="title-badge">BIOLOGICAL SEQUENCE PREDICTION</div>
          <h1>{
            currentScreen === 'builder' ? 'Sequence Builder' :
            currentScreen === 'library' ? 'Sample Library' :
            currentScreen === 'results' ? 'Analysis Results' :
            currentScreen === 'protools' ? 'Pro Tool Suite' : 'Codon Matrix'
          }</h1>
        </div>
      </header>

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
        </div>
      )}

      {/* =========================================================
          SCREEN 2: PRO SAMPLE & FUNCTION LIBRARY
         ========================================================= */}
      {currentScreen === 'library' && (
        <div className="screen-view library-screen animate-in">
          <SequenceLibrary onSelectSample={handleLoadSequence} />
        </div>
      )}

      {/* =========================================================
          SCREEN 3: PRO BIOINFORMATIC FUNCTION SUITE (Extra Feature)
         ========================================================= */}
      {currentScreen === 'protools' && (
        <div className="screen-view protools-screen animate-in">
          <ProTools currentSequence={sampleSeq} onLoadSequence={handleLoadSequence} />
        </div>
      )}

      {/* =========================================================
          SCREEN 4: DEDICATED PREDICTION RESULTS VIEW
         ========================================================= */}
      {currentScreen === 'results' && (
        <div className="screen-view results-screen animate-in">
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
          SCREEN 5: 64-CODON GENETIC MATRIX REFERENCE (Extra Feature)
         ========================================================= */}
      {currentScreen === 'codons' && (
        <div className="screen-view codons-screen animate-in">
          <CodonWheel activeSequence={sampleSeq} />
        </div>
      )}

      {/* =========================================================
          CORE NAVIGATION DOCK (Bottom Menu Bar)
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

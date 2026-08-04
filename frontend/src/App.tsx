/**
 * App — root component for the DNA Sequence Analyzer.
 * Features a Professional Dashboard Architecture:
 *   • Global Sidebar Navigation (Desktop) & Hamburger Drawer (Mobile)
 *   • Screen 1: Sequence Builder & Biophysics Analytics
 *   • Screen 2: Pro Biological Sequence & Function Library
 *   • Screen 3: Pro Bioinformatic Function Suite (RevComp, ORF, Cut Sites, Alignment, Primer)
 *   • Screen 4: Dedicated Prediction Results View
 *   • Screen 5: 64-Codon Genetic Reference Matrix
 */

import React, { useState, useCallback, useEffect } from 'react'
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

export type ScreenType = 'builder' | 'library' | 'protools' | 'results' | 'codons'

export default function App() {
  // --- State ---
  const [sampleSeq, setSampleSeq] = useState('')
  const [currentScreen, setCurrentScreen] = useState<ScreenType>('builder')
  const [sidebarOpen, setSidebarOpen] = useState(false) // For mobile hamburger

  const [analyzeResult, setAnalyzeResult] = useState<AnalyzeResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // --- Validation ---
  const isValid = sampleSeq.length >= 3

  // --- Mobile Sidebar Handling ---
  useEffect(() => {
    // Close sidebar automatically on screen change (useful for mobile)
    setSidebarOpen(false)
  }, [currentScreen])

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

  const navItems = [
    { id: 'builder', icon: '🧬', label: 'Sequence Builder' },
    { id: 'results', icon: '📊', label: 'Analysis Results' },
    { id: 'library', icon: '📚', label: 'Sample Library' },
    { id: 'protools', icon: '⚡', label: 'Pro Tool Suite' },
    { id: 'codons', icon: '📖', label: 'Codon Matrix' },
  ]

  return (
    <div className="app-dashboard">
      {/* Mobile Hamburger Button */}
      <button 
        className="btn-mobile-menu"
        onClick={() => setSidebarOpen(true)}
        aria-label="Open Navigation Menu"
      >
        ☰ Menu
      </button>

      {/* Global Sidebar Navigation */}
      <aside className={`global-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <button 
          className="btn-close-sidebar" 
          onClick={() => setSidebarOpen(false)}
          aria-label="Close Navigation Menu"
        >
          ✕
        </button>

        <div className="sidebar-header">
          <div className="sidebar-logo">🧬</div>
          <h2 className="sidebar-title">DNA Analyzer Pro</h2>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section-title">MAIN WORKFLOW</div>
          {navItems.slice(0, 2).map((item) => (
            <button
              key={item.id}
              className={`sidebar-nav-item ${currentScreen === item.id ? 'active' : ''}`}
              onClick={() => setCurrentScreen(item.id as ScreenType)}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
              {item.id === 'results' && analyzeResult && <span className="nav-badge-pulse" />}
            </button>
          ))}

          <div className="nav-section-title" style={{ marginTop: 24 }}>ADVANCED FEATURES</div>
          {navItems.slice(2).map((item) => (
            <button
              key={item.id}
              className={`sidebar-nav-item ${currentScreen === item.id ? 'active' : ''}`}
              onClick={() => setCurrentScreen(item.id as ScreenType)}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="version-badge">v3.0.0 Portfolio Ed.</div>
        </div>
      </aside>

      {/* Sidebar Backdrop for Mobile */}
      {sidebarOpen && (
        <div className="sidebar-backdrop" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main Content Area */}
      <main className="dashboard-main-content">
        {/* Header with integrated 3D DNA Canvas Title Background */}
        <header className="dashboard-header-container">
          <DnaHelixCanvas />
          <div className="header-title-overlay">
            <div className="title-badge">PREDICTION PIPELINE</div>
            <h1>{navItems.find(n => n.id === currentScreen)?.label || 'DNA Analyzer'}</h1>
          </div>
        </header>

        <div className="dashboard-screen-container">
          {/* =========================================================
              SCREEN 1: SEQUENCE BUILDER & BIOPHYSICS ANALYTICS
            ========================================================= */}
          {currentScreen === 'builder' && (
            <div className="screen-view builder-screen animate-in">
              <div className="glass-card glow-hover-card" style={{ marginBottom: 16 }}>
                <SequenceBuilder
                  sequence={sampleSeq}
                  onSequenceChange={setSampleSeq}
                  label="DNA Sequence Builder"
                />
              </div>

              <SequenceAnalytics sequence={sampleSeq} />

              <button
                className="btn-submit pulse-glow-btn big-mobile-btn"
                onClick={handleSubmit}
                disabled={!isValid || loading}
                type="button"
                style={{ marginTop: 24 }}
              >
                <span className="btn-content">
                  {loading ? (
                    <>⚡ Executing Prediction Pipeline...</>
                  ) : (
                    <>🧪 Analyze Sequence & Predict Protein →</>
                  )}
                </span>
              </button>

              <div className="builder-footer-tip" onClick={() => setCurrentScreen('library')}>
                📚 Explore real-world DNA, RNA, and Protein presets in the Sample Library ➔
              </div>
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
              SCREEN 3: PRO BIOINFORMATIC FUNCTION SUITE
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
              <div className="view-action-bar">
                <button
                  className="btn-back-nav"
                  onClick={() => setCurrentScreen('builder')}
                  type="button"
                >
                  ← Edit DNA Sequence
                </button>
              </div>

              <ResultsDisplay
                analyzeResult={analyzeResult}
                compareResult={null}
                loading={loading}
                error={error}
              />

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
              SCREEN 5: 64-CODON GENETIC MATRIX REFERENCE
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
        </div>
      </main>
    </div>
  )
}

import React from 'react'

export default function Diagrams() {
  return (
    <div className="diagrams-screen animate-in" style={{ padding: 24 }}>
      <div className="glass-card tools-header-card glow-hover-card">
        <div className="tools-title-row">
          <div className="title-with-icon">
            <span className="tools-header-icon">🖼️</span>
            <div>
              <h2>Biological Pathway Diagrams</h2>
              <p className="tools-subtitle">
                Visual representations of the central dogma and genetic processes.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 24 }}>
        {/* Central Dogma Diagram */}
        <div className="glass-card" style={{ padding: 24 }}>
          <h3 style={{ marginBottom: 16 }}>The Central Dogma of Molecular Biology</h3>
          
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 24, background: 'rgba(0,0,0,0.2)', borderRadius: 12 }}>
            <div style={{ textAlign: 'center', flex: 1 }}>
              <div style={{ fontSize: '3rem', filter: 'drop-shadow(0 0 10px #38bdf8)' }}>🧬</div>
              <div style={{ fontWeight: 'bold', marginTop: 8 }}>DNA</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Replication</div>
            </div>
            
            <div style={{ color: '#38bdf8', fontWeight: 'bold' }}>
              <div>Transcription ➔</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>(RNA Polymerase)</div>
            </div>
            
            <div style={{ textAlign: 'center', flex: 1 }}>
              <div style={{ fontSize: '3rem', filter: 'drop-shadow(0 0 10px #f472b6)' }}>🐍</div>
              <div style={{ fontWeight: 'bold', marginTop: 8 }}>mRNA</div>
            </div>

            <div style={{ color: '#f472b6', fontWeight: 'bold' }}>
              <div>Translation ➔</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>(Ribosome)</div>
            </div>

            <div style={{ textAlign: 'center', flex: 1 }}>
              <div style={{ fontSize: '3rem', filter: 'drop-shadow(0 0 10px #34d399)' }}>🥩</div>
              <div style={{ fontWeight: 'bold', marginTop: 8 }}>Protein</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Folding</div>
            </div>
          </div>
        </div>

        {/* Translation Mechanism */}
        <div className="glass-card" style={{ padding: 24 }}>
          <h3 style={{ marginBottom: 16 }}>Translation Mechanism</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, background: 'rgba(0,0,0,0.2)', padding: 24, borderRadius: 12 }}>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <div style={{ width: 100, fontWeight: 'bold', color: '#f472b6' }}>mRNA</div>
              <div style={{ display: 'flex', gap: 4 }}>
                <span style={{ padding: '4px 8px', background: '#333', borderRadius: 4, fontFamily: 'monospace' }}>AUG</span>
                <span style={{ padding: '4px 8px', background: '#333', borderRadius: 4, fontFamily: 'monospace' }}>GCC</span>
                <span style={{ padding: '4px 8px', background: '#333', borderRadius: 4, fontFamily: 'monospace' }}>UAG</span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <div style={{ width: 100, fontWeight: 'bold', color: '#38bdf8' }}>tRNA Anticodon</div>
              <div style={{ display: 'flex', gap: 4 }}>
                <span style={{ padding: '4px 8px', border: '1px solid #38bdf8', color: '#38bdf8', borderRadius: 4, fontFamily: 'monospace' }}>UAC</span>
                <span style={{ padding: '4px 8px', border: '1px solid #38bdf8', color: '#38bdf8', borderRadius: 4, fontFamily: 'monospace' }}>CGG</span>
                <span style={{ padding: '4px 8px', border: '1px solid #f87171', color: '#f87171', borderRadius: 4, fontFamily: 'monospace' }}>AUC (Release)</span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <div style={{ width: 100, fontWeight: 'bold', color: '#34d399' }}>Amino Acid</div>
              <div style={{ display: 'flex', gap: 4 }}>
                <span style={{ padding: '4px 8px', background: '#10b981', color: '#fff', borderRadius: 4, fontWeight: 'bold' }}>Met</span>
                <span style={{ margin: '0 4px', color: '#666' }}>-</span>
                <span style={{ padding: '4px 8px', background: '#10b981', color: '#fff', borderRadius: 4, fontWeight: 'bold' }}>Ala</span>
                <span style={{ margin: '0 4px', color: '#666' }}>-</span>
                <span style={{ padding: '4px 8px', background: '#ef4444', color: '#fff', borderRadius: 4, fontWeight: 'bold' }}>[STOP]</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}

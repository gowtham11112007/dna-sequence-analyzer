/**
 * DnaHelixCanvas Component
 * Renders an immersive, 3D rotating DNA double helix background animation
 * with depth-based lighting, glowing base pairs, and ambient floating particles.
 * Designed to sit directly behind the title header.
 */

import React, { useEffect, useRef } from 'react'

interface FloatingParticle {
  x: number
  y: number
  z: number
  base: 'A' | 'T' | 'G' | 'C'
  size: number
  vx: number
  vy: number
  alpha: number
}

const BASE_COLORS = {
  A: '#22d3ee', // Cyan
  T: '#f472b6', // Pink
  G: '#4ade80', // Green
  C: '#fbbf24', // Amber
}

export default function DnaHelixCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationFrameId: number
    let width = (canvas.width = canvas.parentElement?.clientWidth || 900)
    let height = (canvas.height = canvas.parentElement?.clientHeight || 200)

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return
      width = canvas.width = canvas.parentElement.clientWidth
      height = canvas.height = canvas.parentElement.clientHeight || 200
    }

    window.addEventListener('resize', handleResize)

    // Create floating ambient nucleotide particles
    const particles: FloatingParticle[] = Array.from({ length: 30 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      z: Math.random() * 2 - 1,
      base: (['A', 'T', 'G', 'C'] as const)[Math.floor(Math.random() * 4)],
      size: Math.random() * 12 + 10,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.4,
      alpha: Math.random() * 0.35 + 0.15,
    }))

    let rotation = 0
    const numPairs = 28
    const helixRadius = 45
    const baseTypes: ('A' | 'T' | 'G' | 'C')[] = ['A', 'T', 'G', 'C']

    const render = () => {
      ctx.clearRect(0, 0, width, height)
      rotation += 0.02

      // 1. Draw floating background letters (A, T, G, C)
      particles.forEach((p) => {
        p.x += p.vx
        p.y += p.vy

        if (p.x < 0) p.x = width
        if (p.x > width) p.x = 0
        if (p.y < 0) p.y = height
        if (p.y > height) p.y = 0

        ctx.font = `700 ${p.size}px 'JetBrains Mono', monospace`
        ctx.fillStyle = BASE_COLORS[p.base]
        ctx.globalAlpha = p.alpha
        ctx.fillText(p.base, p.x, p.y)
      })

      ctx.globalAlpha = 1.0

      // 2. Compute 3D DNA Helix positions
      const strandLength = width * 0.9
      const startX = (width - strandLength) / 2
      const centerY = height / 2

      interface Node3D {
        x: number
        y: number
        z: number
        color: string
        base: string
      }

      const strandA: Node3D[] = []
      const strandB: Node3D[] = []

      for (let i = 0; i < numPairs; i++) {
        const progress = i / numPairs
        const x = startX + progress * strandLength
        const angle = rotation + i * 0.4

        const yA = centerY + Math.sin(angle) * helixRadius
        const zA = Math.cos(angle)

        const yB = centerY + Math.sin(angle + Math.PI) * helixRadius
        const zB = Math.cos(angle + Math.PI)

        const baseA = baseTypes[i % 4]
        const baseB = baseA === 'A' ? 'T' : baseA === 'T' ? 'A' : baseA === 'G' ? 'C' : 'G'

        strandA.push({ x, y: yA, z: zA, color: BASE_COLORS[baseA], base: baseA })
        strandB.push({ x, y: yB, z: zB, color: BASE_COLORS[baseB], base: baseB })
      }

      // Combine pairs and sort by Z-depth for 3D perspective layering
      const pairs = []
      for (let i = 0; i < numPairs; i++) {
        pairs.push({
          nA: strandA[i],
          nB: strandB[i],
          avgZ: (strandA[i].z + strandB[i].z) / 2,
        })
      }
      pairs.sort((a, b) => a.avgZ - b.avgZ)

      // 3. Draw Hydrogen bonds & 3D Spheres
      pairs.forEach(({ nA, nB, avgZ }) => {
        const alpha = Math.max(0.1, (avgZ + 1.2) / 2.4)
        ctx.globalAlpha = alpha

        // Hydrogen bonding line between base pairs
        const grad = ctx.createLinearGradient(nA.x, nA.y, nB.x, nB.y)
        grad.addColorStop(0, nA.color)
        grad.addColorStop(1, nB.color)

        ctx.strokeStyle = grad
        ctx.lineWidth = Math.max(1, (avgZ + 1.2) * 2)
        ctx.beginPath()
        ctx.setLineDash([4, 4])
        ctx.moveTo(nA.x, nA.y)
        ctx.lineTo(nB.x, nB.y)
        ctx.stroke()
        ctx.setLineDash([])

        // Draw Spheres for Strand A and Strand B
        ;[nA, nB].forEach((node) => {
          const scale = Math.max(0.4, (node.z + 1.4) / 2.4)
          const radius = 6 * scale
          const nodeAlpha = Math.max(0.2, (node.z + 1.2) / 2.2)

          // Outer Glow
          ctx.beginPath()
          ctx.arc(node.x, node.y, radius * 2.5, 0, Math.PI * 2)
          ctx.fillStyle = node.color
          ctx.globalAlpha = nodeAlpha * 0.35
          ctx.fill()

          // Core Sphere
          ctx.beginPath()
          ctx.arc(node.x, node.y, radius, 0, Math.PI * 2)
          ctx.fillStyle = node.color
          ctx.globalAlpha = nodeAlpha
          ctx.fill()
        })
      })

      // 4. Draw Backbone Ribbons connecting nodes
      const drawBackbone = (nodes: Node3D[]) => {
        ctx.beginPath()
        for (let i = 0; i < nodes.length - 1; i++) {
          const n1 = nodes[i]
          const n2 = nodes[i + 1]
          const avgZ = (n1.z + n2.z) / 2
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.18)'
          ctx.lineWidth = Math.max(1, (avgZ + 1.2) * 1.5)
          ctx.globalAlpha = Math.max(0.15, (avgZ + 1.2) / 2.4)
          ctx.moveTo(n1.x, n1.y)
          ctx.lineTo(n2.x, n2.y)
        }
        ctx.stroke()
      }

      drawBackbone(strandA)
      drawBackbone(strandB)

      ctx.globalAlpha = 1.0
      animationFrameId = requestAnimationFrame(render)
    }

    render()

    return () => {
      window.removeEventListener('resize', handleResize)
      cancelAnimationFrame(animationFrameId)
    }
  }, [])

  return (
    <div className="title-dna-bg-wrapper">
      <canvas ref={canvasRef} className="title-dna-canvas" />
      <div className="title-canvas-overlay-glow" />
    </div>
  )
}

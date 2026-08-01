# 🧬 DNA Sequence Analyzer

A full-stack web application for DNA → mRNA → Protein prediction with mutation detection. Features an interactive button-based DNA sequence builder, 3D rotating DNA helix canvas title background, protein identification with live UniProt enrichment, live biophysics analytics, interactive genetic codon matrix, and FASTA format exporter.

---

## 🌐 Live Demo & Repository

- **Live Web App (Vercel)**: [https://dna-sequence-analyzer-orcin.vercel.app](https://dna-sequence-analyzer-orcin.vercel.app)
- **GitHub Repository**: [https://github.com/gowtham11112007/dna-sequence-analyzer](https://github.com/gowtham11112007/dna-sequence-analyzer)

---

## 🏗 Architecture

```
DNA SEQUENCE/
├── api/                       # Vercel serverless function entry
│   ├── index.py               # Serverless ASGI handler
│   └── requirements.txt
├── backend/                   # Python FastAPI backend
│   ├── main.py                # API endpoints + bio pipeline
│   ├── reference_proteins.json # Known protein reference database
│   └── requirements.txt       # Python dependencies
├── frontend/                  # React (Vite + TypeScript)
│   ├── src/
│   │   ├── main.tsx           # React entry point
│   │   ├── App.tsx            # Root component
│   │   ├── DnaHelixCanvas.tsx # 3D DNA Canvas Title background
│   │   ├── SequenceBuilder.tsx# Interactive A/T/G/C button builder
│   │   ├── ResultsDisplay.tsx # mRNA, AA chain, protein match, UniProt
│   │   ├── SequenceAnalytics.tsx# GC content, Tm, molecular weight
│   │   ├── CodonWheel.tsx     # Interactive 64-codon matrix
│   │   ├── FastaExporter.tsx  # FASTA & JSON exporter
│   │   ├── api.ts             # API service layer
│   │   └── index.css          # Global dark bio-tech styles
│   └── package.json
├── vercel.json                # Vercel deployment routing
└── README.md
```

## 🚀 Local Development

### 1. Backend
```bash
cd backend
pip3 install -r requirements.txt
python3 -m uvicorn main:app --host 0.0.0.0 --port 8000
```

### 2. Frontend
```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173` in your browser.

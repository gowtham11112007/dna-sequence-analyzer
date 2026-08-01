"""
Vercel Serverless Function entry point for FastAPI backend
"""
import sys
from pathlib import Path

# Add project root and backend to python path
root_dir = Path(__file__).parent.parent
sys.path.append(str(root_dir))
sys.path.append(str(root_dir / "backend"))

from backend.main import app

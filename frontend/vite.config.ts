import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    // Proxy API calls to the FastAPI backend during development
    proxy: {
      '/analyze': 'http://localhost:8000',
      '/compare': 'http://localhost:8000',
    },
  },
})

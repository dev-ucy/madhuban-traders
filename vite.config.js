import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  root: '.',
  // Base set to './' so assets and routes work on relative paths (useful for static deploys / GitHub Pages)
  base: './',
})

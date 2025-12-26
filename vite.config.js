import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
// import react from '@vitejs/react-swc'

export default defineConfig({
  plugins: [react()],
  root: '.',
  // Use absolute base '/' so assets load correctly on deep routes (e.g., /product/1) when using SPA rewrites
  base: '/',
})



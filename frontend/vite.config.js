import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Allow overriding API target via environment variable when running in Docker or CI
const apiTarget = process.env.API_URL || process.env.VITE_API_URL || 'http://localhost:5656/api'

export default defineConfig({
  plugins: [
    react(),
  ],
  root: '.',
  server: {
    host: '0.0.0.0', // Necessary for Docker to expose the port outside the container
    port: 5173,
    watch: {
      usePolling: true, // Required for Windows (NTFS) to Docker WSL2 file watching
      interval: 100,
    },
    proxy: {
      '/api': apiTarget
    }
  },
  optimizeDeps: {
    force: false, // Prevents Vite from re-bundling node_modules every time dev starts
  },
  build: {
    // Code splitting optimization for route-based lazy loading
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunk for large libraries
          'vendor': ['react', 'react-dom', 'react-router-dom'],
          // Billing pages in separate chunk
          'billing': [
            './src/pages/BillingLogin.jsx',
            './src/pages/BillGenerator.jsx',
            './src/pages/BillPreview.jsx',
            './src/pages/BillHistory.jsx',
            './src/pages/BillInvoice.jsx',
            './src/context/BillingContext.jsx',
          ],
          // Product pages in separate chunk
          'products': [
            './src/pages/Catalog.jsx',
            './src/pages/Product.jsx',
            './src/context/CatalogContext.jsx',
          ],
        }
      }
    },
    // Reduce chunk size warning threshold
    chunkSizeWarningLimit: 600,
    // Minify
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console logs in production
      }
    }
  },
  base: '/'
})

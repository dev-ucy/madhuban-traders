import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
// import react from '@vitejs/react-swc'

// Allow overriding API target via environment variable when running in Docker or CI
const apiTarget = process.env.API_URL || process.env.VITE_API_URL || 'http://localhost:4000'

export default defineConfig({
  plugins: [
    react(),
    // Dev helper: directly serve the Vercel-style function during `vite` dev server.
    // This allows POST/GET requests to `/api/submissions` to succeed without running a separate API process.
    {
      name: 'dev-submissions-middleware',
      configureServer(server) {
        server.middlewares.use('/api/submissions', async (req, res, next) => {
          // collect request body for POST
          if (req.method === 'POST' || req.method === 'PUT') {
            let raw = ''
            try{
              for await (const chunk of req) raw += chunk
            }catch(e){
              console.error('Error reading request body', e)
            }
            if (raw) {
              try { req.body = JSON.parse(raw) } catch(e) { res.statusCode = 400; res.end('Invalid JSON'); return }
            } else {
              req.body = {}
            }
          }

          try{
            const mod = await import(path.resolve(process.cwd(), 'api', 'submissions.js'))
            const handler = mod.default || mod
            await handler(req, res)
          }catch(err){
            console.error('Dev submissions middleware error', err)
            res.statusCode = 500
            // Expose stack in dev to help local debugging inside Docker Compose
            res.end(process.env.NODE_ENV === 'production' ? 'Internal Server Error' : (err.stack || err.message || 'Internal Server Error'))
          }
        })
      }
    }
  ],
  root: '.',
  server: {
    proxy: {
      '/api': apiTarget
    }
  },
  // Use absolute base '/' so assets load correctly on deep routes (e.g., /product/1) when using SPA rewrites
  base: '/',
})



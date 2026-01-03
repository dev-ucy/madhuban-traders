const express = require('express')
const bodyParser = require('body-parser')
const submissionsHandler = require('../api/submissions')

const app = express()
app.use(bodyParser.json())

// Adapt Express request/response to the Vercel-style handler
app.options('/api/submissions', (req, res) => submissionsHandler(req, res))
app.post('/api/submissions', (req, res) => submissionsHandler(req, res))
app.get('/api/submissions', (req, res) => submissionsHandler(req, res))

// Root and health endpoints for quick verification
app.get('/', (req, res) => {
  res.setHeader('Content-Type', 'text/plain')
  res.send('Dev API server is running')
})

app.get('/api/health', (req, res) => {
  res.json({ ok: true })
})

const PORT = process.env.PORT || 4000
app.listen(PORT, () => console.log(`Dev API server listening on ${PORT}`))

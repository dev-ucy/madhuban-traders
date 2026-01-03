const fs = require('fs')
const path = require('path')
const os = require('os')

const LOCAL_DATA_DIR = path.join(process.cwd(), 'data')


const istString = new Date().toLocaleString("sv-SE", {
  timeZone: "Asia/Kolkata",
});
// replace(" ", "T") + ".000+05:30";

function getDataDir(){
  // When running on Vercel or in production serverless env, write to OS temp dir (writable but ephemeral)
  if (process.env.VERCEL === '1' || process.env.NODE_ENV === 'production'){
    return path.join(os.tmpdir(), 'madhuban-submissions')
  }
  // Local development uses the repository `data/` folder so records persist on disk
  return LOCAL_DATA_DIR
}

function ensureDataFile(){
  const dir = getDataDir()
  const file = path.join(dir, 'submissions.json')
  if(!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
  if(!fs.existsSync(file)) fs.writeFileSync(file, '[]', 'utf8')
}

function ensureIds(arr){
  let changed = false
  const res = arr.map(item => {
    if(!item.id){
      item.id = Date.now().toString(36) + '-' + Math.random().toString(36).slice(2,8)
      changed = true
    }
    return item
  })
  return { arr: res, changed }
}

function readSubmissions(){
  ensureDataFile()
  const file = path.join(getDataDir(), 'submissions.json')
  const raw = fs.readFileSync(file, 'utf8') || '[]'
  try{
    const arr = JSON.parse(raw || '[]')
    if(!Array.isArray(arr)) return []
    // Ensure each item has an id for update/delete operations
    const { arr: normalized, changed } = ensureIds(arr)
    if(changed){
      fs.writeFileSync(file, JSON.stringify(normalized, null, 2), 'utf8')
    }
    return normalized
  }catch(e){
    console.warn('Invalid JSON in submissions file — resetting to empty array')
    fs.writeFileSync(file, '[]', 'utf8')
    return []
  }
}

module.exports = async (req, res) => {
  // Helper responders that work with Express `res` or Node `ServerResponse`
  const sendNoContent = () => {
    // Use primitive methods so this works in all runtimes (Express or raw ServerResponse)
    res.statusCode = 204
    return res.end()
  }
  const sendJson = (status, obj) => {
    const payload = JSON.stringify(obj)
    res.statusCode = status
    // Avoid calling helper methods that may not exist; set header and write directly
    res.setHeader('Content-Type', 'application/json')
    return res.end(payload)
  }
  const sendText = (status, text) => {
    res.statusCode = status
    res.setHeader('Content-Type', 'text/plain')
    return res.end(String(text))
  }

  try{
    // Ensure CORS header for all responses (helpful during local testing)
    res.setHeader('Access-Control-Allow-Origin', '*')

    if (req.method === 'OPTIONS') {
      res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS')
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
      return sendNoContent()
    }

    if (req.method === 'GET'){
      const arr = readSubmissions()
      return sendJson(200, arr)
    }

    // POST -> create
    if (req.method === 'POST' && req.url && !req.url.includes('/api/submissions/')){
      const body = req.body || req._body || {}
      const entry = { ...body, receivedAt: istString }
      const arr = readSubmissions()
      arr.push(entry)
      const file = path.join(getDataDir(), 'submissions.json')
      fs.writeFileSync(file, JSON.stringify(arr, null, 2), 'utf8')
      return sendJson(200, { ok: true })
    }

    // PUT -> update by id
    if (req.method === 'PUT'){
      const parsedUrl = new URL(req.url, 'http://localhost')
      const parts = parsedUrl.pathname.split('/').filter(Boolean)
      const id = parts[parts.length - 1]
      if(!id) return sendJson(400, { error: 'Missing id' })
      const body = req.body || req._body || {}
      const arr = readSubmissions()
      const idx = arr.findIndex(x => String(x.id) === String(id))
      if(idx === -1) return sendJson(404, { error: 'Not found' })
      arr[idx] = { ...arr[idx], ...body }
      const file = path.join(getDataDir(), 'submissions.json')
      fs.writeFileSync(file, JSON.stringify(arr, null, 2), 'utf8')
      return sendJson(200, { ok: true, item: arr[idx] })
    }

    // DELETE -> delete by id
    if (req.method === 'DELETE'){
      const parsedUrl = new URL(req.url, 'http://localhost')
      const parts = parsedUrl.pathname.split('/').filter(Boolean)
      const id = parts[parts.length - 1]
      if(!id) return sendJson(400, { error: 'Missing id' })
      const arr = readSubmissions()
      const idx = arr.findIndex(x => String(x.id) === String(id))
      if(idx === -1) return sendJson(404, { error: 'Not found' })
      const [removed] = arr.splice(idx,1)
      const file = path.join(getDataDir(), 'submissions.json')
      fs.writeFileSync(file, JSON.stringify(arr, null, 2), 'utf8')
      return sendJson(200, { ok: true, removed })
    }

    return sendJson(405, { error: 'Method not allowed' })
  }catch(err){
    console.error('submission handler error', err)
    // Provide error details in non-production environments to aid debugging when running locally/docker-compose
    const payload = { error: 'internal error' }
    if (process.env.NODE_ENV !== 'production') {
      payload.message = err.message
      payload.stack = err.stack
    }
    // When running on Vercel, warn about ephemeral storage
    if (process.env.VERCEL === '1' || process.env.NODE_ENV === 'production'){
      payload.note = 'Running on a serverless platform (e.g. Vercel). File storage is ephemeral and will not persist across instances. Use external storage for persistence.'
    }
    return sendJson(500, payload)
  }
}

// Ensure compatibility with different module systems
module.exports = module.exports || exports.default
module.exports.default = module.exports


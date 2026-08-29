const BASE = (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/$/, '')

export const API_BASE = BASE

export function apiUrl(path = '') {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  return `${API_BASE}${normalizedPath}`
}

export async function apiFetch(path, options = {}) {
  const headers = { ...(options.headers || {}) }
  const hasBody = typeof options.body !== 'undefined'

  if (hasBody && !headers['Content-Type'] && !(headers['content-type'])) {
    headers['Content-Type'] = 'application/json'
  }

  const response = await fetch(apiUrl(path), { ...options, headers })
  return response
}

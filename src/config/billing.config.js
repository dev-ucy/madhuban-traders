/**
 * Billing Module Configuration
 * 
 * Configure your backend API endpoint here or use environment variables.
 * See .env.example for more details.
 */

export const billingConfig = {
  // API Base URL - Override in .env file
  // Example: VITE_API_BASE_URL=http://localhost:8000/api
  apiBase: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api',

  // Demo credentials for reference
  demoCredentials: {
    username: 'shop1',
    password: 'shop123'
  },

  // API Endpoints (relative to apiBase)
  endpoints: {
    auth: {
      login: '/auth/login',
      logout: '/auth/logout',
      verify: '/auth/verify'
    },
    bills: {
      create: '/bills',
      list: '/bills',
      get: (id) => `/bills/${id}`,
      update: (id) => `/bills/${id}`
    },
    health: '/health'
  },

  // Token storage
  tokenKey: 'billingToken',

  // Request timeout (ms)
  timeout: 30000,

  // Enable logging
  debug: import.meta.env.DEV
}

export default billingConfig

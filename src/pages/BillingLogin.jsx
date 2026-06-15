import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useBilling } from '../context/BillingContext'
import '../styles/billing.css'

export default function BillingLogin() {
  const navigate = useNavigate()
  const { login, loading, error } = useBilling()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [localError, setLocalError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLocalError('')

    if (!username || !password) {
      setLocalError('Please enter both username and password')
      return
    }

    const success =  await login(username, password)
    if (success) {
      navigate('/billing')
    } else {
      setLocalError('Login failed. Please check your credentials.')
    }
  }

  return (
    <div className="billing-login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>Madhuban Traders</h1>
          <h2>Worker Billing Portal</h2>
          <p className="subtitle">Secure Shop Management</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              disabled={loading}
              autoFocus
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              disabled={loading}
            />
          </div>

          {(error || localError) && (
            <div className="error-message">
              {error || localError}
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="login-footer">
          <p className="demo-hint">
            <strong>🧪 Test Login (No Backend Needed):</strong><br />
            Username: <code>test</code><br />
            Password: <code>test</code><br />
            <br />
            <em>Also works: demo/demo or worker/worker</em>
          </p>
        </div>
      </div>
    </div>
  )
}

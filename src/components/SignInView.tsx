import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import type { View } from '../types'

interface SignInViewProps {
  setView: (v: View) => void
}

function SignInView({ setView }: SignInViewProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (signInError) {
      setError(signInError.message)
    }
    // On success the auth listener in App.tsx will route us to the list view.

    setLoading(false)
  }

  return (
    <div className="auth-section">
      <h2>Sign In</h2>
      {error && <p className="error-message">{error}</p>}

      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Loading...' : 'Sign In'}
        </button>
      </form>

      <p className="toggle-auth" onClick={() => setView('signup')} style={{ cursor: 'pointer' }}>
        Need an account? Sign Up
      </p>
    </div>
  )
}

export default SignInView

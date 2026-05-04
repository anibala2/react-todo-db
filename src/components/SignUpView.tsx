import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import type { View } from '../types'

interface SignUpViewProps {
  setView: (v: View) => void
}

function SignUpView({ setView }: SignUpViewProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [info, setInfo] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setInfo(null)

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    })

    if (signUpError) {
      setError(signUpError.message)
    } else if (data.session) {
      // Auto-confirm is on — auth listener will route to list view.
    } else {
      // Email confirmation is required — show a friendly note.
      setInfo('Check your email to confirm your account, then sign in.')
    }

    setLoading(false)
  }

  return (
    <div className="auth-section">
      <h2>Create Account</h2>
      {error && <p className="error-message">{error}</p>}
      {info && <p className="error-message" style={{ background: 'rgba(58, 158, 110, 0.12)', borderColor: 'rgba(58, 158, 110, 0.4)', color: '#3a9e6e' }}>{info}</p>}

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
          placeholder="Password (min 6 characters)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          minLength={6}
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Loading...' : 'Sign Up'}
        </button>
      </form>

      <p className="toggle-auth" onClick={() => setView('signin')} style={{ cursor: 'pointer' }}>
        Already have an account? Sign In
      </p>
    </div>
  )
}

export default SignUpView

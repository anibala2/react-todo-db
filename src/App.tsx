import { useState, useEffect } from 'react'
import type { User } from '@supabase/supabase-js'
import './App.css'
import { supabase } from './lib/supabaseClient'
import type { View } from './types'
import NavBar from './components/NavBar'
import HomeView from './components/HomeView'
import ProductListView from './components/ProductListView'
import SignInView from './components/SignInView'
import SignUpView from './components/SignUpView'

function App() {
  // ── Top-level auth state ────────────────────────────────────────────────
  const [user, setUser] = useState<User | null>(null)
  const [authLoading, setAuthLoading] = useState(true)

  // ── Top-level view state (state-based routing per Option A) ─────────────
  const [view, setView] = useState<View>('home')

  // ── Auth listener ───────────────────────────────────────────────────────
  // Subscribe once on mount. SIGNED_IN/SIGNED_OUT events flip `user` and we
  // route to a sensible view automatically so the nav bar and content stay
  // in sync with auth state.
  useEffect(() => {
    // Pull the existing session immediately so we don't show a logged-out UI
    // for a flash on reload.
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setAuthLoading(false)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null)

      // Friendly auto-routing: after sign-in send the user to the list,
      // after sign-out send them home.
      if (event === 'SIGNED_IN') setView('list')
      if (event === 'SIGNED_OUT') setView('home')
    })

    return () => subscription.unsubscribe()
  }, [])

  // ── Sign out handler — passed to NavBar ─────────────────────────────────
  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) console.error('Error signing out:', error.message)
  }

  // ── Render ──────────────────────────────────────────────────────────────

  if (authLoading) {
    return (
      <div className="app">
        <p className="loading-msg">Loading...</p>
      </div>
    )
  }

  return (
    <div className="app">
      <NavBar
        currentView={view}
        setView={setView}
        user={user}
        onSignOut={handleSignOut}
      />

      {/* Render exactly one view at a time. */}
      {view === 'home' && <HomeView user={user} setView={setView} />}
      {view === 'list' && <ProductListView user={user} />}
      {view === 'signin' && <SignInView setView={setView} />}
      {view === 'signup' && <SignUpView setView={setView} />}
    </div>
  )
}

export default App

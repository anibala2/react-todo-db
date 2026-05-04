import type { User } from '@supabase/supabase-js'
import type { View } from '../types'

interface HomeViewProps {
  user: User | null
  setView: (v: View) => void
}

function HomeView({ user, setView }: HomeViewProps) {
  return (
    <section className="auth-section" style={{ maxWidth: '720px' }}>
      <h2>Welcome to the Movie Database</h2>
      <p style={{ marginTop: '12px' }}>
        Browse a list of films, tagged with director, genre, runtime
        and rating. Anyone can browse the catalog. Sign in to add your own
        favorites, edit existing entries, or delete the ones you no longer want.
      </p>

      <div className="form-actions" style={{ marginTop: '20px', justifyContent: 'flex-start' }}>
        <button className="btn btn-primary" onClick={() => setView('list')}>
          Browse Movies
        </button>
        {!user && (
          <button className="btn btn-secondary" onClick={() => setView('signup')}>
            Create an Account
          </button>
        )}
      </div>
    </section>
  )
}

export default HomeView

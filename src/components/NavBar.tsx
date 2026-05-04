import type { User } from '@supabase/supabase-js'
import type { View } from '../types'

interface NavBarProps {
  currentView: View
  setView: (v: View) => void
  user: User | null
  onSignOut: () => void
}

function NavBar({ currentView, setView, user, onSignOut }: NavBarProps) {
  // Helper so the active link gets a visual cue. Keeps button styles consistent
  // by switching between btn-primary (active) and btn-secondary (inactive).
  const linkClass = (v: View) =>
    `btn ${currentView === v ? 'btn-primary' : 'btn-secondary'}`

  return (
    <header className="app-header">
      <h1>🎬 Movie Database</h1>

      <nav className="header-actions">
        <button className={linkClass('home')} onClick={() => setView('home')}>
          Home
        </button>
        <button className={linkClass('list')} onClick={() => setView('list')}>
          Movies
        </button>

        {user ? (
          // The Sign Out button stays first so it aligns vertically with Home
          // and Movies in the flex row. The email caption sits below it,
          // overflowing downward as a small label without nudging the row.
          // `position: relative` + an absolutely-positioned caption keeps the
          // wrapper's intrinsic height equal to the button's height, so the
          // parent flex row's align-items: center keeps everything aligned.
          <div style={{ position: 'relative' }}>
            <button className="btn btn-secondary" onClick={onSignOut}>
              Sign Out
            </button>
            <span
              className="user-email"
              style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                textAlign: 'center',
                marginTop: '4px',
                fontSize: '0.75rem',
                whiteSpace: 'nowrap',
              }}
            >
              {user.email}
            </span>
          </div>
        ) : (
          <>
            <button
              className={linkClass('signin')}
              onClick={() => setView('signin')}
            >
              Sign In
            </button>
            <button
              className={linkClass('signup')}
              onClick={() => setView('signup')}
            >
              Sign Up
            </button>
          </>
        )}
      </nav>
    </header>
  )
}

export default NavBar

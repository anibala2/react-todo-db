import { useState, useEffect } from 'react'
import type { User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabaseClient'
import type { Movie } from '../types'
import MovieFormModal from './MovieFormModal'

interface ProductListViewProps {
  user: User | null
}

function ProductListView({ user }: ProductListViewProps) {
  const [movies, setMovies] = useState<Movie[]>([])
  const [loading, setLoading] = useState(true)

  // Modal state — null means modal is closed.
  // We store either 'add' (new movie) or the Movie object being edited.
  const [modalMovie, setModalMovie] = useState<Movie | 'add' | null>(null)

  // Delete confirmation: id of the row currently asking "Sure?"
  const [deletingId, setDeletingId] = useState<number | null>(null)

  // Page-level error banner — used to surface delete failures (e.g., RLS).
  const [pageError, setPageError] = useState<string | null>(null)

  // ── Fetch on mount and whenever auth changes ─────────────────────────────
  useEffect(() => {
    fetchMovies()
  }, [user])

  async function fetchMovies() {
    setLoading(true)
    const { data, error } = await supabase
      .from('movies')
      .select('*')
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Error fetching movies:', error)
    } else if (data) {
      setMovies(data as Movie[])
    }
    setLoading(false)
  }

  // ── Modal callbacks ──────────────────────────────────────────────────────

  function handleSaved(saved: Movie, mode: 'insert' | 'update') {
    if (mode === 'insert') {
      setMovies((prev) => [...prev, saved])
    } else {
      setMovies((prev) => prev.map((m) => (m.id === saved.id ? saved : m)))
    }
  }

  // ── Delete ───────────────────────────────────────────────────────────────
  // Same RLS gotcha as update: deleting someone else's row returns `data = []`
  // with no error. We use `.select()` so the deleted row(s) come back, and we
  // only update local state if at least one row actually came back.
  const handleDelete = async (id: number) => {
    setPageError(null)

    const { data, error } = await supabase
      .from('movies')
      .delete()
      .eq('id', id)
      .select()

    if (error) {
      console.error('Error deleting movie:', error)
      setPageError(error.message)
    } else if (!data || data.length === 0) {
      setPageError(
        "You can only delete movies you created. This movie belongs to another user."
      )
    } else {
      setMovies((prev) => prev.filter((m) => m.id !== id))
    }
    setDeletingId(null)
  }

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <section>
      {/* Page-level toolbar — only shows the Add button when signed in. */}
      <div
        className="header-actions"
        style={{ justifyContent: 'space-between', marginBottom: '20px' }}
      >
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>All Movies</h2>
        {user ? (
          <button className="btn btn-primary" onClick={() => setModalMovie('add')}>
            + Add Movie
          </button>
        ) : (
          <span className="anon-note">Sign in to add, edit, or delete movies</span>
        )}
      </div>

      {pageError && (
        <p className="error-message" style={{ marginBottom: '16px' }}>
          {pageError}
        </p>
      )}

      {loading ? (
        <p className="loading-msg">Loading movies...</p>
      ) : movies.length === 0 ? (
        <p className="empty-msg">
          No movies yet. {user ? 'Add one above!' : 'Sign in to add movies.'}
        </p>
      ) : (
        <div className="table-wrapper">
          <table className="movies-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Director</th>
                <th>Genre</th>
                <th>Year</th>
                <th>Runtime</th>
                <th>Rating</th>
                <th>Description</th>
                {user && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {movies.map((movie) => (
                <tr key={movie.id}>
                  <td><strong>{movie.title}</strong></td>
                  <td>{movie.director}</td>
                  <td><span className="genre-badge">{movie.genre}</span></td>
                  <td>{movie.year}</td>
                  <td>{movie.runtime} min</td>
                  <td>{movie.rating != null ? `⭐ ${movie.rating}` : '—'}</td>
                  <td className="description-cell">{movie.description ?? '—'}</td>

                  {user && (
                    <td className="actions-cell">
                      <button
                        className="btn btn-sm btn-edit"
                        onClick={() => setModalMovie(movie)}
                      >
                        Edit
                      </button>
                      {deletingId === movie.id ? (
                        <span className="confirm-delete">
                          Sure?&nbsp;
                          <button
                            className="btn btn-sm btn-danger"
                            onClick={() => handleDelete(movie.id)}
                          >
                            Yes
                          </button>
                          &nbsp;
                          <button
                            className="btn btn-sm btn-secondary"
                            onClick={() => setDeletingId(null)}
                          >
                            No
                          </button>
                        </span>
                      ) : (
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => setDeletingId(movie.id)}
                        >
                          Delete
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Add / Edit Modal ── */}
      {modalMovie !== null && (
        <MovieFormModal
          editingMovie={modalMovie === 'add' ? null : modalMovie}
          onSaved={handleSaved}
          onClose={() => setModalMovie(null)}
        />
      )}
    </section>
  )
}

export default ProductListView

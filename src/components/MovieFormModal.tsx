import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import type { Movie, MovieFormData } from '../types'
import { EMPTY_FORM } from '../types'

interface MovieFormModalProps {
  // null = adding a new movie, Movie = editing existing
  editingMovie: Movie | null
  // Called by the parent after a successful insert/update so the parent can
  // patch its movies array. Parent owns the list, modal just reports back.
  onSaved: (movie: Movie, mode: 'insert' | 'update') => void
  onClose: () => void
}

function MovieFormModal({ editingMovie, onSaved, onClose }: MovieFormModalProps) {
  // Initialize form from the movie being edited, or blank for new.
  // Using a function initializer so this only runs once per mount.
  const [form, setForm] = useState<MovieFormData>(() =>
    editingMovie
      ? {
          title: editingMovie.title,
          director: editingMovie.director,
          genre: editingMovie.genre,
          year: String(editingMovie.year),
          runtime: String(editingMovie.runtime),
          rating: editingMovie.rating != null ? String(editingMovie.rating) : '',
          description: editingMovie.description ?? '',
        }
      : EMPTY_FORM
  )

  const [formError, setFormError] = useState<string | null>(null)
  const [formLoading, setFormLoading] = useState(false)

  function handleFormChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)
    setFormLoading(true)

    const payload = {
      title: form.title.trim(),
      director: form.director.trim(),
      genre: form.genre.trim(),
      year: parseInt(form.year),
      runtime: parseInt(form.runtime),
      rating: form.rating !== '' ? parseFloat(form.rating) : null,
      description: form.description.trim() || null,
    }

    if (
      !payload.title ||
      !payload.director ||
      !payload.genre ||
      isNaN(payload.year) ||
      isNaN(payload.runtime)
    ) {
      setFormError('Title, director, genre, year, and runtime are required.')
      setFormLoading(false)
      return
    }

    if (editingMovie) {
      // UPDATE
      // Note on RLS: the UPDATE policy uses `auth.uid() = user_id`, so trying
      // to update a row owned by someone else returns `data = []` with no
      // error. We must check that explicitly — otherwise data[0] would be
      // undefined and crash the parent on render.
      const { data, error } = await supabase
        .from('movies')
        .update(payload)
        .eq('id', editingMovie.id)
        .select()

      if (error) {
        setFormError(error.message)
      } else if (!data || data.length === 0) {
        // RLS silently dropped the update — the row exists but isn't ours.
        setFormError(
          "You can only edit movies you created. This movie belongs to another user."
        )
      } else {
        onSaved(data[0] as Movie, 'update')
        onClose()
      }
    } else {
      // INSERT
      // RLS INSERT policy requires auth.uid() = user_id, and the column
      // defaults to auth.uid(), so a signed-in user inserting their own row
      // works. If somehow it returns no rows, surface that too.
      const { data, error } = await supabase
        .from('movies')
        .insert(payload)
        .select()

      if (error) {
        setFormError(error.message)
      } else if (!data || data.length === 0) {
        setFormError('Insert blocked. Are you signed in?')
      } else {
        onSaved(data[0] as Movie, 'insert')
        onClose()
      }
    }

    setFormLoading(false)
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>{editingMovie ? 'Edit Movie' : 'Add Movie'}</h2>

        {formError && <p className="error-message">{formError}</p>}

        <form onSubmit={handleFormSubmit} className="movie-form">
          <div className="form-row">
            <label>
              Title *
              <input
                name="title"
                value={form.title}
                onChange={handleFormChange}
                required
                placeholder="The Godfather"
              />
            </label>
            <label>
              Director *
              <input
                name="director"
                value={form.director}
                onChange={handleFormChange}
                required
                placeholder="Francis Ford Coppola"
              />
            </label>
          </div>

          <div className="form-row">
            <label>
              Genre *
              <input
                name="genre"
                value={form.genre}
                onChange={handleFormChange}
                required
                placeholder="Crime"
              />
            </label>
            <label>
              Year *
              <input
                name="year"
                type="number"
                value={form.year}
                onChange={handleFormChange}
                required
                placeholder="1972"
                min="1888"
                max="2100"
              />
            </label>
          </div>

          <div className="form-row">
            <label>
              Runtime (min) *
              <input
                name="runtime"
                type="number"
                value={form.runtime}
                onChange={handleFormChange}
                required
                placeholder="175"
                min="1"
              />
            </label>
            <label>
              Rating (0–10)
              <input
                name="rating"
                type="number"
                value={form.rating}
                onChange={handleFormChange}
                placeholder="9.2"
                min="0"
                max="10"
                step="0.1"
              />
            </label>
          </div>

          <label>
            Description
            <textarea
              name="description"
              value={form.description}
              onChange={handleFormChange}
              placeholder="A short description..."
              rows={3}
            />
          </label>

          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={formLoading}>
              {formLoading ? 'Saving...' : editingMovie ? 'Save Changes' : 'Add Movie'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default MovieFormModal

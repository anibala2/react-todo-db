// ── Shared types ───────────────────────────────────────────────────────────

export interface Movie {
  id: number
  user_id: string
  title: string
  director: string
  genre: string
  year: number
  runtime: number
  rating: number | null
  description: string | null
  created_at: string
}

export interface MovieFormData {
  title: string
  director: string
  genre: string
  year: string
  runtime: string
  rating: string
  description: string
}

export const EMPTY_FORM: MovieFormData = {
  title: '',
  director: '',
  genre: '',
  year: '',
  runtime: '',
  rating: '',
  description: '',
}

// View state used by the top-level App component for state-based routing.
export type View = 'home' | 'list' | 'signin' | 'signup'

# Movie Database

A data-driven web application for browsing and managing a collection of movies. Built for GMU's IT 431 Project 2

Anonymous visitors can browse the catalog. Authenticated users can add, edit, and delete movies they own.

## Live Demo

- **Deployed app:** _add Vercel URL here_
- **Source:** _add GitHub URL here_

## Tech Stack

- **React 19** + **Vite** — front end
- **TypeScript** — type-safe components and Supabase responses
- **Supabase** — Postgres database, authentication, and Row Level Security
- **Vercel** — deployment

## Features

- Browse a list of movies (title, director, genre, year, runtime, rating, description) without signing in
- Sign up and sign in with email + password via Supabase Auth
- Authenticated users can add new movies, edit movies they created, and delete movies they created
- CRUD restrictions are enforced at the database level via Row Level Security policies — not just hidden in the UI
- State-based view switching across four distinct views (Home, Movies, Sign In, Sign Up) with a persistent nav bar

## Project Structure

```
src/
├── App.tsx                       # Top-level component: holds auth + view state
├── types.ts                      # Shared types (Movie, MovieFormData, View)
├── lib/
│   └── supabaseClient.ts         # Supabase client initialization
└── components/
    ├── NavBar.tsx                # Always-visible navigation bar
    ├── HomeView.tsx              # Landing view
    ├── ProductListView.tsx       # Movie table + CRUD actions
    ├── SignInView.tsx            # Sign-in form
    ├── SignUpView.tsx            # Sign-up form
    └── MovieFormModal.tsx        # Add / Edit modal form
```

## Local Development

### Prerequisites

- Node.js 18 or later
- A Supabase project with the `movies` table and RLS policies set up (see below)

### Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/<your-username>/<repo-name>.git
   cd <repo-name>
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env.local` file at the project root with your Supabase credentials:
   ```
   VITE_SUPABASE_URL=https://<your-project-ref>.supabase.co
   VITE_SUPABASE_ANON_KEY=<your-anon-key>
   ```

4. Start the dev server:
   ```bash
   npm run dev
   ```

   The app will be available at `http://localhost:5173`.

## Database Setup

The `movies` table and RLS policies can be created by running the SQL in `project2-movie-db.txt` (included in the project root) inside the Supabase SQL editor. This will:

- Create the `movies` table with seven fields plus `id`, `user_id`, and `created_at`
- Enable Row Level Security
- Add four policies:
  - **SELECT:** anyone (including anonymous) can read
  - **INSERT/UPDATE/DELETE:** authenticated users can manage only their own rows (`auth.uid() = user_id`)
- Insert sample movie data

## Deployment

The app is deployed to Vercel. To deploy your own copy:

1. Push the repository to GitHub
2. Import the repo into Vercel (vercel.com → Add New Project)
3. Vercel auto-detects Vite as the framework
4. Before deploying, add the two environment variables under **Settings → Environment Variables**:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
5. Deploy

## Available Scripts

- `npm run dev` — start the Vite dev server with HMR
- `npm run build` — type-check and produce a production build in `dist/`
- `npm run preview` — preview the production build locally
- `npm run lint` — run ESLint

## Author

Anirudh Balaji

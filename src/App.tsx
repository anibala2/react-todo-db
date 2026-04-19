// src/App.tsx
import { useState, useEffect } from 'react'
import './App.css'
import { supabase } from './lib/supabaseClient'
import Auth from './Auth'

// 1. This interface defines what a Todo looks like
interface Todo {
  id: number
  text: string
}

function App() {
  // 2. Tell the state it will hold an array of Todo objects
  const [todos, setTodos] = useState<Todo[]>([])
  const [inputValue, setInputValue] = useState('')
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState(null)
  const [authLoading, setAuthLoading] = useState(true)
  
	useEffect(() => {
	  const { data: { subscription } } =
		supabase.auth.onAuthStateChange((event, session) => {
		  setUser(session?.user ?? null)
		  setAuthLoading(false)

		  if (session?.user) {
			fetchTodos()
		  } else {
			setTodos([])
		  }
		})

	  return () => subscription.unsubscribe()
	}, [])

  async function fetchTodos() {
    setLoading(true)
    const { data, error } = await supabase
      .from('todos')
      .select('*')
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Error fetching todos:', error)
    } else if (data) {
      // 3. Cast the incoming data to our Todo type
      setTodos(data as Todo[])
    }
    setLoading(false)
  }

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) console.error('Error signing out:', error.message)
  }

  // 4. Add 'React.FormEvent' type to the event parameter
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputValue.trim()) return

    const { data, error } = await supabase
      .from('todos')
      .insert({ text: inputValue.trim() })
      .select()

    if (error) {
      console.error('Error adding todo:', error)
    } else if (data) {
      setTodos([...todos, data[0] as Todo])
      setInputValue('')
    }
  }

  // 5. Explicitly type the 'id' (Supabase IDs are usually numbers or strings)
  const deleteTodo = async (id: number) => {
    const { error } = await supabase
      .from('todos')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting todo:', error)
    } else {
      setTodos(todos.filter(todo => todo.id !== id))
    }
  }


  if (authLoading) {
    return <div className="app"><p>Loading...</p></div>
  }

  if (!user) {
    return (
      <div className="app">
        <h1>React Todo App</h1>
        <Auth />
      </div>
    )
  }

  return (
    <div className="app">
      <h1>React Todo App</h1>

      {/* --- INSERT THE BUTTON HERE --- */}
      <button 
        onClick={handleSignOut} 
        style={{ marginBottom: '20px', cursor: 'pointer' }}
      >
        Sign Out
      </button>
      {/* ------------------------------- */}

      <form className="todo-form" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Add a new todo..."
          value={inputValue}
          // 6. Typing the change event (inline is usually okay)
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInputValue(e.target.value)}
        />
        <button type="submit">Add</button>
      </form>

      {loading ? (
        <p>Loading todos...</p>
      ) : (
        <ul className="todo-list">
          {todos.map(todo => (
            <li key={todo.id} className="todo-item">
              <span>{todo.text}</span>
              <button
                className="delete-btn"
                onClick={() => deleteTodo(todo.id)}
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default App
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { supabase } from './db/supabaseClient.ts'
import App from './App.tsx'
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

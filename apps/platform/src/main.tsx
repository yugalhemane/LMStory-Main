import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import 'theme/css/globals.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

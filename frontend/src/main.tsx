import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css' //Styles for whole App
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

// Polyfill process for browser compatibility (fix for chroma-js etc)
if (typeof window !== 'undefined' && !(window as any).process) { (window as any).process = { env: {} }; }

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

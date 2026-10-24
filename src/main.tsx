import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { StoreProvider } from './lib/store'
import './styles/tokens.css'
import './styles/global.css'

/** Vite の base（例: /jouhou/）を React Router の basename に合わせる */
const basename = import.meta.env.BASE_URL.replace(/\/$/, '') || undefined

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <StoreProvider>
      <BrowserRouter basename={basename}>
        <App />
      </BrowserRouter>
    </StoreProvider>
  </React.StrictMode>,
)

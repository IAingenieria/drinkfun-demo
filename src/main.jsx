import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import { AppProvider } from './context/AppContext.jsx'

// HashRouter: rutas basadas en # (ej: /#/carrito). Es lo más robusto para
// GitHub Pages y sitios estáticos, porque no hay servidor que reescriba las
// rutas y así no salen errores 404 al recargar o abrir enlaces profundos.
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <HashRouter>
      <AppProvider>
        <App />
      </AppProvider>
    </HashRouter>
  </StrictMode>,
)

import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useApp } from './context/AppContext'
import Header from './components/Header'
import BottomNav from './components/BottomNav'
import Toasts from './components/Toasts'

import Feed from './views/Feed'
import Carrito from './views/Carrito'
import MisPedidos from './views/MisPedidos'
import ListaCompras from './views/ListaCompras'
import Publicar from './views/Publicar'
import AdminPedidos from './views/admin/AdminPedidos'
import AdminUtilidad from './views/admin/AdminUtilidad'
import AdminCuentas from './views/admin/AdminCuentas'

// Guarda simple: si el rol activo no puede ver la ruta, lo manda al Feed.
function RolGuard({ permite, children }) {
  const { rol } = useApp()
  if (!permite.includes(rol)) return <Navigate to="/" replace />
  return children
}

export default function App() {
  const location = useLocation()

  return (
    <div className="mx-auto min-h-screen max-w-2xl bg-[#f4f6fb]">
      <Header />

      <main key={location.pathname} className="pb-24">
        <Routes>
          <Route path="/" element={<Feed />} />

          {/* Cliente */}
          <Route
            path="/carrito"
            element={<RolGuard permite={['cliente']}><Carrito /></RolGuard>}
          />
          <Route
            path="/mis-pedidos"
            element={<RolGuard permite={['cliente']}><MisPedidos /></RolGuard>}
          />

          {/* Comprador */}
          <Route
            path="/lista-compras"
            element={<RolGuard permite={['comprador', 'dueno']}><ListaCompras /></RolGuard>}
          />
          <Route
            path="/publicar"
            element={<RolGuard permite={['comprador', 'dueno']}><Publicar /></RolGuard>}
          />

          {/* Dueño */}
          <Route
            path="/admin/pedidos"
            element={<RolGuard permite={['dueno']}><AdminPedidos /></RolGuard>}
          />
          <Route
            path="/admin/utilidad"
            element={<RolGuard permite={['dueno']}><AdminUtilidad /></RolGuard>}
          />
          <Route
            path="/admin/cuentas"
            element={<RolGuard permite={['dueno']}><AdminCuentas /></RolGuard>}
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <Toasts />
      <BottomNav />
    </div>
  )
}

import { NavLink } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import Icon from './Icon'

// Tabs de navegación según el rol activo.
const TABS = {
  cliente: [
    { to: '/', icon: 'tag', label: 'Ofertas', end: true },
    { to: '/carrito', icon: 'cart', label: 'Carrito', badge: 'carrito' },
    { to: '/mis-pedidos', icon: 'box', label: 'Mis pedidos' },
  ],
  comprador: [
    { to: '/', icon: 'tag', label: 'Ofertas', end: true },
    { to: '/lista-compras', icon: 'checklist', label: 'Lista compras' },
    { to: '/publicar', icon: 'plus', label: 'Publicar' },
  ],
  dueno: [
    { to: '/', icon: 'tag', label: 'Ofertas', end: true },
    { to: '/admin/pedidos', icon: 'box', label: 'Pedidos' },
    { to: '/admin/utilidad', icon: 'chart', label: 'Utilidad' },
    { to: '/admin/cuentas', icon: 'receipt', label: 'Cuentas' },
  ],
}

export default function BottomNav() {
  const { rol, totalItemsCarrito } = useApp()
  const tabs = TABS[rol] || TABS.cliente

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-marino/10 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-2xl">
        {tabs.map((t) => (
          <NavLink
            key={t.to}
            to={t.to}
            end={t.end}
            className={({ isActive }) =>
              `relative flex flex-1 flex-col items-center gap-0.5 py-2.5 text-[11px] font-semibold transition ${
                isActive ? 'text-marino' : 'text-marino/40'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <span className="relative">
                  <Icon name={t.icon} className="h-6 w-6" strokeWidth={isActive ? 2.1 : 1.8} />
                  {t.badge === 'carrito' && totalItemsCarrito > 0 && (
                    <span className="absolute -right-2.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-acento px-1 text-[9px] font-bold text-white">
                      {totalItemsCarrito}
                    </span>
                  )}
                </span>
                <span>{t.label}</span>
                {isActive && (
                  <span className="absolute -top-px h-0.5 w-8 rounded-full bg-acento" />
                )}
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}

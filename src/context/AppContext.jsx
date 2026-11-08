import { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react'
import { CLIENTES, COMPRADORES } from '../data/mockData'

// ============================================================================
// AppContext — estado de UI del demo:
//  - rol activo (dueño / comprador / cliente) simulado con un selector
//  - identidad activa según rol (qué comprador / qué cliente)
//  - carrito del cliente
//  - notificaciones in-app (toasts + panel)
//  - "tick" que fuerza refresco cuando dataService cambia localStorage
// ============================================================================

const AppContext = createContext(null)

export const ROLES = [
  { id: 'dueno', nombre: 'Dueño', icon: 'crown' },
  { id: 'comprador', nombre: 'Comprador', icon: 'briefcase' },
  { id: 'cliente', nombre: 'Cliente', icon: 'user' },
]

export function AppProvider({ children }) {
  const [rol, setRol] = useState('cliente')
  // Identidad activa por rol (por defecto: Olga como compradora, Ana como cliente)
  const [compradorId, setCompradorId] = useState(
    COMPRADORES.find((c) => c.nombre === 'Olga')?.id || COMPRADORES[0].id,
  )
  const [clienteId, setClienteId] = useState(CLIENTES[0].id)

  // Carrito: [{ ofertaId, cantidad }]
  const [carrito, setCarrito] = useState([])

  // Notificaciones in-app
  const [notificaciones, setNotificaciones] = useState([])
  const [toasts, setToasts] = useState([])

  // Tick para forzar re-render cuando dataService guarda cambios
  const [tick, setTick] = useState(0)
  useEffect(() => {
    const handler = () => setTick((t) => t + 1)
    window.addEventListener('deusa:data-changed', handler)
    return () => window.removeEventListener('deusa:data-changed', handler)
  }, [])

  // ---- Notificaciones ----
  const notificar = useCallback((mensaje, tipo = 'info') => {
    const id = Math.random().toString(36).slice(2, 9)
    const noti = { id, mensaje, tipo, fecha: new Date().toISOString(), leida: false }
    setNotificaciones((prev) => [noti, ...prev].slice(0, 50))
    setToasts((prev) => [...prev, noti])
    // Auto-descartar el toast a los 4s (el registro queda en el panel)
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 4000)

    // ------------------------------------------------------------------
    // FUTURA INTEGRACIÓN WHATSAPP:
    // Aquí se dispararía el envío real por WhatsApp Business API / Twilio.
    // Ej: await enviarWhatsApp(telefonoCliente, mensaje)
    // Por ahora es solo una notificación dentro de la app.
    // ------------------------------------------------------------------
  }, [])

  const marcarNotisLeidas = useCallback(() => {
    setNotificaciones((prev) => prev.map((n) => ({ ...n, leida: true })))
  }, [])

  const cerrarToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  // ---- Carrito ----
  const agregarAlCarrito = useCallback((ofertaId, cantidad = 1) => {
    setCarrito((prev) => {
      const existe = prev.find((i) => i.ofertaId === ofertaId)
      if (existe) {
        return prev.map((i) =>
          i.ofertaId === ofertaId ? { ...i, cantidad: i.cantidad + cantidad } : i,
        )
      }
      return [...prev, { ofertaId, cantidad }]
    })
  }, [])

  const cambiarCantidad = useCallback((ofertaId, cantidad) => {
    setCarrito((prev) =>
      prev
        .map((i) => (i.ofertaId === ofertaId ? { ...i, cantidad } : i))
        .filter((i) => i.cantidad > 0),
    )
  }, [])

  const quitarDelCarrito = useCallback((ofertaId) => {
    setCarrito((prev) => prev.filter((i) => i.ofertaId !== ofertaId))
  }, [])

  const vaciarCarrito = useCallback(() => setCarrito([]), [])

  const totalItemsCarrito = carrito.reduce((s, i) => s + i.cantidad, 0)

  const value = useMemo(
    () => ({
      rol, setRol,
      compradorId, setCompradorId,
      clienteId, setClienteId,
      carrito, agregarAlCarrito, cambiarCantidad, quitarDelCarrito, vaciarCarrito,
      totalItemsCarrito,
      notificaciones, notificar, marcarNotisLeidas,
      toasts, cerrarToast,
      tick,
    }),
    [
      rol, compradorId, clienteId, carrito, totalItemsCarrito,
      notificaciones, toasts, tick,
      agregarAlCarrito, cambiarCantidad, quitarDelCarrito, vaciarCarrito,
      notificar, marcarNotisLeidas, cerrarToast,
    ],
  )

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp debe usarse dentro de <AppProvider>')
  return ctx
}

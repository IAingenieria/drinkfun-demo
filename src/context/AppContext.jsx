import { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react'
import { USUARIOS, CLIENTES } from '../data/mockData'

// ============================================================================
// AppContext — estado de UI del demo:
//  - cuenta activa ("¿quién eres?") con sus ROLES permitidos
//  - rol/vista activo dentro de los roles de esa cuenta
//  - identidad derivada (compradorId / clienteId) para el resto de la app
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
export const ROL_INFO = Object.fromEntries(ROLES.map((r) => [r.id, r]))

// Cuentas que "inician sesión" en el demo: equipo (staff, con permisos) + clientes.
export const CUENTAS = [
  ...USUARIOS,
  ...CLIENTES.map((c) => ({ id: c.id, nombre: c.nombre, roles: ['cliente'], tipo: 'cliente' })),
]

const cuentaDe = (id) => CUENTAS.find((c) => c.id === id) || CUENTAS[0]

export function AppProvider({ children }) {
  // Cuenta activa (por defecto Nelly, dueña). El rol arranca en su primer permiso.
  const [usuarioId, setUsuarioId] = useState(USUARIOS[0].id)
  const [rol, setRolState] = useState(cuentaDe(USUARIOS[0].id).roles[0])

  const cuenta = cuentaDe(usuarioId)
  const rolesDisponibles = cuenta.roles
  // Identidad derivada para el resto de la app (sin tocar las vistas existentes)
  const compradorId = rolesDisponibles.includes('comprador') ? cuenta.id : null
  const clienteId = cuenta.tipo === 'cliente' ? cuenta.id : null

  // Cambiar de cuenta: resetea el rol/vista al primero permitido y vacía el carrito.
  const setUsuario = useCallback((id) => {
    const c = cuentaDe(id)
    setUsuarioId(id)
    setRolState(c.roles[0])
    setCarrito([])
  }, [])

  // Cambiar de vista (rol), solo si la cuenta tiene ese permiso.
  const setRol = useCallback((r) => {
    setRolState((prev) => (cuentaDe(usuarioId).roles.includes(r) ? r : prev))
  }, [usuarioId])

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
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 4000)
    // FUTURA INTEGRACIÓN WHATSAPP: aquí se enviaría el mensaje real al cliente.
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
      // identidad / permisos
      usuarioId, setUsuario, cuenta, rolesDisponibles,
      rol, setRol,
      compradorId, clienteId,
      // carrito
      carrito, agregarAlCarrito, cambiarCantidad, quitarDelCarrito, vaciarCarrito,
      totalItemsCarrito,
      // notificaciones
      notificaciones, notificar, marcarNotisLeidas,
      toasts, cerrarToast,
      tick,
    }),
    [
      usuarioId, cuenta, rolesDisponibles, rol, compradorId, clienteId,
      carrito, totalItemsCarrito,
      notificaciones, toasts, tick,
      setUsuario, setRol,
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

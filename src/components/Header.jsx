import { useState } from 'react'
import { useApp, ROLES } from '../context/AppContext'
import { getClientes, getCompradores, resetDemo } from '../services/dataService'
import Modal from './Modal'
import Icon from './Icon'
import { LOGO_DEUSA } from '../assets/logo'

export default function Header() {
  const {
    rol, setRol,
    clienteId, setClienteId,
    compradorId, setCompradorId,
    notificaciones, marcarNotisLeidas,
  } = useApp()
  const [openNotis, setOpenNotis] = useState(false)

  const clientes = getClientes()
  const compradores = getCompradores()
  const noLeidas = notificaciones.filter((n) => !n.leida).length

  return (
    <header className="sticky top-0 z-40 bg-white shadow-soft">
      {/* Franja bandera decorativa */}
      <div className="flag-stripe h-1 w-full" />

      <div className="mx-auto flex max-w-2xl items-center justify-between gap-2 px-4 py-2.5">
        {/* Logo real de DeUSA (Base64) */}
        <img
          src={LOGO_DEUSA}
          alt="DeUSA – Cross Border Shopping & Logistics"
          className="h-11 w-auto object-contain"
        />

        {/* Campana de notificaciones */}
        <button
          onClick={() => {
            setOpenNotis(true)
            marcarNotisLeidas()
          }}
          className="relative rounded-full p-2 text-marino hover:bg-marino/5"
          aria-label="Notificaciones"
        >
          <Icon name="bell" className="h-6 w-6" />
          {noLeidas > 0 && (
            <span className="absolute right-0 top-0 flex h-4 min-w-4 items-center justify-center rounded-full bg-acento px-1 text-[10px] font-bold text-white">
              {noLeidas}
            </span>
          )}
        </button>
      </div>

      {/* Selector de rol (simulado, sin login) */}
      <div className="mx-auto flex max-w-2xl items-center gap-2 px-4 pb-3">
        <div className="flex flex-1 gap-1 rounded-xl bg-marino/5 p-1">
          {ROLES.map((r) => (
            <button
              key={r.id}
              onClick={() => setRol(r.id)}
              className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg px-2 py-2 text-xs font-bold transition-all duration-100 ${
                rol === r.id
                  ? 'bg-gradient-to-b from-marino-light to-marino text-white shadow-[0_3px_0_#101a3c,0_5px_10px_rgba(16,25,58,0.3)]'
                  : 'text-marino/60 hover:bg-marino/5'
              }`}
            >
              <Icon name={r.icon} className="h-4 w-4" strokeWidth={2} />
              {r.nombre}
            </button>
          ))}
        </div>

        {/* Selector de identidad según rol */}
        {rol === 'cliente' && (
          <select
            value={clienteId}
            onChange={(e) => setClienteId(e.target.value)}
            className="max-w-[42%] rounded-lg border border-marino/15 bg-white px-2 py-2 text-xs font-semibold text-marino outline-none"
          >
            {clientes.map((c) => (
              <option key={c.id} value={c.id}>{c.nombre}</option>
            ))}
          </select>
        )}
        {rol === 'comprador' && (
          <select
            value={compradorId}
            onChange={(e) => setCompradorId(e.target.value)}
            className="max-w-[42%] rounded-lg border border-marino/15 bg-white px-2 py-2 text-xs font-semibold text-marino outline-none"
          >
            {compradores.map((c) => (
              <option key={c.id} value={c.id}>{c.nombre}</option>
            ))}
          </select>
        )}
      </div>

      {/* Panel de notificaciones */}
      <Modal open={openNotis} onClose={() => setOpenNotis(false)} title="Notificaciones">
        {notificaciones.length === 0 ? (
          <p className="py-6 text-center text-sm text-marino/50">
            Sin notificaciones todavía.
          </p>
        ) : (
          <ul className="space-y-2">
            {notificaciones.map((n) => (
              <li
                key={n.id}
                className="rounded-lg border border-marino/10 bg-marino/5 px-3 py-2 text-sm text-marino"
              >
                {n.mensaje}
              </li>
            ))}
          </ul>
        )}
        <p className="mt-3 text-center text-[11px] text-marino/40">
          {/* FUTURO: estas notificaciones se enviarían también por WhatsApp */}
          Demo: notificaciones dentro de la app (WhatsApp pendiente).
        </p>

        <div className="mt-4 border-t border-marino/10 pt-3">
          <button
            onClick={() => {
              if (confirm('¿Reiniciar el demo a los datos de ejemplo? Se borrarán los cambios locales.')) {
                resetDemo()
                setOpenNotis(false)
              }
            }}
            className="btn-outline w-full text-xs text-acento"
          >
            <Icon name="refresh" className="h-4 w-4" />
            Reiniciar demo (datos de ejemplo)
          </button>
        </div>
      </Modal>
    </header>
  )
}

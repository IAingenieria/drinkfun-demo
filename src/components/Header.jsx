import { useState } from 'react'
import { useApp, ROL_INFO, CUENTAS } from '../context/AppContext'
import { resetDemo } from '../services/dataService'
import Modal from './Modal'
import Icon from './Icon'
import { LOGO_DRINKFUN } from '../assets/logo'

const STAFF = CUENTAS.filter((c) => c.tipo !== 'cliente')
const CLIENTES_CTA = CUENTAS.filter((c) => c.tipo === 'cliente')
const ETIQUETA_TIPO = { dueno: 'Dueño', colaborador: 'Colaborador', cliente: 'Cliente' }

export default function Header() {
  const {
    usuarioId, setUsuario, cuenta, rolesDisponibles,
    rol, setRol,
    notificaciones, marcarNotisLeidas,
  } = useApp()
  const [openNotis, setOpenNotis] = useState(false)

  const noLeidas = notificaciones.filter((n) => !n.leida).length

  return (
    <header className="sticky top-0 z-40 bg-white shadow-soft">
      {/* Franja de marca (Tinta → Coral) */}
      <div className="flag-stripe h-1 w-full" />

      <div className="mx-auto flex max-w-2xl items-center justify-between gap-2 px-4 py-2.5">
        {/* Logo Drink Fun (DF) */}
        <img
          src={LOGO_DRINKFUN}
          alt="Drink Fun (DF)"
          className="h-12 w-auto object-contain"
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

      {/* ¿Quién eres? (cuenta activa) + vista según permisos */}
      <div className="mx-auto flex max-w-2xl flex-col gap-2 px-4 pb-3">
        <div className="flex items-center gap-2">
          <span className="shrink-0 text-xs font-semibold uppercase tracking-wide text-marino/50">
            Entras como
          </span>
          <select
            value={usuarioId}
            onChange={(e) => setUsuario(e.target.value)}
            className="min-w-0 flex-1 rounded-lg border border-marino/15 bg-white px-2 py-2 text-sm font-semibold text-marino outline-none"
          >
            <optgroup label="Equipo">
              {STAFF.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nombre} — {ETIQUETA_TIPO[c.tipo] || 'Equipo'}
                </option>
              ))}
            </optgroup>
            <optgroup label="Clientes">
              {CLIENTES_CTA.map((c) => (
                <option key={c.id} value={c.id}>{c.nombre}</option>
              ))}
            </optgroup>
          </select>
        </div>

        {/* Selector de vista: solo si la cuenta tiene más de un rol */}
        {rolesDisponibles.length > 1 && (
          <div className="flex items-center gap-2">
            <span className="shrink-0 text-xs font-semibold uppercase tracking-wide text-marino/50">
              Ver como
            </span>
            <div className="flex flex-1 gap-1 rounded-xl bg-marino/5 p-1">
              {rolesDisponibles.map((rid) => {
                const info = ROL_INFO[rid]
                return (
                  <button
                    key={rid}
                    onClick={() => setRol(rid)}
                    className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-bold transition-all duration-100 ${
                      rol === rid
                        ? 'bg-gradient-to-b from-marino-light to-marino text-white shadow-[0_3px_0_#0e1620,0_5px_10px_rgba(14,22,32,0.3)]'
                        : 'text-marino/60 hover:bg-marino/5'
                    }`}
                  >
                    <Icon name={info.icon} className="h-4 w-4" strokeWidth={2} />
                    {info.nombre}
                  </button>
                )
              })}
            </div>
          </div>
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

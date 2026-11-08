import { useApp } from '../context/AppContext'

// Toasts flotantes (notificaciones simuladas al cambiar estados, etc.)
export default function Toasts() {
  const { toasts, cerrarToast } = useApp()

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-20 z-50 flex flex-col items-center gap-2 px-4">
      {toasts.map((t) => (
        <div
          key={t.id}
          className="pointer-events-auto flex w-full max-w-sm items-center gap-3 rounded-xl bg-marino px-4 py-3 text-sm text-white shadow-soft"
        >
          <span className="text-lg">🔔</span>
          <span className="flex-1">{t.mensaje}</span>
          <button
            onClick={() => cerrarToast(t.id)}
            className="text-white/60 hover:text-white"
            aria-label="Cerrar"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  )
}

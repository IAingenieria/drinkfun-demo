import { useEffect } from 'react'

export default function Modal({ open, onClose, title, children, footer }) {
  useEffect(() => {
    if (!open) return
    const onKey = (e) => e.key === 'Escape' && onClose?.()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative z-10 w-full max-w-md rounded-t-2xl bg-white p-5 shadow-soft sm:rounded-2xl max-h-[90vh] overflow-y-auto">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-lg font-bold text-marino">{title}</h3>
          <button
            onClick={onClose}
            className="rounded-full p-1 text-marino/50 hover:bg-marino/5"
            aria-label="Cerrar"
          >
            ✕
          </button>
        </div>
        <div>{children}</div>
        {footer && <div className="mt-4 flex gap-2">{footer}</div>}
      </div>
    </div>
  )
}

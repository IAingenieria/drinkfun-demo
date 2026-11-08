import { useState } from 'react'
import OfertaForm from '../components/OfertaForm'
import { getComprador } from '../services/dataService'
import { useApp } from '../context/AppContext'
import Icon from '../components/Icon'

// Vista sencilla para que el comprador publique una oferta nueva.
export default function Publicar() {
  const { compradorId } = useApp()
  const [open, setOpen] = useState(false)
  const comprador = getComprador(compradorId)

  return (
    <div className="px-4 py-6">
      <h1 className="text-xl font-extrabold text-marino">Publicar oferta</h1>
      <p className="mt-1 text-sm text-marino/50">
        Comparte un producto que encontraste en tienda para que los clientes lo pidan.
      </p>

      <div className="card mt-4 p-5 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-marino/5 text-marino/50">
          <Icon name="camera" className="h-8 w-8" />
        </div>
        <p className="mt-3 text-sm text-marino/70">
          Publicando como <span className="font-semibold text-marino">{comprador?.nombre}</span>
          {comprador?.zona ? ` · ${comprador.zona}` : ''}
        </p>
        <button onClick={() => setOpen(true)} className="btn-primary mt-4 w-full">
          <Icon name="plus" className="h-4 w-4" strokeWidth={2.2} />
          Nueva oferta
        </button>
      </div>

      <div className="mt-6 rounded-xl bg-marino/5 p-4 text-xs text-marino/60">
        Tip: toma la foto directo en el pasillo, pon precio de venta y elige la tienda.
        La oferta aparecerá en el Feed agrupada por el día de hoy.
      </div>

      <OfertaForm open={open} onClose={() => setOpen(false)} />
    </div>
  )
}

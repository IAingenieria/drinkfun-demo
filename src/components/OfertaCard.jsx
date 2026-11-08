import { useApp } from '../context/AppContext'
import { getTienda } from '../services/dataService'
import { money } from '../utils/format'
import { CATEGORIAS } from '../data/mockData'
import Icon from './Icon'

export default function OfertaCard({ oferta, onEdit, onDelete }) {
  const { rol, agregarAlCarrito, notificar } = useApp()
  const tienda = getTienda(oferta.tiendaId)
  const cat = CATEGORIAS.find((c) => c.id === oferta.categoria)

  const pedir = () => {
    agregarAlCarrito(oferta.id, 1)
    notificar(`"${oferta.titulo}" agregado al carrito`, 'ok')
  }

  return (
    <div className="card overflow-hidden">
      <div className="relative aspect-square w-full bg-marino/5">
        <img
          src={oferta.foto}
          alt={oferta.titulo}
          loading="lazy"
          className="h-full w-full object-cover"
        />
        {/* Etiqueta de tienda con punto de color */}
        <span
          className="absolute left-2 top-2 inline-flex items-center gap-1.5 rounded-full bg-white/95 px-2.5 py-1 text-xs font-semibold text-marino shadow-sm"
        >
          <span
            className="inline-block h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: tienda?.color }}
          />
          {tienda?.nombre}
        </span>
        <span className="absolute right-2 top-2 rounded-full bg-marino/80 px-2.5 py-1 text-xs font-medium text-white">
          {cat?.nombre}
        </span>
      </div>

      <div className="p-3">
        <h3 className="line-clamp-2 min-h-[2.5rem] text-sm font-semibold text-marino">
          {oferta.titulo}
        </h3>
        <div className="mt-1 flex items-center justify-between">
          <span className="text-lg font-extrabold text-acento">{money(oferta.precio)}</span>
        </div>

        {rol === 'cliente' && (
          <button onClick={pedir} className="btn-primary mt-2 w-full">
            <Icon name="cart" className="h-4 w-4" strokeWidth={2} />
            Pedir esto
          </button>
        )}

        {(rol === 'dueno' || rol === 'comprador') && (
          <div className="mt-2 flex gap-2">
            <button onClick={() => onEdit?.(oferta)} className="btn-outline flex-1 text-xs">
              <Icon name="pencil" className="h-4 w-4" />
              Editar
            </button>
            {rol === 'dueno' && (
              <button
                onClick={() => onDelete?.(oferta)}
                className="btn-outline text-xs text-acento"
                aria-label="Eliminar"
              >
                <Icon name="trash" className="h-4 w-4" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

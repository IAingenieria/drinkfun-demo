import { useState } from 'react'
import { useApp } from '../context/AppContext'
import { getOfertas, deleteOferta } from '../services/dataService'
import { TIENDAS, CATEGORIAS } from '../data/mockData'
import { fechaLarga, diaClave } from '../utils/format'
import OfertaCard from '../components/OfertaCard'
import OfertaForm from '../components/OfertaForm'
import Icon from '../components/Icon'

export default function Feed() {
  const { rol, tick, notificar } = useApp()
  const [tienda, setTienda] = useState(null)
  const [categoria, setCategoria] = useState(null)
  const [formOpen, setFormOpen] = useState(false)
  const [editar, setEditar] = useState(null)

  // tick fuerza recomputar cuando cambian los datos
  void tick
  const ofertas = getOfertas({ tiendaId: tienda, categoria })

  // Agrupar por día (historial navegable)
  const porDia = ofertas.reduce((acc, o) => {
    const d = diaClave(o.createdAt)
    ;(acc[d] = acc[d] || []).push(o)
    return acc
  }, {})
  const dias = Object.keys(porDia).sort((a, b) => (a < b ? 1 : -1))

  const abrirEditar = (of) => { setEditar(of); setFormOpen(true) }
  const abrirNueva = () => { setEditar(null); setFormOpen(true) }
  const borrar = (of) => {
    if (confirm(`¿Eliminar "${of.titulo}"?`)) {
      deleteOferta(of.id)
      notificar('Oferta eliminada', 'ok')
    }
  }

  return (
    <div className="px-4 py-3">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-extrabold text-marino">Ofertas</h1>
          <p className="text-xs text-marino/50">{ofertas.length} productos disponibles</p>
        </div>
        {(rol === 'dueno' || rol === 'comprador') && (
          <button onClick={abrirNueva} className="btn-accent text-xs">
            <Icon name="plus" className="h-4 w-4" strokeWidth={2.2} />
            Publicar
          </button>
        )}
      </div>

      {/* Filtros por tienda */}
      <div className="no-scrollbar -mx-4 mb-2 flex gap-2 overflow-x-auto px-4 pb-1">
        <FiltroChip activo={!tienda} onClick={() => setTienda(null)} label="Todas" />
        {TIENDAS.map((t) => (
          <FiltroChip
            key={t.id}
            activo={tienda === t.id}
            onClick={() => setTienda(t.id === tienda ? null : t.id)}
            label={t.nombre}
            dot={t.color}
          />
        ))}
      </div>

      {/* Filtros por categoría */}
      <div className="no-scrollbar -mx-4 mb-4 flex gap-2 overflow-x-auto px-4 pb-1">
        <FiltroChip activo={!categoria} onClick={() => setCategoria(null)} label="Todo" small />
        {CATEGORIAS.map((c) => (
          <FiltroChip
            key={c.id}
            activo={categoria === c.id}
            onClick={() => setCategoria(c.id === categoria ? null : c.id)}
            label={c.nombre}
            small
          />
        ))}
      </div>

      {ofertas.length === 0 && (
        <p className="py-12 text-center text-sm text-marino/40">
          No hay ofertas con esos filtros.
        </p>
      )}

      {/* Historial agrupado por día */}
      {dias.map((dia) => (
        <section key={dia} className="mb-5">
          <div className="mb-2 flex items-center gap-2">
            <span className="h-px flex-1 bg-marino/10" />
            <span className="text-xs font-semibold uppercase tracking-wide text-marino/50">
              {fechaLarga(dia)}
            </span>
            <span className="h-px flex-1 bg-marino/10" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            {porDia[dia].map((o) => (
              <OfertaCard key={o.id} oferta={o} onEdit={abrirEditar} onDelete={borrar} />
            ))}
          </div>
        </section>
      ))}

      <OfertaForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        ofertaEdit={editar}
      />
    </div>
  )
}

function FiltroChip({ activo, onClick, label, small, dot }) {
  return (
    <button
      onClick={onClick}
      className={`chip whitespace-nowrap border transition ${
        small ? 'text-[11px]' : 'text-xs'
      } ${
        activo
          ? 'border-marino bg-marino text-white shadow-[0_2px_0_#101a3c]'
          : 'border-marino/15 bg-white text-marino/70'
      }`}
    >
      {dot && (
        <span
          className="mr-1 inline-block h-2 w-2 rounded-full"
          style={{ backgroundColor: dot }}
        />
      )}
      {label}
    </button>
  )
}

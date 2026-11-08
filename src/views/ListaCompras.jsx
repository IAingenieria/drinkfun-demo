import { useApp } from '../context/AppContext'
import {
  getPedidos, getComprador, getTienda, updateItemPedido, getCliente,
} from '../services/dataService'
import { ItemBadge } from '../components/StatusBadge'
import Icon from '../components/Icon'

// ============================================================================
// Lista consolidada del comprador (ej: Olga).
// Junta TODOS los pedidos activos asignados a este comprador y suma las
// cantidades del MISMO producto, agrupando por tienda.
// Cada línea tiene checkboxes: comprado / agotado / sustituido, que
// actualizan el/los pedido(s) subyacentes.
// ============================================================================

const ESTADOS_ACTIVOS = ['solicitado', 'comprado', 'en_camino']

export default function ListaCompras() {
  const { compradorId, tick, notificar } = useApp()
  void tick
  const comprador = getComprador(compradorId)

  // Pedidos activos de este comprador
  const pedidos = getPedidos().filter(
    (p) => p.compradorId === compradorId && ESTADOS_ACTIVOS.includes(p.estado),
  )

  // Consolidar por tienda -> por oferta
  // linea: { ofertaId, titulo, foto, cantidad, estados[], refs:[{pedidoId, clienteId}] }
  const porTienda = {}
  pedidos.forEach((p) => {
    p.items.forEach((it) => {
      const tid = it.tiendaId
      porTienda[tid] = porTienda[tid] || {}
      const bucket = porTienda[tid]
      if (!bucket[it.ofertaId]) {
        bucket[it.ofertaId] = {
          ofertaId: it.ofertaId,
          titulo: it.titulo,
          foto: it.foto,
          cantidad: 0,
          estados: [],
          refs: [],
        }
      }
      const l = bucket[it.ofertaId]
      l.cantidad += it.cantidad
      l.estados.push(it.estadoItem)
      l.refs.push({ pedidoId: p.id, clienteId: p.clienteId, cantidad: it.cantidad })
    })
  })

  const tiendas = Object.keys(porTienda)

  const setEstadoLinea = (linea, estado) => {
    linea.refs.forEach((r) => updateItemPedido(r.pedidoId, linea.ofertaId, { estadoItem: estado }))
    notificar(`${linea.titulo}: marcado como ${estado}`, 'ok')
  }

  const estadoConsolidado = (estados) => {
    const unicos = [...new Set(estados)]
    return unicos.length === 1 ? unicos[0] : 'pendiente'
  }

  const totalItems = tiendas.reduce(
    (s, t) => s + Object.values(porTienda[t]).reduce((a, l) => a + l.cantidad, 0),
    0,
  )

  if (tiendas.length === 0) {
    return (
      <div className="px-4 py-20 text-center">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-marino/5 text-marino/40">
          <Icon name="checklist" className="h-10 w-10" />
        </div>
        <p className="mt-4 text-sm text-marino/50">
          {comprador?.nombre}, no tienes compras pendientes asignadas.
        </p>
      </div>
    )
  }

  return (
    <div className="px-4 py-3">
      <h1 className="text-xl font-extrabold text-marino">Lista de compras</h1>
      <p className="mb-4 text-sm text-marino/60">
        <span className="font-semibold text-marino">{comprador?.nombre}</span> · {totalItems} artículos en {tiendas.length} tienda(s)
      </p>

      {tiendas.map((tid) => {
        const tienda = getTienda(tid)
        const lineas = Object.values(porTienda[tid])
        const hechos = lineas.filter((l) => estadoConsolidado(l.estados) !== 'pendiente').length
        return (
          <section key={tid} className="mb-5">
            <div
              className="mb-2 flex items-center justify-between rounded-xl px-3 py-2.5 text-white shadow-soft"
              style={{ backgroundColor: tienda?.color }}
            >
              <span className="font-bold tracking-wide">{tienda?.nombre}</span>
              <span className="text-xs opacity-90">{hechos}/{lineas.length} resueltos</span>
            </div>

            <div className="space-y-2">
              {lineas.map((l) => {
                const est = estadoConsolidado(l.estados)
                const clientes = [...new Set(l.refs.map((r) => getCliente(r.clienteId)?.nombre))]
                return (
                  <div key={l.ofertaId} className="card p-3">
                    <div className="flex items-center gap-3">
                      <img src={l.foto} alt="" className="h-12 w-12 rounded-lg object-cover" />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-marino">
                          <span className="text-acento">{l.cantidad}×</span> {l.titulo}
                        </p>
                        <p className="truncate text-[11px] text-marino/50">
                          Para: {clientes.join(', ')}
                        </p>
                      </div>
                      <ItemBadge estado={est} />
                    </div>

                    {/* Checkboxes de acción */}
                    <div className="mt-2 grid grid-cols-3 gap-1.5">
                      <AccionBtn
                        activo={est === 'comprado'}
                        onClick={() => setEstadoLinea(l, 'comprado')}
                        color="green"
                        label="Comprado"
                      />
                      <AccionBtn
                        activo={est === 'agotado'}
                        onClick={() => setEstadoLinea(l, 'agotado')}
                        color="red"
                        label="Agotado"
                      />
                      <AccionBtn
                        activo={est === 'sustituido'}
                        onClick={() => setEstadoLinea(l, 'sustituido')}
                        color="amber"
                        label="Sustituido"
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </section>
        )
      })}
    </div>
  )
}

const COLORES = {
  green: 'border-green-500 bg-green-50 text-green-700',
  red: 'border-red-500 bg-red-50 text-red-700',
  amber: 'border-amber-500 bg-amber-50 text-amber-700',
}

function AccionBtn({ activo, onClick, color, label }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-lg border px-1 py-1.5 text-[11px] font-semibold transition ${
        activo ? COLORES[color] : 'border-marino/15 bg-white text-marino/50'
      }`}
    >
      {label}
    </button>
  )
}

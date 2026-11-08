import { useApp } from '../context/AppContext'
import { getPedidos, getTienda, getDomicilio, totalVenta, totalAbonado, saldoPedido } from '../services/dataService'
import { enlaceMapa } from '../utils/evidencia'
import { EstadoBadge, ItemBadge } from '../components/StatusBadge'
import Icon from '../components/Icon'
import { money, fechaCorta } from '../utils/format'
import { ESTADOS_PEDIDO } from '../data/mockData'

// Barra de progreso de estados del pedido
function Progreso({ estado }) {
  const idx = ESTADOS_PEDIDO.indexOf(estado)
  return (
    <div className="mt-3 flex items-center">
      {ESTADOS_PEDIDO.map((e, i) => (
        <div key={e} className="flex flex-1 items-center last:flex-none">
          <div
            className={`flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-bold ${
              i <= idx ? 'bg-marino text-white' : 'bg-marino/10 text-marino/40'
            }`}
          >
            {i < idx ? <Icon name="check" className="h-3.5 w-3.5" strokeWidth={2.6} /> : i + 1}
          </div>
          {i < ESTADOS_PEDIDO.length - 1 && (
            <div className={`h-0.5 flex-1 ${i < idx ? 'bg-marino' : 'bg-marino/10'}`} />
          )}
        </div>
      ))}
    </div>
  )
}

export default function MisPedidos() {
  const { clienteId, tick } = useApp()
  void tick
  const pedidos = getPedidos({ clienteId })

  if (pedidos.length === 0) {
    return (
      <div className="px-4 py-20 text-center">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-marino/5 text-marino/40">
          <Icon name="box" className="h-10 w-10" />
        </div>
        <p className="mt-4 text-sm text-marino/50">Aún no tienes pedidos.</p>
      </div>
    )
  }

  return (
    <div className="px-4 py-3">
      <h1 className="mb-3 text-xl font-extrabold text-marino">Mis pedidos</h1>

      <div className="space-y-3">
        {pedidos.map((p) => {
          const comprados = p.items.filter((it) => it.estadoItem === 'comprado' || it.estadoItem === 'sustituido').length
          return (
            <div key={p.id} className="card p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-bold text-marino">{p.id}</p>
                  <p className="text-xs text-marino/50">Viaje: {fechaCorta(p.fechaViaje)}</p>
                </div>
                <EstadoBadge estado={p.estado} />
              </div>

              <Progreso estado={p.estado} />

              {/* Ítems: comprados vs faltantes */}
              <div className="mt-3 space-y-1.5">
                <p className="text-xs font-semibold uppercase tracking-wide text-marino/50">
                  Productos ({comprados}/{p.items.length} listos)
                </p>
                {p.items.map((it) => {
                  const tienda = getTienda(it.tiendaId)
                  return (
                    <div key={it.ofertaId} className="flex items-center gap-2 text-sm">
                      <img src={it.foto} alt="" className="h-8 w-8 rounded object-cover" />
                      <span className="flex-1 truncate text-marino">
                        {it.cantidad}× {it.titulo}
                      </span>
                      <span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: tienda?.color }} title={tienda?.nombre} />
                      <ItemBadge estado={it.estadoItem} />
                    </div>
                  )
                })}
              </div>

              {/* Resumen financiero del cliente */}
              <div className="mt-3 grid grid-cols-3 gap-2 rounded-lg bg-marino/5 p-2 text-center text-xs">
                <div>
                  <div className="text-marino/50">Total</div>
                  <div className="font-bold text-marino">{money(totalVenta(p))}</div>
                </div>
                <div>
                  <div className="text-marino/50">Abonado</div>
                  <div className="font-bold text-green-600">{money(totalAbonado(p))}</div>
                </div>
                <div>
                  <div className="text-marino/50">Saldo</div>
                  <div className="font-bold text-acento">{money(saldoPedido(p))}</div>
                </div>
              </div>

              {/* Domicilio de entrega */}
              {(() => {
                const dom = getDomicilio(p.clienteId, p.domicilioId)
                if (!dom) return null
                return (
                  <p className="mt-3 flex items-start gap-1.5 text-xs text-marino/60">
                    <Icon name="pin" className="mt-0.5 h-3.5 w-3.5 shrink-0 text-acento" />
                    <span>Entrega en <b className="text-marino">{dom.etiqueta}</b> · {dom.calle}{dom.ciudad ? `, ${dom.ciudad}` : ''}</span>
                  </p>
                )
              })()}

              {/* Evidencia de entrega (cuando ya se entregó) */}
              {p.entrega && (
                <div className="mt-3 rounded-lg border border-green-200 bg-green-50 p-3">
                  <p className="flex items-center gap-1.5 text-xs font-bold text-green-700">
                    <Icon name="check" className="h-4 w-4" strokeWidth={2.6} />
                    Entregado{p.entrega.firmante ? ` · recibió ${p.entrega.firmante}` : ''}
                  </p>
                  {p.entrega.ts && (
                    <p className="pl-5 text-[11px] text-green-700/70">{fechaCorta(p.entrega.ts)}</p>
                  )}
                  {(p.entrega.foto || p.entrega.firma) && (
                    <div className="mt-2 flex gap-2">
                      {p.entrega.foto && (
                        <img src={p.entrega.foto} alt="foto de entrega" className="h-20 w-20 rounded-lg object-cover ring-1 ring-green-200" />
                      )}
                      {p.entrega.firma && (
                        <img src={p.entrega.firma} alt="firma" className="h-20 w-28 rounded-lg bg-white object-contain ring-1 ring-green-200" />
                      )}
                    </div>
                  )}
                  {p.entrega.lat != null && (
                    <a href={enlaceMapa(p.entrega.lat, p.entrega.lng)} target="_blank" rel="noreferrer" className="mt-1 inline-block text-[11px] font-semibold text-green-700">
                      📍 Ver ubicación de la entrega
                    </a>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

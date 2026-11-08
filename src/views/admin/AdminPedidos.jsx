import { useState } from 'react'
import { useApp } from '../../context/AppContext'
import {
  getPedidos, getCliente, getComprador, setEstadoPedido,
  registrarTicket, updatePedido,
  totalVenta, costoCompra, utilidadPedido,
} from '../../services/dataService'
import { EstadoBadge } from '../../components/StatusBadge'
import Modal from '../../components/Modal'
import Icon from '../../components/Icon'
import { money, fechaCorta, LABEL_ESTADO } from '../../utils/format'
import { ESTADOS_PEDIDO } from '../../data/mockData'

export default function AdminPedidos() {
  const { tick, notificar } = useApp()
  const [filtro, setFiltro] = useState(null)
  const [ticketPedido, setTicketPedido] = useState(null)
  void tick

  const pedidos = getPedidos(filtro ? { estado: filtro } : {})

  const avanzarEstado = (p) => {
    const i = ESTADOS_PEDIDO.indexOf(p.estado)
    if (i >= ESTADOS_PEDIDO.length - 1) return
    const nuevo = ESTADOS_PEDIDO[i + 1]
    setEstadoPedido(p.id, nuevo)
    // Notificación simulada del cambio de estado (futuro: WhatsApp al cliente)
    const cli = getCliente(p.clienteId)
    notificar(`Pedido ${p.id} de ${cli?.nombre}: ${LABEL_ESTADO[nuevo]}`, 'ok')
  }

  return (
    <div className="px-4 py-3">
      <h1 className="mb-1 text-xl font-extrabold text-marino">Pedidos</h1>
      <p className="mb-3 text-xs text-marino/50">{pedidos.length} pedidos</p>

      {/* Filtro por estado */}
      <div className="no-scrollbar -mx-4 mb-4 flex gap-2 overflow-x-auto px-4">
        <Chip activo={!filtro} onClick={() => setFiltro(null)} label="Todos" />
        {ESTADOS_PEDIDO.map((e) => (
          <Chip key={e} activo={filtro === e} onClick={() => setFiltro(e)} label={LABEL_ESTADO[e]} />
        ))}
      </div>

      <div className="space-y-3">
        {pedidos.map((p) => {
          const cli = getCliente(p.clienteId)
          const comp = getComprador(p.compradorId)
          const util = utilidadPedido(p)
          return (
            <div key={p.id} className="card p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-bold text-marino">{p.id}</p>
                  <p className="flex items-center gap-1.5 text-xs text-marino/60">
                    <Icon name="user" className="h-3.5 w-3.5" /> {cli?.nombre}
                    <span className="text-marino/25">·</span>
                    <Icon name="briefcase" className="h-3.5 w-3.5" /> {comp?.nombre || '—'}
                  </p>
                  <p className="text-xs text-marino/50">Viaje: {fechaCorta(p.fechaViaje)}</p>
                </div>
                <EstadoBadge estado={p.estado} />
              </div>

              {/* Finanzas del pedido */}
              <div className="mt-3 grid grid-cols-4 gap-1 rounded-lg bg-marino/5 p-2 text-center text-[11px]">
                <Fin label="Venta" val={money(totalVenta(p))} />
                <Fin label="Compra" val={money(costoCompra(p))} />
                <Fin label="Comisión" val={money(p.comision)} />
                <Fin label="Utilidad" val={money(util)} accent />
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                {p.estado !== 'entregado' && (
                  <button onClick={() => avanzarEstado(p)} className="btn-primary flex-1 text-xs">
                    <Icon name="arrowRight" className="h-4 w-4" strokeWidth={2.2} />
                    Avanzar a {LABEL_ESTADO[ESTADOS_PEDIDO[ESTADOS_PEDIDO.indexOf(p.estado) + 1]]}
                  </button>
                )}
                <button onClick={() => setTicketPedido(p)} className="btn-outline text-xs">
                  <Icon name="receipt" className="h-4 w-4" />
                  Ticket / precio real
                </button>
              </div>

              {p.ticketFoto && (
                <div className="mt-2 flex items-center gap-2 text-xs text-green-600">
                  <img src={p.ticketFoto} alt="ticket" className="h-10 w-10 rounded object-cover" />
                  Ticket cargado · compra {money(p.precioCompraTotal)}
                </div>
              )}
            </div>
          )
        })}
      </div>

      <TicketModal
        pedido={ticketPedido}
        onClose={() => setTicketPedido(null)}
        onSave={(datos) => {
          registrarTicket(ticketPedido.id, datos)
          notificar(`Ticket registrado para ${ticketPedido.id}`, 'ok')
          setTicketPedido(null)
        }}
        onSaveItems={(items) => updatePedido(ticketPedido.id, { items })}
      />
    </div>
  )
}

function TicketModal({ pedido, onClose, onSave, onSaveItems }) {
  const [foto, setFoto] = useState(pedido?.ticketFoto || '')
  const [precio, setPrecio] = useState(pedido?.precioCompraTotal ?? '')
  const [items, setItems] = useState(pedido?.items || [])

  // Sincroniza cuando cambia el pedido seleccionado
  const [lastId, setLastId] = useState(pedido?.id)
  if (pedido && pedido.id !== lastId) {
    setLastId(pedido.id)
    setFoto(pedido.ticketFoto || '')
    setPrecio(pedido.precioCompraTotal ?? '')
    setItems(pedido.items)
  }

  if (!pedido) return null

  const onFile = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setFoto(reader.result) // base64 en localStorage (demo)
    reader.readAsDataURL(file)
  }

  const setPrecioItem = (ofertaId, val) => {
    const nuevos = items.map((it) =>
      it.ofertaId === ofertaId ? { ...it, precioCompraReal: Number(val) || 0 } : it,
    )
    setItems(nuevos)
    onSaveItems?.(nuevos)
  }

  return (
    <Modal
      open={!!pedido}
      onClose={onClose}
      title={`Ticket · ${pedido.id}`}
      footer={
        <>
          <button onClick={onClose} className="btn-outline flex-1">Cerrar</button>
          <button
            onClick={() => onSave({ ticketFoto: foto || null, precioCompraTotal: Number(precio) || 0 })}
            className="btn-primary flex-1"
          >
            Guardar ticket
          </button>
        </>
      }
    >
      <div className="space-y-3">
        <div>
          <label className="label">Foto del ticket</label>
          <input type="file" accept="image/*" capture="environment" onChange={onFile} className="text-sm" />
          {foto && <img src={foto} alt="ticket" className="mt-2 max-h-40 rounded-lg object-contain" />}
        </div>

        <div>
          <label className="label">Precio de compra real TOTAL (MXN)</label>
          <input
            type="number"
            value={precio}
            onChange={(e) => setPrecio(e.target.value)}
            className="input"
            placeholder="Ej: 1120"
          />
        </div>

        <div>
          <label className="label">O captura el precio real por producto</label>
          <div className="space-y-1.5">
            {items.map((it) => (
              <div key={it.ofertaId} className="flex items-center gap-2">
                <span className="flex-1 truncate text-xs text-marino">
                  {it.cantidad}× {it.titulo}
                </span>
                <input
                  type="number"
                  value={it.precioCompraReal ?? ''}
                  onChange={(e) => setPrecioItem(it.ofertaId, e.target.value)}
                  className="input w-24 py-1 text-sm"
                  placeholder="c/u"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </Modal>
  )
}

function Chip({ activo, onClick, label }) {
  return (
    <button
      onClick={onClick}
      className={`chip whitespace-nowrap border text-xs ${
        activo ? 'border-marino bg-marino text-white' : 'border-marino/15 bg-white text-marino/70'
      }`}
    >
      {label}
    </button>
  )
}

function Fin({ label, val, accent }) {
  return (
    <div>
      <div className="text-marino/50">{label}</div>
      <div className={`font-bold ${accent ? 'text-green-600' : 'text-marino'}`}>{val}</div>
    </div>
  )
}

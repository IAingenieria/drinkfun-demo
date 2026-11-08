import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { getOferta, getTienda, addPedido, getCliente } from '../services/dataService'
import { money } from '../utils/format'
import Icon from '../components/Icon'

export default function Carrito() {
  const {
    carrito, cambiarCantidad, quitarDelCarrito, vaciarCarrito,
    clienteId, notificar,
  } = useApp()
  const navigate = useNavigate()

  // Fecha del viaje por defecto: +2 días
  const en2dias = new Date(Date.now() + 2 * 86400000).toISOString().slice(0, 10)
  const [fechaViaje, setFechaViaje] = useState(en2dias)

  const lineas = carrito
    .map((i) => ({ ...i, oferta: getOferta(i.ofertaId) }))
    .filter((l) => l.oferta)

  const subtotal = lineas.reduce((s, l) => s + l.oferta.precio * l.cantidad, 0)
  const comision = lineas.length ? 10 : 0 // comisión demo fija por viaje (USD)
  const total = subtotal + comision

  const cliente = getCliente(clienteId)

  const confirmar = () => {
    if (lineas.length === 0) return
    const pedido = addPedido({
      clienteId,
      fechaViaje,
      comision,
      items: carrito.map((i) => ({ ofertaId: i.ofertaId, cantidad: i.cantidad })),
    })
    vaciarCarrito()
    notificar(`Pedido ${pedido.id} creado · estado: Solicitado`, 'ok')
    navigate('/mis-pedidos')
  }

  if (lineas.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center px-4 py-20 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-marino/5 text-marino/40">
          <Icon name="cart" className="h-10 w-10" />
        </div>
        <h1 className="mt-4 text-lg font-bold text-marino">Tu carrito está vacío</h1>
        <p className="mt-1 text-sm text-marino/50">Agrega ofertas desde el Feed.</p>
        <button onClick={() => navigate('/')} className="btn-primary mt-4">
          Ver ofertas
        </button>
      </div>
    )
  }

  return (
    <div className="px-4 py-3">
      <h1 className="mb-1 text-xl font-extrabold text-marino">Carrito</h1>
      <p className="mb-3 text-xs text-marino/50">
        Pedido para <span className="font-semibold text-marino">{cliente?.nombre}</span>
      </p>

      <div className="space-y-2">
        {lineas.map((l) => {
          const tienda = getTienda(l.oferta.tiendaId)
          return (
            <div key={l.ofertaId} className="card flex items-center gap-3 p-2">
              <img
                src={l.oferta.foto}
                alt={l.oferta.titulo}
                className="h-16 w-16 rounded-lg object-cover"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-marino">{l.oferta.titulo}</p>
                <p className="flex items-center gap-1.5 text-xs text-marino/50">
                  <span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: tienda?.color }} />
                  {tienda?.nombre}
                </p>
                <p className="text-sm font-bold text-acento">{money(l.oferta.precio)}</p>
              </div>
              <div className="flex flex-col items-center gap-1">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => cambiarCantidad(l.ofertaId, l.cantidad - 1)}
                    className="h-7 w-7 rounded-full bg-marino/10 font-bold text-marino"
                  >−</button>
                  <span className="w-5 text-center text-sm font-bold">{l.cantidad}</span>
                  <button
                    onClick={() => cambiarCantidad(l.ofertaId, l.cantidad + 1)}
                    className="h-7 w-7 rounded-full bg-marino/10 font-bold text-marino"
                  >+</button>
                </div>
                <button
                  onClick={() => quitarDelCarrito(l.ofertaId)}
                  className="text-[11px] text-acento"
                >Quitar</button>
              </div>
            </div>
          )
        })}
      </div>

      {/* Confirmación del viaje */}
      <div className="card mt-4 p-4">
        <label className="label">Fecha del viaje (cuándo se compra)</label>
        <input
          type="date"
          value={fechaViaje}
          onChange={(e) => setFechaViaje(e.target.value)}
          className="input"
        />

        <div className="mt-4 space-y-1 text-sm">
          <Row label="Subtotal productos" value={money(subtotal)} />
          <Row label="Comisión del viaje" value={money(comision)} />
          <div className="my-2 h-px bg-marino/10" />
          <Row label="Total a pagar" value={money(total)} bold />
        </div>

        <button onClick={confirmar} className="btn-primary mt-4 w-full">
          <Icon name="check" className="h-4 w-4" strokeWidth={2.4} />
          Confirmar pedido
        </button>
      </div>
    </div>
  )
}

function Row({ label, value, bold }) {
  return (
    <div className={`flex justify-between ${bold ? 'text-base font-extrabold text-marino' : 'text-marino/70'}`}>
      <span>{label}</span>
      <span className={bold ? 'text-acento' : ''}>{value}</span>
    </div>
  )
}

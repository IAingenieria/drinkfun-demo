import { useState } from 'react'
import { useApp } from '../../context/AppContext'
import {
  getPedidos, getCliente, totalVenta, costoCompra, utilidadPedido,
} from '../../services/dataService'
import { money, fechaCorta, diaClave } from '../../utils/format'

export default function AdminUtilidad() {
  const { tick } = useApp()
  void tick
  const [modo, setModo] = useState('dia') // 'dia' | 'cliente'
  const pedidos = getPedidos()

  // Totales globales
  const totVenta = pedidos.reduce((s, p) => s + totalVenta(p), 0)
  const totCompra = pedidos.reduce((s, p) => s + costoCompra(p), 0)
  const totUtil = pedidos.reduce((s, p) => s + utilidadPedido(p), 0)

  // Agrupar
  const grupos = {}
  pedidos.forEach((p) => {
    const key = modo === 'dia' ? diaClave(p.fechaViaje) : p.clienteId
    grupos[key] = grupos[key] || { venta: 0, compra: 0, util: 0, n: 0 }
    grupos[key].venta += totalVenta(p)
    grupos[key].compra += costoCompra(p)
    grupos[key].util += utilidadPedido(p)
    grupos[key].n += 1
  })
  const keys = Object.keys(grupos).sort((a, b) => (a < b ? 1 : -1))

  return (
    <div className="px-4 py-3">
      <h1 className="mb-3 text-xl font-extrabold text-marino">Utilidad</h1>

      {/* Tarjetas resumen */}
      <div className="grid grid-cols-3 gap-2">
        <Resumen label="Ventas" val={money(totVenta)} />
        <Resumen label="Compras" val={money(totCompra)} />
        <Resumen label="Utilidad" val={money(totUtil)} accent />
      </div>

      {/* Selector de agrupación */}
      <div className="my-4 flex gap-1 rounded-xl bg-marino/5 p-1">
        {[
          { id: 'dia', label: 'Por día' },
          { id: 'cliente', label: 'Por cliente' },
        ].map((m) => (
          <button
            key={m.id}
            onClick={() => setModo(m.id)}
            className={`flex-1 rounded-lg py-2 text-sm font-semibold transition ${
              modo === m.id ? 'bg-white text-marino shadow' : 'text-marino/50'
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        {keys.map((k) => {
          const g = grupos[k]
          const titulo = modo === 'dia' ? fechaCorta(k) : getCliente(k)?.nombre || k
          return (
            <div key={k} className="card p-3">
              <div className="mb-2 flex items-center justify-between">
                <span className="font-semibold text-marino">{titulo}</span>
                <span className="text-xs text-marino/50">{g.n} pedido(s)</span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <Mini label="Venta" val={money(g.venta)} />
                <Mini label="Compra" val={money(g.compra)} />
                <Mini label="Utilidad" val={money(g.util)} accent />
              </div>
              {/* Barra visual de utilidad vs venta */}
              <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-marino/10">
                <div
                  className="h-full bg-green-500"
                  style={{ width: `${g.venta ? Math.max(0, Math.min(100, (g.util / g.venta) * 100)) : 0}%` }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function Resumen({ label, val, accent }) {
  return (
    <div className={`card p-3 text-center ${accent ? 'ring-2 ring-green-500/30' : ''}`}>
      <div className="text-[11px] uppercase tracking-wide text-marino/50">{label}</div>
      <div className={`text-sm font-extrabold ${accent ? 'text-green-600' : 'text-marino'}`}>{val}</div>
    </div>
  )
}

function Mini({ label, val, accent }) {
  return (
    <div>
      <div className="text-marino/50">{label}</div>
      <div className={`font-bold ${accent ? 'text-green-600' : 'text-marino'}`}>{val}</div>
    </div>
  )
}

import { useState } from 'react'
import { useApp } from '../../context/AppContext'
import {
  getClientes, estadoCuentaCliente, addAbono,
  totalVenta, totalAbonado, saldoPedido,
} from '../../services/dataService'
import Modal from '../../components/Modal'
import { money, mxn, fechaCorta } from '../../utils/format'
import { TIPO_CAMBIO_MXN } from '../../data/mockData'

export default function AdminCuentas() {
  const { tick, notificar } = useApp()
  void tick
  const [abonoPara, setAbonoPara] = useState(null) // pedido
  const clientes = getClientes()

  const cuentas = clientes.map((c) => ({
    cliente: c,
    ...estadoCuentaCliente(c.id),
  }))

  const granTotal = cuentas.reduce((s, c) => s + c.total, 0)
  const granAbonado = cuentas.reduce((s, c) => s + c.abonado, 0)
  const granSaldo = granTotal - granAbonado

  return (
    <div className="px-4 py-3">
      <h1 className="mb-3 text-xl font-extrabold text-marino">Cuentas por cobrar</h1>

      <div className="grid grid-cols-3 gap-2">
        <Resumen label="Por cobrar" val={money(granTotal)} />
        <Resumen label="Cobrado" val={money(granAbonado)} accent="green" />
        <Resumen label="Saldo" val={money(granSaldo)} accent="red" />
      </div>

      <div className="mt-4 space-y-3">
        {cuentas.map(({ cliente, total, abonado, saldo, pedidos }) => (
          <div key={cliente.id} className="card p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold text-marino">{cliente.nombre}</p>
                <p className="text-xs text-marino/50">{cliente.ciudad} · {cliente.telefono}</p>
              </div>
              <div className="text-right">
                <div className="text-[11px] text-marino/50">Saldo</div>
                <div className={`text-lg font-extrabold ${saldo > 0 ? 'text-acento' : 'text-green-600'}`}>
                  {money(saldo)}
                </div>
              </div>
            </div>

            {/* Barra abonado / total */}
            <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-marino/10">
              <div
                className="h-full bg-green-500"
                style={{ width: `${total ? (abonado / total) * 100 : 0}%` }}
              />
            </div>
            <p className="mt-1 text-[11px] text-marino/50">
              Abonado {money(abonado)} de {money(total)}
            </p>

            {/* Pedidos del cliente con su saldo y sus abonos */}
            <div className="mt-3 space-y-2">
              {pedidos.map((p) => (
                <div key={p.id} className="rounded-lg bg-marino/5 px-2 py-1.5 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-marino">{p.id}</span>
                    <span className="text-marino/50">{fechaCorta(p.fechaViaje)}</span>
                    <span className="ml-auto text-marino/60">
                      Saldo {money(saldoPedido(p))}
                    </span>
                    <button
                      onClick={() => setAbonoPara(p)}
                      className="rounded-md bg-marino px-2 py-1 text-[11px] font-semibold text-white"
                    >
                      + Abono
                    </button>
                  </div>

                  {/* Historial de abonos con su moneda */}
                  {(p.abonos || []).length > 0 && (
                    <div className="mt-1.5 flex flex-wrap gap-1">
                      {p.abonos.map((a) => (
                        <span
                          key={a.id}
                          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${
                            a.moneda === 'MXN'
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-green-100 text-green-700'
                          }`}
                          title={a.moneda === 'MXN' ? `Pagado en pesos · TC ${a.tipoCambio}` : 'Pagado en dólares'}
                        >
                          {a.moneda === 'MXN'
                            ? `${mxn(a.monto)} ≈ ${money(a.montoUSD)}`
                            : money(a.montoUSD ?? a.monto)}
                          <span className="opacity-60">· {fechaCorta(a.fecha)}</span>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <AbonoModal
        pedido={abonoPara}
        onClose={() => setAbonoPara(null)}
        onSave={({ monto, moneda, tipoCambio, fecha }) => {
          addAbono(abonoPara.id, { monto, moneda, tipoCambio, fecha })
          const detalle =
            moneda === 'MXN'
              ? `${mxn(monto)} (≈ ${money(monto / tipoCambio)})`
              : money(monto)
          notificar(`Abono de ${detalle} registrado en ${abonoPara.id}`, 'ok')
          setAbonoPara(null)
        }}
      />
    </div>
  )
}

function AbonoModal({ pedido, onClose, onSave }) {
  const hoy = new Date().toISOString().slice(0, 10)
  const [monto, setMonto] = useState('')
  const [moneda, setMoneda] = useState('USD') // 'USD' | 'MXN'
  const [tipoCambio, setTipoCambio] = useState(TIPO_CAMBIO_MXN)
  const [fecha, setFecha] = useState(hoy)

  const [lastId, setLastId] = useState(pedido?.id)
  if (pedido && pedido.id !== lastId) {
    setLastId(pedido.id)
    setMonto('')
    setMoneda('USD')
    setTipoCambio(TIPO_CAMBIO_MXN)
    setFecha(hoy)
  }

  if (!pedido) return null

  const montoNum = Number(monto) || 0
  const tc = Number(tipoCambio) || 0
  // Equivalente en USD que se aplicará al saldo
  const equivUSD = moneda === 'MXN' && tc > 0 ? montoNum / tc : montoNum
  const saldoActual = saldoPedido(pedido)
  const saldoDespues = saldoActual - equivUSD
  const valido = montoNum > 0 && (moneda === 'USD' || tc > 0)

  return (
    <Modal
      open={!!pedido}
      onClose={onClose}
      title={`Registrar abono · ${pedido.id}`}
      footer={
        <>
          <button onClick={onClose} className="btn-outline flex-1">Cancelar</button>
          <button
            onClick={() => valido && onSave({ monto: montoNum, moneda, tipoCambio: tc, fecha })}
            className="btn-primary flex-1"
            disabled={!valido}
          >
            Guardar abono
          </button>
        </>
      }
    >
      <div className="space-y-3">
        <div className="rounded-lg bg-marino/5 p-3 text-sm">
          <div className="flex justify-between"><span className="text-marino/60">Total pedido</span><span className="font-bold text-marino">{money(totalVenta(pedido))}</span></div>
          <div className="flex justify-between"><span className="text-marino/60">Abonado</span><span className="font-bold text-green-600">{money(totalAbonado(pedido))}</span></div>
          <div className="flex justify-between"><span className="text-marino/60">Saldo</span><span className="font-bold text-acento">{money(saldoActual)}</span></div>
        </div>

        {/* Selector de moneda del pago */}
        <div>
          <label className="label">¿En qué moneda paga el cliente?</label>
          <div className="flex gap-1 rounded-xl bg-marino/5 p-1">
            {[
              { id: 'USD', label: 'Dólares (USD)' },
              { id: 'MXN', label: 'Pesos (MXN)' },
            ].map((m) => (
              <button
                key={m.id}
                onClick={() => setMoneda(m.id)}
                className={`flex-1 rounded-lg py-2 text-sm font-semibold transition ${
                  moneda === m.id ? 'bg-white text-marino shadow' : 'text-marino/50'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="label">Monto del abono ({moneda === 'MXN' ? 'pesos' : 'dólares'})</label>
          <input
            type="number"
            value={monto}
            onChange={(e) => setMonto(e.target.value)}
            className="input"
            placeholder={moneda === 'MXN' ? 'Ej: 555' : 'Ej: 30'}
            autoFocus
          />
        </div>

        {/* Tipo de cambio solo si paga en pesos */}
        {moneda === 'MXN' && (
          <div>
            <label className="label">Tipo de cambio (MXN por 1 USD)</label>
            <input
              type="number"
              step="0.01"
              value={tipoCambio}
              onChange={(e) => setTipoCambio(e.target.value)}
              className="input"
              placeholder="18.50"
            />
            <p className="mt-1 text-[11px] text-marino/50">
              {montoNum > 0 && tc > 0
                ? `${mxn(montoNum)} ÷ ${tc} = ${money(equivUSD)} que se aplican al saldo`
                : 'Se convierte a USD para descontarlo del saldo.'}
            </p>
          </div>
        )}

        {/* Vista previa del efecto en el saldo */}
        {montoNum > 0 && valido && (
          <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm">
            <div className="flex justify-between">
              <span className="text-marino/60">Se aplica al saldo</span>
              <span className="font-bold text-green-700">{money(equivUSD)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-marino/60">Saldo después</span>
              <span className={`font-bold ${saldoDespues > 0 ? 'text-acento' : 'text-green-700'}`}>
                {money(Math.max(0, saldoDespues))}
              </span>
            </div>
          </div>
        )}

        <div>
          <label className="label">Fecha</label>
          <input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} className="input" />
        </div>
      </div>
    </Modal>
  )
}

function Resumen({ label, val, accent }) {
  const color = accent === 'green' ? 'text-green-600' : accent === 'red' ? 'text-acento' : 'text-marino'
  return (
    <div className="card p-3 text-center">
      <div className="text-[11px] uppercase tracking-wide text-marino/50">{label}</div>
      <div className={`text-sm font-extrabold ${color}`}>{val}</div>
    </div>
  )
}

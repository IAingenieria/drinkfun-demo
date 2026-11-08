import { useRef, useState } from 'react'
import { useApp } from '../context/AppContext'
import {
  getPedidosPorEntregar, getCliente, getDomicilio, getTienda, registrarEntrega,
} from '../services/dataService'
import { enlaceMapa } from '../utils/evidencia'
import Modal from '../components/Modal'
import Icon from '../components/Icon'
import CapturaFoto from '../components/CapturaFoto'
import FirmaCanvas from '../components/FirmaCanvas'

export default function Entregas() {
  const { usuarioId, tick, notificar } = useApp()
  void tick
  const pendientes = getPedidosPorEntregar()

  const [entregando, setEntregando] = useState(null) // pedido en proceso de entrega
  const [foto, setFoto] = useState(null) // { dataUrl, lat, lng }
  const [firmante, setFirmante] = useState('')
  const [tieneFirma, setTieneFirma] = useState(false)
  const firmaRef = useRef(null)

  const abrir = (p) => {
    const cli = getCliente(p.clienteId)
    setEntregando(p)
    setFoto(null)
    setFirmante(cli?.nombre || '')
    setTieneFirma(false)
  }
  const cerrar = () => { setEntregando(null); setFoto(null); setFirmante(''); setTieneFirma(false) }

  // Luis: evidencia = foto O firma. Pedimos nombre + (foto o firma).
  const puedeConfirmar = firmante.trim().length > 1 && (!!foto?.dataUrl || tieneFirma)

  const confirmar = () => {
    if (!entregando || !puedeConfirmar) return
    const firma = firmaRef.current?.dataUrl() || null
    registrarEntrega(entregando.id, {
      foto: foto?.dataUrl || null,
      firma,
      lat: foto?.lat ?? null,
      lng: foto?.lng ?? null,
      firmante: firmante.trim(),
      registradaPor: usuarioId,
    })
    notificar(`Entrega registrada · ${entregando.id} · recibió ${firmante.trim()}`, 'ok')
    cerrar()
  }

  return (
    <div className="px-4 py-3">
      <h1 className="mb-1 text-xl font-extrabold text-marino">Entregas</h1>
      <p className="mb-3 text-xs text-marino/50">
        {pendientes.length} pedido{pendientes.length === 1 ? '' : 's'} por entregar
      </p>

      {pendientes.length === 0 && (
        <div className="px-4 py-16 text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-marino/5 text-marino/40">
            <Icon name="truck" className="h-10 w-10" />
          </div>
          <p className="mt-4 text-sm text-marino/50">No hay pedidos por entregar ahora.</p>
          <p className="text-xs text-marino/40">Aparecen aquí cuando pasan a “En camino”.</p>
        </div>
      )}

      <div className="space-y-3">
        {pendientes.map((p) => {
          const cli = getCliente(p.clienteId)
          const dom = getDomicilio(p.clienteId, p.domicilioId)
          return (
            <div key={p.id} className="card p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-bold text-marino">{p.id}</p>
                  <p className="flex items-center gap-1.5 text-xs text-marino/60">
                    <Icon name="user" className="h-3.5 w-3.5" /> {cli?.nombre}
                  </p>
                </div>
                <span className="chip bg-marino/10 text-marino">{p.items.length} productos</span>
              </div>

              {/* Domicilio de entrega */}
              <div className="mt-3 rounded-lg bg-marino/5 p-3">
                {dom ? (
                  <>
                    <p className="flex items-center gap-1.5 text-xs font-semibold text-marino">
                      <Icon name="pin" className="h-3.5 w-3.5 text-acento" /> {dom.etiqueta} · {dom.calle}
                    </p>
                    <p className="pl-5 text-xs text-marino/60">
                      {[dom.colonia, dom.ciudad].filter(Boolean).join(', ')}
                    </p>
                    {dom.referencia && <p className="pl-5 text-xs text-marino/50">Ref: {dom.referencia}</p>}
                    {dom.lat != null && (
                      <a href={enlaceMapa(dom.lat, dom.lng)} target="_blank" rel="noreferrer" className="ml-5 inline-block text-xs font-semibold text-acento">
                        Abrir en el mapa
                      </a>
                    )}
                  </>
                ) : (
                  <p className="text-xs font-semibold text-acento">⚠️ El cliente aún no eligió domicilio</p>
                )}
              </div>

              {/* Productos (resumen) */}
              <div className="mt-2 flex flex-wrap gap-1.5">
                {p.items.map((it) => {
                  const t = getTienda(it.tiendaId)
                  return (
                    <span key={it.ofertaId} className="inline-flex items-center gap-1 rounded-full bg-white px-2 py-0.5 text-[11px] text-marino/70 ring-1 ring-marino/10">
                      <span className="inline-block h-1.5 w-1.5 rounded-full" style={{ backgroundColor: t?.color }} />
                      {it.cantidad}× {it.titulo}
                    </span>
                  )
                })}
              </div>

              <button onClick={() => abrir(p)} className="btn-accent mt-3 w-full text-sm">
                <Icon name="camera" className="h-4 w-4" />
                Registrar entrega
              </button>
            </div>
          )
        })}
      </div>

      {/* Modal de evidencia */}
      <Modal
        open={!!entregando}
        onClose={cerrar}
        title={entregando ? `Entregar · ${entregando.id}` : ''}
        footer={
          <>
            <button onClick={cerrar} className="btn-outline flex-1">Cancelar</button>
            <button onClick={confirmar} disabled={!puedeConfirmar} className="btn-primary flex-1">
              <Icon name="check" className="h-4 w-4" strokeWidth={2.4} />
              Confirmar entrega
            </button>
          </>
        }
      >
        {entregando && (
          <div className="space-y-3">
            <p className="text-xs text-marino/60">
              Registra la evidencia de la entrega. Con una <b>foto</b> o la <b>firma</b> de quien recibe basta.
            </p>

            {/* Foto */}
            <div>
              <label className="label">Foto de la entrega</label>
              {foto?.dataUrl ? (
                <div className="space-y-2">
                  <img src={foto.dataUrl} alt="entrega" className="max-h-48 w-full rounded-lg object-contain ring-1 ring-marino/10" />
                  <div className="flex items-center justify-between text-[11px] text-marino/50">
                    <span>{foto.lat != null ? `📍 ${foto.lat.toFixed(5)}, ${foto.lng.toFixed(5)}` : 'Sin GPS'}</span>
                    <CapturaFoto onFoto={setFoto} label="Volver a tomar" className="text-xs font-semibold text-acento" />
                  </div>
                </div>
              ) : (
                <CapturaFoto onFoto={setFoto} label="Tomar foto con la cámara" />
              )}
            </div>

            {/* Quién recibe */}
            <div>
              <label className="label">Nombre de quien recibe</label>
              <input className="input" value={firmante} onChange={(e) => setFirmante(e.target.value)} placeholder="Nombre de quien recibe" />
            </div>

            {/* Firma */}
            <div>
              <div className="flex items-center justify-between">
                <label className="label">Firma de quien recibe</label>
                <button type="button" onClick={() => firmaRef.current?.limpiar()} className="mb-1 text-xs font-bold text-acento">
                  Limpiar
                </button>
              </div>
              <FirmaCanvas key={entregando.id} ref={firmaRef} onCambio={setTieneFirma} />
              <p className="mt-1 text-center text-[11px] text-marino/40">Firma con el dedo</p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

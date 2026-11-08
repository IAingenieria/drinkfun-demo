import { useState } from 'react'
import { useApp } from '../context/AppContext'
import {
  getDomicilios, addDomicilio, updateDomicilio, deleteDomicilio,
} from '../services/dataService'
import { obtenerGps, enlaceMapa } from '../utils/evidencia'
import Modal from '../components/Modal'
import Icon from '../components/Icon'

const vacio = { etiqueta: 'Casa', calle: '', colonia: '', ciudad: '', referencia: '', lat: null, lng: null }

export default function MisDomicilios() {
  const { clienteId, tick, notificar } = useApp()
  void tick
  const domicilios = getDomicilios(clienteId)

  const [form, setForm] = useState(null) // null = cerrado; objeto = editando/creando
  const [editId, setEditId] = useState(null)
  const [geoCargando, setGeoCargando] = useState(false)

  const abrirNuevo = () => { setForm({ ...vacio }); setEditId(null) }
  const abrirEditar = (d) => { setForm({ ...d }); setEditId(d.id) }
  const cerrar = () => { setForm(null); setEditId(null) }
  const set = (campo) => (e) => setForm((f) => ({ ...f, [campo]: e.target.value }))

  const usarUbicacion = async () => {
    setGeoCargando(true)
    const g = await obtenerGps()
    setGeoCargando(false)
    if (!g) {
      notificar('No se pudo obtener la ubicación (activa el GPS y da permiso)', 'error')
      return
    }
    setForm((f) => ({ ...f, lat: g.lat, lng: g.lng }))
    notificar('Ubicación capturada', 'ok')
  }

  const guardar = () => {
    if (!form.calle.trim()) { notificar('Escribe al menos la calle y número', 'error'); return }
    if (editId) {
      updateDomicilio(clienteId, editId, form)
      notificar('Domicilio actualizado', 'ok')
    } else {
      addDomicilio(clienteId, form)
      notificar('Domicilio agregado', 'ok')
    }
    cerrar()
  }

  const borrar = (d) => {
    if (confirm(`¿Eliminar el domicilio "${d.etiqueta}"?`)) {
      deleteDomicilio(clienteId, d.id)
      notificar('Domicilio eliminado', 'ok')
    }
  }

  return (
    <div className="px-4 py-3">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-extrabold text-marino">Mis domicilios</h1>
          <p className="text-xs text-marino/50">Donde quieres recibir tus pedidos</p>
        </div>
        <button onClick={abrirNuevo} className="btn-accent text-xs">
          <Icon name="plus" className="h-4 w-4" strokeWidth={2.2} />
          Agregar
        </button>
      </div>

      {domicilios.length === 0 && (
        <div className="px-4 py-16 text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-marino/5 text-marino/40">
            <Icon name="pin" className="h-10 w-10" />
          </div>
          <p className="mt-4 text-sm text-marino/50">Aún no tienes domicilios.</p>
          <button onClick={abrirNuevo} className="btn-primary mt-4">Agregar mi primer domicilio</button>
        </div>
      )}

      <div className="space-y-3">
        {domicilios.map((d) => (
          <div key={d.id} className="card p-4">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="chip bg-marino/10 text-marino">{d.etiqueta}</span>
                  {d.lat != null && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-green-600">
                      <Icon name="pin" className="h-3.5 w-3.5" /> Ubicación guardada
                    </span>
                  )}
                </div>
                <p className="mt-1.5 text-sm font-semibold text-marino">{d.calle}</p>
                <p className="text-xs text-marino/60">
                  {[d.colonia, d.ciudad].filter(Boolean).join(', ')}
                </p>
                {d.referencia && <p className="mt-1 text-xs text-marino/50">Ref: {d.referencia}</p>}
                {d.lat != null && (
                  <a href={enlaceMapa(d.lat, d.lng)} target="_blank" rel="noreferrer" className="mt-1 inline-block text-xs font-semibold text-acento">
                    Ver en el mapa
                  </a>
                )}
              </div>
              <div className="flex shrink-0 flex-col gap-1">
                <button onClick={() => abrirEditar(d)} className="rounded-lg p-2 text-marino/60 hover:bg-marino/5" aria-label="Editar">
                  <Icon name="pencil" className="h-4 w-4" />
                </button>
                <button onClick={() => borrar(d)} className="rounded-lg p-2 text-acento hover:bg-acento/10" aria-label="Eliminar">
                  <Icon name="trash" className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Modal
        open={!!form}
        onClose={cerrar}
        title={editId ? 'Editar domicilio' : 'Nuevo domicilio'}
        footer={
          <>
            <button onClick={cerrar} className="btn-outline flex-1">Cancelar</button>
            <button onClick={guardar} className="btn-primary flex-1">Guardar</button>
          </>
        }
      >
        {form && (
          <div className="space-y-3">
            <div>
              <label className="label">Etiqueta</label>
              <select className="input" value={form.etiqueta} onChange={set('etiqueta')}>
                <option>Casa</option>
                <option>Oficina</option>
                <option>Negocio</option>
                <option>Otro</option>
              </select>
            </div>
            <div>
              <label className="label">Calle y número</label>
              <input className="input" value={form.calle} onChange={set('calle')} placeholder="Ej: Río Nazas 123" autoFocus />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Colonia</label>
                <input className="input" value={form.colonia} onChange={set('colonia')} placeholder="Del Valle" />
              </div>
              <div>
                <label className="label">Ciudad</label>
                <input className="input" value={form.ciudad} onChange={set('ciudad')} placeholder="Monterrey" />
              </div>
            </div>
            <div>
              <label className="label">Referencias (para encontrar la casa)</label>
              <input className="input" value={form.referencia} onChange={set('referencia')} placeholder="Portón negro, timbre a la derecha" />
            </div>

            <button type="button" onClick={usarUbicacion} disabled={geoCargando} className="btn-outline w-full text-sm">
              <Icon name="pin" className="h-4 w-4" />
              {geoCargando ? 'Obteniendo ubicación…' : form.lat != null ? 'Ubicación capturada ✓ (volver a capturar)' : 'Usar mi ubicación (GPS)'}
            </button>
            {form.lat != null && (
              <p className="text-center text-[11px] text-marino/50">
                {form.lat.toFixed(5)}, {form.lng.toFixed(5)}
              </p>
            )}
          </div>
        )}
      </Modal>
    </div>
  )
}

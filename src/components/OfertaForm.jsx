import { useState } from 'react'
import Modal from './Modal'
import CapturaFoto from './CapturaFoto'
import { CATEGORIAS } from '../data/mockData'
import { addOferta, updateOferta, getTiendas, addTienda } from '../services/dataService'
import { useApp } from '../context/AppContext'

const vacia = {
  titulo: '', precio: '', tiendaId: 'target', categoria: 'mochilas',
  foto: '', descripcion: '',
}

// Formulario reutilizable para publicar / editar una oferta.
export default function OfertaForm({ open, onClose, ofertaEdit = null }) {
  const { notificar, compradorId, tick } = useApp()
  const [form, setForm] = useState(ofertaEdit || vacia)

  // tick refresca la lista de tiendas cuando se agrega una nueva
  void tick
  const tiendas = getTiendas()

  // Mini-formulario para dar de alta una tienda sin salir de aquí
  const [nuevaTienda, setNuevaTienda] = useState(null) // null = oculto
  const guardarTienda = () => {
    const creada = addTienda({
      nombre: nuevaTienda.nombre,
      color: nuevaTienda.color,
    })
    if (!creada) {
      notificar('Escribe el nombre de la tienda', 'error')
      return
    }
    // Deja seleccionada la tienda recién creada y cierra el mini-form
    setForm((f) => ({ ...f, tiendaId: creada.id }))
    setNuevaTienda(null)
    notificar(`Tienda "${creada.nombre}" agregada`, 'ok')
  }

  // Reinicia el formulario cada vez que cambia la oferta a editar
  const key = ofertaEdit?.id || 'nueva'
  const [lastKey, setLastKey] = useState(key)
  if (lastKey !== key) {
    setForm(ofertaEdit || vacia)
    setLastKey(key)
  }

  const set = (campo) => (e) => setForm((f) => ({ ...f, [campo]: e.target.value }))

  const guardar = () => {
    if (!form.titulo || !form.precio) {
      notificar('Falta título o precio', 'error')
      return
    }
    const payload = {
      titulo: form.titulo,
      precio: Number(form.precio),
      tiendaId: form.tiendaId,
      categoria: form.categoria,
      // Si no hay foto, usa un placeholder por seed del título
      foto: form.foto || `https://picsum.photos/seed/${encodeURIComponent(form.titulo)}/500/500`,
      descripcion: form.descripcion,
      publicadoPor: compradorId,
    }
    if (ofertaEdit) {
      updateOferta(ofertaEdit.id, payload)
      notificar('Oferta actualizada', 'ok')
    } else {
      addOferta(payload)
      notificar('Oferta publicada', 'ok')
    }
    onClose()
    if (!ofertaEdit) setForm(vacia)
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={ofertaEdit ? 'Editar oferta' : 'Publicar oferta'}
      footer={
        <>
          <button onClick={onClose} className="btn-outline flex-1">Cancelar</button>
          <button onClick={guardar} className="btn-primary flex-1">Guardar</button>
        </>
      }
    >
      <div className="space-y-3">
        <div>
          <label className="label">Título</label>
          <input className="input" value={form.titulo} onChange={set('titulo')} placeholder="Ej: Shampoo Herbal" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Precio de venta (MXN)</label>
            <input className="input" type="number" value={form.precio} onChange={set('precio')} placeholder="180" />
          </div>
          <div>
            <label className="label">Categoría</label>
            <select className="input" value={form.categoria} onChange={set('categoria')}>
              {CATEGORIAS.map((c) => (
                <option key={c.id} value={c.id}>{c.nombre}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between">
            <label className="label">Tienda</label>
            <button
              type="button"
              onClick={() =>
                setNuevaTienda(nuevaTienda ? null : { nombre: '', color: '#F23A4A' })
              }
              className="mb-1 text-xs font-bold text-acento"
            >
              {nuevaTienda ? 'Cancelar' : '+ Nueva tienda'}
            </button>
          </div>
          <select className="input" value={form.tiendaId} onChange={set('tiendaId')}>
            {tiendas.map((t) => (
              <option key={t.id} value={t.id}>{t.nombre}</option>
            ))}
          </select>

          {nuevaTienda && (
            <div className="mt-2 rounded-xl border border-marino/15 bg-marino/5 p-3">
              <label className="label">Nombre de la tienda</label>
              <div className="flex items-center gap-2">
                <input
                  className="input flex-1"
                  value={nuevaTienda.nombre}
                  onChange={(e) =>
                    setNuevaTienda((n) => ({ ...n, nombre: e.target.value }))
                  }
                  placeholder="Ej: Costco, Best Buy, Amazon USA"
                  autoFocus
                />
                <input
                  type="color"
                  value={nuevaTienda.color}
                  onChange={(e) =>
                    setNuevaTienda((n) => ({ ...n, color: e.target.value }))
                  }
                  className="h-10 w-12 shrink-0 cursor-pointer rounded-lg border border-marino/15 bg-white"
                  title="Color de la tienda"
                />
              </div>
              <button
                type="button"
                onClick={guardarTienda}
                className="btn-accent mt-2 w-full text-xs"
              >
                Agregar tienda
              </button>
            </div>
          )}
        </div>

        <div>
          <label className="label">Foto del producto</label>
          {form.foto && (
            <img
              src={form.foto}
              alt="producto"
              className="mb-2 max-h-44 w-full rounded-lg bg-white object-contain ring-1 ring-marino/10"
            />
          )}
          <div className="flex gap-2">
            <CapturaFoto
              onFoto={({ dataUrl }) => dataUrl && setForm((f) => ({ ...f, foto: dataUrl }))}
              label={form.foto ? 'Tomar otra' : 'Tomar foto con la cámara'}
              className="btn-outline flex-1 text-sm"
            />
            {form.foto && (
              <button type="button" onClick={() => setForm((f) => ({ ...f, foto: '' }))} className="btn-outline text-sm text-acento">
                Quitar
              </button>
            )}
          </div>
          <input
            className="input mt-2"
            value={form.foto.startsWith('data:') ? '' : form.foto}
            onChange={set('foto')}
            placeholder="o pega una URL de imagen (opcional)"
          />
        </div>

        <div>
          <label className="label">Descripción</label>
          <textarea className="input" rows={2} value={form.descripcion} onChange={set('descripcion')} />
        </div>
      </div>
    </Modal>
  )
}

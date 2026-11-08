import { useState } from 'react'
import Modal from './Modal'
import { TIENDAS, CATEGORIAS } from '../data/mockData'
import { addOferta, updateOferta } from '../services/dataService'
import { useApp } from '../context/AppContext'

const vacia = {
  titulo: '', precio: '', tiendaId: 'target', categoria: 'mochilas',
  foto: '', descripcion: '',
}

// Formulario reutilizable para publicar / editar una oferta.
export default function OfertaForm({ open, onClose, ofertaEdit = null }) {
  const { notificar, compradorId } = useApp()
  const [form, setForm] = useState(ofertaEdit || vacia)

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
          <label className="label">Tienda</label>
          <select className="input" value={form.tiendaId} onChange={set('tiendaId')}>
            {TIENDAS.map((t) => (
              <option key={t.id} value={t.id}>{t.nombre}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="label">Foto (URL opcional)</label>
          <input className="input" value={form.foto} onChange={set('foto')} placeholder="https://... (si se deja vacío se genera una)" />
        </div>

        <div>
          <label className="label">Descripción</label>
          <textarea className="input" rows={2} value={form.descripcion} onChange={set('descripcion')} />
        </div>
      </div>
    </Modal>
  )
}

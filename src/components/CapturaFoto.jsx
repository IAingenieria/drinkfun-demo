import { useRef } from 'react'
import { obtenerGps, comprimirImagenDataUrl } from '../utils/evidencia'
import Icon from './Icon'

// ============================================================================
// CapturaFoto — abre la CÁMARA REAL (no galería) y entrega la foto + GPS.
// Regla crítica de iOS (de ZAZ): el click al input va EN EL MISMO TOQUE,
// síncrono, sin await antes. El GPS se pide en paralelo y se espera al llegar
// la foto. La imagen se comprime a 1400px/JPEG 0.72 y se devuelve como dataURL.
//   onFoto({ dataUrl, lat, lng })
// ============================================================================

export default function CapturaFoto({ onFoto, label = 'Tomar foto', className = '' }) {
  const inputRef = useRef(null)
  const gpsRef = useRef(null)

  const abrir = () => {
    // GPS en paralelo, SIN await (iOS ignora el click al input si llega después).
    gpsRef.current = obtenerGps()
    // Cámara en el MISMO gesto síncrono.
    inputRef.current?.click()
  }

  const onChange = async (e) => {
    const file = e.target.files?.[0]
    e.target.value = '' // permite volver a tomar la misma foto
    if (!file) return
    const dataUrl = await comprimirImagenDataUrl(file)
    let gps = gpsRef.current ? await gpsRef.current : null
    gpsRef.current = null
    if (!gps) gps = await obtenerGps() // 2º intento si la cámara interrumpió al GPS
    onFoto?.({ dataUrl, lat: gps?.lat ?? null, lng: gps?.lng ?? null })
  }

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={onChange}
        className="hidden"
      />
      <button type="button" onClick={abrir} className={className || 'btn-outline w-full text-sm'}>
        <Icon name="camera" className="h-4 w-4" />
        {label}
      </button>
    </>
  )
}

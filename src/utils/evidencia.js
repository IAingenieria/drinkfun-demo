// ============================================================================
// evidencia.js — GPS y compresión de imagen para la evidencia de entrega.
// Patrón tomado de la app del chofer de ZAZ:
//  - GPS con getCurrentPosition (alta precisión, timeout 12s).
//  - Imagen comprimida a 1400px / JPEG 0.72 vía canvas antes de guardar.
// En el demo las imágenes se guardan como dataURL (base64) en localStorage.
// ============================================================================

// Devuelve {lat,lng,acc} o null si no se pudo (el demo NO bloquea por GPS).
export function obtenerGps() {
  return new Promise((resolve) => {
    if (!navigator.geolocation) return resolve(null)
    navigator.geolocation.getCurrentPosition(
      (p) => resolve({ lat: p.coords.latitude, lng: p.coords.longitude, acc: p.coords.accuracy }),
      () => resolve(null),
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 15000 },
    )
  })
}

// Comprime un File/Blob a máx `max` px (lado mayor) y JPEG `calidad`.
// Devuelve un dataURL (base64) o null si la imagen no se pudo leer.
export function comprimirImagenDataUrl(file, max = 1400, calidad = 0.72) {
  return new Promise((resolve) => {
    if (!file) return resolve(null)
    const img = new Image()
    img.onload = () => {
      let w = img.width
      let h = img.height
      if (w > max || h > max) {
        const esc = max / Math.max(w, h)
        w = Math.round(w * esc)
        h = Math.round(h * esc)
      }
      const c = document.createElement('canvas')
      c.width = w
      c.height = h
      c.getContext('2d').drawImage(img, 0, 0, w, h)
      URL.revokeObjectURL(img.src)
      try {
        resolve(c.toDataURL('image/jpeg', calidad))
      } catch {
        resolve(null)
      }
    }
    img.onerror = () => {
      URL.revokeObjectURL(img.src)
      resolve(null)
    }
    img.src = URL.createObjectURL(file)
  })
}

// Formatea una coordenada para mostrarla / enlazar a un mapa.
export function enlaceMapa(lat, lng) {
  if (lat == null || lng == null) return null
  return `https://www.google.com/maps?q=${lat},${lng}`
}

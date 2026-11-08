import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react'

// ============================================================================
// FirmaCanvas — firma del cliente con el dedo (canvas + Pointer Events).
// Patrón de ZAZ:
//  - touch-action:none  → el dedo dibuja en vez de hacer scroll.
//  - Pointer Events cubren dedo y mouse con una sola API.
//  - El canvas se mide DESPUÉS de ser visible (si está oculto mide 0).
//  - Densidad x2 para que se vea nítido en retina.
// Expone por ref: tieneTrazo(), dataUrl() (JPEG), limpiar().
// onCambio(bool) avisa cuando hay/deja de haber trazo (para habilitar botones).
// ============================================================================

const FirmaCanvas = forwardRef(function FirmaCanvas({ onCambio, alto = 220 }, ref) {
  const canvasRef = useRef(null)
  const trazoRef = useRef(false)
  const dibujandoRef = useRef(false)

  useEffect(() => {
    const cv = canvasRef.current
    if (!cv) return
    const ctx = cv.getContext('2d')

    const ajustar = () => {
      const r = cv.getBoundingClientRect()
      if (r.width === 0) return // aún oculto: no medir
      cv.width = r.width * 2
      cv.height = (r.height || alto) * 2
      ctx.scale(2, 2)
      ctx.lineWidth = 2.4
      ctx.lineCap = 'round'
      ctx.strokeStyle = '#0F172A'
      ctx.fillStyle = '#fff'
      ctx.fillRect(0, 0, cv.width, cv.height)
    }
    // Espera un frame a que el canvas sea visible y tenga tamaño
    const t = setTimeout(ajustar, 60)

    const pos = (e) => {
      const r = cv.getBoundingClientRect()
      return { x: e.clientX - r.left, y: e.clientY - r.top }
    }
    const onDown = (e) => {
      dibujandoRef.current = true
      if (!trazoRef.current) {
        trazoRef.current = true
        onCambio?.(true)
      }
      const p = pos(e)
      ctx.beginPath()
      ctx.moveTo(p.x, p.y)
      e.preventDefault()
    }
    const onMove = (e) => {
      if (!dibujandoRef.current) return
      const p = pos(e)
      ctx.lineTo(p.x, p.y)
      ctx.stroke()
      e.preventDefault()
    }
    const onUp = () => { dibujandoRef.current = false }

    cv.addEventListener('pointerdown', onDown)
    cv.addEventListener('pointermove', onMove)
    cv.addEventListener('pointerup', onUp)
    cv.addEventListener('pointerleave', onUp)
    return () => {
      clearTimeout(t)
      cv.removeEventListener('pointerdown', onDown)
      cv.removeEventListener('pointermove', onMove)
      cv.removeEventListener('pointerup', onUp)
      cv.removeEventListener('pointerleave', onUp)
    }
  }, [alto, onCambio])

  useImperativeHandle(ref, () => ({
    tieneTrazo: () => trazoRef.current,
    dataUrl: () => {
      const cv = canvasRef.current
      if (!cv || !trazoRef.current) return null
      try {
        return cv.toDataURL('image/jpeg', 0.8)
      } catch {
        return null
      }
    },
    limpiar: () => {
      const cv = canvasRef.current
      if (!cv) return
      const ctx = cv.getContext('2d')
      ctx.fillStyle = '#fff'
      ctx.fillRect(0, 0, cv.width, cv.height)
      trazoRef.current = false
      onCambio?.(false)
    },
  }))

  return (
    <canvas
      ref={canvasRef}
      className="block w-full rounded-lg border border-marino/20 bg-white"
      style={{ height: alto, touchAction: 'none' }}
    />
  )
})

export default FirmaCanvas

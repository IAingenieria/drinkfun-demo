// Etiqueta de tienda con punto de color de marca (reemplaza los emojis).
export default function StoreTag({ tienda, className = '', dark = false }) {
  if (!tienda) return null
  return (
    <span className={`inline-flex items-center gap-1.5 ${className}`}>
      <span
        className="inline-block h-2.5 w-2.5 rounded-full ring-1 ring-black/10"
        style={{ backgroundColor: tienda.color }}
      />
      <span className={dark ? 'text-white' : 'text-marino'}>{tienda.nombre}</span>
    </span>
  )
}

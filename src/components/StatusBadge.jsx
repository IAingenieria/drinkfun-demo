import { COLOR_ESTADO, COLOR_ITEM, LABEL_ESTADO, LABEL_ITEM } from '../utils/format'

export function EstadoBadge({ estado }) {
  return (
    <span className={`chip ${COLOR_ESTADO[estado] || 'bg-gray-100 text-gray-600'}`}>
      {LABEL_ESTADO[estado] || estado}
    </span>
  )
}

export function ItemBadge({ estado }) {
  return (
    <span className={`chip ${COLOR_ITEM[estado] || 'bg-gray-100 text-gray-600'}`}>
      {LABEL_ITEM[estado] || estado}
    </span>
  )
}

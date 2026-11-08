// ============================================================================
// dataService.js — ÚNICA CAPA DE DATOS de la app.
//
// Hoy: lee/escribe en localStorage (modo DEMO, sin base de datos).
//
// >>> PARA MIGRAR A BASEROW / SUPABASE MÁS ADELANTE <<<
// Solo hay que reimplementar las funciones de este archivo para que hagan
// fetch/insert/update contra la API real, respetando las MISMAS firmas y
// devolviendo las MISMAS formas de objeto. El resto de la app (vistas,
// componentes, contexto) NO se toca porque solo consume estas funciones.
//
// Sugerencia de migración:
//   - getOfertas()  ->  SELECT * FROM ofertas
//   - addPedido()   ->  INSERT INTO pedidos ...
//   - updatePedido()->  UPDATE pedidos SET ... WHERE id = ...
//   Las funciones pueden volverse async (devolver Promises) y las vistas ya
//   están escritas para tolerar eso (se usan con estado local + efectos).
// ============================================================================

import { SEED } from '../data/mockData'

// Nota: al cambiar el modelo de datos (precios USD, fotos, etc.) se sube la
// versión de la clave para que el demo se resiembre con los datos nuevos.
const KEY = 'deusa_demo_v6'

// ---------- Infraestructura de almacenamiento ----------

function loadDB() {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) {
      // Primera vez: sembrar con mockData
      localStorage.setItem(KEY, JSON.stringify(SEED))
      return structuredClone(SEED)
    }
    return JSON.parse(raw)
  } catch (e) {
    console.error('[dataService] Error leyendo DB, resembrando:', e)
    localStorage.setItem(KEY, JSON.stringify(SEED))
    return structuredClone(SEED)
  }
}

function saveDB(db) {
  localStorage.setItem(KEY, JSON.stringify(db))
  // Aviso a la app de que los datos cambiaron (para refrescar vistas)
  window.dispatchEvent(new CustomEvent('deusa:data-changed'))
}

function uid(prefix) {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`
}

// Reinicia el demo a los datos semilla (útil para pruebas)
export function resetDemo() {
  localStorage.removeItem(KEY)
  loadDB()
  window.dispatchEvent(new CustomEvent('deusa:data-changed'))
}

// ---------- Catálogos ----------

export function getTiendas() {
  return loadDB().tiendas
}

export function getCategorias() {
  return loadDB().categorias
}

export function getCompradores() {
  return loadDB().compradores
}

export function getClientes() {
  return loadDB().clientes
}

export function getCliente(id) {
  return loadDB().clientes.find((c) => c.id === id) || null
}

export function getTienda(id) {
  return loadDB().tiendas.find((t) => t.id === id) || null
}

export function getComprador(id) {
  return loadDB().compradores.find((c) => c.id === id) || null
}

// ---------- Ofertas ----------

export function getOfertas({ tiendaId = null, categoria = null } = {}) {
  let ofertas = loadDB().ofertas
  if (tiendaId) ofertas = ofertas.filter((o) => o.tiendaId === tiendaId)
  if (categoria) ofertas = ofertas.filter((o) => o.categoria === categoria)
  // Más recientes primero
  return [...ofertas].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
}

export function getOferta(id) {
  return loadDB().ofertas.find((o) => o.id === id) || null
}

export function addOferta(data) {
  const db = loadDB()
  const nueva = {
    id: uid('of'),
    createdAt: new Date().toISOString(),
    ...data,
  }
  db.ofertas.push(nueva)
  saveDB(db)
  return nueva
}

export function updateOferta(id, cambios) {
  const db = loadDB()
  const i = db.ofertas.findIndex((o) => o.id === id)
  if (i === -1) return null
  db.ofertas[i] = { ...db.ofertas[i], ...cambios }
  saveDB(db)
  return db.ofertas[i]
}

export function deleteOferta(id) {
  const db = loadDB()
  db.ofertas = db.ofertas.filter((o) => o.id !== id)
  saveDB(db)
}

// ---------- Pedidos ----------

export function getPedidos({ clienteId = null, estado = null } = {}) {
  let pedidos = loadDB().pedidos
  if (clienteId) pedidos = pedidos.filter((p) => p.clienteId === clienteId)
  if (estado) pedidos = pedidos.filter((p) => p.estado === estado)
  return [...pedidos].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
}

export function getPedido(id) {
  return loadDB().pedidos.find((p) => p.id === id) || null
}

// items: [{ofertaId, cantidad}] proveniente del carrito
export function addPedido({ clienteId, fechaViaje, items, compradorId = null, comision = 0 }) {
  const db = loadDB()
  const itemsExpandidos = items.map((it) => {
    const of = db.ofertas.find((o) => o.id === it.ofertaId)
    return {
      ofertaId: of.id,
      titulo: of.titulo,
      tiendaId: of.tiendaId,
      categoria: of.categoria,
      foto: of.foto,
      precioVenta: of.precio,
      cantidad: it.cantidad,
      estadoItem: 'pendiente',
      precioCompraReal: null,
    }
  })
  const nuevo = {
    id: uid('p'),
    clienteId,
    compradorId,
    fechaViaje,
    estado: 'solicitado',
    createdAt: new Date().toISOString(),
    items: itemsExpandidos,
    comision,
    precioCompraTotal: null,
    ticketFoto: null,
    abonos: [],
  }
  db.pedidos.push(nuevo)
  saveDB(db)
  return nuevo
}

export function updatePedido(id, cambios) {
  const db = loadDB()
  const i = db.pedidos.findIndex((p) => p.id === id)
  if (i === -1) return null
  db.pedidos[i] = { ...db.pedidos[i], ...cambios }
  saveDB(db)
  return db.pedidos[i]
}

// Cambia el estado global del pedido (solicitado -> comprado -> ...)
export function setEstadoPedido(id, estado) {
  return updatePedido(id, { estado })
}

// Actualiza un ítem específico dentro de un pedido (checkbox del comprador)
export function updateItemPedido(pedidoId, ofertaId, cambios) {
  const db = loadDB()
  const p = db.pedidos.find((x) => x.id === pedidoId)
  if (!p) return null
  p.items = p.items.map((it) =>
    it.ofertaId === ofertaId ? { ...it, ...cambios } : it,
  )
  saveDB(db)
  return p
}

// ---------- Tickets / utilidad ----------

export function registrarTicket(pedidoId, { ticketFoto, precioCompraTotal }) {
  return updatePedido(pedidoId, { ticketFoto, precioCompraTotal })
}

// ---------- Abonos / pagos ----------

// Registra un abono. El cliente puede pagar en USD o en PESOS (MXN).
// - moneda: 'USD' | 'MXN'
// - tipoCambio: MXN por 1 USD (solo aplica si moneda === 'MXN')
// El saldo del pedido está en USD, así que siempre se guarda el equivalente
// en dólares (montoUSD) para descontarlo correctamente.
export function addAbono(pedidoId, { monto, moneda = 'USD', tipoCambio = null, fecha }) {
  const db = loadDB()
  const p = db.pedidos.find((x) => x.id === pedidoId)
  if (!p) return null
  const montoNum = Number(monto)
  const tc = Number(tipoCambio)
  const montoUSD =
    moneda === 'MXN' && tc > 0 ? Number((montoNum / tc).toFixed(2)) : montoNum
  p.abonos = p.abonos || []
  p.abonos.push({
    id: uid('ab'),
    monto: montoNum,
    moneda,
    tipoCambio: moneda === 'MXN' ? tc : null,
    montoUSD,
    fecha,
  })
  saveDB(db)
  return p
}

// ============================================================================
// Helpers de negocio (cálculos) — puros, no tocan almacenamiento.
// ============================================================================

// Total de venta del pedido (lo que paga el cliente): items + comisión
export function totalVenta(pedido) {
  const items = pedido.items.reduce(
    (s, it) => s + it.precioVenta * it.cantidad,
    0,
  )
  return items + (pedido.comision || 0)
}

// Total ya abonado por el cliente en ese pedido, SIEMPRE en USD.
// Usa montoUSD (equivalente convertido); si un abono viejo no lo tiene,
// cae al monto original (compatibilidad).
export function totalAbonado(pedido) {
  return (pedido.abonos || []).reduce((s, a) => s + (a.montoUSD ?? a.monto), 0)
}

// Saldo pendiente del pedido
export function saldoPedido(pedido) {
  return totalVenta(pedido) - totalAbonado(pedido)
}

// Costo real de compra (del ticket, o suma de precios por ítem si no hay total)
export function costoCompra(pedido) {
  if (pedido.precioCompraTotal != null) return pedido.precioCompraTotal
  return pedido.items.reduce(
    (s, it) => s + (it.precioCompraReal || 0) * it.cantidad,
    0,
  )
}

// Utilidad = precio_venta - precio_compra - comisión NO...
// Nota de negocio: la comisión es GANANCIA del dueño, no un costo.
// Utilidad del dueño = (venta de items - costo de compra) + comisión.
export function utilidadPedido(pedido) {
  const ventaItems = pedido.items.reduce(
    (s, it) => s + it.precioVenta * it.cantidad,
    0,
  )
  return ventaItems - costoCompra(pedido) + (pedido.comision || 0)
}

// Estado de cuenta consolidado por cliente
export function estadoCuentaCliente(clienteId) {
  const pedidos = getPedidos({ clienteId })
  const total = pedidos.reduce((s, p) => s + totalVenta(p), 0)
  const abonado = pedidos.reduce((s, p) => s + totalAbonado(p), 0)
  return { total, abonado, saldo: total - abonado, pedidos }
}

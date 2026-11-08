// ============================================================================
// mockData.js — Datos semilla del DEMO (NO es una base de datos).
// Se cargan en localStorage la primera vez (ver dataService.js).
//
// IMÁGENES: fotos reales de producto alojadas en Cloudinary (CDN estable),
// proporcionadas para el demo. Con 9 fotos únicas para 12 productos, casi
// todos tienen foto propia (3 se reutilizan de forma coherente por tipo).
//
// PRECIOS: en dólares (USD), realistas para tiendas de USA.
// ============================================================================

// ---- Fotos reales (Cloudinary) ----
const IMG = {
  mochilaCristal: 'https://res.cloudinary.com/mrjrjenc/image/upload/v1785051717/GUEST_ae98370b-1a2d-490d-93f9-f16a818c5b28_dhyyuq.webp',
  mochilaAzul: 'https://res.cloudinary.com/mrjrjenc/image/upload/v1785051655/GUEST_c343bbfd-6e4b-40df-bf56-4dad88dc763e_glbu2v.jpg',
  termoStanley: 'https://res.cloudinary.com/mrjrjenc/image/upload/v1785051612/GUEST_e88b0e32-54a3-4fad-a81c-7a2fe8d6680c_g7qmg0.jpg',
  blusaRoja: 'https://res.cloudinary.com/mrjrjenc/image/upload/v1785051573/GUEST_6c62e434-79ea-4482-967e-2ca6347f583a_zmhfax.jpg',
  sueterUSA: 'https://res.cloudinary.com/mrjrjenc/image/upload/v1785051522/GUEST_a85670a7-e2cf-4c77-9e0e-826304f9a9e6_wqxnab.jpg',
  magnesio: 'https://res.cloudinary.com/mrjrjenc/image/upload/v1785052340/GUEST_d3bc4fee-9b41-4ffc-868d-c870aa90e532_rpoxoo.jpg',
  mochilaLeopardo: 'https://res.cloudinary.com/mrjrjenc/image/upload/v1785052240/GUEST_8e5a7ddf-e56f-42d2-99f8-8ce53e1dc491_lmlcau.webp',
  camisaHawaiana: 'https://res.cloudinary.com/mrjrjenc/image/upload/v1785051953/GUEST_a5adacbb-740e-49dd-8f4e-9479898da97a_sjg8xt.jpg',
  camisaRayas: 'https://res.cloudinary.com/mrjrjenc/image/upload/v1785051914/GUEST_f49d0054-89e0-4d6b-972d-a3b6a5543c83_nsh64m.jpg',
}

// ---- Catálogos ----
export const TIENDAS = [
  { id: 'target', nombre: 'Target', color: '#CC0000' },
  { id: 'walmart', nombre: 'Walmart USA', color: '#0071CE' },
  { id: 'ross', nombre: 'Ross', color: '#00519E' },
]

export const CATEGORIAS = [
  { id: 'ropa', nombre: 'Ropa' },
  { id: 'mochilas', nombre: 'Mochilas' },
  { id: 'salud', nombre: 'Salud' },
  { id: 'otros', nombre: 'Otros' },
]

// Tipo de cambio por defecto (MXN por 1 USD) para abonos en pesos.
// Es editable en cada abono; aquí solo se sugiere.
export const TIPO_CAMBIO_MXN = 18.5

// Estados de un pedido completo
export const ESTADOS_PEDIDO = ['solicitado', 'comprado', 'en_camino', 'entregado']

// Estados de un ítem dentro del pedido (para la lista del comprador)
export const ESTADOS_ITEM = ['pendiente', 'comprado', 'agotado', 'sustituido']

// ---- Personas ----
export const COMPRADORES = [
  { id: 'c-olga', nombre: 'Olga', rol: 'comprador', zona: 'McAllen, TX' },
  { id: 'c-luis', nombre: 'Javier', rol: 'comprador', zona: 'Laredo, TX' },
]

export const CLIENTES = [
  { id: 'cl-ana', nombre: 'Ana Rodríguez', telefono: '+52 55 1234 5678', ciudad: 'Monterrey' },
  { id: 'cl-beto', nombre: 'Beto Martínez', telefono: '+52 81 2345 6789', ciudad: 'Reynosa' },
  { id: 'cl-carmen', nombre: 'Carmen Silva', telefono: '+52 33 3456 7890', ciudad: 'Guadalajara' },
]

// ---- Ofertas (12) — precios en USD, fotos reales ----
export const OFERTAS = [
  {
    id: 'of-1', titulo: 'Mochila Transparente Cristal', precio: 22.99, tiendaId: 'target',
    categoria: 'mochilas', foto: IMG.mochilaCristal, publicadoPor: 'c-olga',
    descripcion: 'Mochila transparente para estadios/escuela.', createdAt: '2026-07-24T15:00:00',
  },
  {
    id: 'of-2', titulo: 'Mochila Deportiva Azul', precio: 34.99, tiendaId: 'target',
    categoria: 'mochilas', foto: IMG.mochilaAzul, publicadoPor: 'c-olga',
    descripcion: 'Amplia, con bolsas laterales y cordón elástico.', createdAt: '2026-07-24T15:10:00',
  },
  {
    id: 'of-3', titulo: 'Mochila Leopardo Escolar', precio: 26.99, tiendaId: 'target',
    categoria: 'mochilas', foto: IMG.mochilaLeopardo, publicadoPor: 'c-olga',
    descripcion: 'Estampado animal print con moño rosa.', createdAt: '2026-07-24T16:00:00',
  },
  {
    id: 'of-4', titulo: 'Termo Stanley IceFlow 30oz', precio: 39.99, tiendaId: 'target',
    categoria: 'otros', foto: IMG.termoStanley, publicadoPor: 'c-olga',
    descripcion: 'Acero inoxidable con popote, color crema.', createdAt: '2026-07-25T14:00:00',
  },
  {
    id: 'of-5', titulo: 'Magnesio Nature Made 200mg', precio: 12.99, tiendaId: 'walmart',
    categoria: 'salud', foto: IMG.magnesio, publicadoPor: 'c-olga',
    descripcion: 'Glicinato de magnesio, 60 cápsulas.', createdAt: '2026-07-25T14:20:00',
  },
  {
    id: 'of-6', titulo: 'Camisa Hawaiana Roja', precio: 24.99, tiendaId: 'ross',
    categoria: 'ropa', foto: IMG.camisaHawaiana, publicadoPor: 'c-luis',
    descripcion: 'Manga corta, estampado floral tropical.', createdAt: '2026-07-25T14:30:00',
  },
  {
    id: 'of-7', titulo: 'Camisa Oxford de Rayas', precio: 21.99, tiendaId: 'ross',
    categoria: 'ropa', foto: IMG.camisaRayas, publicadoPor: 'c-luis',
    descripcion: 'Manga larga, algodón, rayas azul claro.', createdAt: '2026-07-25T15:00:00',
  },
  {
    id: 'of-8', titulo: 'Suéter Bandera USA', precio: 29.99, tiendaId: 'ross',
    categoria: 'ropa', foto: IMG.sueterUSA, publicadoPor: 'c-olga',
    descripcion: 'Tejido crema con bandera al frente.', createdAt: '2026-07-25T15:10:00',
  },
  {
    id: 'of-9', titulo: 'Blusa Roja Floral', precio: 19.99, tiendaId: 'ross',
    categoria: 'ropa', foto: IMG.blusaRoja, publicadoPor: 'c-luis',
    descripcion: 'Blusa manga larga estampado floral.', createdAt: '2026-07-26T13:00:00',
  },
  {
    id: 'of-10', titulo: 'Mochila Cristal con Tenis', precio: 24.99, tiendaId: 'walmart',
    categoria: 'mochilas', foto: IMG.mochilaCristal, publicadoPor: 'c-luis',
    descripcion: 'Transparente, incluye bolsa de malla.', createdAt: '2026-07-26T13:20:00',
  },
  {
    id: 'of-11', titulo: 'Termo Térmico Acero 30oz', precio: 29.98, tiendaId: 'walmart',
    categoria: 'otros', foto: IMG.termoStanley, publicadoPor: 'c-olga',
    descripcion: 'Popote y asa, mantiene frío 2 días.', createdAt: '2026-07-26T13:40:00',
  },
  {
    id: 'of-12', titulo: 'Magnesio Glicinato 60 caps', precio: 14.98, tiendaId: 'walmart',
    categoria: 'salud', foto: IMG.magnesio, publicadoPor: 'c-luis',
    descripcion: 'Alta absorción, apoyo muscular.', createdAt: '2026-07-26T14:00:00',
  },
]

// Helper para armar un ítem de pedido a partir de una oferta
const itemDe = (ofId, cantidad, estadoItem = 'pendiente', extra = {}) => {
  const of = OFERTAS.find((o) => o.id === ofId)
  return {
    ofertaId: of.id,
    titulo: of.titulo,
    tiendaId: of.tiendaId,
    categoria: of.categoria,
    foto: of.foto,
    precioVenta: of.precio,
    cantidad,
    estadoItem, // pendiente | comprado | agotado | sustituido
    precioCompraReal: null, // lo captura el dueño con el ticket
    ...extra,
  }
}

// ---- Pedidos (4) en distintos estados — montos en USD ----
export const PEDIDOS = [
  {
    id: 'p-1001',
    clienteId: 'cl-ana',
    compradorId: 'c-olga',
    fechaViaje: '2026-07-28',
    estado: 'solicitado',
    createdAt: '2026-07-26T10:00:00',
    items: [
      itemDe('of-1', 1),
      itemDe('of-6', 1),
      itemDe('of-5', 2),
    ],
    comision: 10,
    precioCompraTotal: null,
    ticketFoto: null,
    // Ejemplo: cliente pagó en PESOS. 555 MXN / 18.5 = 30 USD aplicados al saldo.
    abonos: [{ id: 'ab-1', monto: 555, moneda: 'MXN', tipoCambio: 18.5, montoUSD: 30, fecha: '2026-07-26' }],
  },
  {
    id: 'p-1002',
    clienteId: 'cl-beto',
    compradorId: 'c-luis',
    fechaViaje: '2026-07-28',
    estado: 'comprado',
    createdAt: '2026-07-25T09:00:00',
    items: [
      itemDe('of-8', 1, 'comprado', { precioCompraReal: 20 }),
      itemDe('of-7', 2, 'comprado', { precioCompraReal: 15 }),
    ],
    comision: 8,
    precioCompraTotal: 50,
    ticketFoto: null,
    abonos: [{ id: 'ab-2', monto: 40, moneda: 'USD', tipoCambio: null, montoUSD: 40, fecha: '2026-07-25' }],
  },
  {
    id: 'p-1003',
    clienteId: 'cl-carmen',
    compradorId: 'c-olga',
    fechaViaje: '2026-07-24',
    estado: 'en_camino',
    createdAt: '2026-07-23T18:00:00',
    items: [
      itemDe('of-2', 1, 'comprado', { precioCompraReal: 26 }),
      itemDe('of-4', 1, 'comprado', { precioCompraReal: 30 }),
      itemDe('of-9', 1, 'agotado'),
    ],
    comision: 12,
    precioCompraTotal: 56,
    ticketFoto: null,
    abonos: [
      { id: 'ab-3', monto: 40, moneda: 'USD', tipoCambio: null, montoUSD: 40, fecha: '2026-07-23' },
      // Ejemplo: pago en PESOS. 370 MXN / 18.5 = 20 USD aplicados al saldo.
      { id: 'ab-4', monto: 370, moneda: 'MXN', tipoCambio: 18.5, montoUSD: 20, fecha: '2026-07-24' },
    ],
  },
  {
    id: 'p-1004',
    clienteId: 'cl-ana',
    compradorId: 'c-luis',
    fechaViaje: '2026-07-20',
    estado: 'entregado',
    createdAt: '2026-07-19T12:00:00',
    items: [
      itemDe('of-3', 1, 'comprado', { precioCompraReal: 19 }),
      itemDe('of-11', 2, 'sustituido', { precioCompraReal: 22, notaSustitucion: 'Cambió a color negro' }),
    ],
    comision: 9,
    precioCompraTotal: 63,
    ticketFoto: null,
    abonos: [{ id: 'ab-5', monto: 60, moneda: 'USD', tipoCambio: null, montoUSD: 60, fecha: '2026-07-20' }],
  },
]

// Snapshot inicial que se guarda en localStorage la primera vez.
export const SEED = {
  tiendas: TIENDAS,
  categorias: CATEGORIAS,
  compradores: COMPRADORES,
  clientes: CLIENTES,
  ofertas: OFERTAS,
  pedidos: PEDIDOS,
}

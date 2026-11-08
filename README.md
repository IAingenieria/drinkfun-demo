# DeUSA – Cross Border Shopping & Logistics

PWA **DEMO** para gestionar compras por encargo de **México → tiendas de USA**
(Target, Walmart USA, Ross). Mobile-first, instalable como app en el celular.

> ⚠️ **Es un DEMO.** No usa base de datos externa. Toda la persistencia vive en el
> `localStorage` del navegador a través de una única capa de datos
> (`src/services/dataService.js`). Al recargar, si `localStorage` está vacío, se
> re-siembra con `src/data/mockData.js`.

## 🌐 Demo en vivo

**https://iaingenieria.github.io/deusa-demo/**

Desplegado automáticamente en GitHub Pages con GitHub Actions (`.github/workflows/deploy.yml`)
en cada push a `main`. Guía de uso detallada: [`Guia_de_Uso_DeUSA.pdf`](Guia_de_Uso_DeUSA.pdf).

---

## 🚀 Cómo correr el demo

Requisitos: Node 18+ (probado con Node 24).

```bash
npm install
npm run dev
```

Abre la URL que imprime Vite (por defecto `http://localhost:5173`).
Para simular móvil, abre las DevTools y activa la vista de dispositivo, o ábrelo
directamente en tu celular en la misma red.

Build de producción y previsualización:

```bash
npm run build
npm run preview
```

### Instalar como app (PWA)

1. Corre `npm run build && npm run preview` (el service worker se activa en build).
2. Abre la URL en Chrome/Edge (desktop o Android) → menú → **Instalar app**.
3. En iOS (Safari): **Compartir → Agregar a pantalla de inicio**.

---

## 🎭 Roles (simulados, sin login)

Arriba hay un **selector de rol**. No hay contraseñas: es un demo.

| Rol | Qué ve / hace |
|-----|----------------|
| 👑 **Dueño** | Control total: pedidos, tickets y utilidad, cuentas por cobrar. |
| 🧳 **Comprador** ("Olga") | Su **lista de compras** consolidada por tienda + publicar ofertas. |
| 🛍️ **Cliente** | Navega ofertas, arma carrito, hace pedidos y ve su historial. |

Cuando eliges *Cliente* o *Comprador* aparece un segundo selector para elegir
**qué** cliente / comprador estás simulando.

---

## 🧩 Funcionalidades

1. **Feed de ofertas** — filtros por tienda y categoría, historial agrupado por día,
   botón "Pedir esto". El dueño/comprador puede **publicar** y **editar** ofertas.
2. **Pedidos** — carrito del cliente, confirmación por "viaje" (fecha), estados
   `solicitado → comprado → en_camino → entregado`, y detalle de qué ítems ya se
   compraron vs. faltan. Historial en "Mis pedidos".
3. **Lista de compras del comprador** — vista consolidada por tienda que **suma
   cantidades** de todos los pedidos (ej. *"Olga, en Target: 2 shampoos, 5 canastas
   de vino, 3 Cheetos, 6 paraguas"*). Checkboxes por ítem: comprado / agotado /
   sustituido, que actualizan el pedido.
4. **Control financiero y tickets (dueño)** — subir foto del ticket por pedido,
   capturar precio de compra real (total o por producto), cálculo de utilidad y
   reporte por día / por cliente.
5. **Pagos y abonos (dueño)** — estado de cuenta por cliente (total / abonado /
   saldo) y registro de abonos parciales con fecha.
6. **Notificaciones simuladas** — toasts + panel de campana al cambiar estados.
   El punto donde iría la integración real con **WhatsApp** está marcado en el
   código (ver más abajo).

---

## 🗂️ Estructura del proyecto

```
src/
├── data/
│   └── mockData.js          # Datos semilla (tiendas, ofertas, clientes, pedidos)
├── services/
│   └── dataService.js       # 👈 ÚNICA capa de datos (hoy localStorage)
├── context/
│   └── AppContext.jsx       # Rol activo, carrito, notificaciones
├── components/              # Header, BottomNav, OfertaCard, Modal, Toasts...
├── views/
│   ├── Feed.jsx             # Feed + filtros + historial por día
│   ├── Carrito.jsx          # Carrito y confirmación de pedido (cliente)
│   ├── MisPedidos.jsx       # Historial y progreso del pedido (cliente)
│   ├── ListaCompras.jsx     # Lista consolidada por tienda (comprador)
│   ├── Publicar.jsx         # Publicar oferta (comprador)
│   └── admin/
│       ├── AdminPedidos.jsx   # Pedidos + estados + tickets/precio real
│       ├── AdminUtilidad.jsx  # Reporte de utilidad por día/cliente
│       └── AdminCuentas.jsx   # Cuentas por cobrar + abonos
└── utils/
    └── format.js            # Formato de moneda, fechas, etiquetas de estado
```

---

## 🔌 Cómo conectar Baserow / Supabase después

**Toda** la lógica de datos está aislada en **`src/services/dataService.js`**.
El resto de la app (vistas, componentes, contexto) **solo** consume las funciones
de ese archivo — nunca toca `localStorage` directamente. Para migrar a una base de
datos real, **solo reimplementas ese archivo**:

1. **No cambies las firmas ni las formas de los objetos** que devuelven las
   funciones. Ej: `getOfertas()` debe seguir devolviendo un arreglo de ofertas con
   los mismos campos; `addPedido(...)` debe seguir devolviendo el pedido creado.

2. Reemplaza el cuerpo de cada función por llamadas a tu backend. Las funciones
   pueden volverse **async** (devolver `Promise`). Ejemplos de mapeo:

   | Función actual | Baserow / Supabase |
   |----------------|--------------------|
   | `getOfertas()` | `SELECT * FROM ofertas` |
   | `addOferta(data)` | `INSERT INTO ofertas ...` |
   | `getPedidos({clienteId})` | `SELECT * FROM pedidos WHERE cliente_id = ...` |
   | `addPedido(...)` | `INSERT INTO pedidos ...` (+ items) |
   | `updatePedido(id, cambios)` | `UPDATE pedidos SET ... WHERE id = ...` |
   | `updateItemPedido(...)` | `UPDATE items SET estado = ...` |
   | `addAbono(...)` | `INSERT INTO abonos ...` |
   | `registrarTicket(...)` | subir foto a Storage + `UPDATE pedidos` |

   **Supabase (ejemplo):**
   ```js
   import { createClient } from '@supabase/supabase-js'
   const supa = createClient(URL, ANON_KEY)

   export async function getOfertas({ tiendaId, categoria } = {}) {
     let q = supa.from('ofertas').select('*').order('created_at', { ascending: false })
     if (tiendaId) q = q.eq('tienda_id', tiendaId)
     if (categoria) q = q.eq('categoria', categoria)
     const { data } = await q
     return data
   }
   ```

   **Baserow (ejemplo):**
   ```js
   const TOKEN = import.meta.env.VITE_BASEROW_TOKEN
   export async function getOfertas() {
     const r = await fetch(`https://api.baserow.io/api/database/rows/table/OFERTAS/?user_field_names=true`, {
       headers: { Authorization: `Token ${TOKEN}` },
     })
     return (await r.json()).results
   }
   ```

3. Los **helpers de cálculo** al final de `dataService.js` (`totalVenta`,
   `utilidadPedido`, `saldoPedido`, `estadoCuentaCliente`, etc.) son funciones puras:
   no tocan almacenamiento, así que puedes conservarlos tal cual.

4. Si las funciones se vuelven `async`, las vistas ya están escritas con estado
   local + re-render por evento (`deusa:data-changed`); adaptarlas es cambiar
   lecturas directas por `useEffect` + `await`.

> En resumen: **cambias un solo archivo** (`dataService.js`) y la app entera queda
> conectada a la base de datos real, sin tocar la UI.

---

## 📲 Dónde va la futura integración con WhatsApp

En `src/context/AppContext.jsx`, dentro de `notificar(...)`, hay un bloque comentado
que marca exactamente dónde se dispararía el envío real por **WhatsApp Business API /
Twilio**. Hoy solo se muestra una notificación dentro de la app.

---

## 🎨 Marca

- Azul marino `#1B2A5B` (primario), rojo `#E03131` (acento), fondo blanco.
- Estética e-commerce limpia con acentos de bandera americana (franja tricolor).
- **Logo real de DeUSA** embebido en Base64 (`src/assets/logo.js`), mostrado sobre un
  header blanco.
- **Sin emojis**: iconos SVG de línea (`src/components/Icon.jsx`) + puntos de color de
  marca para las tiendas.
- **Botones 3D** con relieve y efecto de presión (`.btn-primary/.btn-accent/.btn-outline`
  en `src/index.css`).
- **Precios en USD**; fotos de producto reales alojadas en Cloudinary (CDN).
- Datos versionados con `deusa_demo_v3` en localStorage: si cambian los datos semilla,
  se resiembra solo.

---

## ♻️ Reiniciar el demo

Usa el botón **"↺ Reiniciar demo"** dentro del panel de la campana 🔔, o desde la
consola del navegador:

```js
localStorage.removeItem('deusa_demo_v1'); location.reload()
```

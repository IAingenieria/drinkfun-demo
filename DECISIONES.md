# Decisiones tomadas (modo autónomo)

Registro de decisiones ante puntos ambiguos del brief. Se eligió siempre la opción
más razonable para un DEMO y se siguió adelante.

1. **Stack exacto**: React 19 + Vite 8 + TailwindCSS 3 (no 4) para evitar el nuevo
   pipeline de Tailwind v4 y mantener el flujo clásico `postcss + tailwind.config.js`,
   más estable y documentado. Router: `react-router-dom` v7.

2. **PWA**: se usó `vite-plugin-pwa` (Workbox) con `registerType: autoUpdate` y
   manifest completo. El service worker solo se activa en build/preview (comportamiento
   normal), no en `npm run dev`.

3. **Iconos**: no había logo real. Se generó `logo_deusa.png` y los iconos PWA
   (192/512/512-maskable) con un script propio en Node (sin dependencias), con la
   paleta de marca (marino + franja roja + bloque blanco). Son placeholders: se
   reemplazan por el logo real cuando exista.

4. **Imágenes de ofertas**: se usó `picsum.photos` con `seed` (placeholder libre y
   estable) en vez de Unsplash, porque `source.unsplash.com` está deprecado y picsum
   da imágenes reproducibles por seed. Cacheadas por el service worker.

5. **Persistencia**: una sola clave de `localStorage` (`deusa_demo_v1`) con todo el
   snapshot. Se re-siembra desde `mockData.js` si está vacía. Se emite un evento
   `deusa:data-changed` en cada escritura para refrescar las vistas.

6. **Modelo de utilidad**: el brief decía `utilidad = venta - compra - comisión`.
   Se interpretó la **comisión como ganancia del dueño** (no un costo), que es lo
   habitual en compras por encargo. Por eso:
   `utilidad = (venta de ítems − costo de compra) + comisión`.
   Está documentado y centralizado en `utilidadPedido()`; si se prefiere la fórmula
   literal, se cambia en un solo lugar.

7. **Comisión del viaje**: en el carrito del cliente se usa una comisión fija demo de
   **$150 MXN** por pedido/viaje. Fácil de parametrizar después.

8. **Roles y permisos**: selector simple en el header (sin login). Se agregó una
   guarda ligera de rutas (`RolGuard`) para que, por ejemplo, un cliente no entre a
   las pantallas del dueño. El dueño puede ver también la lista de compras y publicar.

9. **Tickets**: la foto del ticket se guarda como **base64 en localStorage** (demo).
   En producción iría a un Storage (Supabase Storage / bucket) y se guardaría la URL.

10. **Identidades por defecto**: comprador por defecto = **Olga** (como pide el brief),
    cliente por defecto = Ana Rodríguez.

11. **Lista de compras consolidada**: agrupa por tienda y **suma cantidades del mismo
    producto** a través de todos los pedidos activos del comprador. Los checkboxes
    actualizan el/los ítem(s) subyacentes en todos los pedidos afectados.

12. **Estados considerados "activos"** para la lista del comprador:
    `solicitado`, `comprado`, `en_camino` (se excluye `entregado`).

13. **Moneda**: **USD** con `Intl.NumberFormat('en-US')` (la app es de compras en
    USA; los precios se muestran en dólares con centavos). Comisión demo por viaje:
    $10 USD.

14. **Imágenes de producto**: se usan las 5 fotos reales provistas, alojadas en
    **Cloudinary** (CDN estable y rápido: ~90ms). Como son 5 fotos para 12 productos,
    se reutilizan de forma coherente por tipo (mochilas, termos, ropa) y el catálogo
    se rearmó para que cada foto corresponda a su producto. Se descartó loremflickr:
    aunque da fotos por palabra clave, se saturaba al cargar 12 imágenes en ráfaga.
    Nota: el "0 cargadas" durante pruebas era por `loading="lazy"` en un navegador
    headless sin render; en un navegador real cargan sin problema (verificado 12/12).

15. **Logo**: se usó el logo real de DeUSA (imagen de WhatsApp provista), convertido a
    **Base64** y embebido en `src/assets/logo.js` para no depender de rutas externas.
    Se muestra en un header **blanco** (el logo está diseñado para fondo claro).

16. **Sin emojis**: se eliminaron todos los emojis. En su lugar hay un set de
    **iconos SVG de línea** (`src/components/Icon.jsx`), puntos de color de marca para
    las tiendas y etiquetas de texto.

17. **Botones 3D**: sistema de botones con relieve (gradiente + borde inferior sólido
    + highlight interno) definido en `index.css` (`.btn-primary`, `.btn-accent`,
    `.btn-outline`), con efecto de "presión" al hacer clic.

18. **Versionado de datos**: al cambiar el modelo de datos (USD, fotos, categorías) se
    sube la versión de la clave de localStorage (`deusa_demo_v3`) para que el demo se
    resiembre automáticamente con los datos nuevos, sin que el usuario tenga que borrar
    nada manualmente.

19. **Categorías**: se ajustaron a lo que muestran las fotos reales: Ropa, Mochilas,
    Camping, Otros (se reemplazó "Despensa" por "Mochilas").

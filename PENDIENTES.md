# PENDIENTES — DeUSA · 2026-07-26

## 🔴 Urgente (próxima fase inmediata)
- [ ] **Recibir y registrar las observaciones del cliente** sobre el demo en vivo
      (usar `OBSERVACIONES_CLIENTE.md`). Priorizar cambios y ajustar.

## 🟡 Esta semana / corto plazo
- [ ] Aplicar los ajustes que surjan de las observaciones del cliente.
- [ ] Preparar el diseño de la **base de datos real** (Baserow o Supabase):
      definir tablas (tiendas, ofertas, clientes, compradores, pedidos, items, abonos).
- [ ] Decidir proveedor de DB (Baserow vs Supabase) según necesidades y costos.
- [ ] Logo/iconos PWA definitivos (los actuales son placeholder generados).

## 🟢 Después
- [ ] Conectar la DB real reemplazando **solo** `src/services/dataService.js`.
- [ ] Autenticación real (Supabase Auth / Clerk) y permisos por usuario.
- [ ] Storage de imágenes de tickets/ofertas en bucket (hoy base64 / URLs).
- [ ] Integración real de **WhatsApp** (Twilio / WhatsApp Business API).
- [ ] Tipo de cambio como configuración global (hoy se captura por abono).
- [ ] Tests (Vitest sobre helpers de `dataService`), modo oscuro, exportar reportes.
- [ ] `npm audit` de dependencias de dev antes de producción.

---
_Actualizado: 2026-07-26 08:18 — /sync_session_

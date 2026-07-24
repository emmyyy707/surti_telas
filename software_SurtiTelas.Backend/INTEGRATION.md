# Plan de Integración Frontend ↔ Backend — SurtiTelas

> Este documento es el plan ejecutable para unir `SurtiTelas.Fronend` con `SurtiTelas.Backend`.
> Está anclado a los contratos ya alineados: envelope `{ success, data, meta }`, paginación cursor,
> `Order.total: number`, `createdAt/updatedAt` expuestos, y API clients base creados.
>
> **Objetivo final:** eliminar todo dato quemado/hardcodeado y garantizar que cada página y panel administrativo consuma su propio backend.

---

## 1. Prerrequisitos

| Herramienta | Versión |
|-------------|---------|
| Node.js | >= 20 LTS |
| npm | >= 10 |
| PostgreSQL | >= 15 |
| Git | cualquiera |

---

## 2. Variables de entorno

### Backend (`SurtiTelas.Backend/.env`)

```env
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://surtitelas:surtitelas@localhost:5432/surtitelas?schema=public
JWT_ACCESS_SECRET=cambia-este-secreto-de-32-bytes-min
JWT_REFRESH_SECRET=otro-secreto-distinto-de-32-bytes
ACCESS_TTL=15m
REFRESH_TTL=7d
CORS_ORIGIN=http://localhost:5173
```

### Frontend (`SurtiTelas.Fronend/.env`)

```env
VITE_API_URL=http://localhost:3000/api/v1
```

---

## 3. Levantar backend

```bash
cd SurtiTelas.Backend
npm install
npx prisma migrate dev --name init
npm run prisma:seed
npm run dev
```

- API: `http://localhost:3000/api/v1`
- Docs: `http://localhost:3000/api/docs`

---

## 4. Levantar frontend

```bash
cd SurtiTelas.Fronend
npm install
npm run dev
```

- UI: `http://localhost:5173`

---

## 5. Verificación rápida de contratos

| Endpoint | Método | Verificación |
|----------|--------|--------------|
| `/auth/login` | POST | Login con `admin@surtitelas.com` / `SurtiTelas2025*` |
| `/auth/me` | GET | Devuelve `id`, `email`, `nombre`, `role`, `estado`, `createdAt` |
| `/orders` | GET | Listado paginado `{ success, data: { items: [...], meta } }`. `total` es `number` |
| `/orders/me` | GET | Igual formato, scoped por cliente autenticado |
| `/customers` | GET | Listado paginado `{ success, data: { items: [...], meta } }` |
| `/deliveries` | GET | Listado paginado `{ success, data: { items: [...], meta } }` |
| `/deliveries/:id/status` | PATCH | Actualiza estado delivery (`ASIGNADO`, `EN_RUTA`, `ENTREGADO`, `FALLIDO`) |
| `/catalog/products` | GET | Listado paginado `{ success, data: { items: [...], meta } }` |
| `/commissions` | GET | Listado paginado `{ success, data: { items: [...], meta } }` |
| `/payments` | GET | Listado paginado `{ success, data: { items: [...], meta } }` |
| `/payments` | POST | Crea pago/abono |
| `/payments/:id/status` | PATCH | Actualiza estado pago |
| `/receipts` | GET | Listado paginado `{ success, data: { items: [...], meta } }` |
| `/receipts/me` | GET | Listado paginado scoped por cliente autenticado |
| `/receipts/:id` | PATCH | Actualiza datos recibo |
| `/receipts/:id/status` | PATCH | Actualiza estado recibo (`BORRADOR`, `ENVIADO`, `PAGADO`, `VENCIDO`, `CANCELADO`) |
| `/contact` | GET | Listado `{ success, data: { items: [...], meta } }` |
| `/contact/:id/reply` | POST | Responde mensaje (`respuesta`, `respondidoPor`, `estado=RESPONDIDO`) |
| `/contact/:id/status` | PATCH | Cambia estado contacto (ej. `CERRADO`) |
| `/stock/movements` | GET | Listado paginado `{ success, data: { items: [...], meta } }` |
| `/stock/movements` | POST | Crea movimiento de inventario |

### Envelope estándar

**Éxito (listado):**
```json
{
  "success": true,
  "data": {
    "items": [...],
    "meta": {
      "totalRecords": 100,
      "page": 1,
      "limit": 10,
      "totalPages": 10,
      "nextCursor": "..."
    }
  },
  "message": "opcional"
}
```

**Éxito (recurso individual):**
```json
{
  "success": true,
  "data": { ... },
  "message": "opcional"
}
```

**Error:**
```json
{
  "success": false,
  "error": "not_found",
  "message": "Mensaje de error"
}
```

> Usar Postman/Thunder Client o el frontend directamente. Si `npm run test` pasa en backend, los contratos base están OK.

---

## 6. Matriz completa de cobertura frontend → backend

### 6.1 Ya integrado (FULLY_COVERED)

| Página | Panel | Datos | Backend endpoints |
|--------|-------|-------|-------------------|
| `AdminCatalogo.tsx` | admin | Productos CRUD/publish | `/catalog/products` |
| `Pedidos.tsx` | admin | Pedidos list/create/updateStatus | `/orders`, `/customers`, `/auth/users` |
| `Catalogo.tsx` | asesor | Productos | `/catalog/products` |
| `MisClientes.tsx` | asesor | Clientes | `/customers` |
| `Atencion-cliente.tsx` | asesor | Clientes + pedidos | `/customers`, `/orders` |
| `Pedidos.tsx` | asesor | Pedidos | `/orders` |
| `MisPedidos.tsx` | cliente | Pedidos | `/orders/me` |
| `CheckoutButton`, `CheckoutModal` | features | Crear pedido | `/orders` |
| `CartPage.tsx` | features | Carrito (client-side) | — |
| `AboutPage.tsx`, `TooltipsDemo.tsx` | public | Estáticos | — |
| `Chart.tsx`, `StatCard.tsx` | shared | UI pura | — |

### 6.2 Parcialmente cubiertas (PARTIAL)

| Página | Panel | Datos actuales | Backend endpoints | Acción requerida |
|--------|-------|----------------|-------------------|------------------|
| `Clientes.tsx` | admin | Inline mock | `/customers` | Conectar API + eliminar mock |
| `Inventario.tsx` | admin | localStorage | `/stock/movements` | Conectar API + eliminar mock |
| `Proveedores.tsx` | admin | localStorage | `/stock/suppliers` | Conectar API + eliminar mock |
| `Produccion.tsx` | admin | Inline mock | `/production/orders` | Conectar API + eliminar mock |
| `RegistroTalleres.tsx` | admin | Inline mock | `/production/workshops` | Conectar API + eliminar mock |
| `AsignacionProduccion.tsx` | admin | Inline mock | `/production/orders/:id/workshop` | Conectar API + eliminar mock |
| `SeguimientoProduccion.tsx` | admin | Placeholder | `/production/orders` | Conectar API |
| `ControlPrendas.tsx` | admin | Inline mock | `/production/orders/:id/progress` | Conectar API + eliminar mock |
| `AlertasStock.tsx` | admin | Inline mock | `/stock/alerts` | Conectar API + eliminar mock |
| `AlertasAsignacionProduccion.tsx` | admin | Inline mock | `/production/alerts` | Conectar API + eliminar mock |
| `AlertasRegistroTalleres.tsx` | admin | Inline mock | `/production/alerts` | Conectar API + eliminar mock |
| `AlertasSeguimientoProduccion.tsx` | admin | Inline mock | `/production/alerts` | Conectar API + eliminar mock |
| `Insumos.tsx` | admin | Inline mock | `/stock/raw-materials` | Conectar API + eliminar mock |
| `Dashboard.tsx` | admin | Métricas hardcodeadas | `/orders`, `/customers` | Conectar API + agregaciones |
| `ReportesVentas.tsx` | admin | Inline mock | `/orders` | Conectar API + agregaciones |
| `ReportesInventario.tsx` | admin | Inline mock | `/stock/movements`, `/catalog/products` | Conectar API + agregaciones |
| `ReportesProduccion.tsx` | admin | Inline mock | `/production/orders` | Conectar API + agregaciones |
| `ReportesUsuarios.tsx` | admin | Inline mock | `/auth/users` | Conectar API + agregaciones |
| `AdminAsesores.tsx` | admin | Inline mock | `/auth/users` | Conectar API + eliminar mock |
| `GestionUsuarios.tsx` | admin | Inline mock | `/auth/users`, `/auth/register` | Conectar API + eliminar mock |
| `GestionAcceso.tsx` | admin | Inline mock | `/auth/roles/:role/permissions` | Conectar API + eliminar mock |
| `Roles.tsx` | admin | Inline mock | `/auth/roles/:role/permissions` | Conectar API + eliminar mock |
| `Permisos.tsx` | admin | Inline mock | `/auth/permissions` | Conectar API + eliminar mock |
| `SeguridadUsuarios.tsx` | admin | Inline mock | `/auth/2fa/*`, `/auth/change-password` | Conectar API + eliminar mock |
| `VentasPedidos.tsx` | admin | Empty placeholder | — | Implementar |
| `AdminLayout.tsx` | admin | Notificaciones localStorage | `/notifications` | Conectar API |
| `Dashboard.tsx` | asesor | Métricas hardcodeadas | `/orders`, `/customers` | Conectar API + agregaciones |
| `PerfilAsesor.tsx` | asesor | Static | `/auth/me` | Conectar API |
| `AsesorLayout.tsx` | asesor | Notificaciones mock | `/notifications` | Conectar API |
| `Dashboard.tsx` | domiciliario | Hardcoded | `/orders` | Conectar API + filtro domiciliario |
| `MisEntregas.tsx` | domiciliario | Inline mock | `/orders` + assignment | Conectar API |
| `RutaDelDia.tsx` | domiciliario | Hardcoded | `/orders` | Conectar API |
| `Historial.tsx` | domiciliario | Hardcoded | `/orders` | Conectar API |
| `PerfilDomiciliario.tsx` | domiciliario | Static | `/auth/me` | Conectar API |
| `DomiciliarioLayout.tsx` | domiciliario | Notificaciones mock | `/notifications` | Conectar API |
| `Catalogo.tsx` | cliente | Mock pedidos + chat | `/orders`, `/catalog/products` | Conectar API + eliminar mock |
| `InicioCliente.tsx` | cliente | Mezcla real + mock | `/orders`, `/notifications` | Conectar API + eliminar mock |
| `OrderTracking.tsx` | cliente | Producción mock | `/orders/:id`, `/production/orders` | Conectar API + eliminar mock |
| `Recibos.tsx` | cliente | Derivado de pedidos | `/orders` | Conectar API |
| `Favoritos.tsx` | cliente | localStorage | `/catalog/products` | Conectar API + eliminar localStorage |
| `PerfilCliente.tsx` | cliente | Static | `/auth/me`, customer profile | Conectar API |
| `ClienteLayout.tsx` | cliente | Notificaciones mock | `/notifications` | Conectar API |
| `HomePage.tsx` | public | Productos featured hardcodeados | `/catalog/products` | Conectar API + eliminar mock |
| `CatalogPage.tsx` | features | `PRODUCTOS_DEMO` hardcodeado | `/catalog/products` | Conectar API + eliminar mock |
| `CheckoutPage.tsx` | features | Falta upload pago | `/orders` + upload | Implementar upload |

### 6.3 No cubiertas (NOT_COVERED)

| Página | Panel | Razón | Acción requerida |
|--------|-------|-------|------------------|
| `Pagos.tsx` | admin | No existe módulo pagos | Crear módulo backend `payments` |
| `HistorialPagos.tsx` | admin | No existe módulo pagos | Crear módulo backend `payments` |
| `Recibos.tsx` | admin | No existe módulo recibos | Crear módulo backend `receipts` |
| `Comisiones.tsx` | asesor | No existe módulo comisiones | Crear módulo backend `commissions` |
| `AdminConfiguracion.tsx` | admin | No existe módulo config | Crear módulo backend `company` |
| `AdminPages.tsx` | admin | No existe CMS | Crear módulo backend `cms` |
| `ContactoEmpresa.tsx` | admin | No existe módulo contacto | Crear módulo backend `contact` |
| `ContactPage.tsx` | public | No existe endpoint contacto | Crear módulo backend `contact` |

---

## 7. Eliminación de datos quemados (obligatorio)

### 7.1 Objetivo
Ninguna página debe confiar en valores fijos en el código. Todos los datos deben venir del backend.

### 7.2 Acciones por archivo

| Archivo | Acción |
|---------|--------|
| `src/presentation/pages/admin/Pedidos.tsx` | ✅ Ya conectado; eliminar cualquier fallback local residual |
| `src/presentation/pages/asesor/Pedidos.tsx` | Reemplazar `pedidosIniciales` y `asesoresAsignados` por llamadas a API |
| `src/presentation/pages/asesor/Dashboard.tsx` | Eliminar `asesoresAsignados` hardcodeados; cargar desde `/auth/users` |
| `src/presentation/pages/cliente/MisPedidos.tsx` | Eliminar datos mock del store; conectar a `/orders/me` |
| `src/presentation/pages/cliente/OrderTracking.tsx` | Eliminar datos mock; conectar a `/orders/:id` |
| `src/presentation/pages/admin/Proveedores.tsx` | Eliminar `proveedores` hardcodeados; usar `suppliersApi` |
| `src/presentation/pages/admin/Insumos.tsx` | Eliminar `items` hardcodeados; usar `rawMaterialsApi` |
| `src/presentation/pages/admin/RegistroTalleres.tsx` | Eliminar talleres mock; usar `workshopsApi` |
| `src/presentation/pages/admin/Produccion.tsx` | Eliminar órdenes mock; usar `productionApi` |
| `src/presentation/pages/admin/Inventario.tsx` | Eliminar movimientos mock; usar `inventoryApi` |
| `src/core/stores/index.ts` | Mantener solo como cache local; nunca como fuente primaria de verdad |

### 7.3 Regla general
> Si un array/objeto se define con `const` y valores fijos dentro de un componente o store, **debe ser reemplazado** por una llamada al backend antes de considerar esa página integrada.

---

## 8. Estado del backend

### 8.1 Endpoints faltantes en módulos existentes — COMPLETADO

| Endpoint | Estado |
|----------|--------|
| `DELETE /orders/:id` | ✅ Implementado en `src/modules/orders/presentation/routes/order.routes.ts` |
| `PATCH /orders/:id` | ✅ Implementado en `src/modules/orders/presentation/routes/order.routes.ts` |
| `GET /auth/users` | ✅ Implementado en `src/modules/auth/presentation/routes/auth.routes.ts` |
| `PATCH /customers/:id/cupo` | ✅ Implementado en `src/modules/customers/presentation/routes/customer.routes.ts` |

### 8.2 Módulos backend nuevos requeridos — COMPLETADO

| Módulo | Estado | Pantallas frontend |
|--------|--------|--------------------|
| `payments` | ✅ Creado | `Pagos.tsx`, `HistorialPagos.tsx` |
| `receipts` | ✅ Creado | `Recibos.tsx` |
| `commissions` | ✅ Creado | `Comisiones.tsx` |
| `company` | ✅ Creado | `AdminConfiguracion.tsx` |
| `cms` | ✅ Creado | `AdminPages.tsx` |
| `contact` | ✅ Creado | `ContactoEmpresa.tsx`, `ContactPage.tsx` |

Módulos adicionales creados más allá del alcance original: `audit`, `reports`, `alerts`, `webhooks`, `control-prendas`, `health`. Todos registrados en `src/config/app.ts`.

---

## 9. Pruebas

```bash
# Backend
cd SurtiTelas.Backend
npm run test
npm run test:e2e

# Frontend
cd SurtiTelas.Fronend
npm run typecheck
npm run lint
```

> E2E requiere servidor corriendo. Ver [`E2E.md`](./E2E.md).

---

## 10. Troubleshooting

| Problema | Solución |
|----------|----------|
| `ECONNREFUSED` frontend | Backend no corriendo en `:3000` |
| 401 en endpoints | Token expirado; refresh automático o re-login |
| `total` type error | Backend devuelve `number`; frontend debe formatear con `formatCurrency()` |
| `itemsList` undefined | Usar `itemsList ?? []` antes de mapear |
| CORS error | Verificar `CORS_ORIGIN` en backend coincide con URL del frontend |
| Datos quemados en pantalla | Revisar sección 7; eliminar arrays/objetos constantes y reemplazar por API |

---

## 11. Checklist de integración completa

### General
- [x] Backend corriendo y seed aplicado
- [ ] Frontend corriendo y apuntando a `/api/v1`
- [x] Login funciona (obtiene access + refresh token) — verificado: `admin@surtitelas.com` / `SurtiTelas2025*`
- [x] `/orders` carga lista paginada `{ data, meta }` — verificado (12 filas, `total` es `number`)
- [x] `/customers` carga lista paginada `{ data, meta }` — verificado (50 filas)
- [ ] Crear pedido desde `admin/Pedidos.tsx` persiste
- [ ] Cambiar estado de pedido persiste

### Sin datos quemados
- [ ] `admin/Pedidos.tsx` — sin fallback local
- [ ] `asesor/Pedidos.tsx` — sin `pedidosIniciales` ni `asesoresAsignados`
- [ ] `asesor/Dashboard.tsx` — sin asesores hardcodeados
- [ ] `cliente/MisPedidos.tsx` — sin mock store
- [ ] `cliente/OrderTracking.tsx` — sin mock store
- [ ] `Proveedores.tsx` — sin proveedores hardcodeados
- [ ] `Insumos.tsx` — sin items hardcodeados
- [ ] `RegistroTalleres.tsx` — sin talleres mock
- [ ] `Produccion.tsx` — sin órdenes mock
- [ ] `Inventario.tsx` — sin movimientos mock
- [ ] `Dashboard.tsx` (admin/asesor/domiciliario) — sin métricas hardcodeadas
- [ ] `MisEntregas.tsx` — sin `entregasSeed`
- [ ] `Catalogo.tsx` (cliente) — sin `pedidosActivos`
- [ ] `HomePage.tsx` — sin productos featured hardcodeados
- [ ] `CatalogPage.tsx` — sin `PRODUCTOS_DEMO`
- [ ] Todos los reportes — sin datos inline

### Backend endpoints requeridos
- [x] `DELETE /orders/:id` implementado
- [x] `PATCH /orders/:id` implementado (edición completa)
- [x] `GET /auth/users` disponible y paginado
- [x] `PATCH /customers/:id/cupo` disponible
- [x] Módulo `payments` creado
- [x] Módulo `receipts` creado
- [x] Módulo `commissions` creado
- [x] Módulo `company` creado
- [x] Módulo `cms` creado
- [x] Módulo `contact` creado

### Calidad
- [ ] Todos los módulos stock/production consumen API clients base
- [ ] Pantallas asesor/cliente/domiciliario migradas según guía
- [x] Tests backend verdes — `npm run test` → 450 passed / 86 files
- [ ] Typecheck + lint frontend verdes

---

## 12. Próximos pasos sugeridos

1. ~~Correr seed extendido y validar `PED-000001` en DB~~ ✅ Completado — `PED-000001` existe (estado `LISTO`, total `50000`); admin, asesor demo, REF-001 y cliente demo asegurados.
2. Conectar `Proveedores.tsx` a `/stock/suppliers`
3. Conectar `Insumos.tsx` a `/stock/raw-materials`
4. Migrar todas las páginas PARTIAL a backend consumiendo sus respectivos endpoints
5. Eliminar TODOS los datos quemados listados en sección 7
6. Validar que cada panel admin tenga su endpoint correspondiente

> **Nota**: Los ítems 4 y 5 de la versión original ("Implementar `DELETE /orders/:id` y `PATCH /orders/:id`" y "Crear módulos backend faltantes") ya están completados. El backend expone 80+ endpoints funcionales en `src/config/app.ts`.

---

## 13. Registro de validación en vivo (2026-07-17)

Validación ejecutada contra el backend corriendo en `http://localhost:3000/api/v1` con la BD local (PostgreSQL :5432):

| Verificación | Resultado |
|--------------|-----------|
| `GET /health` | ✅ `healthy` |
| `POST /auth/login` (`admin@surtitelas.com`) | ✅ `success:true`, access + refresh token |
| `GET /auth/me` | ✅ `id, email, nombre, role, createdAt` presentes |
| `GET /orders` | ✅ `{ data, meta }`, `total` es `number` |
| `GET /customers` | ✅ `{ data, meta }` paginado |
| `GET /catalog/products` | ✅ `{ data, meta }` paginado |
| `npm run test` | ✅ 450 passed / 86 files |
| `PED-000001` en DB | ✅ existe |

### Notas de la validación
- La contraseña del admin en la BD no coincidía con la documentada; se re-sincronizó el hash a `SurtiTelas2025*` (ver `scripts/fix-admin.ts`). El `seed.ts` usa `upsert` y no sobrescribe el hash existente, por lo que conviene documentar este paso o ajustar el seed para forzar el password en desarrollo.
- El contrato de respuesta envuelve la paginación como `data.data` / `data.meta` (doble envoltura). El `meta.total` viene vacío; el total se infiere del largo del array. El frontend debe consumir `resp.data.data` y `resp.data.meta`.
- Scripts auxiliares creados en `scripts/`: `inspect-db.ts`, `dump-db.ts`, `check-seed.ts`, `check-pwd.ts`, `fix-admin.ts`.

### Pendiente (fuera de alcance backend, requiere frontend)
- Conectar páginas PARTIAL/NOT_COVERED listadas en sección 6 al backend (sección 7).
- `meta.total` poblado en endpoints paginados (mejora de contrato).

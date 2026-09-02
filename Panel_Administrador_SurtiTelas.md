# Panel de Administrador — SurtiTelas

> Documento técnico que describe la lógica completa del panel de administración del proyecto SurtiTelas. Cubre rutas, layout, módulos del frontend, endpoints del backend, estado, permisos y particularidades técnicas.

## Tabla de contenidos

1. [Visión general](#1-visión-general)
2. [Rutas del panel admin](#2-rutas-del-panel-admin)
3. [Layout y sidebar](#3-layout-y-sidebar)
4. [Estado, providers y stores](#4-estado-providers-y-stores)
5. [Servicios API consumidos](#5-servicios-api-consumidos)
6. [Permisos y roles](#6-permisos-y-roles)
7. [Módulos del panel](#7-módulos-del-panel)
8. [Backend consumido por el panel](#8-backend-consumido-por-el-panel)
9. [Configuración y constantes](#9-configuración-y-constantes)
10. [Particularidades técnicas](#10-particularidades-técnicas)
11. [Diccionario de endpoints](#11-diccionario-de-endpoints)

---

## 1. Visión general

El panel de administración es la SPA principal del rol `admin` (y derivados: `almacen`, `produccion`, `reportes`). Se monta bajo el prefijo `/admin` y está compuesto por:

- Un **layout** con sidebar y header.
- Un conjunto de **módulos funcionales** (CRUDs, dashboards, reportes).
- Una capa de **servicios** que consume el backend REST.
- Un sistema de **permisos** que filtra menú, rutas y endpoints según el rol del usuario.

Archivo raíz del registro de rutas: `software_SurtiTelas.Fronend/src/presentation/pages/App.tsx:120-184`.

---

## 2. Rutas del panel admin

| Ruta | Componente | Descripción |
|------|-----------|-------------|
| `/admin` | `AdminLayout` | Layout general (sidebar + header) |
| `/admin/dashboard` | `AdminDashboard` | Dashboard con KPIs y gráficos |
| `/admin/dashboard-analitico` | `AdminDashboardAnalitico` | Dashboard analítico |
| `/admin/clientes` | `AdminClientes` | Gestión de clientes |
| `/admin/catalogo` | `AdminCatalogo` | Catálogo de productos |
| `/admin/productos` | `AdminCatalogo` | Alias de catálogo |
| `/admin/pedidos` | `AdminPedidos` | Gestión de pedidos |
| `/admin/ventas-pedidos` | `AdminPedidos` | Alias |
| `/admin/pedidos-personalizados` | `AdminPedidosPersonalizados` | Cotizaciones |
| `/admin/produccion` | `AdminProduccion` | Órdenes de producción |
| `/admin/inventario` | `AdminInventario` | Movimientos de inventario |
| `/admin/categorias` | `AdminCategorias` | Categorías de productos |
| `/admin/insumos` | `AdminInsumos` | Insumos |
| `/admin/categorias-insumos` | `AdminCategoriasInsumos` | Categorías de insumos |
| `/admin/proveedores` | `AdminProveedores` | Proveedores |
| `/admin/compras` | `AdminCompras` | Órdenes de compra |
| `/admin/alertas-stock` | `AdminAlertasStock` | Alertas de stock |
| `/admin/stock-devuelto` | `AdminStockDevuelto` | Devoluciones |
| `/admin/domicilios` | `AdminDomiciliosLayout` → `AdminDomicilios` | Domiciliarios |
| `/admin/ruta-del-dia` | `AdminDomiciliosLayout` → `RutaDelDiaAdmin` | Ruta del día |
| `/admin/asesores` | `GestionUsuariosAsesores` | Gestión de asesores |
| `/admin/gestion-usuarios` | `AdminGestionUsuarios` | Gestión general de usuarios |
| `/admin/empleados` | `AdminGestionEmpleados` | Empleados (asesor/domiciliario) |
| `/admin/gestion-acceso` | `AdminGestionAcceso` | Gestión de acceso |
| `/admin/seguridad` | `AdminSeguridadUsuarios` | Seguridad y logs |
| `/admin/gestion-roles-permisos` | `AdminGestionRolesPermisos` | Roles y permisos |
| `/admin/roles` | Redirect → `/admin/gestion-roles-permisos` | Alias |
| `/admin/permisos` | Redirect → `/admin/gestion-roles-permisos` | Alias |
| `/admin/facturacion` | `AdminRecibos` | Recibos / facturación |
| `/admin/pagos` | `AdminPagos` | Pagos |
| `/admin/abonos` | `AdminPagos` | Alias |
| `/admin/gestion-ventas` | `AdminGestionVentas` | Ventas |
| `/admin/talleres` | `AdminRegistroTalleres` | Registro de talleres |
| `/admin/prendas` | `AdminControlPrendas` | Control de prendas |
| `/admin/asignacion` | `AdminAsignacionProduccion` | Asignación a talleres |
| `/admin/seguimiento` | `AdminSeguimientoProduccion` | Seguimiento |
| `/admin/configuracion` | `AdminConfiguracion` | Configuración empresa |
| `/admin/reportes` | `AdminReportesLayout` | Layout de reportes |
| `/admin/reportes/ventas` | `AdminReportesVentas` | Reporte de ventas |
| `/admin/reportes/usuarios` | `AdminReportesUsuarios` | Reporte de usuarios |
| `/admin/reportes/produccion` | `AdminReportesProduccion` | Reporte de producción |
| `/admin/reportes/inventario` | `AdminReportesInventario` | Reporte de inventario |
| `/admin/reportes-ventas` | Redirect → `/admin/reportes/ventas` | Alias |
| `/admin/reportes-usuarios` | Redirect → `/admin/reportes/usuarios` | Alias |
| `/admin/reportes-produccion` | Redirect → `/admin/reportes/produccion` | Alias |
| `/admin/reportes-inventario` | Redirect → `/admin/reportes/inventario` | Alias |
| `/admin/notificaciones` | `AdminNotificaciones` | Notificaciones |
| `/admin/portal-cliente` | `PortalCliente` | Portal del cliente |

Las rutas requieren uno de los roles permitidos: `admin`, `almacen`, `produccion`, `reportes`.

---

## 3. Layout y sidebar

### 3.1 AdminLayout
**Archivo:** `software_SurtiTelas.Fronend/src/presentation/pages/admin/AdminLayout.tsx:100-286`

- Componente principal del panel.
- Renderiza `<Sidebar>` con el menú `adminMenu` definido en líneas 21-98.
- Renderiza `<TopHeader>` con búsqueda, tema, exportación y notificaciones.
- Usa `useDashboardTheme` para tema (no afecta páginas públicas).
- Usa `useUserRole('admin')` para inyectar `data-role` en `<html>`.
- Aplica `filterMenuByPermissions` para ocultar items sin permiso.
- Botón de exportación CSV que consume `reportsApi.getSalesReport()`.
- Incluye botón **debug permisos** (solo `import.meta.env.DEV`) que muestra email, role y permisos.

### 3.2 Menú del sidebar
Estructura visible en `AdminLayout.tsx:21-98` con secciones:
- Dashboard
- Configuración → Roles, Permisos
- Usuarios → Gestión Usuarios, Gestión Acceso, Empleados
- Compras → Compras, Insumos, Categorías, Proveedores
- Ventas → Pedidos, Cotizaciones, Facturación, Pagos, Clientes, Domiciliarios, Ruta del Día, Stock Devuelto
- Producción → Catálogo, Talleres, Prendas, Asignación, Seguimiento
- Reportes → Ventas, Finanzas, Usuarios, Producción, Inventario, Alertas Stock

### 3.3 Componente Sidebar
**Archivo:** `software_SurtiTelas.Fronend/src/shared/layouts/Sidebar.tsx`

- Recibe `menu`, `basePath`, `logo`, `brandName`, `panelLabel`, `user`, `onLogout`, `badgeCounts`.
- Persiste estado colapsado en `localStorage` (`surtitelas.sidebarCollapsed`).
- Soporta responsive (móvil, tablet).
- Renderiza `NavLink` por item; subitems con toggle.
- Acepta `badgeCounts` y `sidebarSummary` para notificaciones.

### 3.4 TopHeader
**Archivo:** `software_SurtiTelas.Fronend/src/presentation/components/TopHeader.tsx:23-116`

- Input de búsqueda (callback no implementado).
- Botón de notificaciones con `NotificationPopover`.
- Toggle de tema con `useDashboardTheme`.
- Botón de exportar CSV (solo admin).
- Perfil de usuario (avatar, nombre, email).

---

## 4. Estado, providers y stores

### 4.1 AppProviders
**Archivo:** `software_SurtiTelas.Fronend/src/app/providers/AppProviders.tsx`

Envuelve la app con:
- `QueryClientProvider` (TanStack Query) para cache de peticiones.
- `ThemeProvider`.
- `AuthProvider`.
- `CartDrawerProvider` (carrito cliente).
- `NotificationProvider`.
- `SidebarProvider`.
- `ErrorBoundary`.

### 4.2 Stores clave (Zustand)

| Store | Archivo | Uso |
|-------|---------|-----|
| `authStore` | `core/stores/authStore.ts` | Sesión, usuario, login, logout |
| `useAppStore` | `core/stores` | Hidratación global (`hydrateAll`) |
| `cartStore` | `core/stores/cartStore.ts` | Carrito de compras |
| `notificationStore` | `core/stores/notificationStore.ts` | Notificaciones |
| `productosStore` | `core/stores` | Cache de productos |
| `categoriasStore` | `core/stores` | Cache de categorías |

### 4.3 Hooks transversales

- `useUserRole(role)` — setea `data-role` en `<html>` para CSS condicional.
- `useDashboardTheme()` — toggle dark/light scoped al dashboard.
- `useAuth()` — expone `user`, `login`, `logout`, `checkSession`.
- `usePermissions()` — filtra menú por permisos del usuario.

---

## 5. Servicios API consumidos

**Ubicación:** `software_SurtiTelas.Fronend/src/infrastructure/api/`

| Servicio | Endpoints |
|----------|-----------|
| `httpClient` | Wrapper de `fetch` con base `VITE_API_URL` y auth headers |
| `authApi` | login, register, refresh, google, logout, me, users |
| `usersApi` | CRUD de usuarios |
| `rolesApi` | CRUD de roles |
| `permissionsApi` | CRUD de permisos |
| `customersApi` | CRUD de clientes |
| `catalogApi` / `productsApi` | CRUD de productos y catálogo público |
| `categoriesApi` | CRUD de categorías de productos |
| `ordersApi` | Pedidos, dashboard, métricas |
| `salesApi` | Ventas |
| `paymentsApi` | Pagos |
| `receiptsApi` | Recibos / facturación |
| `returnsApi` | Devoluciones |
| `productionApi` | Órdenes de producción, asignación |
| `workshopsApi` | Talleres |
| `controlPrendaApi` | Control de prendas |
| `inventoryApi` | Movimientos, alertas, stock |
| `insumosApi` | Insumos |
| `purchasesApi` | Compras |
| `stockApi` (suppliers) | Proveedores |
| `domiciliariosApi` | Domiciliarios |
| `deliveriesApi` | Entregas, ruta del día |
| `customOrdersApi` | Pedidos personalizados / cotizaciones |
| `notificationsApi` | Notificaciones |
| `webhooksApi` | Webhooks |
| `commissionsApi` | Comisiones |
| `accessApi` | Logs de acceso |
| `reportsApi` | `/reports/sales|users|production|inventory` |
| `analyticsApi` | Dashboard analítico |
| `companyApi` | Configuración de empresa |
| `employeesApi` | Empleados |
| `alertsApi` | Alertas |
| `tokenStorage` | Persistencia de access/refresh tokens |
| `websocket` / `chatSocket` | WebSockets y chat |

---

## 6. Permisos y roles

### 6.1 Middleware backend
**Archivo:** `software_SurtiTelas.Backend/src/modules/auth/presentation/middlewares/authorize.ts`

```ts
requireRole(...roles)      // permite acceso por rol
requirePermission(code)    // permite acceso por permiso (ADMIN siempre pasa)
```

### 6.2 Sistema de roles
- Roles principales: `ADMIN`, `ASESOR`, `DOMICILIARIO`, `CLIENTE`.
- Roles extendidos para el panel: `ALMACEN`, `PRODUCCION`, `REPORTES`.
- Permisos se almacenan en el array `user.permissions` y se validan con `requirePermission`.

### 6.3 Filtrado de menú
El `AdminLayout` aplica `filterMenuByPermissions` para ocultar items del sidebar según los permisos del usuario. El rol `ADMIN` ve todo.

### 6.4 Debug de permisos
En desarrollo (`import.meta.env.DEV`) hay un botón flotante "Debug permisos" que muestra email, rol, lista de permisos y menú visible. Permite refrescar la sesión sin recargar manualmente.

---

## 7. Módulos del panel

### 7.1 Dashboard
**Archivo:** `presentation/pages/admin/Dashboard.tsx`
- Consume `ordersApi.getDashboard()` → `GET /orders/dashboard`.
- Tarjetas: Total Clientes, Total Pedidos, Producción Activa, Ingresos Totales.
- Gráficos: Barras (ventas por pedido), Pie (estado de pedidos), Línea (tendencia), Top productos bajo stock.
- Tabla de últimos pedidos y actividad reciente.

### 7.2 Clientes
**Archivo:** `presentation/pages/admin/Clientes.tsx`
- CRUD con `customersApi`.
- Búsqueda con debounce, modal de creación/edición.
- Campos: nombre, apellidos, email, teléfono, dirección, documento, NIT, cupo, isTrustedCustomer.

### 7.3 Catálogo / Productos
**Archivo:** `presentation/pages/admin/AdminCatalogo.tsx`
- CRUD de productos terminados (`useProductos` + `catalogApi`).
- Publicar/despublicar, preview, detalle, tags (destacado, oferta, nuevo, más vendido), upload de imágenes.

### 7.4 Pedidos
**Archivo:** `presentation/pages/admin/Pedidos.tsx`
- Listado paginado (`ordersApi.adminList`).
- Filtros: búsqueda, cliente, asesor, estado.
- Acciones: editar estado, aprobar, rechazar, cancelar, eliminar.
- Modal de detalle con items, historial, comprobantes.

### 7.5 Producción
**Archivo:** `presentation/pages/admin/Produccion.tsx`
- CRUD de órdenes (`productionApi`).
- Asignación a talleres, control de avance, items.
- Estados: Pendiente, Asignada, En producción, Completada.

### 7.6 Inventario
**Archivo:** `presentation/pages/admin/Inventario.tsx`
- Movimientos de inventario (`inventoryApi.list`).
- Ajustes: entrada, salida, ajuste.
- Filtros por tipo y motivo.

### 7.7 Categorías
**Archivo:** `presentation/pages/admin/AdminCategorias.tsx`
- CRUD con `categoriesApi`. Filtro por stock bajo.

### 7.8 Domicilios / Ruta del día
**Archivos:** `AdminDomicilios.tsx`, `RutaDelDiaAdmin.tsx`, `AdminDomiciliosLayout.tsx`
- Layout con tabs: Domiciliarios y Ruta del día.
- `domiciliariosApi` (CRUD) y `deliveriesApi.rutaDelDia()`.

### 7.9 Reportes
**Archivos:** `AdminReportes.tsx`, `AdminReportesLayout.tsx`, `ReportesVentas.tsx`, `ReportesUsuarios.tsx`, `ReportesProduccion.tsx`, `ReportesInventario.tsx`
- Layout con tabs.
- Filtros por periodo, cumplimiento, eficiencia, búsqueda.
- KPIs, gráficos (línea, barras, donut, área), tablas con detalle.
- Exportación a CSV (simulada en frontend).

### 7.10 Configuración
**Archivo:** `AdminConfiguracion.tsx`
- `companyApi.get` / `companyApi.update`.
- Campos: nombre, email, teléfono, dirección, ciudad, NIT, moneda.

### 7.11 Gestión de Usuarios
**Archivo:** `GestionUsuarios.tsx`
- CRUD con `usersApi` y `authApi`.
- Asignación de permisos individuales.
- Filtros por rol, estado, búsqueda.

### 7.12 Roles y Permisos
**Archivo:** `GestionRolesPermisos.tsx`
- CRUD de roles y permisos.
- Asignación permiso↔rol.
- Vista de `SYSTEM_MODULES`.

### 7.13 Empleados
**Archivo:** `GestionEmpleados.tsx`
- Solo roles ASESOR y DOMICILIARIO. Campos: cargo, salario, fecha contratación.

### 7.14 Ventas
**Archivo:** `GestionVentas.tsx`
- CRUD de ventas (`salesApi`).
- Creación desde pedidos, cancelación.
- Filtros por asesor, cliente, estado.

### 7.15 Seguridad / Acceso
**Archivos:** `SeguridadUsuarios.tsx`, `GestionAcceso.tsx`
- Logs con `accessApi`.

### 7.16 Compras
**Archivo:** `AdminCompras.tsx`
- CRUD de órdenes de compra (`purchasesApi`).
- Items, proveedores, insumos, cancelación, exportación PDF.

### 7.17 Insumos y Categorías
**Archivos:** `Insumos.tsx`, `AdminCategoriasInsumos.tsx`
- CRUD de insumos y categorías.

### 7.18 Proveedores
**Archivo:** `Proveedores.tsx`
- `stockApi.suppliers`.
- Campos: nombre, NIT, contacto, dirección, materiales.

### 7.19 Pagos
**Archivo:** `Pagos.tsx`
- CRUD con `paymentsApi`.
- Estados: Pendiente, Aprobado, Rechazado, Reembolsado, Anulado.
- Balance cliente, balance cotización, exportación PDF.

### 7.20 Abonos
**Archivo:** `Abonos.tsx`
- Alias que reusa `AdminPagos`.

### 7.21 Facturación / Recibos
**Archivo:** `Recibos.tsx`
- `receiptsApi`. Estados: Borrador, Enviado, Pagado, Vencido, Cancelado. Envío de recibos.

### 7.22 Devoluciones / Stock Devuelto
**Archivo:** `StockDevuelto.tsx`
- `returnsApi`. Estados: Recibido, En inspección, Aprobado, Rechazado, En reparación, Reingresado, Descartado.
- Destinos: Reingreso, Reparación, Descarte, Devolución proveedor.

### 7.23 Talleres
**Archivo:** `RegistroTalleres.tsx`
- `workshopsApi`. Campos: nombre, encargado, dirección, ciudad, contacto, capacidad.

### 7.24 Control de Prendas
**Archivo:** `ControlPrendas.tsx`
- `controlPrendaApi`. Etapas: Corte, Confección, Acabado, Calidad, Empaque.

### 7.25 Asignación de Producción
**Archivo:** `AsignacionProduccion.tsx`
- `productionApi.assignToWorkshop`.

### 7.26 Seguimiento de Producción
**Archivo:** `SeguimientoProduccion.tsx`
- `productionApi` con tracking.

### 7.27 Alertas de Stock
**Archivo:** `AlertasStock.tsx`
- `inventoryApi.listAlerts` / `alertsApi`.
- Estados: Pendiente, Resuelta, Crítico.

### 7.28 Pedidos Personalizados (Cotizaciones)
**Archivo:** `presentation/pages/admin/PedidosPersonalizados.tsx`
- Flujo completo: solicitud → cotización → negociación → pago → producción.
- Wizard con `quotation-steps` (Cliente, Producto, Entrega, Resumen).
- Negociación con hasta 3 rondas por parte.
- Comprobante de pago.
- Estados: SOLICITUD_RECIBIDA, EN_REVISION, COTIZADO, COTIZACION_ACEPTADA, COTIZACION_RECHAZADA, PAGO_PENDIENTE, PAGO_EN_VERIFICACION, PAGO_APROBADO, CONVERTIDO_A_PEDIDO, EN_PRODUCCION, COMPLETADO, CANCELADO, VENCIDO.

### 7.29 Notificaciones
**Archivo:** `AdminNotificaciones.tsx`
- `notificationsApi`. Filtros por tipo, módulo, fecha.

### 7.30 Webhooks
**Archivo:** `Webhooks.tsx`
- `webhooksApi`. Eventos: order.created, order.status.updated, order.delivered, order.canceled, stock.below_minimum, production.completed. Test de webhook.

### 7.31 Comisiones
**Archivo:** `AdminComisiones.tsx`
- `commissionsApi`. Estados: Pendiente, Pagado, Cancelado.

### 7.32 Dashboard Analítico
**Archivo:** `DashboardAnalitico.tsx`
- `analyticsApi.getDashboard()` y `analyticsApi.getComparison()`.

### 7.33 Portal Cliente (admin-side)
**Archivo:** `PortalCliente.tsx` — vista del portal del cliente desde el admin.

---

## 8. Backend consumido por el panel

Módulos en `software_SurtiTelas.Backend/src/modules/`:

| Módulo | Ruta base | Permisos | Endpoints clave |
|--------|-----------|----------|-----------------|
| auth | `/api/v1/auth` | `auth:manage` para admin | login, register, refresh, google, logout, me, users, roles, permissions |
| users | `/api/v1/users` | `auth:manage` | CRUD de usuarios |
| customers | `/api/v1/customers` | `customers:read/write` | CRUD de clientes |
| catalog | `/api/v1/catalog` | público / `catalog:manage` | Productos, categorías, tags |
| orders | `/api/v1/orders` | `orders:read/write` | Pedidos, dashboard, métricas |
| sales-orders | `/api/v1/sales-orders` | `sales:read/write` | Ventas |
| payments | `/api/v1/payments` | `payments:read/write` | Pagos |
| receipts | `/api/v1/receipts` | `receipts:read/write` | Recibos |
| returns | `/api/v1/returns` | `returns:read/write` | Devoluciones |
| production | `/api/v1/production` | `production:read/write` | Órdenes, talleres, prendas, asignación |
| inventory | `/api/v1/inventory` | `stock:read/write` | Movimientos, alertas |
| purchases | `/api/v1/purchases` | `purchases:read/write` | Compras, proveedores |
| deliveries | `/api/v1/deliveries` | `deliveries:read/write` | Entregas, ruta del día |
| custom-orders | `/api/v1/custom-orders` | `custom-orders:read/write` | Cotizaciones, negociación, pagos |
| notifications | `/api/v1/notifications` | `notifications:read/write` | Notificaciones |
| webhooks | `/api/v1/webhooks` | `webhooks:manage` | Webhooks |
| reports | `/api/v1/reports` | `orders:read`, `stock:read`, `production:read`, `auth:manage` | sales, users, production, inventory |
| analytics | `/api/v1/analytics` | `analytics:read` | Dashboard analítico |
| commissions | `/api/v1/commissions` | `commissions:read/write` | Comisiones |
| access | `/api/v1/access` | `auth:manage` | Logs de acceso |
| company | `/api/v1/company` | `company:manage` | Configuración de empresa |
| employees | `/api/v1/employees` | `employees:read/write` | Empleados |

**Middleware global:**
- `authenticate` — valida JWT en cada request.
- `requireRole(...)` — filtra por rol.
- `requirePermission(code)` — filtra por permiso.
- `cacheMiddleware(seconds)` — cachea respuestas (300s ventas, 600s inventario).

**Patrón por módulo:** `domain` → `application/use-cases` → `infrastructure/repositories` → `presentation/{controllers,routes,validators}` → `infrastructure/container`.

---

## 9. Configuración y constantes

### 9.1 Variables de entorno del frontend
**Archivo:** `software_SurtiTelas.Fronend/.env` y `.env.example`

- `VITE_API_URL` — base de la API (default `http://localhost:3000/api/v1`).
- `VITE_WS_URL` — WebSockets.
- `VITE_OPENAPI_URL` — para generación de tipos.
- `VITE_ADMIN_BRAND_NAME`, `VITE_ADMIN_PANEL_LABEL` — branding.
- `VITE_ADMIN_MENU_*` — labels del menú del sidebar (sobrescriben los fallbacks).
- `VITE_ADMIN_DASHBOARD_*`, `VITE_ADMIN_STAT_*`, `VITE_ADMIN_CHART_*`, `VITE_ADMIN_TABLE_*` — textos del dashboard.
- `VITE_ADMIN_CONFIG_*` — textos de configuración.
- `VITE_ADMIN_REPORTS_*` — textos de reportes.

### 9.2 Contenido del admin
**Archivo:** `software_SurtiTelas.Fronend/src/shared/config/adminContent.ts`

Estructura principal:
```ts
{
  layout: {
    brandName, panelLabel, userRoleLabels,
    menu: { dashboard, configuracion, usuarios, inventario, compras,
            ventas, produccion, domicilios, reportes, catalogo,
            finanzas, webhooks, rutaDelDia }
  },
  dashboard: { title, subtitle, loading, error, stats, charts, tables },
  configuration: { title, fields, fallbacks, save, success, error },
  reports: { title, stats, charts, table, states, relativeTimes }
}
```

### 9.3 Constantes compartidas
**Archivo:** `software_SurtiTelas.Fronend/src/shared/constants/options.ts`

- `PERIODOS_REPORTE_VENTAS` / `PERIODOS_REPORTE_INVENTARIO`
- `FILTROS_CUMPLIMIENTO` / `FILTROS_EFICIENCIA`
- `ORDER_STATUS_COLORS` / `CUSTOM_ORDER_STATUS_COLORS`
- `ROLES_SISTEMA`, `ROL_LABELS`, `ROL_COLORS`

### 9.4 Backend
**Archivo:** `software_SurtiTelas.Backend/src/config/env.ts`

Valida con Zod: `DATABASE_URL`, `REDIS_URL`, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `CORS_ORIGIN`, `RATE_LIMIT_MAX`, `METRICS_SECRET`, `METRICS_ALLOWED_IPS`, `EVENT_BUS`, `LOG_LEVEL`, `SMTP_*`.

---

## 10. Particularidades técnicas

1. **Tema scoped al dashboard:** `useDashboardTheme` aplica dark/light solo a páginas con `data-dashboard-theme`. Páginas públicas mantienen su tema.

2. **Sidebar persistente:** estado colapsado se guarda en `localStorage` con clave `surtitelas.sidebarCollapsed`.

3. **Debug permisos (solo DEV):** botón flotante que muestra email, role, lista de permisos y menú visible. Permite forzar `checkSession()` y recargar.

4. **Cache por ruta:** el backend aplica `cacheMiddleware(300|600)` a endpoints de reportes. Se invalida con headers estándar.

5. **WebSockets y chat:** módulo `chat` se conecta a `ws://localhost:3000` por defecto; configurable vía `VITE_WS_URL`.

6. **Prisma Studio:** disponible en `http://localhost:5555` con `npx prisma studio` desde `software_SurtiTelas.Backend`.

7. **Swagger:** documentación de la API en `http://localhost:3000/api/docs`.

8. **Exportación CSV:** botón de exportar en TopHeader genera CSV con los productos top de `reportsApi.getSalesReport()`.

9. **Rutas con alias:** varias rutas legacy redirigen a las nuevas (ej. `/admin/reportes-ventas` → `/admin/reportes/ventas`).

10. **Cache de productos/categorías:** stores Zustand sincronizan con el backend mediante hooks (`useProductos`, `useCategorias`).

11. **Roles extendidos del panel:** además de los roles de negocio (`admin`, `asesor`, `domiciliario`, `cliente`), el frontend reconoce `almacen`, `produccion`, `reportes` para sub-perfiles administrativos.

12. **Wizard de cotización:** el módulo de pedidos personalizados usa un wizard de 4 pasos (Cliente → Producto → Entrega → Resumen) con negociación multi-ronda y validaciones por paso.

---

## 11. Diccionario de endpoints

### Auth
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/register`
- `POST /api/v1/auth/refresh`
- `POST /api/v1/auth/google`
- `POST /api/v1/auth/logout`
- `GET /api/v1/auth/me`
- `PATCH /api/v1/auth/me`

### Customers
- `GET /api/v1/customers`
- `POST /api/v1/customers`
- `GET /api/v1/customers/:id`
- `PATCH /api/v1/customers/:id`
- `DELETE /api/v1/customers/:id`

### Catalog
- `GET /api/v1/catalog/products`
- `POST /api/v1/catalog/products`
- `GET /api/v1/catalog/products/:id`
- `PATCH /api/v1/catalog/products/:id`
- `DELETE /api/v1/catalog/products/:id`
- `GET /api/v1/catalog/categories`
- `POST /api/v1/catalog/categories`
- `PATCH /api/v1/catalog/categories/:id`
- `DELETE /api/v1/catalog/categories/:id`

### Orders
- `GET /api/v1/orders`
- `POST /api/v1/orders`
- `GET /api/v1/orders/:id`
- `PATCH /api/v1/orders/:id`
- `DELETE /api/v1/orders/:id`
- `GET /api/v1/orders/dashboard` — métricas del dashboard

### Sales
- `GET /api/v1/sales-orders`
- `POST /api/v1/sales-orders`
- `PATCH /api/v1/sales-orders/:id`
- `DELETE /api/v1/sales-orders/:id`

### Production
- `GET /api/v1/production`
- `POST /api/v1/production`
- `PATCH /api/v1/production/:id`
- `POST /api/v1/production/:id/assign`

### Inventory
- `GET /api/v1/inventory/movements`
- `POST /api/v1/inventory/movements`
- `GET /api/v1/inventory/alerts`

### Reports
- `GET /api/v1/reports/sales?from=&to=`
- `GET /api/v1/reports/inventory`
- `GET /api/v1/reports/production`
- `GET /api/v1/reports/users?from=&to=`

### Custom Orders
- `GET /api/v1/custom-orders`
- `POST /api/v1/custom-orders`
- `PATCH /api/v1/custom-orders/:id`
- `POST /api/v1/custom-orders/:id/quotation`
- `POST /api/v1/custom-orders/:id/negotiate`
- `POST /api/v1/custom-orders/:id/payment-proof`
- `PATCH /api/v1/custom-orders/:id/payment`

### Notifications
- `GET /api/v1/notifications`
- `POST /api/v1/notifications`
- `PATCH /api/v1/notifications/:id/read`

### Webhooks
- `GET /api/v1/webhooks`
- `POST /api/v1/webhooks`
- `PATCH /api/v1/webhooks/:id`
- `DELETE /api/v1/webhooks/:id`
- `POST /api/v1/webhooks/:id/test`

### Analytics
- `GET /api/v1/analytics/dashboard`
- `GET /api/v1/analytics/comparison`

### Company
- `GET /api/v1/company`
- `PATCH /api/v1/company`

---

> **Generado a partir de la auditoría de:** `C:\Users\usuario\surti_telas\software_SurtiTelas.Fronend` y `C:\Users\usuario\surti_telas\software_SurtiTelas.Backend`.

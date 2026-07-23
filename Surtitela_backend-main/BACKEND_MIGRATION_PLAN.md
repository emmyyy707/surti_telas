# BACKEND_MIGRATION_PLAN

## 1. Estado actual del backend

### 1.1 Arquitectura
- Backend Node.js + TypeScript con Express.
- Estructura de capas: `modules`, `shared`, `core`, `infra`, `usecases`.
- Se utiliza Prisma con PostgreSQL y Prisma Client generado.
- Autenticación con JWT, `verifyToken`, `authorizeRoles`.
- Validaciones centralizadas en `src/shared/validation.ts`.
- Respuestas estandarizadas en `src/shared/http.ts`.

### 1.2 Módulos clave existentes
- Auth: `src/modules/auth` y `src/infra/prisma/prisma-auth.repository.ts`.
- Productos: `src/modules/products` y `src/infra/prisma/prisma-product.repository.ts`.
- Pedidos: `src/modules/orders` y `src/infra/prisma/prisma-order.repository.ts`.
- Clientes: `src/modules/customers`.
- Perfil: `src/modules/profile`.
- Checkout: `src/modules/checkout`.
- Producción: `src/modules/productions`.
- Inventario/stock: `src/modules/supplies`.
- Reportes: `src/modules/reportes`.
- Usuarios, roles y permisos: módulos específicos.

### 1.3 Estado de datos
- Prisma schema cubre tablas de `users`, `products`, `orders`, `customers`, `deliveries`, `payments`, `productions`, `supplies`, etc.
- Modelo de datos actual es amplio pero no coincide con los DTOs del frontend.
- No existen tablas específicas para direcciones de cliente ni notificaciones.
- `orders.status` se modela como booleano.
- `products.status` se usa para publicado.

### 1.4 Rutas montadas
- Rutas públicas: `/api/auth`, `/api/productos`, `/api/inventario`, `/api/catalogo`.
- Rutas protegidas: `/api/usuarios`, `/api/pedidos`, `/api/clientes`, `/api/profile`, `/api/checkout`.
- Se usan alias innecesarios (`/api/inventario`, `/api/catalogo`).

## 2. Estado esperado según el contrato

### 2.1 Endpoints frontend clave
- `/auth/login`
- `/auth/logout`
- `/auth/me`
- `/products`
- `/products/{id}`
- `/products/{id}/publish`
- `/products/{id}/unpublish`
- `/customers`
- `/customers/{id}`
- `/customers/me`
- `/customers/me/addresses`
- `/customers/me/addresses/{id}`
- `/customers/me/password`
- `/orders`
- `/orders/{id}`
- `/orders/{id}/status`
- `/production-orders`
- `/inventory/movements`
- `/checkout/confirm`
- `/dashboard/metrics`
- `/notifications`
- `/notifications/{id}/read`
- `/notifications/read-all`
- `/support-reports`

### 2.2 Entidades contractuales
- User
- Product
- Customer
- Address
- Order
- OrderItem
- ProductionOrder
- InventoryMovement
- Notification
- SupportReport
- DashboardMetrics

### 2.3 Reglas de negocio esperadas
- Roles: `admin`, `asesor`, `domiciliario`, `cliente`.
- Pedidos con múltiples estados de flujo: `Nuevo`, `En producción`, `Listo`, `Despachado`, `En camino`, `Entregado`, `Cancelado`.
- Productos con `stock`, `cantidadStock`, `publicado`, `tela`, `colores`, `tallas`, `imagenes` y metadata extendida.
- Clientes con ciudad, teléfono, estado, pedidos, cupo, deuda.
- Checkout con banco, tipo de pago, cuotas, comprobante.

## 3. Diferencias detectadas

### 3.1 Autenticación
- La lógica de login/logout/me existe.
- El payload actual usa `token` y `refreshToken`, no `accessToken`.
- `GET /auth/me` devuelve wrapper `{status,data}` en vez de `User` directo.
- El backend ya emite `user` con nombre y rol.

### 3.2 Productos
- El backend lista y crea productos, pero el esquema en respuesta no coincide.
- Falta `ref`, `codigo`, `nombre`, `categoria`, `cantidadStock`, `imagenes`, `publicado`, `tela`, `colores`, `tallas` exactos.
- Se usa `name`, `price`, `imagen`, `stock`, `status` en lugar de los campos del contrato.
- Publish/unpublish existen pero con `PATCH` y URL por `:ref`, no `POST /products/{id}/publish`.

### 3.3 Clientes y perfil
- `GET /customers`, `POST /customers`, `GET /customers/:id`, `PATCH /customers/:id`, `DELETE /customers/:id` existen conceptualmente.
- Payload del backend se basa en `customers` vinculado a `users`, no en el esquema de cliente del frontend.
- `GET /customers/me` no existe directamente; `/api/profile` brinda perfil de usuario authentificado.
- No existen endpoints de direcciones ni cambio de contraseña de cliente.

### 3.4 Pedidos
- Endpoints CRUD de pedidos existen.
- Estado de pedido actual es booleano/`Nuevo`/`Cancelado`; no soporta el conjunto del contrato.
- El modelado de items, pagos y envíos está presente pero simplificado.

### 3.5 Checkout
- `/checkout/confirm` existe y puede reutilizarse.
- DTOs y nombres de campos requieren alineamiento.

### 3.6 Producción e inventario
- Existe módulo de producción (`productions`) y supplies/inventario, pero no bajo las rutas contractuales esperadas.
- `production-orders` no existe; `inventory/movements` no existe.
- Hay funcionalidad parcial en los módulos existentes, pero diferente nomenclatura.

### 3.7 Dashboard, notificaciones y soporte
- No existe código para `dashboard/metrics`, `notifications`, ni `support-reports`.
- Reportes genéricos existen en `reportes`, pero no mapean directamente a `dashboard/metrics`.

### 3.8 Esquema de datos
- Prisma actual carece de tablas específicas para: `addresses`, `notifications`, `support_reports`, `inventory_movements`, `production_orders` con campos contractuales.
- `orders.status` y `products.status` son booleanos, insuficientes para estados esperados.
- `customers` no incluye muchos atributos contractuales.

## 4. Cambios necesarios

### 4.1 Rutas y exposición
- Re-mapear `/api/auth` a `/auth` si el contrato exige esa ruta exacta.
- Re-mapear `/api/productos` a `/products` y normalizar los query params.
- Re-mapear `/api/clientes` a `/customers`.
- Re-mapear `/api/pedidos` a `/orders`.
- Re-mapear `/api/profile` a `/customers/me` en el contrato.
- Eliminar o dejar como deprecated los aliases `/api/inventario` y `/api/catalogo`.

### 4.2 DTOs de productos
- Ajustar `products.controller.ts`/`products.service.ts` para exponer el contrato de `Product`.
- Mapear `name` -> `nombre`, `description` -> `descripcion`, `imagen` -> `imagenes`/`imagenPrincipal`, `status` -> `publicado`/`estado`, `stock`/`cantidadStock`.
- Añadir campos opcionales contractuales a las respuestas y payloads.

### 4.3 Clientes y perfil
- Crear adaptador entre `users`+`customers` y `Customer` contract.
- Implementar `GET /customers/me` y `PATCH /customers/me` usando perfil autenticado.
- Añadir endpoints de direcciones de cliente y cambio de contraseña.
- Revisar si `customers` debe convertirse en entidad principal o si `users` actúa como cliente.

### 4.4 Pedidos
- Cambiar `orders.status` para soportar múltiples estados en lugar de booleano.
- Ajustar mapeo de respuesta `estado` para incluir estados del contrato.
- Revisar `OrderItem` y `itemsList` para ser compatibles.

### 4.5 Producción e inventario
- Crear rutas contractuales `production-orders` y `inventory/movements`.
- Reutilizar la lógica de `productions` y `supplies` si es apropiado o crear nuevos adaptadores.

### 4.6 Dashboard / Notifications / Support
- Implementar `dashboard/metrics`, `notifications`, y `support-reports`.
- Reusar `reportes` para métricas de dashboard si los datos encajan.
- Crear nuevos modelos y rutas para notificaciones y reportes de soporte.

### 4.7 Prisma y migraciones
- Añadir nuevas tablas necesarias para: `addresses`, `notifications`, `support_reports`, `inventory_movements`, `production_orders` más completas.
- Cambiar campos existentes: `orders.status` de booleano a enum/string; `products.stock`/`status` puede mantenerse pero se necesita mayor metadata.
- Posiblemente extender `customers` con atributos contractuales.
- Crear migraciones para las nuevas tablas y cambios de tipo.

## 5. Riesgos

### Con mayor riesgo
- Cambiar `orders.status` de booleano a estado enumerado: 
  - Riesgo alto de romper datos existentes y lógica de consulta.
  - Requiere migración en DB y ajustes en consultas/reportes.

- Reestructurar `customers` vs `users`:
  - Riesgo alto si el contrato exige cliente como entidad y backend actual separa `users`/`customers`.
  - Impacta autenticación, perfil y relaciones.

- Ajustar rutas contractuales globales:
  - Riesgo medio de romper integraciones existentes de frontend y Postman.

### Riesgo medio
- DTO de productos y clientes: cambio extenso pero localizable en controladores.
- Checkout/confirm: compatible si se normaliza el payload.
- Implementación de endpoints faltantes con nuevas tablas.

### Riesgo bajo
- Alias redundantes y rutas internas: se pueden desactivar sin impacto directo si se mantienen como deprecated.
- Reutilización de `shared/http` y validaciones.

## 6. Estrategia de migración

### Fase 1: Cambios sin riesgo
- Añadir adaptadores de ruta sin eliminar endpoints antiguos.
- Exponer rutas contractuales y mantener aliases temporales.
- Ajustar respuestas en controladores para cumplir JSON del contrato.
- Normalizar DTOs internos sin cambiar la DB.

### Fase 2: Cambios compatibles
- Ajustar parámetros de consulta y nombres de propiedades.
- Adaptar controladores existentes para devolver el schema esperable.
- Modificar validaciones en `validation.ts` y `controllers`.
- Reutilizar servicios/repositories existentes para estas rutas nuevas.

### Fase 3: Cambios que requieren migraciones de Prisma
- Cambiar `orders.status` a enum/string.
- Añadir entidades contractuales faltantes en Prisma.
- Extender `customers`/`users` con campos adicionales.

### Fase 4: Nuevos módulos
- Implementar `notifications` y `support-reports` con nuevas rutas y tablas.
- Crear `production-orders` y `inventory/movements` si no puede reutilizarse directamente.

### Fase 5: Eliminación de código obsoleto
- Remover aliases `/api/inventario` y `/api/catalogo` después de la migración.
- Eliminar `profile`/`customers` duplicados si un solo módulo cubre el contrato.
- Deprecate endpoints antiguos en favor de los contractuales.

## 7. Orden recomendado de implementación

1. Exponer rutas contractuales y alias temporales.
2. Ajustar controladores para DTO contractuales en auth/productos/clientes/pedidos/checkout.
3. Implementar `GET /customers/me` y `PATCH /customers/me` con adaptadores.
4. Normalizar `GET /auth/me` y `POST /auth/login` al schema OpenAPI.
5. Adaptar `orders.status` y validar estados adicionales.
6. Añadir tablas contractuales faltantes y migraciones.
7. Implementar `addresses`, `dashboard/metrics`, `notifications`, `support-reports`.
8. Eliminar endpoints redundantes y aliases.

## 8. Código reutilizable

### Controladores reutilizables
- `src/modules/auth/controller/auth.controller.ts` (login/refresh/logout/me)
- `src/modules/products/controller/products.controller.ts` (list/get/create/update/publish/unpublish/delete)
- `src/modules/orders/controller/orders.controller.ts` (list/get/create/update/status/delete)
- `src/modules/customers/controller/customers.controller.ts` (list/get/create/update/delete)
- `src/modules/checkout/controller/checkout.controller.ts` (confirm)
- `src/modules/profile/controller/profile.controller.ts` (perfil autenticado)
- `src/modules/productions/controller/productions.controller.ts` (producción básica)
- `src/modules/reportes/controller/reportes.controller.ts` (métricas reportes)

### Servicios reutilizables
- `src/modules/products/service/products.service.ts`
- `src/modules/orders/service/orders.service.ts`
- `src/modules/customers/service/customers.service.ts`
- `src/modules/checkout/service/checkout.service.ts`
- `src/modules/users/service/users.service.ts`
- `src/modules/productions/service/productions.service.ts`
- `src/modules/supplies/service/supplies.service.ts`
- `src/modules/reportes/service/reportes.service.ts`

### Repositorios reutilizables
- `src/infra/prisma/prisma-auth.repository.ts`
- `src/infra/prisma/prisma-product.repository.ts`
- `src/infra/prisma/prisma-order.repository.ts`

### DTOs reutilizables
- `src/core/domain/user.ts`
- `src/core/domain/product.ts`
- `src/core/domain/order.ts`
- `src/modules/customers/service/customers.service.ts` (como base de mapeo)

### Validadores reutilizables
- `src/shared/validation.ts`
- `src/shared/http.ts`
- `src/shared/auth.ts`

## 9. Código obsoleto / deuda técnica

### Deuda crítica
- `orders.status` modelado como booleano en lugar de enum de flujo de pedidos.
- Falta de tablas para direcciones, notificaciones y soporte.
- `customers` no mapea al contrato de cliente del frontend.
- Endpoints contractuales no expuestos con rutas diferentes.

### Deuda alta
- Alias `/api/inventario` y `/api/catalogo` duplican funcionalidad.
- Se mezclan `profile` y `customers` para el mismo concepto de usuario autenticado.
- `Auth` usa wrappers `status` en respuestas que no coinciden con OpenAPI.
- `products` no usa el esquema de campos del contrato.

### Deuda media
- Controladores con lógica de mapeo de DTOs porque no hay capa dedicada de adaptadores.
- `reportes` no están alineados con `dashboard/metrics`.

### Deuda baja
- Validación de campos es genérica y no aprovecha esquemas estrictos.
- Algunos servicios (`productions`, `supplies`) son funcionales pero no contractuales.

### Código que debe evaluarse antes de eliminar
- Alias en `src/shared/app.ts`: `inventario`, `catalogo`.
- Rutas duplicadas `PUT/PATCH` en `customers` y `profile`.
- Módulos existentes de reportes y producción que pueden ser adaptados.

## 10. Estimación de complejidad por módulo

### Bajo
- Auth: solo DTO y ruta.
- Checkout: adaptar payload sin cambiar lógica básica.
- Productos: mapear campos y normalizar respuestas.
- Alias de rutas: baja complejidad de eliminación.

### Medio
- Clientes/perfil: unificar perfil autenticado y cliente, ajustar DTOs de cliente.
- Pedidos: soportar estados adicionales y mapear items.
- Reportes/dashboard: reutilizar reportes existentes hacia métricas.

### Alto
- Migración de Prisma para `orders.status` y nuevas tablas de `addresses`, `notifications`, `support_reports`, `inventory_movements`, `production_orders` contractuales.
- Reestructuración de `customers` / `users` si se decide fusionar.

## Apéndice: Impacto de cambios de Prisma

### Tablas que deben cambiar o agregarse
- `customers`: extender con `nombre`, `ciudad`, `tel`, `asesor`, `pedidos`, `estado`, `nit`, `cupoTotal`, `cupoUsado`, `deudaVencida`, `isTrustedCustomer`.
- `orders`: cambiar `status` a enum/string y posiblemente agregar `priority`, `observaciones`.
- `products`: agregar metadata opcional de frontend, o crear adaptador de respuesta.
- Nuevas tablas:
  - `addresses`
  - `notifications`
  - `support_reports`
  - `inventory_movements`
  - `production_orders` con campos contractuales

### Migraciones necesarias
- Creación de tablas nuevas.
- Cambio de tipo `orders.status`.
- Extensión de `customers`/`products`/`users` si se busca compatibilidad directa.
- Posible migración de datos para convertir `status` booleano a estado de pedido.

## Conclusión
El backend actual es adaptativo y puede alinearse con el contrato. La mejor estrategia es:
1. Exponer rutas contractuales y normalizar DTOs primero.
2. Reutilizar servicios/repositories existentes.
3. Luego aplicar migraciones de Prisma solo cuando sea inevitable.

No hay que implementar nuevas funcionalidades antes de tener la unificación de rutas y DTOs, y siempre debe evitarse duplicar lógica.

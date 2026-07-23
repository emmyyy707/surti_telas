# Backend Technical Impact Analysis

## 1. Objetivo

Este documento entrega un análisis técnico de alto nivel para alinear el backend actual de `backendfinal` con el contrato observado en `software_SurtiTelas.Fronend/OPENAPI_SURTITELAS.yaml`.

El objetivo es ofrecer un único punto de decisión para:
- identificar brechas funcionales entre rutas y DTOs
- estimar el impacto en Prisma/DB/migraciones
- priorizar la implementación sin inventar lógica nueva
- definir un roadmap y un plan de pruebas alineado con el contrato frontend

## 2. Estado actual del backend

### 2.1 Arquitectura

- Node.js + TypeScript + Express 5
- Prisma v7 con PostgreSQL
- Clean Architecture parcial:
  - `src/modules/*` para rutas, controladores, servicios
  - `src/infra/prisma/*` para repositorios
  - `src/shared/*` para auth, http, validación, dependencias
- `package.json` usa `tsx watch src/server.ts` en desarrollo y `prisma generate && tsc` en build.

### 2.2 Rutas expuestas actualmente

En `src/shared/app.ts` se exponen rutas con prefijo `/api`:
- públicas:
  - `/api/auth`
  - `/api/productos`
  - `/api/inventario` (alias interno a `listProducts`)
  - `/api/catalogo` (alias a `listProducts` con `publicado=true`)
- protegidas:
  - `/api/usuarios`
  - `/api/pedidos`
  - `/api/clientes`
  - `/api/profile`
  - `/api/checkout`

### 2.3 Módulos existentes clave

- Auth: `src/modules/auth`
- Products: `src/modules/products`
- Orders: `src/modules/orders`
- Customers: `src/modules/customers`
- Profile: `src/modules/profile`
- Checkout: `src/modules/checkout`
- Producción: `src/modules/productions`
- Inventario: `src/modules/supplies`
- Reportes: `src/modules/reportes`

### 2.4 Modelo de datos actual (Prisma)

En `prisma/schema.prisma` existen 28 modelos, entre ellos:
- `users`
- `customers`
- `products`
- `orders`
- `orders_details`
- `deliveries`
- `payments`
- `productions`
- `production_details`
- `supplies`
- `products_category`
- `roles`, `permissions`

Observaciones clave:
- `orders.status` está modelado como `Boolean?` con valores `true`/`false`.
- `products.status` está modelado como `Boolean?` y se usa como publicado.
- No hay tablas específicas para `addresses`, `notifications`, `support_reports`, `inventory_movements`, `production_orders` contractuales.
- `customers` es una entidad vinculada a `users` vía `id_user`.
- `users` contiene campos `name`, `last_name`, `email`, `password`, `address`, `id_role`, `id_document_type`.

## 3. Contrato frontend vs backend actual

### 3.1 Matriz de rutas contractuales observadas

| Contrato frontend | Backend actual | Compatibilidad | Observaciones |
|---|---|---|---|
| `/auth/login` | `/api/auth/login` | parcial | Existe, pero el output JSON es `{status, token, refreshToken, user}` en lugar de `{accessToken, user}`. |
| `/auth/logout` | `/api/auth/logout` | parcial | Existe, pero usa `POST /logout` y requiere token. |
| `/auth/me` | `/api/auth/me` | parcial | Existe, pero envuelve el usuario en `{status, data}`. |
| `/products` | `/api/productos` | parcial | Existe en español y con query params diferentes. |
| `/products/{id}` | `/api/productos/:id` y `/:ref` | parcial | Existe, pero se distingue ID vs referencia y no usa ruta contract exacta. |
| `/products/{id}/publish` | `/api/productos/:ref/publish` | parcial | Similar, pero usa `PATCH` y `ref`. |
| `/products/{id}/unpublish` | `/api/productos/:ref/unpublish` | parcial | Similar, pero usa `PATCH` y `ref`. |
| `/customers` | `/api/clientes` | parcial | Existe, pero payload backend es `customers` unido a `users`. |
| `/customers/{id}` | `/api/clientes/:id` | parcial | Existe. |
| `/customers/me` | no existente | no implementado | `GET /api/profile` es user profile, no customer profile. |
| `/customers/me/addresses` | no existente | no implementado | No hay entidad de direcciones. |
| `/customers/me/password` | no existente | no implementado | No hay endpoint específico. |
| `/orders` | `/api/pedidos` | parcial | Existe. |
| `/orders/{id}` | `/api/pedidos/:id` | parcial | Existe. |
| `/orders/{id}/status` | `/api/pedidos/:id/status` | parcial | Existe. |
| `/production-orders` | no existente | no implementado | Existe módulo `productions` pero no ruta contract. |
| `/inventory/movements` | no existente | no implementado | Módulo `supplies` no coincide. |
| `/checkout/confirm` | `/api/checkout/confirm` | compatible | Existe y está protegido con token. |
| `/dashboard/metrics` | no existente | no implementado | No hay ruta contract equivalente. |
| `/notifications` | no existente | no implementado | No hay entidad ni rutas. |
| `/support-reports` | no existente | no implementado | No hay ruta contract equivalente. |

### 3.2 Matriz de DTOs clave y mapeo actual

| Entidad | Contrato | Backend actual | Gap | Nota |
|---|---|---|---|---|
| User | `id,email,role,name` | `users` + auth user object | compatible con adaptación | `roles` existen, pero el campo `name` se separa en `name` y `last_name`. |
| Product | `ref,codigo,nombre,categoria,precio,cantidadStock,imagenes,publicado,...` | `products` con `name,price,description,imagen,stock,status` | alto | Falta `ref`, `codigo`, `cantidadStock`, `imagenes`, `imagenPrincipal`, `tela`, `colores`, `tallas`, `estado`, etc. |
| Customer | `id,nombre,ciudad,tel,pedidos,estado,nit,cupoTotal,cupoUsado,deudaVencida,isTrustedCustomer` | `customers` normalizado a `CustomerPublic` | medio | Backend expone nombre, teléfono, email, dirección; no expone ciudad, nit, cupo, deuda, trusted. |
| Order | `id,clienteId,items,total,estado,direccionEntrega,metodoPago,paymentStatus,...` | `orders` + `orders_details` + `deliveries` + `payments` | compatible con adaptación | `items` y totals existen; estado es binario; pagos y direcciones están parciales. |
| Address | contract | no existe | no implementado | requiere nueva tabla/entidad. |
| ProductionOrder | contract | `productions` / `production_details` | no implementado | requiere ruta y probablemente nuevo modelado. |
| InventoryMovement | contract | `supplies` / `products` | no implementado | falta entidad clara. |
| Notification | contract | no existe | no implementado | requiere nueva tabla/servicio. |
| SupportReport | contract | no existe | no implementado | requiere nueva tabla/servicio. |

### 3.3 Observaciones de estados de negocio

- `orders.status` se normaliza en `orders.service.ts` como `Nuevo` o `Cancelado`.
- El contrato espera un flujo más rico de estados de pedido.
- `products.status` se usa como `publicado`, pero también hay flags de `destacado`, `nuevo`, `oferta` y metadatos que no están en DB.
- `customers` se usa como wrapper ligero de `users` y no representa la entidad cliente enriquecida del contrato.

## 4. Impacto Prisma / DB

### 4.1 Cambios estructurales necesarios

#### Entidades nuevas requeridas

- `addresses`
- `notifications`
- `support_reports`
- `inventory_movements`
- `production_orders`

#### Campos existentes a modificar

- `orders.status`: convertir de `Boolean?` a `String` o `enum` de estados.
- `products`:
  - `stock` puede mantenerse, pero debe mapear a `cantidadStock`.
  - `status` se debe mantener para `publicado`, pero agregar `published_at`/`fechaPublicacion` y flags `destacado`, `nuevo`, `oferta`, `masVendido`.
- `customers`: extender con campos contractuales como `ciudad`, `nit`, `cupo_total`, `cupo_usado`, `deuda_vencida`, `is_trusted_customer`.
- `users`: si `Customer` se materializa independientemente, revisar si `id_user` de `customers` debe dejar de ser único.

### 4.2 Dependencias de datos detectadas

- `customers` depende de `users` (foreign key `id_user`).
- `orders` depende de `customers` y tiene relaciones con `deliveries`, `orders_details`, `payments`, `returns`, `sales`.
- `products` depende de `products_category` y se relaciona con `orders_details`, `productions`, `purchasing_details`, `returns_details`, `sales_details`.
- `productions` depende de `workshops` y `products`.
- `payments` depende de `orders`.

### 4.3 Migraciones críticas

- `orders.status` a enum/string: riesgo alto de datos incompatibles.
- Nueva tabla `addresses` con relación a `customers` y/o `users`.
- Nueva tabla `notifications` con relación a `users`.
- Nueva tabla `support_reports` con relación a `users` y/o `customers`.
- Nueva tabla `production_orders` o ajuste de `productions` para alinearse con contrato.
- Posible creación de tabla `inventory_movements` y/o `stock_movements`.

### 4.4 Recomendación de estrategia Prisma

1. Mantener lógicas de lectura actuales mientras se implementan adaptadores contractuales en controladores.
2. Crear nuevos modelos en Prisma para entidades faltantes antes de reescribir rutas clave.
3. Migrar `orders.status` en una segunda fase, idealmente usando `String` y mapeos temporales de valores booleanos.
4. Generar migraciones incrementales con `prisma migrate dev` y validar cada cambio con tests de integridad de relaciones.

## 5. Roadmap de implementación recomendado

### Fase 1: Alineación de rutas y adaptadores sin cambios de DB

- Exponer rutas contractuales exactas en `src/shared/app.ts`.
  - `/auth`, `/products`, `/customers`, `/orders`, `/checkout`, etc.
- Mantener alias `/api/productos` y `/api/inventario` como deprecated durante transición.
- Redirigir o mapear internamente hacia controladores existentes.
- Ajustar respuesta de auth:
  - `login` → `accessToken`
  - `me` → devolver `User` directo
- Implementar adaptadores para que las respuestas de producto, pedido y cliente cumplan con los DTOs contract.
- Agregar `GET /customers/me` y `PATCH /customers/me` reusando `src/modules/profile`.

### Fase 2: Normalización de DTOs y parámetros de consulta

- Cambiar `products.controller.ts` para aceptar y devolver campos contractuales.
- Normalizar `listProducts` y `listPublishedProducts` para admitir query params `published` y `search`.
- Ajustar las rutas de publicación/unpublish a `POST /products/{id}/publish` y `POST /products/{id}/unpublish` si el contrato lo exige.
- Revisar `customers.controller.ts` para exponer `Customer` con campos contractuales.
- Ajustar `orders.controller.ts` para incluir `OrderItem` y `Order` contract.
- Reutilizar `checkout.service.ts` para `checkout/confirm` y garantizar que el payload contract coincide.

### Fase 3: Implementación de entidades faltantes y DB migration

- Agregar las tablas faltantes en `prisma/schema.prisma`.
- Crear `src/modules/addresses`, `notifications`, `support-reports`, `production-orders`, `inventory/movements` si es necesario.
- Crear migraciones con `prisma migrate dev --name add-contract-entities`.
- Validar que las nuevas tablas se integren con los repositorios y servicios existentes.

### Fase 4: Ajustes de estado y flujo de negocio

- Reescribir `orders.status` para soportar estados múltiples.
- Actualizar `products` para soportar campos de marketing y listado avanzado.
- Reforzar validaciones de `checkout` y `customers/me/password`.
- Normalizar `GET /auth/me` y `POST /auth/login` a la especificación OpenAPI.

### Fase 5: Deprecación y limpieza

- Eliminar aliases `/api/inventario` y `/api/catalogo` una vez que `/products` funcione.
- Remover rutas duplicadas o módulos superpuestos.
- Consolidar `profile` y `customers/me` si corresponden al mismo dominio.

## 6. Riesgos y mitigaciones

### Riesgos de mayor impacto

- `orders.status` booleano → enum/string:
  - Impacto: lógicas de consulta, reportes y migraciones de datos.
  - Mitigación: introducir valores nuevos con compatibilidad temporal, migración en etapa controlada.

- `customers` vs `users`:
  - Impacto: autenticación, perfiles, customer self-service.
  - Mitigación: mantener el modelo `customers` actual mientras se agrega el contrato `Customer` como vista/adapter.

- Nuevas rutas contractuales y tablas faltantes:
  - Impacto: gran alcance funcional.
  - Mitigación: priorizar los endpoints obligatorios (`/checkout/confirm`, `/orders`, `/customers/me`) y ejecutar en iteraciones.

### Riesgos medianos

- Desalineación de payload de productos:
  - Impacto: frontend no podrá renderizar catálogo correctamente.
  - Mitigación: crear adaptadores y tests de contrato.

- Rutas con prefijo `/api` mientras frontend espera rutas planas:
  - Impacto: fallas de integración.
  - Mitigación: exponer el mismo path exacto y usar middleware de redirección si es necesario.

### Riesgos bajos

- Alias de rutas redundantes.
- Estructura del módulo `reportes` vs `dashboard/metrics`.
- `support-reports` sin implementación de backend.

## 7. Pruebas sugeridas

### Validación contract-first

- Construir tests de integración para cada ruta contract:
  - `/auth/login`, `/auth/me`, `/products`, `/products/{id}`, `/orders`, `/customers/me`, `/checkout/confirm`.
- Validar status codes y esquema JSON de respuesta.
- Verificar headers y autenticación JWT.

### Casos de prueba de migración

- `orders.status`:
  - valores `true`, `false` migrados a estados contractuales.
  - consultas por estado.
- Productos:
  - creación con campos obligatorios contractuales.
  - publicación y despublicación.
- Clientes:
  - `GET /customers/me` y `PATCH /customers/me` para perfil autenticado.
  - creación de dirección si se añade entidad.

### Aseguramiento de datos

- Pruebas de integridad de relaciones Prisma:
  - `orders` ↔ `customers`
  - `orders` ↔ `orders_details`
  - `products` ↔ `products_category`
  - `users` ↔ `customers`

## 8. Recomendaciones finales

1. Tratar `software_SurtiTelas.Fronend/OPENAPI_SURTITELAS.yaml` como fuente de verdad para rutas y payloads.
2. No inventar lógica de negocio adicional: usar los módulos existentes como base de reutilización.
3. Priorizar primero la plena compatibilidad contract (rutas + DTOs), luego refactorizar el DB modelado.
4. Mantener una capa de adaptadores en los controladores para desacoplar el contrato frontend del esquema físico actual.
5. Documentar cada migración Prisma con un nombre claro y testearla en un entorno de datos representativo.

---

#### Archivos de referencia clave

- `src/shared/app.ts`
- `src/modules/auth/controller/auth.controller.ts`
- `src/modules/products/controller/products.controller.ts`
- `src/modules/orders/controller/orders.controller.ts`
- `src/modules/customers/controller/customers.controller.ts`
- `src/modules/profile/controller/profile.controller.ts`
- `src/modules/checkout/service/checkout.service.ts`
- `prisma/schema.prisma`
- `prisma/migrations/20260628160059_init/migration.sql`
- `software_SurtiTelas.Fronend/OPENAPI_SURTITELAS.yaml`

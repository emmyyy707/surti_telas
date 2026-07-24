# SPEC.md — Plano Técnico del Backend SurtiTelas

> **Arquitectura de Software · Líder Técnico**
> Backend Node.js + TypeScript + Express + PostgreSQL (Prisma) + Clean Architecture / DDD.

---

## 0. Contexto y alcance (derivado del frontend real)

El brief menciona genéricamente "sistema de gestión de panaderías", pero el análisis del repositorio
`software_SurtiTelas.Fronend` revela que **el dominio real es SurtiTelas**: una plataforma de
**manufactura y comercialización de prendas de vestir / textiles** con venta B2B/B2C, producción en
talleres, control de inventario de insumos, domicilios y mesa de asesores.

Para garantizar **integración fluida**, este SPEC se diseña sobre ese dominio real y respeta los
contratos de datos ya definidos en el frontend. Hallazgos clave del frontend:

- El frontend **ya implementa Clean Architecture** con la misma nomenclatura que pedirá el backend:
  - `src/domain/entities/{Order,Product}.ts` — entidades ricas con validación y reglas de negocio.
  - `src/domain/repositories/{OrderRepository,ProductRepository}.ts` — interfaces (puertos).
  - `src/application/use-cases/{orders,products}/*` — `CreateOrder`, `GetOrders`, `UpdateOrderStatus`, `CreateProduct`, `GetProducts`, `UpdateProduct`.
  - `src/infrastructure/repositories/LocalStorage*Repository.ts` — **backend simulado** (persistencia en `localStorage`).
  - `src/infrastructure/container/{order,product}Container.ts` — contenedores de Inyección de Dependencias.
  - `src/infrastructure/mappers/{Order,Product}Mapper.ts` — adaptadores dominio ↔ DTO.
- El "fake backend" actual se puede **reemplazar sin tocar los casos de uso** simplemente cambiando la
  implementación del repositorio en los contenedores de infraestructura (ver §10).
- Tipos de negocio definidos en `src/core/types/index.ts`: `Producto`, `Cliente`, `Pedido`, `PedidoItem`,
  `OrdenProduccion`, `MovimientoInventario`, `Proveedor`, `Notificacion`.
- Roles (`UserRole` en `src/types/auth.types.ts`): `admin`, `asesor`, `domiciliario`, `cliente`.

### Mapeo Módulo Backend ⇄ Pantalla/Página Frontend

| Módulo backend        | Dominio                                      | Pantallas frontend relevantes |
|-----------------------|----------------------------------------------|-------------------------------|
| `auth`                | Usuarios, login, roles, permisos             | `auth/*`, `GestionUsuarios`, `Roles`, `Permisos`, `SeguridadUsuarios`, `GestionAcceso` |
| `catalog`             | Productos, categorías, publicación           | `AdminCatalogo`, `Catalogo`, `ProductosTerminados`, `Inventario` |
| `customers`           | Clientes, cupos de crédito                   | `Clientes`, `MisClientes`, `PerfilCliente` |
| `orders`              | Pedidos, carrito, checkout, seguimiento      | `Pedidos`, `VentasPedidos`, `CartPage`, `CheckoutPage`, `MisPedidos`, `OrderTracking` |
| `stock`               | Insumos, proveedores, movimientos, alertas   | `Insumos`, `Proveedores`, `AlertasStock`, `ReportesInventario` |
| `production`          | Producción, talleres, asignación             | `Produccion`, `RegistroTalleres`, `AsignacionProduccion`, `SeguimientoProduccion`, `ControlPrendas` |
| `shared` (transversal) | Notificaciones, errores, eventos, auth/JWT | `Alertas*`, `Reportes*` |

### Principio rector de integración

> El backend **debe devolver exactamente las mismas formas** que hoy produce `ProductMapper.toDTO` /
> `OrderMapper.toDTO` y los tipos de `src/core/types`. Los repositorios HTTP del frontend mapearán
> 1:1 con los endpoints de este backend.

---

## 1. Arquitectura y estructura del proyecto

### 1.1 Estilo arquitectónico

Se adopta **Clean Architecture** + **Domain-Driven Design**, con dependencias apuntando siempre
hacia el centro (el dominio no conoce a Express ni Prisma). El flujo de una petición es:

```
Cliente HTTP
  → Express (server.ts / app)
  → Middleware de seguridad (helmet, cors, rate-limit, morgan)
  → Middleware JWT (autenticación) + RBAC (autorización)
  → Controlador (presentation)
  → Caso de Uso (application)  [orquesta el dominio]
  → Repositorio (puerto en domain, impl en infrastructure)
  → Prisma Client
  → PostgreSQL
  → Event Bus (notificaciones / efectos colaterales)  ← asíncrono, post-commit
```

**Capas (de dentro hacia afuera):**

1. **domain/** — Entidades, objetos de valor, reglas de negocio puras, y *puertos* (interfaces de
   repositorio). Sin dependencias externas.
2. **application/** — Casos de uso (use cases), DTOs de entrada/salida, y servicios de aplicación.
   Depende solo de `domain`.
3. **infrastructure/** — Implementaciones: repositorios Prisma, mapeadores, cliente Prisma, Event Bus,
   adapters de email/storage, contenedor de DI.
4. **presentation/** — Controladores Express, middlewares, rutas, validación (Zod), serialización.

### 1.2 Estructura de carpetas (backend)

El backend vive en un repo/hermano (p. ej. `SurtiTelas.Backend` o `backend/`). Estructura exigida:

```
src/
├── config/                     # carga de env, constantes, disposición de servidor
│   ├── env.ts                  # validación de variables de entorno (zod)
│   ├── app.ts                  # construcción de la app Express (middlewares globales)
│   ├── database.ts             # singleton PrismaClient
│   └── swagger.ts              # documentación OpenAPI (opcional)
│
├── modules/
│   ├── auth/
│   │   ├── domain/             # User, Role, Token, reglas; interfaces AuthRepository, TokenService
│   │   ├── application/        # LoginUser, RegisterUser, RefreshToken, Logout, GetProfile, ManageRoles
│   │   ├── infrastructure/     # PrismaAuthRepository, JwtTokenService, bcrypt, seed
│   │   └── presentation/       # auth.routes.ts, auth.controller.ts, auth.middleware.ts
│   ├── catalog/                # Product, Category, publicación
│   ├── customers/              # Customer, cupos de crédito
│   ├── orders/                 # Order, OrderItem, checkout
│   ├── stock/                  # Supplier, RawMaterial, InventoryMovement
│   └── production/             # ProductionOrder, Workshop, assignment
│
├── shared/
│   ├── domain/                 # Notification, Event (tipos de evento), Result, errores base
│   ├── application/            # EventBus port, tipos de notificación
│   ├── infrastructure/         # InMemoryEventBus (EventEmitter), NotificationRepository
│   └── presentation/           # errorHandler, HttpError, asyncHandler, rateLimiter, validators (zod helpers)
│
└── server.ts                   # bootstrap: configura DI, levanta el server
```

### 1.3 Ubicación física de dependencias

| Dependencia        | Capa permitida              |
|--------------------|-----------------------------|
| `prisma` / `@prisma/client` | `infrastructure`, `config` |
| `express`          | `presentation`, `config`    |
| `jsonwebtoken`     | `infrastructure` (TokenService) |
| `zod`              | `presentation` (validación) y `config` (env) |
| `bcrypt`/`argon2`  | `infrastructure`            |
| `class-validator`  | no se usa (preferimos Zod)  |

---

## 2. Esquema de base de datos (Prisma / PostgreSQL)

### 2.1 Convenciones

- **IDs**: `String @id @default(cuid())` para todas las entidades (coincide con `id: string` del frontend).
- **Soft delete**: toda entidad de negocio lleva `deletedAt DateTime?`. Las consultas lo filtran.
- **Timestamps**: `createdAt`, `updatedAt` en todas las entidades.
- **Money**: `Decimal @db.Decimal(12,2)`. **Porcentajes**: `Int` (0–100).
- **Arrays**: `String[]` (soportado en PostgreSQL) para `imagenes`, `colores`, `tallas`, `materiales`.
- **Índices**: unicos sobre `email`, `ref`, `codigo`, `nit`; compuestos/btree sobre FK + `deletedAt`,
  y sobre `estado`/`fecha` para reportes.
- **Enums**: se declaran en Prisma para estados finitos (evita datos sucios).
- **Nombres**: `snake_case` en BD vía `@map`, `camelCase` en el cliente Prisma.

### 2.2 `schema.prisma` (núcleo)

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ───────────── Enums globales ─────────────
enum Role            { ADMIN ASESOR DOMICILIARIO CLIENTE }
enum UserStatus      { ACTIVO INACTIVO }
enum ProductStatus   { ACTIVO INACTIVO }
enum StockStatus     { OK BAJO_STOCK AGOTADO }
enum OrderStatus     { NUEVO EN_PRODUCCION LISTO DESPACHADO EN_CAMINO ENTREGADO CANCELADO }
enum OrderPriority   { ESTANDAR PRIORITARIO }
enum ProductionStatus{ PENDIENTE EN_PROCESO TERMINADO }
enum MovementType    { ENTRADA SALIDA AJUSTE }
enum SupplierStatus  { ACTIVO INACTIVO }
enum WorkshopStatus  { ACTIVO INACTIVO }
enum NotificationType{ INFO WARNING SUCCESS DANGER }

// ───────────── Auth / RBAC ─────────────
model User {
  id           String      @id @default(cuid())
  email        String      @unique
  passwordHash String      @map("password_hash")
  nombre       String
  telefono     String?
  role         Role
  estado       UserStatus  @default(ACTIVO)
  refreshToken String?     @map("refresh_token")
  // relaciones
  customers    Customer[]  @relation("AsesorClientes")
  orders       Order[]     @relation("AsesorOrders")
  productions  ProductionOrder[] @relation("OperarioProductions")
  movements    InventoryMovement[] @relation("UsuarioMovements")
  notifications Notification[]
  createdAt    DateTime    @default(now())
  updatedAt    DateTime    @updatedAt
  deletedAt    DateTime?   @map("deleted_at")

  @@index([role])
  @@index([deletedAt])
  @@map("users")
}

model Permission {
  id          String         @id @default(cuid())
  code        String         @unique  // p.ej. "orders:create"
  description String
  module      String         // "orders" | "catalog" | "stock" | ...
  roles       RolePermission[]
  createdAt   DateTime       @default(now())
  @@map("permissions")
}

model RolePermission {
  role        Role       @map("role")
  permission  Permission @relation(fields: [permissionId], references: [id], onDelete: Cascade)
  permissionId String
  @@id([role, permissionId])
  @@map("role_permissions")
}

// ───────────── Catálogo ─────────────
model Category {
  id         String    @id @default(cuid())
  nombre     String
  slug       String    @unique
  parentId   String?   @map("parent_id")
  parent     Category? @relation("Subcategorias", fields: [parentId], references: [id], onDelete: SetNull)
  children   Category[] @relation("Subcategorias")
  products   Product[]
  createdAt  DateTime  @default(now())
  @@map("categories")
}

model Product {
  id              String        @id @default(cuid())
  ref             String        @unique
  codigo          String?
  nombre          String
  descripcion     String?
  descripcionCorta String?      @map("descripcion_corta")
  categoriaId     String?       @map("categoria_id")
  categoria       Category?     @relation(fields: [categoriaId], references: [id])
  subcategoria    String?
  marca           String?
  precio          Decimal       @db.Decimal(12,2)
  precioAnterior  Decimal?      @map("precio_anterior") @db.Decimal(12,2)
  descuento       Int           @default(0)   // 0–100
  cantidadStock   Int           @map("cantidad_stock") @default(0)
  stockStatus     StockStatus   @map("stock_status") @default(OK)
  estado          ProductStatus @default(ACTIVO)
  publicado       Boolean       @default(false)
  fechaPublicacion DateTime?    @map("fecha_publicacion")
  destacado       Boolean       @default(false)
  oferta          Boolean       @default(false)
  nuevo           Boolean       @default(false)
  masVendido      Boolean       @map("mas_vendido") @default(false)
  tela            String
  colores         String[]
  tallas          String[]
  imagenPrincipal String?       @map("imagen_principal")
  imagenes        String[]      @default([])
  orderItems      OrderItem[]
  movements       InventoryMovement[]
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt
  deletedAt       DateTime?     @map("deleted_at")

  @@index([categoriaId, deletedAt])
  @@index([publicado, estado])
  @@index([stockStatus])
  @@index([deletedAt])
  @@map("products")
}

// ───────────── Clientes ─────────────
model Customer {
  id               String      @id @default(cuid())
  nombre           String
  ciudad           String?
  telefono         String?     @map("telefono")
  nit              String?
  asesorId         String?     @map("asesor_id")
  asesor           User?       @relation("AsesorClientes", fields: [asesorId], references: [id])
  cupoTotal        Decimal     @map("cupo_total") @default(0) @db.Decimal(12,2)
  cupoUsado        Decimal     @map("cupo_usado") @default(0) @db.Decimal(12,2)
  deudaVencida     Decimal     @map("deuda_vencida") @default(0) @db.Decimal(12,2)
  isTrustedCustomer Boolean    @map("is_trusted_customer") @default(false)
  estado           UserStatus  @default(ACTIVO)
  orders           Order[]
  createdAt        DateTime    @default(now())
  updatedAt        DateTime    @updatedAt
  deletedAt        DateTime?   @map("deleted_at")

  @@index([asesorId])
  @@index([deletedAt])
  @@map("customers")
}

// ───────────── Pedidos ─────────────
model Order {
  id             String       @id @default(cuid())
  numero         String       @unique // p.ej. PED-000123
  clienteId      String       @map("cliente_id")
  cliente        Customer     @relation(fields: [clienteId], references: [id])
  clienteNombre  String       @map("cliente_nombre") // snapshot para DTO (frontend usa string)
  asesorId       String       @map("asesor_id")
  asesor         User         @relation("AsesorOrders", fields: [asesorId], references: [id])
  asesorNombre   String       @map("asesor_nombre")   // snapshot
  fecha          DateTime     @default(now())
  total          Decimal      @db.Decimal(12,2)
  itemsCount     Int          @map("items_count") @default(0) // suma de cantidades
  estado         OrderStatus  @default(NUEVO)
  prioridad      OrderPriority @default(ESTANDAR)
  observaciones  String?
  items          OrderItem[]
  production      ProductionOrder?
  createdAt      DateTime     @default(now())
  updatedAt      DateTime     @updatedAt
  deletedAt      DateTime?    @map("deleted_at")

  @@index([clienteId, deletedAt])
  @@index([asesorId])
  @@index([estado, fecha])
  @@index([deletedAt])
  @@map("orders")
}

model OrderItem {
  id        String   @id @default(cuid())
  orderId   String   @map("order_id")
  order     Order    @relation(fields: [orderId], references: [id], onDelete: Cascade)
  productId String?  @map("product_id")
  product   Product? @relation(fields: [productId], references: [id])
  nombre    String
  precio    Decimal  @db.Decimal(12,2)
  cantidad  Int
  @@index([orderId])
  @@map("order_items")
}

// ───────────── Stock ─────────────
model Supplier {
  id               String        @id @default(cuid())
  nombre           String
  nit              String        @unique
  telefono         String?
  email            String?
  direccion        String?
  ciudad           String?
  materiales       String[]      @default([])
  estado           SupplierStatus @default(ACTIVO)
  calificacion     Float         @default(0)
  pedidosRealizados Int          @map("pedidos_realizados") @default(0)
  ultimoPedido     DateTime?     @map("ultimo_pedido")
  rawMaterials     RawMaterial[]
  createdAt        DateTime      @default(now())
  updatedAt        DateTime      @updatedAt
  deletedAt        DateTime?     @map("deleted_at")
  @@index([deletedAt])
  @@map("suppliers")
}

model RawMaterial {
  id            String    @id @default(cuid())
  nombre        String
  categoria     String?
  unidadMedida  String    @map("unidad_medida") // "m", "kg", "unidad"
  stockActual   Int       @map("stock_actual") @default(0)
  stockMinimo   Int       @map("stock_minimo") @default(0)
  proveedorId   String?   @map("proveedor_id")
  proveedor     Supplier? @relation(fields: [proveedorId], references: [id])
  precioUnitario Decimal  @map("precio_unitario") @db.Decimal(12,2)
  movements     InventoryMovement[]
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  deletedAt     DateTime? @map("deleted_at")
  @@index([proveedorId])
  @@index([stockActual])
  @@map("raw_materials")
}

model InventoryMovement {
  id         String       @id @default(cuid())
  tipo       MovementType
  productId  String?      @map("product_id")
  product    Product?     @relation(fields: [productId], references: [id])
  rawMaterialId String?   @map("raw_material_id")
  rawMaterial RawMaterial? @relation(fields: [rawMaterialId], references: [id])
  cantidad   Int
  ajuste     Int?
  motivo     String
  usuarioId  String       @map("usuario_id")
  usuario    User         @relation("UsuarioMovements", fields: [usuarioId], references: [id])
  fecha      DateTime     @default(now())
  @@index([productId, fecha])
  @@index([rawMaterialId, fecha])
  @@map("inventory_movements")
}

// ───────────── Producción ─────────────
model Workshop {
  id        String        @id @default(cuid())
  nombre    String
  encargadoId String?     @map("encargado_id")
  direccion String?
  ciudad    String?
  estado    WorkshopStatus @default(ACTIVO)
  capacidad Int?
  productions ProductionOrder[]
  createdAt DateTime      @default(now())
  updatedAt DateTime      @updatedAt
  deletedAt DateTime?     @map("deleted_at")
  @@map("workshops")
}

model ProductionOrder {
  id            String          @id @default(cuid())
  pedidoId      String?         @map("pedido_id")
  pedido        Order?          @relation(fields: [pedidoId], references: [id])
  operarioId    String?         @map("operario_id")
  operario      User?           @relation("OperarioProductions", fields: [operarioId], references: [id])
  tallerId      String?         @map("taller_id")
  taller        Workshop?       @relation(fields: [tallerId], references: [id])
  referencia    String          // ref del producto
  cantidad      Int
  fechaInicio   DateTime        @map("fecha_inicio") @default(now())
  fechaEstimada DateTime        @map("fecha_estimada")
  avance       Int              @default(0) // 0–100
  estado        ProductionStatus @default(PENDIENTE)
  tela          String?
  colores       String[]
  curvaTallas   Json?           @map("curva_tallas") // { s,m,l,xl }
  notasTecnicas String?         @map("notas_tecnicas")
  createdAt     DateTime        @default(now())
  updatedAt     DateTime        @updatedAt
  @@index([pedidoId])
  @@index([estado])
  @@map("production_orders")
}

// ───────────── Transversal: Notificaciones ─────────────
model Notification {
  id        String          @id @default(cuid())
  tipo      NotificationType
  titulo    String
  mensaje   String
  leida     Boolean         @default(false)
  usuarioId String?         @map("usuario_id")
  usuario   User?           @relation(fields: [usuarioId], references: [id], onDelete: Cascade)
  createdAt DateTime        @default(now())
  @@index([usuarioId, leida])
  @@map("notifications")
}
```

### 2.3 Derivaciones y constraints de negocio (en DB o app)

- `Product.stockStatus` se recalcula en la app tras cada movimiento: `AGOTADO` si `cantidadStock=0`,
  `BAJO_STOCK` si `< stockMinimoProducto` (umbral configurable por categoría), `OK` en otro caso.
- `Order.itemsCount` = Σ `OrderItem.cantidad` (se mantiene en app al crear/actualizar).
- `Customer.cupoUsado` no debe superar `cupoTotal` al crear pedido (regla en el caso de uso).
- FK con `onDelete: Cascade` para `OrderItem` y `RolePermission`; `onDelete: SetNull` para
  `Category.parent` y `Customer.asesor`.
- `deletedAt` no nulo ⇒ registro "eliminado" (Soft Delete aplicado en todos los repositorios).

---

## 3. Desglose de responsabilidades por módulo

Cada módulo sigue la misma estructura interna `domain / application / infrastructure / presentation`.
Abajo se listan las responsabilidades y los artefactos recomendados.

### 3.1 `auth` (Autenticación, usuarios y RBAC)

**domain/**
- Entidades: `User` (nombre, email, passwordHash, role, estado), `Role`, `Permission`, `Token`.
- Reglas: `User.canLogin()` (estado ACTIVO), `Role.hasPermission(code)`.
- Puertos: `AuthRepository` (findByEmail, findById, create, updateRefreshToken), `TokenService`
  (signAccessToken, signRefreshToken, verify), `PasswordHasher` (hash, compare).

**application/**
- `LoginUser` — valida credenciales, emite access+refresh token, dispara `UserLoggedIn`.
- `RegisterUser` — crea usuario (solo ADMIN/ASESOR), hashea password.
- `RefreshToken` — rota refresh token (revoca el anterior).
- `Logout` — invalida refresh token.
- `GetProfile` / `UpdateProfile`.
- `ManageRoles` / `AssignPermissionToRole` (solo ADMIN).

**infrastructure/**
- `PrismaAuthRepository`, `JwtTokenService` (`jsonwebtoken`), `BcryptPasswordHasher`.
- `seed.ts`: crea usuario `admin@surtitelas.com`, roles y permisos por defecto.

**presentation/**
- `auth.routes.ts` (`POST /auth/login`, `/auth/register`, `/auth/refresh`, `/auth/logout`,
  `GET /auth/me`), `auth.controller.ts`, `auth.middleware.ts` (JWT + `requireRole`).

### 3.2 `catalog` (Productos y categorías)

**domain/**
- Entidad `Product` **reutiliza la del frontend** (`src/domain/entities/Product.ts`): validación
  (`Product.validate`), `publish()`/`unpublish()`, `canBePublished()`, `isAvailable()`.
- `Category` (auto-relación subcategorías).
- Puertos: `ProductRepository` **igual interfaz que el frontend**
  (`list, getById, getByRef, create, update, delete`), `CategoryRepository`.

**application/**
- `CreateProduct`, `GetProducts`, `GetProductByRef`, `UpdateProduct`, `DeleteProduct` (soft delete),
  `PublishProduct`, `UnpublishProduct`, `CreateCategory`.

**infrastructure/**
- `PrismaProductRepository` — implementa el puerto del frontend; mapea `Product` ⇄ fila Prisma
  mediante `ProductMapper` (idéntico al de frontend: respetar `ref`, `colores`, `tallas`, `imagenes`).
- `PrismaCategoryRepository`.

**presentation/**
- `catalog.routes.ts`, `catalog.controller.ts`. Endpoints para CRUD + publicar/despublicar.
- El DTO de salida **debe coincidir con `ProductMapper.toDTO`** para no romper el frontend.

### 3.3 `customers` (Clientes)

**domain/**
- Entidad `Customer` (nombre, ciudad, tel, asesor, nit, cupoTotal, cupoUsado, deudaVencida,
  isTrustedCustomer, estado). Regla `tieneCupoDisponible(monto)`.
- Puertos: `CustomerRepository`.

**application/**
- `CreateCustomer`, `GetCustomers`, `GetCustomerById`, `UpdateCustomer`, `AssignAsesor`,
  `UpdateCupo` (registra deuda/abono).

**infrastructure/** `PrismaCustomerRepository`, `CustomerMapper`.

**presentation/** `customers.routes.ts`, `customers.controller.ts`.

### 3.4 `orders` (Pedidos y checkout)

**domain/**
- Entidad `Order` **reutilizada del frontend** (`src/domain/entities/Order.ts`): `Order.validate`,
  `canTransitionTo(next)`, `withStatus()`. `OrderStatus` y `OrderPriority` enums.
- `OrderItem` (value object).
- Puertos: `OrderRepository` **igual interfaz que el frontend**
  (`list, getById, create(input: CreateOrderInput), updateStatus`).

**application/**
- `CreateOrder` — valida (reusa `Order.validate`), verifica cupo del cliente, descuenta stock
  (evento `StockReserved`), emite `OrderCreated`.
- `GetOrders` (con filtros por asesor/cliente/estado).
- `UpdateOrderStatus` — valida transición (`canTransitionTo`); al llegar a `Entregado` libera cupo /
  dispara `OrderDelivered`; al `Cancelado` reversa stock.
- `GetOrderById`, `AssignDomiciliario`.

**infrastructure/** `PrismaOrderRepository`, `OrderMapper` (snapshot `clienteNombre`/`asesorNombre`).

**presentation/** `orders.routes.ts`, `orders.controller.ts`.

> El `createOrder.execute(input: CreateOrderInput)` del frontend se invoca igual; solo cambia la
> implementación del repositorio (§9).

### 3.5 `stock` (Insumos, proveedores, movimientos)

**domain/**
- `Supplier`, `RawMaterial`, `InventoryMovement` (tipos entrada/salida/ajuste).
- Regla `RawMaterial.necesitaReposicion()` (`stockActual <= stockMinimo`).
- Puertos: `SupplierRepository`, `RawMaterialRepository`, `InventoryMovementRepository`.

**application/**
- `CreateSupplier`, `GetSuppliers`, `CreateRawMaterial`, `RegisterMovement` (calcula nuevo stock y
  emite `StockBelowMinimum` si aplica), `GetMovements`, `GetStockAlerts`.

**infrastructure/** Repositorios Prisma + mappers.

**presentation/** `stock.routes.ts` (suppliers, raw-materials, movements).

### 3.6 `production` (Producción y talleres)

**domain/**
- `ProductionOrder` (estado PENDIENTE/EN_PROCESO/TERMINADO, avance, curvaTallas), `Workshop`.
- Regla `avanceValido(0–100)`, `puedeTerminar()`.
- Puertos: `ProductionOrderRepository`, `WorkshopRepository`.

**application/**
- `CreateProductionOrder` (ligada a `Order`), `AssignToWorkshop`, `UpdateProgress`,
  `CompleteProduction` (emite `ProductionCompleted` → crea `ProductoTerminado`/ libera),
  `RegisterWorkshop`, `GetProductionAlerts` (alertas de seguimiento).

**infrastructure/** Repositorios Prisma + mappers.

**presentation/** `production.routes.ts`.

### 3.7 `shared` (transversal)

- `HttpError` / `AppError` (tipos: `BadRequest`, `Unauthorized`, `Forbidden`, `NotFound`,
  `Conflict`, `TooManyRequests`, `Internal`).
- `asyncHandler` (envuelve controladores para capturar promesas).
- `errorHandler` (middleware central de errores → formato `{ success:false, error, message }`).
- `EventBus` (puerto) + `InMemoryEventBus` (EventEmitter) — ver §6.3.
- Helpers Zod: `parseDto`, `idParam`.

---

## 4. Seguridad

### 4.1 Autenticación — JWT (access + refresh)

- **Access Token**: corta duración (`ACCESS_TTL=15m`), lleva `{ sub: userId, role, email }`.
- **Refresh Token**: larga duración (`REFRESH_TTL=7d`), almacenado *hasheado* en `User.refreshToken`
  (no el JWT en claro). Rotación obligatoria en `/auth/refresh`.
- Firmados con `HS256` (o `RS256` en producción) usando secretos de `env.ts`.
- `JwtTokenService` (infrastructure) encapsula firma/verificación → dominio no depende de la lib.

```ts
// auth/infrastructure/JwtTokenService.ts (resumen)
signAccessToken(user): string  // jwt.sign(payload, ACCESS_SECRET, { expiresIn: ACCESS_TTL })
signRefreshToken(user): string
verify(token, secret): JwtPayload // lanza AppError 401 si expira/firma inválida
```

### 4.2 Autorización — RBAC

- Middleware `requireRole(...roles)` y `requirePermission(code)`.
- Permisos granulares (`module:action`, p.ej. `orders:create`, `catalog:publish`) cargados desde
  `RolePermission` para el `role` del usuario autenticado.
- Matriz base (seed):

| Rol            | Permisos típicos |
|----------------|------------------|
| `ADMIN`        | todos (`*:*`) |
| `ASESOR`       | `catalog:*`, `customers:*`, `orders:create`, `orders:read`, `orders:update` |
| `DOMICILIARIO` | `orders:read`, `orders:assign-self`, `orders:deliver` |
| `CLIENTE`      | `orders:create-self`, `orders:read-self`, `catalog:read` |

- El usuario autenticado viaja en `req.user = { id, role, email, permissions }`.

### 4.3 Rate Limiting

- `express-rate-limit` en rutas sensibles:
  - `/auth/login` y `/auth/register`: 10 req / 15 min por IP.
  - `/auth/refresh`: 30 req / 15 min.
  - Resto de la API: 300 req / 15 min.
- Headers estándar `Retry-After` + respuesta `429 { success:false, error:"too_many_requests" }`.
- (Opcional prod) `rate-limit-redis` para clusters.

### 4.4 Soft Delete

- Toda entidad de negocio expone `deletedAt`.
- Los repositorios Prisma aplican `where: { deletedAt: null }` en `list`/`getById` y usan
  `update({ deletedAt: now })` en `delete` (nunca `delete()` físico).
- Endpoints de admin pueden listar eliminados con `?includeDeleted=true` (solo ADMIN).

### 4.5 Protección contra IDOR

- Nunca se confía en el `id` del body para dueños de recursos.
- En recursos por usuario (`/orders/me`, `/customers/:id`), se fuerza `owner = req.user.id`
  (o `clienteId = req.user.id` para `CLIENTE`) en el caso de uso; el `id` de la URL se valida como
  perteneciente al usuario o se devuelve `403/404`.
- Los `id` son `cuid()` (no secuenciales) para evitar enumeración.
- Validación de pertenencia en `OrderRepository` con filtro por `asesorId`/`clienteId`.

### 4.6 Gestión centralizada de errores

- Todas las excepciones son `AppError` con `status` y `code`.
- `asyncHandler` captura promesas rechazadas → `next(err)`.
- `errorHandler` (último middleware) serializa:

```json
{ "success": false, "error": "validation_error", "message": "El nombre es obligatorio" }
```

- En dev se adjunta `stack`; en prod no. Nunca se filtran secretos/stacks al cliente.
- `Prisma.PrismaClientKnownRequestError` (p.ej. `P2002` unique) se mapea a `409 Conflict`.

### 4.7 Otros

- `helmet` (cabeceras seguras), `cors` con allowlist de orígenes del frontend.
- `morgan` en modo `combined` para auditoría.
- Variables sensibles solo en `.env` (ver §9); `env.ts` valida presencia con Zod al arrancar.
- Hashing de passwords con `bcrypt` (`rounds=12`).

---

## 5. Endpoints de la API y DTO / validación (Zod)

**Versión base**: `/api/v1`. **Envelope de respuesta** (coincide con `ApiResponse<T>` del frontend):

```jsonc
// Éxito
{ "success": true, "data": <T>, "message"?: string }
// Error (errorHandler central)
{ "success": false, "error": "<code>", "message": "<humano>" }
```

**Respuestas estándar**: `200/201` ok · `400` validation · `401` unauthorized · `403` forbidden ·
`404` not found · `409` conflict · `422` regla de negocio · `429` rate limit · `500` interno.

### 5.1 `auth`

| Método | Ruta | Roles | Body / Params |
|--------|------|-------|---------------|
| POST | `/auth/login` | público | `{ email, password }` |
| POST | `/auth/register` | ADMIN | `{ nombre, email, password, role, telefono? }` |
| POST | `/auth/refresh` | público | `{ refreshToken }` |
| POST | `/auth/logout` | autenticado | — |
| GET  | `/auth/me` | autenticado | — |

Login response: `{ accessToken, refreshToken, user: { id, email, role, nombre } }`.

### 5.2 `catalog`

| Método | Ruta | Roles | Notas |
|--------|------|-------|-------|
| GET | `/catalog/products` | público (lectura) / ADMIN lista todo | query: `?page&limit&search&categoria&publicado&destacado` |
| GET | `/catalog/products/:ref` | público (si publicado) | 404 si borrador e no-admin |
| POST | `/catalog/products` | ADMIN, ASESOR | crea `Product` |
| PATCH | `/catalog/products/:ref` | ADMIN, ASESOR | `Partial<ProductData>` |
| DELETE | `/catalog/products/:ref` | ADMIN | soft delete |
| POST | `/catalog/products/:ref/publish` | ADMIN, ASESOR | `Product.publish()` |
| POST | `/catalog/products/:ref/unpublish` | ADMIN, ASESOR | |
| GET | `/catalog/categories` | público | árbol de categorías |
| POST | `/catalog/categories` | ADMIN | |

### 5.3 `customers`

| Método | Ruta | Roles |
|--------|------|-------|
| GET | `/customers` | ADMIN, ASESOR |
| GET | `/customers/:id` | ADMIN, ASESOR, dueño |
| POST | `/customers` | ADMIN, ASESOR |
| PATCH | `/customers/:id` | ADMIN, ASESOR |
| POST | `/customers/:id/asesor` | ADMIN |

### 5.4 `orders`

| Método | Ruta | Roles | Body |
|--------|------|-------|------|
| GET | `/orders` | ADMIN, ASESOR | filtros `?estado&asesorId&clienteId&desde&hasta` |
| GET | `/orders/me` | CLIENTE | solo sus pedidos |
| GET | `/orders/:id` | ADMIN, ASESOR, dueño | |
| POST | `/orders` | ASESOR, CLIENTE | `CreateOrderInput` |
| PATCH | `/orders/:id/status` | ADMIN, ASESOR | `{ estado: OrderStatus }` (valida transición) |
| POST | `/orders/:id/domiciliario` | ADMIN | `{ domiciliarioId }` |

### 5.5 `stock`

| Método | Ruta | Roles |
|--------|------|-------|
| GET | `/stock/suppliers` | ADMIN, ASESOR |
| POST | `/stock/suppliers` | ADMIN |
| GET | `/stock/raw-materials` | ADMIN, ASESOR |
| POST | `/stock/raw-materials` | ADMIN |
| POST | `/stock/movements` | ADMIN, ASESOR |
| GET | `/stock/movements` | ADMIN, ASESOR |
| GET | `/stock/alerts` | ADMIN, ASESOR |

### 5.6 `production`

| Método | Ruta | Roles |
|--------|------|-------|
| GET | `/production/orders` | ADMIN, ASESOR, operario |
| POST | `/production/orders` | ADMIN, ASESOR |
| PATCH | `/production/orders/:id/progress` | operario, ADMIN |
| POST | `/production/orders/:id/complete` | operario, ADMIN |
| GET | `/production/workshops` | ADMIN, ASESOR |
| POST | `/production/workshops` | ADMIN |

### 5.7 `notifications` (shared)

| Método | Ruta | Roles |
|--------|------|-------|
| GET | `/notifications?leida=` | autenticado (solo las suyas) |
| PATCH | `/notifications/:id/read` | autenticado |

### 5.8 Esquemas Zod (ejemplos)

```ts
import { z } from "zod";

// auth
export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(100),
});

export const RegisterSchema = z.object({
  nombre: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(["ADMIN", "ASESOR", "DOMICILIARIO", "CLIENTE"]),
  telefono: z.string().optional(),
});

// catalog — coincide con ProductData del frontend
export const ProductSchema = z.object({
  ref: z.string().min(1),
  codigo: z.string().optional(),
  nombre: z.string().min(1),
  descripcion: z.string().optional(),
  descripcionCorta: z.string().optional(),
  categoria: z.string().min(1),
  subcategoria: z.string().optional(),
  marca: z.string().optional(),
  precio: z.number().nonnegative(),
  precioAnterior: z.number().nonnegative().optional(),
  descuento: z.number().min(0).max(100).optional(),
  cantidadStock: z.number().int().nonnegative(),
  stock: z.enum(["OK", "Bajo stock", "Agotado"]),
  estado: z.enum(["Activo", "Inactivo"]).optional(),
  imagenes: z.array(z.string()),
  imagenPrincipal: z.string().optional(),
  publicado: z.boolean(),
  destacado: z.boolean().optional(),
  oferta: z.boolean().optional(),
  nuevo: z.boolean().optional(),
  masVendido: z.boolean().optional(),
  tela: z.string().min(1),
  colores: z.array(z.string()).min(1),
  tallas: z.array(z.string()).min(1),
});

// orders — CreateOrderInput (frontend)
export const CreateOrderSchema = z.object({
  cliente: z.string().min(1),
  asesor: z.string().min(1),
  fecha: z.string().optional(),
  itemsList: z.array(z.object({
    productId: z.string().optional(),
    nombre: z.string().min(1),
    precio: z.number().nonnegative(),
    cantidad: z.number().int().positive(),
  })).min(1),
  prioridad: z.enum(["Estándar", "Prioritario"]).optional(),
  observaciones: z.string().optional(),
});

export const UpdateOrderStatusSchema = z.object({
  estado: z.enum(["Nuevo","En producción","Listo","Despachado","En camino","Entregado","Cancelado"]),
});

// stock
export const MovementSchema = z.object({
  tipo: z.enum(["entrada", "salida", "ajuste"]),
  productId: z.string().optional(),
  rawMaterialId: z.string().optional(),
  cantidad: z.number().int(),
  motivo: z.string().min(1),
});
```

> Regla: **cada ruta valida con su Zod schema antes de invocar el caso de uso**. Errores de Zod →
> `400 { success:false, error:"validation_error", message: <primer issue> }`.

---

## 6. Implementación de los patrones arquitectónicos

### 6.1 Patrón Repositorio

Aísla el dominio de la persistencia. El **puerto** vive en `domain/repositories`; la **implementación**
Prisma en `infrastructure/repositories`. El dominio solo conoce el puerto.

```ts
// modules/catalog/domain/repositories/ProductRepository.ts (PUERTO — idéntico al del frontend)
export interface CreateProductInput extends Omit<ProductData, "ref"> { ref?: string }
export interface ProductRepository {
  list(): Promise<Product[]>;
  getById(id: string): Promise<Product | null>;
  getByRef(ref: string): Promise<Product | null>;
  create(input: CreateProductInput): Promise<Product>;
  update(ref: string, changes: Partial<ProductData>): Promise<Product>;
  delete(ref: string): Promise<void>; // soft delete
}

// modules/catalog/infrastructure/repositories/PrismaProductRepository.ts (IMPLEMENTACIÓN)
export class PrismaProductRepository implements ProductRepository {
  constructor(private prisma: PrismaClient) {}
  async list() {
    const rows = await this.prisma.product.findMany({ where: { deletedAt: null } });
    return rows.map(ProductMapper.toDomain);
  }
  async create(input: CreateProductInput) {
    const ref = input.ref ?? `REF-${Date.now()}`;
    const row = await this.prisma.product.create({ data: { ...input, ref } });
    return ProductMapper.toDomain(row);
  }
  async delete(ref: string) {
    await this.prisma.product.update({ where: { ref }, data: { deletedAt: new Date() } });
  }
  // getById, getByRef, update análogos…
}
```

Principios: ningún `.prisma`/`.sql` en `domain` ni `application`; los mappers traducen fila ⇄ entidad.

### 6.2 Inyección de Dependencias (DI)

Contenedor manual en `infrastructure/container` (sin framework extra; opcional `tsyringe`). Los casos
de uso reciben sus dependencias por constructor → testeables y desacoplados.

```ts
// modules/catalog/infrastructure/container/catalogContainer.ts
import { PrismaClient } from "@prisma/client";
import { PrismaProductRepository } from "../repositories/PrismaProductRepository";
import { CreateProduct } from "../../application/use-cases/CreateProduct";
// …otros casos de uso

const prisma = new PrismaClient();
const productRepository = new PrismaProductRepository(prisma);

export const catalogUseCases = {
  createProduct: new CreateProduct(productRepository),
  getProducts:    new GetProducts(productRepository),
  getProductByRef:new GetProductByRef(productRepository),
  updateProduct:  new UpdateProduct(productRepository),
  deleteProduct:  new DeleteProduct(productRepository),
  publishProduct: new PublishProduct(productRepository),
};

// server.ts registra los contenedores y los pasa a las rutas vía `app.locals` o un registry.
```

`server.ts` ensambla todos los contenedores y los inyecta en los controladores (p. ej.
`makeCatalogController(catalogUseCases, eventBus)`). Para tests, se inyecta un repositorio mock.

### 6.3 Event Bus (Arquitectura Orientada a Eventos)

Bus en proceso (Node `EventEmitter`) que desacopla efectos secundarios del caso de uso principal.
Puerto en `shared/application`, implementación en `shared/infrastructure`.

```ts
// shared/application/EventBus.ts
export interface DomainEvent { type: string; payload: unknown; occurredAt: Date }
export interface EventBus {
  publish(event: DomainEvent): void;
  subscribe(type: string, handler: (e: DomainEvent) => Promise<void>): void;
}

// shared/infrastructure/InMemoryEventBus.ts
export class InMemoryEventBus implements EventBus {
  private emitter = new EventEmitter();
  publish(event: DomainEvent) { this.emitter.emit(event.type, event); }
  subscribe(type: string, handler: (e: DomainEvent) => Promise<void>) {
    this.emitter.on(type, (e) => void handler(e));
  }
}
```

**Eventos de dominio** y sus suscriptores:

| Evento | Publicado por | Suscriptor (efecto) |
|--------|---------------|---------------------|
| `OrderCreated` | `CreateOrder` | crea `Notification` (asesor), reserva stock |
| `OrderStatusChanged` | `UpdateOrderStatus` | notifica cliente/domiciliario |
| `StockBelowMinimum` | `RegisterMovement` | `Notification` de alerta (admin) → alimenta `AlertasStock` |
| `ProductionCompleted` | `CompleteProduction` | crea `ProductoTerminado`, notifica `AlertasSeguimientoProduccion` |
| `UserLoggedIn` | `LoginUser` | auditoría / métricas |

El caso de uso **publica tras el commit** de la transacción Prisma para no dejar el bus y la DB
inconsistentes.

### 6.4 Transacciones

Operaciones multi-entidad (crear pedido + descontar stock + crear movimiento) usan
`prisma.$transaction(async (tx) => { … })` pasando `tx` a los repositorios que lo soportan, o bien un
`UnitOfWork` que comparte la transacción. El evento se publica **fuera** de la transacción.

### 6.5 Middleware y SOLID

- Middlewares atómicos: `helmet`, `cors`, `rateLimiter`, `authenticate`, `authorize(...)`.
- Controladores delgados (SRP): solo parsean request, invocan el caso de uso, serializan.
- Casos de uso con una sola responsabilidad; el dominio es el único lugar con reglas de negocio
  (Order.validate, canTransitionTo, Product.publish).

---

## 7. Configuración del entorno de desarrollo

### 7.1 Requisitos

- **Node.js** ≥ 20 (LTS), **npm** ≥ 10.
- **PostgreSQL** ≥ 15 (local vía Docker o instalación nativa).
- **Prisma CLI** (devDependency).
- Editor con ESLint + Prettier.

### 7.2 `package.json` (scripts sugeridos)

```jsonc
{
  "scripts": {
    "dev": "tsx watch src/server.ts",
    "build": "tsc -p tsconfig.json && npm run prisma:generate",
    "start": "node dist/server.js",
    "typecheck": "tsc --noEmit",
    "lint": "eslint . --max-warnings=0",
    "format": "prettier --write \"src/**/*.ts\"",
    "prisma:generate": "prisma generate",
    "prisma:migrate": "prisma migrate dev",
    "prisma:seed": "tsx prisma/seed.ts",
    "prisma:studio": "prisma studio",
    "test": "vitest run"
  },
  "dependencies": {
    "@prisma/client": "^5.22.0", "express": "^4.21.0", "jsonwebtoken": "^9.0.2",
    "bcryptjs": "^2.4.3", "zod": "^3.23.8", "express-rate-limit": "^7.4.0",
    "helmet": "^8.0.0", "cors": "^2.8.5", "morgan": "^1.10.0",
    "dotenv": "^16.4.5", "winston": "^3.14.2"
  },
  "devDependencies": {
    "prisma": "^5.22.0", "typescript": "^5.6.0", "tsx": "^4.19.0",
    "eslint": "^9.13.0", "@eslint/js": "^9.13.0", "typescript-eslint": "^8.11.0",
    "prettier": "^3.3.3", "vitest": "^2.1.0"
  }
}
```

### 7.3 Prisma CLI (flujo de trabajo)

```bash
# 1) Generar migración inicial tras escribir schema.prisma
npx prisma migrate dev --name init

# 2) Regenerar cliente tras cambios de schema
npx prisma generate

# 3) Sembrar datos (admin, roles, permisos, categorías, insumos demo)
npm run prisma:seed

# 4) Inspeccionar datos
npm run prisma:studio
```

### 7.4 Git

- Repo separado del frontend (p. ej. `SurtiTelas.Backend`).
- `.gitignore`: `node_modules/`, `dist/`, `.env*`, `*.log`.
- Ramas: `main`, `develop`, `feature/*`. Conventional Commits.
- Nunca commitear `.env` ni secretos. Usar `.env.example`.

### 7.5 ESLint + Prettier

- `eslint.config.js` con `typescript-eslint` (flat config), reglas `no-explicit-any` (warn),
  `no-floating-promises`, `consistent-type-imports`.
- `.prettierrc`: `singleQuote: true`, `semi: true`, `printWidth: 100`, `trailingComma: all`,
  `tabWidth: 2`. Archivos `*.ts` con codificación UTF-8 sin BOM (coherente con el frontend).
- Hook `pre-commit` (opcional) ejecuta `lint` + `typecheck`.

### 7.6 Postman

- Colección `SurtiTelas API v1` con entornos `local` / `staging`:
  - Variable `baseUrl = http://localhost:3000/api/v1`.
  - Script `Tests` que guarda `accessToken` desde `/auth/login` en `pm.environment`.
  - Script `Pre-request` que inyecta `Authorization: Bearer {{accessToken}}`.
- Incluir ejemplos de cada endpoint y los casos de error (401/403/409/422).
- (Opcional) Generar `openapi.json` con `config/swagger.ts` y exportar a Postman.

---

## 8. Variables de entorno y `config`

`config/env.ts` valida con Zod al arrancar y falla rápido si falta algo:

```ts
// config/env.ts
import { z } from "zod";
export const env = z.object({
  NODE_ENV: z.enum(["development","test","production"]).default("development"),
  PORT: z.coerce.number().default(3000),
  DATABASE_URL: z.string().url(),
  JWT_ACCESS_SECRET: z.string().min(16),
  JWT_REFRESH_SECRET: z.string().min(16),
  ACCESS_TTL: z.string().default("15m"),
  REFRESH_TTL: z.string().default("7d"),
  CORS_ORIGIN: z.string().default("http://localhost:5173"),
  RATE_LIMIT_MAX: z.coerce.number().default(300),
}).parse(process.env);
```

`.env.example` (committeado):

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

---

## 9. Plan de migración del frontend (LocalStorage → API)

El frontend ya está arquitecturado para el cambio. Solo hay que sustituir las implementaciones de
infraestructura; **no se tocan los casos de uso ni las entidades**.

### 9.1 Crear repositorios HTTP en el frontend

```ts
// src/infrastructure/repositories/ApiProductRepository.ts
import type { Product, ProductData } from "@/domain/entities/Product";

const BASE = import.meta.env.VITE_API_URL + "/catalog/products";

export const ApiProductRepository = {
  async list() {
    const r = await fetch(BASE); const j = await r.json();
    return j.data.map(ProductMapper.toDomain);
  },
  async getByRef(ref: string) {
    const r = await fetch(`${BASE}/${ref}`); const j = await r.json();
    return j.data ? ProductMapper.toDomain(j.data) : null;
  },
  async create(input) { /* POST + mapeo */ },
  async update(ref, changes) { /* PATCH */ },
  async delete(ref) { /* DELETE */ },
};
```

### 9.2 Reemplazar el contenedor (1 línea por módulo)

```ts
// Antes: const productRepository = new LocalStorageProductRepository();
// Después:
import { ApiProductRepository } from "@/infrastructure/repositories/ApiProductRepository";
const productRepository = ApiProductRepository;
```

Los `useOrderStore` / `useProductStore` y las páginas (`AdminCatalogo`, `Pedidos`, …) siguen
funcionando porque consumen los casos de uso, no el origen de datos.

### 9.3 Respetar contratos

- El backend devuelve exactamente `ProductMapper.toDTO` (mismos nombres: `ref`, `colores`, `tallas`,
  `imagenes`, `stock`, `publicado`, …).
- `Order` del backend incluye `cliente`/`asesor` como string (snapshot) para coincidir con la
  entidad `Order` del frontend.
- Envelope `{ success, data, message, error }` idéntico al de `productService`.

### 9.4 Autenticación en el frontend

- `authStore` actualiza su `AuthUser` desde `GET /auth/me` tras login; guarda `accessToken` en
  memoria y `refreshToken` en `httpOnly` cookie (seteada por el backend) o `localStorage` seguro.
- Interceptor `fetch` que renueva el token con `/auth/refresh` ante `401`.

---

## 10. Faseo de implementación y checklist

### 10.1 Orden recomendado (por dependencias)

1. **Andamiaje**: `package.json`, `tsconfig`, `eslint`, `prettier`, `config/env.ts`, `config/database.ts`.
2. **Schema Prisma** + migración `init` + `seed` (admin, roles, permisos, categorías demo).
3. **shared**: `AppError`, `asyncHandler`, `errorHandler`, `EventBus` + `InMemoryEventBus`.
4. **auth**: dominio (User/Role/Permission), `JwtTokenService`, `BcryptPasswordHasher`,
   `PrismaAuthRepository`, casos de uso, rutas + middleware JWT/RBAC, rate limiter.
5. **catalog**: reusa `Product` del frontend; `PrismaProductRepository` + `ProductMapper`, casos de
   uso, rutas (CRUD + publicar).
6. **customers**: entidad, repositorio, casos de uso, rutas.
7. **orders**: reusa `Order` del frontend; repositorio + `OrderMapper`, `CreateOrder`
   (validación + cupo + stock + evento), `UpdateOrderStatus` (transiciones), rutas.
8. **stock**: suppliers, raw-materials, movements + alertas (evento `StockBelowMinimum`).
9. **production**: talleres, `ProductionOrder`, progreso, completado + evento `ProductionCompleted`.
10. **notifications**: suscriptores del Event Bus crean `Notification`; endpoints de lectura.
11. **Documentación**: OpenAPI + colección Postman; `README` con `npm run dev`.
12. **Migración frontend** (§9) y pruebas de integración end-to-end.

### 10.2 Checklist de calidad (Definition of Done)

- [ ] `npm run typecheck` y `npm run lint` sin errores.
- [ ] Toda ruta validada con Zod y protegida por `authenticate` + `authorize` según rol.
- [ ] Soft delete aplicado en todos los repositorios de negocio.
- [ ] IDs no secuenciales (`cuid`); recursos por usuario fuerzan `owner` (anti-IDOR).
- [ ] Respuestas bajo el envelope `{ success, data, message, error }`.
- [ ] Transacciones Prisma en operaciones multi-entidad; eventos publicados tras commit.
- [ ] Índices y FKs definidos en `schema.prisma`; migración aplicada y reversible.
- [ ] Seed reproducible; `prisma studio` muestra datos coherentes.
- [ ] Contratos de `Product`/`Order` idénticos a los del frontend (no rompe UI).
- [ ] Postman collection con flujo login → CRUD → errores documentado.

### 10.3 Notas de despliegue (producción)

- Secretos en gestor (Vault/SSM), no en `.env` plano.
- `JWT_REFRESH_SECRET` distinto de `ACCESS_SECRET`; considerar `RS256` con clave rotada.
- Rate limiter con store compartido (Redis) si hay varias instancias.
- Conexión Prisma con pool; cerrar `prisma.$disconnect()` en shutdown.
- Logs estructurados (winston) sin datos sensibles; auditoría de login/movimientos.

---

> **Estado del documento**: SPEC v1.0 — anclado al dominio real de SurtiTelas (frontend analizado) y
> al stack exigido (Node + Express + TS + Prisma/PostgreSQL + Clean Architecture/DDD + patrones
> Repositorio/DI/Event Bus + JWT/RBAC/Rate-Limit/Soft-Delete/IDOR). Sirve como plano definitivo para
> la implementación del backend.










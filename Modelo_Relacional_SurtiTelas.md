# Modelo Relacional — SurtiTelas

> Generado a partir de `software_SurtiTelas.Backend/prisma/schema.prisma` (PostgreSQL).

## Diagrama Entidad-Relación (Mermaid)

```mermaid
erDiagram
    users ||--o{ domiciliarios : "1:1"
    users ||--o| employee_profiles : "1:1"
    users ||--o{ favorites : "1:N"
    users ||--o{ alerts_leida : "1:N (alerts)"
    users ||--o{ alerts_resuelta : "1:N (alerts)"
    users ||--o{ audit_logs : "1:N"
    users ||--o{ commissions : "1:N (asesor)"
    users ||--o{ control_prendas_creadas : "1:N"
    users ||--o{ control_prendas_revisadas : "1:N"
    users ||--o{ conversations_as_advisor : "1:N (conversations)"
    users ||--o{ conversations_as_client : "1:N (conversations)"
    users ||--o{ custom_orders : "1:N (asesor)"
    users ||--o{ custom_order_history : "1:N"
    users ||--o{ custom_order_notes : "1:N"
    users ||--o{ custom_order_attachments : "1:N"
    users ||--o{ customers : "1:N (asesor)"
    users ||--o{ deliveries : "1:N (domiciliario)"
    users ||--o{ inventory_movements : "1:N"
    users ||--o{ message_templates : "1:N"
    users ||--o{ messages : "1:N (sender)"
    users ||--o{ notifications : "1:N"
    users ||--o{ orders : "1:N (asesor)"
    users ||--o{ orders_comprobante : "1:N"
    users ||--o{ orders_validado : "1:N"
    users ||--o{ payments : "1:N (asesor)"
    users ||--o{ production_orders : "1:N (operario)"
    users ||--o{ purchases : "1:N"
    users ||--o{ message_reactions : "1:N"
    users ||--o{ message_attachments_uploaded : "1:N"
    users ||--o{ video_calls : "1:N (creador)"
    users ||--o{ technical_sheet_approvals : "1:N"
    users ||--o{ technical_sheet_attachments : "1:N"
    users ||--o{ surveys : "1:N (creador)"
    users ||--o{ user_permissions : "1:N"

    permissions ||--o{ role_permissions : "1:N"
    permissions ||--o{ user_permissions : "1:N"
    role_configs ||--|| role_permissions : "1:N (por role)"

    categories ||--o{ categories : "parent_id (auto-relación)"
    categories ||--o{ products : "1:N"

    products ||--o{ favorites : "1:N"
    products ||--o{ inventory_movements : "1:N"
    products ||--o{ order_items : "1:N"

    customers ||--o{ orders : "1:N"
    customers ||--o{ payments : "1:N"
    customers ||--o{ receipts : "1:N"
    customers ||--o{ custom_orders : "1:N"
    customers ||--o{ survey_responses : "1:N"

    orders ||--o{ order_items : "1:N"
    orders ||--o{ order_history : "1:N"
    orders ||--o{ payments : "1:N"
    orders ||--o{ receipts : "1:N"
    orders ||--o{ returns : "1:N"
    orders ||--o{ commissions : "1:N"
    orders ||--o{ conversation_orders : "1:N"
    orders ||--|| deliveries : "1:1"
    orders ||--o| production_orders : "1:0..1"
    orders ||--o| custom_orders : "1:0..1"
    orders ||--o{ sales : "1:N"

    suppliers ||--o{ raw_materials : "1:N"
    suppliers ||--o{ purchases : "1:N"
    raw_material_categories ||--o{ raw_materials : "1:N"
    raw_materials ||--o{ inventory_movements : "1:N"
    raw_materials ||--o{ purchase_items : "1:N"
    purchases ||--o{ purchase_items : "1:N"

    workshops ||--o{ production_orders : "1:N"
    production_orders ||--o{ production_items : "1:N"
    production_orders ||--o{ control_prendas : "1:N"
    production_orders ||--o| custom_orders : "1:0..1"

    custom_orders ||--o{ custom_order_items : "1:N"
    custom_orders ||--o{ custom_order_history : "1:N"
    custom_orders ||--o{ custom_order_notes : "1:N"
    custom_orders ||--o{ custom_order_attachments : "1:N"
    custom_orders ||--o| quotes : "1:0..1"
    custom_orders ||--o| digital_approvals : "1:0..1"
    custom_orders ||--o| video_calls : "1:0..1"
    custom_orders ||--o| surveys : "1:0..1"
    custom_orders ||--o{ technical_sheets : "1:N"
    custom_orders ||--o| conversation : "1:0..1"
    custom_order_items ||--o{ personalizations : "1:N"
    personalizations ||--o{ variants : "1:N"
    quotes ||--o{ quote_items : "1:N"
    quotes ||--o{ quote_negotiations : "1:N"
    quotes ||--o{ quote_item_decisions : "1:N"

    surveys ||--o{ survey_responses : "1:N"
    technical_sheets ||--o{ technical_sheet_approvals : "1:N"
    technical_sheets ||--o{ technical_sheet_attachments : "1:N"

    conversations ||--o{ messages : "1:N"
    conversations ||--o{ conversation_orders : "1:N"
    conversations ||--o{ chat_satisfaction_surveys : "1:N"
    conversations ||--o{ chat_tickets : "1:N"
    messages ||--o{ message_attachments : "1:N"
    messages ||--o{ message_reactions : "1:N"
    messages ||--o{ messages : "quoted (auto-relación)"

    users {
        string id PK
        string email UK
        string password_hash
        string nombre
        string role
        enum estado
        string refresh_token
        string google_id UK
    }
    customers {
        string id PK
        string nombre
        string email
        string nit
        string asesor_id FK
        decimal cupo_total
        decimal cupo_usado
        boolean is_trusted_customer
    }
    categories {
        string id PK
        string nombre
        string slug UK
        string parent_id FK
    }
    products {
        string id PK
        string ref UK
        string nombre
        string categoria_id FK
        decimal precio
        int cantidad_stock
        enum stock_status
        enum estado
        boolean publicado
        string[] colores
        string[] tallas
    }
    orders {
        string id PK
        string numero UK
        string cliente_id FK
        string asesor_id FK
        string cliente_nombre
        string asesor_nombre
        decimal total
        enum estado
        enum prioridad
        string comprobante_pago_url
    }
    order_items {
        string id PK
        string order_id FK
        string product_id FK
        string custom_order_item_id FK
        decimal precio
        int cantidad
    }
    payments {
        string id PK
        string order_id FK
        string customer_id FK
        string asesor_id FK
        decimal amount
        enum method
        enum status
    }
    receipts {
        string id PK
        string order_id FK
        string customer_id FK
        string numero UK
        decimal total
        string estado
    }
    sales {
        string id PK
        string order_id FK
        string cliente_id
        string asesor_id
        decimal total
        string payment_id UK
        string tipo_pago
    }
    returns {
        string id PK
        string order_id FK
        string numero_devolucion UK
        string estado
        string[] imagenes
    }
    custom_orders {
        string id PK
        string numero UK
        string cliente_id FK
        string asesor_id FK
        enum estado
        string tipo_prenda
        string tecnica_personalizacion
    }
    custom_order_items {
        string id PK
        string custom_order_id FK
        string producto_id
        string descripcion
        int cantidad
        json distribucion_tallas
    }
    personalizations {
        string id PK
        string custom_order_item_id FK
        string tipo
        string descripcion
        string[] archivos
    }
    variants {
        string id PK
        string custom_order_personalization_id FK
        string talla
        string color
        int cantidad
    }
    quotes {
        string id PK
        string custom_order_id UK
        string numero UK
        enum estado
        decimal total
        int tiempo_estimado_dias
        json negotiation_history
    }
    quote_items {
        string id PK
        string quote_id FK
        string concepto
        decimal precio_unitario
        decimal subtotal
    }
    quote_negotiations {
        string id PK
        string quote_id FK
        string author_id
        string author_role
        string message
        int round
    }
    technical_sheets {
        string id PK
        string numero UK
        string custom_order_id FK
        int version
        enum estado
        string tipo_prenda
    }
    surveys {
        string id PK
        string codigo UK
        string custom_order_id UK
        string created_by_id FK
        enum estado
    }
    production_orders {
        string id PK
        string pedido_id UK
        string custom_order_id UK
        string taller_id FK
        string operario_id FK
        int avance
        enum estado
    }
    production_items {
        string id PK
        string produccion_id FK
        string nombre
        int cantidad
        decimal precio_unitario
    }
    control_prendas {
        string id PK
        string produccion_id FK
        enum etapa
        enum estado
        int cantidad_aprobada
        int cantidad_rechazada
    }
    workshops {
        string id PK
        string nombre
        string encargado
        int capacidad
        enum estado
    }
    suppliers {
        string id PK
        string nombre
        string nit UK
        enum estado
        float calificacion
    }
    raw_materials {
        string id PK
        string nombre
        string categoria_id FK
        string proveedor_id FK
        int stock_actual
        decimal precio_unitario
    }
    raw_material_categories {
        string id PK
        string nombre
        string slug UK
    }
    purchases {
        string id PK
        string numero UK
        string proveedor_id FK
        string usuario_id FK
        decimal total
        enum estado
    }
    purchase_items {
        string id PK
        string purchase_id FK
        string raw_material_id FK
        int cantidad
        decimal subtotal
    }
    inventory_movements {
        string id PK
        enum tipo
        string product_id FK
        string raw_material_id FK
        int cantidad
        string usuario_id FK
    }
    deliveries {
        string id PK
        string order_id UK
        string domiciliario_id FK
        string estado
        string direccion
    }
    conversations {
        string id PK
        string client_id FK
        string advisor_id FK
        string status
    }
    messages {
        string id PK
        string conversation_id FK
        string sender_id FK
        string content
        string quoted_message_id FK
    }
    notifications {
        string id PK
        string usuario_id FK
        enum tipo
        boolean leida
        string modulo
    }
    alerts {
        string id PK
        string leida_por_id FK
        string resuelta_por_id FK
        enum estado
        enum prioridad
    }
    audit_logs {
        string id PK
        string usuario_id FK
        string accion
        string modulo
    }
    permissions {
        string id PK
        string code UK
        string module
    }
    role_permissions {
        string role PK
        string permission_id PK_FK
    }
    user_permissions {
        string id PK
        string user_id FK
        string permission_id FK
    }
    role_configs {
        string id PK
        string role UK
    }
    commissions {
        string id PK
        string asesor_id FK
        string order_id FK
        decimal monto
    }
    favorites {
        string id PK
        string user_id FK
        string product_id FK
    }
    company_config {
        string id PK "siempre 'company'"
        string nombre
        string nit
        string logo
    }
    cms_pages {
        string id PK
        string slug UK
        string titulo
        boolean publicado
    }
    contact_messages {
        string id PK
        string nombre
        string email
        string asunto
        boolean leida
    }
    webhook_subscriptions {
        string id PK
        string url
        string[] events
        boolean active
    }
    push_subscriptions {
        string id PK
        string user_id
        string endpoint UK
    }
    order_history {
        string id PK
        string pedido_id FK
        string usuario_id FK
        string estado_anterior
        string estado_nuevo
    }
    custom_order_history {
        string id PK
        string custom_order_id FK
        string usuario_id FK
        string estado_anterior
        string estado_nuevo
    }
    custom_order_notes {
        string id PK
        string custom_order_id FK
        string autor_id FK
        string contenido
    }
    custom_order_attachments {
        string id PK
        string custom_order_id FK
        string url
        string uploaded_by_id FK
    }
    digital_approvals {
        string id PK
        string custom_order_id UK
        enum estado
    }
    video_calls {
        string id PK
        string custom_order_id UK
        enum proveedor
        string enlace
    }
    message_templates {
        string id PK
        string nombre
        enum tipo
        string canal
        string creado_por_id FK
    }
    conversation_orders {
        string id PK
        string conversation_id FK
        string order_id FK
    }
    chat_satisfaction_surveys {
        string id PK
        string conversation_id FK
        string user_id
        int rating
    }
    chat_tickets {
        string id PK
        string conversation_id FK
        string user_id
        string subject
        string status
    }
    message_attachments {
        string id PK
        string message_id FK
        string url
        string filename
    }
    message_reactions {
        string id PK
        string message_id FK
        string user_id FK
        string emoji
    }
    technical_sheet_approvals {
        string id PK
        string technical_sheet_id FK
        string usuario_id FK
        string accion
    }
    technical_sheet_attachments {
        string id PK
        string technical_sheet_id FK
        string url
        string uploaded_by_id FK
    }
    survey_responses {
        string id PK
        string survey_id FK
        string customer_id FK
        int calificacion
    }
    quote_item_decisions {
        string id PK
        string quote_item_id UK
        string quote_id FK
        string decision
    }
    domiciliarios {
        string id PK
        string user_id UK_FK
        string zona
        string vehiculo
    }
    employee_profiles {
        string id PK
        string user_id UK_FK
        string cargo
        enum tipo_empleado
    }
```

---

## Diccionario de tablas

### Núcleo de usuarios y permisos

#### `users`
Usuarios del sistema (admin, asesor, domiciliario, cliente). Campos clave: `email` (UK), `role`, `estado`, `passwordHash`, `googleId`, `refreshToken`, `twoFactorEnabled`, contadores de login, soft-delete (`deletedAt`).

#### `domiciliarios` (1:1 con `users`)
Datos específicos del domiciliario: `zona`, `vehiculo`, `capacidad`, `activo`.

#### `employee_profiles` (1:1 con `users)
Datos de empleado: `cargo`, `fechaContratacion`, `salario`, `tipoEmpleado` (ASESOR | DOMICILIARIO).

#### `permissions` / `role_permissions` / `user_permissions` / `role_configs`
Sistema RBAC: catálogo de permisos por módulo, permisos por rol, permisos individuales por usuario, y configuración de roles.

### Clientes y catálogo

#### `customers`
Clientes del sistema con cupo de crédito (`cupoTotal`, `cupoUsado`, `deudaVencida`), NIT, asesor asignado, `isTrustedCustomer`.

#### `categories` (auto-relación padre-hijo)
Categorías jerárquicas con `slug` único y `parentId`.

#### `products`
Productos terminados: `ref` (UK), `precio`, `cantidadStock`, `stockStatus` (OK/BAJO_STOCK/AGOTADO), flags (`publicado`, `destacado`, `oferta`, `nuevo`, `masVendido`), arrays `colores`/`tallas`/`imagenes`.

#### `favorites`
Favoritos por usuario y producto (UK compuesta `userId + productId`).

### Pedidos y ventas

#### `orders`
Pedido principal: `numero` (UK), `clienteId`, `asesorId`, totales, `estado`, `prioridad`, `comprobantePagoUrl`, `fechaValidacion`, `usuarioValidacionId`, datos de anulación, `tipoFlujo` (PRODUCCION).

#### `order_items`
Items del pedido: `productId`, `precio`, `cantidad`, opcional `customOrderItemId` para items personalizados.

#### `order_history`
Bitácora de cambios de estado del pedido con snapshot de estado anterior/nuevo y metadata.

#### `payments`
Pagos asociados a pedido: `orderId`, `customerId`, `asesorId`, `amount`, `method` (CASH/TRANSFER/CARD/OTHER), `status` (PENDING/APPROVED/REJECTED/REFUNDED/ANULADO), `comprobantePagoUrl`.

#### `receipts`
Recibos / facturas: `numero` (UK), `customerId`, `orderId`, `total`, `estado` (BORRADOR/ENVIADO/PAGADO/VENCIDO/CANCELADO), `estadoEnvio`.

#### `sales`
Ventas: 1 venta por pago confirmado (`paymentId` UK). Soporta anticipos, cuotas, saldos. `tipoPago`: INMEDIATO | ABONO_INICIAL | CUOTA | PAGO_SALDO.

#### `returns`
Devoluciones: `numeroDevolucion` (UK), `orderId`, `cantidadInspeccionada`, `estado` (RECIBIDO/EN_INSPECCION/APROBADO/RECHAZADO/EN_REPARACION/REINGRESADO/DESCARTADO), `destino`, `imagenes[]`.

#### `commissions`
Comisiones de asesores: `asesorId`, `orderId`, `monto`, `porcentaje`, `estado`.

### Producción

#### `workshops`
Talleres externos: `nombre`, `encargado`, `direccion`, `capacidad`, `ocupacion`, `estado`.

#### `production_orders`
Órdenes de producción: 1:1 opcional con `Order` (`pedidoId` UK) o con `custom_orders` (`custom_order_id` UK). Asignación a `tallerId` y `operarioId`, `avance`, `estado`, `curvaTallas` (JSON).

#### `production_items`
Items de la orden de producción: `nombre`, `cantidad`, `precioUnitario`, `unidad`.

#### `control_prendas`
Control de calidad por etapa: `etapa` (CORTE/CONFECCION/ACABADO/CONTROL_CALIDAD/EMPAQUE), `estado` (PROCESO/APROBADO/RECHAZADO), `cantidadAprobada/Rechazada`, `revisadoPorId`.

### Inventario y compras

#### `suppliers`
Proveedores: `nombre`, `nit` (UK), `materiales[]`, `calificacion`, `pedidosRealizados`, `ultimoPedido`.

#### `raw_materials` / `raw_material_categories`
Insumos / Materias primas con stock, precio unitario, categoría y proveedor.

#### `purchases` / `purchase_items`
Órdenes de compra a proveedores con sus items.

#### `inventory_movements`
Movimientos unificados de inventario: `tipo` (ENTRADA/SALIDA/AJUSTE), apunta opcional a `productId` o `rawMaterialId`, `cantidad`, `motivo`, `usuarioId`.

### Domicilios

#### `deliveries` (1:1 con `orders`)
Entrega: `domiciliarioId`, `estado` (ASIGNADO/EN_CAMINO/ENTREGADO/NO_ENTREGADO), `direccion`, `asignadoEn`, `entregadoEn`.

### Pedidos personalizados (cotizaciones)

#### `custom_orders`
Solicitud de cotización: `numero` (UK), `clienteId`, `asesorId`, `estado` (CustomOrderStatus), `tipoPrenda`, `tecnicaPersonalizacion`, `tallas` (JSON), `cantidadTotal`, `fechaDeseada`, `paymentStatus`, `paymentKey`, `paymentProofUrl`, `direccionEntrega`. Se enlaza opcionalmente a: `orden_id`, `presupuesto_id`, `orden_produccion_id`, `conversacion_id`.

#### `custom_order_items`
Items del pedido personalizado: `productoId`, `descripcion`, `tipoPersonalizacion`, `cantidad`, `talla`, `color`, `material`, `distribucionTallas` (JSON), `imagenesReferencia[]`.

#### `personalizations`
Personalizaciones del item: `tipo`, `tecnica`, `descripcion`, `archivos[]`, `ubicacion` (JSON).

#### `variants`
Variantes por talla/color de cada personalización: `talla`, `color`, `cantidad`.

#### `quotes` (1:1 con `custom_orders`)
Cotización: `numero` (UK), `estado` (QuoteStatus), `subtotal`, `impuestos`, `total`, `tiempoEstimadoDias`, `validezDias`, `porcentajeAnticipo`, `valorAnticipo`, `saldo`, `negotiationCount`, `negotiationHistory` (JSON), `version`.

#### `quote_items`
Items de la cotización: `concepto`, `cantidad`, `precioUnitario`, `subtotal`, `unidadMedida`, `customOrderItemId`.

#### `quote_negotiations`
Rondas de negociación de la cotización: `authorId`, `authorRole`, `message`, `round`, `proposalData` (JSON), `status`.

#### `quote_item_decisions`
Decisión por item: `decision` (PENDIENTE/ACEPTADO/RECHAZADO), `rejectReason`, `rejectComment`.

#### `digital_approvals` (1:1 con `custom_orders`)
Aprobaciones digitales: `tipo`, `documentoUrl`, `firmaUrl`, `estado` (PENDING/APPROVED/REJECTED).

#### `technical_sheets` (1:N con `custom_orders`)
Fichas técnicas versionadas: `numero` (UK), `version`, `estado` (BORRADOR/EN_REVISION/APROBADA/RECHAZADA/EN_PRODUCCION), `tipoPrenda`, `telaSolicitada`, `colores[]`, `tallas` (JSON), `tiempoRespuestaHoras`.

#### `technical_sheet_approvals` / `technical_sheet_attachments`
Aprobaciones y adjuntos de la ficha técnica.

#### `surveys` (1:1 opcional con `custom_orders`)
Encuestas de satisfacción: `codigo` (UK), `estado` (BORRADOR/ACTIVA/CERRADA), `preguntas` (JSON), `createdById`.

#### `survey_responses`
Respuestas: `customerId`, `calificacion`, `respuestas` (JSON), `completada`.

#### `video_calls` (1:1 con `custom_orders`)
Videollamadas de seguimiento: `proveedor` (ZOOM/MEET/MS_TEAMS/CUSTOM), `enlace`, `codigoAcceso`, `contrasena`.

### Chat y mensajería

#### `conversations`
Conversaciones cliente↔asesor: `clientId`, `advisorId`, `status` (OPEN/CLOSED), `lastMessageAt`, `subject`. Opcional 1:1 con `custom_orders`.

#### `messages`
Mensajes: `conversationId`, `senderId`, `content`, `messageType` (text/image/file), `senderRole` (CLIENTE/ASESOR), `status` (sent/delivered/read), `quotedMessageId` (auto-relación).

#### `message_attachments` / `message_reactions` / `message_templates`
Adjuntos, reacciones y plantillas de mensajes.

#### `conversation_orders`
Relación N:N entre conversaciones y pedidos.

#### `chat_satisfaction_surveys` / `chat_tickets`
Encuestas y tickets asociados a conversaciones.

### Notificaciones, alertas y auditoría

#### `notifications`
Notificaciones: `tipo` (INFO/WARNING/SUCCESS/DANGER), `usuarioId`, `modulo`, `referenciaId`, `metadata` (JSON), `readAt`, `targetUserId`.

#### `alerts`
Alertas operativas: `tipo`, `modulo`, `estado` (PENDIENTE/LEIDA/RESUELTA/CANCELADA), `prioridad` (BAJA/MEDIA/ALTA/CRITICA), `leidaPorId`, `resueltaPorId`.

#### `audit_logs`
Bitácora de auditoría: `usuarioId`, `accion`, `modulo`, `referenciaId`, `ip`, `userAgent`, `metadata`.

#### `webhook_subscriptions`
Suscripciones a webhooks: `url`, `secret`, `events[]`, `active`.

#### `push_subscriptions`
Suscripciones push: `userId`, `endpoint` (UK), `keysP256dh`, `keysAuth`, `userAgent`.

### Configuración y CMS

#### `company_config`
Configuración global de la empresa (singleton con `id = "company"`): `nombre`, `nit`, `logo`, `moneda` (default COP).

#### `cms_pages`
Páginas del CMS público: `slug` (UK), `titulo`, `contenido`, `publicado`.

#### `contact_messages`
Mensajes de contacto: `nombre`, `email`, `asunto`, `mensaje`, `leida`, `respondida`, `respuesta`, `respondidoPor`.

---

## Enums principales

| Enum | Valores |
|------|---------|
| `EstadoUsuario` | ACTIVO, INACTIVO |
| `TipoEmpleado` | ASESOR, DOMICILIARIO |
| `ProductStatus` | ACTIVO, INACTIVO |
| `StockStatus` | OK, BAJO_STOCK, AGOTADO |
| `OrderStatus` | NUEVO, EN_PRODUCCION, LISTO, DESPACHADO, EN_CAMINO, ENTREGADO, CANCELADO, PENDIENTE, EN_VALIDACION, ACEPTADO, RECHAZADO, RECIBO_GENERADO, RECIBO_ENVIADO |
| `OrderPriority` | ESTANDAR, PRIORITARIO |
| `ProductionStatus` | PENDIENTE, EN_PROCESO, TERMINADO, ASIGNADA |
| `MovementType` | ENTRADA, SALIDA, AJUSTE |
| `SupplierStatus` | ACTIVO, INACTIVO |
| `PurchaseStatus` | PENDIENTE, RECIBIDA, CANCELADA, ANULADA |
| `WorkshopStatus` | ACTIVO, INACTIVO |
| `NotificationType` | INFO, WARNING, SUCCESS, DANGER |
| `PaymentMethod` | CASH, TRANSFER, CARD, OTHER |
| `PaymentStatus` | PENDING, APPROVED, REJECTED, REFUNDED, ANULADO |
| `AlertState` | PENDIENTE, LEIDA, RESUELTA, CANCELADA |
| `AlertPriority` | BAJA, MEDIA, ALTA, CRITICA |
| `ControlPrendaEtapa` | CORTE, CONFECCION, ACABADO, CONTROL_CALIDAD, EMPAQUE |
| `ControlPrendaEstado` | PROCESO, APROBADO, RECHAZADO |
| `CustomOrderStatus` | SOLICITUD_RECIBIDA, EN_REVISION, COTIZADO, COTIZACION_ACEPTADA, COTIZACION_RECHAZADA, EN_PRODUCCION, COMPLETADO, CANCELADO, CONVERTIDO_A_PEDIDO, PAGO_PENDIENTE, PAGO_EN_VERIFICACION, PAGO_APROBADO, VENCIDO, PENDIENTE, ACEPTADO |
| `ApprovalStatus` | PENDING, APPROVED, REJECTED |
| `MessageTemplateType` | INFORMATION_REQUEST, QUOTE, PAYMENT_REMINDER, STATUS_UPDATE, APPROVAL_REQUEST, PRODUCTION_START, QC_PASSED, DELIVERY |
| `QuoteStatus` | BORRADOR, ENVIADA, ACEPTADA, RECHAZADA, VENCIDA, PENDIENTE, CANCELADA |
| `SurveyQuestionType` | RADIO, CHECKBOX, TEXT, RATING |
| `SurveyStatus` | BORRADOR, ACTIVA, CERRADA |
| `TechnicalSheetStatus` | BORRADOR, EN_REVISION, APROBADA, RECHAZADA, EN_PRODUCCION |
| `VideoCallProvider` | ZOOM, MEET, MS_TEAMS, CUSTOM |

---

## Resumen de cardinalidades clave

- **users** es la tabla central con ~30 relaciones (casi todas 1:N).
- **customers** se conecta a **orders**, **payments**, **receipts**, **custom_orders**, **survey_responses**.
- **orders** se vincula opcionalmente 1:1 a **production_orders**, **custom_orders** y **deliveries**.
- **custom_orders** es el núcleo del flujo de cotización: 1:N con **custom_order_items** → **personalizations** → **variants**; 1:1 con **quotes** → **quote_items** + **quote_negotiations**.
- **products** y **raw_materials** comparten tabla de movimientos (**inventory_movements**).
- **conversations** integra chat, encuestas, tickets y pedidos.
- **audit_logs**, **alerts** y **notifications** son transversales y referencian `users`.

> Para visualizar el diagrama, abre este archivo en VS Code con la extensión **Markdown Preview Mermaid Support** o en https://mermaid.live.

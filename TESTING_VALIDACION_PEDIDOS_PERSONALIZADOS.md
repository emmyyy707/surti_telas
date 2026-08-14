# Fase 5 — Testing y Validación: Flujo E2E Pedidos Personalizados

## Objetivo
Verificar que el flujo completo de pedidos personalizados funciona end-to-end:
```
Cliente crea solicitud → Admin genera cotización → Cliente acepta → 
Cliente sube comprobante → Admin aprueba pago → Admin convierte a pedido
```

---

## 1. Checklist de Validación Manual

### Prerrequisitos
- [ ] Backend corriendo en `http://localhost:3000` (o puerto configurado)
- [ ] Frontend corriendo en `http://localhost:5173`
- [ ] Base de datos PostgreSQL disponible
- [ ] Usuario cliente de prueba creado
- [ ] Usuario admin de prueba creado
- [ ] Productos de catálogo disponibles

---

## 2. Flujo E2E — Pasos de Verificación

### PASO 1: Cliente crea solicitud
**URL:** `http://localhost:5173/cliente/pedidos-personalizados`

1. [ ] Hacer login como cliente
2. [ ] Click en "Nueva solicitud"
3. [ ] Verificar que el campo "Cliente" está pre-llenado y es read-only
4. [ ] Seleccionar "Producto base" del catálogo
5. [ ] Ingresar cantidad, talla, color, material
6. [ ] Seleccionar "Tipo de personalización" (ej: Estampado)
7. [ ] Seleccionar múltiples ubicaciones (ej: Frente + Espalda)
8. [ ] Ingresar descripción de la personalización
9. [ ] Adjuntar archivos de referencia (JPG/PNG/PDF)
10. [ ] Ingresar fecha solicitada de entrega
11. [ ] Ingresar observaciones
12. [ ] **Verificar que NO existe el bloque "Pago y Referencia"**
13. [ ] Click en "Guardar solicitud"
14. [ ] Verificar mensaje de éxito "Solicitud creada"
15. [ ] Verificar que la solicitud aparece en el listado con estado "Solicitud recibida"

**Datos de API esperados:**
- `POST /custom-orders` → 201 Created
- Response incluye `numeroSolicitud`, `estado: SOLICITUD_RECIBIDA`

---

### PASO 2: Cliente envía a revisión
1. [ ] Abrir detalle de la solicitud creada
2. [ ] Click en "Enviar a revisión"
3. [ ] Verificar que el estado cambia a "En revisión"
4. [ ] Verificar que el botón "Enviar a revisión" ya no aparece

**Datos de API esperados:**
- `PATCH /custom-orders/:id/submit` → 200 OK
- Estado cambia a `EN_REVISION`

---

### PASO 3: Admin visualiza y genera cotización
**URL:** `http://localhost:5173/admin/pedidos-personalizados`

1. [ ] Hacer login como admin
2. [ ] Verificar que la solicitud aparece en el listado
3. [ ] Abrir detalle de la solicitud
4. [ ] Verificar información del cliente, producto, personalización
5. [ ] Click en "Generar cotización"
6. [ ] Verificar que se abre el "Editor de Cotización"
7. [ ] Verificar que existe una línea pre-llenada con el producto base
8. [ ] Click en "Agregar concepto"
9. [ ] Agregar línea: Tipo "MANO_OBRA", Descripción "Estampado", Cantidad 50, Precio unitario 5000
10. [ ] Verificar que el subtotal se calcula automáticamente ($250.000)
11. [ ] Verificar cálculo de descuento, impuestos (19%), total, anticipo (50%), saldo
12. [ ] Modificar descuento y verificar que el total se actualiza
13. [ ] Modificar porcentaje de anticipo y verificar que se actualiza
14. [ ] Ingresar tiempo estimado: 7 días
15. [ ] Ingresar condiciones de pago: "50% anticipo, 50% contra entrega"
16. [ ] Ingresar observaciones
17. [ ] Click en "Generar y enviar cotización"
18. [ ] Verificar mensaje de éxito "Cotización generada y enviada al cliente"
19. [ ] Verificar que la solicitud ahora tiene estado "Cotizado"

**Datos de API esperados:**
- `POST /admin/custom-orders/:id/quotation` → 201 Created
- Response incluye `cotizacion` con `numeroCotizacion`, `total`, `estado: ENVIADA`
- Backend calcula: subtotal, impuestos, descuento, total, anticipo

---

### PASO 4: Cliente visualiza cotización
**URL:** `http://localhost:5173/cliente/pedidos-personalizados`

1. [ ] Hacer login como cliente
2. [ ] Abrir detalle de la solicitud
3. [ ] Verificar que se muestra la sección "Cotización"
4. [ ] Verificar número de cotización
5. [ ] Verificar estado "ENVIADA"
6. [ ] Verificar fecha de validez
7. [ ] Verificar condiciones de pago
8. [ ] Verificar desglose de líneas:
   - Producto base: 50 × $20.000 = $1.000.000
   - Estampado: 50 × $5.000 = $250.000
9. [ ] Verificar resumen financiero:
   - Subtotal: $1.360.000
   - Impuestos (19%): $248.900
   - Total: $1.558.900
   - Anticipo (50%): $779.450
   - Saldo: $779.450
10. [ ] Verificar botones "Aceptar cotización" y "Rechazar cotización"

---

### PASO 5: Cliente acepta cotización
1. [ ] Click en "Aceptar cotización"
2. [ ] Verificar mensaje de éxito "Cotización aceptada. Ahora puedes realizar el pago del anticipo."
3. [ ] Verificar que el estado cambia a "Cotización aceptada"
4. [ ] Verificar que ahora aparece el botón "Subir comprobante"

**Datos de API esperados:**
- `PATCH /custom-orders/:id/accept-quotation` → 200 OK
- Estado cambia a `COTIZACION_ACEPTADA`
- Backend publica evento `QuotationAcceptedEvent`

---

### PASO 6: Cliente sube comprobante de pago
1. [ ] Click en "Subir comprobante"
2. [ ] Verificar que se abre el modal de edición
3. [ ] Verificar que existe la sección "Pago y Referencia" (QR + comprobante)
4. [ ] Adjuntar imagen/PDF del comprobante
5. [ ] Click en "Guardar solicitud"
6. [ ] Verificar que el comprobante se sube correctamente
7. [ ] Verificar que aparece "Ver comprobante" con el link
8. [ ] Verificar estado de pago: "Pendiente de revisión"

**Datos de API esperados:**
- `POST /custom-orders/:id/payment-proof` → 200 OK
- `PATCH /admin/custom-orders/:id` → 200 OK (actualiza paymentProofUrl)
- Payment status: `PENDING`

---

### PASO 7: Admin aprueba pago
**URL:** `http://localhost:5173/admin/pedidos-personalizados`

1. [ ] Abrir detalle de la solicitud
2. [ ] Verificar sección "Pago" con comprobante visible
3. [ ] Verificar estado "Pendiente de revisión"
4. [ ] Click en "Confirmar anticipo"
5. [ ] Verificar mensaje de éxito "Anticipo confirmado. Ahora puede pasar a producción."
6. [ ] Verificar que el estado de pago cambia a "Anticipo confirmado"

**Datos de API esperados:**
- `PATCH /admin/custom-orders/:id/payment` → 200 OK
- `anticipoPagado: true`, `paymentStatus: APPROVED`
- Backend crea registro en tabla `Payment` (si la integración está activa)

---

### PASO 8: Admin convierte a pedido
1. [ ] En el detalle de la solicitud, verificar botón "Convertir a pedido"
2. [ ] Click en "Convertir a pedido"
3. [ ] Verificar mensaje de éxito "Pedido convertido exitosamente"
4. [ ] Verificar que el estado cambia a "Convertido a pedido"
5. [ ] Verificar que la solicitud ya no aparece en el listado de pendientes (o aparece con estado actualizado)

**Datos de API esperados:**
- `POST /admin/custom-orders/:id/convert` → 200 OK
- Backend crea `Order` con `tipoFlujo: 'PERSONALIZADO'`
- Backend crea `Payment` (anticipo) si `anticipoPagado = true`
- Backend crea `ProductionOrder` automáticamente
- Backend publica evento `CustomOrderConvertedEvent`

---

## 3. Verificaciones de Backend

### 3.1 Eventos publicados
Verificar que los eventos se publican correctamente en el EventBus:

1. [ ] `CustomOrderCreatedEvent` — al crear solicitud
2. [ ] `CustomOrderSubmittedEvent` — al enviar a revisión
3. [ ] `QuotationGeneratedEvent` — al generar cotización
4. [ ] `QuotationAcceptedEvent` — al aceptar cotización
5. [ ] `QuotationRejectedEvent` — al rechazar cotización (con motivo)
6. [ ] `CustomOrderConvertedEvent` — al convertir a pedido

### 3.2 Integración Payment
- [ ] Cuando `anticipoPagado = true`, se crea un registro en `Payment`
- [ ] El `Payment` tiene `status: APPROVED`
- [ ] El monto del `Payment` = 50% del total de la cotización

### 3.3 Integración Production
- [ ] Al convertir a pedido, se crea automáticamente un `ProductionOrder`
- [ ] El `ProductionOrder` tiene `pedidoId` vinculado al `Order` creado
- [ ] El `ProductionOrder` tiene `estado: PENDIENTE`
- [ ] La `referencia` del `ProductionOrder` = número del pedido

### 3.4 Prevención de duplicados
- [ ] Intentar convertir el mismo pedido dos veces → debe fallar con error 409
- [ ] Verificar que `orderId` se setea correctamente en `PedidoPersonalizado`

---

## 4. Verificaciones de Frontend

### 4.1 Admin
- [ ] Listado muestra métricas correctas (Total, Pendientes, Cotizados, En producción)
- [ ] Búsqueda funciona por número de solicitud y cliente
- [ ] Detalle muestra toda la información de la solicitud
- [ ] Editor de cotización:
  - [ ] Agregar/eliminar conceptos
  - [ ] Cálculo en tiempo real
  - [ ] Validación de campos numéricos
  - [ ] Guardado exitoso
- [ ] Acciones contextuales aparecen según el estado
- [ ] Estados se actualizan después de cada acción

### 4.2 Cliente
- [ ] Listado muestra métricas correctas
- [ ] Búsqueda funciona
- [ ] Detalle muestra cotización con desglose
- [ ] Botones de aceptar/rechazar funcionan
- [ ] Modal de rechazo requiere motivo
- [ ] Subida de comprobante funciona
- [ ] Estado de pago se muestra correctamente

---

## 5. Casos Límite y Errores

| Caso | Esperado |
|------|----------|
| Cliente intenta aceptar cotización ya aceptada | Error: "Cotización debe estar ENVIADA" |
| Cliente intenta rechazar cotización sin motivo | Error: "El motivo de rechazo es obligatorio" |
| Admin intenta generar cotización con detalles vacíos | Error: "Debe incluir al menos un detalle" |
| Admin intenta convertir sin anticipo pagado | Error: "Requiere abono del 50%" |
| Admin intenta convertir pedido ya convertido | Error: "Ya fue convertida a pedido" |
| Cliente intenta acceder a solicitud de otro cliente | Error: 403 Forbidden |

---

## 6. Comandos de Verificación

### Backend
```bash
cd software_SurtiTelas.Backend

# Type check
npx tsc --noEmit

# Lint
npx eslint src/modules/pedidos-personalizados/

# Tests (si existen)
npm test

# Iniciar servidor
npm run dev
```

### Frontend
```bash
cd software_SurtiTelas.Fronend

# Type check
npx tsc --noEmit

# Lint
npx eslint src/presentation/pages/admin/PedidosPersonalizados.tsx src/presentation/pages/cliente/MisPedidosPersonalizados.tsx

# Build
npm run build

# Iniciar servidor
npm run dev
```

---

## 7. Notas de Testing Automatizado (Futuro)

### Unit Tests (Vitest)
- `CustomOrderUseCases.ts`:
  - `GenerateQuotation` calcula correctamente subtotal, impuestos, descuento, total
  - `AcceptQuotation` valida estado ENVIADA
  - `RejectQuotation` guarda motivo de rechazo
  - `ConvertToOrder` crea Order, Payment y ProductionOrder
  - `ConvertToOrder` previene duplicados

### E2E Tests (Playwright)
```typescript
// tests/e2e/custom-order-flow.spec.ts
test('complete custom order flow', async ({ page }) => {
  // 1. Client creates request
  // 2. Admin generates quotation
  // 3. Client accepts quotation
  // 4. Client uploads payment proof
  // 5. Admin approves payment
  // 6. Admin converts to order
});
```

---

## 8. Estado Actual del Flujo

| Componente | Estado | Notas |
|------------|--------|-------|
| Backend: Crear solicitud | ✅ Implementado | Incluye eventos |
| Backend: Enviar a revisión | ✅ Implementado | Incluye eventos |
| Backend: Generar cotización | ✅ Implementado | Cálculos automáticos |
| Backend: Aceptar/Rechazar | ✅ Implementado | Incluye eventos |
| Backend: Convertir a pedido | ✅ Implementado | Crea Order + Payment + ProductionOrder |
| Backend: Eventos | ✅ Implementado | 6 eventos nuevos |
| Frontend Admin: Listado | ✅ Implementado | |
| Frontend Admin: Detalle | ✅ Implementado | Con desglose de cotización |
| Frontend Admin: Editor cotización | ✅ Implementado | Líneas dinámicas + cálculos |
| Frontend Admin: Acciones contextuales | ✅ Implementado | Según estado |
| Frontend Cliente: Detalle cotización | ✅ Implementado | Con desglose y resumen |
| Frontend Cliente: Aceptar/Rechazar | ✅ Implementado | Con confirmaciones |
| Frontend Cliente: Subir comprobante | ✅ Implementado | En detalle |

---

## 9. ⚠️ Inconsistencia Detectada: Campo `ubicacion`

### Problema
El campo `ubicacion` tiene representaciones diferentes entre frontend y backend:

| Capa | Tipo actual | Valores |
|------|-------------|---------|
| **Backend Prisma** | `CustomOrderItemLocation?` (enum simple) | `FRENTE`, `ESPALDA`, `MANGA`, `OTRA` |
| **Frontend Admin** | `string[]` (multi-select) | Array de múltiples valores |
| **Frontend Cliente** | `string[]` (multi-select) | Array de múltiples valores |

### Impacto
El frontend envía `ubicacion` como array multi-select, pero el backend espera un valor de enum simple. Esto causará errores de validación o truncamiento de datos.

### Solución Recomendada
Actualizar el schema de Prisma para soportar múltiples ubicaciones:

```prisma
// Antes
ubicacion CustomOrderItemLocation? @map("ubicacion")

// Después
ubicacion CustomOrderItemLocation[]? @map("ubicacion")
```

Esto requiere:
1. Modificar `schema.prisma`
2. Ejecutar migración de Prisma
3. Actualizar el mapper si es necesario

**Nota**: El frontend ya está preparado para enviar/recibir arrays. Solo falta la migración del backend.

---

## 10. Próximos Pasos (Fase 6+)

1. **Notificaciones**: Integrar eventos con sistema de notificaciones
2. **Email**: Enviar cotización por email al cliente
3. **Chat**: Vincular conversaciones a pedidos personalizados
4. **Producción**: Auto-crear ProductionOrder desde módulo de órdenes
5. **Reporting**: Métricas de aceptación/rechazo de cotizaciones
6. **Cloud Storage**: Migrar uploads a Cloudinary/S3
7. **Tests automatizados**: Vitest + Playwright

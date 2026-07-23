# Migración de pantallas Asesor/Cliente al backend

## Estado actual
Las pantallas `asesor/Pedidos.tsx`, `cliente/MisPedidos.tsx`, `cliente/OrderTracking.tsx` y `asesor/Dashboard.tsx` consumen datos del store local (`usePedidos`, `useAppStore`). Cuando se conecten al backend, deben aplicar los siguientes mapeos:

## Cambios requeridos

### 1. `total` tipo/número
- Backend: `Order.total` es `number`
- Frontend actual: `Pedido.total` es `string` formateado (`"$50.000"`)
- Acción: crear un formatter en el mapper o usar `formatCurrency(dto.total)` al convertir DTO → `Pedido`

### 2. `asesor` nombre vs ID
- Backend: `Order.asesor` es string (snapshot del nombre), `Order.asesorId` es el ID
- Frontend actual: `Pedido.asesor` es string
- Acción: si el backend devuelve `asesorNombre`, usarlo directamente. Si no, resolver `asesorId` → nombre desde `/auth/users`

### 3. `taller` / producción
- Backend: `ProductionOrder.tallerId` es ID, `Workshop.nombre` es el nombre
- Frontend actual: `OrdenProduccion.operario` es string, no hay `taller`
- Acción: al integrar producción, agregar `taller` al tipo `OrdenProduccion` y resolver IDs a nombres

### 4. `itemsList` opcional
- Backend: `itemsList?: OrderItem[]`
- Frontend actual: ya está alineado como opcional
- Acción: mantener `pedido.itemsList ?? []` en todas las renderizaciones

### 5. Filtros por rol
- Backend: `/orders` filtra por `asesorId` o `clienteId` según `req.user.role`
- Frontend: al conectar `asesor/Pedidos.tsx`, debe pasar `asesorId` del usuario autenticado

## Orden de migración sugerido
1. `asesor/Pedidos.tsx` → conectar a `/orders` con filtro por asesor
2. `cliente/MisPedidos.tsx` → conectar a `/orders/me`
3. `cliente/OrderTracking.tsx` → conectar a `/orders/:id`
4. `asesor/Dashboard.tsx` → conectar a `/orders` y `/customers`

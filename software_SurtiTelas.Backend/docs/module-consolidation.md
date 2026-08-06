# Módulos duplicados/relacionados — SurtiTelas Backend

## delivery vs deliveries

| Módulo | Path | Responsabilidad |
|--------|------|-----------------|
| `delivery` | `src/modules/delivery/` | Tracking y estado de entrega por pedido. Endpoints: `/admin/delivery/:orderId/tracking`, `/admin/delivery/:orderId/history`. |
| `deliveries` | `src/modules/deliveries/` | CRUD completo de entregas (listado, creación, asignación de domiciliario, actualización de estado). Endpoints: `/api/v1/deliveries`, `/api/v1/admin/delivery`. |

**Decisión**: No fusionar. Son dominios distintos (tracking vs gestión de entregas). Mantener ambos hasta que el equipo decida unificar en un solo bounded context.

## commission vs commissions

| Módulo | Path | Responsabilidad |
|--------|------|-----------------|
| `commission` | `src/modules/commission/` | Reporte de comisiones por asesor. Endpoint: `/admin/commissions/report`. |
| `commissions` | `src/modules/commissions/` | CRUD de comisiones individuales. Endpoints: `/api/v1/commissions`, `/api/v1/admin/commissions`. |

**Decisión**: No fusionar. Son dominios distintos (reporte agregado vs gestión de registros individuales). Mantener ambos.

## alert vs alert-inventory

| Módulo | Path | Responsabilidad |
|--------|------|-----------------|
| `alert` | `src/modules/alert/` | Alertas genéricas del sistema. |
| `alert-inventory` | `src/modules/alert-inventory/` | Alertas específicas de inventario. |

**Decisión**: Renombrar `alert` a `alert-system` para claridad. No fusionar.

## Frontend API clients relacionados

| Cliente | Backend module |
|---------|---------------|
| `deliveriesApi` | `deliveries` |
| `deliveryApi` | `delivery` |
| `commissionsApi` | `commissions` |
| `commissionApi` | `commission` |

**Decisión**: Mantener clientes separados. Usar barrel export `infrastructure/api/index.ts` para imports centralizados.

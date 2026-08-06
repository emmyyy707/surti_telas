# API Integration Guide

## Base URL

- **Local dev:** `http://localhost:3000/api/v1`
- **Production:** configurado via `VITE_API_BASE_URL`

## Clients

Todos los clientes API están centralizados en `src/infrastructure/api/index.ts`.

### Uso

```typescript
import { ordersApi, type OrderDTO } from '@/infrastructure/api';

const orders = await ordersApi.list({ page: 1, limit: 10 });
```

## Tipos compartidos

Los tipos DTO principales están re-exportados en `src/shared/types/api.ts`.

```typescript
import type { OrderDTO, Pedido, BackendAuthUser } from '@/shared/types/api';
```

## Contratos versionados

Los contratos están definidos en los DTOs de `src/infrastructure/api/*`.
Para cambios breaking, seguir semver en los endpoints y documentar en este archivo.

## Swagger

Backend expone Swagger en `/api-docs` (solo en desarrollo).

## Manejo de errores

Los errores de API se normalizan en `ApiError` (`src/infrastructure/api/httpClient.ts`).
Usar `try/catch` y mostrar `error.message` en UI.

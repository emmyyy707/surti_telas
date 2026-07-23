# 04_WAVE_3_ROUTING.md — Fase 3.0

## Objetivo

Consolidar enrutamiento en `src/app/router/routes.tsx`.

## Directorios Afectados

- `src/presentation/pages/App.tsx` → `src/app/router/routes.tsx`
- `src/app/pages/SurtitelasLanding.tsx`

## Archivos Afectados

| Origen | Destino | Acción |
|--------|---------|--------|
| `src/presentation/pages/App.tsx` | `src/app/router/routes.tsx` | MOVE |
| `src/app/App.tsx` | `audit/archive/App.tsx` | ARCHIVE |
| `src/app/MODO_EXPORTACION.tsx` | `audit/archive/MODO_EXPORTACION.tsx` | ARCHIVE |

## Prerequisitos

- Wave 1 y 2 completadas
- CP-03 pasado

## Validaciones

- CP-04: `npm run dev` + navegación manual
- Todas las rutas accesibles
- React Router funciona correctamente
- Componentes de página cargan sin errores

## Rutas Detectadas (20)

| Ruta | Componente |
|------|------------|
| `/` | HomePage |
| `/catalogo` | CatalogPage |
| `/carrito` | CartPage |
| `/contacto` | ContactPage |
| `/nosotros` | AboutPage |
| `/login` | LoginPage |
| `/registro` | RegistroPage |
| `/unauthorized` | UnauthorizedPage |
| `/admin/dashboard` | AdminDashboard |
| `/admin/users` | UsuariosModule |
| `/admin/inventario` | InventarioModule |
| `/admin/pedidos` | VentasModule |
| `/admin/clientes` | ClientesModule |
| `/admin/domiciliarios` | DomiciliosModule |
| `/admin/analytics` | DashboardOverview |

## Rollback

1. Revertir movimiento de App.tsx
2. Restaurar imports en main.tsx
3. Verificar todas las rutas funcionan

## Riesgos

| Riesgo | Impacto | Probabilidad | Mitigación |
|--------|---------|--------------|------------|
| Rutas no resueltas | ALTO | BAJA | Verificar cada ruta manualmente |
| ProtectedRoute roto | ALTO | BAJA | Testear autenticación |
| Layout routing roto | MEDIO | MEDIA | Verificar layouts públicos/admin |

## Criterio de Éxito

- `npm run build` sin errores
- `npm run dev` inicia sin errores
- Todas las 20 rutas navegan correctamente
- Auth guard funciona en rutas protegidas

## Checkpoints

- CP-04: Post-routing consolidation
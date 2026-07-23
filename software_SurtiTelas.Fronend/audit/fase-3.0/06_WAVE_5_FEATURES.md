# 06_WAVE_5_FEATURES.md — Fase 3.0

## Objetivo

Migrar features a nueva estructura `src/features/<feature>/`.

## Directorios Afectados

- `src/app/components/` → `src/features/*/components/`
- `src/app/features/admin/` → `src/features/admin/`
- `src/app/features/asesor/` → `src/features/asesor/`
- `src/app/features/domiciliario/` → `src/features/domiciliario/`
- `src/app/features/cliente-role/` → `src/features/cliente/`
- `src/presentation/components/` → `src/features/public/components/`
- `src/presentation/routes/` → `src/shared/components/`
- `src/components/layout/` → `src/app/layouts/`

## Orden de Migración

### 5.1 Features/Public (primero)

| Origen | Destino | Acción |
|--------|---------|--------|
| `src/app/components/AboutPage.tsx` | `src/features/public/components/AboutPage.tsx` | MOVE |
| `src/app/components/ActivityTimeline.tsx` | `src/features/public/components/ActivityTimeline.tsx` | MOVE |
| `src/app/components/BlogPage.tsx` | `src/features/public/components/BlogPage.tsx` | MOVE |
| `src/app/components/CartPage.tsx` | `src/features/public/components/CartPage.tsx` | MOVE |
| `src/app/components/CatalogPage.tsx` | `src/features/public/components/CatalogPage.tsx` | MOVE |
| `src/app/components/ContactPage.tsx` | `src/features/public/components/ContactPage.tsx` | MOVE |
| `src/app/components/HomePage.tsx` | `src/features/public/components/HomePage.tsx` | MOVE |
| `src/app/components/ProductsPage.tsx` | `src/features/public/components/ProductsPage.tsx` | MOVE |
| `src/app/components/ServicesPage.tsx` | `src/features/public/components/ServicesPage.tsx` | MOVE |

### 5.2 Features/Admin

| Origen | Destino |
|--------|---------|
| `src/app/features/admin/AdminDashboard.tsx` | `src/features/public/components/AdminDashboard.tsx` |
| `src/app/features/admin/ClientesModule.tsx` | `src/features/admin/components/ClientesModule.tsx` |
| `src/app/features/admin/ConfiguracionModule.tsx` | `src/features/admin/components/ConfiguracionModule.tsx` |
| `src/app/features/admin/DevolucionesModule.tsx` | `src/features/admin/components/DevolucionesModule.tsx` |
| `src/app/features/admin/DomiciliosModule.tsx` | `src/features/admin/components/DomiciliosModule.tsx` |
| `src/app/features/admin/HistorialPagosModule.tsx` | `src/features/admin/components/HistorialPagosModule.tsx` |
| `src/app/features/admin/InsumosModule.tsx` | `src/features/admin/components/InsumosModule.tsx` |
| `src/app/features/admin/InventarioModule.tsx` | `src/features/admin/components/InventarioModule.tsx` |
| `src/app/features/admin/NotificationsDropdown.tsx` | `src/features/admin/components/NotificationsDropdown.tsx` |
| `src/app/features/admin/ProduccionModule.tsx` | `src/features/admin/components/ProduccionModule.tsx` |
| `src/app/features/admin/UsuariosModule.tsx` | `src/features/admin/components/UsuariosModule.tsx` |
| `src/app/features/admin/VentasModule.tsx` | `src/features/admin/components/VentasModule.tsx` |

### 5.3 Features/Asesor

| Origen | Destino |
|--------|---------|
| `src/app/features/asesor/ComisionesModule.tsx` | `src/features/asesor/components/ComisionesModule.tsx` |
| `src/app/features/asesor/MisClientesModule.tsx` | `src/features/asesor/components/MisClientesModule.tsx` |

### 5.4 Features/Domiciliario

| Origen | Destino |
|--------|---------|
| `src/app/features/domiciliario/EntregasModule.tsx` | `src/features/domiciliario/components/EntregasModule.tsx` |
| `src/app/features/domiciliario/RutasModule.tsx` | `src/features/domiciliario/components/RutasModule.tsx` |

### 5.5 Features/Cliente

| Origen | Destino |
|--------|---------|
| `src/app/components/cliente/DashboardClientes.tsx` | `src/features/cliente/components/DashboardClientes.tsx` |
| `src/app/components/cliente-role/CatalogoCliente.tsx` | `src/features/cliente/components/CatalogoCliente.tsx` |
| `src/app/components/cliente-role/DireccionesCliente.tsx` | `src/features/cliente/components/DireccionesCliente.tsx` |
| `src/app/components/cliente-role/MetodosPagoCliente.tsx` | `src/features/cliente/components/MetodosPagoCliente.tsx` |
| `src/app/components/cliente-role/MiPerfilCliente.tsx` | `src/features/cliente/components/MiPerfilCliente.tsx` |
| `src/app/components/cliente-role/MisPedidosCliente.tsx` | `src/features/cliente/components/MisPedidosCliente.tsx` |
| `src/app/components/cliente-role/ResumenCliente.tsx` | `src/features/cliente/components/ResumenCliente.tsx` |

## Prerequisitos

- Waves 1-4 completadas
- CP-05 pasado

## Validaciones

- CP-06: `npm run build` después de cada feature migrado
- Routes funcionan para cada feature
- No hay imports rotos

## Rollback

1. Revertir movimientos de feature
2. Restaurar imports en rutas
3. Eliminar features vacías creadas

## Riesgos

| Riesgo | Impacto | Probabilidad | Mitigación |
|--------|---------|--------------|------------|
| Feature acoplada a otro feature | ALTO | MEDIA | Verificar aislamiento |
| Imports cross-feature | ALTO | BAJA | Resolver con shared/services |
| Routing de feature roto | ALTO | BAJA | Testear cada ruta |

## Criterio de Éxito

- `npm run build` sin errores
- `npm run lint` sin errores
- Todas las rutas de features funcionan
- No hay referencias rotas

## Checkpoints

- CP-03: Post-cada feature migrado
- CP-06: Pre-cleanup
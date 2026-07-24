# 12_MIGRATION_CHECKLIST.md — Fase 3.0

## Checklist Pre-Migración

- [ ] Ejecutar `npm run build` (baseline) - CP-01
- [ ] Commit actual con mensaje "Pre-Fase 3 baseline"
- [ ] Tag `baseline-pre-fase3` creado
- [ ] Documentar funcionalidades actuales
- [ ] Backup de código actual

## Wave 1 — Providers Checklist

- [ ] Crear `src/app/providers/` directorio
- [ ] Crear `AppProviders.tsx` con todos los providers
- [ ] Mover AuthContext.tsx → AppProviders.tsx
- [ ] Mover CartContext.tsx → AppProviders.tsx
- [ ] Mover CartDrawerContext.tsx → AppProviders.tsx
- [ ] Mover ThemeContext.tsx → AppProviders.tsx
- [ ] Eliminar `src/app/contexts/ThemeContext.tsx` (duplicado)
- [ ] Actualizar imports en `src/main.tsx`
- [ ] Ejecutar `npm run lint` - CP-02
- [ ] Testear login manualmente
- [ ] Testear carrito manualmente
- [ ] Testear dark mode manualmente

## Wave 2 — Shared Checklist

- [ ] Mover `src/hooks/` → `src/shared/hooks/`
- [ ] Mover `src/types/` → `src/shared/types/`
- [ ] Mover `src/config/firebase.ts` → `src/infrastructure/config/`
- [ ] Consolidar tipos auth duplicados
- [ ] Actualizar imports de hooks
- [ ] Actualizar imports de tipos
- [ ] Actualizar imports de firebase config
- [ ] Ejecutar `npm run build` - CP-03
- [ ] Ejecutar `npm run lint`
- [ ] Testear funcionalidades dependientes

## Wave 3 — Routing Checklist

- [ ] Crear `src/app/router/` directorio
- [ ] Mover `src/presentation/pages/App.tsx` → `src/app/router/routes.tsx`
- [ ] Archivar `src/app/App.tsx` → `audit/archive/`
- [ ] Archivar `src/app/MODO_EXPORTACION.tsx` → `audit/archive/`
- [ ] Actualizar imports en main.tsx
- [ ] Ejecutar `npm run dev` - CP-04
- [ ] Navegar `/` → homepage
- [ ] Navegar `/catalogo` → catálogo
- [ ] Navegar `/carrito` → carrito
- [ ] Navegar `/contacto` → contacto
- [ ] Navegar `/login` → login
- [ ] Navegar `/admin/dashboard` → dashboard admin
- [ ] Verificar ProtectedRoute funciona

## Wave 4 — UI Consolidation Checklist

- [ ] Auditar uso de cada componente en `src/app/components/ui/`
- [ ] Comparar con `src/shared/ui/` equivalente
- [ ] Migrar estilos faltantes a shared/ui
- [ ] Actualizar imports componente por componente
- [ ] Ejecutar `npm run build` - CP-05
- [ ] Ejecutar `npm run lint`
- [ ] Test visual: Login page
- [ ] Test visual: Dashboard
- [ ] Test visual: Catálogo
- [ ] Test visual: Carrito

## Wave 5 — Features Checklist

### 5.1 Public Feature
- [ ] Mover AboutPage.tsx → `src/features/public/components/`
- [ ] Mover ActivityTimeline.tsx → `src/features/public/components/`
- [ ] Mover BlogPage.tsx → `src/features/public/components/`
- [ ] Mover CartPage.tsx → `src/features/public/components/`
- [ ] Mover CatalogPage.tsx → `src/features/public/components/`
- [ ] Mover ContactPage.tsx → `src/features/public/components/`
- [ ] Mover HomePage.tsx → `src/features/public/components/`
- [ ] Migrar otros componentes públicos
- [ ] Ejecutar `npm run build`

### 5.2 Admin Feature
- [ ] Mover AdminDashboard.tsx → `src/features/admin/components/`
- [ ] Mover ClientesModule.tsx → `src/features/admin/components/`
- [ ] Mover ConfiguracionModule.tsx → `src/features/admin/components/`
- [ ] Mover DevolucionesModule.tsx → `src/features/admin/components/`
- [ ] Mover DomiciliosModule.tsx → `src/features/admin/components/`
- [ ] Mover HistorialPagosModule.tsx → `src/features/admin/components/`
- [ ] Mover InsumosModule.tsx → `src/features/admin/components/`
- [ ] Mover InventarioModule.tsx → `src/features/admin/components/`
- [ ] Mover NotificationsDropdown.tsx → `src/features/admin/components/`
- [ ] Mover ProduccionModule.tsx → `src/features/admin/components/`
- [ ] Mover UsuariosModule.tsx → `src/features/admin/components/`
- [ ] Mover VentasModule.tsx → `src/features/admin/components/`
- [ ] Ejecutar `npm run build` - CP-03

### 5.3 Asesor Feature
- [ ] Mover ComisionesModule.tsx → `src/features/asesor/components/`
- [ ] Mover MisClientesModule.tsx → `src/features/asesor/components/`
- [ ] Ejecutar `npm run build`

### 5.4 Domiciliario Feature
- [ ] Mover EntregasModule.tsx → `src/features/domiciliario/components/`
- [ ] Mover RutasModule.tsx → `src/features/domiciliario/components/`
- [ ] Ejecutar `npm run build`

### 5.5 Cliente Feature
- [ ] Mover CatalogoCliente.tsx → `src/features/cliente/components/`
- [ ] Mover DireccionesCliente.tsx → `src/features/cliente/components/`
- [ ] Mover MetodosPagoCliente.tsx → `src/features/cliente/components/`
- [ ] Mover MiPerfilCliente.tsx → `src/features/cliente/components/`
- [ ] Mover MisPedidosCliente.tsx → `src/features/cliente/components/`
- [ ] Mover ResumenCliente.tsx → `src/features/cliente/components/`
- [ ] Ejecutar `npm run build`
- [ ] Ejecutar `npm run lint` - CP-06

## Wave 6 — Cleanup Checklist

- [ ] Eliminar `src/app/components/ui/` (ya migrado)
- [ ] Eliminar `src/app/features/` (ya migrado)
- [ ] Eliminar `src/app/contexts/` (ya migrado)
- [ ] Eliminar `src/presentation/` (ya migrado)
- [ ] Eliminar archivos duplicados (48 grupos)
- [ ] Verificar no hay imports rotos
- [ ] Ejecutar `npm run build` final
- [ ] Ejecutar `npm run lint` final - CP-06
- [ ] Crear tag de release: `git tag v2.0.0-migrated`

## Post-Migración

- [ ] Deploy a staging
- [ ] QA manual exhaustivo - CP-07
- [ ] Merge a main branch
- [ ] Actualizar documentación
- [ ] Notificar equipo de desarrollo
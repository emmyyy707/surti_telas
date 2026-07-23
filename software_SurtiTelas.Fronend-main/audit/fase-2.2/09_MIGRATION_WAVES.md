# 09_MIGRATION_WAVES.md

## Waves de migración

### Wave 1 — Providers (bajo riesgo)

Objetivo: Consolidar contextos en `src/app/providers/AppProviders.tsx`

Pasos:
1. Crear `src/app/providers/`
2. Crear `src/app/providers/AppProviders.tsx` con AuthProvider
3. Crear `src/app/providers/AppProviders.tsx` con CartProvider
4. Crear `src/app/providers/AppProviders.tsx` con CartDrawerProvider
5. Crear `src/app/providers/AppProviders.tsx` con ThemeProvider
6. Actualizar `src/main.tsx` imports
7. Ejecutar checkpoint CP-02

### Wave 2 — App Shell y Layouts

Objetivo: Mover layouts y componentes estructurales

Pasos:
1. Mover `src/components/layout/` a `src/app/layouts/`
2. Mover `src/presentation/components/` a `src/app/components/`
3. Eliminar `src/presentation/`
4. Ejecutar checkpoint CP-03

### Wave 3 — Routing

Objetivo: Consolidar rutas

Pasos:
1. Mover `src/presentation/pages/` a `src/app/`
2. Crear `src/app/router/routes.tsx`
3. Eliminar src/app/App.tsx enrutamiento implícito
4. Ejecutar checkpoint CP-04

### Wave 4 — UI Consolidation

Objetivo: Fusionar UI libraries

Pasos:
1. Comparar `src/app/components/ui/` vs `src/shared/ui/`
2. Migrar variantes faltantes a `src/shared/ui/`
3. Actualizar imports
4. Eliminar `src/app/components/ui/`
5. Ejecutar checkpoint CP-05

### Wave 5 — Features

Objetivo: Mover features a nueva estructura

Pasos:
1. Mover `src/app/features/public/` → `src/features/public/`
2. Mover `src/app/features/admin/` → `src/features/admin/`
3. Mover `src/app/features/asesor/` → `src/features/asesor/`
4. Mover `src/app/features/domiciliario/` → `src/features/domiciliario/`
5. Mover `src/app/features/cliente/` → `src/features/cliente/`
6. Ejecutar checkpoint CP-03

### Wave 6 — Cleanup

Objetivo: Eliminar duplicados confirmados

Pasos:
1. Eliminar `src/app/` viejo (una vez que todo haya migrado)
2. Eliminar `src/app/MODO_EXPORTACION.tsx`
3. Eliminar `src/app/App.tsx` (si queda)
4. Ejecutar checkpoint CP-06
5. Taggear release

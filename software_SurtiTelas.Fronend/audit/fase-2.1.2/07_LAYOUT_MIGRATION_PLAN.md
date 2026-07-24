# Layout Migration Plan

## Fase 3.1 — App Shell Consolidation

1. Crear `src/app/layouts/`
2. Mover DashboardLayout.tsx a `src/app/layouts/`
3. Mover PublicLayout.tsx a `src/app/layouts/`
4. Mover AuthLayout.tsx a `src/app/layouts/`

## Fase 3.2 — Shell Components

1. Mover Header.tsx a `src/app/components/`
2. Mover Sidebar.tsx a `src/app/components/`
3. Mover Footer.tsx a `src/app/components/`
4. Mover Navbar.tsx a `src/app/components/`
5. Mover NavigationBar.tsx a `src/app/components/`
6. Mover BottomNavigation.tsx a `src/app/components/`

## Fase 3.3 — Feature Layouts

1. Mover AdminLayout.tsx a `src/features/admin/layouts/`
2. Mover ClienteLayout.tsx a `src/features/cliente/layouts/`
3. Actualizar imports en features correspondientes

## Validación por Paso

- Ejecutar `npm run build` después de cada paso
- Verificar que no haya imports rotos
- Validar que rutas funcionan igual

# 10_ROLLBACK_PLAN.md — Fase 3.0

## Estrategia de Rollback

Cada wave tiene checkpoint de validación. En caso de fallo, ejecutar rollback correspondiente.

## Rollback Wave 1 — Providers

### Trigger
- `npm run build` falla
- Login no funciona
- Carrito no persiste estado

### Acciones
1. Revertir `src/main.tsx` a versión previa
2. Restaurar `src/presentation/contexts/` desde git
3. Eliminar `src/app/providers/AppProviders.tsx` si se creó
4. Ejecutar `npm run build`

## Rollback Wave 2 — Shared

### Trigger
- `npm run build` falla post-movimientos
- Imports de hooks/types rotos
- Firebase no conecta

### Acciones
1. Revertir movimientos de `src/hooks/` → `src/shared/hooks/`
2. Revertir movimientos de `src/types/` → `src/shared/types/`
3. Revertir movimientos de `src/config/` → `src/infrastructure/config/`
4. Ejecutar `npm run build`

## Rollback Wave 3 — Routing

### Trigger
- Rutas no navegan
- ProtectedRoute roto
- 404 en rutas existentes

### Acciones
1. Revertir `src/app/router/routes.tsx` → `src/presentation/pages/App.tsx`
2. Restaurar `src/app/pages/` si es necesario
3. Revertir imports en `src/main.tsx`
4. Ejecutar `npm run build`

## Rollback Wave 4 — UI

### Trigger
- Estilos rotos
- Componentes no renderizan
- Props incompatibles

### Acciones
1. Revertir fusión de UI components
2. Restaurar `src/app/components/ui/` completo
3. Revertir imports actualizados
4. Ejecutar `npm run build`

## Rollback Wave 5 — Features

### Trigger
- Features no cargan
- Imports rotos en features
- Routing de features roto

### Acciones
1. Revertir movimientos de features individualmente
2. Restaurar `src/app/components/` y `src/app/features/`
3. Ejecutar `npm run build`

## Rollback Wave 6 — Cleanup

### Trigger
- Funcionalidad perdida
- Imports rotos post-limpieza
- Build fallido

### Acciones
1. Revertir git commit de cleanup: `git reset --hard HEAD~1`
2. O restaurar archivos desde `audit/archive/`
3. Eliminar directorios creados durante wave 6
4. Ejecutar `npm run build`

## Rollback General

### Comando de Emergencia

```bash
git checkout -- .
npm run build
```

### Recuperación Completa

1. `git log --oneline -5` (ver commits recientes)
2. `git reset --hard <commit-hash>` (rollback total)
3. `npm install` (limpiar node_modules si es necesario)
4. `npm run build`

## Backups Requeridos

Antes de iniciar Fase 3:
- [ ] Commit git actual: `git commit -am "Pre-Fase 3 baseline"`
- [ ] Tag de baseline: `git tag baseline-pre-fase3`
- [ ] `npm run build` pasa sin errores
- [ ] Documentar estado actual de la app
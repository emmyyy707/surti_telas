# 07_WAVE_6_CLEANUP.md — Fase 3.0

## Objetivo

Eliminar código duplicado y directorios obsoletos después de migración completada.

## Directorios a Eliminar

| Directorio | Razón |
|------------|-------|
| `src/app/components/ui/` | Duplicados migrados a `src/shared/ui/` |
| `src/app/features/` | Migrado a `src/features/` |
| `src/app/contexts/` | ThemeContext duplicado eliminado |
| `src/app/App.tsx` | Entry point alternativo (no producción) |
| `src/app/MODO_EXPORTACION.tsx` | Modo Figma (no producción) |
| `src/presentation/` | Migrado a `src/app/` |
| `src/app/features/common/` | Migrado a shared/features |

## Archivos DELETE_CANDIDATE

| Archivo | Acción | Justificación |
|---------|--------|---------------|
| `src/app/components/figma/ImageWithFallback.tsx` | DELETE | Duplicado de `src/presentation/components/common/ImageWithFallback.tsx` |
| `src/app/contexts/ThemeContext.tsx` | DELETE | Duplicado de `src/presentation/contexts/ThemeContext.tsx` |
| `src/app/App.tsx` | ARCHIVE | Entry point alternativo, no producción |
| `src/app/MODO_EXPORTACION.tsx` | ARCHIVE | Modo Figma, no producción |

## Archivos Duplicados por Contenido (48)

| Grupo | Archivos Involucrados | Acción |
|-------|----------------------|--------|
| exportUtils.ts | `src/app/components/utils/`, `src/app/features/admin/utils/`, `src/app/features/shared/utils/` | Consolidar en `src/shared/utils/` |
| auth.types.ts | `src/types/`, `src/shared/auth.types.ts` | Consolidar en `src/shared/types/` |
| BottomNavigation.tsx | `src/app/features/common/`, `src/app/components/` | Eliminar copia en features/common |
| ClientManagement.tsx | `src/app/features/common/`, `src/app/components/` | Eliminar copia en features/common |
| BlogPage.tsx | `src/app/features/common/`, `src/app/components/` | Eliminar copia en features/common |
| ... | ... | ... |

## Prerequisitos

- Waves 1-5 completadas y pasados
- CP-06 pasado
- Build y lint limpios

## Validaciones

- `npm run build` final sin errores
- `npm run lint` final sin errores
- No hay referencias a directorios eliminados
- Application funciona en `npm run dev`

## Rollback

1. Restaurar archivos desde archive/
2. Revertir git commit de cleanup
3. Restaurar directorios eliminados

## Riesgos

| Riesgo | Impacto | Probabilidad | Mitigación |
|--------|---------|--------------|------------|
| Código necesario eliminado | CRÍTICO | BAJA | Backup previo + git |
| Imports rotos post-cleanup | ALTO | BAJA | Verificar con build y lint |
| Funcionalidad perdida | ALTO | BAJA | Test manual exhaustivo |

## Criterio de Éxito

- Build limpio sin errores
- Lint limpio sin errores
- No hay 404 en rutas
- Funcionalidades verificadas manualmente
- Tag de release creado

## Checkpoints

- CP-07: Validación runtime en staging
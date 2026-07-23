# 03_WAVE_2_SHARED.md — Fase 3.0

## Objetivo

Consolidar código compartido en `src/shared/` (hooks, types, config, utils).

## Directorios Afectados

- `src/hooks/` → `src/shared/hooks/`
- `src/types/` → `src/shared/types/`
- `src/config/` → `src/infrastructure/config/`

## Archivos Afectados

| Origen | Destino | Acción |
|--------|---------|--------|
| `src/hooks/usePagination.ts` | `src/shared/hooks/usePagination.ts` | MOVE |
| `src/hooks/index.ts` | `src/shared/hooks/index.ts` | MOVE |
| `src/types/auth.types.ts` | `src/shared/types/auth.types.ts` | MERGE (con `src/shared/auth.types.ts`) |
| `src/config/firebase.ts` | `src/infrastructure/config/firebase.ts` | MOVE |

## Prerequisitos

- Wave 1 completada
- CP-02 pasado

## Validaciones

- CP-03: `npm run build` después de movimientos
- Todos los imports actualizados correctamente
- No hay referencias rotas a `src/hooks/`, `src/types/`, `src/config/`

## Rollback

1. Revertir movimientos de archivos
2. Restaurar imports en archivos que consumen hooks/types
3. Ejecutar `npm run build`

## Riesgos

| Riesgo | Impacto | Probabilidad | Mitigación |
|--------|---------|--------------|------------|
| Imports de hooks rotos | MEDIO | MEDIA | Buscar y actualizar todos los imports |
| Tipos auth duplicados | BAJO | ALTA | Consolidar antes de eliminar |
| Firebase config no encontrado | ALTO | BAJA | Verificar tsconfig paths |

## Criterio de Éxito

- `npm run build` sin errores
- `npm run lint` sin errores
- Autenticación funciona
- Firebase conecta correctamente

## Checkpoints

- CP-03: Post-consolidación shared
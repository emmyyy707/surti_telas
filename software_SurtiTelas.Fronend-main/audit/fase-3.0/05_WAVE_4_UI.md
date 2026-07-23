# 05_WAVE_4_UI.md — Fase 3.0

## Objetivo

Fusionar UI libraries en `src/shared/ui/` (eliminar duplicados en `src/app/components/ui/`).

## Directorios Afectados

- `src/app/components/ui/` (50+ componentes duplicados)
- `src/shared/ui/` (17 componentes canónicos)

## Archivos Afectados

| Origen | Destino | Acción |
|--------|---------|--------|
| `src/app/components/ui/button.tsx` | MERGE into `src/shared/ui/button.tsx` | MERGE |
| `src/app/components/ui/card.tsx` | MERGE into `src/shared/ui/card.tsx` | MERGE |
| `src/app/components/ui/input.tsx` | MERGE into `src/shared/ui/input.tsx` | MERGE |
| `src/app/components/ui/badge.tsx` | MERGE into `src/shared/ui/badge.tsx` | MERGE |
| `src/app/components/ui/dialog.tsx` | MERGE into `src/shared/ui/dialog.tsx` | MERGE |
| `src/app/components/ui/table.tsx` | MERGE into `src/shared/ui/table.tsx` | MERGE |
| `src/app/components/ui/tabs.tsx` | MERGE into `src/shared/ui/tabs.tsx` | MERGE |
| `src/app/components/ui/select.tsx` | MERGE into `src/shared/ui/select.tsx` | MERGE |
| `src/app/components/ui/textarea.tsx` | MERGE into `src/shared/ui/textarea.tsx` | MERGE |
| `src/app/components/ui/scroll-area.tsx` | MERGE into `src/shared/ui/scroll-area.tsx` | MERGE |
| ... y 40+ componentes adicionales | | MERGE |

## Prerequisitos

- Waves 1-3 completadas
- CP-04 pasado

## Validaciones

- CP-05: Revisión de imports rotos
- Componentes UI renderizan correctamente
- Estilos consistentes en toda la app
- No hay referencias a `src/app/components/ui/`

## Rollback

1. Revertir fusión de componentes UI
2. Restaurar componentes eliminados
3. Revertir imports actualizados

## Riesgos

| Riesgo | Impacto | Probabilidad | Mitigación |
|--------|---------|--------------|------------|
| Estilos visuales rotos | MEDIO | ALTA | Comparar visualmente antes/después |
| Props incompatibles | MEDIO | MEDIA | Documentar props diferentes |
| Tests de UI rotos | BAJO | BAJA | Ejecutar tests si existen |

## Criterio de Éxito

- `npm run build` sin errores
- `npm run lint` sin errores
- UI visual idéntica o mejorada
- No hay referencias a directorio eliminado

## Checkpoints

- CP-05: Post-UI consolidation
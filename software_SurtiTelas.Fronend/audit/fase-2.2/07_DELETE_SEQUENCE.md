# 07_DELETE_SEQUENCE.md

## Orden de eliminación (solo plan, no ejecución)

### Bloque A — Sin riesgo

- `src/app/MODO_EXPORTACION.tsx` — Modo Figma, no producción

### Bloque B — Con validación previa

- `src\app\contexts\ThemeContext.tsx` — Duplicado de src\presentation\contexts\ThemeContext.tsx

### Bloque C — Después de migración completa

- `src\app\components\figma\ImageWithFallback.tsx` — Duplicado de src\presentation\components\common\ImageWithFallback.tsx
- `src/app/App.tsx` — Entry point alternativo, no producción

# 02_WAVE_1_PROVIDERS.md — Fase 3.0

## Objetivo

Consolidar todos los Context/Providers en `src/app/providers/AppProviders.tsx`.

## Directorios Afectados

- `src/presentation/contexts/` (AuthContext, CartContext, CartDrawerContext, ThemeContext)
- `src/app/contexts/` (ThemeContext duplicado)

## Archivos Afectados

| Archivo | Acción |
|---------|--------|
| `src/presentation/contexts/AuthContext.tsx` | MOVE → `src/app/providers/AppProviders.tsx` |
| `src/presentation/contexts/CartContext.tsx` | MOVE → `src/app/providers/AppProviders.tsx` |
| `src/presentation/contexts/CartDrawerContext.tsx` | MOVE → `src/app/providers/AppProviders.tsx` |
| `src/presentation/contexts/ThemeContext.tsx` | MOVE → `src/app/providers/AppProviders.tsx` |
| `src/app/contexts/ThemeContext.tsx` | DELETE (duplicado) |

## Prerequisitos

- CP-01: `npm run build` pasa sin errores (baseline)

## Validaciones

- CP-02: `npm run lint` pasa sin errores
- Todos los providers exportan correctamente
- No hay imports rotos después de consolidar

## Rollback

1. Revertir cambios en `src/main.tsx`
2. Restaurar archivos en `src/presentation/contexts/`
3. Ejecutar `npm run build`

## Riesgos

| Riesgo | Impacto | Probabilidad | Mitigación |
|--------|---------|--------------|------------|
| AuthProvider rompiendo estado | ALTO | BAJA | Testear login flujo completo |
| Cart context desincronizado | MEDIO | MEDIA | Testear carrito antes/después |
| Theme context styling roto | BAJO | BAJA | Verificar dark mode |

## Criterio de Éxito

- `npm run build` sin errores
- `npm run lint` sin errores
- Login funciona correctamente
- Carrito persiste estado
- Dark mode funciona

## Checkpoints

- CP-02: Post-consolidación providers
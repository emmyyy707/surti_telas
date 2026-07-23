# 09_PHASE_3.5_PREPARATION.md — Fase 3.4

## Phase 3.5 Preparation

### Objetivo
Dead Code Cleanup - Eliminación segura de código no referenciado

### Targets Identificados

| Target | Archivos | Acción |
|--------|----------|--------|
| src/app/features/common | ~35 | ELIMINAR |
| src/app/features/asesor | ~2 | ELIMINAR |
| src/app/features/domiciliario | ~2 | ELIMINAR |
| src/context | ~4 | ELIMINAR |
| src/presentation/contexts | ~4 | ELIMINAR |
| src/components/layout | ~3 | ELIMINAR |

### Pre-requisitos
- [x] Router validado
- [x] Providers consolidados
- [x] Imports críticos arreglados
- [x] Layout funcional

### Safety Checks (Pre-eliminación)
1. Verificar que ningún archivo active importa de los targets
2. Ejecutar build antes y después
3. Verificar rutas públicas

### Expected Outcome
- Reducción de ~720 errores a ~20 (solo admin modules)
- Codebase limpio y mantenible
- Preparado para desarrollo futuro
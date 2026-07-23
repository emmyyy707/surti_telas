# 02_SAFE_MIGRATION_ORDER.md

## Orden seguro de migración (dependencias first)

### Principios

1. Nunca romper imports existentes.
2. Migrar de hojas hacia raíces (dependencias primero).
3. Los providers se crean antes de consumirse.
4. Las rutas se actualizan después que los componentes existen.

### Orden canónico

```
Fase 2.2.1  src/hooks/            → src/shared/hooks/
Fase 2.2.2  src/types/            → src/shared/types/
Fase 2.2.3  src/config/           → src/infrastructure/config/
Fase 2.2.4  src/app/contexts/     → src/app/providers/
Fase 2.2.5  src/presentation/     → src/app/
Fase 2.2.6  src/components/layout/ → src/app/layouts/
Fase 2.2.7  src/app/components/   → src/features/*/components/
Fase 2.2.8  src/app/features/     → src/features/
Fase 2.2.9  src/shared/ui final cleanup
Fase 2.2.10 Eliminar duplicados confirmados (DELETE_CANDIDATE)
```

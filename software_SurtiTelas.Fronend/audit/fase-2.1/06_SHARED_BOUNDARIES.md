# Shared Boundaries — Fase 2.1

## Límites de `src/shared/`

### Dentro de `src/shared/` (PERMITIDO)

```
src/shared/
  ├── ui/          # Componentes UI universales (Button, Card, etc.)
  ├── hooks/       # Hooks globales (useTelas, usePagination)
  ├── utils/       # Utilidades puras (image-utils, cn, etc.)
  ├── types/       # Tipos TypeScript compartidos
  └── constants/   # Constantes (menuConfig, rutas)
```

### Fuera de `src/shared/` (PROHIBIDO importar)

- `src/features/` no puede importar desde `src/shared/` hacia arriba
- `src/shared/` no puede importar desde `src/app/`
- `src/shared/` no puede importar desde `src/domain/`

### Consolidaciones Requeridas

| Origen | Destino | Razón |
|--------|---------|-------|
| src/app/components/ui/ | src/shared/ui/ | Duplicados |
| src/hooks/ | src/shared/hooks/ | Hooks globales |
| src/types/ | src/shared/types/ | Tipos compartidos |
| src/shared/auth.types.ts | src/shared/types/auth.types.ts | Unificación |
| src/app/config/menuConfig.ts | src/shared/constants/menuConfig.ts | Constantes |

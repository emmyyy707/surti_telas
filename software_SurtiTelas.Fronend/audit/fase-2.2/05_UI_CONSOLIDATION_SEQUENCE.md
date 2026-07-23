# 05_UI_CONSOLIDATION_SEQUENCE.md

## UI Libraries

### Canónica: `src/shared/ui/`

### Pendiente de merge: `src/app/components/ui/`

### Criterio

1. `src/shared/ui/` es la fuente de verdad (componentes limpios, headsless-ready)
2. `src/app/components/ui/` contiene variantes con estilos hardcodeados
3. Conservar variantes más usadas en producción

### Orden

1. Auditar uso de cada componente duplicado en `src/app/components/ui/`
2. Migrar estilos faltantes a `src/shared/ui/`
3. Actualizar imports componente por componente
4. Eliminar `src/app/components/ui/` cuando todos los imports apunten a `src/shared/ui/`

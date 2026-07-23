# Application Decision — Fase 2.1

## Decisión: MANTENER dentro de `src/application/`

### Razón

El directorio `src/application/` contiene la capa de aplicación con:
- `services/TelaService.ts` — Servicio de aplicación

### Acciones Requeridas

1. **Mover** `src/application/` dentro de `src/` (ya está en su lugar)
2. **Mantener** estructura actual
3. **No eliminar** archivos
4. **Verificar** imports desde `src/features/`

### Dependencias

```
src/application/
  └── src/domain/
  └── src/infrastructure/
```

### Archivos Afectados

- `src\application\services\TelaService.ts`

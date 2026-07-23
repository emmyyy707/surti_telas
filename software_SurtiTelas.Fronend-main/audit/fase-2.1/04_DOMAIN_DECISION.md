# Domain Decision — Fase 2.1

## Decisión: MANTENER dentro de `src/domain/`

### Razón

El directorio `src/domain/` ya contiene:
- `entities/Tela.ts` — Entidad principal del dominio
- `repositories/ITelaRepository.ts` — Contrato de repositorio

### Acciones Requeridas

1. **Mover** `src/domain/` dentro de `src/` (ya está en su lugar)
2. **Mantener** estructura actual: `entities/` + `repositories/`
3. **No eliminar** ninguno de los archivos actuales
4. **Verificar** que no haya dependencias externas a `src/domain/`

### Dependencias

```
src/domain/
  └── src/shared/ (tipos, utils)
```

### Archivos Afectados

- `src\domain\entities\Tela.ts`
- `src\domain\repositories\ITelaRepository.ts`
- `src\domain\useCases\GetTelasUseCase.ts`

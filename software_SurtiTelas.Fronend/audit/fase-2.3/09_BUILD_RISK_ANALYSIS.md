# 09_BUILD_RISK_ANALYSIS.md

## Riesgos de migración

| Riesgo | Impacto | Archivos | Tipo |
|--------|---------|----------|------|
| Mover src/presentation/ a src/app/ | HIGH | 26 | ROUTING_BREAK |
| Fusionar src/app/components/ui/ en src/shared/ui/ | MEDIUM | 68 | IMPORT_BREAK |
| Eliminar src/app/contexts/ThemeContext.tsx | MEDIUM | 1 | PROVIDER_BREAK |
| Eliminar 73 archivos duplicados | CRITICAL | 73 | DATA_LOSS |

## Recomendaciones

1. Ejecutar `npm run build` antes de cualquier movimiento
2. Migrar en waves pequeñas con validación continua
3. No eliminar archivos duplicados hasta confirmar contenido idéntico
4. Mantener backup de estructura original

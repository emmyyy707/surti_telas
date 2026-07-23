# PRISMA MIGRATION PLAN

## Migraci?n propuesta
- A?adir ?ndices a columnas usadas en filters/joins.
- Revisar relaciones y campos nullable para minimizar payloads.
- Documentar rollback con migraci?n reversible.

## Impacto
- Mejora de latencia lectura/escritura para listados grandes.
- Menor uso de memoria por query.
- Riesgo bajo si se aplica con migraci?n incremental y pruebas de smoke.
# PERFORMANCE REPORT

## Hallazgos
- El arranque de [src/shared/server.ts](src/shared/server.ts) ejecuta `ensurePrincipalAdminExists()` y un warmup de Prisma en cada inicio; esto a?ade latencia innecesaria en despliegues fr?os.
- [src/config/prisma.ts](src/config/prisma.ts) crea un cliente Prisma en el arranque; el patr?n es correcto para Node, pero conviene centralizar el singleton y evitar recreaciones en tests o hot reload.
- Los repositories de Prisma cargan relaciones con `include` en consultas CRUD simples; esto aumenta el tama?o de payload y el costo por request.
- El m?dulo de productos aplica filtros y mapeos en m?ltiples capas (controller ? usecase ? repository ? mapper), lo que agrega trabajo repetido por request.

## Recomendaciones
- Reducir el warmup a un fallback opcional y moverlo fuera del camino cr?tico del arranque.
- Usar `select` expl?cito para queries de listado y `include` solo cuando se necesiten relaciones.
- Evitar consultas secuenciales cuando varias entidades puedan resolverse en una sola pasada.
# ENTERPRISE REFACTOR PLAN

## Fase 1 ? limpiar arquitectura
1. Consolidar auth en un ?nico flujo de use case compartido.
2. Unificar mapeo de productos en un ?nico adapter o repository.
3. Reducir m?dulos inactivos a una revisi?n expl?cita antes de su eliminaci?n.

## Fase 2 ? optimizar prisma
1. A?adir ?ndices para claves y filtros comunes.
2. Cambiar `include` innecesarios por `select` expl?cito.
3. Centralizar consultas repetidas.

## Fase 3 ? dependencia y rendimiento
1. Eliminar scripts y dependencias de desarrollo no usados.
2. Mover warmup opcional fuera del arranque cr?tico.
3. Revisar m?dulos no montados antes de eliminar archivos.
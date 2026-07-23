# DUPLICATED CODE REPORT

## Hallazgos
- [src/modules/auth/service/auth.service.ts](src/modules/auth/service/auth.service.ts) y [src/usecases/auth/auth.usecase.ts](src/usecases/auth/auth.usecase.ts) duplican la l?gica de login, refresh y generaci?n de tokens.
- [src/modules/products/service/products.service.ts](src/modules/products/service/products.service.ts) y [src/infra/prisma/prisma-product.repository.ts](src/infra/prisma/prisma-product.repository.ts) duplican la normalizaci?n y el filtrado de productos.
- [scripts/extract_postman_endpoints.cjs](scripts/extract_postman_endpoints.cjs) y [scripts/extract_postman_endpoints.js](scripts/extract_postman_endpoints.js) replican el mismo script en dos formatos.
- Las respuestas JSON y el manejo de errores se repiten por controlador en m?dulos CRUD.

## Propuesta de reutilizaci?n
- Centralizar JWT/Bcrypt en un ?nico helper compartido y dejar los use cases al servicio de orquestaci?n.
- Consolidar el mapper de productos en un solo adapter o utilitario compartido.
- Mantener un ?nico script de extracci?n de endpoints y eliminar la duplicaci?n de formatos.
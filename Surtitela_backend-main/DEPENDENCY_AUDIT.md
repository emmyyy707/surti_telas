# DEPENDENCY AUDIT

## package.json
- `tsx` se usa en el script `dev`; se mantiene.
- `prisma` y `@prisma/client` son necesarios para build y runtime.
- `nodemon` y `ts-node-dev` no tienen uso evidente en los scripts del proyecto y pueden eliminarse si no se planea usar watch manual.
- `multer` se importa en el c?digo de subida pero no se valida si hay un flujo completo de uploads; revisar si el m?dulo de uploads est? realmente activo.

## Impacto de mejora
- Reducir dependencias de desarrollo evita mantenimiento innecesario y tiempos de instalaci?n.
- Mantener solo herramientas de build y runtime reduce riesgo de vulnerabilidades.
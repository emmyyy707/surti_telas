# PRISMA OPTIMIZATION REPORT

## Hallazgos
- El esquema en [prisma/schema.prisma](prisma/schema.prisma) define relaciones entre modelos, pero no se observan `@@index` sobre claves for?neas como `id_customer`, `id_order`, `id_product` ni sobre campos de filtrado frecuentes.
- Varias consultas en repositorios usan `include` sin necesidad de traer relaciones completas para listados b?sicos.
- Se detectan consultas repetidas para `products_category` y relaciones de usuario/cliente en repositorios de ?rdenes y productos.

## Optimizaci?n propuesta
- A?adir ?ndices en columnas de b?squeda y joins frecuentes.
- Usar `select` para devolver solo campos necesarios.
- Evitar `include` innecesarios en listados y reemplazarlos por `select` o por joins expl?citos cuando se requiera un subconjunto peque?o.
- Consolidar queries repetidas en un helper de repositorio o un servicio de lectura.
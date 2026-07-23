# TECHNICAL DEBT REPORT

- La app monta solo un subconjunto peque?o de m?dulos; el resto qued? en el ?rbol del proyecto pero no participa del runtime.
- Hay dos formas de implementar auth (use case y service) y dos capas de mapping para productos.
- Los controladores repiten la misma forma de validar datos, responder errores y mapear entidades.
- La base de datos no muestra ?ndices expl?citos para claves y b?squedas frecuentes.
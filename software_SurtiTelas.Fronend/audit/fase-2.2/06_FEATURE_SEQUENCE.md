# 06_FEATURE_SEQUENCE.md

## Features a migrar

| Orden | Feature | Razón |
|-------|---------|-------|
| 1 | public | Páginas base del sitio; menor acoplamiento |
| 2 | auth | Depende de providers (ya consolidados) |
| 3 | admin | Módulos grandes pero aislados por rol |
| 4 | asesor | Depende de admin layout |
| 5 | domiciliario | Depende de admin layout |
| 6 | cliente | Depende de shared UI |

## Subsecuencia dentro de cada feature

1. components/
2. hooks/
3. services/
4. index.ts

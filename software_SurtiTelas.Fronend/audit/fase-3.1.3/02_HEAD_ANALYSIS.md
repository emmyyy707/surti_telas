# 02_HEAD_ANALYSIS.md — Fase 3.1.3

## Análisis de Head - Favicon

### Sin Helmet/Head dinámico

- **react-helmet**: NO instalado/usado
- **react-helmet-async**: NO instalado/usado
- **Dynamic document.title**: NO hay código que modifique el title

### Favicon estático en index.html

```html
<link rel="icon" type="image/png" href="@assets/images/logos/partner-logo-1-Photoroom.png" />
<link rel="apple-touch-icon" href="@assets/images/logos/partner-logo-1-Photoroom.png" />
```

### Problemas identificados

| Problema | Detalle |
|----------|---------|
| Ruta inválida | `@assets/...` no es válido en HTML - solo funciona en imports JS/TS |
| Archivo inexistente | `partner-logo-1-Photoroom.png` no existe |
| Sin fallback | No hay favicon.ico en public/ raíz |

### LoginPage vs Rutas públicas

Ambas usan el mismo favicon estático de index.html. No hay diferencia que explique por qué aparece en /login pero no en públicas.

### Footer.tsx (línea 12)

```tsx
import logoSurticamisetas from '@assets/images/logos/partner-logo-1.png';
```

Este archivo SÍ existe (83KB). El footer lo usa correctamente.
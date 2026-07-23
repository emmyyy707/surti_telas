# 03_ROUTE_COMPARISON.md — Fase 3.1.3

## Comparación de Rutas - Favicon

### Rutas públicas (usando PublicLayout)

| Ruta | PublicLayout | Navbar | Footer | Favicon |
|------|--------------|--------|--------|---------|
| / | ✅ Sí | ✅ Sí (via PublicLayout) | ✅ Sí | ❌ No aparece (ruta mala) |
| /catalogo | ✅ Sí | ✅ Sí | ✅ Sí | ❌ No aparece |
| /carrito | ✅ Sí | ✅ Sí | ✅ Sí | ❌ No aparece |
| /contacto | ✅ Sí | ✅ Sí | ✅ Sí | ❌ No aparece |
| /nosotros | ✅ Sí | ✅ Sí | ✅ Sí | ❌ No aparece |

### Rutas de auth (sin PublicLayout)

| Ruta | PublicLayout | Navbar | Favicon |
|------|--------------|--------|---------|
| /login | ❌ No | ❌ No | ⚠️ Vite.svg por defecto |
| /registro | ❌ No | ❌ No | ⚠️ Vite.svg por defecto |

### HomePage.tsx (línea 316)

```tsx
{/* NAVBAR ELIMINADO PARA EVITAR DUPLICIDAD */}
```

HomePage está envuelto por PublicLayout en App.tsx (línea 69), por lo que Navbar aparece correctamente.

### Conclusión

El favicon NO aparece en login ni en públicas porque:

1. **index.html tiene ruta inválida** para el favicon
2. **No hay archivo favicon.ico** en public/ raíz
3. **El navegador usa vite.svg por defecto** como fallback
4. **No hay diferencia real** entre login y públicas - ambas usan el mismo favicon roto

El problema es el favicon mal referenciado, NO una diferencia de rutas.
# 04_ROUTING_SEQUENCE.md

## Routing

### Estado actual

- `src/presentation/pages/App.tsx` contiene `<BrowserRouter>` + `<Routes>`
- `src/app/pages/SurtitelasLanding.tsx` es ruta alternativa (no producción)
- `src/app/App.tsx` usa routing implícito por estado (no React Router)

### Secuencia

1. Mover `src/presentation/pages/App.tsx` a `src/app/router/routes.tsx`
2. Consolidar rutas públicas y admin en un solo `<Routes>`
3. Eliminar `src/app/pages/SurtitelasLanding.tsx` (DELETE_CANDIDATE)
4. Eliminar `src/app/App.tsx` routing implícito (DELETE_CANDIDATE)
5. Actualizar imports de `src/main.tsx`

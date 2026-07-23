# 11_BUILD_VALIDATION_PLAN.md — Fase 3.0

## Checkpoints Obligatorios

| ID | Momento | Acción | Comando | Criterio Éxito |
|----|---------|--------|---------|----------------|
| CP-01 | Pre-migración | Baseline build | `npm run build` | Exit code 0, sin errores |
| CP-02 | Post-Wave 1 | Lint post-providers | `npm run lint` | Exit code 0, sin errores |
| CP-03 | Post-Wave 2 | Build post-shared | `npm run build` | Exit code 0, sin errores |
| CP-03 | Post-Wave 5 | Build post-features | `npm run build` | Exit code 0, sin errores |
| CP-04 | Post-Wave 3 | Navegación manual | `npm run dev` | Todas las rutas funcionan |
| CP-05 | Post-Wave 4 | Verificar imports UI | `npm run build` + search imports | Sin referencias rotas |
| CP-06 | Pre-Wave 6 | Tests unitarios | `npm run test` (si existe) | Todos pasan |
| CP-07 | Post-Wave 6 | Staging validation | Deploy staging + QA manual | Sin errores críticos |

## Validación por Wave

### Wave 1 — Providers
```bash
npm run build    # Verificar entry point funciona
npm run lint     # Verificar sintaxis
# Test manual: login, carrito, dark mode
```

### Wave 2 — Shared
```bash
npm run build    # Verificar imports de hooks/types
# Test manual: funcionalidades que usan hooks
```

### Wave 3 — Routing
```bash
npm run dev &    # Iniciar dev server
# Navegar: /, /catalogo, /carrito, /contacto
# Navegar: /login, /admin/dashboard
# Verificar ProtectedRoute
```

### Wave 4 — UI
```bash
npm run build    # Verificar todos los imports UI
npm run lint     # Verificar reglas de styling
# Test visual: Login, Dashboard, Catálogo
```

### Wave 5 — Features
```bash
npm run build    # Build final de features
npm run lint     # Lint final
# Test manual por feature
```

### Wave 6 — Cleanup
```bash
npm run build    # Build post-limpieza
npm run lint     # Lint post-limpieza
# Eliminar imports rotos si existen
```

## Build Script

```json
{
  "scripts": {
    "build": "tsc --noEmit && vite build",
    "lint": "eslint src --ext .ts,.tsx",
    "type-check": "tsc --noEmit"
  }
}
```

## Errores Comunes y Soluciones

| Error | Solución |
|-------|----------|
| Cannot find module '@/...' | Verificar tsconfig paths |
| TS2307: Cannot find module | Actualizar import o crear barrel export |
| ENOENT: no such file or directory | Archivo no encontrado, verificar ruta |
| React Router: No routes matched | Verificar routes.tsx está importado en main |

## Éxito Final

- `npm run build` → exit code 0
- `npm run lint` → exit code 0
- `npm run dev` → inicia sin errores
- Navegación → funciona en todas las rutas
- Funcionalidades → verificadas por QA manual
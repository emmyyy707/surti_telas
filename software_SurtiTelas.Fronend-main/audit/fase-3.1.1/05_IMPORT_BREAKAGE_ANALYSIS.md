# 05_IMPORT_BREAKAGE_ANALYSIS.md — Fase 3.1.1

## Análisis de Imports Rotos

### Búsqueda de imports a rutas antiguas de contexts

Comando: `grep -r "@presentation/contexts/(AuthContext|ThemeContext|CartContext|CartDrawerContext)"`

### Resultados

| Archivo | Import | Estado |
|---------|--------|--------|
| src/presentation/contexts/AuthContext.tsx | N/A (origen) | ✅ Archivo original |
| src/presentation/contexts/ThemeContext.tsx | N/A (origen) | ✅ Archivo original |
| src/presentation/contexts/CartContext.tsx | N/A (origen) | ✅ Archivo original |
| src/presentation/contexts/CartDrawerContext.tsx | N/A (origen) | ✅ Archivo original |
| src/presentation/routes/ProtectedRoute.tsx | `../contexts/AuthContext` | ⚠️ **ROTO** - Requiere fix |

### Causa raíz del error "useAuth debe usarse dentro de AuthProvider"

**ProtectedRoute.tsx (línea 5)** tiene una importación relativa a la ruta antigua:
```tsx
import { useAuth } from "../contexts/AuthContext";  // ❌ Ruta antigua
```

Esto causará el error cuando:
1. El archivo ProtectedRoute se use sin AuthProvider en el árbol
2. O cuando el código futuro intente usar el contexto desde la ruta eliminada

### Otros imports sospechosos

| Archivo | Import | Estado |
|---------|--------|--------|
| Header.tsx | `@/app/contexts/ThemeContext` (removido) | ✅ Ya corregido |
| AdminDashboard.tsx (app/components) | `@/app/providers/AppProviders` | ✅ Correcto |

### Resumen de Import Breakage

- **1 import roto crítico**: ProtectedRoute.tsx
- **0 imports rotos menores**
- **Solución pendiente**: Wave 1 requiere fix del import en ProtectedRoute.tsx
# 06_WAVE1_FIX_PLAN.md — Fase 3.1.1

## Plan de Corrección - Wave 1 Stabilization

### Archivos que REQUIEREN corrección (NO EJECUTADA)

| Archivo | Línea | Problema | Solución |
|---------|-------|----------|----------|
| src/presentation/routes/ProtectedRoute.tsx | 5 | Import a ruta antigua | Cambiar a `@/app/providers/AppProviders` |

### Archivos que YA están correctos

- src/app/providers/AppProviders.tsx ✅
- src/main.tsx ✅
- src/presentation/pages/App.tsx ✅
- src/presentation/pages/components/Navbar.tsx ✅
- src/presentation/pages/auth/LoginPage.tsx ✅
- src/presentation/components/CartDrawer.tsx ✅
- src/presentation/components/ProductDetailModal.tsx ✅
- src/presentation/components/CheckoutModal.tsx ✅
- src/presentation/components/CartItem.tsx ✅
- src/presentation/pages/features/CartPage.tsx ✅
- src/components/layout/Header.tsx ✅
- src/app/components/AdminDashboard.tsx ✅

### Fixes sugeridos

```tsx
// ProtectedRoute.tsx - línea 5 (actual)
import { useAuth } from "../contexts/AuthContext";

// ProtectedRoute.tsx - línea 5 (corregido)
import { useAuth } from "@/app/providers/AppProviders";
```

### Impacto de los fixes

- Resolve el error "useAuth debe usarse dentro de AuthProvider"
- Completa la migración de todos los consumers al nuevo path canónico
- Prepara el código para Wave 6 (eliminación de archivos huérfanos)
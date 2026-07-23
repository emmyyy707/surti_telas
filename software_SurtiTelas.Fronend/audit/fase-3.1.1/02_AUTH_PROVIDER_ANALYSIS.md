# 02_AUTH_PROVIDER_ANALYSIS.md — Fase 3.1.1

## Analisis de AuthProvider

### Consumers detectados

| Archivo | Hook usado | Import Path | Estado |
|---------|------------|-----------|--------|
| src/presentation/pages/auth/LoginPage.tsx | useAuth | @/app/providers/AppProviders | ✅ Correcto |
| src/presentation/pages/components/Navbar.tsx | useAuth | @/app/providers/AppProviders | ✅ Correcto |
| src/presentation/routes/ProtectedRoute.tsx | useAuth | ../contexts/AuthContext (OBSOLETO) | ⚠️ Import incorrecto |

### Problema detectado

**ProtectedRoute.tsx (línea 5)** tiene un import **roturo**:
```tsx
import { useAuth } from "../contexts/AuthContext";  // ❌ Ruta antigua
```

Este archivo sigue importando desde la ruta original, no desde el nuevo AppProviders.

### Impacto

Si ProtectedRoute.tsx se usa sin envolver con AuthProvider desde el path antiguo, lanzará error:
```
"useAuth debe usarse dentro de AuthProvider"
```

### Solución (NOTA: NO EJECUTADA - solo auditoría)

El archivo ProtectedRoute.tsx requiere actualización del import:
```tsx
import { useAuth } from "@/app/providers/AppProviders";  // ✅ Ruta canónica
```

### Componentes con Auth dependencias

| Componente | Depende de Auth |
|------------|-----------------|
| ProtectedRoute.tsx | ✅ Si (requiere fix) |
| App.tsx (rutas) | ✅ Via ProtectedRoute |
| AdminDashboard.tsx (app y features) | ❌ No usa useAuth |
| LoginPage.tsx | ✅ Si |
| Navbar.tsx | ✅ Si |
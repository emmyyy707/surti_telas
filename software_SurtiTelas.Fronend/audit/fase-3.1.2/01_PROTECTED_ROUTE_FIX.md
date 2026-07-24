# 01_PROTECTED_ROUTE_FIX.md — Fase 3.1.2

## ProtectedRoute.tsx — Fix Aplicado

### Antes (línea 5)

```tsx
import { useAuth } from "../contexts/AuthContext";
```

### Después (línea 5)

```tsx
import { useAuth } from '@/app/providers/AppProviders';
```

### Verificación

- ProtectedRoute.tsx ahora usa el import canónico
- El hook useAuth está disponible dentro de AuthProvider (AppProviders)
- No hay ruptura de import
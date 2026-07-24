# Provider Strategy — Fase 2.0

## Providers Actuales

| Provider | Ubicación | Estado |
|----------|-----------|--------|
| AuthProvider | src/presentation/contexts/AuthContext.tsx | ✅ MANTENER |
| CartProvider | src/presentation/contexts/CartContext.tsx | ✅ MANTENER |
| CartDrawerProvider | src/presentation/contexts/CartDrawerContext.tsx | ✅ MANTENER |
| ThemeProvider | src/presentation/contexts/ThemeContext.tsx | ✅ MANTENER (principal) |
| ThemeProvider | src/app/contexts/ThemeContext.tsx | ❌ ELIMINAR (duplicado) |
| QueryClientProvider | @tanstack/react-query | ✅ MANTENER |

## Estrategia

1. **Consolidar**: Mover todos los providers a `src/app/providers/AppProviders.tsx`
2. **Fusionar**: Eliminar `src/app/contexts/ThemeContext.tsx` (duplicado)
3. **Mantener**: AuthProvider, CartProvider, CartDrawerProvider, ThemeProvider
4. **Eliminar**: ThemeProvider duplicado en `src/app/contexts/`
5. **Unificar**: Un solo archivo `AppProviders.tsx` que envuelva toda la app

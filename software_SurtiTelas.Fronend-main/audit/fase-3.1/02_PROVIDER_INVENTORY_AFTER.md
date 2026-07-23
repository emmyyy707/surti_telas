# 02_PROVIDER_INVENTORY_AFTER.md — Fase 3.1

## Proveedores Consolidados

### src/app/providers/AppProviders.tsx (Destino Final)

| Exportado | Tipo | Ubicación Original |
|-----------|------|-------------------|
| AuthProvider | Auth | src/presentation/contexts/AuthContext.tsx |
| ThemeProvider | Theme | src/presentation/contexts/ThemeContext.tsx |
| CartProvider | Cart | src/presentation/contexts/CartContext.tsx |
| CartDrawerProvider | CartDrawer | src/presentation/contexts/CartDrawerContext.tsx |
| useAuth | Hook | src/presentation/contexts/AuthContext.tsx |
| useTheme | Hook | src/presentation/contexts/ThemeContext.tsx |
| useCart | Hook | src/presentation/contexts/CartContext.tsx |
| useCartDrawer | Hook | src/presentation/contexts/CartDrawerContext.tsx |
| UserRole, AuthUser, LoginResult | Tipos | src/presentation/contexts/AuthContext.tsx |
| Product, CartItem | Tipos | src/presentation/contexts/CartContext.tsx |

### main.tsx Actualizado

```tsx
import { AppProviders } from "@/app/providers/AppProviders";
```

AppProviders ahora envuelve a `<App />` en la jerarquía de providers.

### App.tsx Actualizado

- Eliminado wrapper `<AppProviders>` (movido a main.tsx)
- `<BrowserRouter>` ahora es líder directo

### Archivos con Imports Actualizados

| Archivo | Cambio |
|---------|--------|
| src/presentation/pages/components/Navbar.tsx | `@presentation/contexts/*` → `@/app/providers/AppProviders` |
| src/presentation/pages/auth/LoginPage.tsx | `@presentation/contexts/AuthContext` → `@/app/providers/AppProviders` |
| src/presentation/components/CartDrawer.tsx | `@presentation/contexts/*` → `@/app/providers/AppProviders` |
| src/presentation/components/ProductDetailModal.tsx | `@presentation/contexts/CartContext` → `@/app/providers/AppProviders` |
| src/presentation/components/CheckoutModal.tsx | `@presentation/contexts/CartContext` → `@/app/providers/AppProviders` |
| src/presentation/components/CartItem.tsx | `@presentation/contexts/CartContext` → `@/app/providers/AppProviders` |
| src/presentation/pages/features/CartPage.tsx | `@presentation/contexts/CartContext` → `@/app/providers/AppProviders` |
| src/components/layout/Header.tsx | `@/app/contexts/ThemeContext` → `@/app/providers/AppProviders` |
| src/app/components/AdminDashboard.tsx | `@presentation/contexts/ThemeContext` → `@/app/providers/AppProviders` |
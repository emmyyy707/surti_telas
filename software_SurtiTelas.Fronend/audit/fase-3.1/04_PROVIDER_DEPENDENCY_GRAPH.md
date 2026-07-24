# 04_PROVIDER_DEPENDENCY_GRAPH.md — Fase 3.1

## Dependency Graph — Providers

```
main.tsx
├── QueryClientProvider (react-query)
└── AppProviders (src/app/providers/AppProviders.tsx)
    ├── AuthProvider
    │   └── firebase/auth + @config/firebase
    ├── CartProvider
    │   └── localStorage (persistencia)
    ├── CartDrawerProvider
    │   └── (sin dependencias externas)
    └── ThemeProvider
        └── localStorage + document.documentElement
```

## Hook Dependencies

| Hook | Provider Requerido |
|-----|-------------------|
| useAuth | AuthProvider |
| useCart | CartProvider |
| useCartDrawer | CartDrawerProvider |
| useTheme | ThemeProvider |

## Component Consumers

```
Navbar.tsx → useAuth, useCart
LoginPage.tsx → useAuth
CartDrawer.tsx → useCart, useCartDrawer
CartPage.tsx → useCart
CheckoutModal.tsx → useCart
ProductDetailModal.tsx → useCart
CartItem.tsx → CartItem type
Header.tsx → useTheme
AdminDashboard.tsx → useTheme
```

## Export Chain

```
src/app/providers/AppProviders.tsx
exports:
├── Providers: AuthProvider, ThemeProvider, CartProvider, CartDrawerProvider
├── Hooks: useAuth, useTheme, useCart, useCartDrawer
└── Types: UserRole, AuthUser, LoginResult, Product, CartItem
```
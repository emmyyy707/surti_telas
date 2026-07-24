# 01_ACTIVE_EXECUTION_TREE.md — Fase 3.4

## Active Execution Tree

### Entry Point
```
main.tsx
```

### Providers Layer
```
main.tsx
  └─> QueryClientProvider (TanStack Query)
      └─> AppProviders (src/app/providers/AppProviders.tsx)
          ├─> AuthProvider
          │   ├─> useAuth hook
          │   ├─> loginWithCredentials
          │   └─> logout
          ├─> CartProvider
          │   ├─> useCart hook
          │   └─> CartContext
          ├─> CartDrawerProvider
          │   └─> useCartDrawer hook
          └─> ThemeProvider
              └─> useTheme hook
```

### Router Layer
```
App.tsx (src/presentation/pages/App.tsx)
  └─> BrowserRouter
      └─> Routes
          ├─> PublicLayout (inline)
          │   ├─> Navbar (src/presentation/pages/components/Navbar.tsx)
          │   ├─> CartDrawer (src/presentation/components/CartDrawer.tsx)
          │   └─> Footer (src/presentation/pages/components/footer.tsx)
          ├─> Public Routes
          │   ├─> / → HomePage (src/presentation/pages/public/HomePage.tsx)
          │   ├─> /catalogo → CatalogPage (src/presentation/pages/features/CatalogPage.tsx)
          │   ├─> /carrito → CartPage (src/presentation/pages/features/CartPage.tsx)
          │   ├─> /contacto → ContactPage (src/presentation/pages/features/ContactPage.tsx)
          │   ├─> /nosotros → AboutPage (src/presentation/pages/public/AboutPage.tsx)
          │   └─> /registro → RegisterPage (src/presentation/pages/auth/RegisterPage.tsx)
          └─> Protected Routes
              └─> RoleRoute (inline wrapper)
                  ├─> /admin/* → AdminDashboard (src/app/components/AdminDashboard.tsx) - lazy
                  ├─> /asesor/dashboard → AdminDashboard (src/app/components/AdminDashboard.tsx) - lazy
                  ├─> /domiciliario/dashboard → AdminDashboard (src/app/components/AdminDashboard.tsx) - lazy
                  └─> /cliente/dashboard → AdminDashboard (src/app/components/AdminDashboard.tsx) - lazy
```

### Shared Components Used by Active Code
```
src/shared/ui/*
  ├─> Button.tsx - Navbar, HomePage
  ├─> Card.tsx - Footer, múltiples
  ├─> Spinner.tsx - Loading screens
  ├─> Modal.tsx - CartDrawer
  └─> Drawer.tsx - FilterDrawer
```

### Files NEVER Loaded (Dead Code)
```
src/app/features/common/* - 35 archivos
src/app/features/asesor/* - 2 archivos  
src/app/features/domiciliario/* - 2 archivos
src/app/components/* (duplicados) - 20+ archivos
src/context/* - 4 archivos
src/presentation/contexts/* - 4 archivos
src/components/layout/* - 3 archivos
```
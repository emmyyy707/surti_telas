# 01_ROUTE_MAP.md — Fase 3.2

## Route Navigation Tree

### Entry Points
```
main.tsx
  └─> App.tsx (presentation/pages/App.tsx)
      └─> BrowserRouter
          └─> Routes
```

### Public Routes (ACTIVE)
| Path | Component | Source | Layout | Status |
|------|-----------|--------|--------|--------|
| `/` | HomePage | src/presentation/pages/public/HomePage.tsx | PublicLayout | ✅ ACTIVO |
| `/catalogo` | CatalogPage | src/presentation/pages/features/CatalogPage.tsx | PublicLayout | ✅ ACTIVO |
| `/carrito` | CartPage | src/presentation/pages/features/CartPage.tsx | PublicLayout | ✅ ACTIVO |
| `/contacto` | ContactPage | src/presentation/pages/features/ContactPage.tsx | PublicLayout | ✅ ACTIVO |
| `/nosotros` | AboutPage | src/presentation/pages/public/AboutPage.tsx | PublicLayout | ✅ ACTIVO |
| `/login` | LoginPage | src/presentation/pages/auth/LoginPage.tsx | N/A | ✅ ACTIVO |
| `/registro` | RegisterPage | src/presentation/pages/auth/RegisterPage.tsx | N/A | ✅ ACTIVO |
| `/unauthorized` | Inline | App.tsx | N/A | ✅ ACTIVO |

### Protected Routes (ACTIVE)
| Path | Component | Roles | Lazy | Status |
|------|-----------|-------|------|--------|
| `/admin/dashboard` | AdminDashboard | admin, asesor, domiciliario, cliente | ✅ | ✅ ACTIVO |
| `/admin/users` | UsuariosModule | admin | ✅ | ✅ ACTIVO |
| `/admin/inventario` | InventarioModule | admin, asesor | ✅ | ✅ ACTIVO |
| `/admin/pedidos` | HistorialPagosModule | admin, asesor | ✅ | ✅ ACTIVO |
| `/admin/clientes` | ClientesModule | admin, asesor | ✅ | ✅ ACTIVO |
| `/admin/domiciliarios` | DomiciliosModule | admin | ✅ | ✅ ACTIVO |
| `/admin/analytics` | ReportesModule | admin | ✅ | ✅ ACTIVO |
| `/admin/configuracion` | ConfiguracionModule | admin | ✅ | ✅ ACTIVO |
| `/asesor/dashboard` | AdminDashboard | asesor | ✅ | ✅ ACTIVO |
| `/domiciliario/dashboard` | AdminDashboard | domiciliario | ✅ | ✅ ACTIVO |
| `/cliente/dashboard` | AdminDashboard | cliente | ✅ | ✅ ACTIVO |

### Fallback
| Path | Redirect | Status |
|------|----------|--------|
| `*` | Navigate to `/` | ✅ ACTIVO |

## Layouts Analysis

### PublicLayout (App.tsx línea 44-51)
```tsx
<Navbar />      // src/presentation/pages/components/Navbar.tsx
<CartDrawer />  // src/presentation/components/CartDrawer.tsx
<main>{children}</main>
<Footer />      // src/presentation/pages/components/footer.tsx
```

### Dead Routes (Files exist but NOT in router)
| Archivo | Ruta esperada | Estado |
|---------|---------------|--------|
| src/app/features/common/ClientDashboard.tsx | /cliente/dashboard | ⚠️ Obsoleto (usado AdminDashboard) |
| src/app/features/common/ClientDashboardNew.tsx | No definida | ❌ HUÉRFANO |
| src/app/features/admin/SimpleLoginPage.tsx | No definida | ❌ HUÉRFANO |
| src/app/features/common/BlogPage.tsx | No definida | ❌ HUÉRFANO |
| src/app/features/common/BottomNavigation.tsx | No definida | ❌ HUÉRFANO |
| src/app/features/common/CartSidebar.tsx | No definida | ❌ HUÉRFANO |

## Route Statistics
- Total rutas públicas definidas: 8
- Total rutas protegidas definidas: 11
- Total rutas accesibles: 19
- Total rutas huérfanas: ~5
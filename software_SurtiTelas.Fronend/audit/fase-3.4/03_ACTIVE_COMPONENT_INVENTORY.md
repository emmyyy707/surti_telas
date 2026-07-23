# 03_ACTIVE_COMPONENT_INVENTORY.md — Fase 3.4

## Active Component Inventory

### ACTIVE Components (Loaded by Router)

| Archivo | Quien lo usa | Conectado router |
|---------|--------------|-----------------|
| src/presentation/pages/App.tsx | main.tsx | ✅ |
| src/presentation/routes/ProtectedRoute.tsx | App.tsx | ✅ |
| src/presentation/pages/components/Navbar.tsx | PublicLayout | ✅ |
| src/presentation/pages/components/footer.tsx | PublicLayout | ✅ |
| src/presentation/pages/public/HomePage.tsx | App.tsx | ✅ |
| src/presentation/pages/public/AboutPage.tsx | App.tsx | ✅ |
| src/presentation/pages/features/CatalogPage.tsx | App.tsx | ✅ |
| src/presentation/pages/features/CartPage.tsx | App.tsx | ✅ |
| src/presentation/pages/features/ContactPage.tsx | App.tsx | ✅ |
| src/presentation/pages/auth/LoginPage.tsx | App.tsx | ✅ |
| src/presentation/pages/auth/RegisterPage.tsx | App.tsx | ✅ |
| src/app/components/AdminDashboard.tsx | App.tsx (lazy) | ✅ |
| src/app/features/admin/UsuariosModule.tsx | App.tsx (lazy) | ✅ |
| src/app/features/admin/InventarioModule.tsx | App.tsx (lazy) | ✅ |
| src/app/features/admin/HistorialPagosModule.tsx | App.tsx (lazy) | ✅ |
| src/app/features/admin/ClientesModule.tsx | App.tsx (lazy) | ✅ |
| src/app/features/admin/DomiciliosModule.tsx | App.tsx (lazy) | ✅ |
| src/app/features/admin/ReportesModule.tsx | App.tsx (lazy) | ✅ |
| src/app/features/admin/ConfiguracionModule.tsx | App.tsx (lazy) | ✅ |
| src/presentation/components/CartDrawer.tsx | PublicLayout | ✅ |
| src/presentation/components/ScrollToTop.tsx | App.tsx | ✅ |
| src/presentation/components/FilterDrawer.tsx | CatalogPage | ✅ |
| src/presentation/components/CartItem.tsx | CartDrawer | ✅ |
| src/presentation/components/CartSummary.tsx | CartDrawer | ✅ |
| src/presentation/components/CheckoutModal.tsx | CartDrawer | ✅ |
| src/presentation/components/ProductDetailModal.tsx | CatalogPage | ✅ |

### LEGACY Components (Figma-derived, with issues)

| Archivo | Quien lo usa | Conectado router |
|---------|--------------|-----------------|
| src/app/features/common/* (35 archivos) | NADIE | ❌ |
| src/app/features/common/HomePage.tsx | NADIE | ❌ |
| src/app/features/common/ProductsPage.tsx | NADIE | ❌ |
| src/app/features/common/LoginPage.tsx | NADIE | ❌ |
| src/app/features/common/ClientDashboard.tsx | NADIE | ❌ |
| src/app/features/common/Footer.tsx | NADIE | ❌ |
| src/app/features/common/NavigationBar.tsx | NADIE | ❌ |
| src/app/features/common/ProductsPageNew.tsx | NADIE | ❌ |
| src/app/features/common/ProfilePage.tsx | NADIE | ❌ |
| src/app/features/common/RatingsAndMessagesSection.tsx | NADIE | ❌ |

### ORPHAN Components (Never referenced)

| Archivo | Categoría |
|---------|-----------|
| src/app/features/asesor/* (2 archivos) | Module |
| src/app/features/domiciliario/* (2 archivos) | Module |
| src/app/features/common/BlogPage.tsx | Page |
| src/app/features/common/BottomNavigation.tsx | Component |
| src/app/features/common/CartSidebar.tsx | Component |
| src/app/features/common/VideoCarousel.tsx | Component |
| src/app/features/common/WhatsAppButton.tsx | Component |
| src/app/features/common/GlobalSearch.tsx | Component |
| src/app/features/common/NotificationCenter.tsx | Component |

### UNKNOWN Components (No clear usage)

| Archivo | Notas |
|---------|-------|
| src/app/App.tsx | Versión alternativa de App.tsx, no usada por main.tsx |
| src/app/MODO_EXPORTACION.tsx | Solo para exportación Figma |
| src/app/components/UserDashboard.tsx | Duplicado de AdminDashboard patrón |
| src/app/components/ContactPage.tsx | Duplicado de presentation/features/ContactPage.tsx |
| src/app/components/AdvisorPanelSidebar.tsx | Usado por MODO_EXPORTACION pero no router |

### Summary
- ACTIVE: 24 archivos
- LEGACY with issues: ~35 archivos
- ORPHAN: ~15 archivos
- UNKNOWN: ~10 archivos
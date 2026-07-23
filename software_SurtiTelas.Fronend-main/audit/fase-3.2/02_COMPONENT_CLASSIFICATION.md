# 02_COMPONENT_CLASSIFICATION.md — Fase 3.2

## Component Classification Report

### ACTIVO (Referenciado por rutas/layouts)

| Archivo | Referencias | Tipo |
|---------|-------------|------|
| src/presentation/pages/App.tsx | main.tsx | Router principal |
| src/presentation/routes/ProtectedRoute.tsx | App.tsx | Guardia de rutas |
| src/app/providers/AppProviders.tsx | main.tsx | Providers consolidados |
| src/presentation/pages/public/HomePage.tsx | App.tsx | Página pública |
| src/presentation/pages/public/AboutPage.tsx | App.tsx | Página pública |
| src/presentation/pages/features/CatalogPage.tsx | App.tsx | Página pública |
| src/presentation/pages/features/CartPage.tsx | App.tsx | Página pública |
| src/presentation/pages/features/ContactPage.tsx | App.tsx | Página pública |
| src/presentation/pages/auth/LoginPage.tsx | App.tsx | Página auth |
| src/presentation/pages/auth/RegisterPage.tsx | App.tsx | Página auth |
| src/presentation/pages/components/Navbar.tsx | PublicLayout | Navbar público |
| src/presentation/pages/components/footer.tsx | PublicLayout | Footer público |
| src/presentation/components/CartDrawer.tsx | PublicLayout | Carrito flotante |
| src/presentation/components/ScrollToTop.tsx | App.tsx | Utility |
| src/app/components/AdminDashboard.tsx | App.tsx (lazy) | Dashboard admin |

### ACTIVO (Lazy loaded modules)

| Archivo | Ruta | Referencias |
|---------|------|-------------|
| src/app/features/admin/UsuariosModule.tsx | /admin/users | App.tsx lazy import |
| src/app/features/admin/InventarioModule.tsx | /admin/inventario | App.tsx lazy import |
| src/app/features/admin/HistorialPagosModule.tsx | /admin/pedidos | App.tsx lazy import |
| src/app/features/admin/ClientesModule.tsx | /admin/clientes | App.tsx lazy import |
| src/app/features/admin/DomiciliosModule.tsx | /admin/domiciliarios | App.tsx lazy import |
| src/app/features/admin/ReportesModule.tsx | /admin/analytics | App.tsx lazy import |
| src/app/features/admin/ConfiguracionModule.tsx | /admin/configuracion | App.tsx lazy import |

### OBSOLETO (Reemplazado por otro archivo)

| Archivo | Reemplazado por | Notas |
|---------|-----------------|-------|
| src/context/ThemeContext.ts | src/presentation/contexts/ThemeContext.tsx | No usado desde fase 2.0 |
| src/context/CartContext.ts | src/presentation/contexts/CartContext.tsx | No usado desde fase 2.0 |
| src/context/AuthContext.ts | src/presentation/contexts/AuthContext.tsx + AppProviders.tsx | Consolidado |
| src/context/CartDrawerContext.ts | src/presentation/contexts/CartDrawerContext.tsx + AppProviders.tsx | Consolidado |
| src/app/components/HeroCarousel.tsx | src/app/components/HeroCarousel.tsx | ¿Duplicado? |
| src/app/features/common/HeroCarousel.tsx | src/app/components/HeroCarousel.tsx | ¿Duplicado? |

### HUÉRFANO (Sin referencias entrantes)

#### Carpetas con múltiples archivos huérfanos:

**src/app/features/common/** (~35 archivos)
| Archivo | Tipo | Notas |
|---------|------|-------|
| ClientDashboard.tsx | Page | Reemplazado por AdminDashboard en rutas |
| ClientDashboardNew.tsx | Page | No referenciado |
| ProductsPage.tsx | Page | Reemplazado por CatalogPage en rutas |
| ProductsPageNew.tsx | Page | No referenciado |
| CatalogPage.tsx | Page | Reemplazado por otro en presentation/ |
| CartPage.tsx | Page | Reemplazado por otro en presentation/ |
| ContactPage.tsx | Page | Reemplazado por otro en presentation/ |
| AboutPage.tsx | Page | Reemplazado por otro en presentation/ |
| HomePage.tsx | Page | Reemplazado por otro en presentation/ |
| Footer.tsx | Component | Reemplazado por otro en presentation/ |
| NavigationBar.tsx | Component | No referenciado |
| LoginPage.tsx | Page | Reemplazado por otro en presentation/ |
| FigmaExportView.tsx | View | Solo usado en modo exportación |
| ClientNotes.tsx | Component | Sin referencias |
| ClientManagement.tsx | Component | Sin referencias |
| DashboardOverview.tsx | Component | Sin referencias |
| AdvisorPanelSidebar.tsx | Component | Sin referencias |
| AdvisorRatingsManagement.tsx | Component | Sin referencias |
| AdvisorRatingSection.tsx | Component | Sin referencias |
| AdvisorMetrics.tsx | Component | Sin referencias |
| AdvisorAssistant.tsx | Component | Sin referencias |
| AdvancedMetrics.tsx | Component | Sin referencias |
| ActivityTimeline.tsx | Component | Sin referencias |
| BlogPage.tsx | Page | Sin referencias |
| BottomNavigation.tsx | Component | Sin referencias |
| CartSidebar.tsx | Component | Sin referencias |
| GlobalSearch.tsx | Component | Sin referencias |
| InventoryAlerts.tsx | Component | Sin referencias |
| LoadingScreen.tsx | Component | Sin referencias |
| NFCScreen.tsx | Component | Sin referencias |
| NotificationCenter.tsx | Component | Sin referencias |
| ProductCard.tsx | Component | Sin referencias |
| ProductFilters.tsx | Component | Sin referencias |
| ProfilePage.tsx | Page | Sin referencias |
| QuickActions.tsx | Component | Sin referencias |
| RatingsAndMessagesSection.tsx | Component | Sin referencias |
| ScrollingImages.tsx | Component | Sin referencias |
| ServicesPage.tsx | Page | Sin referencias |
| ShoppingCart.tsx | Component | Sin referencias |
| SmartRecommendations.tsx | Component | Sin referencias |
| VideoCarousel.tsx | Component | Sin referencias |
| WhatsAppButton.tsx | Component | Sin referencias |

**src/app/features/asesor/**
| Archivo | Tipo | Notas |
|---------|------|-------|
| ComisionesModule.tsx | Module | No referenciado |
| MisClientesModule.tsx | Module | No referenciado |

**src/app/features/domiciliario/**
| Archivo | Tipo | Notas |
|---------|------|-------|
| RutasModule.tsx | Module | No referenciado |
| EntregasModule.tsx | Module | No referenciado |

**src/components/layout/**
| Archivo | Tipo | Notas |
|---------|------|-------|
| DashboardLayout.tsx | Layout | No referenciado |
| Header.tsx | Component | No referenciado |
| Sidebar.tsx | Component | No referenciado |

**src/app/components/** (duplicados/huérfanos)
| Archivo | Notas |
|---------|-------|
| UserDashboard.tsx | Sin referencias |
| ContactPage.tsx | Reemplazado por presentation/ |
| ClientNotes.tsx | Sin referencias |
| ClientManagement.tsx | Sin referencias |
| AdvisorRatingsManagement.tsx | Sin referencias |
| AdvisorRatingSection.tsx | Sin referencias |
| AdvisorPanelSidebar.tsx | Sin referencias |
| AdvisorMetrics.tsx | Sin referencias |
| AdvisorAssistant.tsx | Sin referencias |
| VideoCarousel.tsx | Sin referencias |
| WhatsAppButton.tsx | Sin referencias |

### Shared Components (Active)

| Archivo | Tipo | Usado en |
|---------|------|----------|
| src/shared/ui/Button.tsx | UI | Navbar.tsx, múltiples |
| src/shared/ui/Card.tsx | UI | Múltiples |
| src/shared/ui/Modal.tsx | UI | CartDrawer |
| src/shared/ui/Drawer.tsx | UI | FilterDrawer |
| src/shared/ui/Spinner.tsx | UI | App.tsx loaders |
| src/presentation/components/CartItem.tsx | Component | CartDrawer |
| src/presentation/components/CartSummary.tsx | Component | CartDrawer |
| src/presentation/components/CheckoutModal.tsx | Component | CartDrawer |
| src/presentation/components/ProductDetailModal.tsx | Component | CatalogPage |
| src/presentation/components/FilterDrawer.tsx | Component | CatalogPage |

### Orphan Count Summary
- Total archivos huérfanos estimados: ~45
- Total archivos activos: ~15
- Total archivos obsoletos: ~5
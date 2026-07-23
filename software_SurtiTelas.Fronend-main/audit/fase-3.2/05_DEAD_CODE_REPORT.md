# 05_DEAD_CODE_REPORT.md — Fase 3.2

## Dead Code Detection

### Componentes nunca renderizados

#### Pages (No referenciadas en router)
| Archivo | Categoría | Notas |
|---------|-----------|-------|
| src/app/features/common/ClientDashboard.tsx | Page | Reemplazado por AdminDashboard en rutas protegidas |
| src/app/features/common/ClientDashboardNew.tsx | Page | No referenciado en absoluto |
| src/app/features/common/ProductsPage.tsx | Page | Reemplazado por presentation/features/CatalogPage.tsx |
| src/app/features/common/ProductsPageNew.tsx | Page | No referenciado |
| src/app/features/common/CatalogPage.tsx | Page | Reemplazado por presentation/ |
| src/app/features/common/ContactPage.tsx | Page | Reemplazado por presentation/ |
| src/app/features/common/AboutPage.tsx | Page | Reemplazado por presentation/ |
| src/app/features/common/HomePage.tsx | Page | Reemplazado por presentation/ |
| src/app/features/common/BlogPage.tsx | Page | No referenciado |
| src/app/features/admin/SimpleLoginPage.tsx | Page | No referenciado |

#### Components (Sin referencias)
| Archivo | Tipo | Notas |
|---------|------|-------|
| src/app/features/common/Footer.tsx | Component | Reemplazado por presentation/components/footer.tsx |
| src/app/features/common/NavigationBar.tsx | Component | Sin referencias |
| src/app/features/common/GlobalSearch.tsx | Component | Sin referencias |
| src/app/features/common/NotificationCenter.tsx | Component | Sin referencias |
| src/app/features/common/QuickActions.tsx | Component | Sin referencias |
| src/app/features/common/InventoryAlerts.tsx | Component | Sin referencias |
| src/app/features/common/ProductFilters.tsx | Component | Sin referencias |
| src/app/features/common/ProductCard.tsx | Component | Sin referencias |
| src/app/features/common/SmartRecommendations.tsx | Component | Sin referencias |
| src/app/features/common/ShoppingCart.tsx | Component | Sin referencias |
| src/app/features/common/RatingsAndMessagesSection.tsx | Component | Sin referencias |
| src/app/features/common/ScrollingImages.tsx | Component | Sin referencias |
| src/app/features/common/ServicesPage.tsx | Component | Sin referencias |
| src/app/features/common/VideoCarousel.tsx | Component | Sin referencias |
| src/app/features/common/WhatsAppButton.tsx | Component | Sin referencias |
| src/app/features/common/ClientNotes.tsx | Component | Sin referencias |
| src/app/features/common/ClientManagement.tsx | Component | Sin referencias |
| src/app/features/common/DashboardOverview.tsx | Component | Sin referencias |
| src/app/features/common/AdvisorPanelSidebar.tsx | Component | Sin referencias |
| src/app/features/common/AdvisorRatingsManagement.tsx | Component | Sin referencias |
| src/app/features/common/AdvisorRatingSection.tsx | Component | Sin referencias |
| src/app/features/common/AdvisorMetrics.tsx | Component | Sin referencias |
| src/app/features/common/AdvisorAssistant.tsx | Component | Sin referencias |
| src/app/features/common/AdvancedMetrics.tsx | Component | Sin referencias |
| src/app/features/common/ActivityTimeline.tsx | Component | Sin referencias |
| src/app/features/common/BottomNavigation.tsx | Component | Sin referencias |
| src/app/features/common/CartSidebar.tsx | Component | Sin referencias |

### Hooks nunca usados

| Archivo | Hook | Estado |
|---------|------|--------|
| src/app/features/common/* | useAuth, useCart, useTheme | Los hooks están en AppProviders.tsx (usados) |

### Contextos no utilizados

| Archivo | Contexto | Estado |
|---------|----------|--------|
| src/context/ThemeContext.ts | ThemeContext | Reemplazado por AppProviders.tsx |
| src/context/CartContext.ts | CartContext | Reemplazado por AppProviders.tsx |
| src/context/AuthContext.ts | AuthContext | Reemplazado por AppProviders.tsx |
| src/context/CartDrawerContext.ts | CartDrawerContext | Reemplazado por AppProviders.tsx |
| src/presentation/contexts/AuthContext.tsx | AuthContext | Ya no referenciado (providers en AppProviders.tsx) |
| src/presentation/contexts/CartContext.tsx | CartContext | Ya no referenciado |
| src/presentation/contexts/ThemeContext.tsx | ThemeContext | Ya no referenciado |
| src/presentation/contexts/CartDrawerContext.tsx | CartDrawerContext | Ya no referenciado |

### Utilidades no utilizadas

| Archivo | Utilidad | Estado |
|---------|----------|--------|
| src/app/features/common/NFCScreen.tsx | NFCScreen | Sin referencias |
| src/app/features/common/LoadingScreen.tsx | LoadingScreen | Sin referencias (App.tsx usa Spinner) |

### Data files no referenciados

| Archivo | Tipo | Estado |
|---------|------|--------|
| src/app/features/common/data/mockData.tsx | mockData | Busca pero no existe |
| src/app/data/mockData.ts | mockData | Existe pero no referenciado |

### Módulos Figma legacy

| Archivo | Tipo | Estado |
|---------|------|--------|
| src/app/features/common/FigmaExportView.tsx | View | Solo para exportación, no en rutas |
| src/app/features/figma/ImageWithFallback.tsx | Component | No referenciado (existe alternativa) |
| src/app/components/figma/ImageWithFallback.tsx | Component | Duplicado |

### Layouts no referenciados

| Archivo | Tipo | Estado |
|---------|------|--------|
| src/components/layout/DashboardLayout.tsx | Layout | Sin referencias |
| src/components/layout/Header.tsx | Component | Sin referencias |
| src/components/layout/Sidebar.tsx | Component | Sin referencias |

### Dead Code Count Summary
- Páginas huérfanas: 10
- Componentes huérfanos: ~25
- Contextos obsoletos: 8
- Utilidades huérfanas: 2
- Módulos Figma legacy: 3
- Layouts huérfanos: 3
- **Total archivos muertos**: ~50
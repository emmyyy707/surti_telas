# 08_CLEANUP_ROADMAP.md — Fase 3.2

## Cleanup Roadmap

### Wave A - Orphan File Removal (SAFE)
**Objetivo**: Eliminar archivos sin referencias entrantes

| Archivo | Tipo | Riesgo |
|---------|------|--------|
| src/app/features/common/ClientDashboard.tsx | Page (reemplazado) | Bajo |
| src/app/features/common/ClientDashboardNew.tsx | Page (huérfano) | Bajo |
| src/app/features/common/ProductsPage.tsx | Page (reemplazado) | Bajo |
| src/app/features/common/ProductsPageNew.tsx | Page (huérfano) | Bajo |
| src/app/features/common/CatalogPage.tsx | Page (reemplazado) | Bajo |
| src/app/features/common/ContactPage.tsx | Page (reemplazado) | Bajo |
| src/app/features/common/AboutPage.tsx | Page (reemplazado) | Bajo |
| src/app/features/common/HomePage.tsx | Page (reemplazado) | Bajo |
| src/app/features/common/BlogPage.tsx | Page (huérfano) | Bajo |
| src/app/features/common/Footer.tsx | Component (reemplazado) | Bajo |
| src/app/features/common/NavigationBar.tsx | Component (huérfano) | Bajo |
| src/app/features/common/GlobalSearch.tsx | Component (huérfano) | Bajo |
| src/app/features/common/NotificationCenter.tsx | Component (huérfano) | Bajo |
| src/app/features/common/QuickActions.tsx | Component (huérfano) | Bajo |
| src/app/features/common/InventoryAlerts.tsx | Component (huérfano) | Bajo |
| src/app/features/common/ProductFilters.tsx | Component (huérfano) | Bajo |
| src/app/features/common/ProductCard.tsx | Component (huérfano) | Bajo |
| src/app/features/common/SmartRecommendations.tsx | Component (huérfano) | Bajo |
| src/app/features/common/ShoppingCart.tsx | Component (huérfano) | Bajo |
| src/app/features/common/RatingsAndMessagesSection.tsx | Component (huérfano) | Bajo |
| src/app/features/common/ScrollingImages.tsx | Component (huérfano) | Bajo |
| src/app/features/common/ServicesPage.tsx | Component (huérfano) | Bajo |
| src/app/features/common/VideoCarousel.tsx | Component (huérfano) | Bajo |
| src/app/features/common/WhatsAppButton.tsx | Component (huérfano) | Bajo |
| src/app/features/common/ClientNotes.tsx | Component (huérfano) | Bajo |
| src/app/features/common/ClientManagement.tsx | Component (huérfano) | Bajo |
| src/app/features/common/DashboardOverview.tsx | Component (huérfano) | Bajo |
| src/app/features/common/AdvisorPanelSidebar.tsx | Component (huérfano) | Bajo |
| src/app/features/common/AdvisorRatingsManagement.tsx | Component (huérfano) | Bajo |
| src/app/features/common/AdvisorRatingSection.tsx | Component (huérfano) | Bajo |
| src/app/features/common/AdvisorMetrics.tsx | Component (huérfano) | Bajo |
| src/app/features/common/AdvisorAssistant.tsx | Component (huérfano) | Bajo |
| src/app/features/common/AdvancedMetrics.tsx | Component (huérfano) | Bajo |
| src/app/features/common/ActivityTimeline.tsx | Component (huérfano) | Bajo |
| src/app/features/common/BottomNavigation.tsx | Component (huérfano) | Bajo |
| src/app/features/common/CartSidebar.tsx | Component (huérfano) | Bajo |

**Total Wave A**: 35 archivos

---

### Wave B - Import Repair (Medium Risk)
**Objetivo**: Corregir imports rotos

| Archivo | Acción | Riesgo |
|---------|--------|--------|
| src/app/features/common/* | Cambiar ./ui/* → ../../components/ui/* | Medio |
| src/app/features/shared/* | Cambiar ./ui/* → ../../components/ui/* | Medio |
| src/shared/ui/index.ts | Fix barrel exports | Medio |
| src/app/features/common/FigmaExportView.tsx | Fix figma import | Medio |
| src/app/features/common/* | Eliminar ../types, ../data/mockData imports | Medio |

**Total Wave B**: ~40 imports en ~25 archivos

---

### Wave C - TypeScript Errors (High Risk)
**Objetivo**: Resolver errores de tipos

| Archivo | Error | Riesgo |
|---------|-------|--------|
| LoginPage.tsx | Implicit any params | Alto |
| ProductsPage.tsx | Implicit any, missing props | Alto |
| ProfilePage.tsx | Implicit any, missing imports | Alto |
| AdvisorPanelSidebar.tsx | Type incompatibility, implicit any | Alto |
| FigmaExportView.tsx | Missing props | Alto |
| ServicesPage.tsx | Invalid lucide icons | Alto |

**Total Wave C**: ~150 errores en ~15 archivos

---

### Wave D - Component Consolidation (Medium Risk)
**Objetivo**: Eliminar duplicados

| Archivo | Duplicado con | Riesgo |
|---------|---------------|--------|
| src/context/*.ts | contextos obsoletos | Medio |
| src/presentation/contexts/*.tsx | contextos obsoletos | Medio |
| src/app/features/common/FigmaExportView.tsx | MODO_EXPORTACION | Medio |
| src/app/components/ui/* vs src/shared/ui/* | UI components | Medio |
| HeroCarousel doble (app/components vs app/features/common) | Mismo nombre | Medio |

**Total Wave D**: ~15 archivos obsoletos

---

### Wave E - Final Cleanup (Low Risk)
**Objetivo**: Limpieza final

| Acción | Items | Riesgo |
|--------|-------|--------|
| Eliminar carpetas vacías | ui/, data/, types/ en common/ | Bajo |
| Eliminar alias tsconfig no usados | Paths antiguos | Bajo |
| Eliminar dependencias no usadas | zustand, axios, @tanstack/react-table | Bajo |
| Verificar build final | npm run build | Bajo |

**Total Wave E**: ~5 acciones

---

## Timeline estimado

| Wave | Archivos | Tiempo estimado |
|------|----------|-----------------|
| A | 35 | 2-3 horas |
| B | 40 imports | 3-4 horas |
| C | 150 errores | 6-8 horas |
| D | 15 | 2-3 horas |
| E | 5 | 1 hora |
| **Total** | **~240 items** | **14-19 horas** |
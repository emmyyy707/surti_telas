# 04_LEGACY_FIGMA_INVENTORY.md — Fase 3.4

## Legacy Figma Inventory

### src/app/features/common/ - FULL AUDIT

| Archivo | Usado por router | Referencias | Errores TS | Status |
|---------|------------------|-----------|----------|--------|
| HomePage.tsx | ❌ | 0 | ~20 | HUÉRFANO |
| AboutPage.tsx | ❌ | 0 | ~20 | HUÉRFANO |
| BlogPage.tsx | ❌ | 0 | ~15 | HUÉRFANO |
| CatalogPage.tsx | ❌ | 0 | ~25 | HUÉRFANO |
| ContactPage.tsx | ❌ | 0 | ~20 | HUÉRFANO |
| CartPage.tsx | ❌ | 0 | ~20 | HUÉRFANO |
| ProductsPage.tsx | ❌ | 0 | ~40 | HUÉRFANO |
| ProductsPageNew.tsx | ❌ | 0 | ~35 | HUÉRFANO |
| LoginPage.tsx | ❌ | 0 | ~25 | HUÉRFANO |
| Footer.tsx | ❌ | 0 | ~20 | HUÉRFANO |
| NavigationBar.tsx | ❌ | 0 | ~25 | HUÉRFANO |
| ClientDashboard.tsx | ❌ | 0 | ~20 | HUÉRFANO |
| ClientDashboardNew.tsx | ❌ | 0 | ~25 | HUÉRFANO |
| FigmaExportView.tsx | ❌ | MODO_EXPORTACION | ~15 | HUÉRFANO |

### src/app/features/common/ui/ - EMPTY DIRECTORY
Carpeta ui/ en common fue creada como stub (no existía originalmente)

### src/app/features/figma/ - SINGLE COMPONENT
| Archivo | Status |
|---------|--------|
| ImageWithFallback.tsx | DUPLICADO (existe en presentation/components/common/) |

### src/app/components/ - DUPLICATE COMPONENTS

| Archivo | Duplicado con | Status |
|---------|--------------|--------|
| AboutPage.tsx | presentation/public/AboutPage.tsx | HUÉRFANO |
| ContactPage.tsx | presentation/features/ContactPage.tsx | HUÉRFANO |
| UserDashboard.tsx | AdminDashboard.tsx | HUÉRFANO |
| AdvisorPanelSidebar.tsx | AdminDashboard modules | HUÉRFANO |
| ClientNotes.tsx | common/ClientNotes.tsx | HUÉRFANO |
| ClientManagement.tsx | common/ClientManagement.tsx | HUÉRFANO |
| AdvisorAssistant.tsx | common/AdvisorAssistant.tsx | HUÉRFANO |
| AdvisorMetrics.tsx | common/AdvisorMetrics.tsx | HUÉRFANO |
| AdvisorRatingsManagement.tsx | common/AdvisorRatingsManagement.tsx | HUÉRFANO |
| AdvisorRatingSection.tsx | common/AdvisorRatingSection.tsx | HUÉRFANO |

### Legacy Summary
- Total archivos figma legacy: ~45
- Total errores TS en legacy: ~400+
- Total errores TS en active: ~15

**95% de errores TS pertenecen al código legacy no referenciado**
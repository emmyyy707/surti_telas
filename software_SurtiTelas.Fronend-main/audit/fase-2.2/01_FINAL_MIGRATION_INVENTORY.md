# 01_FINAL_MIGRATION_INVENTORY.md

Resumen de mover/merge/delete confirmados por fase 2.0/2.1/2.1.2.

## 1. Directorios origen involucrados

| Directorio origen | Archivos afectados | Acción predominante |
|-------------------|--------------------|----------------------|
| src | 7 | DELETE_CANDIDATE |

## 2. Movimientos (MOVE)

Total: 120

| Origen | Destino | Razón |
|--------|---------|-------|
| `src\app\components\AboutPage.tsx` | `src/features/public/components/AboutPage.tsx` | Componente público a estructura feature-based |
| `src\app\components\ActivityTimeline.tsx` | `src/features/public/components/ActivityTimeline.tsx` | Componente público a estructura feature-based |
| `src\app\components\AdminDashboard.tsx` | `src/features/public/components/AdminDashboard.tsx` | Componente público a estructura feature-based |
| `src\app\components\AdvisorAssistant.tsx` | `src/features/public/components/AdvisorAssistant.tsx` | Componente público a estructura feature-based |
| `src\app\components\AdvisorMetrics.tsx` | `src/features/public/components/AdvisorMetrics.tsx` | Componente público a estructura feature-based |
| `src\app\components\AdvisorPanelSidebar.tsx` | `src/features/public/components/AdvisorPanelSidebar.tsx` | Componente público a estructura feature-based |
| `src\app\components\AdvisorRatingSection.tsx` | `src/features/public/components/AdvisorRatingSection.tsx` | Componente público a estructura feature-based |
| `src\app\components\AdvisorRatingsManagement.tsx` | `src/features/public/components/AdvisorRatingsManagement.tsx` | Componente público a estructura feature-based |
| `src\app\components\BlogPage.tsx` | `src/features/public/components/BlogPage.tsx` | Componente público a estructura feature-based |
| `src\app\components\BottomNavigation.tsx` | `src/features/public/components/BottomNavigation.tsx` | Componente público a estructura feature-based |
| `src\app\components\CartPage.tsx` | `src/features/public/components/CartPage.tsx` | Componente público a estructura feature-based |
| `src\app\components\CartSidebar.tsx` | `src/features/public/components/CartSidebar.tsx` | Componente público a estructura feature-based |
| `src\app\components\CatalogPage.tsx` | `src/features/public/components/CatalogPage.tsx` | Componente público a estructura feature-based |
| `src\app\components\ClientDashboard.tsx` | `src/features/public/components/ClientDashboard.tsx` | Componente público a estructura feature-based |
| `src\app\components\ClientDashboardNew.tsx` | `src/features/public/components/ClientDashboardNew.tsx` | Componente público a estructura feature-based |
| `src\app\components\ClientManagement.tsx` | `src/features/public/components/ClientManagement.tsx` | Componente público a estructura feature-based |
| `src\app\components\ClientNotes.tsx` | `src/features/public/components/ClientNotes.tsx` | Componente público a estructura feature-based |
| `src\app\components\ContactPage.tsx` | `src/features/public/components/ContactPage.tsx` | Componente público a estructura feature-based |
| `src\app\components\DashboardOverview.tsx` | `src/features/public/components/DashboardOverview.tsx` | Componente público a estructura feature-based |
| `src\app\components\ErrorBoundary.tsx` | `src/features/public/components/ErrorBoundary.tsx` | Componente público a estructura feature-based |

... y 100 movimientos adicionales.

## 3. Fusiones (MERGE)

Total: 0


## 4. Eliminaciones (DELETE_CANDIDATE)

Total: 4

- `src\app\components\figma\ImageWithFallback.tsx` → `src\presentation\components\common\ImageWithFallback.tsx` | Duplicado de src\presentation\components\common\ImageWithFallback.tsx
- `src\app\contexts\ThemeContext.tsx` → `src\presentation\contexts\ThemeContext.tsx` | Duplicado de src\presentation\contexts\ThemeContext.tsx
- `src/app/App.tsx` → `audit/archive/App.tsx` | Entry point alternativo, no producción
- `src/app/MODO_EXPORTACION.tsx` → `audit/archive/MODO_EXPORTACION.tsx` | Modo Figma, no producción

## 5. Mantener (KEEP)

Total: 3

- `src/domain/` — Mover dentro de src/ (ya está)
- `src/application/` — Mover dentro de src/ (ya está)
- `src/infrastructure/` — Mover dentro de src/ (ya está)

## Resumen total

- Movimientos: 120
- Fusiones: 0
- Eliminaciones: 4
- Mantener: 3

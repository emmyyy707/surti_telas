# FASE 3.7 — TS2307 RECOVERY REPORT

## Build Errors Analysis

### Initial State
- **BUILD_ERRORS_BEFORE**: 203

## Active Files (imported by main.tsx → presentation/App.tsx)

Files that are part of the active import graph:
- `src/main.tsx`
- `src/presentation/pages/App.tsx` (router)
- `src/presentation/pages/public/HomePage.tsx` (active)
- `src/presentation/pages/public/AboutPage.tsx` (active)
- `src/presentation/pages/features/CatalogPage.tsx` (active)
- `src/presentation/pages/features/CartPage.tsx` (active)
- `src/presentation/pages/features/ContactPage.tsx` (active)
- `src/presentation/pages/auth/LoginPage.tsx` (active)
- `src/presentation/pages/auth/RegisterPage.tsx` (active)
- `src/presentation/routes/ProtectedRoute.tsx` (active)
- `src/app/providers/AppProviders.tsx` (active)
- `src/app/components/AdminDashboard.tsx` (active - lazy loaded)
- `src/app/features/admin/*.tsx` (active - used by AdminDashboard)
- `src/app/features/asesor/*.tsx` (active - used by AdminDashboard)
- `src/app/features/domiciliario/*.tsx` (active - used by AdminDashboard)
- `src/app/features/cliente/*.tsx` (active - used by AdminDashboard)

## Legacy Files (NOT imported by active routes)

The following files in `src/app/components/` are **legacy** and have import errors:
- `src/app/components/AboutPage.tsx` - Legacy (presentation/pages/public/about used instead)
- `src/app/components/Footer.tsx` - Legacy (presentation/pages/components/footer used instead)
- `src/app/components/NavigationBar.tsx` - Legacy
- `src/app/components/LoginPage.tsx` - Legacy (presentation/pages/auth/LoginPage used instead)
- `src/app/components/ServicesPage.tsx` - Legacy
- `src/app/components/ContactPage.tsx` - Legacy (presentation/pages/features/ContactPage used instead)
- `src/app/components/CatalogPage.tsx` - Legacy
- `src/app/components/CartPage.tsx` - Legacy (presentation/pages/features/CartPage used instead)
- `src/app/components/CartSidebar.tsx` - Legacy
- `src/app/components/AdvisorPanelSidebar.tsx` - Legacy (features/shared used instead)
- `src/app/components/ClientDashboard.tsx` - Legacy
- `src/app/components/ClientDashboardNew.tsx` - Legacy
- `src/app/components/UserDashboard.tsx` - Legacy
- `src/app/components/ProductCard.tsx` - Legacy
- `src/app/components/ProductsPage.tsx` - Legacy
- `src/app/components/ProductsPageNew.tsx` - Legacy
- `src/app/components/ProfilePage.tsx` - Legacy
- `src/app/components/BlogPage.tsx` - Legacy
- `src/app/components/BottomNavigation.tsx` - Legacy
- `src/app/components/ShoppingCart.tsx` - Legacy
- `src/app/components/SmartRecommendations.tsx` - Legacy
- `src/app/components/FigmaExportView.tsx` - Legacy
- `src/app/components/ClientManagement.tsx` - Legacy
- `src/app/components/AdvisorAssistant.tsx` - Legacy
- `src/app/components/AdvisorMetrics.tsx` - Legacy
- `src/app/components/AdvisorRatingSection.tsx` - Legacy
- `src/app/components/AdvisorRatingsManagement.tsx` - Legacy
- `src/app/components/DashboardOverview.tsx` - Legacy (imports missing AdvancedMetrics)
- `src/app/components/cliente/DashboardClientes.tsx` - Legacy

## TS2307 Errors - Missing Modules

Files with missing `./types` or `../types` imports:
These are legacy components expecting types that don't exist at those paths.

## TS2307 Errors - Missing Radix/UI

- `src/app/components/ui/calendar.tsx` - Missing react-day-picker ✓ FIXED
- `src/app/components/ui/carousel.tsx` - Missing embla-carousel-react ✓ FIXED
- `src/app/components/ui/command.tsx` - Missing cmdk ✓ FIXED
- `src/app/components/ui/drawer.tsx` - Missing vaul ✓ FIXED
- `src/app/components/ui/input-otp.tsx` - Missing input-otp ✓ FIXED
- `src/app/components/ui/resizable.tsx` - Missing react-resizable-panels

## Fixes Applied

1. Fixed `src/app/shared/ui/index.ts` path from `../../../components/ui` to `../../components/ui`
2. Added `ButtonProps` export to `src/app/components/ui/button.tsx`
3. Fixed `src/app/components/Footer.tsx` - removed non-existent Facebook/Twitter/Linkedin imports
4. Fixed `src/app/shared/types/index.ts` path
5. Fixed percent type issues in ChartWrapper.tsx, DashboardGeneral.tsx, ReportesModule.tsx
6. Fixed onLogout optional check in AdminDashboard.tsx

## Next Steps

1. Install react-resizable-panels
2. Remove or re-export legacy files that are not reachable
3. Fix remaining TS7006 implicit any errors in active files
4. Fix TS2300 duplicate identifier in CartSidebar.tsx
# 07_CLEANUP_RISK_ANALYSIS.md — Fase 3.4

## Cleanup Risk Analysis

### Carpetas clasificadas

| Carpeta | Archivos | Clasificación | Riesgo |
|---------|----------|---------------|--------|
| src/app/features/common | ~35 | SAFE TO DELETE | Bajo - Nunca referenciado |
| src/app/features/asesor | ~2 | SAFE TO DELETE | Bajo - No rutas |
| src/app/features/domiciliario | ~2 | SAFE TO DELETE | Bajo - No rutas |
| src/app/features/figma | ~1 | NEEDS REVIEW | Medio - ImageWithFallback duplicado |
| src/app/features/shared | ~1 | NEEDS REVIEW | Medio - AdvisorPanelSidebar |
| src/context | ~4 | SAFE TO DELETE | Bajo - Consolidado en AppProviders |
| src/presentation/contexts | ~4 | SAFE TO DELETE | Bajo - Consolidado en AppProviders |
| src/components/layout | ~3 | SAFE TO DELETE | Bajo - No referenciado |
| src/shared/ui/index.ts | ~1 | NEEDS REVIEW | Medio - Path correction needed |
| src/app/App.tsx | ~1 | NEEDS REVIEW | Medio - Version alternativa |
| src/app/MODO_EXPORTACION.tsx | ~1 | SAFE TO DELETE | Bajo - Solo exportación Figma |

### Archivos críticos (NO TOCAR)

| Archivo | Riesgo |
|---------|--------|
| src/presentation/pages/App.tsx | ❌ CRÍTICO - Router principal |
| src/main.tsx | ❌ CRÍTICO - Entry point |
| src/app/providers/AppProviders.tsx | ❌ CRÍTICO - Providers consolidados |
| src/presentation/pages/components/Navbar.tsx | ❌ CRÍTICO - Navbar activo |
| src/presentation/pages/components/footer.tsx | ❌ CRÍTICO - Footer activo |
| src/presentation/pages/public/HomePage.tsx | ❌ CRÍTICO - Home activo |
| src/presentation/pages/public/AboutPage.tsx | ❌ CRÍTICO - About activo |
| src/presentation/pages/features/CatalogPage.tsx | ❌ CRÍTICO - Catálogo activo |
| src/presentation/pages/features/CartPage.tsx | ❌ CRÍTICO - Carrito activo |
| src/presentation/pages/features/ContactPage.tsx | ❌ CRÍTICO - Contacto activo |
| src/presentation/pages/auth/LoginPage.tsx | ❌ CRÍTICO - Login activo |
| src/app/components/AdminDashboard.tsx | ❌ CRÍTICO - Dashboard activo |

### Risk Matrix

| Categoría | Cantidad | Riesgo |
|-----------|----------|--------|
| SAFE TO DELETE | ~50 | Bajo - No afecta funcionalidad |
| NEEDS REVIEW | ~5 | Medio - Verificar hooks |
| ACTIVE | ~25 | Alto - Mantener intacto |
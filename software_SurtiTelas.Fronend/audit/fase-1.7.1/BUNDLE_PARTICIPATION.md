# BUNDLE_PARTICIPATION.md

## PARTICIPACIÓN REAL EN EL BUNDLE DE VITE

**Metodología:** Análisis de imports estáticos y dinámicos desde main.tsx.
**Sin ejecución de bundle.** Solo evidencia de imports.

---

## 1. BUNDLE PRINCIPAL

**Archivos que participan en el bundle principal (synchronous imports):**

| Archivo | Razón |
|---------|-------|
| src/main.tsx | Entrypoint |
| src/presentation/pages/App.tsx | Importado por main.tsx |
| src/presentation/contexts/AuthContext.tsx | Importado por App.tsx |
| src/presentation/contexts/CartContext.tsx | Importado por App.tsx |
| src/presentation/contexts/CartDrawerContext.tsx | Importado por App.tsx |
| src/presentation/contexts/ThemeContext.tsx | Importado por App.tsx |
| src/presentation/routes/ProtectedRoute.tsx | Importado por App.tsx |
| src/presentation/pages/components/Navbar.tsx | Importado por App.tsx |
| src/presentation/pages/components/footer.tsx | Importado por App.tsx |
| src/presentation/components/ScrollToTop.tsx | Importado por App.tsx |
| src/presentation/components/CartDrawer.tsx | Importado por App.tsx |
| src/presentation/components/CartItem.tsx | Importado por CartDrawer.tsx |
| src/presentation/components/CartSummary.tsx | Importado por CartDrawer.tsx |
| src/shared/ui/index.ts | Importado por CartContext.tsx y App.tsx |
| src/shared/ui/Alert.tsx | Importado por shared/ui/index.ts |
| src/shared/ui/Avatar.tsx | Importado por shared/ui/index.ts |
| src/shared/ui/Badge.tsx | Importado por shared/ui/index.ts |
| src/shared/ui/Button.tsx | Importado por shared/ui/index.ts |
| src/shared/ui/Card.tsx | Importado por shared/ui/index.ts |
| src/shared/ui/Drawer.tsx | Importado por shared/ui/index.ts |
| src/shared/ui/DropdownMenu.tsx | Importado por shared/ui/index.ts |
| src/shared/ui/EmptyState.tsx | Importado por shared/ui/index.ts |
| src/shared/ui/Input.tsx | Importado por shared/ui/index.ts |
| src/shared/ui/Modal.tsx | Importado por shared/ui/index.ts |
| src/shared/ui/Pagination.tsx | Importado por shared/ui/index.ts |
| src/shared/ui/Select.tsx | Importado por shared/ui/index.ts |
| src/shared/ui/Skeleton.tsx | Importado por shared/ui/index.ts |
| src/shared/ui/Spinner.tsx | Importado por App.tsx y shared/ui/index.ts |
| src/shared/ui/StatsCard.tsx | Importado por shared/ui/index.ts |
| src/shared/ui/Table.tsx | Importado por shared/ui/index.ts |
| src/app/components/ErrorBoundary.tsx | Importado por App.tsx |
| src/presentation/pages/public/HomePage.tsx | Importado por App.tsx |
| src/presentation/components/ProductModal.tsx | Importado por HomePage.tsx |
| src/presentation/components/common/ImageWithFallback.tsx | Importado por ProductModal.tsx |
| src/app/features/common/CatalogPage.tsx | Importado por App.tsx |
| src/app/features/common/CartPage.tsx | Importado por App.tsx |
| src/app/features/common/ContactPage.tsx | Importado por App.tsx |
| src/presentation/pages/public/AboutPage.tsx | Importado por App.tsx |
| src/presentation/pages/auth/LoginPage.tsx | Importado por App.tsx |
| src/presentation/pages/auth/RegisterPage.tsx | Importado por App.tsx |

---

## 2. CHUNKS LAZY

**Archivos que participan en chunks lazy (React.lazy en App.tsx:33-40):**

| Chunk | Archivo | Línea App.tsx |
|-------|---------|---------------|
| AdminDashboard | src/app/components/AdminDashboard.tsx | 33 |
| UsersPage | src/app/features/admin/UsuariosModule.tsx | 34 |
| InventoryPage | src/app/features/admin/InventarioModule.tsx | 35 |
| OrdersPage | src/app/features/admin/HistorialPagosModule.tsx | 36 |
| CustomersPage | src/app/features/admin/ClientesModule.tsx | 37 |
| DeliveryPage | src/app/features/admin/DomiciliosModule.tsx | 38 |
| AnalyticsPage | src/app/features/admin/ReportesModule.tsx | 39 |
| SettingsPage | src/app/features/admin/ConfiguracionModule.tsx | 40 |

---

## 3. ARCHIVOS QUE NO PARTICIPAN EN EL BUNDLE

**Archivos con 0 imports entrantes desde main.tsx (confirmado):**

| Categoría | Cantidad | Ejemplos |
|-----------|----------|----------|
| Duplicados en src/app/components/admin/* | 12 | InventarioModule.tsx, VentasModule.tsx, ClientesModule.tsx |
| Duplicados en src/app/components/common/* | 25 | AdvisorPanelSidebar.tsx, ClientDashboardNew.tsx, UserDashboard.tsx |
| Duplicados en src/app/components/domiciliario/* | 2 | EntregasModule.tsx, RutasModule.tsx |
| Duplicados en src/app/components/asesor/* | 2 | MisClientesModule.tsx, ComisionesModule.tsx |
| Features zombies en src/app/features/common/* | 30+ | ActivityTimeline.tsx, AdvancedMetrics.tsx, AdvisorAssistant.tsx |
| App paralela | 1 | src/app/App.tsx |
| Landing duplicado | 1 | src/app/pages/SurtitelasLanding.tsx |
| Clean Architecture | 7 | domain/*, application/*, infrastructure/* |
| Otros | 10+ | hooks, types, components/layout, presentation/hooks |

**Total archivos que NO participan:** ~145

---

## 4. DEPENDENCIAS NPM EN BUNDLE

| Paquete | Participa | Razón |
|---------|-----------|-------|
| react | SI | main.tsx |
| react-dom | SI | main.tsx |
| react-router-dom | SI | App.tsx |
| @tanstack/react-query | SI | main.tsx |
| lucide-react | SI | AdminDashboard.tsx |
| recharts | SI | AdminDashboard.tsx |
| sonner | SI | AdminDashboard.tsx |
| firebase | SI | AuthContext.tsx |
| axios | NO VERIFICADO | No importado en src/ |
| framer-motion | NO | No importado en src/ |
| motion | NO | No importado en src/ |
| react-hook-form | NO | No importado en src/ |
| zod | NO | No importado en src/ |
| zustand | NO | No importado en src/ |
| class-variance-authority | NO | No importado en src/ |
| clsx | NO | No importado en src/ |
| tailwind-merge | NO | No importado en src/ |
| next-themes | NO | No importado en src/ |
| react-icons | NO | No importado en src/ |

---

## 5. RESUMEN

| Categoría | Cantidad |
|-----------|----------|
| Bundle principal | ~40 archivos |
| Chunks lazy | 8 archivos |
| No participan | ~145 archivos |
| Total | ~273 archivos |

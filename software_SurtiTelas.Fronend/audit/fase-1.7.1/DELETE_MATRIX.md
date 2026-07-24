# DELETE_MATRIX.md

## MATRIZ DE ELIMINACIÓN — SURTITELAS

**Metodología:** Clasificación basada en evidencia forense verificable.
**Restricción:** Solo clasificación. No se eliminan archivos.

---

## 1. SEGURA (Confianza 95-100%)

| Archivo | Evidencia | Importadores | Ruta desde main.tsx | Justificación |
|---------|-----------|---------------|---------------------|---------------|
| src/app/components/admin/InventarioModule.tsx | Duplicado de features/admin/InventarioModule.tsx | 0 | No reachable | App.tsx lazy import apunta a features/admin/InventarioModule.tsx |
| src/app/components/admin/VentasModule.tsx | Duplicado | 0 | No reachable | features/admin/VentasModule.tsx es el importado por AdminDashboard |
| src/app/components/admin/ClientesModule.tsx | Duplicado | 0 | No reachable | features/admin/ClientesModule.tsx es el importado |
| src/app/components/admin/DomiciliosModule.tsx | Duplicado | 0 | No reachable | features/admin/DomiciliosModule.tsx es el importado |
| src/app/components/admin/HistorialPagosModule.tsx | Duplicado | 0 | No reachable | features/admin/HistorialPagosModule.tsx es el importado |
| src/app/components/admin/InsumosModule.tsx | Duplicado | 0 | No reachable | features/admin/InsumosModule.tsx es el importado |
| src/app/components/admin/ProduccionModule.tsx | Duplicado | 0 | No reachable | features/admin/ProduccionModule.tsx es el importado |
| src/app/components/admin/DevolucionesModule.tsx | Duplicado | 0 | No reachable | features/admin/DevolucionesModule.tsx es el importado |
| src/app/components/admin/ConfiguracionModule.tsx | Duplicado | 0 | No reachable | features/admin/ConfiguracionModule.tsx es el importado |
| src/app/components/admin/ReportesModule.tsx | Duplicado | 0 | No reachable | features/admin/ReportesModule.tsx es el importado |
| src/app/components/admin/SimpleLoginPage.tsx | Duplicado | 0 | No reachable | No hay ruta que lo use |
| src/app/components/admin/NotificationsDropdown.tsx | Duplicado | 0 | No reachable | features/admin/NotificationsDropdown.tsx es el importado |
| src/app/components/admin/UsuariosModule.tsx | Duplicado | 0 | No reachable | features/admin/UsuariosModule.tsx es el importado |
| src/app/components/common/AdvisorPanelSidebar.tsx | Duplicado zombie | 0 | No reachable | No importado por nadie |
| src/app/components/common/ClientDashboardNew.tsx | Duplicado zombie | 0 | No reachable | No importado por nadie |
| src/app/components/common/ClientDashboard.tsx | Duplicado zombie | 0 | No reachable | No importado por nadie |
| src/app/components/common/UserDashboard.tsx | Duplicado zombie | 0 | No reachable | No importado por nadie |
| src/app/components/common/ProfilePage.tsx | Duplicado zombie | 0 | No reachable | No importado por nadie |
| src/app/components/common/ClientManagement.tsx | Duplicado zombie | 0 | No reachable | No importado por nadie |
| src/app/components/common/CatalogPage.tsx | Duplicado | 0 | No reachable | features/common/CatalogPage.tsx es el importado |
| src/app/components/common/CartPage.tsx | Duplicado | 0 | No reachable | features/common/CartPage.tsx es el importado |
| src/app/components/common/HomePage.tsx | Duplicado | 0 | No reachable | presentation/pages/public/HomePage.tsx es el importado |
| src/app/components/common/ProductsPage.tsx | Zombie | 0 | No reachable | No importado |
| src/app/components/common/ProductsPageNew.tsx | Zombie | 0 | No reachable | No importado |
| src/app/components/common/ShoppingCart.tsx | Zombie | 0 | No reachable | No importado |
| src/app/components/common/NavigationBar.tsx | Zombie | 0 | No reachable | No importado |
| src/app/components/common/Footer.tsx | Zombie | 0 | No reachable | No importado |
| src/app/components/domiciliario/EntregasModule.tsx | Duplicado | 0 | No reachable | features/domiciliario/EntregasModule.tsx es el importado |
| src/app/components/domiciliario/RutasModule.tsx | Duplicado | 0 | No reachable | features/domiciliario/RutasModule.tsx es el importado |
| src/app/components/asesor/MisClientesModule.tsx | Duplicado | 0 | No reachable | features/asesor/MisClientesModule.tsx es el importado |
| src/app/components/asesor/ComisionesModule.tsx | Duplicado | 0 | No reachable | features/asesor/ComisionesModule.tsx es el importado |
| src/app/features/admin/AdminDashboard.tsx | Duplicado | 0 | No reachable | components/AdminDashboard.tsx es el importado |
| src/app/features/common/AdvisorPanelSidebar.tsx | Zombie | 0 | No reachable | No importado |
| src/app/features/common/ClientDashboardNew.tsx | Zombie | 0 | No reachable | No importado |
| src/app/features/common/UserDashboard.tsx | Zombie | 0 | No reachable | No importado |
| src/app/features/common/ProfilePage.tsx | Zombie | 0 | No reachable | No importado |
| src/app/features/common/ClientManagement.tsx | Zombie | 0 | No reachable | No importado |
| src/app/features/common/ProductsPage.tsx | Zombie | 0 | No reachable | No importado |
| src/app/features/common/ProductsPageNew.tsx | Zombie | 0 | No reachable | No importado |
| src/app/features/common/ShoppingCart.tsx | Zombie | 0 | No reachable | No importado |
| src/app/features/common/NavigationBar.tsx | Zombie | 0 | No reachable | No importado |
| src/app/features/common/Footer.tsx | Zombie | 0 | No reachable | No importado |
| src/app/features/common/HomePage.tsx | Zombie | 0 | No reachable | No importado |
| src/app/features/shared/AdvisorPanelSidebar.tsx | Zombie | 0 | No reachable | No importado |
| src/app/App.tsx | App paralela | 0 | No reachable | main.tsx importa presentation/pages/App.tsx |
| src/app/pages/SurtitelasLanding.tsx | Landing duplicado | 0 | No reachable | No importado |
| src/app/MODO_EXPORTACION.tsx | Script | 0 | No reachable | No importado |
| src/app/contexts/ThemeContext.tsx | Duplicado | 0 | No reachable | presentation/contexts/ThemeContext.tsx es el vivo |
| src/app/shared/ui/index.ts | Barrel zombie | 0 | No reachable | No importado |
| src/app/shared/types/index.ts | Barrel zombie | 0 | No reachable | No importado |
| src/app/shared/types/dashboard.ts | Tipo zombie | 0 | No reachable | No importado |
| src/app/types/dashboard.ts | Tipo zombie | 0 | No reachable | No importado |
| src/app/utils/recharts-fix.ts | Utilidad zombie | 0 | No reachable | No importado |
| src/domain/entities/Tela.ts | Clean Architecture | 1 (TelaRepository) | No reachable | No importado por UI |
| src/domain/repositories/ITelaRepository.ts | Clean Architecture | 1 (TelaRepository) | No reachable | No importado por UI |
| src/domain/useCases/GetTelasUseCase.ts | Clean Architecture | 0 | No reachable | No importado |
| src/application/services/TelaService.ts | Clean Architecture | 0 | No reachable | No importado |
| src/infrastructure/repositories/TelaRepository.ts | Clean Architecture | 1 (Tela.ts) | No reachable | No importado por UI |
| src/infrastructure/http/apiClient.ts | Clean Architecture | 0 | No reachable | No importado |
| src/infrastructure/config/firebase.ts | Clean Architecture | 0 | No reachable | No importado |
| src/config/firebase.ts | Firebase config | 0 | No reachable | No importado |
| src/hooks/usePagination.ts | Hook zombie | 0 | No reachable | No importado |
| src/types/auth.types.ts | Tipo zombie | 0 | No reachable | No importado |
| src/types/theme.css | CSS zombie | 0 | No reachable | No importado |
| src/types/dashboard.ts | Tipo zombie | 0 | No reachable | No importado |
| src/shared/auth.types.ts | Tipo zombie | 0 | No reachable | No importado |
| src/components/layout/DashboardLayout.tsx | Layout zombie | 0 | No reachable | No importado |
| src/components/layout/Sidebar.tsx | Layout zombie | 0 | No reachable | No importado |
| src/components/layout/Header.tsx | Layout zombie | 0 | No reachable | No importado |
| src/presentation/hooks/useTelas.ts | Hook zombie | 0 | No reachable | No importado |
| src/presentation/components/CheckoutModal.tsx | Componente zombie | 0 | No reachable | No importado |
| src/presentation/components/TelaList.tsx | Componente zombie | 0 | No reachable | No importado |

---

## 2. RIESGO BAJO (Confianza 80-94%)

| Archivo | Evidencia | Justificación |
|---------|-----------|---------------|
| src/app/features/admin/index.ts | Barrel export no consumido | Podría ser usado por tooling externo |
| src/app/features/asesor/index.ts | Barrel export no consumido | Podría ser usado por tooling externo |
| src/app/features/domiciliario/index.ts | Barrel export no consumido | Podría ser usado por tooling externo |
| src/app/features/cliente/index.ts | Barrel export no consumido | Podría ser usado por tooling externo |

---

## 3. RIESGO MEDIO (Confianza 50-79%)

| Archivo | Evidencia | Justificación |
|---------|-----------|---------------|
| src/app/components/FigmaExportView.tsx | No importado por entrypoint | Podría ser desarrollo activo no conectado |
| src/app/features/common/FigmaExportView.tsx | No importado por entrypoint | Duplicado del anterior |

---

## 4. PROHIBIDO ELIMINAR

| Archivo | Evidencia | Ruta desde main.tsx |
|---------|-----------|---------------------|
| src/main.tsx | Entrypoint | — |
| src/presentation/pages/App.tsx | App principal | main.tsx:4 |
| src/app/components/AdminDashboard.tsx | Dashboard fuente de verdad | App.tsx:33 |
| src/app/features/admin/*Module.tsx | Módulos lazy-load | AdminDashboard.tsx o App.tsx |
| src/app/features/common/CatalogPage.tsx | Ruta /catalogo | App.tsx:23 |
| src/app/features/common/CartPage.tsx | Ruta /carrito | App.tsx:24 |
| src/app/features/common/ContactPage.tsx | Ruta /contacto | App.tsx:25 |
| src/app/features/cliente/* | Importados por AdminDashboard | AdminDashboard.tsx:83-88 |
| src/app/features/asesor/* | Importados por AdminDashboard | AdminDashboard.tsx:79-80 |
| src/app/features/domiciliario/* | Importados por AdminDashboard | AdminDashboard.tsx:81-82 |
| src/presentation/pages/public/HomePage.tsx | Ruta / | App.tsx:22 |
| src/presentation/pages/auth/LoginPage.tsx | Ruta /login | App.tsx:29 |
| src/presentation/pages/auth/RegisterPage.tsx | Ruta /registro | App.tsx:30 |
| src/presentation/contexts/* | Providers activos | App.tsx:9-12 |
| src/shared/ui/* | Componentes base | App.tsx:18, CartContext.tsx |
| src/app/config/menuConfig.ts | Usado por AdminDashboard | AdminDashboard.tsx:89 |
| src/app/components/ErrorBoundary.tsx | Usado por App.tsx | App.tsx:19 |

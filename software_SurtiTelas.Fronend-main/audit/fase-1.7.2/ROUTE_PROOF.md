# ROUTE_PROOF.md

## PRUEBA FORENSE DE RUTAS

**Fuente:** src/presentation/pages/App.tsx
**Metodología:** Extracción literal de rutas React Router con verificación de alcanzabilidad.

---

## RUTAS ACTIVAS (con componente asignado)

| Ruta | Componente | Archivo | Lazy | Protección | Alcanzable |
|------|-----------|---------|------|------------|-----------|
| / | HomePage | src/presentation/pages/public/HomePage.tsx | No | No | SI |
| /catalogo | CatalogPage | src/presentation/pages/features/CatalogPage.tsx | No | No | SI |
| /carrito | CartPage | src/presentation/pages/features/CartPage.tsx | No | No | SI |
| /contacto | ContactPage | src/presentation/pages/features/ContactPage.tsx | No | No | SI |
| /nosotros | AboutPage | src/presentation/pages/public/AboutPage.tsx | No | No | SI |
| /login | LoginPage | src/presentation/pages/auth/LoginPage.tsx | No | No | SI |
| /registro | RegisterPage | src/presentation/pages/auth/RegisterPage.tsx | No | No | SI |
| /unauthorized | Div estático | — | No | No | SI |
| /admin/dashboard | AdminDashboard | src/app/components/AdminDashboard.tsx | Sí | RoleRoute | SI |
| /admin/users | UsersPage | src/app/features/admin/UsuariosModule.tsx | Sí | RoleRoute | SI |
| /admin/inventario | InventoryPage | src/app/features/admin/InventarioModule.tsx | Sí | RoleRoute | SI |
| /admin/pedidos | OrdersPage | src/app/features/admin/HistorialPagosModule.tsx | Sí | RoleRoute | SI |
| /admin/clientes | CustomersPage | src/app/features/admin/ClientesModule.tsx | Sí | RoleRoute | SI |
| /admin/domiciliarios | DeliveryPage | src/app/features/admin/DomiciliosModule.tsx | Sí | RoleRoute | SI |
| /admin/analytics | AnalyticsPage | src/app/features/admin/ReportesModule.tsx | Sí | RoleRoute | SI |
| /admin/configuracion | SettingsPage | src/app/features/admin/ConfiguracionModule.tsx | Sí | RoleRoute | SI |
| /asesor/dashboard | AdminDashboard | src/app/components/AdminDashboard.tsx | No | RoleRoute | SI |
| /domiciliario/dashboard | AdminDashboard | src/app/components/AdminDashboard.tsx | No | RoleRoute | SI |
| /cliente/dashboard | AdminDashboard | src/app/components/AdminDashboard.tsx | No | RoleRoute | SI |
| * | Navigate to="/" | — | No | No | SI |

**Total rutas activas:** 19

---

## RUTAS HUÉRFANAS (sin ruta definida)

| Archivo | Razón |
|---------|-------|
| src/app/features/admin/AdminDashboard.tsx | Duplicado, no tiene ruta |
| src/app/components/admin/InventarioModule.tsx | Duplicado, no tiene ruta |
| src/app/features/common/CatalogPage.tsx | No tiene ruta (la ruta /catalogo apunta a presentation/pages/features/CatalogPage.tsx) |
| src/app/features/common/CartPage.tsx | No tiene ruta (la ruta /carrito apunta a presentation/pages/features/CartPage.tsx) |
| src/app/features/common/ContactPage.tsx | No tiene ruta (la ruta /contacto apunta a presentation/pages/features/ContactPage.tsx) |
| src/app/features/common/ClientDashboardNew.tsx | No tiene ruta |
| src/app/features/common/UserDashboard.tsx | No tiene ruta |
| src/app/features/common/AdvisorPanelSidebar.tsx | No tiene ruta |
| src/app/components/ClientDashboardNew.tsx | No tiene ruta |
| src/app/components/UserDashboard.tsx | No tiene ruta |
| src/app/components/AdvisorPanelSidebar.tsx | No tiene ruta |

---

## VERIFICACIÓN DE ALCANZABILIDAD POR RUTA

### Rutas públicas (sin autenticación)

| Ruta | Alcanzable | Evidencia |
|------|-----------|-----------|
| / | SI | App.tsx:73 `<Route path="/" element={<PublicLayout><HomePage /></PublicLayout>} />` |
| /catalogo | SI | App.tsx:74 `<Route path="/catalogo" element={<PublicLayout><CatalogPage /></PublicLayout>} />` |
| /carrito | SI | App.tsx:75 `<Route path="/carrito" element={<PublicLayout><CartPage /></PublicLayout>} />` |
| /contacto | SI | App.tsx:76 `<Route path="/contacto" element={<PublicLayout><ContactPage /></PublicLayout>} />` |
| /nosotros | SI | App.tsx:77 `<Route path="/nosotros" element={<PublicLayout><AboutPage /></PublicLayout>} />` |
| /login | SI | App.tsx:80 `<Route path="/login" element={<LoginPage />} />` |
| /registro | SI | App.tsx:81 `<Route path="/registro" element={<RegisterPage />} />` |
| /unauthorized | SI | App.tsx:82-89 definido |

### Rutas protegidas (con autenticación)

| Ruta | Alcanzable | Evidencia |
|------|-----------|-----------|
| /admin/dashboard | SI | App.tsx:92 `<RoleRoute roles={["admin", "asesor", "domiciliario", "cliente"]}><AdminDashboard /></RoleRoute>` |
| /admin/users | SI | App.tsx:93 `<RoleRoute roles={["admin"]}><UsersPage /></RoleRoute>` |
| /admin/inventario | SI | App.tsx:94 `<RoleRoute roles={["admin", "asesor"]}><InventoryPage /></RoleRoute>` |
| /admin/pedidos | SI | App.tsx:95 `<RoleRoute roles={["admin", "asesor"]}><OrdersPage /></RoleRoute>` |
| /admin/clientes | SI | App.tsx:96 `<RoleRoute roles={["admin", "asesor"]}><CustomersPage /></RoleRoute>` |
| /admin/domiciliarios | SI | App.tsx:97 `<RoleRoute roles={["admin"]}><DeliveryPage /></RoleRoute>` |
| /admin/analytics | SI | App.tsx:98 `<RoleRoute roles={["admin"]}><AnalyticsPage /></RoleRoute>` |
| /admin/configuracion | SI | App.tsx:99 `<RoleRoute roles={["admin"]}><SettingsPage /></RoleRoute>` |
| /asesor/dashboard | SI | App.tsx:102 `<RoleRoute roles={["asesor"]}><AdminDashboard /></RoleRoute>` |
| /domiciliario/dashboard | SI | App.tsx:105 `<RoleRoute roles={["domiciliario"]}><AdminDashboard /></RoleRoute>` |
| /cliente/dashboard | SI | App.tsx:108 `<RoleRoute roles={["cliente"]}><AdminDashboard /></RoleRoute>` |

### Catch-all

| Ruta | Alcanzable | Evidencia |
|------|-----------|-----------|
| * | SI | App.tsx:111 `<Route path="*" element={<Navigate to="/" replace />} />` |

---

## RESUMEN

| Categoría | Cantidad |
|-----------|----------|
| Rutas activas | 19 |
| Rutas huérfanas | 11 |
| Total | 30 |

**Conclusión:** Todas las rutas activas son alcanzables desde main.tsx. Las rutas huérfanas corresponden a archivos duplicados o zombies sin importación.

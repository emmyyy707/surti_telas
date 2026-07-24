# IMPORT_GRAPH.md

## GRAFO COMPLETO DE IMPORTS — SURTITELAS

**Origen:** src/main.tsx
**Metodología:** Análisis estático de imports estáticos, dinámicos, barrel exports y reexports.
**Alias:** @ → src/*, @shared/ui → src/shared/ui/*

---

## GRAFO PRINCIPAL

```
src/main.tsx
 └── src/presentation/pages/App.tsx  [IMPORT DIRECTO: línea 4]
      ├── src/presentation/contexts/AuthContext.tsx  [IMPORT DIRECTO: línea 9]
      │    └── firebase/auth (externo)  [IMPORT DIRECTO: línea 13]
      ├── src/presentation/contexts/CartContext.tsx  [IMPORT DIRECTO: línea 10]
      │    └── src/shared/ui/index.ts  [IMPORT DIRECTO: línea 3]
      │         ├── src/shared/ui/Alert.tsx
      │         ├── src/shared/ui/Avatar.tsx
      │         ├── src/shared/ui/Badge.tsx
      │         ├── src/shared/ui/Button.tsx
      │         ├── src/shared/ui/Card.tsx
      │         ├── src/shared/ui/Drawer.tsx
      │         ├── src/shared/ui/DropdownMenu.tsx
      │         ├── src/shared/ui/EmptyState.tsx
      │         ├── src/shared/ui/Input.tsx
      │         ├── src/shared/ui/Modal.tsx
      │         ├── src/shared/ui/Pagination.tsx
      │         ├── src/shared/ui/Select.tsx
      │         ├── src/shared/ui/Skeleton.tsx
      │         ├── src/shared/ui/Spinner.tsx
      │         ├── src/shared/ui/StatsCard.tsx
      │         └── src/shared/ui/Table.tsx
      ├── src/presentation/contexts/CartDrawerContext.tsx  [IMPORT DIRECTO: línea 11]
      ├── src/presentation/contexts/ThemeContext.tsx  [IMPORT DIRECTO: línea 12]
      ├── src/presentation/routes/ProtectedRoute.tsx  [IMPORT DIRECTO: línea 13]
      │    └── src/presentation/contexts/AuthContext.tsx  [IMPORT DIRECTO: línea 5]
      ├── src/presentation/pages/components/Navbar.tsx  [IMPORT DIRECTO: línea 14]
      │    └── src/presentation/contexts/CartContext.tsx  [IMPORT DIRECTO: línea 3]
      ├── src/presentation/pages/components/footer.tsx  [IMPORT DIRECTO: línea 15]
      ├── src/presentation/components/ScrollToTop.tsx  [IMPORT DIRECTO: línea 16]
      ├── src/presentation/components/CartDrawer.tsx  [IMPORT DIRECTO: línea 17]
      │    ├── src/presentation/components/CartItem.tsx  [IMPORT DIRECTO: línea 1]
      │    ├── src/presentation/components/CartSummary.tsx  [IMPORT DIRECTO: línea 1]
      │    └── src/presentation/contexts/CartContext.tsx  [IMPORT DIRECTO: línea 2]
      ├── src/shared/ui/Spinner.tsx  [IMPORT DIRECTO: línea 18]
      │    └── src/shared/ui/index.ts  [IMPORT DIRECTO: línea 14]
      └── src/app/components/ErrorBoundary.tsx  [IMPORT DIRECTO: línea 19]

      ├── src/presentation/pages/public/HomePage.tsx  [IMPORT DIRECTO: línea 22]
      │    ├── src/presentation/components/ProductModal.tsx  [IMPORT DIRECTO: línea 8]
      │    │    └── src/presentation/components/common/ImageWithFallback.tsx  [IMPORT DIRECTO: línea 1]
      │    └── src/presentation/contexts/CartContext.tsx  [IMPORT DIRECTO: línea 5]
      │
      ├── src/app/features/common/CatalogPage.tsx  [IMPORT DIRECTO: línea 23]
      │    ├── src/presentation/components/CartItem.tsx  [IMPORT DIRECTO: línea 1]
      │    ├── src/presentation/components/ProductDetailModal.tsx  [IMPORT DIRECTO: línea 1]
      │    │    └── src/presentation/components/common/ImageWithFallback.tsx  [IMPORT DIRECTO: línea 1]
      │    └── src/presentation/contexts/CartContext.tsx  [IMPORT DIRECTO: línea 3]
      │
      ├── src/app/features/common/CartPage.tsx  [IMPORT DIRECTO: línea 24]
      │    └── src/presentation/contexts/CartContext.tsx  [IMPORT DIRECTO: línea 3]
      │
      ├── src/app/features/common/ContactPage.tsx  [IMPORT DIRECTO: línea 25]
      │
      ├── src/presentation/pages/public/AboutPage.tsx  [IMPORT DIRECTO: línea 26]
      │
      ├── src/presentation/pages/auth/LoginPage.tsx  [IMPORT DIRECTO: línea 29]
      │    └── src/presentation/contexts/AuthContext.tsx  [IMPORT DIRECTO: línea 5]
      │
      ├── src/presentation/pages/auth/RegisterPage.tsx  [IMPORT DIRECTO: línea 30]
      │    └── src/presentation/contexts/AuthContext.tsx  [IMPORT DIRECTO: línea 6]
      │
      ├── [LAZY] src/app/components/AdminDashboard.tsx  [IMPORT DINÁMICO: línea 33]
      │    ├── src/app/components/ui/card.tsx  [IMPORT DIRECTO: línea 50]
      │    ├── src/app/components/ui/button.tsx  [IMPORT DIRECTO: línea 51]
      │    ├── src/app/components/ui/badge.tsx  [IMPORT DIRECTO: línea 52]
      │    ├── src/app/components/ui/input.tsx  [IMPORT DIRECTO: línea 53]
      │    ├── src/app/components/ui/label.tsx  [IMPORT DIRECTO: línea 54]
      │    ├── src/app/components/ui/select.tsx  [IMPORT DIRECTO: línea 55]
      │    ├── src/app/components/ui/dialog.tsx  [IMPORT DIRECTO: línea 56]
      │    ├── src/app/components/ui/textarea.tsx  [IMPORT DIRECTO: línea 57]
      │    ├── src/app/components/ui/scroll-area.tsx  [IMPORT DIRECTO: línea 58]
      │    ├── src/app/components/ui/table.tsx  [IMPORT DIRECTO: línea 59]
      │    ├── src/app/components/ui/tabs.tsx  [IMPORT DIRECTO: línea 60]
      │    ├── src/app/features/admin/DashboardGeneral.tsx  [IMPORT DIRECTO: línea 66]
      │    ├── src/app/features/admin/ConfiguracionModule.tsx  [IMPORT DIRECTO: línea 67]
      │    ├── src/app/features/admin/UsuariosModule.tsx  [IMPORT DIRECTO: línea 68]
      │    ├── src/app/features/admin/InventarioModule.tsx  [IMPORT DIRECTO: línea 69]
      │    ├── src/app/features/admin/ProduccionModule.tsx  [IMPORT DIRECTO: línea 70]
      │    ├── src/app/features/admin/VentasModule.tsx  [IMPORT DIRECTO: línea 71]
      │    ├── src/app/features/admin/DevolucionesModule.tsx  [IMPORT DIRECTO: línea 72]
      │    ├── src/app/features/admin/ReportesModule.tsx  [IMPORT DIRECTO: línea 73]
      │    ├── src/app/features/admin/HistorialPagosModule.tsx  [IMPORT DIRECTO: línea 74]
      │    ├── src/app/features/admin/InsumosModule.tsx  [IMPORT DIRECTO: línea 75]
      │    ├── src/app/features/admin/ClientesModule.tsx  [IMPORT DIRECTO: línea 76]
      │    ├── src/app/features/admin/DomiciliosModule.tsx  [IMPORT DIRECTO: línea 77]
      │    ├── src/app/features/admin/NotificationsDropdown.tsx  [IMPORT DIRECTO: línea 78]
      │    ├── src/app/features/asesor/MisClientesModule.tsx  [IMPORT DIRECTO: línea 79]
      │    ├── src/app/features/asesor/ComisionesModule.tsx  [IMPORT DIRECTO: línea 80]
      │    ├── src/app/features/domiciliario/EntregasModule.tsx  [IMPORT DIRECTO: línea 81]
      │    ├── src/app/features/domiciliario/RutasModule.tsx  [IMPORT DIRECTO: línea 82]
      │    ├── src/app/features/cliente/ResumenCliente.tsx  [IMPORT DIRECTO: línea 83]
      │    ├── src/app/features/cliente/MisPedidosCliente.tsx  [IMPORT DIRECTO: línea 84]
      │    ├── src/app/features/cliente/DireccionesCliente.tsx  [IMPORT DIRECTO: línea 85]
      │    ├── src/app/features/cliente/MetodosPagoCliente.tsx  [IMPORT DIRECTO: línea 86]
      │    ├── src/app/features/cliente/MiPerfilCliente.tsx  [IMPORT DIRECTO: línea 87]
      │    ├── src/app/features/cliente/CatalogoCliente.tsx  [IMPORT DIRECTO: línea 88]
      │    ├── src/app/config/menuConfig.ts  [IMPORT DIRECTO: línea 89]
      │    └── src/presentation/contexts/ThemeContext.tsx  [IMPORT DIRECTO: línea 90]
      │
      ├── [LAZY] src/app/features/admin/UsuariosModule.tsx  [IMPORT DINÁMICO: línea 34]
      ├── [LAZY] src/app/features/admin/InventarioModule.tsx  [IMPORT DINÁMICO: línea 35]
      ├── [LAZY] src/app/features/admin/HistorialPagosModule.tsx  [IMPORT DINÁMICO: línea 36]
      ├── [LAZY] src/app/features/admin/ClientesModule.tsx  [IMPORT DINÁMICO: línea 37]
      ├── [LAZY] src/app/features/admin/DomiciliosModule.tsx  [IMPORT DINÁMICO: línea 38]
      ├── [LAZY] src/app/features/admin/ReportesModule.tsx  [IMPORT DINÁMICO: línea 39]
      └── [LAZY] src/app/features/admin/ConfiguracionModule.tsx  [IMPORT DINÁMICO: línea 40]
```

---

## NOTAS

1. `src/app/App.tsx` NO está en el grafo. No es importado por main.tsx.
2. `src/domain/`, `src/application/`, `src/infrastructure/` NO están en el grafo.
3. `src/components/` NO está en el grafo.
4. `src/hooks/` NO está en el grafo.
5. `src/types/` NO está en el grafo.
6. Barrel exports de features NO están en el grafo.
7. No se detectaron imports dinámicos fuera de App.tsx.
8. No se detectaron factories, sistemas de plugin ni rutas dinámicas adicionales.

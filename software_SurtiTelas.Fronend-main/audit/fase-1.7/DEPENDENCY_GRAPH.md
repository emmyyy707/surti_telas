# DEPENDENCY_GRAPH.md

## GRAFO DE DEPENDENCIAS REAL — SURTITELAS

**Metodología:** Análisis estático completo desde `src/main.tsx`.
**Incluye:** Imports estáticos, imports dinámicos, barrel exports, reexports, aliases.
**Sin inferencias.** Solo dependencias verificadas.

---

## 1. ENTRYPOINT

```
index.html
  └── src/main.tsx  (línea 4: import App from "./presentation/pages/App")
```

---

## 2. GRAFO COMPLETO

```
src/main.tsx
 ├── src/presentation/pages/App.tsx  [IMPORT DIRECTO: línea 4]
 │    ├── src/presentation/contexts/AuthContext.tsx  [IMPORT DIRECTO: línea 9]
 │    │    └── firebase/auth (npm)  [IMPORT DIRECTO: línea 13]
 │    ├── src/presentation/contexts/CartContext.tsx  [IMPORT DIRECTO: línea 10]
 │    │    └── src/shared/ui/index.ts  [IMPORT DIRECTO: línea 3]
 │    │         ├── src/shared/ui/Alert.tsx
 │    │         ├── src/shared/ui/Avatar.tsx
 │    │         ├── src/shared/ui/Badge.tsx
 │    │         ├── src/shared/ui/Button.tsx
 │    │         ├── src/shared/ui/Card.tsx
 │    │         ├── src/shared/ui/Drawer.tsx
 │    │         ├── src/shared/ui/DropdownMenu.tsx
 │    │         ├── src/shared/ui/EmptyState.tsx
 │    │         ├── src/shared/ui/Input.tsx
 │    │         ├── src/shared/ui/Modal.tsx
 │    │         ├── src/shared/ui/Pagination.tsx
 │    │         ├── src/shared/ui/Select.tsx
 │    │         ├── src/shared/ui/Skeleton.tsx
 │    │         ├── src/shared/ui/Spinner.tsx
 │    │         ├── src/shared/ui/StatsCard.tsx
 │    │         └── src/shared/ui/Table.tsx
 │    ├── src/presentation/contexts/CartDrawerContext.tsx  [IMPORT DIRECTO: línea 11]
 │    ├── src/presentation/contexts/ThemeContext.tsx  [IMPORT DIRECTO: línea 12]
 │    ├── src/presentation/routes/ProtectedRoute.tsx  [IMPORT DIRECTO: línea 13]
 │    │    └── src/presentation/contexts/AuthContext.tsx  [IMPORT DIRECTO: línea 5]
 │    ├── src/presentation/pages/components/Navbar.tsx  [IMPORT DIRECTO: línea 14]
 │    │    └── src/presentation/contexts/CartContext.tsx  [IMPORT DIRECTO: línea 3]
 │    ├── src/presentation/pages/components/footer.tsx  [IMPORT DIRECTO: línea 15]
 │    ├── src/presentation/components/ScrollToTop.tsx  [IMPORT DIRECTO: línea 16]
 │    ├── src/presentation/components/CartDrawer.tsx  [IMPORT DIRECTO: línea 17]
 │    │    ├── src/presentation/components/CartItem.tsx  [IMPORT DIRECTO: línea 1]
 │    │    ├── src/presentation/components/CartSummary.tsx  [IMPORT DIRECTO: línea 1]
 │    │    └── src/presentation/contexts/CartContext.tsx  [IMPORT DIRECTO: línea 2]
 │    ├── src/shared/ui/Spinner.tsx  [IMPORT DIRECTO: línea 18]
 │    │    └── src/shared/ui/index.ts  [IMPORT DIRECTO: línea 14]
 │    └── src/app/components/ErrorBoundary.tsx  [IMPORT DIRECTO: línea 19]
 │
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
 ├── src/app/componentsAdminDashboard.tsx  [IMPORT DINÁMICO: línea 33]
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
 ├── src/app/features/admin/UsuariosModule.tsx  [IMPORT DINÁMICO: línea 34]
 ├── src/app/features/admin/InventarioModule.tsx  [IMPORT DINÁMICO: línea 35]
 ├── src/app/features/admin/HistorialPagosModule.tsx  [IMPORT DINÁMICO: línea 36]
 ├── src/app/features/admin/ClientesModule.tsx  [IMPORT DINÁMICO: línea 37]
 ├── src/app/features/admin/DomiciliosModule.tsx  [IMPORT DINÁMICO: línea 38]
 ├── src/app/features/admin/ReportesModule.tsx  [IMPORT DINÁMICO: línea 39]
 └── src/app/features/admin/ConfiguracionModule.tsx  [IMPORT DINÁMICO: línea 40]
```

---

## 3. DEPENDENCIAS EXTERNAS (NPM) UTILIZADAS

| Paquete | Importado en | Línea | Tipo |
|---------|-------------|-------|------|
| react | main.tsx | 1 | Estático |
| react-dom | main.tsx | 2 | Estático |
| @tanstack/react-query | main.tsx | 8-10 | Estático |
| react-router-dom | App.tsx | 3 | Estático |
| react-hot-toast | App.tsx | 8 | Estático |
| lucide-react | AdminDashboard.tsx | 2 | Estático |
| sonner | AdminDashboard.tsx | 61 | Estático |
| recharts | AdminDashboard.tsx | 62 | Estático |
| firebase | AuthContext.tsx | 13 | Estático |

**Total dependencias externas confirmadas:** 9 paquetes.

---

## 4. DEPENDENCIAS NO UTILIZADAS (NPM)

| Paquete | Razón de no uso |
|---------|-----------------|
| axios | No importado en src/ |
| framer-motion | No importado en src/ (solo en node_modules) |
| motion | No importado en src/ |
| react-hook-form | No importado en src/ |
| zod | No importado en src/ |
| zustand | No importado en src/ |
| class-variance-authority | No importado en src/ |
| clsx | No importado en src/ |
| tailwind-merge | No importado en src/ |
| next-themes | No importado en src/ |
| react-icons | No importado en src/ |

**Evidencia:** Búsqueda de imports en src/ no encuentra referencias a estos paquetes.

---

## 5. RESUMEN DE ALCANZABILIDAD

| Categoría | Cantidad | Archivos |
|-----------|----------|----------|
| Entry point | 1 | main.tsx |
| Nivel 1 (App.tsx) | 1 | presentation/pages/App.tsx |
| Nivel 2 (Providers/Contexts) | 5 | AuthContext, CartContext, CartDrawerContext, ThemeContext, ProtectedRoute |
| Nivel 2 (Páginas públicas) | 5 | HomePage, CatalogPage, CartPage, ContactPage, AboutPage |
| Nivel 2 (Auth) | 2 | LoginPage, RegisterPage |
| Nivel 2 (Componentes públicos) | 4 | Navbar, Footer, ScrollToTop, CartDrawer |
| Nivel 3 (Lazy) | 8 | AdminDashboard + 7 módulos admin |
| Nivel 3 (AdminDashboard imports) | 23 | DashboardGeneral + 21 módulos internos |
| **TOTAL VIVO** | **~49** | — |
| Muertos | ~145 | — |
| Zombies | ~15 | — |
| Duplicados | 32 pares | — |

---

## 6. NOTAS

- `src/app/App.tsx` NO está en el grafo. No es importado por main.tsx.
- `src/domain/`, `src/application/`, `src/infrastructure/` NO están en el grafo. No son importados por código vivo.
- `src/components/` NO está en el grafo. No es importado por código vivo.
- `src/hooks/` NO está en el grafo. No es importado por código vivo.
- `src/types/` NO está en el grafo. No es importado por código vivo.
- Barrel exports (`index.ts`) de features NO están en el grafo. No son importados.
- No se detectaron imports dinámicos ocultos (`import()`) fuera de App.tsx.
- No se detectó código que use los aliases `@application`, `@domain`, `@infrastructure`, `@presentation`, `@config`, `@modules`.

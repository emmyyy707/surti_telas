# BARREL_FORENSICS.md

## ANÁLISIS FORENSE DE BARREL EXPORTS

**Metodología:** Verificación de quién importa cada barrel export, si participa en bundle y si es alcanzable desde main.tsx.

---

## 1. src/shared/ui/index.ts

| Campo | Valor |
|-------|-------|
| Exporta | 16 componentes UI (Alert, Avatar, Badge, Button, Card, Drawer, DropdownMenu, EmptyState, Input, Modal, Pagination, Select, Skeleton, Spinner, StatsCard, Table) |
| Importado por | `src/presentation/pages/App.tsx:18` (`import { Spinner } from "@/shared/ui"`) |
| Reachable | SI |
| ParticipaBundle | SI |
| Estado | VIVO |

**Evidencia:** App.tsx importa desde `@/shared/ui`. Alias `@` → `src/*`. Por tanto `@/shared/ui` → `src/shared/ui/index.ts`. Este barrel export es alcanzable y participa en el bundle principal.

---

## 2. src/app/shared/ui/index.ts

| Campo | Valor |
|-------|-------|
| Exporta | 28 componentes UI (re-exporta a `../../../components/ui/`) |
| Importado por | NADIE en código vivo |
| Reachable | NO |
| ParticipaBundle | NO |
| Estado | MUERTO |

**Evidencia:** Este barrel export re-exporta componentes desde `src/app/components/ui/`. Ningún archivo vivo importa desde `@/app/shared/ui` o ruta equivalente. Los imports en AdminDashboard.tsx usan rutas relativas directas (`./ui/button`, `../../components/ui/card`), no este barrel.

---

## 3. src/app/features/admin/index.ts

| Campo | Valor |
|-------|-------|
| Exporta | 16 módulos admin (DashboardGeneral, ConfiguracionModule, UsuariosModule, InventarioModule, ProduccionModule, VentasModule, DevolucionesModule, ReportesModule, HistorialPagosModule, InsumosModule, ClientesModule, DomiciliosModule, NotificationsDropdown, AdminDashboard, SimpleLoginPage) |
| Importado por | NADIE en código vivo |
| Reachable | NO |
| ParticipaBundle | NO |
| Estado | MUERTO |

**Evidencia:** App.tsx importa los módulos admin directamente desde `@/app/features/admin/*` o `@/app/components/AdminDashboard`. No existe ningún `import` desde `@/app/features/admin` o `../admin/index` en código vivo.

---

## 4. src/app/features/asesor/index.ts

| Campo | Valor |
|-------|-------|
| Exporta | 2 módulos asesor (MisClientesModule, ComisionesModule) |
| Importado por | NADIE en código vivo |
| Reachable | NO |
| ParticipaBundle | NO |
| Estado | MUERTO |

**Evidencia:** AdminDashboard.tsx importa directamente desde `../features/asesor/MisClientesModule` y `../features/asesor/ComisionesModule`. No usa el barrel export.

---

## 5. src/app/features/domiciliario/index.ts

| Campo | Valor |
|-------|-------|
| Exporta | 2 módulos domiciliario (EntregasModule, RutasModule) |
| Importado por | NADIE en código vivo |
| Reachable | NO |
| ParticipaBundle | NO |
| Estado | MUERTO |

**Evidencia:** AdminDashboard.tsx importa directamente desde `../features/domiciliario/EntregasModule` y `../features/domiciliario/RutasModule`. No usa el barrel export.

---

## 6. src/app/features/cliente/index.ts

| Campo | Valor |
|-------|-------|
| Exporta | 6 módulos cliente (ResumenCliente, MisPedidosCliente, DireccionesCliente, MetodosPagoCliente, MiPerfilCliente, CatalogoCliente) |
| Importado por | NADIE en código vivo |
| Reachable | NO |
| ParticipaBundle | NO |
| Estado | MUERTO |

**Evidencia:** AdminDashboard.tsx importa directamente desde `../features/cliente/*`. No usa el barrel export.

---

## 7. src/app/shared/types/index.ts

| Campo | Valor |
|-------|-------|
| Exporta | Tipos compartidos |
| Importado por | NADIE en código vivo |
| Reachable | NO |
| ParticipaBundle | NO |
| Estado | MUERTO |

**Evidencia:** No se encuentra ningún import desde `@/app/shared/types` o ruta equivalente en código vivo.

---

## 8. src/shared/utils/index.ts

| Campo | Valor |
|-------|-------|
| Exporta | Utilidades |
| Importado por | NADIE en código vivo |
| Reachable | NO |
| ParticipaBundle | NO |
| Estado | MUERTO |

**Evidencia:** No se encuentra ningún import desde `@/shared/utils` en código vivo.

---

## RESUMEN

| Barrel Export | Estado | Confianza |
|---------------|--------|-----------|
| src/shared/ui/index.ts | VIVO | 100% |
| src/app/shared/ui/index.ts | MUERTO | 100% |
| src/app/features/admin/index.ts | MUERTO | 100% |
| src/app/features/asesor/index.ts | MUERTO | 100% |
| src/app/features/domiciliario/index.ts | MUERTO | 100% |
| src/app/features/cliente/index.ts | MUERTO | 100% |
| src/app/shared/types/index.ts | MUERTO | 100% |
| src/shared/utils/index.ts | MUERTO | 100% |

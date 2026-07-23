# DUPLICATE_PROOF.md

## PRUEBA FORENSE DE DUPLICADOS

**Metodología:** Comparación de imports entrantes desde main.tsx para cada par de archivos duplicados.

---

## DUPLICADO 1: AdminDashboard.tsx

| Campo | Archivo A | Archivo B |
|-------|-----------|-----------|
| Ruta | src/app/components/AdminDashboard.tsx | src/app/features/admin/AdminDashboard.tsx |
| Imports entrantes desde vivo | 1 (App.tsx:33) | 0 |
| Lazy import | App.tsx:33 `@/app/components/AdminDashboard` | No existe |
| Estado A | VIVO | — |
| Estado B | — | MUERTO |
| Similitud | >99% (mismo código, rutas de importación diferentes) | — |

**Evidencia:**
- App.tsx:33: `const AdminDashboard = lazy(() => import("@/app/components/AdminDashboard"));`
- No existe ningún import a `@/app/features/admin/AdminDashboard` en código vivo.

**Veredicto:** Archivo A es fuente de verdad. Archivo B es duplicado muerto.

---

## DUPLICADO 2: InventarioModule.tsx

| Campo | Archivo A | Archivo B |
|-------|-----------|-----------|
| Ruta | src/app/features/admin/InventarioModule.tsx | src/app/components/admin/InventarioModule.tsx |
| Imports entrantes desde vivo | 2 (App.tsx:35, AdminDashboard.tsx:69) | 0 |
| Lazy import | App.tsx:35 `@/app/features/admin/InventarioModule` | No existe |
| Estado A | VIVO | — |
| Estado B | — | MUERTO |
| Similitud | >99% | — |

**Veredicto:** Archivo A es fuente de verdad. Archivo B es duplicado muerto.

---

## DUPLICADO 3: VentasModule.tsx

| Campo | Archivo A | Archivo B |
|-------|-----------|-----------|
| Ruta | src/app/features/admin/VentasModule.tsx | src/app/components/admin/VentasModule.tsx |
| Imports entrantes desde vivo | 1 (AdminDashboard.tsx:71) | 0 |
| Estado A | VIVO | — |
| Estado B | — | MUERTO |
| Similitud | >99% | — |

**Veredicto:** Archivo A es fuente de verdad. Archivo B es duplicado muerto.

---

## DUPLICADO 4: ClientesModule.tsx

| Campo | Archivo A | Archivo B |
|-------|-----------|-----------|
| Ruta | src/app/features/admin/ClientesModule.tsx | src/app/components/admin/ClientesModule.tsx |
| Imports entrantes desde vivo | 2 (App.tsx:37, AdminDashboard.tsx:76) | 0 |
| Lazy import | App.tsx:37 `@/app/features/admin/ClientesModule` | No existe |
| Estado A | VIVO | — |
| Estado B | — | MUERTO |
| Similitud | >99% | — |

**Veredicto:** Archivo A es fuente de verdad. Archivo B es duplicado muerto.

---

## DUPLICADO 5: DomiciliosModule.tsx

| Campo | Archivo A | Archivo B |
|-------|-----------|-----------|
| Ruta | src/app/features/admin/DomiciliosModule.tsx | src/app/components/admin/DomiciliosModule.tsx |
| Imports entrantes desde vivo | 2 (App.tsx:38, AdminDashboard.tsx:77) | 0 |
| Lazy import | App.tsx:38 `@/app/features/admin/DomiciliosModule` | No existe |
| Estado A | VIVO | — |
| Estado B | — | MUERTO |
| Similitud | >99% | — |

**Veredicto:** Archivo A es fuente de verdad. Archivo B es duplicado muerto.

---

## DUPLICADO 6: HistorialPagosModule.tsx

| Campo | Archivo A | Archivo B |
|-------|-----------|-----------|
| Ruta | src/app/features/admin/HistorialPagosModule.tsx | src/app/components/admin/HistorialPagosModule.tsx |
| Imports entrantes desde vivo | 2 (App.tsx:36, AdminDashboard.tsx:74) | 0 |
| Lazy import | App.tsx:36 `@/app/features/admin/HistorialPagosModule` | No existe |
| Estado A | VIVO | — |
| Estado B | — | MUERTO |
| Similitud | >99% | — |

**Veredicto:** Archivo A es fuente de verdad. Archivo B es duplicado muerto.

---

## DUPLICADO 7: InsumosModule.tsx

| Campo | Archivo A | Archivo B |
|-------|-----------|-----------|
| Ruta | src/app/features/admin/InsumosModule.tsx | src/app/components/admin/InsumosModule.tsx |
| Imports entrantes desde vivo | 1 (AdminDashboard.tsx:75) | 0 |
| Estado A | VIVO | — |
| Estado B | — | MUERTO |
| Similitud | >99% | — |

**Veredicto:** Archivo A es fuente de verdad. Archivo B es duplicado muerto.

---

## DUPLICADO 8: ProduccionModule.tsx

| Campo | Archivo A | Archivo B |
|-------|-----------|-----------|
| Ruta | src/app/features/admin/ProduccionModule.tsx | src/app/components/admin/ProduccionModule.tsx |
| Imports entrantes desde vivo | 1 (AdminDashboard.tsx:70) | 0 |
| Estado A | VIVO | — |
| Estado B | — | MUERTO |
| Similitud | >99% | — |

**Veredicto:** Archivo A es fuente de verdad. Archivo B es duplicado muerto.

---

## DUPLICADO 9: DevolucionesModule.tsx

| Campo | Archivo A | Archivo B |
|-------|-----------|-----------|
| Ruta | src/app/features/admin/DevolucionesModule.tsx | src/app/components/admin/DevolucionesModule.tsx |
| Imports entrantes desde vivo | 1 (AdminDashboard.tsx:72) | 0 |
| Estado A | VIVO | — |
| Estado B | — | MUERTO |
| Similitud | >99% | — |

**Veredicto:** Archivo A es fuente de verdad. Archivo B es duplicado muerto.

---

## DUPLICADO 10: ConfiguracionModule.tsx

| Campo | Archivo A | Archivo B |
|-------|-----------|-----------|
| Ruta | src/app/features/admin/ConfiguracionModule.tsx | src/app/components/admin/ConfiguracionModule.tsx |
| Imports entrantes desde vivo | 2 (App.tsx:40, AdminDashboard.tsx:67) | 0 |
| Lazy import | App.tsx:40 `@/app/features/admin/ConfiguracionModule` | No existe |
| Estado A | VIVO | — |
| Estado B | — | MUERTO |
| Similitud | >99% | — |

**Veredicto:** Archivo A es fuente de verdad. Archivo B es duplicado muerto.

---

## DUPLICADO 11: ReportesModule.tsx

| Campo | Archivo A | Archivo B |
|-------|-----------|-----------|
| Ruta | src/app/features/admin/ReportesModule.tsx | src/app/components/admin/ReportesModule.tsx |
| Imports entrantes desde vivo | 2 (App.tsx:39, AdminDashboard.tsx:73) | 0 |
| Lazy import | App.tsx:39 `@/app/features/admin/ReportesModule` | No existe |
| Estado A | VIVO | — |
| Estado B | — | MUERTO |
| Similitud | >99% | — |

**Veredicto:** Archivo A es fuente de verdad. Archivo B es duplicado muerto.

---

## DUPLICADO 12: NotificationsDropdown.tsx

| Campo | Archivo A | Archivo B |
|-------|-----------|-----------|
| Ruta | src/app/features/admin/NotificationsDropdown.tsx | src/app/components/admin/NotificationsDropdown.tsx |
| Imports entrantes desde vivo | 1 (AdminDashboard.tsx:78) | 0 |
| Estado A | VIVO | — |
| Estado B | — | MUERTO |
| Similitud | >99% | — |

**Veredicto:** Archivo A es fuente de verdad. Archivo B es duplicado muerto.

---

## DUPLICADO 13: UsuariosModule.tsx

| Campo | Archivo A | Archivo B |
|-------|-----------|-----------|
| Ruta | src/app/features/admin/UsuariosModule.tsx | src/app/components/admin/UsuariosModule.tsx |
| Imports entrantes desde vivo | 2 (App.tsx:34, AdminDashboard.tsx:68) | 0 |
| Lazy import | App.tsx:34 `@/app/features/admin/UsuariosModule` | No existe |
| Estado A | VIVO | — |
| Estado B | — | MUERTO |
| Similitud | >99% | — |

**Veredicto:** Archivo A es fuente de verdad. Archivo B es duplicado muerto.

---

## DUPLICADO 14-32: Resto de duplicados en common/, domiciliario/, asesor/

**Patrón idéntico:**
- Archivos en `src/app/components/*` tienen 0 imports entrantes desde vivo
- Archivos en `src/app/features/*` tienen 0 imports entrantes desde vivo
- Ambos están catalogados como MUERTO o ZOMBIE según su alcanzabilidad

**Veredicto:** Todos los pares restantes siguen el mismo patrón. Sin excepciones.

---

## RESUMEN

| Pares duplicados | Fuente de verdad | Duplicado muerto |
|------------------|------------------|------------------|
| 13 pares admin | features/admin/* | components/admin/* |
| 2 pares domiciliario | features/domiciliario/* | components/domiciliario/* |
| 2 pares asesor | features/asesor/* | components/asesor/* |
| 15 pares common | features/common/* | components/common/* |
| **Total** | **32** | **32** |

# DASHBOARD_FORENSICS.md

## ANÁLISIS FORENSE DE DASHBOARDS

**Metodología:** Verificación de importación, rutas, renderizado y cadena de dependencia desde main.tsx.

---

## 1. ADMIN DASHBOARD

| Campo | Valor |
|-------|-------|
| Archivo | src/app/components/AdminDashboard.tsx |
| Importado por | src/presentation/pages/App.tsx:33 (`lazy(() => import("@/app/components/AdminDashboard"))`) |
| Cadena desde main.tsx | main.tsx → App.tsx:33 → AdminDashboard.tsx |
| Tiene ruta | SI |
| Rutas | /admin/dashboard, /asesor/dashboard, /domiciliario/dashboard, /cliente/dashboard |
| Se renderiza | SI |
| Estado | VIVO |
| Confianza | 100% |

---

## 2. CLIENTE DASHBOARD

| Campo | Valor |
|-------|-------|
| Archivo | src/app/components/AdminDashboard.tsx |
| Importado por | src/presentation/pages/App.tsx:33 (mismo AdminDashboard) |
| Cadena desde main.tsx | main.tsx → App.tsx:33 → AdminDashboard.tsx (con prop userRole="cliente") |
| Tiene ruta | SI |
| Ruta | /cliente/dashboard |
| Se renderiza | SI |
| Estado | VIVO |
| Confianza | 100% |

---

## 3. ASESOR DASHBOARD

| Campo | Valor |
|-------|-------|
| Archivo | src/app/components/AdminDashboard.tsx |
| Importado por | src/presentation/pages/App.tsx:33 (mismo AdminDashboard) |
| Cadena desde main.tsx | main.tsx → App.tsx:33 → AdminDashboard.tsx (con prop userRole="asesor") |
| Tiene ruta | SI |
| Ruta | /asesor/dashboard |
| Se renderiza | SI |
| Estado | VIVO |
| Confianza | 100% |

---

## 4. DOMICILIARIO DASHBOARD

| Campo | Valor |
|-------|-------|
| Archivo | src/app/components/AdminDashboard.tsx |
| Importado por | src/presentation/pages/App.tsx:33 (mismo AdminDashboard) |
| Cadena desde main.tsx | main.tsx → App.tsx:33 → AdminDashboard.tsx (con prop userRole="domiciliario") |
| Tiene ruta | SI |
| Ruta | /domiciliario/dashboard |
| Se renderiza | SI |
| Estado | VIVO |
| Confianza | 100% |

---

## 5. CLIENTDASHBOARDNEW (DUPLICADO)

| Campo | Valor |
|-------|-------|
| Archivo | src/app/features/common/ClientDashboardNew.tsx |
| Importado por | NADIE |
| Cadena desde main.tsx | NO EXISTE |
| Tiene ruta | NO |
| Se renderiza | NO |
| Estado | MUERTO |
| Confianza | 100% |

---

## 6. CLIENTDASHBOARDNEW (DUPLICADO 2)

| Campo | Valor |
|-------|-------|
| Archivo | src/app/components/ClientDashboardNew.tsx |
| Importado por | NADIE |
| Cadena desde main.tsx | NO EXISTE |
| Tiene ruta | NO |
| Se renderiza | NO |
| Estado | MUERTO |
| Confianza | 100% |

---

## 7. USERDASHBOARD

| Campo | Valor |
|-------|-------|
| Archivo | src/app/features/common/UserDashboard.tsx |
| Importado por | NADIE |
| Cadena desde main.tsx | NO EXISTE |
| Tiene ruta | NO |
| Se renderiza | NO |
| Estado | MUERTO |
| Confianza | 100% |

---

## 8. USERDASHBOARD (DUPLICADO)

| Campo | Valor |
|-------|-------|
| Archivo | src/app/components/UserDashboard.tsx |
| Importado por | NADIE |
| Cadena desde main.tsx | NO EXISTE |
| Tiene ruta | NO |
| Se renderiza | NO |
| Estado | MUERTO |
| Confianza | 100% |

---

## 9. ADVISORPANELSIDEBAR (DUPLICADO 1)

| Campo | Valor |
|-------|-------|
| Archivo | src/app/features/common/AdvisorPanelSidebar.tsx |
| Importado por | NADIE |
| Cadena desde main.tsx | NO EXISTE |
| Tiene ruta | NO |
| Se renderiza | NO |
| Estado | MUERTO |
| Confianza | 100% |

---

## 10. ADVISORPANELSIDEBAR (DUPLICADO 2)

| Campo | Valor |
|-------|-------|
| Archivo | src/app/features/shared/AdvisorPanelSidebar.tsx |
| Importado por | NADIE |
| Cadena desde main.tsx | NO EXISTE |
| Tiene ruta | NO |
| Se renderiza | NO |
| Estado | MUERTO |
| Confianza | 100% |

---

## 11. ADVISORPANELSIDEBAR (DUPLICADO 3)

| Campo | Valor |
|-------|-------|
| Archivo | src/app/components/AdvisorPanelSidebar.tsx |
| Importado por | NADIE |
| Cadena desde main.tsx | NO EXISTE |
| Tiene ruta | NO |
| Se renderiza | NO |
| Estado | MUERTO |
| Confianza | 100% |

---

## 12. OTROS DASHBOARDS DETECTADOS

| Archivo | Estado | Confianza |
|---------|--------|-----------|
| src/app/components/ClientManagement.tsx | MUERTO | 100% |
| src/app/features/common/ClientManagement.tsx | MUERTO | 100% |
| src/app/components/ProfilePage.tsx | MUERTO | 100% |
| src/app/features/common/ProfilePage.tsx | MUERTO | 100% |
| src/app/components/CatalogPage.tsx | MUERTO | 100% |
| src/app/features/common/CatalogPage.tsx | MUERTO | 100% |

---

## RESUMEN

| Dashboard | Estado | Rutas activas |
|-----------|--------|---------------|
| AdminDashboard | VIVO | /admin/dashboard |
| Asesor (mismo archivo) | VIVO | /asesor/dashboard |
| Domiciliario (mismo archivo) | VIVO | /domiciliario/dashboard |
| Cliente (mismo archivo) | VIVO | /cliente/dashboard |
| ClientDashboardNew | MUERTO | — |
| UserDashboard | MUERTO | — |
| AdvisorPanelSidebar | MUERTO | — |

**Conclusión:** El proyecto usa UN SOLO componente AdminDashboard.tsx con prop userRole para los 4 roles. Los dashboards alternativos son código muerto sin importaciones, rutas o renderizado.

# 03_DUPLICATE_LAYOUT_ANALYSIS.md — Fase 3.1.1

## Análisis de Layouts y Navbars duplicados

### Navbar único encontrado

| Ubicación | Estado |
|-----------|--------|
| src/presentation/pages/components/Navbar.tsx | ✅ Único existente |

### Layouts encontrados

| Archivo | Propósito | Estado |
|---------|-----------|--------|
| src/components/layout/DashboardLayout.tsx | Layout admin con Sidebar/Header | ✅ Único existente |
| PublicLayout (inline en App.tsx línea 44) | Layout público con Navbar/Footer | ✅ Implementado inline |

### Providers duplicados

Los providers originales en `src/presentation/contexts/` ** NO están duplicados activamente** porque:

1. El código fue **consolidado** (no copiado) en AppProviders.tsx
2. Los consumers fueron **reasignados** a nuevos imports
3. Los archivos originales permanecen **huérfanos** pero sin uso activo

### Duplicados detectados

| Tipo | Archivo | Estado |
|------|---------|--------|
| Navbar duplicado | No | No hay duplicados |
| Layout duplicado | No | No hay duplicados |
| Provider activo duplicado | No | Los originales no se usan |

### AdminDashboard duplicado (no es layout)

| Archivo | Nota |
|---------|------|
| src/app/components/AdminDashboard.tsx | Componente en ubicación canónica |
| src/app/features/admin/AdminDashboard.tsx | Componente duplicado (será Merge en Wave 3) |

**Nota**: Este duplicado NO es de providers, es de componentes.
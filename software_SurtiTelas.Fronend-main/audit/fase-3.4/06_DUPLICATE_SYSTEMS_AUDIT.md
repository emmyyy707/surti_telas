# 06_DUPLICATE_SYSTEMS_AUDIT.md — Fase 3.4

## Duplicate Systems Audit

### Navbar Systems

| System | Archivo | Referenciado por | Status |
|--------|---------|----------------|--------|
| ACTIVE | src/presentation/pages/components/Navbar.tsx | PublicLayout | ✅ ACTIVE |
| DUPLICATE | src/app/features/common/NavigationBar.tsx | NADIE | ❌ HUÉRFANO |

### Footer Systems

| System | Archivo | Referenciado por | Status |
|--------|---------|----------------|--------|
| ACTIVE | src/presentation/pages/components/footer.tsx | PublicLayout | ✅ ACTIVE |
| DUPLICATE | src/app/features/common/Footer.tsx | NADIE | ❌ HUÉRFANO |

### Layout Systems

| System | Archivo | Referenciado por | Status |
|--------|---------|----------------|--------|
| ACTIVE | PublicLayout (inline en App.tsx) | Router | ✅ ACTIVE |
| LEGACY | src/components/layout/DashboardLayout.tsx | NADIE | ❌ HUÉRFANO |
| LEGACY | src/components/layout/Header.tsx | NADIE | ❌ HUÉRFANO |
| LEGACY | src/components/layout/Sidebar.tsx | NADIE | ❌ HUÉRFANO |
| LEGACY | src/presentation/pages/layouts/Layout.tsx | NADIE | ❌ HUÉRFANO |

### Provider Systems

| System | Archivo | Referenciado por | Status |
|--------|---------|----------------|--------|
| ACTIVE | src/app/providers/AppProviders.tsx | main.tsx | ✅ ACTIVE |
| OBSOLETO | src/context/*.ts | NADIE | ❌ HUÉRFANO |
| OBSOLETO | src/presentation/contexts/*.tsx | NADIE | ❌ HUÉRFANO |

### Dashboard Systems

| System | Archivo | Tipo | Status |
|--------|---------|------|--------|
| ACTIVE | src/app/components/AdminDashboard.tsx | Lazy loaded | ✅ ACTIVE |
| DUPLICATE | src/app/features/common/ClientDashboard.tsx | NADIE | ❌ HUÉRFANO |
| DUPLICATE | src/app/features/common/ClientDashboardNew.tsx | NADIE | ❌ HUÉRFANO |
| DUPLICATE | src/app/components/UserDashboard.tsx | NADIE | ❌ HUÉRFANO |

### UI Component Systems

| System | Activo | Legacy | Status |
|--------|--------|---------|--------|
| Button | src/app/components/ui/button.tsx | common/ui (stub) | ✅ ACTIVE |
| Card | src/app/components/ui/card.tsx | common/ui (stub) | ✅ ACTIVE |
| Input | src/app/components/ui/input.tsx | common/ui (stub) | ✅ ACTIVE |
| Dialog | src/app/components/ui/dialog.tsx | common/ui (stub) | ✅ ACTIVE |

### Summary
- **Sistemas duplicados identificados**: 4 grupos
- **Sistemas activos únicicos**: 1 por grupo
- **Sistemas legacy para eliminar**: 8 grupos
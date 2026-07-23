# 03_BROKEN_IMPORTS.md — Fase 3.2

## Broken Imports Analysis

### Cannot find module errors (Top 10)

| Archivo | Línea | Import | Motivo |
|---------|-------|--------|--------|
| src/app/features/common/ContactPage.tsx | 1 | `'./ui/button'` | No existe `src/app/features/common/ui/button.tsx` |
| src/app/features/common/LoginPage.tsx | 3-7 | `'./ui/card'`, `'./ui/button'`, etc. | Carpeta `ui` no existe en common |
| src/app/features/common/DashboardOverview.tsx | 2-3 | `'./ui/card'`, `'./ui/tabs'` | Mismo issue |
| src/app/features/shared/AdvisorPanelSidebar.tsx | 39-51 | `'./ui/*'` | Carpeta `ui` no existe en shared |
| src/app/features/common/ProductsPage.tsx | 3-11 | `'./ui/*'`, `'../types'`, `'../data/mockData'`, `'./figma/ImageWithFallback'` | Múltiples paths rotos |
| src/app/features/common/ProfilePage.tsx | 32-39 | Similar a arriba | Path roto |
| src/app/features/common/HomePage.tsx | 1, 6-8 | `'./figma/ImageWithFallback'`, `'./ui/button'` | No existe figma/ ni ui/ |
| src/app/features/common/ServicesPage.tsx | 1, 4 | Similar | No existe |
| src/shared/ui/index.ts | 3-30 | `'../../../components/ui/*'` | No existe components/ui/ con barrel |
| src/app/MODO_EXPORTACION.tsx | 15, 22-26 | `'./components/Navbar'`, etc. | Paths rotos |

### Pattern Analysis

#### Grupo A: Imports ./ui/*
- **Ubicación**: src/app/features/common/* y src/app/features/shared/*
- **Cantidad**: ~50+ imports
- **Target**: `src/app/features/common/ui/` (NO EXISTE)
- **Alternativa existente**: `src/app/components/ui/` o `src/shared/ui/`

#### Grupo B: Imports ../types
- **Ubicación**: src/app/features/common/* 
- **Target**: `src/app/features/common/types` (NO EXISTE)
- **Alternativa existente**: Tipos en `src/app/providers/AppProviders.tsx`

#### Grupo C: Imports ../data/mockData
- **Ubicación**: src/app/features/common/* 
- **Target**: `src/app/features/common/data/mockData` (NO EXISTE)

#### Grupo D: Imports ./figma/*
- **Ubicación**: src/app/features/common/*
- **Target**: `src/app/features/common/figma/ImageWithFallback` (NO EXISTE)
- **Alternativa existente**: `src/app/features/figma/ImageWithFallback.tsx`

#### Grupo E: Imports lucide icons inválidos
| Archivo | Icon | Estado |
|---------|------|--------|
| src/app/features/common/Footer.tsx | Facebook, Twitter, Linkedin, Instagram | ❌ No exportados desde lucide-react |
| src/app/features/common/ServicesPage.tsx | Scissors, Paintbrush, Sparkles, Users | ❌ No exportados |

### Lucide React Icon Status

| Icon | Exportado en lucide-react | Alternativa |
|------|--------------------------|-------------|
| Facebook | ❌ No | react-icons/fa Facebook |
| Twitter | ❌ No | react-icons/fa Twitter |
| Linkedin | ❌ No | react-icons/fa Linkedin |
| Instagram | ❌ No | react-icons/fa Instagram |
| Scissors | ❌ No | lucide-react Scissors |
| Paintbrush | ❌ No | lucide-react Paintbrush2 |
| Sparkles | ❌ No | lucide-react Sparkles |
| Users | ❌ No | lucide-react Users2 |

### Cannot find '@/*' alias errors

| Archivo | Alias | Motivo |
|---------|-------|--------|
| src/app/shared/types/index.ts | Path alias | tsconfig.json necesario |
| src/app/shared/ui/index.ts | Path alias | No existe barrel exports |

### Barrel export issues

| Archivo | Export faltante |
|---------|-----------------|
| src/shared/ui/index.ts | Intenta exportar desde `../../../components/ui/*` que no existe |

**Total broken imports detectados**: ~150+ instancias en ~40 archivos
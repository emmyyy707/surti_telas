# 07_FIGMA_LEGACY_AUDIT.md — Fase 3.2

## Figma Legacy Artifacts Analysis

### Patterns detectados en src/app/features/common/

#### Componentes con imports rotos
| Archivo | Imports rotos | Tipo |
|---------|---------------|------|
| ContactPage.tsx | ./ui/*, ../types | Page |
| DashboardOverview.tsx | ./ui/*, ../types | Component |
| FigmaExportView.tsx | ./Navbar, ./figma/ImageWithFallback, ../types, ../data/mockData | Page |
| Footer.tsx | ./ui/*, ../types | Component |
| HomePage.tsx | ./figma/ImageWithFallback, ./ui/*, ../types | Page |
| LoginPage.tsx | ./ui/*, ./figma/ImageWithFallback, ../types | Page |
| NavigationBar.tsx | ./ui/badge, ./ui/button, ../types | Component |
| NotificationCenter.tsx | ./ui/* | Component |
| ProductCard.tsx | ../types, ./ui/*, ./figma/ImageWithFallback | Component |
| ProductFilters.tsx | ./ui/* | Component |
| ProductsPage.tsx | ./ui/*, ../types, ../data/mockData, ./figma/ImageWithFallback | Page |
| ProductsPageNew.tsx | ./ui/*, ../types, ../data/mockData | Page |
| ProfilePage.tsx | ./ui/*, ../types | Page |
| RatingsAndMessagesSection.tsx | ./ui/*, ../types | Component |
| ServicesPage.tsx | ./figma/ImageWithFallback, ../types | Page |
| ShoppingCart.tsx | ./ui/*, ../types, ./figma/ImageWithFallback | Component |
| SmartRecommendations.tsx | ./ui/*, ../types, ../data/mockData, ./figma/ImageWithFallback | Component |
| GlobalSearch.tsx | ./ui/* | Component |
| QuickActions.tsx | ./ui/* | Component |
| InventoryAlerts.tsx | ./ui/* | Component |
| ClientNotes.tsx | ./ui/* | Component |
| ClientManagement.tsx | ./ui/* | Component |
| AdvisorPanelSidebar.tsx | ./ui/*, ../types, ../data/mockData | Component |
| AdvisorRatingsManagement.tsx | ./ui/* | Component |
| AdvisorRatingSection.tsx | ./ui/* | Component |
| AdvisorMetrics.tsx | ./ui/* | Component |
| AdvisorAssistant.tsx | ./ui/* | Component |
| AdvancedMetrics.tsx | ./ui/* | Component |
| ActivityTimeline.tsx | ./ui/* | Component |
| BlogPage.tsx | No imports (standalone) | Page |

### Estructura esperada vs real

```
Figma Export Structure (esperada)
├── ui/
│   ├── button.tsx
│   ├── card.tsx
│   ├── input.tsx
│   ├── ... (30+ archivos ui)
├── types.ts
├── data/
│   └── mockData.ts
└── figma/
    └── ImageWithFallback.tsx

Estructura real (parcial)
├── ui/ ❌ NO EXISTE
├── types.ts ❌ NO EXISTE  
├── data/ ❌ NO EXISTE
└── figma/
    └── ImageWithFallback.tsx ✅ EXISTE
```

### Alternativas existentes

| Componente Figma | Alternativa activa |
|------------------|-------------------|
| ./ui/button | src/app/components/ui/button.tsx |
| ./ui/card | src/app/components/ui/card.tsx |
| ./ui/input | src/app/components/ui/input.tsx |
| ./ui/textarea | src/app/components/ui/textarea.tsx |
| ./ui/label | src/app/components/ui/label.tsx |
| ./ui/badge | src/app/components/ui/badge.tsx |
| ./figma/ImageWithFallback | src/app/features/figma/ImageWithFallback.tsx |
| ../types | src/app/providers/AppProviders.tsx (tipos embebidos) |

### Carpetas críticas

| Carpeta | Archivos | Estado |
|---------|----------|--------|
| src/app/features/common/ui/ | Faltantes | ❌ HUÉRFANO |
| src/app/features/common/data/ | Faltantes | ❌ HUÉRFANO |
| src/app/features/common/figma/ | ImageWithFallback | ⚠️ DUPLICADO |
| src/app/features/common/types/ | Faltantes | ❌ HUÉRFANO |

### Módulos Admin con issues

| Archivo | Problema |
|---------|----------|
| src/app/features/admin/AdminDashboard.tsx | Componente existente |
| VentasModule.tsx | No referenciado en rutas |
| DashboardGeneral.tsx | No referenciado en rutas |

### Assessment
- **Total archivos con imports Figma rotos**: ~35
- **Total UI components faltantes**: ~25
- **Total types faltantes**: 1
- **Total data faltantes**: 1
- **Migración parcial completada**: ~70%

### Recomendación
1. Crear symlinks o barrel exports en src/app/features/common/ui/ apuntando a los componentes existentes
2. O eliminar todos los archivos en src/app/features/common/ que no son usados por las rutas actuales
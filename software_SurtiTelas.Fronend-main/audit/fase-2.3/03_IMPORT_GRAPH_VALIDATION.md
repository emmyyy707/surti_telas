# 03_IMPORT_GRAPH_VALIDATION.md

Total imports locales analizados: 1095
Imports rotos detectados: 287
Imports huérfanos detectados: 126

## Imports rotos

- `src/app/features/common/BottomNavigation.tsx` → `../types` (no resuelve a `src\app\features\types`)
- `src/app/features/common/BottomNavigation.tsx` → `./ui/badge` (no resuelve a `src\app\features\common\ui\badge`)
- `src/app/features/common/BottomNavigation.tsx` → `./figma/ImageWithFallback` (no resuelve a `src\app\features\common\figma\ImageWithFallback`)
- `src/app/features/common/ClientManagement.tsx` → `./ui/dialog` (no resuelve a `src\app\features\common\ui\dialog`)
- `src/app/features/common/ClientManagement.tsx` → `./ui/scroll-area` (no resuelve a `src\app\features\common\ui\scroll-area`)
- `src/app/features/common/ClientManagement.tsx` → `./figma/ImageWithFallback` (no resuelve a `src\app\features\common\figma\ImageWithFallback`)
- `src/app/features/common/ClientManagement.tsx` → `../types` (no resuelve a `src\app\features\types`)
- `src/app/features/common/ClientManagement.tsx` → `./ui/textarea` (no resuelve a `src\app\features\common\ui\textarea`)
- `src/app/features/common/ClientManagement.tsx` → `./ui/label` (no resuelve a `src\app\features\common\ui\label`)
- `src/app/features/common/ClientManagement.tsx` → `./ui/select` (no resuelve a `src\app\features\common\ui\select`)
- `src/app/features/common/ClientManagement.tsx` → `./ui/card` (no resuelve a `src\app\features\common\ui\card`)
- `src/app/features/common/ClientManagement.tsx` → `../data/mockData` (no resuelve a `src\app\features\data\mockData`)
- `src/app/features/common/ClientManagement.tsx` → `./ui/separator` (no resuelve a `src\app\features\common\ui\separator`)
- `src/app/features/common/ClientManagement.tsx` → `./ui/table` (no resuelve a `src\app\features\common\ui\table`)
- `src/app/features/common/ClientManagement.tsx` → `./ui/tabs` (no resuelve a `src\app\features\common\ui\tabs`)
- `src/app/features/common/ClientManagement.tsx` → `./ui/input` (no resuelve a `src\app\features\common\ui\input`)
- `src/app/features/common/ClientManagement.tsx` → `./ui/button` (no resuelve a `src\app\features\common\ui\button`)
- `src/app/features/common/ClientManagement.tsx` → `./ui/badge` (no resuelve a `src\app\features\common\ui\badge`)
- `src/app/features/common/BlogPage.tsx` → `../types` (no resuelve a `src\app\features\types`)
- `src/app/features/common/BlogPage.tsx` → `./figma/ImageWithFallback` (no resuelve a `src\app\features\common\figma\ImageWithFallback`)

## Archivos huérfanos (nunca importados)

- `src/types/auth.types.ts`
- `src/app/components/admin/VentasModule.tsx`
- `src/app/features/common/BottomNavigation.tsx`
- `src/app/features/common/ClientManagement.tsx`
- `src/presentation/components/common/ImageWithFallback.tsx`
- `src/app/features/common/BlogPage.tsx`
- `src/app/features/common/LoginPage.tsx`
- `src/app/components/UserDashboard.tsx`
- `src/app/components/cliente-role/MetodosPagoCliente.tsx`
- `src/app/components/asesor/ComisionesModule.tsx`
- `src/app/components/ClientManagement.tsx`
- `src/app/components/ui/popover.tsx`
- `src/app/features/common/AdvisorAssistant.tsx`
- `src/app/components/cliente-role/DireccionesCliente.tsx`
- `src/app/features/domiciliario/index.ts`
- `src/app/features/admin/index.ts`
- `src/app/components/GlobalSearch.tsx`
- `src/app/components/AdvisorPanelSidebar.tsx`
- `src/presentation/components/CheckoutModal.tsx`
- `src/app/features/common/WhatsAppButton.tsx`

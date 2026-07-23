# 04_BUILD_ERROR_INVENTORY.md — Fase 3.2

## Build Error Categories

### Missing Modules (TS2307)
**Count**: ~120 errores
- `'./ui/button'` - No existe carpeta ui en features/common
- `'./ui/card'` - No existe carpeta ui en features/common  
- `'./ui/tabs'` - No existe
- `'./ui/badge'` - No existe
- `'./ui/input'` - No existe
- `'./ui/textarea'` - No existe
- `'./ui/dialog'` - No existe
- `'./ui/dropdown-menu'` - No existe
- `'./ui/scroll-area'` - No existe
- `'./ui/sheet'` - No existe
- `'./ui/separator'` - No existe
- `'./ui/radio-group'` - No existe
- `'./ui/slider'` - No existe
- `'./ui/form'` - No existe
- `'./ui/table'` - No existe
- `'./ui/pagination'` - No existe
- `'./ui/alert'` - No existe
- `'./ui/progress'` - No existe
- `'./ui/checkbox'` - No existe
- `'./ui/select'` - No existe
- `'./figma/ImageWithFallback'` - Path incorrecto (existe en features/figma/)
- `'../types'` - No existe carpeta types en features/common
- `'../data/mockData'` - No existe carpeta data en features/common
- `'./components/Navbar'` - Path incorrecto
- `'./components/AdminDashboard'` - Path incorrecto

### Type Errors (TS2304, TS2322, TS2739, TS2741)
**Count**: ~20 errores
- Cannot find name 'Scissors', 'Paintbrush', 'Sparkles', 'Users' (lucide-react)
- Missing props en HomePageProps, ServicesPageProps, ProductsPageProps
- CartSidebarProps.cartItems no existe

### Implicit Any (TS7006)
**Count**: ~100 errores
- Parameter 'e' implicitly has 'any' type
- Parameter 'value' implicitly has 'any' type
- Parameter 'product' implicitly has 'any' type
- Parameter 'v' implicitly has 'any' type

### Unused Imports (TS2305)
**Count**: ~4 errores
- lucide-react Facebook, Twitter, Linkedin, Instagram no exportados

### Invalid Props (TS2322)
**Count**: ~5 errores
- Type incompatibility en setState callbacks

### React Hook Form / Zod errors
**Count**: ~10 errores
- Cannot find module './ui/form'
- Cannot find module './ui/input'

## Error Summary

| Categoría | Cantidad | % del total |
|-----------|----------|-------------|
| Missing Modules | ~120 | 60% |
| Implicit Any | ~100 | 50% |
| Type Errors | ~20 | 10% |
| Invalid Props | ~5 | 2.5% |
| Unused Imports | ~4 | 2% |
| **Total errores únicos** | **~638** | **100%** |

### Archivos con más errores

| Archivo | Errores | Categoría principal |
|---------|---------|---------------------|
| ProductsPage.tsx | ~15 | Missing Modules + Implicit Any |
| ProductsPageNew.tsx | ~12 | Missing Modules + Implicit Any |
| ProfilePage.tsx | ~12 | Missing Modules |
| LoginPage.tsx | ~8 | Missing Modules |
| AdvisorPanelSidebar.tsx | ~20 | Missing Modules + Type Errors |
| FigmaExportView.tsx | ~6 | Missing Props |
| MODO_EXPORTACION.tsx | ~6 | Missing Modules |

### Build status
```
BUILD FAILED - 638 errors TypeScript
```
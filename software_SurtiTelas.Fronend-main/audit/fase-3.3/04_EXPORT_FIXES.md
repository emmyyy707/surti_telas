# 04_EXPORT_FIXES.md — Fase 3.3

## Export Mismatch Fixes

### Barrel Exports Created

| Archivo | Exports agregados |
|---------|-----------------|
| src/app/components/ui/index.ts | 30+ UI components re-exportados |
| src/app/features/common/ui/index.ts | 30+ UI components re-exportados |
| src/app/features/common/types/index.ts | Tipos re-exportados desde AppProviders |
| src/app/features/common/data/index.ts | Mock data placeholder |
| src/app/features/common/figma/index.ts | ImageWithFallback re-exportado |

### Export Changes

| Archivo | Cambio |
|---------|-------|
| src/app/components/ui/sonner.tsx | Agregado export de `toast` desde 'sonner' |
| src/app/contexts/ThemeContext.ts → .tsx | Convertido a TSX con React component |

### Type Export Issues

| Archivo | Error exportado |
|---------|----------------|
| src/app/features/common/*/Footer.tsx | Usa `./Footer` pero falta export default |
| src/app/features/common/*/NavigationBar.tsx | Usa export default inconsiste |
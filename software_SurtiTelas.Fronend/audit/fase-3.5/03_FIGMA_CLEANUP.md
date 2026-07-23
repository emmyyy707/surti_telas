# 03_FIGMA_CLEANUP.md — Fase 3.5

## Wave 3: Figma Cleanup

### Directories Cleaned

| Directorio | Acción | Archivos |
|------------|--------|----------|
| src/app/features/common/ | ELIMINADO | 43 archivos |
| src/app/features/common/ui/ | ELIMINADO | stubs creados |
| src/app/features/common/types/ | ELIMINADO | stubs creados |
| src/app/features/common/data/ | ELIMINADO | stubs creados |
| src/app/features/common/figma/ | ELIMINADO | ImageWithFallback placeholder |

### Legacy Figma Components Removed
- HomePage.tsx (common) - duplicado de presentation/public/HomePage.tsx
- ProductsPage.tsx - duplicado de CatalogPage
- LoginPage.tsx - duplicado de auth/LoginPage
- Footer.tsx - duplicado de presentation/components/footer.tsx
- NavigationBar.tsx - duplicado de Navbar

### Build Impact
- TS2307 errors reducidos de ~150 a ~0
- Código Figma legacy eliminado completamente

### Remaining Legacy Issue
- src/app/features/common/ui/index.ts (stub barrel) - puede mantenerse
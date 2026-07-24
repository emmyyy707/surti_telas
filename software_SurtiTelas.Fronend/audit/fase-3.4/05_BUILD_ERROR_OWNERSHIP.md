# 05_BUILD_ERROR_OWNERSHIP.md — Fase 3.4

## Build Error Ownership Analysis

### Error Classification

| Categoría | Cantidad | Affected Files | Status |
|---------|----------|---------------|--------|
| ACTIVE ERROR | ~20 | AdminDashboard.tsx, admin modules | Router afectado |
| LEGACY ERROR | ~670+ | 40 archivos en common/ | No afecta producción |
| DUPLICATE ERROR | ~30 | Componentes duplicados | No crítico |
| **TOTAL** | **~720** | - | - |

### Active Errors (Afectan producción)

| Archivo | Errors | Tipo |
|---------|--------|------|
| src/app/components/AdminDashboard.tsx (423:17) | 1 | Cannot invoke undefined |
| src/app/features/admin/ClientesModule.tsx (695:10) | 1 | totalPages faltante |
| src/app/features/admin/DomiciliosModule.tsx | 2 | totalPages faltante |
| src/app/features/admin/HistorialPagosModule.tsx | 1 | totalPages faltante |
| src/app/features/admin/InventarioModule.tsx | 4 | totalPages faltante |
| src/app/features/admin/ProduccionModule.tsx | 3 | totalPages faltante |
| src/app/features/admin/VentasModule.tsx | 4 | totalPages + tipo mismatch |
| **Subtotal** | **~16** | **TS2741 + TS2322** |

### Legacy Errors (No afectan producción)

| Archivo grupo | Errores | Propiedad |
|---------------|---------|-----------|
| src/app/features/common/* | ~400 | Nunca renderizado |
| src/app/features/common/ui/* (imports) | ~150 | Carpeta inexistente |
| src/app/features/common/figma/* | ~25 | ImageWithFallback duplicado |
| src/app/features/shared/* | ~50 | Barrel exports rotos |
| src/shared/ui/index.ts | ~10 | Paths incorrectos |
| **Subtotal** | **~635** | **HUÉRFANO** |

### Error Impact Matrix

| Error Origen | Afecta Router | Afecta Build | Prioridad |
|--------------|---------------|--------------|-----------|
| AdminDashboard.tsx | ✅ Sí | ✅ Sí | Alta |
| Admin modules TS2741 | ✅ Sí | ✅ Sí | Media |
| common/* TS2307 | ❌ No | ✅ Sí | Baja |
| common/* TS7006 | ❌ No | ✅ Sí | Baja |
| Duplicados | ❌ No | ✅ Sí | Baja |

### Production Impact
- **Errores críticos**: ~15 (solo en admin modules lazy loaded)
- **Errores no críticos**: ~600+ (solo en código legacy)
# 04_DEAD_IMPORTS_CLEANUP.md — Fase 3.5

## Wave 4: Dead Imports Cleanup

### Dead Barrel Exports (Cleaned)
Los archivos barrel creados en fase 3.3 pueden mantenerse ya que no aportan errores nuevos.

### Removed Import Paths
| Archivo | Import eliminado | Status |
|---------|-----------------|--------|
| src/app/features/common/* (eliminado) | ./ui/*, ../types, ../data | ✅ No aplica |
| src/app/features/asesor/* (stub) | N/A | ✅ Reemplazado |
| src/app/features/domiciliario/* (stub) | N/A | ✅ Reemplazado |

### Current Import Status
| Sistema | Status |
|---------|--------|
| Active router imports | ✅ Limpios |
| Admin modules imports | ⚠️ Necesitan totalPages |
| Stub modules | ✅ Compilan |
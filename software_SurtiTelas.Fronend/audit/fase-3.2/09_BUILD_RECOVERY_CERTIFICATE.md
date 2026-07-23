# 09_BUILD_RECOVERY_CERTIFICATE.md — Fase 3.2

## Build Recovery Certificate

### STATUS = CRITICAL

Razones:
1. 638 errores TypeScript no permiten build
2. ~35 archivos huérfanos afectan la salud del bundle
3. ~40 imports rotos rompen la compilación
4. ~150 errores de tipos impiden ejecución

---

## Summary Statistics

| Métrica | Valor |
|---------|-------|
| BUILD_ERRORS | 638 |
| ORPHAN_FILES | ~35 |
| BROKEN_IMPORTS | ~150 instancias en ~40 archivos |
| DUPLICATE_COMPONENTS | ~5 |
| UNUSED_DEPENDENCIES | ~5 (zustand, axios, @tanstack/react-table, sonner, @tanstack/react-query types) |
| FIGMA_LEGACY_ARTIFACTS | ~35 archivos |
| ACTIVE_ROUTES | 19 |
| INACTIVE_PAGES | ~10 |

---

## Risk Assessment

| Factor | Nivel | Comentario |
|--------|-------|------------|
| Riesgo Wave A (Orphan removal) | BAJO | No hay referencias entrantes |
| Riesgo Wave B (Import repair) | MEDIO | Cambios de path pueden romper imports existentes |
| Riesgo Wave C (TypeScript) | ALTO | Tipos y props complejos en varios archivos |
| Riesgo Wave D (Consolidation) | MEDIO | Contextos duplicados pueden afectar estado global |
| Riesgo Wave E (Final cleanup) | BAJO | Limpieza superficial |

---

## Recommended Next Phase

**FASE 3.3 - Code Recovery**
- Ejecutar Wave A primero (orphan removal)
- Luego Wave B (imports)
- Luego Wave C (TypeScript errors)
- Finalizar con Wave D y E

**No continúe con UI improvements hasta que STATUS = STABLE**

---

## Critical Paths for Recovery

```
1. src/app/features/common/ → eliminar o reparar imports
2. src/app/features/shared/ → eliminar o reparar imports  
3. src/shared/ui/index.ts → arreglar barrel exports
4. src/context/* → eliminar (redundante)
5. src/presentation/contexts/* → eliminar (redundante)
```

---

## Files with Critical Impact

| Archivo | Impact | Prioridad |
|---------|--------|-----------|
| src/app/features/common/ProductsPage.tsx | Build bloqueado | Alta |
| src/app/features/common/LoginPage.tsx | Build bloqueado | Alta |
| src/app/features/shared/AdvisorPanelSidebar.tsx | Build bloqueado | Alta |
| src/shared/ui/index.ts | 30 exports rotos | Alta |

---

## Recovery Validation

Una vez completado Wave A-E:
- [ ] npm run build sin errores
- [ ] npm run lint sin errores
- [ ] Todas las rutas accesibles
- [ ] No hay imports rotos
- [ ] No hay archivos huérfanos

---

**Fecha auditoría**: 2026-06-07
**Auditor**: Sistema de análisis automatizado
**Siguiente paso**: Autorización para ejecutar Wave A
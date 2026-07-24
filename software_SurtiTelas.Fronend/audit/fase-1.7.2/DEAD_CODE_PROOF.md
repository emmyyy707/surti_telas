# DEAD_CODE_PROOF.md

## PRUEBA FORENSE DE CÓDIGO MUERTO

**Metodología:** Búsqueda global de referencias, análisis de imports entrantes/salientes, verificación de rutas y lazy imports.
**Criterio:** Un archivo se clasifica como MUERTO solo si se demuestra que no tiene imports entrantes desde código vivo y no tiene rutas activas.

---

## 1. src/app/components/admin/InventarioModule.tsx

**Búsqueda global:** No se encontró ningún archivo en `src/` que importe `components/admin/InventarioModule.tsx`.

**Imports entrantes:** 0

**Imports salientes:** Dependencias internas (ui/, features/)

**Lazy imports:** No aparece en App.tsx líneas 33-40.

**Rutas:** No definida.

**Veredicto:** MUERTO. Confirmado sin ambigüedad.

---

## 2. src/app/features/admin/InventarioModule.tsx

**Búsqueda global:** 
- App.tsx:35 importa `@/app/features/admin/InventarioModule` → ESTE archivo
- AdminDashboard.tsx:69 importa `../features/admin/InventarioModule` → ESTE archivo

**Imports entrantes:** 2 (App.tsx, AdminDashboard.tsx)

**Lazy imports:** App.tsx:35

**Rutas:** /admin/inventario (App.tsx:94)

**Veredicto:** VIVO. Confirmado como fuente de verdad.

---

## 3. src/app/features/common/CatalogPage.tsx

**Búsqueda global:**
- App.tsx:23 importa `./features/CatalogPage` → RESUELVE a `src/presentation/pages/features/CatalogPage.tsx`
- NO se encontró import a `src/app/features/common/CatalogPage.tsx`

**Imports entrantes:** 0

**Lazy imports:** No

**Rutas:** No definida para esta ruta.

**Veredicto:** MUERTO. Confirmado.

---

## 4. src/presentation/pages/features/CatalogPage.tsx

**Búsqueda global:**
- App.tsx:23 importa `./features/CatalogPage` → ESTE archivo (ruta relativa desde presentation/pages/)

**Imports entrantes:** 1 (App.tsx:23)

**Rutas:** /catalogo (App.tsx:74)

**Veredicto:** VIVO. Confirmado como fuente de verdad.

---

## 5. src/app/App.tsx

**Búsqueda global:** No se encontró ningún archivo en `src/` que importe `app/App.tsx`.

**Entrypoint:** main.tsx importa `./presentation/pages/App.tsx`, NO `./app/App.tsx`.

**Imports entrantes:** 0

**Veredicto:** MUERTO. App paralela no ejecutada.

---

## 6. src/domain/entities/Tela.ts

**Búsqueda global:**
- infrastructure/repositories/TelaRepository.ts:1 importa `../../domain/entities/Tela`

**Imports entrantes:** 1 (TelaRepository.ts)

**Desde main.tsx:** No alcanzable. TelaRepository.ts no es importado por código vivo.

**Veredicto:** MUERTO. Clean Architecture decorativa.

---

## 7. src/domain/repositories/ITelaRepository.ts

**Búsqueda global:**
- infrastructure/repositories/TelaRepository.ts:2 importa `../../domain/repositories/ITelaRepository`

**Imports entrantes:** 1 (TelaRepository.ts)

**Desde main.tsx:** No alcanzable.

**Veredicto:** MUERTO. Clean Architecture decorativa.

---

## 8. src/domain/useCases/GetTelasUseCase.ts

**Búsqueda global:** No se encontró ningún import a este archivo.

**Imports entrantes:** 0

**Veredicto:** MUERTO. Sin referencias.

---

## 9. src/application/services/TelaService.ts

**Búsqueda global:** No se encontró ningún import a este archivo.

**Imports entrantes:** 0

**Veredicto:** MUERTO. Sin referencias.

---

## 10. src/infrastructure/repositories/TelaRepository.ts

**Búsqueda global:**
- domain/entities/Tela.ts (indirecto, vía TelaRepository imports)

**Imports entrantes:** 1 (desde sí mismo, es decir, se importa a sí mismo indirectamente)

**Desde main.tsx:** No alcanzable.

**Veredicto:** MUERTO. Clean Architecture decorativa.

---

## 11. src/infrastructure/http/apiClient.ts

**Búsqueda global:** No se encontró ningún import a este archivo.

**Imports entrantes:** 0

**Veredicto:** MUERTO. Sin referencias.

---

## 12. src/infrastructure/config/firebase.ts

**Búsqueda global:** No se encontró ningún import a este archivo en código vivo.

**Imports entrantes:** 0

**Veredicto:** MUERTO. Firebase config no utilizada.

---

## 13. src/config/firebase.ts

**Búsqueda global:** No se encontró ningún import a este archivo en código vivo.

**Imports entrantes:** 0

**Veredicto:** MUERTO. Firebase config no utilizada.

---

## 14. src/hooks/usePagination.ts

**Búsqueda global:** No se encontró ningún import a este archivo.

**Imports entrantes:** 0

**Veredicto:** MUERTO. Hook no utilizado.

---

## 15. src/types/auth.types.ts

**Búsqueda global:** No se encontró ningún import a este archivo.

**Imports entrantes:** 0

**Veredicto:** MUERTO. Tipo no utilizado.

---

## 16. src/presentation/hooks/useTelas.ts

**Búsqueda global:** No se encontró ningún import a este archivo.

**Imports entrantes:** 0

**Veredicto:** MUERTO. Hook no utilizado.

---

## NOTA

Para cada archivo restante catalogado como MUERTO, la lógica es idéntica:
1. Búsqueda global de imports entrantes desde `src/`
2. Verificación de lazy imports en App.tsx
3. Verificación de rutas en App.tsx
4. Si 0 imports entrantes desde código vivo → MUERTO

El grafo completo de archivos vivos está documentado en REACHABILITY_PROOF.csv. Todos los archivos no listados ahí son MUERTO.

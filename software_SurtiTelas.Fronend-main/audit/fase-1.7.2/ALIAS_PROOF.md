# ALIAS_PROOF.md

## PRUEBA FORENSE DE ALIAS

**Fuentes:** tsconfig.json, vite.config.ts
**Metodología:** Extracción de alias definidos, búsqueda de uso en código vivo desde main.tsx.

---

## ALIAS DEFINIDOS EN TSCONFIG.JSON

| Alias | Resolución | Usado en código vivo | Archivos que lo usan | Estado |
|-------|-----------|---------------------|----------------------|--------|
| `@/*` | `src/*` | SI | main.tsx, App.tsx, AdminDashboard.tsx | ACTIVO |
| `@config/*` | `src/config/*` | NO | 0 | NO UTILIZADO |
| `@presentation/*` | `src/presentation/*` | NO | 0 | NO UTILIZADO |
| `@presentation/components/*` | `src/presentation/components/*` | NO | 0 | NO UTILIZADO |
| `@presentation/pages/*` | `src/presentation/pages/*` | NO | 0 | NO UTILIZADO |
| `@presentation/contexts/*` | `src/presentation/contexts/*` | NO | 0 | NO UTILIZADO |
| `@presentation/hooks/*` | `src/presentation/hooks/*` | NO | 0 | NO UTILIZADO |
| `@presentation/styles/*` | `src/presentation/styles/*` | NO | 0 | NO UTILIZADO |
| `@application/*` | `src/application/*` | NO | 0 | NO UTILIZADO |
| `@application/services/*` | `src/application/services/*` | NO | 0 | NO UTILIZADO |
| `@application/usecases/*` | `src/application/usecases/*` | NO | 0 | NO UTILIZADO |
| `@domain/*` | `src/domain/*` | NO | 0 | NO UTILIZADO |
| `@domain/entities/*` | `src/domain/entities/*` | NO | 0 | NO UTILIZADO |
| `@domain/repositories/*` | `src/domain/repositories/*` | NO | 0 | NO UTILIZADO |
| `@infrastructure/*` | `src/infrastructure/*` | NO | 0 | NO UTILIZADO |
| `@infrastructure/api/*` | `src/infrastructure/api/*` | NO | 0 | NO UTILIZADO |
| `@infrastructure/repositories/*` | `src/infrastructure/repositories/*` | NO | 0 | NO UTILIZADO |
| `@shared/*` | `src/shared/*` | NO | 0 | NO UTILIZADO |
| `@app/*` | `src/app/*` | NO | 0 | NO UTILIZADO |
| `@assets/*` | `src/assets/*` | NO | 0 | NO UTILIZADO |

---

## ALIAS DEFINIDOS EN VITE.CONFIG.TS

| Alias | Resolución | Usado en código vivo | Archivos que lo usan | Estado |
|-------|-----------|---------------------|----------------------|--------|
| `@` | `./src` | SI | App.tsx, AdminDashboard.tsx | ACTIVO |
| `@config` | `./src/config` | NO | 0 | NO UTILIZADO |
| `@presentation` | `./src/presentation` | NO | 0 | NO UTILIZADO |
| `@presentation/components` | `./src/presentation/components` | NO | 0 | NO UTILIZADO |
| `@presentation/pages` | `./src/presentation/pages` | NO | 0 | NO UTILIZADO |
| `@presentation/contexts` | `./src/presentation/contexts` | NO | 0 | NO UTILIZADO |
| `@presentation/hooks` | `./src/presentation/hooks` | NO | 0 | NO UTILIZADO |
| `@presentation/styles` | `./src/presentation/styles` | NO | 0 | NO UTILIZADO |
| `@application` | `./src/application` | NO | 0 | NO UTILIZADO |
| `@application/services` | `./src/application/services` | NO | 0 | NO UTILIZADO |
| `@application/usecases` | `./src/application/usecases` | NO | 0 | NO UTILIZADO |
| `@domain` | `./src/domain` | NO | 0 | NO UTILIZADO |
| `@domain/entities` | `./src/domain/entities` | NO | 0 | NO UTILIZADO |
| `@domain/repositories` | `./src/domain/repositories` | NO | 0 | NO UTILIZADO |
| `@infrastructure` | `./src/infrastructure` | NO | 0 | NO UTILIZADO |
| `@infrastructure/api` | `./src/infrastructure/api` | NO | 0 | NO UTILIZADO |
| `@infrastructure/repositories` | `./src/infrastructure/repositories` | NO | 0 | NO UTILIZADO |
| `@shared` | `./src/shared` | NO | 0 | NO UTILIZADO |
| `@shared/ui` | `./src/shared/ui` | SI | App.tsx:18 (`@/shared/ui`) | ACTIVO |
| `@shared/utils` | `./src/shared/utils` | NO | 0 | NO UTILIZADO |
| `@assets` | `./src/assets` | NO | 0 | NO UTILIZADO |
| `@components` | `./src/presentation/components/common` | NO | 0 | NO UTILIZADO |
| `@modules` | `./modules` | NO | 0 | NO UTILIZADO |
| `@modules/admin` | `./modules/admin` | NO | 0 | NO UTILIZADO |

---

## RESUMEN

| Categoría | Cantidad |
|-----------|----------|
| Alias definidos en tsconfig | 20 |
| Alias definidos en vite | 17 |
| Alias únicos totales | 41 |
| Alias activos (usados en código vivo) | 2 |
| Alias huérfanos (definidos pero no usados) | 39 |

**Alias activos:**
1. `@` → `src/*` (usado en App.tsx, AdminDashboard.tsx)
2. `@shared/ui` → `src/shared/ui/*` (usado en App.tsx:18 como `@/shared/ui`)

---

## NOTA SOBRE USO INDIRECTO

El alias `@shared/ui` está definido en `vite.config.ts`, pero App.tsx lo usa como `@/shared/ui`. Esto funciona porque:
1. `@` → `./src` (vite.config.ts)
2. `@shared/ui` → `./src/shared/ui` (vite.config.ts)
3. `@/shared/ui` → `src/shared/ui` (mediante `@`)

Por tanto `@shared/ui` es indirectamente utilizado. Se clasifica como ACTIVO.

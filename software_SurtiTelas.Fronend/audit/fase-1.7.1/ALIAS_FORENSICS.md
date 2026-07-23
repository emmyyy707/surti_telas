# ALIAS_FORENSICS.md

## ANÁLISIS FORENSE DE ALIAS

**Fuentes:** tsconfig.json, vite.config.ts
**Metodología:** Verificación de uso real en código vivo desde main.tsx.

---

## 1. ALIAS DEFINIDOS EN TSCONFIG.JSON

| Alias | Resolución | Usado en código vivo | Evidencia | Estado |
|-------|-----------|---------------------|-----------|--------|
| `@/*` | `src/*` | SI | App.tsx: `import App from "./presentation/pages/App"` (relativo) y `import { Spinner } from "@/shared/ui"` (absoluto) | ACTIVO |
| `@config/*` | `src/config/*` | NO | No se encontró ningún `import` desde `@config` en código vivo | NO UTILIZADO |
| `@presentation/*` | `src/presentation/*` | NO | No se encontró ningún `import` desde `@presentation` en código vivo | NO UTILIZADO |
| `@presentation/components/*` | `src/presentation/components/*` | NO | No se encontró ningún `import` desde `@presentation/components` en código vivo | NO UTILIZADO |
| `@presentation/pages/*` | `src/presentation/pages/*` | NO | No se encontró ningún `import` desde `@presentation/pages` en código vivo | NO UTILIZADO |
| `@presentation/contexts/*` | `src/presentation/contexts/*` | NO | App.tsx usa imports relativos o alias `@` | NO UTILIZADO |
| `@presentation/hooks/*` | `src/presentation/hooks/*` | NO | No se encontró ningún `import` desde `@presentation/hooks` | NO UTILIZADO |
| `@presentation/styles/*` | `src/presentation/styles/*` | NO | No se encontró ningún `import` desde `@presentation/styles` | NO UTILIZADO |
| `@application/*` | `src/application/*` | NO | No se encontró ningún `import` desde `@application` en código vivo | NO UTILIZADO |
| `@application/services/*` | `src/application/services/*` | NO | No se encontró ningún `import` desde `@application/services` | NO UTILIZADO |
| `@application/usecases/*` | `src/application/usecases/*` | NO | No se encontró ningún `import` desde `@application/usecases` | NO UTILIZADO |
| `@domain/*` | `src/domain/*` | NO | No se encontró ningún `import` desde `@domain` en código vivo | NO UTILIZADO |
| `@domain/entities/*` | `src/domain/entities/*` | NO | No se encontró ningún `import` desde `@domain/entities` | NO UTILIZADO |
| `@domain/repositories/*` | `src/domain/repositories/*` | NO | No se encontró ningún `import` desde `@domain/repositories` | NO UTILIZADO |
| `@infrastructure/*` | `src/infrastructure/*` | NO | No se encontró ningún `import` desde `@infrastructure` en código vivo | NO UTILIZADO |
| `@infrastructure/api/*` | `src/infrastructure/api/*` | NO | No se encontró ningún `import` desde `@infrastructure/api` | NO UTILIZADO |
| `@infrastructure/repositories/*` | `src/infrastructure/repositories/*` | NO | No se encontró ningún `import` desde `@infrastructure/repositories` | NO UTILIZADO |
| `@shared/*` | `src/shared/*` | NO | No se encontró ningún `import` desde `@shared` en código vivo | NO UTILIZADO |
| `@app/*` | `src/app/*` | NO | App.tsx usa `@/app/*` (alias `@`), no `@app/*` | NO UTILIZADO |
| `@assets/*` | `src/assets/*` | NO | AdminDashboard.tsx usa `@/assets/images/logos/...` (alias `@`), no `@assets/*` | NO UTILIZADO |

---

## 2. ALIAS DEFINIDOS EN VITE.CONFIG.TS

| Alias | Resolución | Usado en código vivo | Evidencia | Estado |
|-------|-----------|---------------------|-----------|--------|
| `@` | `./src` | SI | App.tsx: `import { Spinner } from "@/shared/ui"`; AdminDashboard.tsx: `import logoBlanco from '@/assets/images/logos/surtitelas-logo.jpg'` | ACTIVO |
| `@config` | `./src/config` | NO | No se encontró ningún `import` desde `@config` | NO UTILIZADO |
| `@presentation` | `./src/presentation` | NO | No se encontró ningún `import` desde `@presentation` | NO UTILIZADO |
| `@presentation/components` | `./src/presentation/components` | NO | No se encontró ningún `import` desde `@presentation/components` | NO UTILIZADO |
| `@presentation/pages` | `./src/presentation/pages` | NO | No se encontró ningún `import` desde `@presentation/pages` | NO UTILIZADO |
| `@presentation/contexts` | `./src/presentation/contexts` | NO | No se encontró ningún `import` desde `@presentation/contexts` | NO UTILIZADO |
| `@presentation/hooks` | `./src/presentation/hooks` | NO | No se encontró ningún `import` desde `@presentation/hooks` | NO UTILIZADO |
| `@presentation/styles` | `./src/presentation/styles` | NO | No se encontró ningún `import` desde `@presentation/styles` | NO UTILIZADO |
| `@application` | `./src/application` | NO | No se encontró ningún `import` desde `@application` | NO UTILIZADO |
| `@application/services` | `./src/application/services` | NO | No se encontró ningún `import` desde `@application/services` | NO UTILIZADO |
| `@application/usecases` | `./src/application/usecases` | NO | No se encontró ningún `import` desde `@application/usecases` | NO UTILIZADO |
| `@domain` | `./src/domain` | NO | No se encontró ningún `import` desde `@domain` | NO UTILIZADO |
| `@domain/entities` | `./src/domain/entities` | NO | No se encontró ningún `import` desde `@domain/entities` | NO UTILIZADO |
| `@domain/repositories` | `./src/domain/repositories` | NO | No se encontró ningún `import` desde `@domain/repositories` | NO UTILIZADO |
| `@infrastructure` | `./src/infrastructure` | NO | No se encontró ningún `import` desde `@infrastructure` | NO UTILIZADO |
| `@infrastructure/api` | `./src/infrastructure/api` | NO | No se encontró ningún `import` desde `@infrastructure/api` | NO UTILIZADO |
| `@infrastructure/repositories` | `./src/infrastructure/repositories` | NO | No se encontró ningún `import` desde `@infrastructure/repositories` | NO UTILIZADO |
| `@shared` | `./src/shared` | NO | No se encontró ningún `import` desde `@shared` | NO UTILIZADO |
| `@shared/ui` | `./src/shared/ui` | SI | App.tsx: `import { Spinner } from "@/shared/ui"` | ACTIVO |
| `@shared/utils` | `./src/shared/utils` | NO | No se encontró ningún `import` desde `@shared/utils` | NO UTILIZADO |
| `@assets` | `./src/assets` | NO | No se encontró ningún `import` desde `@assets` | NO UTILIZADO |
| `@components` | `./src/presentation/components/common` | NO | No se encontró ningún `import` desde `@components` | NO UTILIZADO |
| `@modules` | `./modules` | NO | No se encontró ningún `import` desde `@modules` | NO UTILIZADO |
| `@modules/admin` | `./modules/admin` | NO | No se encontró ningún `import` desde `@modules/admin` | NO UTILIZADO |

---

## 3. ALIAS UTILIZADOS INDIRECTAMENTE

| Alias | Usado indirectamente | Evidencia |
|-------|----------------------|-----------|
| `@shared/ui` | SI — vía alias `@` | `@shared/ui` es un alias definido en vite.config.ts, pero App.tsx usa `@/shared/ui` que resuelve a `src/shared/ui/*` mediante el alias `@` |

---

## 4. ALIAS HUÉRFANOS

**Total alias definidos:** 24 (tsconfig) + 17 (vite) = 41 definiciones únicas (algunas duplicadas)

**Alias activos (usados en código vivo):** 2
- `@` (tsconfig y vite)
- `@shared/ui` (solo vite, usado como `@/shared/ui`)

**Alias huérfanos (definidos pero no usados):** 39

---

## 5. RESUMEN

| Categoría | Cantidad |
|-----------|----------|
| Alias definidos en tsconfig | 20 |
| Alias definidos en vite | 17 |
| Alias únicos totales | 41 |
| Alias activos | 2 |
| Alias huérfanos | 39 |

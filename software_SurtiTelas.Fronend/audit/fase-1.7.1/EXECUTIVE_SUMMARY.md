# EXECUTIVE_SUMMARY.md

## RESUMEN EJECUTIVO FORENSE — FASE 1.7.1

**Proyecto:** SurtiTelas ERP
**Fecha:** 2026-06-07
**Metodología:** Análisis estático de dependencias, imports, exports, rutas y bundle.
**Restricción:** Solo auditoría. Sin modificaciones.

---

## MÉTRICAS EXACTAS

| Métrica | Valor |
|---------|-------|
| Total archivos .tsx | 241 |
| Total archivos .ts | 32 |
| **Total archivos** | **273** |
| Archivos vivos | 49 |
| Archivos muertos | 145 |
| Archivos zombie | 15 |
| Archivos duplicados | 32 pares |
| Barrels vivos | 1 |
| Barrels muertos | 7 |
| Aliases activos | 2 |
| Aliases huérfanos | 39 |
| Dashboards vivos | 1 (compartido por 4 roles) |
| Dashboards muertos | 10 |

---

## GRAFO DE DEPENDENCIAS

```
main.tsx
 └── presentation/pages/App.tsx (VIVO)
      ├── 5 contexts (VIVO)
      ├── 5 páginas públicas (VIVO)
      ├── 2 páginas auth (VIVO)
      ├── 4 componentes públicos (VIVO)
      └── [LAZY] AdminDashboard + 7 módulos admin (VIVO)
           └── 21 módulos internos (VIVO)
```

---

## HALLAZGOS CLAVE

1. **Entrypoint único:** `src/main.tsx` → `src/presentation/pages/App.tsx`
2. **App paralela muerta:** `src/app/App.tsx` no es importada por main.tsx
3. **Dashboard único:** `AdminDashboard.tsx` sirve 4 roles mediante prop `userRole`
4. **Duplicación masiva:** 32 pares de archivos entre `app/components/` y `app/features/`
5. **Clean Architecture decorativa:** `domain/`, `application/`, `infrastructure/` sin participación en ejecución
6. **Barrel exports muertos:** 7 de 8 barrels no son consumidos
7. **Aliases huérfanos:** 39 de 41 alias definidos no se usan
8. **0 imports dinámicos ocultos:** Solo 8 `React.lazy` en App.tsx

---

## CLASIFICACIÓN FINAL

### VIVO (49 archivos)
- Entrypoints: main.tsx, App.tsx (presentation/pages/)
- Contexts: AuthContext, CartContext, CartDrawerContext, ThemeContext
- Rutas: ProtectedRoute
- Componentes públicos: Navbar, Footer, ScrollToTop, CartDrawer, CartItem, CartSummary
- UI base: shared/ui/* (16 componentes)
- Error boundary: ErrorBoundary.tsx
- AdminDashboard + 7 módulos lazy
- 21 módulos internos de AdminDashboard
- Config: menuConfig.ts
- Páginas: HomePage, AboutPage, LoginPage, RegisterPage
- Features públicas: CatalogPage, CartPage, ContactPage

### MUERTO (145 archivos)
- Duplicados en app/components/admin/* (12)
- Duplicados en app/components/common/* (25)
- Duplicados en app/components/domiciliario/* (2)
- Duplicados en app/components/asesor/* (2)
- Features zombies en app/features/common/* (30+)
- App paralela: app/App.tsx
- Landing duplicado: app/pages/SurtitelasLanding.tsx
- Clean Architecture: domain/*, application/*, infrastructure/* (7)
- Otros: hooks, types, components/layout, presentation/hooks

### ZOMBIE (15 archivos)
- Referenciados solo por código muerto
- No alcanzables desde main.tsx

---

## CONCLUSIONES

1. El proyecto tiene una arquitectura activa clara y estable.
2. Existe duplicación masiva de código sin uso.
3. La Clean Architecture es estructural, no funcional.
4. No se detectaron imports dinámicos ocultos ni factories.
5. La eliminación de ~145 archivos muertos es segura desde perspectiva forense.
6. No se recomienda eliminar archivos sin antes validar en ambiente de staging.

# Feature Layout Boundary

## Reglas para Layouts de Feature

1. **Aislamiento**: Cada feature puede tener su propio layout interno
2. **Ubicación**: `src/features/<feature>/layouts/`
3. **Composición**: Pueden usar componentes de `src/app/layouts/`
4. **No pueden**: Definir layouts globales de aplicación
5. **No pueden**: Ser importados por otros features

## Ejemplos

```
src/features/admin/layouts/AdminLayout.tsx
src/features/cliente/layouts/ClienteLayout.tsx
```

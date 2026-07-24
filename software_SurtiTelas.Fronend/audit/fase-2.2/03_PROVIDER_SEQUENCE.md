# 03_PROVIDER_SEQUENCE.md

## Providers involucrados

| Provider | Ruta actual | Destino | Depende de | Impacto |
|----------|-------------|---------|------------|---------|
| AuthProvider | src/presentation/contexts/AuthContext.tsx | src/app/providers/AppProviders.tsx | firebase/auth | Crítico |
| CartProvider | src/presentation/contexts/CartContext.tsx | src/app/providers/AppProviders.tsx | useState | Medio |
| CartDrawerProvider | src/presentation/contexts/CartDrawerContext.tsx | src/app/providers/AppProviders.tsx | CartContext | Medio |
| ThemeProvider | src/presentation/contexts/ThemeContext.tsx | src/app/providers/AppProviders.tsx | CSS vars | Bajo |
| ThemeProvider (DUPLICADO) | src/app/contexts/ThemeContext.tsx | ELIMINAR | — | Bajo |

## Secuencia

1. Consolidar `src/presentation/contexts/` en `src/app/providers/AppProviders.tsx`
2. Mantener el ThemeProvider de `src/presentation/` como canónico
3. Eliminar copia en `src/app/contexts/ThemeContext.tsx`
4. Actualizar `src/main.tsx` para apuntar a `src/app/providers/AppProviders.tsx`

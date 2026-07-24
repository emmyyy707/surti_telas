# 04_PROVIDER_VALIDATION.md

| Provider | Ruta | Existe | Importers | Estado |
|----------|------|--------|-----------|--------|
| AuthProvider | `src/presentation/contexts/AuthContext.tsx` | YES | 4 | OK |
| CartProvider | `src/presentation/contexts/CartContext.tsx` | YES | 2 | OK |
| CartDrawerProvider | `src/presentation/contexts/CartDrawerContext.tsx` | YES | 2 | OK |
| ThemeProvider | `src/presentation/contexts/ThemeContext.tsx` | YES | 4 | OK |
| ThemeProvider_DUP | `src/app/contexts/ThemeContext.tsx` | YES | 0 | OK |
| QueryClientProvider | `node_modules/@tanstack/react-query` | EXTERNAL | 1 | OK |

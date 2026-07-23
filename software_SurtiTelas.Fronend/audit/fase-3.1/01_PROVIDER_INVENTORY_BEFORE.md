# 01_PROVIDER_INVENTORY_BEFORE.md — Fase 3.1

## Proveedores React Context Detectados

### src/presentation/contexts/ (Origen)

| Archivo | Tipo | Exporta | Uso en App |
|---------|------|---------|------------|
| AuthContext.tsx | AuthProvider | useAuth, UserRole, AuthUser, LoginResult | Importado por AppProviders.tsx |
| ThemeContext.tsx | ThemeProvider | useTheme | Importado por AppProviders.tsx |
| CartContext.tsx | CartProvider | useCart, Product, CartItem | Importado por AppProviders.tsx |
| CartDrawerContext.tsx | CartDrawerProvider | useCartDrawer | Importado por AppProviders.tsx |

### src/app/providers/ (Destino)

| Archivo | Estado |
|---------|--------|
| AppProviders.tsx | EXISTE - importa de @presentation/contexts |

### src/app/contexts/ (Investigado según 02_WAVE_1_PROVIDERS.md)

| Archivo | Estado |
|--------|--------|
| ThemeContext.tsx | NO EXISTE (marcado para DELETE, ya no presente) |

### Duplicados Identificados

| Archivo | Acción |
|---------|--------|
| src/app/contexts/ThemeContext.tsx | NO EXISTE (ya eliminado previamente) |

### Dependencias

- AuthContext → firebase/auth, @config/firebase
- ThemeContext → localStorage, document.documentElement
- CartContext → react-hot-toast
- CartDrawerContext → sin dependencias externas

### Imports Actuales

- AppProviders.tsx usa: `@presentation/contexts/*` paths
- main.tsx → usa `<App />` sin providers directos
- App.tsx → usa `<AppProviders>`
# 08_DEPENDENCY_ORDER.md — Fase 3.0

## Orden de Dependencias (de hoja a raíz)

### 1. Capas de Infraestructura (más bajas)

```
domain/ → shared/
infrastructure/ → domain/, shared/
application/ → domain/, infrastructure/
```

### 2. Shared (dependencias universales)

```
shared/ui/ (sin dependencias de features)
shared/hooks/ (sin dependencias de features)
shared/utils/ (sin dependencias de features)
shared/types/ (sin dependencias de features)
shared/constants/ (sin dependencias de features)
```

### 3. Providers (dependen de shared e infrastructure)

```
app/providers/AppProviders.tsx
├── AuthProvider (depende de firebase)
├── CartProvider (hooks own)
├── CartDrawerProvider (depende de CartContext)
└── ThemeProvider (sin dependencias externas)
```

### 4. Routing

```
app/router/routes.tsx
├── protected routes (dependen de AuthContext)
├── public pages (dependen de features/public)
└── admin pages (dependen de features/admin)
```

### 5. App Shell

```
app/components/
├── Header.tsx (depende de shared/ui, providers)
├── Sidebar.tsx (depende de shared/ui)
├── Footer.tsx (sin dependencias)
└── Navbar.tsx (depende de shared/ui)
```

### 6. Features (dependen de shared, no de otras features)

```
features/
├── public/ (UI pública, depende de shared/ui)
├── admin/ (depende de shared/, domain/)
├── asesor/ (depende de shared/, domain/)
├── domiciliario/ (depende de shared/, domain/)
└── cliente/ (depende de shared/, domain/)
```

## Orden de Ejecución (Waves)

| Wave | Prioridad | Depende de |
|------|-----------|------------|
| 1 - Providers | ALTA | shared/ (mínima) |
| 2 - Shared | ALTA | Nada |
| 3 - Routing | MEDIA | Providers, Features |
| 4 - UI | BAJA | shared/ui canónico |
| 5 - Features | ALTA | Providers, Shared, Routing |
| 6 - Cleanup | BAJA | Todas las anteriores |

## Reglas de Import

### Permitido

- `app/` → `shared/`, `features/`, `infrastructure/`
- `features/` → `shared/`, `domain/`
- `infrastructure/` → `domain/`, `shared/`
- `domain/` → `shared/`

### Prohibido

- `shared/` → `features/`, `app/`, `domain/`, `infrastructure/`
- `domain/` → `app/`, `features/`, `infrastructure/`
- `features/` → `features/` (entre sí)
- `infrastructure/` → `app/`
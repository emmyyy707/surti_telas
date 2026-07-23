# Canonical Structure — Fase 2.1

## Estructura Canónica Definitiva

```
src/
├── main.tsx                          # Entry point único
├── vite-env.d.ts                     # Referencia Vite
├── app/
│   ├── providers/                    # Proveedores consolidados
│   │   └── AppProviders.tsx          # Auth, Cart, CartDrawer, Theme
│   └── router/
│       └── routes.tsx                # Definición de rutas
├── features/                         # Módulos de negocio (por rol)
│   ├── admin/
│   │   ├── components/
│   │   ├── hooks/
│   │   └── services/
│   ├── asesor/
│   │   ├── components/
│   │   ├── hooks/
│   │   └── services/
│   ├── domiciliario/
│   │   ├── components/
│   │   ├── hooks/
│   │   └── services/
│   └── cliente/
│       ├── components/
│       ├── hooks/
│       └── services/
├── shared/                           # Código compartido global
│   ├── ui/                           # Componentes UI universales
│   ├── hooks/                        # Hooks globales
│   ├── utils/                        # Utilidades
│   ├── types/                        # Tipos compartidos
│   └── constants/                    # Constantes
├── domain/                           # Entidades y reglas de negocio
│   ├── entities/
│   └── repositories/
├── infrastructure/                   # Implementaciones técnicas
│   ├── api/
│   ├── repositories/
│   └── config/
└── assets/                           # Imágenes estáticas
    ├── images/
    └── icons/
```

## Decisiones Tomadas

1. **`src/app/`** como directorio de orquestación únicamente (providers + router)
2. **`src/presentation/`** se absorbe en `src/app/` (no sobrevive como directorio independiente)
3. **`src/features/`** como directorio principal de módulos de negocio
4. **`src/shared/`** como librería compartida global
5. **`src/domain/`, `src/infrastructure/`, `src/application/`** se mantienen en su lugar
6. **`src/config/`, `src/hooks/`, `src/types/`** se mueven a `src/shared/`
7. **`src/components/layout/`** se mueve a `src/features/public/components/`

# Current Architecture — Fase 2.0

## Estructura Actual (Resumen)

```
src/
├── main.tsx                          # Entry point producción
├── app/
│   ├── App.tsx                       # Entry point alternativo (login/landing)
│   ├── MODO_EXPORTACION.tsx          # Modo Figma (NO producción)
│   ├── components/                   # DUPLICADO - Componentes UI genéricos
│   │   ├── ui/                       # 50+ componentes UI duplicados
│   │   ├── admin/                    # DUPLICADO - Módulos admin
│   │   ├── asesor/                   # DUPLICADO - Módulos asesor
│   │   ├── cliente-role/             # DUPLICADO - Módulos cliente
│   │   └── domiciliario/             # DUPLICADO - Módulos domiciliario
│   ├── features/                     # DUPLICADO - Features duplicados
│   │   ├── admin/                    # DUPLICADO
│   │   ├── asesor/                   # DUPLICADO
│   │   ├── cliente/                  # DUPLICADO
│   │   ├── domiciliario/             # DUPLICADO
│   │   ├── common/                   # DUPLICADO - Componentes comunes
│   │   └── figma/                    # DUPLICADO - Utilidades Figma
│   ├── contexts/                     # ThemeContext DUPLICADO
│   └── config/                       # menuConfig (solo aquí)
├── presentation/                     # ARBOL PRINCIPAL (el que funciona)
│   ├── pages/App.tsx                 # Router principal
│   ├── contexts/                     # Auth, Cart, CartDrawer, Theme (DUPLICADO Theme)
│   ├── components/                   # Componentes específicos
│   ├── routes/ProtectedRoute.tsx
│   └── hooks/useTelas.ts
├── shared/                           # UI library + utils
│   ├── ui/                           # 17 componentes UI
│   └── utils/
├── components/                       # Layout (OUTSIDE src/app/)
│   └── layout/
├── domain/                           # Clean Architecture (OUTSIDE src/)
├── infrastructure/                   # Clean Architecture (OUTSIDE src/)
├── application/                      # Clean Architecture (OUTSIDE src/)
├── config/                           # Firebase (OUTSIDE src/)
├── hooks/                            # usePagination (OUTSIDE src/)
├── types/                            # auth.types (DUPLICADO con src/shared/)
└── assets/                           # Imágenes
```

## Problemas Detectados

### 1. Duplicación Masiva

- **73 archivos duplicados por nombre** entre `src/app/components/`, `src/app/features/common/`, y `src/presentation/`
- Cada página/cartalog/carrito/contacto/about/login existe 2-3 veces

### 2. Capas Mezcladas

- Clean Architecture (`domain/`, `application/`, `infrastructure/`) **fuera de `src/`**
- Lógica de presentación en `src/app/` junto con componentes UI
- Servicios en `src/app/` separados de la feature que los usa

### 3. Dependencias Invertidas

- `src/app/components/ui/` duplica `src/shared/ui/`
- 0 componentes UI duplicados entre ambas carpetas
- Features importan desde múltiples capas sin restricción

### 4. Entry Points Múltiples

- 3 entry points detectados
  - `src\main.tsx`
  - `src\app\App.tsx`
  - `src\app\MODO_EXPORTACION.tsx`
- Solo `src/main.tsx` es el entry point de producción
- `src/app/App.tsx` es flujo alternativo (login/landing)
- `src/app/MODO_EXPORTACION.tsx` es modo Figma

### 5. Contextos Duplicados

- 1 contextos duplicados detectados
  - `ThemeContext.tsx` en `src\app\contexts\ThemeContext.tsx` y `src\presentation\contexts\ThemeContext.tsx`

### 6. UI Libraries Duplicadas

- `src/app/components/ui/` (50+ componentes)
- `src/shared/ui/` (17 componentes)
- Ambas exportan Badge, Button, Card, Dialog, etc.

## Responsabilidades por Capa

| Capa | Archivos | Responsabilidad |
|------|----------|------------------|
| other | 246 | Other layer |
| presentation | 27 | Presentation layer |

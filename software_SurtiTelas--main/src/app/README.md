# Surtitelas ERP - Clean Architecture

## Estructura Implementada

### Capas de Clean Architecture

#### 1. Core Layer (`src/app/core/`)
- Entidades del dominio
- Interfaces de repositorios
- Use cases (casos de uso)

#### 2. Shared Layer (`src/app/shared/`)
- `ui/` - Componentes de UI reutilizables
- `types/` - Tipos compartidos
- `api/` - Capa de API/servicios

#### 3. Features Layer (`src/app/features/`)
Organizado por rol de usuario:
- `admin/` - Módulos de administrador
- `asesor/` - Módulos de asesor
- `domiciliario/` - Módulos de domiciliario
- `cliente/` - Módulos de cliente
- `landing/` - Página de inicio

#### 4. Components Layer (`src/app/components/`)
- `ui/` - Componentes shadcn/ui
- `admin/`, `asesor/`, etc. - Componentes específicos

### Correcciones Realizadas

1. **Importaciones rotas en `components/dashboard/`**:
   - `KPICard.tsx` - Importado desde `../../app/components/ui/`
   - `DashboardSidebar.tsx` - Importado desde `../../app/components/ui/`
   - `DashboardHeader.tsx` - Importado desde `../../app/components/ui/`
   - `ActivityWidget.tsx`, `TopProductsWidget.tsx`, `RecentOrdersTable.tsx`, `RevenueChart.tsx`, `OrdersChart.tsx`

2. **Importaciones con versiones**:
   - Removidos sufijos de versión de todos los imports (`@radix-ui/...@1.1.2` â†’ `@radix-ui/...`)
   - Ejemplo: `class-variance-authority@0.7.1` â†’ `class-variance-authority`

3. **AdminDashboard.tsx**:
   - Mantenido el archivo en `pages/` con imports corregidos

### Uso de Tipos

```typescript
// Tipos del dashboard
import { NotificationItem, OrderSummary, RevenueChartData } from '../../types/dashboard';

// Tipos de la aplicación
import { Product, Order, Customer } from '../../app/types';
```

### Scripts Disponibles

- `npm run dev` - Desarrollo local
- `npm run build` - Build de producción
- `npm run preview` - Preview del build


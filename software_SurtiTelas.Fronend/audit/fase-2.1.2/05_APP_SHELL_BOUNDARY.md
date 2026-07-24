# App Shell Boundary

## `src/app/layouts/`

Layouts globales de aplicación:

- DashboardLayout: Layout base para dashboards
- PublicLayout: Layout para páginas públicas
- AuthLayout: Layout para páginas de autenticación

## `src/app/components/`

Componentes estructurales del shell:

- Header: Barra superior de aplicación
- Sidebar: Barra lateral de navegación
- Footer: Pie de página
- Navbar: Barra de navegación superior
- NavigationBar: Navegación horizontal
- BottomNavigation: Navegación inferior (mobile)

## Prohibido en `src/app/`

- Componentes específicos de feature
- Componentes de UI genéricos (van a `src/shared/ui/`)
- Lógica de negocio

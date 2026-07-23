# Shared Components — Fase 2.0

## Clasificación

### GLOBAL_SHARED (src/shared/ui/)

Componentes UI universales usados en toda la aplicación:

| Componente | Uso |
|------------|-----|
| Alert | Notificaciones |
| Avatar | User avatars |
| Badge | Etiquetas |
| Button | Botones |
| Card | Contenedores |
| Drawer | Paneles laterales |
| DropdownMenu | Menús |
| EmptyState | Estados vacíos |
| Input | Campos de entrada |
| Modal | Diálogos |
| Pagination | Paginación |
| Select | Selectores |
| Skeleton | Loading |
| Spinner | Carga |
| StatsCard | Métricas |
| Table | Tablas |
| Tabs | Pestañas |

### FEATURE_SHARED (src/features/*/components/ui/)

Componentes específicos de una feature (si aplica):

- Admin: AdminDashboard, ClientesModule, etc.
- Asesor: ComisionesModule, MisClientesModule
- Domiciliario: EntregasModule, RutasModule
- Cliente: CatalogoCliente, MisPedidosCliente, etc.

### LOCAL_COMPONENT (src/presentation/components/)

Componentes específicos de páginas públicas:

- CartDrawer, CartItem, CartSummary
- CheckoutModal, ProductDetailModal, ProductModal
- TelaList
- ScrollToTop

## Acciones Requeridas

1. Eliminar `src/app/components/ui/` (50+ duplicados)
2. Mantener `src/shared/ui/` como fuente de verdad
3. Mover componentes locales a `src/features/public/components/`
4. Consolidar componentes duplicados en `src/features/*/`

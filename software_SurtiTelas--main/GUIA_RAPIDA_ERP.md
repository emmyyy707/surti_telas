# ðŸš€ Guía Rápida - Sistema ERP

## Archivos Principales

```
src/presentation/components/admin/
â”œâ”€â”€ ERPComponents.tsx      â† Componentes reutilizables (220+ líneas)
â”œâ”€â”€ ERPModulesNew.tsx      â† Lógica de los 10 módulos (1000+ líneas)
â””â”€â”€ ERPViews.tsx           â† Vistas para integración
```

---

## âš¡ Inicio Rápido

### 1. Usar un Módulo Individual

```tsx
import { VentasModule } from './components/admin/ERPModulesNew';

function MyPage() {
  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <VentasModule />
    </div>
  );
}
```

### 2. Usar en AdminDashboard

```tsx
import { ERPModules, moduleConfig } from './components/admin/ERPViews';

export const AdminDashboard = () => {
  const [activeModule, setActiveModule] = useState('ventas');
  const Component = ERPModules[`${activeModule}View`];

  return <Component />;
};
```

### 3. Usar Componentes Individuales

```tsx
import {
  KpiCard,
  ModuleHeader,
  FilterBar,
  DataTable,
  Pagination,
  StatusBadge,
  FormInput,
  Modal
} from './components/admin/ERPComponents';

// Usar en tu componente
```

---

## ðŸ“Š Los 10 Módulos

| # | Módulo | Exporta | Estado |
|---|--------|---------|--------|
| 1 | Configuración/Roles | `ConfiguracionRolesModule` | âœ… Completo |
| 2 | Usuarios | `UsuariosModule` | âœ… Completo |
| 3 | Compras | `ComprasModule` | âœ… Completo |
| 4 | Insumos | `InsumosModule` | âœ… Completo |
| 5 | Ventas | `VentasModule` | âœ… Completo |
| 6 | Abonos | `AbonasModule` | âœ… Completo |
| 7 | Devoluciones | `DevolucionesModule` | âœ… Completo |
| 8 | Producción | `ProduccionModule` | âœ… Completo |
| 9 | Pedidos & Domicilios | `PedidosDomiciliosModule` | âœ… Completo |

---

## ðŸŽ¯ Características por Módulo

### Configuración - Roles
- [x] CRUD de roles
- [x] Asignación de permisos (checkboxes)
- [x] Vista de permisos en chips
- [x] Modal de detalles
- [x] Confirmación antes de eliminar
- [x] Métricas: Total, Activos, Permisos

### Usuarios
- [x] CRUD de usuarios
- [x] Avatar con iniciales
- [x] Colores de rol personalizados
- [x] Última conexión
- [x] Vista completa de perfil
- [x] Filtro por estado
- [x] Métricas: Total, Activos, Conectados Hoy

### Compras
- [x] Gestión de compras a proveedores
- [x] Seguimiento por referencia
- [x] Estados: Pendiente, Proceso, Recibido, Cancelado
- [x] Búsqueda por proveedor
- [x] Métricas: Total, Total Invertido, En Proceso

### Insumos
- [x] Inventario de materiales
- [x] Alerta automática de stock bajo
- [x] Valor total del inventario
- [x] Búsqueda por categoría
- [x] Niveles mínimos
- [x] Métricas: Stock bajo, Valor total

### Ventas
- [x] Gestión de órdenes de venta
- [x] Tipo de pago: Contado/Abono/Crédito
- [x] Estados: Pendiente, Confirmada, Entregada, Cancelada
- [x] Ingresos totales
- [x] Métricas: Total, Ingresos, Pendientes

### Abonos
- [x] Seguimiento de pagos
- [x] Cálculo de saldo pendiente
- [x] Próximo vencimiento
- [x] Estados: Pagado, Impago, Pago Parcial
- [x] Alertas de pagos vencidos
- [x] Métricas: Cobrado, Pendiente, Vencidos

### Devoluciones
- [x] Gestión de devoluciones
- [x] Motivo de devolución
- [x] Cálculo de reembolsos
- [x] Estados: Solicitada, Aprobada, Rechazada, Completada
- [x] Métricas: Total reembolsos, Items devueltos

### Producción
- [x] Órdenes de producción
- [x] Etapas: Corte, Confección, Estampado, Calidad, Empaque
- [x] Asignación a talleres
- [x] Estados: Pendiente, En Proceso, Completado, Retrasado
- [x] Métricas: Total órdenes, En proceso, Retrasadas

### Pedidos & Domicilios
- [x] Gestión de pedidos
- [x] Direcciones de entrega
- [x] Asignación de repartidor
- [x] Estados de entrega
- [x] Búsqueda por cliente
- [x] Métricas: Total, En tránsito, Entregados

---

## ðŸŽ¨ Estructura de Componentes

### KpiCard
```tsx
<KpiCard
  icon={<Users size={20} />}
  value={100}
  label="Total"
  color="#3B82F6"
  trend={15}
  loading={false}
/>
```

### ModuleHeader
```tsx
<ModuleHeader
  title="Gestión de Ventas"
  description="Control de ventas..."
  primaryAction={{ label: 'Nuevo', onClick: handleNew }}
  secondaryAction={{ label: 'Exportar', onClick: handleExport }}
  tertiaryAction={{ label: 'Actualizar', onClick: handleRefresh }}
/>
```

### FilterBar
```tsx
<FilterBar
  filters={filters}
  onFilterChange={(k, v) => setFilters({ ...filters, [k]: v })}
  onClear={() => setFilters(initialFilters)}
  placeholder="Buscar..."
  statusOptions={[
    { value: 'activo', label: 'Activo' }
  ]}
/>
```

### DataTable
```tsx
<DataTable
  columns={[
    { key: 'id', label: 'ID', width: '100px' },
    { key: 'name', label: 'Nombre', render: (val) => <strong>{val}</strong> }
  ]}
  data={data}
  onView={handleView}
  onEdit={handleEdit}
  onDelete={handleDelete}
/>
```

### Pagination
```tsx
<Pagination
  pagination={pagination}
  onPageChange={(p) => setPagination({ ...pagination, page: p })}
  onPageSizeChange={(s) => setPagination({ ...pagination, pageSize: s })}
/>
```

### StatusBadge
```tsx
<StatusBadge status="activo" />
<StatusBadge status="pendiente" variant="large" />
```

### Modal
```tsx
<Modal
  isOpen={isOpen}
  onClose={handleClose}
  title="Título"
  subtitle="Subtítulo"
  size="lg"
>
  {/* Contenido */}
</Modal>
```

### FormInput
```tsx
<FormInput
  label="Email"
  value={email}
  onChange={setEmail}
  type="email"
  required
  error={emailError}
/>
```

### FormSelect
```tsx
<FormSelect
  label="Rol"
  value={role}
  onChange={setRole}
  options={[
    { value: 'admin', label: 'Administrador' }
  ]}
  required
/>
```

### FormTextarea
```tsx
<FormTextarea
  label="Descripción"
  value={description}
  onChange={setDescription}
  rows={4}
  required
/>
```

### ConfirmationDialog
```tsx
<ConfirmationDialog
  isOpen={isOpen}
  title="Eliminar"
  message="Â¿Estás seguro?"
  confirmLabel="Eliminar"
  isDangerous
  isLoading={isDeleting}
  onConfirm={handleDelete}
  onCancel={handleCancel}
/>
```

---

## ðŸ”„ Flujo de Datos Típico

```
State (datos local)
    â†“
FilterBar (búsqueda/filtros)
    â†“
useMemo (filtrados)
    â†“
useMemo (paginados)
    â†“
DataTable (renderizar)
    â†“
Acciones (Ver/Editar/Eliminar)
    â†“
Modal (formulario o detalle)
    â†“
State actualizado
```

---

## ðŸ“ Agregar Nuevo Módulo

1. Crear interfaz de datos:
```tsx
interface MiModulo {
  id: string;
  name: string;
  status: 'activo' | 'inactivo';
  createdAt: string;
}
```

2. Crear módulo:
```tsx
export const MiModuloModule: React.FC = () => {
  const [datos, setDatos] = useState<MiModulo[]>([]);
  const [pagination, setPagination] = useState({ page: 1, pageSize: 10, total: 0 });
  const [filters, setFilters] = useState({ search: '', status: '' });

  // Lógica CRUD...

  return (
    <div className="space-y-6">
      <ModuleHeader title="Mi Módulo" description="Descripción..." />
      <div className="grid grid-cols-4 gap-6">
        {/* KPIs */}
      </div>
      <FilterBar {...filterProps} />
      <DataTable {...tableProps} />
      <Pagination {...paginationProps} />
      <Modal {...modalProps}>{/* Formulario */}</Modal>
    </div>
  );
};
```

3. Exportar en ERPViews.tsx

---

## âœ¨ Colores por Módulo

| Módulo | Color |
|--------|-------|
| Configuración | #3B82F6 (Azul) |
| Usuarios | #10B981 (Verde) |
| Compras | #8B5CF6 (Púrpura) |
| Insumos | #F59E0B (Naranja) |
| Ventas | #EC4899 (Rosa) |
| Abonos | #06B6D4 (Cyan) |
| Devoluciones | #EF4444 (Rojo) |
| Producción | #14B8A6 (Teal) |
| Pedidos | #F97316 (Naranja fuerte) |

---

## ðŸŽ¯ Próximas Mejoras

- [ ] Conectar con API real
- [ ] Agregar gráficas/charts
- [ ] Exportar a PDF/Excel
- [ ] Reportes avanzados
- [ ] Búsqueda avanzada
- [ ] Filtros guardados
- [ ] Historial/auditoría
- [ ] Notificaciones en tiempo real
- [ ] Integración con WhatsApp/Email
- [ ] Backup automático

---

## ðŸ› Troubleshooting

### Problema: "formatCurrency no está definido"
**Solución:** Importar desde ERPComponents
```tsx
import { formatCurrency, formatDate } from './ERPComponents';
```

### Problema: Tabla no se filtra
**Solución:** Asegúrate de usar `useMemo` correctamente
```tsx
const filteredData = useMemo(() => {
  return data.filter(/* condiciones */);
}, [data, filters]);
```

### Problema: Modal no cierra
**Solución:** Pasa `isOpen` correctamente
```tsx
<Modal isOpen={showModal} onClose={() => setShowModal(false)}>
```

---

## ðŸ“ž Soporte

Para reportar bugs o sugerencias:
1. Revisar la documentación completa en `ERP_DOCUMENTACION.md`
2. Verificar ejemplo de integración en `ADMIN_DASHBOARD_EJEMPLO.tsx`
3. Revisar código fuente en `ERPModulesNew.tsx`

---

**Última actualización:** 22 de abril de 2024
**Versión:** 1.0.0



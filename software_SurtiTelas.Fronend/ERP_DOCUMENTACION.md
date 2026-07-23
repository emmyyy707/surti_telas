# ðŸ“Š Sistema ERP - Documentación Completa

## Visión General

Sistema ERP moderno y profesional para **SurtiCamisetas** con 10 módulos completamente integrados, construido con React + TypeScript + Tailwind CSS.

---

## ðŸ—ï¸ Estructura del Proyecto

```
src/presentation/components/admin/
â”œâ”€â”€ ERPComponents.tsx          # Componentes reutilizables
â”œâ”€â”€ ERPModulesNew.tsx          # Lógica de módulos ERP (10 módulos)
â””â”€â”€ ERPViews.tsx               # Vistas para integración en AdminDashboard
```

---

## ðŸ“¦ Componentes Reutilizables

Todos los módulos utilizan componentes compartidos de `ERPComponents.tsx`:

### 1. **KpiCard**
Card de métrica superior para KPI. Muestra valor, label e ícono.

```tsx
<KpiCard
  icon={<Users size={20} />}
  value={usuarios.length}
  label="Total Usuarios"
  color="#3B82F6"
  trend={15}
/>
```

**Props:**
- `icon`: React.ReactNode
- `value`: string | number
- `label`: string
- `color?`: string (hex color)
- `trend?`: number (% de cambio)
- `loading?`: boolean
- `onClick?`: () => void

---

### 2. **ModuleHeader**
Header de cada módulo con título, descripción y acciones.

```tsx
<ModuleHeader
  title="Gestión de Usuarios"
  description="Administra usuarios, roles y accesos"
  primaryAction={{ label: 'Nuevo Usuario', onClick: handleCreate }}
  secondaryAction={{ label: 'Exportar', onClick: handleExport }}
  tertiaryAction={{ label: 'Actualizar', onClick: handleRefresh }}
/>
```

**Props:**
- `title`: string
- `description`: string
- `primaryAction?`: { label: string; onClick: () => void; icon?: React.ReactNode }
- `secondaryAction?`: { label: string; onClick: () => void; icon?: React.ReactNode }
- `tertiaryAction?`: { label: string; onClick: () => void; icon?: React.ReactNode }

---

### 3. **FilterBar**
Barra de filtros y búsqueda con estado reactivo.

```tsx
<FilterBar
  filters={filters}
  onFilterChange={(k, v) => setFilters({ ...filters, [k]: v })}
  onClear={() => setFilters({ search: '', status: '' })}
  placeholder="Buscar usuarios..."
  statusOptions={[
    { value: 'activo', label: 'Activos' },
    { value: 'inactivo', label: 'Inactivos' }
  ]}
/>
```

---

### 4. **DataTable**
Tabla profesional con soporte para acciones (ver, editar, eliminar).

```tsx
<DataTable
  columns={[
    { key: 'id', label: 'ID', width: '100px' },
    { key: 'name', label: 'Nombre', render: (val) => <strong>{val}</strong> }
  ]}
  data={datos}
  onView={(row) => console.log('Ver:', row)}
  onEdit={(row) => console.log('Editar:', row)}
  onDelete={(row) => console.log('Eliminar:', row)}
  isLoading={isLoading}
  selectableRows={true}
  selectedRows={selectedRows}
  onRowSelect={(id, selected) => handleSelect(id, selected)}
/>
```

---

### 5. **Pagination**
Paginador completo con controles de página y tamaño.

```tsx
<Pagination
  pagination={pagination}
  onPageChange={(p) => setPagination({ ...pagination, page: p })}
  onPageSizeChange={(s) => setPagination({ ...pagination, pageSize: s })}
/>
```

---

### 6. **StatusBadge**
Badge de estado con color según tipo.

```tsx
<StatusBadge status="activo" />
<StatusBadge status="pendiente" variant="large" />
```

**Estados soportados:**
- `activo` - Verde
- `inactivo` - Gris
- `pendiente` - Amarillo
- `proceso` - Azul
- `completado` - Verde
- `cancelado` - Rojo
- `recibido` - Verde
- `enviado` - Azul
- `entregado` - Verde
- `aprobada` - Verde
- `rechazada` - Rojo
- `pagado` - Verde
- `impago` - Rojo
- `parcial` - Amarillo

---

### 7. **Modal**
Modal profesional para formularios y detalles.

```tsx
<Modal
  isOpen={showModal}
  onClose={() => setShowModal(false)}
  title="Nuevo Usuario"
  subtitle="Crea una nueva cuenta"
  size="lg"
>
  {/* Contenido */}
</Modal>
```

---

### 8. **Form Inputs**
Componentes de formulario validados:

```tsx
<FormInput
  label="Email"
  value={email}
  onChange={setEmail}
  type="email"
  required
  error={emailError}
/>

<FormSelect
  label="Rol"
  value={selectedRole}
  onChange={setSelectedRole}
  options={roleOptions}
  required
/>

<FormTextarea
  label="Descripción"
  value={description}
  onChange={setDescription}
  rows={4}
  required
/>
```

---

### 9. **ConfirmationDialog**
Diálogo de confirmación para acciones peligrosas.

```tsx
<ConfirmationDialog
  isOpen={showConfirm}
  title="Eliminar Usuario"
  message="Â¿Estás seguro de que deseas eliminar a este usuario?"
  confirmLabel="Eliminar"
  isDangerous
  isLoading={isDeleting}
  onConfirm={handleDelete}
  onCancel={() => setShowConfirm(false)}
/>
```

---

## ðŸŽ¯ Los 10 Módulos ERP

### 1. **Configuración - Gestión de Roles**
**Archivo:** `ConfiguracionRolesModule`
**Columnas tabla:**
- ID
- Nombre
- Descripción
- Permisos (chips)
- Estado
- Usuarios Asignados

**KPIs:**
- Total Roles
- Usuarios Asignados
- Roles Activos
- Permisos Totales

**CRUD Completo:**
- âœ… Crear rol
- âœ… Editar rol
- âœ… Ver detalles
- âœ… Eliminar rol

---

### 2. **Usuarios**
**Archivo:** `UsuariosModule`
**Columnas tabla:**
- ID
- Nombre (con avatar)
- Email
- Rol (con badge de color)
- Estado
- Última Conexión

**KPIs:**
- Total Usuarios
- Usuarios Activos
- Roles
- Conectados Hoy

**CRUD Completo:**
- âœ… Crear usuario
- âœ… Editar usuario
- âœ… Ver detalles completos
- âœ… Eliminar usuario

---

### 3. **Compras**
**Archivo:** `ComprasModule`
**Columnas tabla:**
- Referencia (ID)
- Proveedor
- Items (cantidad)
- Total (con formato moneda)
- Fecha
- Estado

**KPIs:**
- Total Compras
- Total Invertido
- En Proceso
- Recibidas

**Estados:**
- `pendiente` - Amarillo
- `proceso` - Azul
- `recibido` - Verde
- `cancelado` - Rojo

---

### 4. **Insumos**
**Archivo:** `InsumosModule`
**Columnas tabla:**
- Nombre
- Categoría
- Stock (con mínimo)
- Precio Unitario
- Estado (basado en nivel de stock)

**KPIs:**
- Total Insumos
- Items en Stock
- Stock Bajo (alerta)
- Valor Total Stock

**Features:**
- Alerta automática cuando stock â‰¤ mínimo
- Búsqueda por nombre y categoría

---

### 5. **Ventas**
**Archivo:** `VentasModule`
**Columnas tabla:**
- ID Venta
- Cliente
- Total
- Tipo (Contado/Abono/Crédito)
- Estado
- Fecha

**KPIs:**
- Total Ventas
- Ingresos Totales
- Pendientes
- Ventas Contado

**Filtros:**
- Por estado
- Por tipo de pago
- Búsqueda por cliente

---

### 6. **Abonos**
**Archivo:** `AbonasModule`
**Columnas tabla:**
- Cliente
- Monto Abonado
- Saldo Pendiente
- Estado
- Próximo Vencimiento

**KPIs:**
- Total Abonos
- Total Cobrado
- Saldo Pendiente
- Pagos Vencidos

**Estados:**
- `pagado` - Verde
- `impago` - Rojo
- `parcial` - Amarillo

---

### 7. **Devoluciones**
**Archivo:** `DevolucionesModule`
**Columnas tabla:**
- ID Devolución
- Pedido Original
- Cliente
- Motivo
- Estado

**KPIs:**
- Total Devoluciones
- Reembolsos Totales
- Por Revisar
- Items Devueltos

**Estados:**
- `solicitada` - Azul
- `aprobada` - Verde
- `rechazada` - Rojo
- `completada` - Verde

---

### 8. **Producción**
**Archivo:** `ProduccionModule`
**Columnas tabla:**
- Pedido
- Etapa (Corte/Confección/Estampado/Calidad)
- Taller
- Cantidad
- Estado
- Entrega Estimada

**KPIs:**
- Órdenes Totales
- En Proceso
- Items en Producción
- Retrasadas

**Etapas:**
- `corte` - Azul
- `confección` - Púrpura
- `estampado` - Naranja
- `calidad` - Verde
- `empaque` - Gris

---

### 9. **Pedidos & Domicilios**
**Archivo:** `PedidosDomiciliosModule`
**Columnas tabla:**
- Pedido (ID)
- Cliente
- Total
- Dirección
- Repartidor
- Estado

**KPIs:**
- Total Pedidos
- Valor Total
- En Tránsito
- Entregados

**Estados:**
- `confirmado` - Azul
- `en tránsito` - Naranja
- `entregado` - Verde
- `pendiente` - Amarillo

---

## ðŸŽ¨ Diseño Visual

### Colores Globales
```
- Fondo app: #F5F6FA
- Cards: Blanco + shadow-sm
- Texto primario: #111827 (gray-900)
- Texto secundario: #6B7280 (gray-500)
- Azul primario: #3B82F6
- Bordes: rounded-xl
```

### Espaciado
```
- Gap entre elementos: gap-6
- Padding cards: p-6
- Padding tabla: py-4 px-6
```

### Transiciones
```
- transition-all duration-300
- transition-colors duration-200
```

---

## ðŸš€ Cómo Integrar en AdminDashboard

Actualiza `AdminDashboard.tsx` para usar las vistas:

```tsx
import { moduleConfig } from './ERPViews';

const AdminDashboard = () => {
  const [activeModule, setActiveModule] = useState('configuracion');

  const activeModuleConfig = moduleConfig[activeModule as keyof typeof moduleConfig];
  const Component = activeModuleConfig?.component;

  return (
    <div>
      {/* Sidebar con módulos */}
      <div className="flex">
        <aside className="w-64 bg-white shadow-sm">
          {Object.values(moduleConfig).map((module) => (
            <button
              key={module.id}
              onClick={() => setActiveModule(module.id)}
              className={`w-full text-left px-4 py-3 ${
                activeModule === module.id
                  ? 'bg-blue-50 border-l-4 border-blue-600 font-semibold'
                  : 'hover:bg-gray-50'
              }`}
            >
              {module.name}
            </button>
          ))}
        </aside>

        {/* Contenido del módulo */}
        <main className="flex-1">
          {Component && <Component />}
        </main>
      </div>
    </div>
  );
};
```

---

## ðŸ“Š Estructura de Datos

### Ejemplo - Usuario
```tsx
interface Usuario {
  id: string;                    // "USR-001"
  name: string;                  // "Pedro Martínez"
  email: string;                 // "pedro@..."
  phone: string;                 // "3001112233"
  rol: string;                   // "Vendedor"
  status: 'activo' | 'inactivo'; // "activo"
  lastLogin: string;             // "2024-04-22"
  createdAt: string;             // "2024-02-15"
}
```

### Ejemplo - Venta
```tsx
interface Venta {
  id: string;                                    // "VEN-001"
  cliente: string;                               // "Tienda Pepe"
  total: number;                                 // 850000
  status: 'pendiente' | 'confirmada' | ... ;    // "confirmada"
  fecha: string;                                 // "2024-04-22"
  tipo: 'contado' | 'abono' | 'crédito';        // "contado"
  items: number;                                 // 5
  vendedor: string;                              // "Pedro"
}
```

---

## ðŸ”§ Utilities Disponibles

### `formatCurrency(value: number): string`
Formatea número a moneda COP

```tsx
formatCurrency(2500000) // "$ 2.500.000"
```

### `formatDate(date: string): string`
Formatea fecha en formato corto

```tsx
formatDate("2024-04-22") // "22 de abr. de 2024"
```

### `formatDateTime(date: string): string`
Formatea fecha con hora

---

## ðŸŽ¯ Características Clave

âœ… **Consistencia Visual**
- Mismo patrón en todos los módulos
- Colores y espaciado uniforme
- Animaciones suaves

âœ… **Funcionalidad Completa**
- CRUD operations en todos los módulos
- Búsqueda y filtros
- Paginación profesional

âœ… **UX Moderno**
- Modales centralizados
- Confirmaciones antes de eliminar
- Toast notifications
- Validación de formularios

âœ… **Responsive Design**
- Funciona en mobile/tablet/desktop
- Tablas horizontales en mobile

âœ… **Performance**
- Componentes memoizados
- Paginación eficiente
- Lazy loading listo

---

## ðŸ“ Próximos Pasos

1. **Conectar con Backend:**
   - Reemplazar mock data con APIs reales
   - Agregar manejo de errores

2. **Autenticación:**
   - Validar permisos de usuario
   - Controlar acceso por rol

3. **Reportes:**
   - Exportar a PDF/Excel
   - Gráficas de analytics

4. **Notificaciones:**
   - Integrar sistema de alertas
   - Websockets para tiempo real

---

## ðŸ“š Recursos

- **Componentes:** `ERPComponents.tsx`
- **Módulos:** `ERPModulesNew.tsx`
- **Vistas:** `ERPViews.tsx`
- **Estilos:** Tailwind CSS (100% utility-first)

---

**Última actualización:** 22 de abril de 2024
**Versión:** 1.0.0 - Production Ready



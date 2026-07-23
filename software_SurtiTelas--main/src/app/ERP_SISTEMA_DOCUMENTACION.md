# Sistema ERP - SurtiCamisetas

## Descripción General

Sistema web administrativo tipo ERP diseñado específicamente para **SurtiCamisetas**, empresa de confección y personalización de camisetas. El sistema centraliza la gestión de ventas, producción, inventario, compras, clientes y logística.

## Estilo Visual

El diseño sigue principios modernos de SaaS inspirados en plataformas como Stripe, Notion y Shopify:

- **Colores principales**: Negro (#0D0D0D), Blanco (#FFFFFF), acentos en rojo/naranja
- **Tipografía**: Sans-serif minimalista, clara y legible
- **Componentes**: Cards, tablas, gráficos y sidebar lateral
- **Responsive**: Totalmente adaptable a desktop, tablet y móvil

## Estructura General

### Sidebar Lateral (Izquierda)
- Navegación principal del sistema
- Logo de SurtiCamisetas (blanco en modo ERP)
- Menús colapsables con submenús
- Botón de cerrar sesión

### Header Superior
- Buscador global
- Botón de exportación
- Avatar y perfil del administrador

### Área Principal Dinámica
- Dashboard y módulos según selección
- Contenido responsive y adaptable

## Módulos Principales

### 1. DASHBOARD GENERAL
**Propósito**: Vista centralizada del estado del negocio

**Funcionalidades**:
- Resumen de ventas del mes (gráfico de líneas)
- Pedidos en proceso con estados
- Stock bajo con alertas visuales
- Productos más vendidos
- Últimos pedidos registrados
- Empleados activos y su desempeño
- Alertas y notificaciones prioritarias
- Acceso rápido a todos los módulos

**Visualizaciones**:
- Gráficas de ventas mensuales
- KPIs principales (ventas, pedidos, stock, empleados)
- Tabla de últimos pedidos
- Sistema de alertas por prioridad (alta/media/baja)

---

### 2. GESTIÓN DE VENTAS
**Propósito**: Control completo del ciclo de ventas

**Funcionalidades**:
- Tabla de pedidos con filtros avanzados
- Estados de pedido: recibido, en producción, enviado, entregado
- Botón para crear nueva venta
- Detalle de pedido en modal
- Gestión de clientes
- Catálogo digital de productos
- Facturación y ventas
- Pagos, abonos y financiación
- Sistema de contacto con empresa
- Control de stock devuelto con inspección

**Características especiales**:
- Sistema de comprobantes de pago (clientes suben, empleados aprueban)
- Tracking de pedidos en tiempo real
- Gestión de devoluciones e inspección de calidad

---

### 3. INVENTARIO (PRODUCTOS)
**Propósito**: Control de productos terminados

**Funcionalidades**:
- Lista de productos con nombre, talla, color y stock
- Indicador visual de stock bajo (alertas en rojo)
- Filtros por categoría, talla, color
- CRUD completo de productos
- Gestión de proveedores
- Alertas automáticas de stock

**Datos mostrados**:
- Código de producto
- Nombre y descripción
- Tallas disponibles
- Colores disponibles
- Stock actual vs. stock mínimo
- Precio unitario
- Proveedor asociado
- Ubicación en bodega

---

### 4. INSUMOS (NUEVO MÓDULO)
**Propósito**: Gestión de materiales y materias primas

**Funcionalidades**:
- Tabla de materiales (telas, hilos, tintas, accesorios, empaques)
- Cantidad disponible vs. cantidad mínima
- Estado: disponible / bajo stock / agotado
- Gestión de proveedores de insumos
- Control de ubicación en bodega
- Historial de compras
- Exportación a CSV

**Categorías de insumos**:
- Telas (Jersey, algodón, etc.)
- Hilos (poliéster, varios colores)
- Accesorios (etiquetas, botones)
- Tintas para estampado
- Empaques

**Estadísticas**:
- Total de insumos
- Insumos con stock bajo/agotado
- Valor total del inventario de insumos
- Número de categorías

---

### 5. PRODUCCIÓN (TALLERES EXTERNOS)
**Propósito**: Gestión de producción externalizada

**Sub-módulos**:

#### a) Registro de Talleres
- Nombre del taller
- Contacto y teléfono
- Dirección
- Especialidad (camisetas básicas, personalización, polos, etc.)
- Estado (activo/inactivo)

#### b) Asignación de Producción
- Crear orden de producción
- Asignar taller específico
- Definir cantidad de prendas
- Fecha de entrega estimada
- Seguimiento de estado

#### c) Flujo Visual Kanban (NUEVO)
**Etapas del proceso**:
1. **Corte**: Preparación y corte de telas
2. **Confección**: Costura y ensamblaje
3. **Estampado**: Aplicación de diseños
4. **Finalizado**: Productos listos para entrega

**Visualización**:
- 4 columnas verticales (una por etapa)
- Tarjetas de pedidos movibles entre columnas
- Información en cada tarjeta:
  - ID del pedido
  - Producto
  - Taller asignado
  - Cantidad de unidades
  - Fecha de entrega estimada
  - Estado visual con colores

#### d) Control de Prendas Entregadas/Recibidas
- Registro de prendas entregadas al taller
- Verificación de prendas recibidas
- Control de calidad (prendas defectuosas)
- Fechas de entrega y recepción
- Estados: entregado, en taller, recibido, con observaciones

---

### 6. CLIENTES (NUEVO MÓDULO)
**Propósito**: Base de datos y gestión de clientes

**Funcionalidades**:
- Lista completa de clientes con datos de contacto
- Historial de compras por cliente
- Tipos de cliente: Minorista, Mayorista, Corporativo
- Estados: Activo / Inactivo
- Vista detallada con información completa
- Exportación de datos

**Información de cliente**:
- Nombre / Razón social
- Email y teléfono
- Dirección completa
- Ciudad
- Tipo de cliente
- Fecha de registro
- Última compra
- Total de compras acumulado
- Número de pedidos realizados
- Historial detallado de transacciones

**Estadísticas**:
- Total de clientes registrados
- Clientes activos
- Ventas totales generadas
- Promedio de compra por cliente

---

### 7. DOMICILIOS (NUEVO MÓDULO)
**Propósito**: Gestión de envíos y entregas

**Sub-módulos**:

#### a) Gestión de Entregas
- Lista de pedidos pendientes de envío
- Estado del pedido: pendiente, asignado, en ruta, entregado, cancelado
- Asignación de domiciliario
- Tracking completo del pedido
- Información del cliente y dirección
- Valor del pedido
- Observaciones especiales

#### b) Gestión de Domiciliarios
- Listado de domiciliarios activos
- Nombre y contacto
- Tipo de vehículo (moto, bicicleta eléctrica)
- Estado: disponible, en ruta, descanso
- Pedidos realizados hoy
- Calificación promedio

**Flujo de trabajo**:
1. Pedido creado â†’ Estado: Pendiente
2. Asignar domiciliario â†’ Estado: Asignado
3. Domiciliario sale a entregar â†’ Estado: En Ruta
4. Entrega completada â†’ Estado: Entregado

**Tracking del pedido**:
- Historial cronológico completo
- Fecha y hora de cada cambio de estado
- Descripción de cada evento
- Visualización tipo línea de tiempo

**Estadísticas**:
- Entregas pendientes
- Entregas en ruta
- Entregas completadas hoy
- Domiciliarios disponibles

---

### 8. DEVOLUCIONES
**Propósito**: Control de devoluciones y calidad

**Funcionalidades**:
- Lista de solicitudes de devolución
- Estados: pendiente, en revisión, aprobada, rechazada
- Vista de evidencia (imágenes del cliente)
- Inspección de calidad
- Decisión de destino del producto devuelto
- Seguimiento completo del proceso

---

### 9. REPORTES Y ANALÍTICA
**Propósito**: Análisis de datos y toma de decisiones

**Tipos de reportes**:
- Reportes de inventario (stock, rotación, valorización)
- Reportes de producción (eficiencia de talleres, tiempos)
- Reportes de ventas (por período, por producto, por cliente)
- Reportes de usuarios (desempeño de asesores)

**Visualizaciones**:
- Gráficas de barras, líneas y circulares (Recharts)
- Tablas con filtros y ordenamiento
- Exportación a CSV para análisis externo

---

## Funcionalidades UX Destacadas

### Interacciones
- Botones claros de acción (crear, editar, eliminar)
- Modales para formularios y detalles
- Filtros y buscadores en todas las tablas
- Estados visuales con colores semánticos:
  - Verde: Completado / Disponible / Activo
  - Amarillo: Pendiente / Stock Bajo / Asignado
  - Rojo: Cancelado / Agotado / Alta Prioridad
  - Azul: En Proceso / En Ruta
  - Gris: Inactivo

### Responsive Design
- Desktop primero, adaptable a tablet y móvil
- Menú lateral colapsable
- Tablas responsivas con scroll horizontal en móvil
- Cards adaptables
- Menú hamburguesa en móvil

### Design System
- Componentes reutilizables (buttons, cards, tables, badges)
- Paleta de colores consistente
- Iconografía de Lucide React
- Espaciado y tipografía estandarizados

---

## Tecnologías Utilizadas

- **Framework**: React con TypeScript
- **Estilos**: Tailwind CSS v4
- **Componentes UI**: Biblioteca personalizada (shadcn/ui)
- **Gráficos**: Recharts
- **Iconos**: Lucide React
- **Notificaciones**: Sonner (toast)
- **Estado**: React useState/useEffect

---

## Componentes Creados

### Módulos Nuevos
1. `/components/admin/InsumosModule.tsx` - Gestión de insumos y materiales
2. `/components/admin/ClientesModule.tsx` - Base de datos de clientes
3. `/components/admin/DomiciliosModule.tsx` - Gestión de entregas y domiciliarios

### Módulos Actualizados
1. `/components/admin/ProduccionModule.tsx` - Agregado flujo Kanban visual

---

## Flujos de Trabajo Principales

### 1. Ciclo de Venta
```
Cliente crea pedido â†’ Sube comprobante de pago â†’ Empleado valida pago â†’ 
Pedido entra a producción â†’ Asignación a taller â†’ Producción (Kanban) â†’ 
Recepción y calidad â†’ Asignación de domicilio â†’ Entrega al cliente
```

### 2. Control de Inventario
```
Verificar stock â†’ Detectar stock bajo â†’ Generar alerta â†’ 
Contactar proveedor â†’ Registrar compra de insumos â†’ 
Actualizar inventario â†’ Producción disponible
```

### 3. Producción en Taller
```
Crear orden de producción â†’ Asignar taller â†’ 
Corte â†’ Confección â†’ Estampado â†’ Finalizado â†’ 
Entrega a bodega â†’ Control de calidad â†’ Stock disponible
```

---

## Próximas Mejoras Sugeridas

- Sistema de notificaciones push en tiempo real
- Integración con WhatsApp Business API
- Gestión de roles y permisos granular
- Reportes PDF descargables
- Dashboard predictivo con Machine Learning
- Sistema de facturación electrónica
- Integración con pasarelas de pago
- App móvil nativa para domiciliarios

---

## Contacto y Soporte

Para consultas sobre el sistema:
- **Empresa**: SurtiCamisetas
- **Sistema desarrollado**: Panel Administrativo ERP

---

**Última actualización**: Abril 2026
**Versión**: 2.0.0
**Estado**: Producción âœ…



# Sistema de Autenticación - SurtiCamisetas

## ðŸ“‹ Resumen

Hemos implementado un sistema de autenticación completo con tres tipos de usuarios diferentes, cada uno con su propio dashboard y funcionalidades específicas.

## ðŸ‘¥ Tipos de Usuarios

### 1. ðŸ” Administrador
**Credenciales:**
- Email: `admin@surticamisetas.com`
- Contraseña: `admin123`

**Acceso:** Panel de Administración completo
- Dashboard con estadísticas generales
- Gestión de productos, categorías, clientes
- Gestión de pedidos y su estado
- Gestión de talleres y proveedores
- Gestión de empleados
- Gestión de reseñas y configuración
- Reportes y exportación a CSV

**Archivo:** `/components/AdminDashboard.tsx`

---

### 2. ðŸ‘” Empleado/Asesor
**Credenciales:**
- Email: `empleado@surticamisetas.com`
- Contraseña: `empleado123`

**Acceso:** Panel de Empleado/Asesor
- Dashboard personal con estadísticas de ventas
- Información de comisiones
- Pedidos completados
- Metas y rendimiento
- Asistencia de ventas
- Recomendaciones de productos

**Datos del Empleado:**
- Nombre: Juan Pérez (Asesor Principal)
- Teléfono: +57 310 987 6543
- Departamento: Ventas
- Comisión: 5%

**Archivo:** `/components/AdvisorPanel.tsx`

---

### 3. ðŸ‘¤ Cliente
**Credenciales:**
- Email: `cliente@ejemplo.com`
- Contraseña: `cliente123`

**Acceso:** Portal del Cliente
- Dashboard con resumen de actividad
- Historial de pedidos
- Estado de pedidos actuales
- Gestión de perfil personal
- Estadísticas de compras

**Datos del Cliente:**
- Nombre: María González
- Teléfono: +57 320 456 7890
- Dirección: Calle 123 #45-67, Bogotá

**Archivo:** `/components/ClientDashboard.tsx`

---

## ðŸ”„ Flujo de Autenticación

1. **Página de Login** (`/components/LoginPage.tsx`)
   - Formulario de inicio de sesión
   - Formulario de registro
   - Validación de credenciales
   - Redirección automática según el rol

2. **Validación de Credenciales**
   - Se verifica email y contraseña
   - Se asigna el rol correspondiente
   - Se crea el objeto de usuario con datos específicos

3. **Redirección Automática**
   - Administrador â†’ `/admin` (AdminDashboard)
   - Empleado â†’ `/employee` (AdvisorPanel)
   - Cliente â†’ `/client` (ClientDashboard)

4. **Protección de Rutas**
   - Solo usuarios autenticados pueden acceder a sus dashboards
   - Cada rol solo puede acceder a su dashboard correspondiente
   - Redirección al login si se intenta acceder sin permisos

---

## ðŸ› ï¸ Archivos Modificados

### Tipos (`/types/index.ts`)
```typescript
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'customer' | 'admin' | 'employee';
  phone?: string;
  address?: string;
}
```

### Componentes Principales
1. **App.tsx** - Lógica de autenticación y enrutamiento
2. **LoginPage.tsx** - Página de inicio de sesión
3. **AdminDashboard.tsx** - Panel del administrador
4. **AdvisorPanel.tsx** - Panel del empleado
5. **ClientDashboard.tsx** - Panel del cliente (NUEVO)

### Datos Mock (`/data/mockData.ts`)
- Empleado principal agregado con credenciales de prueba
- Pedidos de ejemplo para el cliente de prueba

---

## ðŸ“Š Características por Dashboard

### Admin Dashboard
âœ… Gestión completa de la aplicación
âœ… CRUD de todos los módulos
âœ… Estadísticas y reportes
âœ… Gráficas con Recharts
âœ… Exportación a CSV
âœ… Menú lateral profesional

### Employee Dashboard (AdvisorPanel)
âœ… Vista personal de ventas
âœ… Estadísticas de rendimiento
âœ… Comisiones ganadas
âœ… Asistencia al cliente
âœ… Chat por WhatsApp
âœ… Recomendaciones de productos

### Client Dashboard
âœ… Historial de pedidos
âœ… Estado de pedidos en tiempo real
âœ… Gestión de perfil
âœ… Estadísticas de compras
âœ… Vista detallada de cada pedido
âœ… Acceso rápido a la tienda

---

## ðŸŽ¨ Diseño

- **Paleta de colores:** Blanco y negro con acentos suaves
- **Tipografía:** Sans-serif minimalista
- **Diseño:** Completamente responsivo
- **UI Components:** ShadCN UI
- **Iconos:** Lucide React

---

## ðŸ”’ Seguridad

**Nota:** Este es un sistema de demostración. En producción:
- Las contraseñas deben estar hasheadas
- Implementar JWT o sesiones seguras
- Usar HTTPS
- Validación en el servidor
- Rate limiting en login
- 2FA para cuentas sensibles

---

## ðŸš€ Modo Demo

El sistema permite iniciar sesión con cualquier email válido y contraseña de más de 6 caracteres (se asignará rol de cliente automáticamente). Esto es para facilitar las pruebas, pero debe desactivarse en producción.

---

## ðŸ“± Próximos Pasos Sugeridos

1. Implementar backend real (Supabase recomendado)
2. Agregar recuperación de contraseña
3. Implementar cambio de contraseña
4. Agregar verificación de email
5. Implementar 2FA opcional
6. Sistema de notificaciones
7. Historial de sesiones activas
8. Logs de actividad por usuario



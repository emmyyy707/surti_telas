# Persona 2 — Frontend

## Prioridad crítica

### Crear un cliente HTTP centralizado

- Configurar una única `baseURL`.
- Usar la siguiente variable de entorno:

```env
VITE_API_URL=http://localhost:3000/api/v1
```

- Evitar agregar `/api/v1` nuevamente en cada servicio.

### Unificar el procesamiento de respuestas

- Crear un parser común para el contrato definitivo del backend.
- Evitar que cada página use estructuras diferentes como:

```ts
response.data
response.data.data
response.data.items
response.data.data.items
```

### Corregir la gestión de errores

Manejar correctamente:

- `400`: datos inválidos.
- `401`: sesión expirada.
- `403`: usuario sin permisos.
- `404`: recurso inexistente.
- `409`: conflicto.
- `500`: error interno.
- `ECONNREFUSED`: backend apagado.

Mostrar mensajes útiles y comprensibles al usuario.

### Implementar refresh token automático

- Interceptar respuestas `401`.
- Solicitar un nuevo access token una sola vez.
- Reintentar la petición original.
- Evitar múltiples solicitudes de refresh simultáneas.
- Cerrar sesión si el refresh falla.
- Evitar loops infinitos de autenticación.

### Validar la URL real de cada endpoint

Confirmar que frontend y backend coincidan en:

- Método HTTP.
- Ruta.
- Payload.
- Respuesta.

Revisar especialmente:

- Deliveries.
- Returns.
- Orders.
- Payments.
- Receipts.
- Notifications.

---

## Eliminar datos simulados

### Conectar páginas administrativas

- `Clientes.tsx`
- `Inventario.tsx`
- `Proveedores.tsx`
- `Produccion.tsx`
- `RegistroTalleres.tsx`
- `AsignacionProduccion.tsx`
- `SeguimientoProduccion.tsx`
- `ControlPrendas.tsx`
- `Insumos.tsx`
- `AdminAsesores.tsx`
- `GestionUsuarios.tsx`
- `Roles.tsx`
- `Permisos.tsx`
- `SeguridadUsuarios.tsx`

### Conectar dashboards y reportes

- Dashboard de administrador.
- Dashboard de asesor.
- Dashboard de domiciliario.
- Reporte de ventas.
- Reporte de inventario.
- Reporte de producción.
- Reporte de usuarios.

### Conectar páginas de cliente

- `Catalogo.tsx`
- `InicioCliente.tsx`
- `MisPedidos.tsx`
- `OrderTracking.tsx`
- `Recibos.tsx`
- `Favoritos.tsx`
- `PerfilCliente.tsx`

### Conectar páginas de domiciliario

- `MisEntregas.tsx`
- `RutaDelDia.tsx`
- `Historial.tsx`
- `PerfilDomiciliario.tsx`

### Eliminar como fuente principal

- Arrays hardcodeados.
- Datos demo.
- `localStorage`.
- Stores con información simulada.
- Fallbacks que oculten fallos de conexión.

---

## Flujos funcionales esenciales

### Validar pedidos

- Listar pedidos.
- Crear pedido.
- Ver detalle.
- Editar pedido.
- Cambiar estado.
- Eliminar pedido.
- Asignar domiciliario.
- Confirmar que los cambios persistan después de recargar la página.

### Validar catálogo

- Listar productos.
- Buscar productos.
- Crear productos.
- Editar productos.
- Publicar productos.
- Despublicar productos.
- Eliminar productos.

### Validar clientes

- Listar clientes.
- Crear clientes.
- Editar clientes.
- Actualizar cupo.
- Mostrar correctamente los errores de validación.

### Validar inventario

- Cargar movimientos reales.
- Crear movimientos.
- Corregir el mapeo de:

```text
ENTRADA
SALIDA
AJUSTE
```

- Actualizar la pantalla después de cada operación.

### Validar pagos y recibos

- Aprobar pagos.
- Rechazar pagos.
- Reembolsar pagos.
- Registrar abonos.
- Editar recibos.
- Cambiar estados.
- Recargar los datos después de cada mutación.

### Validar entregas

- Listar entregas por domiciliario.
- Cambiar entre los estados:

```text
ASIGNADO
EN_RUTA
ENTREGADO
FALLIDO
```

- Confirmar que el método HTTP coincida con el backend.

---

## Estados visuales obligatorios

Cada pantalla conectada debe manejar:

- Loading.
- Error.
- Lista vacía.
- Datos cargados.
- Error de permisos.
- Sesión expirada.
- Reintento.
- Confirmación de operación exitosa.

No deben existir botones que solamente ejecuten:

```ts
alert("Acción realizada");
```

sin llamar realmente al backend.

---

## Calidad frontend

### Ejecutar y corregir

```bash
npm run typecheck
npm run lint
npm run build
```

### Agregar pruebas para

- Cliente HTTP.
- Refresh token.
- Parsers de respuestas.
- Formularios.
- Tablas paginadas.
- Rutas protegidas.
- Permisos por rol.

### Agregar pruebas E2E para

- Login.
- Crear pedido.
- Actualizar estado de pedido.
- Crear producto.
- Registrar movimiento de inventario.
- Asignar entrega.
- Completar entrega.
- Logout.

---

## Criterios de aceptación frontend

- [ ] Ninguna pantalla crítica usa mocks como fuente de verdad.
- [ ] Todas las páginas usan el cliente HTTP centralizado.
- [ ] Existe una única `baseURL` configurable mediante `VITE_API_URL`.
- [ ] Ningún servicio duplica el prefijo `/api/v1`.
- [ ] Todas las respuestas se procesan mediante un contrato común.
- [ ] El refresh token funciona sin loops.
- [ ] Las solicitudes pendientes se reintentan correctamente después del refresh.
- [ ] El usuario cierra sesión automáticamente cuando el refresh falla.
- [ ] Los cambios permanecen después de recargar la página.
- [ ] Los errores del backend se muestran correctamente.
- [ ] Todas las rutas protegidas respetan los roles y permisos.
- [ ] Las pantallas manejan loading, error, vacío y éxito.
- [ ] No existen botones simulados que no ejecuten operaciones reales.
- [ ] Las pruebas del cliente HTTP y autenticación pasan.
- [ ] Las pruebas E2E de los flujos esenciales pasan.
- [ ] `npm run typecheck` pasa sin errores.
- [ ] `npm run lint` pasa sin errores.
- [ ] `npm run build` pasa sin errores.

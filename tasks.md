# Tasks

## Estado general

- Última actualización: 2026-07-27
- Rama actual: main
- Objetivo: Ejecutar todas las tareas pendientes del frontend de SurtiTelas según persona-2-frontend-tareas.md, dejando el proyecto en estado finalizado y verificado.
- Última tarea completada: Ninguna
- Próxima tarea: Fix lint errors (18 errors, 1 warning)
- Bloqueos actuales: Ninguno

## Pendientes

- [ ] TASK-001 — Fix lint errors en frontend
  - Prioridad: Alta
  - Dependencias: Ninguna
  - Criterios de aceptación:
    - [ ] `npm run lint` pasa sin errores en el directorio del frontend
    - [ ] Todos los unused imports y variables corregidos
    - [ ] No se introducen nuevos errores de lint
  - Archivos relacionados: software_SurtiTelas.Fronend/src/presentation/pages/admin/Clientes.tsx, VentasPedidos.tsx, GestionUsuarios.tsx, CrearPedido.tsx, shared/ui/FileUpload.tsx
  - Notas: 18 errores y 1 warning actualmente. Verificar con npm run lint desde el directorio del frontend.

- [ ] TASK-002 — Conectar páginas administrativas a APIs reales
  - Prioridad: Alta
  - Dependencias: Ninguna
  - Criterios de aceptación:
    - [ ] Clientes.tsx usa authApi y customersApi en lugar de datos mock
    - [ ] Inventario.tsx usa inventoryApi en lugar de datos mock
    - [ ] Proveedores.tsx usa stockApi.suppliers en lugar de datos mock
    - [ ] Produccion.tsx usa productionApi en lugar de datos mock
    - [ ] RegistroTalleres.tsx usa workshopsApi en lugar de datos mock
    - [ ] AsignacionProduccion.tsx usa productionApi en lugar de datos mock
    - [ ] SeguimientoProduccion.tsx usa productionApi en lugar de datos mock
    - [ ] ControlPrendas.tsx usa controlPrendaApi en lugar de datos mock
    - [ ] Insumos.tsx usa inventoryApi/rawMaterialsApi en lugar de datos mock
    - [ ] AdminAsesores.tsx usa authApi en lugar de datos mock
    - [ ] GestionUsuarios.tsx usa authApi en lugar de datos mock
    - [ ] Roles.tsx usa authApi.permissions en lugar de datos mock
    - [ ] Permisos.tsx usa authApi.permissions en lugar de datos mock
    - [ ] SeguridadUsuarios.tsx usa authApi en lugar de datos mock
  - Archivos relacionados: software_SurtiTelas.Fronend/src/presentation/pages/admin/
  - Notas: Revisar cada página para identificar datos hardcodeados/mock y reemplazar con llamadas API reales.

- [ ] TASK-003 — Conectar dashboards y reportes a APIs reales
  - Prioridad: Alta
  - Dependencias: Ninguna
  - Criterios de aceptación:
    - [ ] Dashboard de administrador usa APIs reales para métricas
    - [ ] Dashboard de asesor usa APIs reales
    - [ ] Dashboard de domiciliario usa APIs reales
    - [ ] Reporte de ventas usa reportsApi
    - [ ] Reporte de inventario usa reportsApi
    - [ ] Reporte de producción usa reportsApi
    - [ ] Reporte de usuarios usa reportsApi
  - Archivos relacionados: software_SurtiTelas.Fronend/src/presentation/pages/admin/Dashboard.tsx, Reportes*.tsx, asesor/Dashboard.tsx, domiciliario/Dashboard.tsx
  - Notas: Verificar que cada dashboard/reporte consuma datos del backend y no use arrays hardcodeados.

- [ ] TASK-004 — Conectar páginas de cliente a APIs reales
  - Prioridad: Alta
  - Dependencias: Ninguna
  - Criterios de aceptación:
    - [ ] Catalogo.tsx usa productsApi para listar productos
    - [ ] InicioCliente.tsx usa APIs reales para datos del cliente
    - [ ] MisPedidos.tsx usa ordersApi.me para listar pedidos
    - [ ] OrderTracking.tsx usa ordersApi.getById para tracking
    - [ ] Recibos.tsx usa receiptsApi para datos de recibos
    - [ ] Favoritos.tsx usa favoritesApi para datos de favoritos
    - [ ] PerfilCliente.tsx usa authApi.updateProfile para actualizar perfil
  - Archivos relacionados: software_SurtiTelas.Fronend/src/presentation/pages/cliente/
  - Notas: Verificar que ninguna página use localStorage o datos demo como fuente principal.

- [ ] TASK-005 — Conectar páginas de domiciliario a APIs reales
  - Prioridad: Alta
  - Dependencias: Ninguna
  - Criterios de aceptación:
    - [ ] MisEntregas.tsx usa deliveriesApi para listar entregas
    - [ ] RutaDelDia.tsx usa deliveriesApi para la ruta del día
    - [ ] Historial.tsx usa deliveriesApi para historial
    - [ ] PerfilDomiciliario.tsx usa authApi para datos del perfil
  - Archivos relacionados: software_SurtiTelas.Fronend/src/presentation/pages/domiciliario/
  - Notas: Verificar que ninguna página use datos mock o hardcodeados.

- [ ] TASK-006 — Validar flujo de pedidos (CRUD completo)
  - Prioridad: Alta
  - Dependencias: TASK-002, TASK-004
  - Criterios de aceptación:
    - [ ] Listar pedidos funciona y persiste después de recargar
    - [ ] Crear pedido funciona y persiste después de recargar
    - [ ] Ver detalle de pedido funciona
    - [ ] Editar pedido funciona y persiste después de recargar
    - [ ] Cambiar estado de pedido funciona y persiste después de recargar
    - [ ] Eliminar pedido funciona y persiste después de recargar
    - [ ] Asignar domiciliario funciona y persiste después de recargar
  - Archivos relacionados: software_SurtiTelas.Fronend/src/presentation/pages/admin/VentasPedidos.tsx, cliente/MisPedidos.tsx, cliente/CrearPedido.tsx
  - Notas: Probar cada operación y verificar que los cambios persisten tras recarga de página.

- [ ] TASK-007 — Validar flujo de catálogo (CRUD completo)
  - Prioridad: Alta
  - Dependencias: TASK-002
  - Criterios de aceptación:
    - [ ] Listar productos funciona
    - [ ] Buscar productos funciona
    - [ ] Crear productos funciona y persiste
    - [ ] Editar productos funciona y persiste
    - [ ] Publicar productos funciona y persiste
    - [ ] Despublicar productos funciona y persiste
    - [ ] Eliminar productos funciona y persiste
  - Archivos relacionados: software_SurtiTelas.Fronend/src/presentation/pages/admin/AdminCatalogo.tsx, cliente/Catalogo.tsx
  - Notas: Verificar que las operaciones de publicar/despublicar llaman al backend correctamente.

- [ ] TASK-008 — Validar flujo de clientes (CRUD completo)
  - Prioridad: Alta
  - Dependencias: TASK-002
  - Criterios de aceptación:
    - [ ] Listar clientes funciona
    - [ ] Crear clientes funciona y persiste
    - [ ] Editar clientes funciona y persiste
    - [ ] Actualizar cupo funciona y persiste
    - [ ] Errores de validación se muestran correctamente
  - Archivos relacionados: software_SurtiTelas.Fronend/src/presentation/pages/admin/Clientes.tsx
  - Notas: Verificar que los errores de validación del backend se muestran al usuario.

- [ ] TASK-009 — Validar flujo de inventario
  - Prioridad: Alta
  - Dependencias: TASK-002
  - Criterios de aceptación:
    - [ ] Cargar movimientos reales funciona
    - [ ] Crear movimientos funciona y persiste
    - [ ] Mapeo correcto de ENTRADA, SALIDA, AJUSTE
    - [ ] La pantalla se actualiza después de cada operación
  - Archivos relacionados: software_SurtiTelas.Fronend/src/presentation/pages/admin/Inventario.tsx
  - Notas: Verificar que los tipos de movimiento se mapean correctamente al backend.

- [ ] TASK-010 — Validar flujo de pagos y recibos
  - Prioridad: Alta
  - Dependencias: TASK-002
  - Criterios de aceptación:
    - [ ] Aprobar pagos funciona y persiste
    - [ ] Rechazar pagos funciona y persiste
    - [ ] Reembolsar pagos funciona y persiste
    - [ ] Registrar abonos funciona y persiste
    - [ ] Editar recibos funciona y persiste
    - [ ] Cambiar estados funciona y persiste
    - [ ] Los datos se recargan después de cada mutación
  - Archivos relacionados: software_SurtiTelas.Fronend/src/presentation/pages/admin/Pagos.tsx, admin/Recibos.tsx, cliente/Recibos.tsx
  - Notas: Verificar que después de cada mutación se recargan los datos.

- [ ] TASK-011 — Validar flujo de entregas
  - Prioridad: Alta
  - Dependencias: TASK-002, TASK-005
  - Criterios de aceptación:
    - [ ] Listar entregas por domiciliario funciona
    - [ ] Cambiar entre estados ASIGNADO, EN_RUTA, ENTREGADO, FALLIDO funciona
    - [ ] El método HTTP coincide con el backend
  - Archivos relacionados: software_SurtiTelas.Fronend/src/presentation/pages/domiciliario/MisEntregas.tsx, RutaDelDia.tsx
  - Notas: Verificar que los cambios de estado usan los endpoints correctos del backend.

- [ ] TASK-012 — Implementar estados visuales obligatorios en todas las páginas conectadas
  - Prioridad: Media
  - Dependencias: TASK-002, TASK-003, TASK-004, TASK-005
  - Criterios de aceptación:
    - [ ] Loading state en todas las páginas que hacen peticiones
    - [ ] Error state con mensaje útil y botón de reintento
    - [ ] Lista vacía con mensaje comprensible
    - [ ] Datos cargados correctamente
    - [ ] Error de permisos manejado
    - [ ] Sesión expirada manejada (redirige a login)
    - [ ] Reintento disponible
    - [ ] Confirmación de operación exitosa (toast/modal)
    - [ ] No existen botones que solo ejecuten alert("Acción realizada")
  - Archivos relacionados: Todas las páginas de software_SurtiTelas.Fronend/src/presentation/pages/
  - Notas: Revisar cada página conectada para verificar que maneja todos los estados visuales.

- [ ] TASK-013 — Eliminar datos simulados como fuente principal
  - Prioridad: Media
  - Dependencias: TASK-002, TASK-003, TASK-004, TASK-005
  - Criterios de aceptación:
    - [ ] No hay arrays hardcodeados como fuente principal de datos
    - [ ] No hay datos demo en páginas conectadas
    - [ ] No hay localStorage como fuente principal
    - [ ] No hay stores con información simulada
    - [ ] No hay fallbacks que oculten fallos de conexión
  - Archivos relacionados: Todas las páginas y stores del frontend
  - Notas: Verificar que la fuente de verdad es siempre la API del backend.

- [ ] TASK-014 — Ejecutar y corregir npm run typecheck, npm run lint, npm run build
  - Prioridad: Alta
  - Dependencias: TASK-001
  - Criterios de aceptación:
    - [ ] `npm run typecheck` pasa sin errores
    - [ ] `npm run lint` pasa sin errores
    - [ ] `npm run build` pasa sin errores
  - Archivos relacionados: software_SurtiTelas.Fronend/
  - Notas: Ejecutar desde el directorio del frontend.

- [ ] TASK-015 — Agregar pruebas unitarias para cliente HTTP, refresh token, parsers, formularios, tablas paginadas, rutas protegidas, permisos por rol
  - Prioridad: Media
  - Dependencias: TASK-014
  - Criterios de aceptación:
    - [ ] Tests para httpClient pasan
    - [ ] Tests para refresh token pasan
    - [ ] Tests para parsers de respuestas pasan
    - [ ] Tests para formularios pasan
    - [ ] Tests para tablas paginadas pasan
    - [ ] Tests para rutas protegidas pasan
    - [ ] Tests para permisos por rol pasan
  - Archivos relacionados: software_SurtiTelas.Fronend/src/tests/
  - Notas: Usar Vitest como framework de testing.

- [ ] TASK-016 — Agregar pruebas E2E para login, crear pedido, actualizar estado de pedido, crear producto, movimiento de inventario, asignar entrega, completar entrega, logout
  - Prioridad: Media
  - Dependencias: TASK-014
  - Criterios de aceptación:
    - [ ] Test E2E de login pasa
    - [ ] Test E2E de crear pedido pasa
    - [ ] Test E2E de actualizar estado de pedido pasa
    - [ ] Test E2E de crear producto pasa
    - [ ] Test E2E de movimiento de inventario pasa
    - [ ] Test E2E de asignar entrega pasa
    - [ ] Test E2E de completar entrega pasa
    - [ ] Test E2E de logout pasa
  - Archivos relacionados: software_SurtiTelas.Backend/tests/e2e/, software_SurtiTelas.Fronend/
  - Notas: Usar Playwright para pruebas E2E.

- [ ] TASK-017 — Verificar todos los criterios de aceptación de persona-2-frontend-tareas.md
  - Prioridad: Alta
  - Dependencias: TASK-001, TASK-002, TASK-003, TASK-004, TASK-005, TASK-006, TASK-007, TASK-008, TASK-009, TASK-010, TASK-011, TASK-012, TASK-013, TASK-014, TASK-015, TASK-016
  - Criterios de aceptación:
    - [ ] Ninguna pantalla crítica usa mocks como fuente de verdad
    - [ ] Todas las páginas usan el cliente HTTP centralizado
    - [ ] Existe una única baseURL configurable mediante VITE_API_URL
    - [ ] Ningún servicio duplica el prefijo /api/v1
    - [ ] Todas las respuestas se procesan mediante un contrato común
    - [ ] El refresh token funciona sin loops
    - [ ] Las solicitudes pendientes se reintentan correctamente después del refresh
    - [ ] El usuario cierra sesión automáticamente cuando el refresh falla
    - [ ] Los cambios persisten después de recargar la página
    - [ ] Los errores del backend se muestran correctamente
    - [ ] Todas las rutas protegidas respetan los roles y permisos
    - [ ] Las pantallas manejan loading, error, vacío y éxito
    - [ ] No existen botones simulados que no ejecuten operaciones reales
    - [ ] Las pruebas del cliente HTTP y autenticación pasan
    - [ ] Las pruebas E2E de los flujos esenciales pasan
    - [ ] npm run typecheck pasa sin errores
    - [ ] npm run lint pasa sin errores
    - [ ] npm run build pasa sin errores
  - Archivos relacionados: Todo el proyecto frontend
  - Notas: Verificación final completa de todos los criterios.

## En progreso

## Bloqueadas

## Completadas
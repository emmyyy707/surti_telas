# Propuesta integral: Mis Pedidos Personalizados (cliente)

## 1. Diagnóstico actual
- Página funcional pero visualmente inconsistente: es el único page cliente sin CSS module, usa inputs planos sin labels, y se apoya en modales custom en vez de componentes shared.
- Flujo cliente incompleto: solo permite crear y ver detalle; no hay edición, eliminación con confirmación robusta, ni navegación al pedido convertido.
- AccionesInline: botones dentro de la tabla sin menú de acciones, generando saturación visual.
- Validación ausente: el formulario permite enviar datos vacíos o numéricos inválidos.
- `prompt()` nativo para rechazo de cotización: rompe consistencia y bloquea la UI.
- Sin estados vacíos amigables, sin skeletons, sin feedback granular.
- Sin paginación/server-mode a pesar de que el backend soporta lista paginada.

## 2. Arquitectura de componentes recomendada
Para este page se recomienda:

- `MisPedidosPersonalizados.tsx` + `MisPedidosPersonalizados.module.css`: contenedor orquestador.
- Shared UI ya disponible:
  - `DataTable` con `detailPanel` para detalle inline.
  - `Modal` + `ModalFooter` para formularios y confirmaciones.
  - `Input` para campos con label/error/hint.
  - `ConfirmationModal` para eliminaciones y acciones destructivas.
  - `SearchInput` para búsqueda consistente.
- Nuevo componente específico:
  - `CustomOrderStatusSelector` (cliente) o reutilizar el del admin adaptando el flujo.
  - `CustomOrderRejectModal` para capturar motivo de rechazo en un textarea controlado.

Patrón: Controlled forms + derived state para KPIs y filtros. Separar mutaciones en handlers dedicados con rollback visual si falla la API.

## 3. Patrones de diseño UI
- Tarjetas KPI al tope: Total, Pendientes, En producción, Completados.
- Tabla como foco principal: columnas Solicitud, Estado, Límite producción, Actualizado, Acciones (menú 3 puntos).
- Menú de acciones unificado: Ver detalle, Editar, Eliminar, Enviar a revisión, Aceptar cotización, Rechazar cotización.
- Formulario modal en dos zonas: Datos generales + Items dinámicos.
- Estados vacíos con ilustración simple y CTA “Crear primera solicitud”.
- Feedback: toasts, loader en botones, disabled states, skeleton en tabla.

## 4. Flujo de navegación ideal
1. El cliente entra a la lista y ve sus pedidos organizados por estado.
2. Puede buscar por número de solicitud.
3. Para crear: click en “Nueva solicitud” → modal con formulario validado.
4. Para detalle: click en fila o menú → detalle con cotización e items.
5. Para acciones rápidas: menú 3 puntos → Enviar a revisión / Aceptar / Rechazar / Eliminar / Editar.
6. Si el pedido se convierte, mostrar avance y link “Ver pedido” cuando aplique.

## 5. Entregables concretos para este page
- Estilos propios `MisPedidosPersonalizados.module.css`.
- Reemplazo de inputs raw por `Input`/`Select`/`Textarea` shared.
- Eliminación de `prompt()` y uso de `ConfirmationModal`.
- Implementación de `detailPanel` en `DataTable`.
- Validación inline y estados de error.
- Menú de acciones unificado en la tabla.
- Estados vacíos y loaders.
- Accesibilidad básica: labels, focus visible, aria-labels.

## 6. Riesgos y mitigaciones
- Cambiar a `detailPanel` puede alterar el detalle existente: mitigación, preservar campos claves y mapear ítems/cotización al nuevo panel.
- `Input` shared puede requerir ajuste de tema: mitigación, verificar variables CSS y dark mode.
- Permisos cliente vs admin: mantener endpoints seguros y ocultar acciones que no correspondan.

## 7. Próximos pasos sugeridos
1. Aprobar propuesta.
2. Implementar CSS module + migración a shared inputs.
3. Implementar detalle con `detailPanel`.
4. Implementar menú de acciones y confirmaciones.
5. Agregar validación y estados vacíos.
6. Probar en mobile y ajustar responsive.
7. Lint/typecheck y deploy a staging.

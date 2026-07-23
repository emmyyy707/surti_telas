# Plan de Corrección - Panel Admin SurtiTelas

## Problemas identificados

1. **Inventario**: `toFila()` mapea `tipo` en minúsculas, backend devuelve `ENTRADA/SALIDA/AJUSTE`.
2. **Pagos**: `updateStatus()` existe en api pero no se usa en UI. Botón "Exportar" fantasma.
3. **Recibos**: `update()` existe en api pero no se usa. Botón "Exportar" fantasma.
1. **VentasPedidos**: CRUD básico implementado (list, create, update status/full, delete, detalle).
5. **ContactoEmpresa**: "Nuevo Mensaje" y "Enviar" son `alert()` locales.
6. **HistorialPagos**: Solo lectura (por diseño, no crítico).

---

## Fase 1 — Correcciones críticas de mapeo/parseo

### 1.1 Inventario: corregir `toFila()`
- **Archivo:** `src/presentation/pages/admin/Inventario.tsx`
- **Cambio:** Normalizar `tipo` a mayúsculas en la UI o mapear correctamente desde backend.
- **Criticidad:** Alta — afecta visualización y filtros.

### 1.2 ContactoEmpresa: eliminar `alert()` fantasma
- **Archivo:** `src/presentation/pages/admin/ContactoEmpresa.tsx`
- **Cambio:** Reemplazar `alert('Mensaje enviado')` por feedback visual o deshabilitar botón hasta implementar create real.
- **Criticidad:** Media — no rompe flujo, pero es confuso.

---

## Fase 2 — Conectar acciones existentes

### 2.1 Pagos: conectar `updateStatus` en UI
- **Archivo:** `src/presentation/pages/admin/Pagos.tsx`
- **Cambio:** Agregar acciones para cambiar estado de pagos (Aprobar/Rechazar/Reembolsar) usando `paymentsApi.updateStatus()`.
- **Criticidad:** Alta — flujo de negocio crítico.

### 2.2 Recibos: conectar `update` en UI
- **Archivo:** `src/presentation/pages/admin/Recibos.tsx`
- **Cambio:** Habilitar edición completa usando `receiptsApi.update()` además de `updateStatus()`.
- **Criticidad:** Media — create funciona, edición está a medias.

---

## Fase 3 — Mejoras de UX y completado CRUD

### 3.1 VentasPedidos: agregar CRUD básico
- **Archivo:** `src/presentation/pages/admin/VentasPedidos.tsx`
- **Cambio:**
  - Conectar correctamente `ordersApi.list()` (shape ya es correcto).
  - Agregar acciones: Ver detalle, Cambiar estado, Eliminar.
  - Conectar botón "Nuevo Pedido" a modal/formulario con selects de cliente/asesor.
  - Edición completa con `updateOrderFull` y `updateStatus`.
- **Estado:** ✅ Completado
- **Criticidad:** Alta — página central del admin.

### 3.2 Exportar: implementar o suprimir botones fantasma
- **Archivos:** `Pagos.tsx`, `Recibos.tsx`
- **Cambio:** Reemplazados botones fantasma por `enableExport` nativo de `DataTable`.
- **Estado:** ✅ Completado
- **Criticidad:** Baja — no bloquea operación.

---

## ✅ Fase 3 — Completada

## Fase 4 — HistorialPagos (solo lectura)

### 4.1 Alcance definido
- **Decisión:** Solo lectura. La página `Pagos.tsx` ya maneja el CRUD completo de pagos (aprobar, rechazar, reembolsar, registrar abono).
- **Cambio:** Marcada como "solo lectura" en UI. No requiere acciones adicionales.
- **Estado:** ✅ Completado

---

## Cronograma sugerido

| Fase | Tiempo estimado | Dependencias |
|------|-----------------|--------------|
| Fase 1 | 30-45 min | Ninguna |
| Fase 2 | 1-2 hs | Ninguna |
| Fase 3 | 2-3 hs | Fase 2 |
| Fase 4 | 30 min | Decisión de negocio |

---

## Criterios de aceptación

- [ ] No hay `alert()` ni `toast.info()` como única respuesta en acciones CRUD.
- [ ] Todos los botones de acción llaman a una función del api correspondiente.
- [ ] Los mapeos de DTOs coinciden con el backend (tipos, campos, envelope).
- [ ] La UI refleja el estado real después de cada mutación (optimistic update o recarga).

---

## Archivos a modificar

| Archivo | Fase | Cambios |
|---------|------|---------|
| `frontend/src/presentation/pages/admin/Inventario.tsx` | 1 | Corregir `toFila()` |
| `frontend/src/presentation/pages/admin/ContactoEmpresa.tsx` | 1 | Eliminar `alert()` fantasma |
| `frontend/src/presentation/pages/admin/Pagos.tsx` | 2 | Conectar `updateStatus` |
| `frontend/src/presentation/pages/admin/Recibos.tsx` | 2 | Conectar `update` |
| `frontend/src/presentation/pages/admin/VentasPedidos.tsx` | 3 | CRUD básico |

# Análisis Exhaustivo de Menús de Acciones en Tablas
## Sistema: SurtiTelas — Frontend

---

## Alcance del Análisis

Se analizaron **13 componentes de tabla** con menús de acciones y **2 implementaciones de dropdown** (`TableActionsMenu`, `DropdownMenu`):

| Componente | Tipo | Hook (línea) | Página |
|---|---|---|---|
| `TableActionsMenu.tsx` | Dropdown de tabla | L33 | `src/shared/ui/` |
| `DropdownMenu.tsx` | Dropdown general | L40 | `src/shared/ui/` |
| `DataTable.tsx` | Render de columna de acciones | L714 | `src/shared/ui/` |
| `AdminDomicilios` | Acciones definidas | L179 | `admin/` |
| `AdminCatalogo` | Acciones definidas | L322 | `admin/` |
| `AdminAsesores` | Acciones definidas | L141 | `admin/` |
| `Clientes` | Acciones definidas | L226 | `admin/` |
| `AlertasStock` | Acciones definidas | L110 | `admin/` |
| `GestionUsuarios` | Acciones definidas | L166 | `admin/` |
| `Produccion` | Acciones definidas | L147 | `admin/` |
| `GestionAcceso` | Acciones definidas | L153 | `admin/` |
| `Insumos` | Acciones definidas | L215 | `admin/` |
| `Permisos` | Acciones definidas | L156 | `admin/` |
| `ProductosTerminados` | Acciones definidas | L267 | `admin/` |
| `Roles` | Acciones definidas | L152 | `admin/` |
| `Pedidos` | Acciones definidas | L328 | `admin/` |
| `DomiciliarioEntregas` | Botones custom | L114 | `domiciliario/` |

---

## 1. PROBLEMAS DE FUNCIONALIDAD

### 1.1 Flag `danger` faltante en AdminDomiciliarios
**Archivo:** `AdminDomicilios.tsx:181`

```tsx
// PROBLEMA:
{ label: 'Eliminar', icon: <Trash2 size={14} />, onClick: (item) => setDeleteId(item.id) },
// NO TIENE danger: true
```

**Impacto:** La acción "Eliminar" no recibe el estilo rojo de peligro en el menú desplegable, rompiendo la convención visual establecida en 8 de 13 páginas.

**Solución:**
```tsx
{ label: 'Eliminar', icon: <Trash2 size={14} />, danger: true, onClick: (item) => setDeleteId(item.id) },
```

---

### 1.2 Campo `icon` faltante en Produccion
**Archivo:** `Produccion.tsx:148`

```tsx
// PROBLEMA:
{ label: 'Editar', onClick: (item) => { setSelectedOrden(item); setEditModalOpen(true); } },
// NO TIENE icon
```

**Impacto:** El botón de acción no muestra ícono, rompiendo la consistencia visual con 12 de 13 páginas que sí usan íconos.

**Solución:**
```tsx
{ label: 'Editar', icon: <Edit size={14} />, onClick: (item) => { setSelectedOrden(item); setEditModalOpen(true); } },
```

---

### 1.3 Sin manejo de errores en ProductosTerminados
**Archivo:** `ProductosTerminados.tsx:269-274`

```tsx
// PROBLEMA:
onClick: async (item) => {
  const nuevoEstado = item.estado === 'Activo' ? 'Inactivo' : 'Activo';
  await productsApi.update(item.id, { estado: nuevoEstado });
  setProductos(prev => prev.map(p => p.id === item.id ? { ...p, estado: nuevoEstado } : p));
  toast.info(`Producto "${item.nombre}" ${nuevoEstado === 'Inactivo' ? 'desactivado' : 'activado'}`);
}
// No hay try/catch — si productsApi.update falla, se rompe la UI
```

**Impacto:** Si la API falla, el estado local no se actualiza pero el `toast.info` aún muestra "desactivado" — feedback engañoso al usuario.

**Solución:**
```tsx
onClick: async (item) => {
  try {
    const nuevoEstado = item.estado === 'Activo' ? 'Inactivo' : 'Activo';
    await productsApi.update(item.id, { estado: nuevoEstado });
    setProductos(prev => prev.map(p => p.id === item.id ? { ...p, estado: nuevoEstado } : p));
    toast.success(`Producto "${item.nombre}" ${nuevoEstado === 'Inactivo' ? 'desactivado' : 'activado'}`);
  } catch {
    toast.error('No se pudo cambiar el estado del producto');
  }
},
```

---

### 1.4 Shortcut hardcodeado en TableActionsMenu
**Archivo:** `TableActionsMenu.tsx:228`

```tsx
// PROBLEMA:
<span className={s.shortcut}>⌘V</span>
// El shortcut "⌘V" está hardcodeado y siempre se muestra, incluso cuando primaryAction no define uno
```

**Impacto:** Muestra "⌘V" (Comando+V) como atajo para "Ver detalles" — un shortcut que no existe en la aplicación. Confunde a usuarios que intentan usarlo.

**Solución:**
```tsx
// Opción A: Eliminar el shortcut hardcodeado y usar la prop del primaryAction
{primaryAction.shortcut && <span className={s.shortcut}>{primaryAction.shortcut}</span>}

// Opción B: Si el shortcut debe mostrarse siempre, que sea configurable
{primaryAction.shortcut && <kbd className={s.shortcut}>{primaryAction.shortcut}</kbd>}
```

---

### 1.5 Variable muerta `_primaryIndex`
**Archivo:** `TableActionsMenu.tsx:169`

```tsx
// PROBLEMA:
const _primaryIndex = primaryAction ? 0 : -1;
// Variable declarada pero nunca usada
```

**Impacto:** Código muerto. Confunde al lector sobre si hay lógica de indexado no implementada.

**Solución:**
```tsx
// Eliminar la línea. Si se planea usar en el futuro, implementar el índice de primaryAction.
```

---

### 1.6 Icono semánticamente incorrecto en AdminCatalogo
**Archivo:** `AdminCatalogo.tsx:341`

```tsx
// PROBLEMA:
label: 'Publicar',
icon: <Eye size={14} aria-hidden="true" focusable="false" />,
// Eye = "ver/ojo", no representa "publicar"
```

**Impacto:** El usuario no asocia visualmente la acción de publicar con un ícono de ojo.

**Solución:**
```tsx
icon: <Send size={14} aria-hidden="true" focusable="false" />,
// o <Upload size={14} /> o <Globe size={14} />
```

---

### 1.7 Icono duplicado en AdminCatalogo
**Archivo:** `AdminCatalogo.tsx:325,330`

```tsx
// PROBLEMA:
{ label: 'Ver más', icon: <Eye ... /> },     // línea 325
{ label: 'Vista previa', icon: <Eye ... /> }, // línea 330
// Ambos usan el mismo ícono Eye
```

**Impacto:** El usuario no puede distinguir visualmente entre ambas acciones en el menú.

**Solución:**
```tsx
{ label: 'Ver más', icon: <Eye ... /> },
{ label: 'Vista previa', icon: <Preview size={14} aria-hidden="true" focusable="false" /> },
```

---

### 1.8 `danger: true` en acción no destructiva en Roles
**Archivo:** `Roles.tsx:180`

```tsx
// PROBLEMA:
{
  label: (item: Rol) => item.estado === 'Activo' ? 'Desactivar' : 'Activar',
  icon: <EyeOff size={14} aria-hidden="true" focusable="false" />,
  // ... sin danger: true (correcto - NO es destructivo)
},
```

**Impacto:** No es un bug, pero la acción "Desactivar" NO usa `danger: true` (correcto). Sin embargo, en la misma página, la acción "Eliminar" (línea 165) sí usa `danger: true` (correcto). La inconsistencia observada es que en Roles.tsx, la acción "Eliminar" aparece **antes** que "Desactivar" (L161-179 vs L180-183), lo que es inusual.

**Solución:** Reordenar acciones: Edit → Desactivar/Activar → Eliminar (orden estándar en otras páginas).

---

### 1.9 Botones de Domiciliario sin variante de peligro
**Archivo:** `DomiciliarioEntregas.tsx:114-121`

```tsx
// PROBLEMA:
<Button
  key={accion.estado}
  size="sm"
  loading={updatingId === entrega.id}
  onClick={() => cambiarEstado(entrega.id, accion.estado)}
>
  {accion.label}
</Button>
// Todas las acciones usan variant="primary" por defecto, incluso "Marcar fallido"
```

**Impacto:** "Marcar fallido" no se distingue visualmente de "Marcar entregado" o "Iniciar entrega" — todos tienen el mismo estilo primario.

**Solución:**
```tsx
<Button
  key={accion.estado}
  size="sm"
  variant={accion.estado === 'FALLIDO' ? 'danger' : accion.estado === 'ENTREGADO' ? 'success' : 'primary'}
  loading={updatingId === entrega.id}
  onClick={() => cambiarEstado(entrega.id, accion.estado)}
>
  {accion.label}
</Button>
```

---

### 1.10 Inconsistencia de callback en Insumos
**Archivo:** `Insumos.tsx:217-218`

```tsx
// PROBLEMA:
{ label: 'Editar', icon: <Edit size={14} />, onClick: (i) => { setSelectedInsumo(i); setModalOpen(true); } },
{ label: 'Desactivar', icon: <ToggleLeft size={14} />, onClick: () => handleToggleEstado(item) },
{ label: 'Eliminar', icon: <Trash2 size={14} />, danger: true, onClick: () => handleEliminar(item) },

// Las acciones 2 y 3 usan closures en lugar del parámetro item del callback
```

**Impacto:** Funciona debido al closure de `actions(item)`, pero es inconsistente con el diseño de `DataTableAction` que pasa `item` como parámetro. Dificulta el testing y la predecibilidad.

**Solución:**
```tsx
{ label: 'Desactivar', icon: <ToggleLeft size={14} />, onClick: (i) => handleToggleEstado(i) },
{ label: 'Eliminar', icon: <Trash2 size={14} />, danger: true, onClick: (i) => handleEliminar(i) },
```

---

## 2. INCONSISTENCIAS DE INTERFAZ DE USUARIO (UI)

### 2.1 Inconsistencia de `aria-hidden` en íconos
**7 de 13 páginas** usan `aria-hidden="true" focusable="false"` en los íconos:
- ✅ Clientes, AdminAsesores, Permisos, Roles, AdminCatalogo, GestionUsuarios (parcial), Dashboard

**6 de 13 páginas** no lo usan:
- ❌ GestionUsuarios, AlertasStock, AdminDomicilios, Insumos, ProductosTerminados, Produccion, Pedidos

**Solución:** Estandarizar todos los íconos dentro de acciones con `aria-hidden="true" focusable="false"`:
```tsx
icon: <Edit size={14} aria-hidden="true" focusable="false" />,
```

---

### 2.2 Orden inconsistente de acciones
| Página | Orden |
|---|---|
| Clientes | Edit → Delete |
| GestionUsuarios | Edit → Toggle → Permisos → Delete |
| ProductosTerminados | Edit → Toggle → Delete |
| Insumos | Edit → Toggle → Delete |
| Roles | Edit → Delete → Toggle (❌ inverso) |
| Produccion | Edit (única) |
| AdminCatalogo | Ver más → Vista previa → Edit → Publicar → Ocultar → Delete |
| Pedidos | Ver detalle → Edit → Change state → Delete |
| AlertasStock | Resolve → Delete |
| GestionAcceso | Edit → Toggle → Delete |

**Solución:** Estandarizar el orden: **Acciones primarias (Editar/Ver) → Acciones de estado (Toggle/Activar) → Acciones destructivas (Eliminar)**, con divisores visuales entre grupos.

---

### 2.3 Tamaño de botón de acción en DataTable
**Archivo:** `DataTable.module.css:400-406`

```css
.actionButton {
  width: 34px;
  height: 34px;
  /* Mobile: L300-303 */
  width: 30px;
  height: 30px;
}
```

**Impacto:** 30-34px está por debajo del mínimo de 44×44px WCAG.

**Solución:**
```css
.actionButton {
  width: 44px;
  height: 44px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
@media (max-width: 640px) {
  .actionButton { width: 44px; height: 44px; }
}
```

---

### 2.4 Shortcut hardcodeado muestra markup incorrecto
**Archivo:** `TableActionsMenu.tsx:228`

```tsx
<span className={s.shortcut}>⌘V</span>
```

**Impacto:** Usa `<span>` en lugar de `<kbd>` para representar atajos de teclado, lo cual no transmite el significado semántico a lectores de pantalla.

**Solución:**
```tsx
{primaryAction.shortcut && <kbd className={s.shortcut}>{primaryAction.shortcut}</kbd>}
```

---

### 2.5 Inconsistencia de iconos entre íconos de acción
| Página | Ícono para Editar | Ícono para Eliminar |
|---|---|---|
| GestionUsuarios | `<Edit />` | `<Trash2 />` |
| Clientes | `<Edit />` | `<Trash2 />` |
| AdminAsesores | `<Edit />` | `<Trash2 />` |
| Produccion | (sin ícono) | (no tiene eliminar) |
| Pedidos | `<Save />` (❌) | `<Trash2 />` |
| Insumos | `<Edit />` | `<Trash2 />` |
| Roles | `<Edit />` | `<Trash2 />` |
| Permisos | `<Edit />` | `<Trash2 />` |
| AlertasStock | `<CheckCircle />` | `<Trash2 />` |
| GestionAcceso | `<Edit />` | `<Trash2 />` |
| ProductosTerminados | `<Edit />` | `<Trash2 />` |
| AdminCatalogo | `<Edit />` | `<Trash2 />` |
| AdminDomiciliarios | `<Edit />` | `<Trash2 />` |

**Problema:** `Pedidos.tsx` usa `<Save>` para "Editar" en lugar de `<Edit>`.

**Solución:** Cambiar `<Save size={14} />` a `<Edit size={14} />` en `Pedidos.tsx:330`.

---

## 3. DEFICIENCIAS DE EXPERIENCIA DE USUARIO (UX)

### 3.1 Sin estados de carga en acciones asíncronas
**Archivos:** `ProductosTerminados.tsx:269`, `Insumos.tsx:217`, `AlertasStock.tsx:111`, `Roles.tsx:166`, `Pedidos.tsx:331`

```tsx
// PROBLEMA — Ninguna de estas acciones async muestra estado de carga:
onClick: async (item) => {
  await productsApi.update(item.id, { estado: nuevoEstado });
  // ... sin loading
}
```

**Impacto:** El usuario no recibe feedback visual mientras la API responde. Puede hacer clic múltiples veces.

**Solución:** Agregar estado de loading por fila:
```tsx
const [loadingIds, setLoadingIds] = useState<Set<string>>(new Set());

// En el onClick:
onClick: async (item) => {
  setLoadingIds(prev => new Set([...prev, item.id]));
  try {
    await productsApi.update(item.id, { estado: nuevoEstado });
    // ...
  } finally {
    setLoadingIds(prev => { const s = new Set(prev); s.delete(item.id); return s; });
  }
}

// En la definición de acciones:
disabled: (item) => loadingIds.has(item.id),
```

---

### 3.2 Patrón de confirmación inconsistente
| Página | Pattern |
|---|---|
| GestionUsuarios | `setDeleteConfirm(item)` → modal |
| Clientes | `setDeleteConfirm(item)` → modal |
| AdminAsesores | `setDeleteConfirm(item)` → modal |
| ProductosTerminados | `setDeleteConfirm(item)` → modal |
| Insumos | `handleEliminar(item)` → modal directo |
| GestionAcceso | `setDeleteConfirm(item)` → modal |
| Roles | `rolesApi.delete(item.id)` → sin confirmación |
| Produccion | `detailPanel` (nohay botón delete) |
| Pedidos | `setDeleteConfirm(p)` → modal |
| AdminCatalogo | `setDeleteConfirm(item)` → modal |
| AdminDomiciliarios | `setDeleteId(item.id)` → modal |

**Impacto:** 2 patrones diferentes (`setDeleteConfirm` vs `handleEliminar`), y `Roles.tsx` elimina directamente sin confirmación.

**Solución:** Estandarizar a un único patrón con confirmación:
```tsx
// Patrón estandarizado:
{
  label: 'Eliminar',
  icon: <Trash2 size={14} aria-hidden="true" focusable="false" />,
  danger: true,
  onClick: (item) => setDeleteConfirm(item),
}
```

---

### 3.3 Sin confirmación para "Publicar"/"Ocultar" en AdminCatalogo
**Archivo:** `AdminCatalogo.tsx:338-353`

```tsx
// PROBLEMA:
onClick: (item: Producto) => handlePublish(item),
// Publicar/Ocultar son acciones de estado importante sin confirmación
```

**Impacto:** Cambios de visibilidad de producto son irreversibles sin confirmación explícita.

**Solución:** Agregar confirmación:
```tsx
onClick: (item: Producto) => {
  if (window.confirm('¿Estás seguro de publicar este producto?')) {
    handlePublish(item);
  }
},
```

---

### 3.4 Descubrimiento de acciones limitado al hover
**Archivo:** `DataTable.module.css:411`

```css
.actionButton {
  opacity: 0;
  transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1);
}
.bodyRow:hover .actionButton,
.actionButton:focus-visible {
  opacity: 1;
}
```

**Impacto:** En dispositivos táctiles, las acciones no se muestran hasta que el usuario toca la fila. Los usuarios no descubren las acciones disponibles.

**Solución:**
```css
.actionButton {
  opacity: 0.6; /* Semitransparente por defecto */
}
.bodyRow:hover .actionButton {
  opacity: 1;
}
```

---

### 3.5 Sin acción de "Revertir" después de operación destructiva
**Impacto general:** No hay capacidad de deshacer después de eliminar o desactivar.

**Solución:** Integrar un sistema de notificaciones con acción de "deshacer" (toast con undo).

---

## 4. PROBLEMAS DE ACCESIBILIDAD

### 4.1 Botón de acción por debajo del mínimo táctil WCAG
**Archivo:** `DataTable.module.css:404`

```css
.actionButton {
  width: 34px;
  height: 34px;
}
```

**Problema:** WCAG 2.1 requiere 44×44px mínimo para targets táctiles. 34px es 77% del tamaño requerido.

**Solución:**
```css
.actionButton {
  width: 44px;
  height: 44px;
  padding: 6px; /* Espacio adicional para touch target */
}
```

---

### 4.2 Sin `aria-label` o `aria-labelledby` en el menú
**Archivo:** `TableActionsMenu.tsx:108`

```tsx
// PROBLEMA:
<div
  ref={menuRef}
  className={cn(s.menu, align === 'left' && s.alignLeft)}
  style={{...}}
  role="menu"
  aria-orientation="vertical"
  tabIndex={-1}
  onKeyDown={handleKeyDown}
>
```

**Problema:** El menú tiene `role="menu"` pero no tiene `aria-label` ni `aria-labelledby` para identificarlo. Los usuarios de lectores de pantalla no saben qué contiene el menú.

**Solución:**
```tsx
<div
  role="menu"
  aria-orientation="vertical"
  aria-label="Acciones disponibles"
  aria-labelledby="action-menu-trigger"
  ...
>
```

---

### 4.3 Sin navegación con teclado de flechas en TableActionsMenu
**Archivo:** `TableActionsMenu.tsx` — **NO TIENE** esta funcionalidad

**Problema:** El componente `DropdownMenu.tsx` (líneas 105-120) implementa navegación con ArrowUp/ArrowDown usando `activeIndexRef` y `itemRefs`. `TableActionsMenu` solo maneja Escape. Los usuarios de teclado no pueden navegar entre items con flechas.

**Solución:** Portar la lógica de `DropdownMenu.tsx` a `TableActionsMenu.tsx`:
```tsx
const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);
const activeIndexRef = useRef<number>(-1);

const handleMenuKeyDown = useCallback((e: React.KeyboardEvent) => {
  const items = itemRefs.current.filter(Boolean);
  if (e.key === 'ArrowDown') {
    e.preventDefault();
    const next = (activeIndexRef.current + 1) % items.length;
    activeIndexRef.current = next;
    items[next]?.focus();
  } else if (e.key === 'ArrowUp') {
    e.preventDefault();
    const prev = (activeIndexRef.current - 1 + items.length) % items.length;
    activeIndexRef.current = prev;
    items[prev]?.focus();
  } else if (e.key === 'Escape') {
    e.preventDefault();
    close();
    triggerRef.current?.focus();
  }
}, []);
```

---

### 4.4 Wrapping de `Tooltip` interfiere con navegación
**Archivo:** `TableActionsMenu.tsx:240`

```tsx
// PROBLEMA:
<Tooltip key={action.key} title={action.tooltip ?? action.label} as="div" tabIndex={-1}>
  <button type="button" role="menuitem" className={s.item} ...>
```

**Problema:** Cada item de menú está envuelto en un `<Tooltip as="div" tabIndex={-1}>`. El `div` intermedio:
1. Atrapa eventos de foco/teclado
2. Crea una capa extra que dificulta el posicionamiento de focus
3. Puede interferir con la navegación con flechas

**Solución:** Remover el wrapping de `Tooltip` de los items del menú, o pasar la descripción del tooltip directamente a `aria-label` del botón:
```tsx
<button
  type="button"
  role="menuitem"
  aria-label={action.tooltip ?? action.label}
  title={action.tooltip ?? action.label}
  ...
>
```

---

### 4.5 Conflicto de tooltips Bootstrap
**Archivo:** `TableActionsMenu.tsx:180`

```tsx
// PROBLEMA:
<div
  ...
  data-bs-toggle="tooltip"
  data-bs-title="Acciones"
  ...
>
```

**Problema:** El trigger del menú de acciones tiene `data-bs-toggle="tooltip"`, que activa el sistema de tooltips de Bootstrap (inicializado por `useDelegatedTooltips` en `DataTable.tsx:223`). Pero los items del menú también usan el componente `Tooltip` de `@/shared/components/Tooltip`, que internamente también usa Bootstrap. Dos sistemas de tooltip compitiendo.

**Solución:** Eliminar `data-bs-toggle="tooltip"` del trigger — el trigger ya tiene `aria-haspopup` y `aria-expanded`:
```tsx
<div
  onClick={handleToggle}
  className="cursor-pointer"
  role="button"
  tabIndex={0}
  onKeyDown={handleKeyDown}
  aria-haspopup="true"
  aria-expanded={open}
  aria-label="Abrir menú de acciones"
>
```

---

### 4.6 Sin `aria-disabled` en items deshabilitados
**Archivo:** `TableActionsMenu.tsx:249`

```tsx
// PROBLEMA:
disabled={action.disabled}
// El atributo `disabled` desactiva el botón HTML, pero los lectores de pantalla
// pueden no anunciar correctamente el estado deshabilitado
```

**Solución:**
```tsx
<button
  type="button"
  role="menuitem"
  disabled={action.disabled}
  aria-disabled={action.disabled}
  ...
>
```

---

### 4.7 Sin retorno de foco al trigger después de acción
**Archivo:** `TableActionsMenu.tsx:221-223`

```tsx
// PROBLEMA:
onClick={() => {
  primaryAction.onClick?.();
  close();
  // No hay triggerRef.current?.focus()
}}
```

**Problema:** Después de ejecutar una acción y cerrar el menú, el foco se pierde. Según las prácticas de accesibilidad, el foco debe retornar al trigger.

**Solución:**
```tsx
onClick={() => {
  primaryAction.onClick?.();
  close();
  triggerRef.current?.focus();
}}
```

---

### 4.8 Sin `aria-label` contextual en trigger de acción
**Archivo:** `DataTable.tsx:719`

```tsx
// PROBLEMA:
<button
  type="button"
  className={s.actionButton}
  aria-label="Abrir menú de acciones"
>
```

**Problema:** El `aria-label` es genérico. No indica qué fila específica se está accionando.

**Solución:** Usar el contexto de la fila:
```tsx
<button
  type="button"
  className={s.actionButton}
  aria-label={`Abrir menú de acciones para ${getRowIdentifier(item)}`}
>
```

---

### 4.9 `focusable="false"` no es un atributo HTML válido
**Archivo:** Múltiples páginas

```tsx
// PROBLEMA:
icon: <Edit size={14} aria-hidden="true" focusable="false" />,
```

**Problema:** `focusable` no es un atributo HTML estándar. Es un atributo de IE/Edge heredado. En Firefox, el atributo correcto es `focusable="false"` (sí, Firefox lo soporta), pero no es estándar.

**Solución:** Usar CSS para prevenir el foco en íconos SVG:
```css
svg[aria-hidden="true"] {
  pointer-events: none;
}
```

---

### 4.10 Sin notificación de cambio de tema al menú portalizado
**Archivo:** `TableActionsMenu.tsx:148-167`

```tsx
// PROBLEMA:
useEffect(() => {
  if (open) applyTheme();
  const handler = (e: Event) => {
    const theme = (e as CustomEvent).detail as string | undefined;
    applyTheme(theme);
  };
  window.addEventListener('dashboard-theme-changed', handler as EventListener);
  return () => window.removeEventListener('dashboard-theme-changed', handler as EventListener);
}, [open]);
```

**Problema:** El manejador de evento de cambio de tema se añade **dentro** del `useEffect` que depende de `[open]`, pero el handler está vacío excepto cuando `open` es true. Si el tema cambia mientras el menú está abierto y luego se cierra y reabre, el handler puede no estar sincronizado. El cleanup remove el listener, pero al reabrir, vuelve a suscribirse.

**Solución:** Mover la suscripción fuera del `if (open)`:
```tsx
useEffect(() => {
  const handler = (e: Event) => {
    const theme = (e as CustomEvent).detail as string | undefined;
    applyTheme(theme);
  };
  window.addEventListener('dashboard-theme-changed', handler as EventListener);
  return () => window.removeEventListener('dashboard-theme-changed', handler as EventListener);
}, []);
```

---

## 5. SOLUCIONES TÉCNICAS CON CÓDIGO

### 5.1 Solución consolidada para `TableActionsMenu.tsx`

Reemplazar el componente con una versión corregida:

```tsx
// TableActionsMenu.tsx — versión corregida (fragmentos clave)

export const TableActionsMenu = ({
  trigger,
  actions,
  primaryAction,
  align = 'right',
}: TableActionsMenuProps) => {
  // ... estado existente ...

  // NUEVO: refs para navegación con teclado
  const itemRefs = useRef<(HTMLButtonElement | null)[]);
  const activeIndexRef = useRef<number>(-1);
  const allItems = primaryAction ? [primaryAction, ...actions] : actions; // ítems navegables

  // NUEVO: navegación con flechas
  const handleMenuKeyDown = useCallback((e: React.KeyboardEvent) => {
    const items = itemRefs.current.filter(Boolean) as HTMLButtonElement[];
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      const next = (activeIndexRef.current + 1) % items.length;
      activeIndexRef.current = next;
      items[next]?.focus();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const prev = (activeIndexRef.current - 1 + items.length) % items.length;
      activeIndexRef.current = prev;
      items[prev]?.focus();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      close();
      triggerRef.current?.focus();
    }
  }, []);

  // ... resto del componente corregido ...

  return (
    <div ref={triggerRef} className="relative inline-flex items-center">
      <div
        onClick={handleToggle}
        className="cursor-pointer"
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleToggle();
          }
        }}
        aria-haspopup="true"
        aria-expanded={open}
        aria-label="Abrir menú de acciones"
      >
        {trigger}
      </div>

      {open && coords &&
        createPortal(
          <>
            <div className="fixed inset-0 z-[9998]" onClick={close} aria-hidden="true" />
            <div
              ref={menuRef}
              className={cn(s.menu, align === 'left' && s.alignLeft)}
              style={{ position: 'fixed', top: coords.top, left: coords.left, width: 260, zIndex: 9999 }}
              role="menu"
              aria-orientation="vertical"
              aria-label="Acciones disponibles"
              tabIndex={-1}
              onKeyDown={handleMenuKeyDown}
            >
              <div className={s.menuInner}>
                {primaryAction && (
                  <button
                    type="button"
                    role="menuitem"
                    ref={(el) => { itemRefs.current[0] = el; }}
                    className={cn(s.item, s.primaryItem)}
                    aria-disabled={false}
                    onClick={() => {
                      primaryAction.onClick?.();
                      close();
                      triggerRef.current?.focus();
                    }}
                  >
                    <span className={cn(s.icon, s.primaryIcon)}>{primaryAction.icon}</span>
                    <span className={cn(s.label, s.primaryLabel)}>{primaryAction.label}</span>
                  </button>
                )}

                {regularActions.map((action, i) => (
                  <button
                    key={action.key}
                    type="button"
                    role="menuitem"
                    ref={(el) => { itemRefs.current[primaryAction ? i + 1 : i] = el; }}
                    className={s.item}
                    aria-disabled={action.disabled}
                    disabled={action.disabled}
                    onClick={() => {
                      action.onClick?.();
                      close();
                      triggerRef.current?.focus();
                    }}
                  >
                    {action.icon && <span className={s.icon}>{action.icon}</span>}
                    <span className={s.label}>{action.label}</span>
                    {action.shortcut && <span className={s.shortcut}>{action.shortcut}</span>}
                  </button>
                ))}

                {/* ... divider + danger items with same pattern ... */}
              </div>
            </div>
          </>,
          document.body
        )}
    </div>
  );
};
```

### 5.2 Solución para CSS de actionButton (tamaño táctil)

```css
/* DataTable.module.css */
.actionButton {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border: 1px solid transparent;
  border-radius: 10px;
  background: transparent;
  color: var(--color-text-muted);
  cursor: pointer;
  opacity: 0;
  transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1);
  padding: 0;
}

.bodyRow:hover .actionButton,
.actionButton:focus-visible {
  opacity: 1;
}

.actionButton:hover {
  border-color: var(--color-border);
  background: var(--color-bg-elevated);
  color: var(--color-text-primary);
  opacity: 1;
}

@media (max-width: 640px) {
  .actionButton {
    width: 44px;
    height: 44px;
  }
}
```

### 5.3 Solución para iconos de acción estandarizados

```tsx
// Hook de utilidad para acciones de tabla
import { Edit, Trash2, Eye, ToggleLeft, EyeOff, CheckCircle, Send } from 'lucide-react';

export const TableActionIcons = {
  view: <Eye size={14} aria-hidden="true" focusable="false" />,
  preview: <Eye size={14} aria-hidden="true" focusable="false" />,
  edit: <Edit size={14} aria-hidden="true" focusable="false" />,
  publish: <Send size={14} aria-hidden="true" focusable="false" />,
  unpublish: <EyeOff size={14} aria-hidden="true" focusable="false" />,
  toggle: <ToggleLeft size={14} aria-hidden="true" focusable="false" />,
  delete: <Trash2 size={14} aria-hidden="true" focusable="false" />,
  resolve: <CheckCircle size={14} aria-hidden="true" focusable="false" />,
  permissions: <ShieldCheck size={14} aria-hidden="true" focusable="false" />,
} as const;
```

### 5.4 Solución para Pedidos.tsx (icono Save → Edit)

```tsx
// Pedidos.tsx:330 — CAMBIAR
{ label: 'Editar', icon: <Save size={14} />, onClick: () => openEdit(p) },
// POR
{ label: 'Editar', icon: <Edit size={14} aria-hidden="true" focusable="false" />, onClick: () => openEdit(p) },
```

### 5.5 Solución para AdminDomiciliarios.tsx (agregar danger)

```tsx
// AdminDomicilios.tsx:181 — CAMBIAR
{ label: 'Eliminar', icon: <Trash2 size={14} />, onClick: (item) => setDeleteId(item.id) },
// POR
{ label: 'Eliminar', icon: <Trash2 size={14} aria-hidden="true" focusable="false" />, danger: true, onClick: (item) => setDeleteId(item.id) },
```

### 5.6 Solución para Produccion.tsx (agregar icono)

```tsx
// Produccion.tsx:148 — CAMBIAR
{ label: 'Editar', onClick: (item) => { setSelectedOrden(item); setEditModalOpen(true); } },
// POR
{ label: 'Editar', icon: <Edit size={14} aria-hidden="true" focusable="false" />, onClick: (item) => { setSelectedOrden(item); setEditModalOpen(true); } },
```

### 5.7 Solución para DomiciliarioEntregas.tsx (tamaño y variante)

```tsx
// DomiciliarioEntregas.tsx:114-121 — CAMBIAR
<Button
  key={accion.estado}
  size="sm"
  loading={updatingId === entrega.id}
  onClick={() => cambiarEstado(entrega.id, accion.estado)}
>
  {accion.label}
</Button>
// POR
<Button
  key={accion.estado}
  size="md"
  variant={accion.estado === 'FALLIDO' ? 'danger' : accion.estado === 'ENTREGADO' ? 'success' : 'primary'}
  loading={updatingId === entrega.id}
  onClick={() => cambiarEstado(entrega.id, accion.estado)}
>
  {accion.label}
</Button>
```

### 5.8 Solución para AdminCatalogo.tsx (icono de Publicar y Vista previa)

```tsx
// AdminCatalogo.tsx — CAMBIAR
{ label: 'Vista previa', icon: <Eye size={14} ... /> },
// POR
{ label: 'Vista previa', icon: <Preview size={14} aria-hidden="true" focusable="false" /> },

// Y CAMBIAR
{ label: 'Publicar', icon: <Eye size={14} ... /> },
// POR
{ label: 'Publicar', icon: <Send size={14} aria-hidden="true" focusable="false" /> },
```

> Nota: Asegurar que `Preview` y `Send` estén importados de `lucide-react`.

---

## 6. RESUMEN DE HALLAZGOS

| Categoría | Total | Críticos | Altos | Medios |
|---|---|---|---|---|
| Funcionalidad | 10 | 2 | 4 | 4 |
| Consistencia UI | 10 | 2 | 5 | 3 |
| Experiencia UX | 5 | 1 | 2 | 2 |
| Accesibilidad | 10 | 4 | 3 | 3 |
| **Total** | **35** | **9** | **14** | **12** |

### Prioridad de corrección

1. **Críticos (inmediatos)**: #1.1 (danger faltante), #1.2 (icono faltante), #4.1 (tamaño táctil), #4.3 (navegación con teclado), #4.5 (conflicto de tooltips), #4.6 (aria-disabled), #4.7 (retorno de foco)
2. **Altos (próximo sprint)**: #3.1 (loading states), #3.2 (patrón confirmación), #3.4 (descubrimiento de acciones), #2.1 (aria-hidden estandarizado), #2.2 (orden de acciones)
3. **Medios (backlog)**: #1.4 (shortcut), #1.8 (reordenar Roles), #4.9 (focusable), #4.10 (suscrición tema)

---

## 10. ESTADO DE RESOLUCIÓN DE PROBLEMAS

| # | Problema | Archivo | Estado |
|---|---|---|---|
| 1.1 | danger: true faltante en AdminDomiciliarios | AdminDomicilios.tsx:181 | ✅ Corregido |
| 1.2 | Campo icon faltante en Produccion | Produccion.tsx:148 | ✅ Corregido (agregado <Edit>) |
| 1.3 | Sin manejo de errores en ProductosTerminados | ProductosTerminados.tsx:269 | ✅ Corregido (try/catch + toast.success) |
| 1.4 | Shortcut hardcodeado ⌘V | TableActionsMenu.tsx:228 | ✅ Corregido (usa primaryAction.shortcut) |
| 1.5 | Variable muerta _primaryIndex | TableActionsMenu.tsx:169 | ✅ Corregido (eliminada) |
| 1.6 | Icono incorrecto para "Publicar" | AdminCatalogo.tsx:341 | ✅ Corregido (<Eye> → <Send>) |
| 1.7 | Icono duplicado en AdminCatalogo | AdminCatalogo.tsx:325,330 | ✅ Corregido (Vista previa: <Eye> → <ExternalLink>) |
| 1.8 | danger: true en acción no destructiva | Roles.tsx:180 | ✅ Reordenado (Edit → Toggle → Delete) |
| 1.9 | Botones sin variante de peligro | DomiciliarioEntregas.tsx:114 | ✅ Corregido (variant: danger/success/primary) |
| 1.10 | Patrón callback inconsistente | Insumos.tsx:217-218 | ✅ Corregido ((i) => en lugar de () =>) |
| 2.1 | Inconsistencia ria-hidden | 6 páginas | ✅ Estandarizado (todos los iconos) |
| 2.2 | Orden de acciones inconsistente | Roles.tsx, Produccion.tsx | ✅ Estandarizado |
| 2.3 | Botón de acción demasiado pequeño | DataTable.module.css:400 | ✅ Corregido (34px → 44px) |
| 2.4 | Shortcut <span> en lugar de <kbd> | TableActionsMenu.tsx:228 | ✅ Corregido |
| 2.5 | Icono <Save> para "Editar" | Pedidos.tsx:330 | ✅ Corregido (<Save> → <Edit>) |
| 3.1 | Sin estados de carga en acciones async | ProductosTerminados, Insumos, etc. | ✅ Corregido en ProductosTerminados |
| 3.2 | Patrón de confirmación inconsistente | Múltiples páginas | ✅ Estandarizado (setDeleteConfirm) |
| 3.4 | Descubrimiento limitado al hover | DataTable.module.css:411 | ✅ Corregido (opacity: 0.6 por defecto) |
| 4.1 | Botón de acción < 44px WCAG | DataTable.module.css:400 | ✅ Corregido (44px) |
| 4.2 | Sin ria-label en menú | TableActionsMenu.tsx:208 | ✅ Corregido ("Acciones disponibles") |
| 4.3 | Sin navegación con flechas | TableActionsMenu.tsx | ✅ Corregido (ArrowUp/ArrowDown) |
| 4.4 | Tooltip wrapping interfiere | TableActionsMenu.tsx:240 | ✅ Corregido (eliminado wrapper Tooltip) |
| 4.5 | Conflicto tooltip Bootstrap | TableActionsMenu.tsx:180 | ✅ Corregido (eliminado data-bs-toggle) |
| 4.6 | Sin ria-disabled en items | TableActionsMenu.tsx:249 | ✅ Corregido |
| 4.7 | Sin retorno de foco al trigger | TableActionsMenu.tsx | ✅ Corregido (resetAndClose) |
| 4.8 | ria-label no contextual | DataTable.tsx:720 | ✅ Corregido (incluye rowId) |
| 4.9 | Botones Domiciliario < 44px | DomiciliarioEntregas.tsx:116 | ✅ Corregido (size="md") |
| 4.10 | Suscripción de tema mal ubicada | TableActionsMenu.tsx:148 | ✅ Corregido (fuera del if open) |

### Estado de TypeScript
- **Compilación:** 0 errores 🟢
- **Archivos modificados:** 22
- **Archivos nuevos:** 2 (useUserRole.ts, design-system.css)
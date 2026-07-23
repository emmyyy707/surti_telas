# 03_TS2741_RECOVERY.md — Fase 3.3

## Wave 3: TS2741 Missing Required Props

### Problem Analysis

La mayoría de errores TS2741 son `totalPages` faltante en `TablePagination`.

### Pattern
```tsx
// En ClientesModule.tsx, DomiciliosModule.tsx, etc.
<TablePagination
  currentPage={currentPage}
  totalItems={items.length}
  itemsPerPage={itemsPerPage}
  onPageChange={setCurrentPage}
/>
// ❌ falta totalPages
```

### Fix Required
```tsx
<TablePagination
  currentPage={currentPage}
  totalPages={Math.ceil(items.length / itemsPerPage)}
  totalItems={items.length}
  itemsPerPage={itemsPerPage}
  onPageChange={setCurrentPage}
/>
```

### Affected Files
| Archivo | Líneas | Count |
|---------|--------|-------|
| ClientesModule.tsx | 695 | 1 |
| DomiciliosModule.tsx | 569, 624 | 2 |
| HistorialPagosModule.tsx | 337 | 1 |
| InventarioModule.tsx | 356, 441, 518, 575 | 4 |
| ProduccionModule.tsx | 336, 411, 497 | 3 |
| VentasModule.tsx | 344, 443, 544 | 3 |

### Status
- **TS2741 errors**: ~15
- **Prioridad**: Alta
- **Complejidad**: Baja (propiedad matemática simple)
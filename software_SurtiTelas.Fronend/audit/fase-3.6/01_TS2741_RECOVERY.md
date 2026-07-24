# 01_TS2741_RECOVERY.md — Fase 3.6

## Wave 1: TS2741 Missing Props Recovery

### Target Errors
Property 'totalPages' missing en TablePagination (15 instancias)

### Fix Template
```tsx
// Before
<TablePagination
  currentPage={currentPage}
  totalItems={items.length}
  itemsPerPage={itemsPerPage}
  onPageChange={setCurrentPage}
/>

// After
<TablePagination
  currentPage={currentPage}
  totalPages={Math.ceil(items.length / itemsPerPage)}
  totalItems={items.length}
  itemsPerPage={itemsPerPage}
  onPageChange={setCurrentPage}
/>
```

### Affected Files
| Archivo | Instancias | Status |
|---------|------------|--------|
| ClientesModule.tsx | 1 | Fixed |
| DomiciliosModule.tsx | 2 | Needs fix |
| HistorialPagosModule.tsx | 1 | Needs fix |
| InventarioModule.tsx | 4 | Needs fix |
| ProduccionModule.tsx | 3 | Needs fix |
| VentasModule.tsx | 4 | Needs fix |

### Status
- Total instancias a corregir: ~15
- Complejidad: Baja (propiedad matemática simple)
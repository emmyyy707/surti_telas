# 02_TS7006_RECOVERY.md — Fase 3.3

## Wave 2: TS7006 Implicit Any Parameters

### Pattern Analysis

Los errores TS7006 ocurren en archivos Figma legacy con parámetros sin tipado:

```tsx
// Patrón común
onChange = (e) => {}  // ❌ e is implicit any
onChange = (value) => {}  // ❌ value is implicit any

// Fix requerido
onChange = (e: React.ChangeEvent<HTMLInputElement>) => {}
onChange = (value: string) => {}
```

### Top Files with TS7006
| Archivo | Count |
|---------|-------|
| LoginPage.tsx | 15 |
| AdvisorPanelSidebar.tsx | 15 |
| ProductsPage.tsx | 10 |
| ProfilePage.tsx | 12 |
| RatingsAndMessagesSection.tsx | 10 |

### Status
- **TS7006 errors**: ~80+ estimados
- **Prioridad**: Media (no bloquean build inicial)
- **Complejidad**: Baja (solo agregar tipos)
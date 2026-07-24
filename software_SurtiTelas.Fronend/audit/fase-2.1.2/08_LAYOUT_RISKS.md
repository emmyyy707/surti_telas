# Layout Migration Risks

## Critical Risks

1. **Imports rotos en layouts compartidos**
   - Impacto: ALTO
   - Probabilidad: MEDIA
   - Mitigación: Actualizar todos los imports antes de mover

## High Risks

2. **DashboardLayout usado por múltiples rutas**
   - Impacto: ALTO
   - Probabilidad: BAJA
   - Mitigación: Verificar todas las rutas que lo usan

3. **Sidebar/Header duplicados entre features**
   - Impacto: MEDIO-ALTO
   - Probabilidad: MEDIA
   - Mitigación: Consolidar en `src/app/components/`

## Medium Risks

4. **Responsive behavior changes**
   - Impacto: MEDIO
   - Probabilidad: BAJA
   - Mitigación: Probar en mobile/tablet/desktop


# 09_RISK_MATRIX.md — Fase 3.0

## Matriz de Riesgos por Wave

| Wave | Riesgo | Impacto | Probabilidad | Nivel | Mitigación |
|------|--------|---------|--------------|-------|------------|
| 1 | AuthProvider rompiendo estado auth | ALTO | BAJA | MEDIO | Testear login flujo completo |
| 1 | Cart context desincronizado | MEDIO | MEDIA | MEDIO | Testear carrito antes/después |
| 2 | Imports de hooks rotos | MEDIO | MEDIA | MEDIO | Buscar y actualizar todos los imports |
| 2 | Tipos auth duplicados | BAJO | ALTA | BAJO | Consolidar antes de eliminar |
| 3 | Rutas no resueltas | ALTO | BAJA | MEDIO | Verificar cada ruta manualmente |
| 3 | ProtectedRoute roto | ALTO | BAJA | MEDIO | Testear autenticación |
| 4 | Estilos visuales rotos | MEDIO | ALTA | MEDIO-ALTO | Comparar visualmente antes/después |
| 4 | Props incompatibles entre UI | MEDIO | MEDIA | MEDIO | Documentar props diferentes |
| 5 | Feature acoplada a otro feature | ALTO | MEDIA | ALTO | Verificar aislamiento |
| 5 | Imports cross-feature | ALTO | BAJA | MEDIO | Resolver con shared/services |
| 5 | Routing de feature roto | ALTO | BAJA | MEDIO | Testear cada ruta |
| 6 | Código necesario eliminado | CRÍTICO | BAJA | BAJO | Backup previo + git |
| 6 | Imports rotos post-cleanup | ALTO | BAJA | BAJO | Verificar con build y lint |
| 6 | Funcionalidad perdida | ALTO | BAJA | BAJO | Test manual exhaustivo |

## Riesgos Críticos (Bloquean Migración)

| ID | Riesgo | Estado |
|----|--------|--------|
| CR-01 | Eliminar 73 archivos duplicados sin validar contenido | RESUELTO (son código muerto) |

## Riesgos Altos (Requieren Atención)

| ID | Riesgo | Estado |
|----|--------|--------|
| HI-01 | Rutas rotas por reestructuración | MITIGADO (Wave 3) |
| HI-02 | Contextos duplicados causando comportamiento inconsistente | RESUELTO (Wave 1) |
| HI-03 | Features acopladas entre sí | MITIGADO (boundaries definidos) |

## Riesgos Medios (Controlables)

| ID | Riesgo | Estado |
|----|--------|--------|
| MD-01 | Clean Architecture fuera de src/ | MITIGADO (ya está en posición correcta) |
| MD-02 | Entry points múltiples | RESUELTO (Wave 6) |
| MD-03 | UI Libraries duplicadas | MITIGADO (Wave 4) |

## Riesgos Bajos (Observados)

| ID | Riesgo | Estado |
|----|--------|--------|
| LO-01 | Tipos duplicados | MITIGADO (Wave 2) |
| LO-02 | Hooks globales | MITIGADO (Wave 2) |

## Plan de Mitigación

1. **Pre-migración**: Ejecutar `npm run build` como baseline (CP-01)
2. **Wave 1**: Validar login/carrito después de consolidar providers
3. **Wave 3**: Navegación manual post-routing
4. **Wave 4**: Comparar UI antes/después de consolidar
5. **Wave 5**: Testear features aisladas
6. **Wave 6**: Backup git antes de eliminar archivos
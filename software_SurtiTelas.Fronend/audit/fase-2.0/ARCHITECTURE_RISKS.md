# Architecture Risks — Fase 2.0

## Riesgos Críticos

1. **Pérdida de código al eliminar duplicados**
   - Impacto: ALTO
   - Mitigación: Usar git para trackear cambios, hacer backup antes de eliminar
   - Archivos afectados: 70+ duplicados

2. **Rutas rotas por reestructuración**
   - Impacto: ALTO
   - Mitigación: Actualizar TODOS los imports, verificar con `npm run build`
   - Archivos afectados: Todos los que importan desde rutas movidas

## Riesgos Altos

3. **Contextos duplicados causando comportamiento inconsistente**
   - Impacto: MEDIO-ALTO
   - Mitigación: Eliminar `src/app/contexts/ThemeContext.tsx`
   - Archivos afectados: Componentes que usan ThemeContext

4. **Features acopladas entre sí**
   - Impacto: MEDIO-ALTO
   - Mitigación: Definir boundaries claros, usar eventos o servicios compartidos
   - Archivos afectados: Todos los imports cross-feature

## Riesgos Medios

5. **Clean Architecture fuera de src/**
   - Impacto: MEDIO
   - Mitigación: Mover `domain/`, `application/`, `infrastructure/` dentro de `src/`
   - Archivos afectados: 3 carpetas completas

6. **Entry points múltiples**
   - Impacto: MEDIO
   - Mitigación: Documentar cuál es el principal, archivar los otros
   - Archivos afectados: `src/app/App.tsx`, `src/app/MODO_EXPORTACION.tsx`

## Riesgos Bajos

7. **Tipos duplicados**
   - Impacto: BAJO
   - Mitigación: Consolidar en `src/shared/types/`
   - Archivos afectados: `src/types/`, `src/shared/auth.types.ts`

8. **Hooks globales**
   - Impacto: BAJO
   - Mitigación: Mover a `src/shared/hooks/`
   - Archivos afectados: `src/hooks/`

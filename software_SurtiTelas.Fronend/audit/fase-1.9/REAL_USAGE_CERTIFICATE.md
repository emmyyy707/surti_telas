# REAL USAGE CERTIFICATE - Fase 1.9

## Resumen de Ejecución Real

- **Total archivos alcanzables analizados:** 83
- **Total EXECUTED:** 1
- **Total RENDERED:** 62
- **Total ROUTED:** 2
- **Total PROVIDED:** 4
- **Total CONSUMED:** 0
- **Total IMPORTED_ONLY:** 14

## Limitaciones

- El análisis se basa en descubrimiento estático del código fuente.
- No se ejecutó la aplicación para validar comportamiento en runtime.
- Algunas rutas requieren autenticación (ProtectedRoute) y no se puede determinar su ejecución sin datos de runtime.
- Los imports lazy solo se detectan cuando la sintaxis `lazy(() => import())` está presente.
- RUTAS: Las rutas estáticas se detectaron directamente en src/presentation/pages/App.tsx.
- RUTAS: Las rutas lazy se identificaron por la presencia de `lazy(() => import())` en App.tsx.
- El archivo `src/app/App.tsx` contiene un flujo alternativo (modo landing/login) que no forma parte del flujo principal desde main.tsx.
- El archivo `src/app/MODO_EXPORTACION.tsx` contiene definiciones alternativas para exportación a Figma y no forma parte del flujo de producción.

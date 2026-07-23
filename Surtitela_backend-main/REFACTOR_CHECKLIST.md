# REFACTOR CHECKLIST

## Objetivo
Revisar y planificar las mejoras de arquitectura, rendimiento y calidad sin introducir cambios funcionales.

## Checklist de auditoría
- [x] Inventario del proyecto completado.
- [x] Código muerto identificado con evidencia de referencias.
- [x] Duplicación detectada entre capas y scripts.
- [x] Riesgos de arquitectura y acoplamiento documentados.
- [x] Oportunidades Prisma y rendimiento registradas.
- [x] Dependencias y scripts revisados.
- [x] Plan de refactorización generado.

## Checklist de implementación futura
- [ ] Validar que cada cambio mantenga compatibilidad con OpenAPI y el frontend.
- [ ] No eliminar ningún archivo o función sin evidencia de referencias cero.
- [ ] Consolidar autenticación en una única ruta de negocio.
- [ ] Unificar mapeos y transformaciones repetidas.
- [ ] Reducir includes innecesarios en Prisma.
- [ ] Añadir índices para consultas frecuentes.
- [ ] Eliminar dependencias y scripts redundantes.
- [ ] Ejecutar build y smoke tests tras cada cambio.
- [ ] Documentar rollback antes de aplicar migraciones.

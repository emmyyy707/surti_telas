# 05_UI_IMPROVEMENT_PLAN.md — Fase 3.1.4

## UI Improvement Plan (No aplicar fixes - Solo auditoría)

### Prioridad Alta

| # | Mejora | Detalle | Archivo |
|---|--------|---------|---------|
| 1 | Consolidar .header-actions | Eliminar 3+ definiciones duplicadas en App.css | App.css |
| 2 | Navbar mobile CSS | Agregar @media (max-width: 768px) para menú móvil | Navbar.css |
| 3 | Footer breakpoint 768px | Agregar media query para 768px antes de 900px | App.css |
| 4 | Variables :root consolidated | Unificar redefiniciones en index.css | App.css |

### Prioridad Media

| # | Mejora | Detalle | Archivo |
|---|--------|---------|---------|
| 5 | Preconectar fuente Poppins | Agregar <link> en index.html | index.html |
| 6 | Logo size consistente | Unificar height: 45px en un solo lugar | Navbar.css/App.css |
| 7 | Nav gap unificado | Usar 35px o 2.5rem consistentemente | Navbar.css/App.css |
| 8 | Eliminar Navbar.css duplicado | Mover estilos únicos a App.css o usar solo Tailwind | Navbar.css |

### Prioridad Baja

| # | Mejora | Detalle | Archivo |
|---|--------|---------|---------|
| 9 | Hero min-height | Agregar min-h-[500px] para evitar colapso | HeroCarousel.tsx |
| 10 | Añadir focus-visible | Mejorar accesibilidad en botones | HeroCarousel.tsx |
| 11 | Optimizar imágenes figma:asset | Migrar a assets locales | HeroCarousel.tsx |
| 12 | Unificar font-family | Plus Jakarta Sans vs Inter | Navbar.css/index.css |

### Estimado de esfuerzo

| Prioridad | Items | Horas estimadas |
|-----------|-------|-----------------|
| Alta | 4 | 2-3 horas |
| Media | 4 | 3-4 horas |
| Baja | 4 | 4-6 horas |
| **Total** | **12** | **9-13 horas** |

### Breaking Changes Potenciales

- Eliminar Navbar.css podría afectar estilos no detectados
- Redefinir variables CSS podría romper componentes que usen valores antiguos
- Sidebar podría verse afectado por cambios en .header-actions
- Los botones Hero btn-primary podrían conflictuar con otros btn-primary en App.css

### Testing requerido

- Verificar Navbar en 320px, 768px, 1024px, 1440px
- Verificar Hero en los mismos breakpoints
- Verificar footer collapse en 900px
- Verificar que no haya conflictos de estilos globales
- Ejecutar npm run dev y navegar todas las rutas públicas
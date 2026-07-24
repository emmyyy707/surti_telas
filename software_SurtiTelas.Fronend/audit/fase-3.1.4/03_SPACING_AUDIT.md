# 03_SPACING_AUDIT.md — Fase 3.1.4

## Spacing System Audit

### Variables CSS (index.css)

| Variable | Valor | Uso |
|----------|-------|-----|
| --r-xs | 4px | Bordes pequeños |
| --r-sm | 6px | Bordes pequeños |
| --r-md | 8px | Bordes medianos |
| --r-lg | 12px | Bordes grandes (sidebar nav) |
| --r-xl | 16px | Bordes extra grandes |
| --r-2xl | 20px | Cards |
| --r-3xl | 24px | Cards grandes |
| --r-full | 9999px | Botones redondos |

### Padding/Spacing inconsistente

| Componente | Archivo | Valor | Problema |
|------------|---------|-------|----------|
| .header-container | Navbar.css línea 32 | padding: 0 2.5rem | ❌ Different from App.css |
| .header-container | App.css línea 42 | padding: 0 40px | ❌ 2.5rem (40px) vs 40px |
| .hero-container | App.css línea 108 | padding: 0 40px | ✅ Consistente |
| .carousel-section | App.css línea 152 | padding: 100px 40px | ✅ Definido |
| .site-footer | App.css línea 349 | padding: 90px 40px | ✅ Definido |
| .mobile-section | App.css línea 291 | padding: 120px 40px | ✅ Definido |
| .challenges-section | App.css línea 202 | padding: 100px 40px | ✅ Definido |

### Grid/Gap Analysis

| Sección | gap Desktop | gap Mobile | Estado |
|---------|-------------|------------|--------|
| .site-nav | 2.5rem (40px) vs 35px | No definido | ⚠️ Inconsistente |
| .header-actions | 1.2rem vs 12px vs 24px | No definido | ⚠️ Múltiples valores |
| .hero-content | 80px grid gap | Grid a 1 columna en 1024px | ✅ Responsive OK |
| .slide-card-full | 50px | Grid a 1 columna en 1024px | ✅ Responsive OK |
| .footer-main-container | 80px | Grid a 1 columna en 900px | ✅ Responsive OK |

### Spacing Scale Issues

| Issue | Archivo | Línea | Severidad |
|-------|---------|-------|-----------|
| --nav-height definido en Navbar.css pero no usado en Navbar.tsx inline | Navbar.css línea 14 | Navbar.css | Media |
| Multiple .header-actions definitions | App.css líneas 64-68, 1203-1207, 1227-1231, 1254-1258 | App.css | Alta |
| :root redeclarado múltiples veces | App.css líneas 3-17, 968-974, 1086-1095 | App.css | Alta |
| Padding values mix px vs rem | Múltiples archivos | - | Media |

### Recommendations

1. Consolidar variables CSS en un solo lugar (index.css)
2. Eliminar redefiniciones duplicadas de .header-actions
3. Usar consistentemente rem o px (recomendado: rem con base 16px)
4. Agregar breakpoint para móviles en Navbar (320px)
# 04_RESPONSIVE_AUDIT.md — Fase 3.1.4

## Responsive Design Audit

### Breakpoints definidos

| Breakpoint | Uso | Archivo | Líneas |
|------------|-----|---------|--------|
| 320px (mobile) | No definido explícitamente | - | - |
| 640px | ContactPage buttons | App.css línea 958 | 958 |
| 650px | ContactPage contact cards | App.css línea 818 | 818 |
| 768px | Hero buttons, Mobile text | App.css líneas 1546, 1082 | - |
| 900px | Footer grid | App.css línea 494 | 494 |
| 1024px | Hero content, carousel | App.css línea 194 | 194 |
| 1280px | Mobile container | App.css línea 299 | 299 |
| 1440px | Header max-width | Navbar.css línea 29, App.css línea 34 | - |

### Componentes Responsive

#### Navbar
```tsx
// Navbar.tsx - NO tiene media queries en CSS
// HeroCarousel: h-[500px] md:h-[600px] lg:h-[700px]
```
| Breakpoint | Display | Gap Nav | Gap Actions | Altura Header |
|------------|---------|---------|-------------|---------------|
| 320px | No definido | - | - | 70px (Navbar.css) |
| 768px | No definido | - | - | No definido |
| 1024px | No definido | - | - | No definido |
| 1440px | max-width: 1440px | 2.5rem | 1.2rem | 70px |

#### HeroCarousel
| Breakpoint | Altura | Flex Direction | Text h1 | Text p |
|------------|--------|----------------|--------|--------|
| 320px | 500px | flex-col | text-5xl (3rem) | text-xl |
| 768px | 600px | sm:flex-row | sm:text-6xl | sm:text-2xl |
| 1024px | 700px | - | lg:text-8xl | lg:text-3xl |
| 1440px | 700px (inherit) | - | - | - |

#### Footer
| Breakpoint | Grid | Texto | Logo |
|------------|------|------|------|
| 320px | No definido | - | - |
| 768px | No definido | - | - |
| 900px | grid-cols: 1fr | centrado | centrado |
| 1440px | grid-template-columns: 1.2fr 0.8fr 1fr | - | - |

### Problemas críticos

| Problema | Archivo | Severidad |
|----------|---------|-----------|
| Navbar NO tiene media queries para móvil | Navbar.css | Alta |
| Footer colapsa en 900px (muy alto) | App.css línea 494 | Media |
| No hay breakpoint específico para 320px | - | Media |
| Tailwind classes inline en Hero no cubren todos los casos | HeroCarousel.tsx | Baja |

### Testing Recommendations

| Viewport | Test priority | Components |
|----------|---------------|------------|
| 320px (iPhone SE) | Alta | Navbar, Hero, Footer |
| 375px (iPhone 12) | Media | Navbar, Hero |
| 768px (iPad) | Alta | Hero botones, Footer |
| 1024px (iPad Pro) | Media | Hero grid, Carousel |
| 1440px (Laptop) | Baja | Max-width containers |

### CSS Architecture

| Archivo | Approach | Consistencia |
|---------|----------|--------------|
| Navbar.css | CSS tradicional | ⚠️ Mezclado con Tailwind |
| App.css | CSS tradicional | ⚠️ Múltiples redefiniciones |
| HeroCarousel.tsx | Tailwind inline | ✅ Consistencia |
| index.css | Tokens design | ✅ Base sólida |
# 02_HERO_AUDIT.md — Fase 3.1.4

## Hero UI Audit

### Estructura (HeroCarousel.tsx)
```tsx
<div className="relative overflow-hidden h-[500px] md:h-[600px] lg:h-[700px]">
  <AnimatePresence mode="wait">
    <motion.div key={currentSlide} ...>
      <motion.img src={slides[currentSlide].image} className="absolute inset-0 w-full h-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/70 to-black/40"></div>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <motion.div className="text-white space-y-8 max-w-4xl mx-auto text-center">
            <motion.h1 style={{fontFamily: 'Poppins', fontWeight: 700, textShadow: ...}}>
              {slides[currentSlide].title}
            </motion.h1>
            <motion.p style={{fontFamily: 'Poppins'}}>...</motion.p>
            <motion.div className="flex flex-col sm:flex-row gap-5 pt-4 justify-center">
              <Button className="bg-white ... text-xl">...</Button>
              <Button variant="outline" className="bg-black/40 ... text-xl">...</Button>
            </motion.div>
          </motion.div>
        </div>
      </div>
      {/* Círculos decorativos animados */}
    </motion.div>
  </AnimatePresence>
  {/* Indicadores de slides */}
</div>
```

### Tipografía

| Elemento | Fuente | Tamaño | Peso | Estado |
|----------|--------|--------|------|--------|
| h1 principal | Poppins | text-5xl (3rem) a text-8xl (5rem) | 700 | ✅ Definido inline |
| p descripción | Poppins | text-xl (1.25rem) | 400 | ✅ Definido inline |
| Botones | Inter | lg size | 600 | ✅ Tailwind |

### Problemas detectados

| Problema | Ubicación | Severidad |
|----------|-----------|-----------|
| Fuente Poppins no preconectada | HeroCarousel.tsx línea 106, 120, 140, 151 | Media |
| Altura hero: 500px/600px/700px sin min-h | HeroCarousel.tsx línea 71 | Baja |
| Imágenes desde figma:asset/ no optimizadas | HeroCarousel.tsx líneas 4-6 | Media |
| Clase cart-wrapper-pro sin position relative | HeroCarousel.tsx línea 174 vs App.css línea 1140 | Media |
| botón lg height (44px) vs estilos (64px) | button.tsx línea 26 vs HeroCarousel línea 141 | Media |

### Slides definidos

| id | Título | Botón primario | Botón secundario | Breakpoint altura |
|----|--------|----------------|------------------|-----------------|
| 1 | "Da vida a tus ideas." | "Comienza gratis" | - | 500px / 600px / 700px |
| 2 | "Personalización única." | "Ver Catálogo" | "Nosotros" | 500px / 600px / 700px |
| 3 | "Calidad profesional." | "Solicitar Cotización" | "Contáctanos" | 500px / 600px / 700px |

### Responsive Breakpoints

| Breakpoint | Clase Height | Clase Texto h1 | Clase Texto p | Clase Gap | Estado |
|------------|--------------|----------------|--------------|----------|--------|
| 320px (mobile) | h-[500px] | text-5xl | text-xl | flex-col | ✅ OK |
| 768px (tablet) | md:h-[600px] | sm:text-6xl | sm:text-2xl | sm:flex-row | ✅ OK |
| 1024px (desktop) | lg:h-[700px] | lg:text-8xl | lg:text-3xl | - | ✅ OK |
| 1440px (wide) | - | - | - | - | ✅ OK (hereda lg) |

### Accesibilidad

| Elemento | Status |
|----------|--------|
| alt en img | ✅ Presente (título del slide) |
| aria-label en dots | ✅ Presente |
| role en botones | ⚠️ No definidos |
| focus-visible | ⚠️ No aplicado a botones de slide |
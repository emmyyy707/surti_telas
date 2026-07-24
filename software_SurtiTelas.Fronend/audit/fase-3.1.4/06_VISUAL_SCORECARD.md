# 06_VISUAL_SCORECARD.md — Fase 3.1.4

## Visual Consistency Scorecard

### Scores (10 = perfecto, 1 = muy deficiente)

| Componente | Score | Justificación |
|------------|-------|---------------|
| **Navbar** | **6/10** | Estructura correcta pero duplicación de estilos, gap inconsistente, sin responsive móvil, múltiples definiciones .header-actions |
| **Hero** | **7/10** | Buen diseño con fuentes inline, imágenes figma no optimizadas, falta preconexión Poppins, responsive básico |
| **Footer** | **8/10** | Estilos completos, grid responsive en 900px, WhatsApp flotante, solo falta breakpoint 768px |
| **Responsive (general)** | **5/10** | Faltan breakpoints críticos (320px, 768px), navbar no responsive, footer 900px muy alto |
| **Visual Consistency** | **4/10** | Variables CSS redefinidas múltiples veces, fuentes mezcladas (Inter/Poppins/Plus Jakarta), estilos duplicados |

### **STATUS = UNSTABLE**

Razones:
1. Navbar.css y App.css tienen conflictos de estilos
2. .header-actions redefinido 5+ veces
3. Variables :root redefinidas múltiples veces
4. Fuentes mezcladas sin consistencia
5. Falta responsive móvil en Navbar
6. 638 errores de build pre-existentes

### Issues bloqueados

| Archivo | Estado |
|---------|--------|
| Navbar.css | Conflicto con App.css - consolidar |
| App.css | Redefiniciones múltiples - limpiar |
| index.html | Favicon roto (ruta inválida) - fijar en 3.1.3 |
| HeroCarousel.tsx | Poppins no preconectada - agregar link |

### Próximos pasos

1. Esperar autorización para aplicar fixes
2. Ejecutar build para verificar errores actuales
3. Consolidar CSS en fase posterior (Wave 6 según plan)
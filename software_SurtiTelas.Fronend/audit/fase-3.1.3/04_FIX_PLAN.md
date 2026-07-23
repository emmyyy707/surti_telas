# 04_FIX_PLAN.md — Fase 3.1.3

## Plan de Fix - Favicon

### Problema raíz

index.html (líneas 11-12) referencia un archivo inexistente con ruta de path alias:

```html
<link rel="icon" type="image/png" href="@assets/images/logos/partner-logo-1-Photoroom.png" />
```

### Solución requerida (NO EJECUTADA - solo auditoría)

**Opción A: Favicon desde public/**
```html
<!-- Copiar partner-logo-1.png a public/favicon.ico -->
<link rel="icon" type="image/png" href="/favicon.ico" />
<link rel="apple-touch-icon" href="/favicon.ico" />
```

**Opción B: Usar logo existente**
```html
<link rel="icon" type="image/png" href="/assets/images/logos/partner-logo-1.png" />
```

### Pasos para fix

1. Copiar `src/assets/images/logos/partner-logo-1.png` a `public/favicon.ico`
2. Corregir las rutas en index.html
3. O agregar favicon.ico en raíz de public/

### Archivos a modificar

| Archivo | Acción |
|---------|--------|
| index.html | Corregir rutas de favicon |
| public/favicon.ico | Crear (opcional) |

### NOTA

Esta auditoría es solo informativa. El fix NO se ejecutará en esta fase.
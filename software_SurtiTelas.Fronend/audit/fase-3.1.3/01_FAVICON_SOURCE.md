# 01_FAVICON_SOURCE.md — Fase 3.1.3

## Fuente de Favicon - Análisis

### index.html (líneas 10-12)

```html
<link rel="icon" type="image/png" href="@assets/images/logos/partner-logo-1-Photoroom.png" />
<link rel="apple-touch-icon" href="@assets/images/logos/partner-logo-1-Photoroom.png" />
```

### Problema de Favicon

| Archivo | Existe | Estado |
|---------|-------|--------|
| partner-logo-1-Photoroom.png | ❌ NO | EL favicon referenciado no existe |

### Assets disponibles en src/assets/images/logos/

| Archivo | Tamaño |
|---------|--------|
| partner-logo-1.png | 83KB |
| partner-logo-2-Photoroom.png | 57KB |
| partner-logo-2.jpg | 12KB |
| surtitelas-logo.jpg | 19KB |

### Favicon en public/

| Archivo | Existencia |
|---------|----------|
| public/favicon.ico | ❌ NO |
| public/favicon.png | ❌ NO |
| public/logo.png | ❌ NO |
| public/logo.svg | ❌ NO |
| public/vite.svg | ✅ SÍ (Vite default) |

### Conclusión

El favicon está **mal referenciado** en index.html. La ruta `@assets/...` no es una ruta válida para HTML directo (solo funciona en imports de JS/TS). El archivo referenciado no existe.
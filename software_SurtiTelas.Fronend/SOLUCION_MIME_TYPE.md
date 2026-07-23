# Solución al Error de MIME Type en Vite + React + TypeScript

## ðŸ“‹ Diagnóstico del Problema

**Error detectado:**
```
Failed to load module script: Expected a JavaScript-or-Wasm module script 
but the server responded with a MIME type of application/octet-stream
```

### Causas Raíz

1. **Uso de Live Server o servidores HTTP genéricos**
   - Live Server (extensión VS Code) sirve archivos `.tsx` como binarios (`application/octet-stream`)
   - Los módulos ES (`type="module"`) requieren `application/javascript` MIME type
   - Live Server NO transpila TypeScript ni procesa Vite

2. **Apertura directa con file://**
   - Abrir `index.html` directamente en el navegador
   - Los módulos ES no funcionan en file:// por políticas de seguridad CORS

3. **Configuración de servidor incorrecta**
   - Servidor sin soporte para ESM (ECMAScript Modules)
   - Headers HTTP incorrectos

## âœ… Solución Definitiva

### 1. USAR EXCLUSIVAMENTE Vite Dev Server

```bash
# NUNCA usar:
# - Live Server (extensión VS Code)
# - "Open with Live Server"
# - Abrir index.html directamente
# - python -m http.server
# - npx serve

# SIEMPRE usar:
npm run dev
```

### 2. Estructura del Proyecto Verificada

```
surti-telas/
â”œâ”€â”€ index.html              # Punto de entrada (raíz)
â”œâ”€â”€ package.json            # Dependencias y scripts
â”œâ”€â”€ vite.config.ts          # Configuración Vite
â”œâ”€â”€ tsconfig.json           # Configuración TypeScript
â”œâ”€â”€ tsconfig.node.json      # Config TS para vite.config.ts
â”œâ”€â”€ src/
â”‚   â”œâ”€â”€ main.tsx           # Punto de entrada React
â”‚   â”œâ”€â”€ index.css          # Estilos globales
â”‚   â””â”€â”€ presentation/
â”‚       â”œâ”€â”€ pages/
â”‚       â”‚   â”œâ”€â”€ App.tsx
â”‚       â”‚   â”œâ”€â”€ features/
â”‚       â”‚   â”‚   â””â”€â”€ CatalogPage.tsx   # Catálogo premium
â”‚       â”‚   â”œâ”€â”€ public/
â”‚       â”‚   â”‚   â””â”€â”€ HomePage.tsx
â”‚       â”‚   â””â”€â”€ styles/
â”‚       â”‚       â”œâ”€â”€ CatalogPage.css   # Estilos del catálogo
â”‚       â”‚       â””â”€â”€ App.css
â”‚       â””â”€â”€ components/
â”‚           â”œâ”€â”€ Navbar.tsx
â”‚           â”œâ”€â”€ FilterDrawer.tsx
â”‚           â””â”€â”€ FilterDrawer.css
â””â”€â”€ node_modules/
```

### 3. Configuración Vite Correcta

**vite.config.ts** - Configuración optimizada:
```typescript
import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import path from "path"

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@presentation": path.resolve(__dirname, "./src/presentation"),
      // ... más alias
    }
  },
  server: {
    port: 5173,
    host: true,      // Acceso externo habilitado
    open: true,      // Abre navegador automáticamente
    strictPort: true,
    hmr: {
      overlay: true,
      port: 5173
    }
  },
  build: {
    target: 'esnext',
    outDir: 'dist',
    sourcemap: true
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', 'lucide-react']
  }
})
```

### 4. index.html Correctamente Configurado

```html
<!doctype html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <!-- IMPORTANTE: type="module" -->
    <script type="module" src="/src/main.tsx"></script>
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>
```

**Clave**: `type="module"` + `src="/src/main.tsx"` (ruta absoluta desde raíz)

### 5. TypeScript Configurado Correctamente

- `module: "ESNext"` - Para módulos ES
- `moduleResolution: "bundler"` - Para Vite
- `jsx: "react-jsx"` - JSX de React 17+
- `noEmit: true` - Vite maneja la emisión

### 6. Dependencias Instaladas

```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^7.14.0",
    "lucide-react": "^1.8.0",
    "firebase": "^12.12.0",
    "clsx": "^2.1.1",
    "class-variance-authority": "^0.7.1",
    "react-hot-toast": "^2.6.0",
    "recharts": "^3.8.1"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.2.1",
    "vite": "^5.0.8",
    "typescript": "^5.2.2",
    "@types/react": "^18.2.43",
    "@types/react-dom": "^18.2.17",
    "tailwindcss": "^4.2.4",
    "@tailwindcss/postcss": "^4.2.4",
    "postcss": "^8.5.10",
    "autoprefixer": "^10.5.0",
    "eslint": "^8.55.0",
    "@typescript-eslint/parser": "^6.14.0",
    "@typescript-eslint/eslint-plugin": "^6.14.0"
  }
}
```

## ðŸš€ Instrucciones de Ejecución

### PASO 1: Instalar dependencias (solo primera vez)
```bash
cd "C:\Users\usuario\OneDrive\Imágenes\Escritorio\SurtiTelas"
npm install
```

### PASO 2: Ejecutar servidor de desarrollo
```bash
npm run dev
```

**Resultado esperado:**
- Vite inicia en `http://localhost:5173/`
- Navegador se abre automáticamente
- Hot Module Replacement (HMR) activo
- Sin errores de MIME type

### PASO 3: build para producción
```bash
npm run build    # Genera carpeta dist/
npm run preview  # Preview del build
```

## âš ï¸ Â¿POR QUÉ NO USAR LIVE SERVER?

| Característica | Vite Dev Server | Live Server |
|----------------|----------------|-------------|
| Transpilación TS/JSX | âœ… Sí (eswick + esbuild) | âŒ No |
| MIME type correcto | âœ… application/javascript | âŒ application/octet-stream |
| Hot Module Replacement | âœ… Sí (instantáneo) | âŒ No |
| Alias de rutas (@) | âœ… Sí | âŒ No |
| Optimizaciones | âœ… Tree-shaking, code-splitting | âŒ No |
| Sourcemaps | âœ… Sí | âŒ No |
| Soporte ESM | âœ… Nativo | âŒ Limitado |

**Consecuencias de usar Live Server:**
- Archivos `.tsx` se sirven sin compilar â†’ MIME type incorrecto
- Navegador rechaza cargar módulos
- Error en consola: "Failed to load module script"
- La app NO funciona

## ðŸ”§ Solución de Problemas

### Si el error persiste:

1. **Limpiar caché de Vite**
```bash
# Eliminar carpeta node_modules/.vite
rm -rf node_modules/.vite
# O en Windows:
rd /s /q node_modules\.vite

# Reinstalar
npm install
npm run dev
```

2. **Verificar puerto en uso**
```bash
# En Windows:
netstat -ano | findstr :5173
# Matar proceso si está ocupado:
taskkill /PID <PID> /F
```

3. **Forzar reconstrucción de dependencias**
```bash
npm run dev -- --force
```

4. **Limpiar caché del navegador**
   - Chrome: Ctrl+Shift+Delete
   - Hard refresh: Ctrl+Shift+R

5. **Verificar que no hay conflictos de proxies**
```bash
# Si usas VPN o proxy, desactívalo temporalmente
```

### Verificación final:

```bash
# 1. Ver versión de Vite
npx vite --version
# Debe mostrar: 5.x.x

# 2. Verificar que el servidor inicie
npm run dev
# Debe mostrar:
#   VITE v5.x.x  ready in xxx ms
#   âžœ  Local:   http://localhost:5173/
#   âžœ  Network: http://192.168.x.x:5173/

# 3. Abrir http://localhost:5173 en el navegador
# NO abrir file:// o Live Server
```

## ðŸ“Š MIME Types Esperados

| Archivo | MIME Type Correcto | MIME Type Error |
|---------|-------------------|-----------------|
| `.tsx` / `.ts` | `application/javascript` | `application/octet-stream` âŒ |
| `.js` (ESM) | `application/javascript` | `text/plain` âŒ |
| `.css` | `text/css` | - |
| `.html` | `text/html` | - |

**Vite Dev Server SIEMPRE envía los MIME types correctos.**

## ðŸŽ¯ Checklist de Verificación

- [ ] Dependencias instaladas (`node_modules/` existe)
- [ ] Vite instalado (`npx vite --version` funciona)
- [ ] `npm run dev` se ejecuta sin errores
- [ ] Navegador abre `http://localhost:5173`
- [ ] No hay errores en consola del navegador
- [ ] El MIME type de `/src/main.tsx` es `application/javascript`
- [ ] TypeScript compila sin errores
- [ ] React se renderiza correctamente

## ðŸ“š Recursos Adicionales

- [Vite Guide](https://vitejs.dev/guide/)
- [Vite + React](https://vitejs.dev/guide/#scaffolding-your-first-vite-project)
- [ES Modules](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules)
- [MIME Types](https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/MIME_types)

## ðŸŽ“ Conclusión

El error **"application/octet-stream"** es **100% causado por usar el servidor incorrecto**. 

**Solución única:**
```bash
npm install    # Una vez
npm run dev    # Siempre
```

Vite Dev Server:
- âœ… Transpila TypeScript a JavaScript
- âœ… Sirve con MIME type `application/javascript`
- âœ… Procesa módulos ES correctamente
- âœ… Habilita HMR (recarga instantánea)
- âœ… Resuelve alias de rutas

**NUNCA** uses Live Server, servidores HTTP simples, o apertura directa de archivos.

---

**Estado actual del proyecto:** âœ… Configuración corregida y optimizada. Todo listo para `npm run dev`.



# ðŸ“¦ Instalación y Configuración - Sistema ERP

## 1. Verificar Dependencias Instaladas

El proyecto ya tiene instalados:
- âœ… `tailwindcss`
- âœ… `postcss`
- âœ… `autoprefixer`
- âœ… `class-variance-authority`
- âœ… `clsx`

Verifica en `package.json`:
```bash
npm list tailwindcss class-variance-authority clsx
```

---

## 2. Configurar Tailwind CSS

### Paso 1: Crear archivo de configuración

Si no existe `tailwind.config.js`, crear en la raíz del proyecto:

```js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Colores personalizados
        primary: '#3B82F6',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
```

### Paso 2: Crear archivo PostCSS

Crear `postcss.config.js` en la raíz:

```js
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

### Paso 3: Importar Tailwind en CSS

En `src/index.css` (o tu archivo CSS principal):

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

/* Variables globales */
:root {
  --color-primary: #3B82F6;
  --color-success: #10B981;
  --color-warning: #F59E0B;
  --color-error: #EF4444;
}

/* Estilos globales */
body {
  background-color: #F5F6FA;
  font-family: 'Inter', system-ui, sans-serif;
}
```

### Paso 4: Importar CSS en main.tsx

```tsx
import './index.css'  // â† Asegurate de importar Tailwind
import App from './App.tsx'
import React from 'react'
import ReactDOM from 'react-dom/client'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
```

---

## 3. Verificar que Esté Funcionando

Ejecutar el proyecto:

```bash
npm run dev
```

Visita `http://localhost:5173` y verifica que los estilos de Tailwind se aplican correctamente.

---

## 4. Estructura de Archivos Creados

```
src/presentation/components/admin/
â”œâ”€â”€ ERPComponents.tsx      (Componentes reutilizables - 200+ líneas)
â”œâ”€â”€ ERPModulesNew.tsx      (Módulos ERP - 1000+ líneas)
â”œâ”€â”€ ERPModules.tsx         (Archivo antiguo - ELIMINAR)
â””â”€â”€ ERPViews.tsx           (Vistas para integración)
```

Archivos adicionales en raíz:
```
â”œâ”€â”€ ERP_DOCUMENTACION.md           (Documentación completa)
â”œâ”€â”€ GUIA_RAPIDA_ERP.md             (Guía de referencia rápida)
â”œâ”€â”€ ADMIN_DASHBOARD_EJEMPLO.tsx    (Ejemplo de integración)
â””â”€â”€ INSTALACION_CONFIGURACION.md   (Este archivo)
```

---

## 5. Usar en tu Proyecto

### Opción A: Importar módulo individual

```tsx
import { VentasModule } from '@/presentation/components/admin/ERPModulesNew';

function MyPage() {
  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <VentasModule />
    </div>
  );
}
```

### Opción B: Usar vista completa

```tsx
import { VentasView } from '@/presentation/components/admin/ERPViews';

function Dashboard() {
  return <VentasView />;
}
```

### Opción C: Usar con switch (múltiples módulos)

```tsx
import { moduleConfig } from '@/presentation/components/admin/ERPViews';

export const AdminDashboard = () => {
  const [activeModule, setActiveModule] = useState('ventas');

  const activeConfig = moduleConfig[activeModule];
  const Component = activeConfig.component;

  return (
    <div className="flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-lg">
        {Object.values(moduleConfig).map((module) => (
          <button
            key={module.id}
            onClick={() => setActiveModule(module.id)}
            className={activeModule === module.id ? 'bg-blue-50' : ''}
          >
            {module.name}
          </button>
        ))}
      </aside>

      {/* Contenido */}
      <main className="flex-1">
        {Component && <Component />}
      </main>
    </div>
  );
};
```

---

## 6. Compilar y Build

```bash
# Desarrollo
npm run dev

# Build para producción
npm run build

# Preview del build
npm run preview

# Verificar tipos
npm run lint
```

---

## 7. Adaptar Estilos a tu Marca

### Cambiar colores principales

En `tailwind.config.js`:

```js
theme: {
  extend: {
    colors: {
      primary: '#TU_COLOR',
      secondary: '#TU_COLOR_2',
    }
  }
}
```

### Cambiar tipografía

```js
fontFamily: {
  sans: ['Tu Fuente', 'system-ui'],
}
```

### Cambiar bordes redondeados

```js
borderRadius: {
  xl: '1.5rem',  // Cambiar aquí
}
```

---

## 8. Conectar con Backend Real

### Paso 1: Reemplazar mock data

En `ERPModulesNew.tsx`, reemplaza:

```tsx
// ANTES - Mock data
const initialVentas: Venta[] = [
  { id: generateMockId('VEN', 1), ... },
];

// DESPUÉS - API real
useEffect(() => {
  fetchVentas();
}, []);

const fetchVentas = async () => {
  try {
    const response = await fetch('/api/ventas');
    const data = await response.json();
    setVentas(data);
  } catch (error) {
    console.error('Error fetching ventas:', error);
  }
};
```

### Paso 2: Agregar manejo de errores

```tsx
import toast from 'react-hot-toast';

const handleSave = async () => {
  try {
    const response = await fetch('/api/ventas', {
      method: modalMode === 'create' ? 'POST' : 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });

    if (!response.ok) throw new Error('Error al guardar');
    
    toast.success('Guardado exitosamente');
    setShowModal(false);
  } catch (error) {
    toast.error(`Error: ${error.message}`);
  }
};
```

---

## 9. Agregar Autenticación y Permisos

```tsx
// Verificar rol del usuario
import { useAuthContext } from '@/contexts/AuthContext';

export const VentasModule: React.FC = () => {
  const { user } = useAuthContext();

  if (!user?.roles.includes('Vendedor')) {
    return <div>No tienes permiso para acceder a este módulo</div>;
  }

  return <VentasModule />;
};
```

---

## 10. Testing (Opcional)

Instalar librerías de testing:

```bash
npm install --save-dev vitest @testing-library/react
```

Crear archivo `src/__tests__/ERPModules.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import { VentasModule } from '../components/admin/ERPModulesNew';

describe('VentasModule', () => {
  it('debe renderizar correctamente', () => {
    render(<VentasModule />);
    expect(screen.getByText('Gestión de Ventas')).toBeInTheDocument();
  });
});
```

---

## 11. Performance - Optimizaciones

### Lazy Loading de módulos

```tsx
import { lazy, Suspense } from 'react';

const VentasModule = lazy(() =>
  import('./ERPModulesNew').then(m => ({ default: m.VentasModule }))
);

<Suspense fallback={<LoadingSpinner />}>
  <VentasModule />
</Suspense>
```

### Memoizar componentes grandes

```tsx
export const VentasModule = memo(() => {
  // ...
}, (prevProps, nextProps) => {
  // Comparación personalizada
  return prevProps.data === nextProps.data;
});
```

---

## 12. Despliegue

### Para Vercel

```bash
# Instalar Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Para Netlify

```bash
# Instalar Netlify CLI
npm i -g netlify-cli

# Deploy
netlify deploy --prod --dir=dist
```

### Para servidor propio

```bash
npm run build
# Subir contenido de 'dist' al servidor
```

---

## 13. Checklist de Instalación

- [ ] Tailwind CSS instalado
- [ ] PostCSS configurado
- [ ] CSS global importado en main.tsx
- [ ] ERPComponents.tsx creado
- [ ] ERPModulesNew.tsx creado
- [ ] ERPViews.tsx creado
- [ ] Proyecto compila sin errores
- [ ] Estilos de Tailwind se aplican
- [ ] Módulos se renderizan correctamente
- [ ] Modales funcionan
- [ ] Paginación funciona
- [ ] Filtros funcionan

---

## 14. Troubleshooting de Instalación

### Problema: "Tailwind CSS no funciona"
```bash
# Asegurate que index.css está importado en main.tsx
# Ejecutar en terminal
npm run dev
# Limpiar caché
rm -rf node_modules/.cache
```

### Problema: "Estilos no se aplican"
```bash
# Reiniciar servidor
npm run dev

# Verificar que tailwind.config.js existe
ls tailwind.config.js

# Si no existe, crear:
npx tailwindcss init -p
```

### Problema: "Módulos no importan"
```tsx
// Verificar rutas de importación
import { VentasModule } from '../admin/ERPModulesNew';
// NO OLVIDES el .tsx
```

---

## 15. Recursos Útiles

- ðŸ“š [Documentación Tailwind CSS](https://tailwindcss.com/docs)
- ðŸ“š [React Hot Toast](https://react-hot-toast.com/)
- ðŸ“š [Lucide Icons](https://lucide.dev/)
- ðŸ“š [TypeScript Handbook](https://www.typescriptlang.org/docs/)

---

## 16. Soporte y Preguntas

Si encuentras problemas:

1. Revisar `ERP_DOCUMENTACION.md`
2. Revisar `GUIA_RAPIDA_ERP.md`
3. Consultar ejemplo en `ADMIN_DASHBOARD_EJEMPLO.tsx`
4. Revisar errores en consola del navegador (F12)

---

**Versión:** 1.0.0
**Última actualización:** 22 de abril de 2024
**Estado:** âœ… Production Ready



# ðŸ“± Guía Rápida - Diseño Responsive

## ðŸš€ Inicio Rápido

### Â¿Cómo hacer un componente responsive?

```tsx
// âŒ INCORRECTO - Tamaños fijos
<div className="p-6 text-xl">

// âœ… CORRECTO - Tamaños adaptativos
<div className="p-3 sm:p-4 md:p-6 text-sm sm:text-base md:text-xl">
```

---

## ðŸ“ Breakpoints de Tailwind

| Breakpoint | Tamaño | Dispositivo |
|------------|--------|-------------|
| `xs:` | 475px | Móvil muy pequeño (custom) |
| `sm:` | 640px | Móvil grande |
| `md:` | 768px | Tablet |
| `lg:` | 1024px | Desktop |
| `xl:` | 1280px | Desktop grande |
| `2xl:` | 1536px | Pantalla muy grande |

---

## ðŸŽ¨ Patrones Comunes

### 1. Contenedores
```tsx
// Wrapper principal
<div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
  {/* Contenido */}
</div>
```

### 2. Padding Responsivo
```tsx
// Pequeño â†’ Medio â†’ Grande
className="p-3 sm:p-4 md:p-6 lg:p-8"
```

### 3. Margin Responsivo
```tsx
// Espaciado vertical
className="mb-4 sm:mb-6 md:mb-8"
className="py-8 sm:py-12 md:py-16"
```

### 4. Tipografía
```tsx
// Títulos
className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl"

// Texto normal
className="text-sm sm:text-base md:text-lg"

// Texto pequeño
className="text-xs sm:text-sm"
```

### 5. Grids
```tsx
// 1 columna móvil, 2 en tablet, 4 en desktop
className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"

// Auto-fit inteligente
className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 gap-4"
```

### 6. Flex Layout
```tsx
// Vertical en móvil, horizontal en desktop
className="flex flex-col md:flex-row gap-4"

// Invertir orden
className="flex flex-col-reverse md:flex-row"
```

### 7. Visibilidad
```tsx
// Ocultar en móvil
className="hidden md:block"

// Mostrar solo en móvil
className="md:hidden"

// Texto condicional
<span className="hidden sm:inline">Texto completo</span>
<span className="sm:hidden">Corto</span>
```

---

## ðŸŽ¯ Componentes Específicos

### Botones
```tsx
<Button
  size="sm"
  className="w-full sm:w-auto text-sm sm:text-base"
>
  {/* Contenido */}
</Button>
```

### Cards
```tsx
<Card className="p-4 sm:p-5 md:p-6 rounded-xl hover:shadow-lg transition-shadow">
  {/* Contenido */}
</Card>
```

### Imágenes
```tsx
<img 
  src={src}
  alt={alt}
  className="h-12 sm:h-14 md:h-16 w-auto"
/>
```

### Iconos
```tsx
<Icon className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6" />
```

### Inputs
```tsx
<Input 
  className="w-full text-sm sm:text-base"
  placeholder="Texto..."
/>
```

---

## ðŸ“Š Tablas Responsivas

```tsx
import { ResponsiveTable } from './components/ui/responsive-table';

<ResponsiveTable>
  <Table>
    <TableHeader>
      <TableRow>
        <TableHead>Columna 1</TableHead>
        <TableHead>Columna 2</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      {/* Contenido */}
    </TableBody>
  </Table>
</ResponsiveTable>
```

---

## ðŸŽª Sidebars Responsivos

```tsx
const [sidebarOpen, setSidebarOpen] = useState(true);

<aside
  className={`${
    sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
  } ${
    sidebarOpen ? 'w-64' : 'md:w-20 w-64'
  } fixed md:sticky md:top-0 md:h-screen inset-y-0 left-0 z-50 
     bg-black text-white transition-all duration-300 flex flex-col`}
>
  {/* Contenido del sidebar */}
</aside>
```

---

## ðŸ”§ Clases Útiles

### Touch-Friendly (44x44px mínimo)
```tsx
// Botón de icono
className="h-10 w-10 sm:h-11 sm:w-11 md:h-12 md:w-12"

// Botón normal (automático en móvil con nuestro CSS)
<Button>Click</Button>
```

### Truncar Texto
```tsx
// Una línea
className="truncate"

// Dos líneas
className="line-clamp-2"

// Tres líneas
className="line-clamp-3"
```

### Espaciado entre elementos
```tsx
// Vertical
className="space-y-3 sm:space-y-4 md:space-y-6"

// Horizontal
className="space-x-2 sm:space-x-3 md:space-x-4"

// Gap (para flex/grid)
className="gap-3 sm:gap-4 md:gap-6"
```

---

## ðŸŽ¨ Headers Responsivos

```tsx
<header className="bg-white border-b sticky top-0 z-10 shadow-sm">
  <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
    <div className="flex justify-between items-center h-14 sm:h-16">
      {/* Logo */}
      <img 
        src={logo}
        alt="Logo"
        className="h-8 sm:h-10 w-auto"
      />
      
      {/* Desktop menu */}
      <nav className="hidden md:flex items-center gap-4">
        {/* Links */}
      </nav>
      
      {/* Mobile menu button */}
      <Button className="md:hidden" size="icon">
        <Menu className="h-5 w-5" />
      </Button>
    </div>
  </div>
</header>
```

---

## ðŸ“± Navegación Móvil

```tsx
{/* Menú móvil */}
{mobileMenuOpen && (
  <div className="md:hidden py-3 border-t animate-in slide-in-from-top-2">
    {menuItems.map((item) => (
      <button
        key={item.id}
        className="block w-full text-left py-2.5 px-3 text-sm 
                   hover:bg-gray-50 transition-colors"
      >
        {item.label}
      </button>
    ))}
  </div>
)}
```

---

## ðŸŽ¯ Dashboard Stats Cards

```tsx
<div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
  <Card className="p-4 sm:p-5 md:p-6 hover:shadow-lg transition-shadow">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-xs sm:text-sm text-gray-600">Label</p>
        <p className="text-2xl sm:text-3xl mt-1">123</p>
      </div>
      <div className="bg-blue-100 p-2 sm:p-3 rounded-lg">
        <Icon className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
      </div>
    </div>
  </Card>
</div>
```

---

## ðŸ” Diálogos Responsivos

```tsx
<DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
  <DialogHeader>
    <DialogTitle className="text-lg sm:text-xl md:text-2xl">
      Título
    </DialogTitle>
  </DialogHeader>
  
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
    {/* Contenido */}
  </div>
</DialogContent>
```

---

## âš¡ Tips Rápidos

### âœ… HACER
- Usar breakpoints progresivos: `text-sm sm:text-base md:text-lg`
- Pensar mobile-first: diseñar primero para móvil
- Usar `max-w-*` para limitar anchos en desktop
- Probar en diferentes tamaños: 375px, 768px, 1024px, 1920px

### âŒ NO HACER
- Usar tamaños fijos: `w-500px` âŒ
- Ignorar el espaciado: siempre usar padding/margin responsivo
- Olvidar las áreas táctiles: mínimo 44x44px en móvil
- Usar overflow-hidden en contenedores principales

---

## ðŸŽ¨ Ejemplo Completo

```tsx
export function MyComponent() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14 sm:h-16">
            <img 
              src={logo}
              alt="Logo"
              className="h-8 sm:h-10 w-auto"
            />
            <nav className="hidden md:flex gap-4">
              {/* Links */}
            </nav>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-6 sm:py-8">
        <h1 className="text-2xl sm:text-3xl md:text-4xl mb-4 sm:mb-6">
          Título
        </h1>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {items.map((item) => (
            <Card 
              key={item.id}
              className="p-4 sm:p-5 md:p-6 hover:shadow-lg transition-shadow"
            >
              <h3 className="text-lg sm:text-xl mb-2">{item.title}</h3>
              <p className="text-sm sm:text-base text-gray-600">
                {item.description}
              </p>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}
```

---

## ðŸ“š Recursos

- **Archivo de Verificación**: `/VERIFICACION_RESPONSIVE_COMPLETA.md`
- **Componente Helper**: `/components/ui/responsive-table.tsx`
- **Estilos Globales**: `/styles/globals.css`
- **Exportación Figma**: `/INSTRUCCIONES_EXPORTAR_FIGMA.md`

---

## ðŸ†˜ Solución de Problemas

### Problema: Scroll horizontal en móvil
```tsx
// Solución
<div className="overflow-x-hidden">
  {/* Contenido */}
</div>
```

### Problema: Texto muy pequeño en móvil
```tsx
// âŒ Muy pequeño
className="text-xs"

// âœ… Mejor
className="text-sm sm:text-base"
```

### Problema: Botones muy pequeños
```tsx
// âœ… Usar size prop o clases mínimas
<Button size="sm" className="min-h-[44px] min-w-[44px]">
```

### Problema: Tabla no se ve completa
```tsx
// âœ… Usar ResponsiveTable
<ResponsiveTable>
  <Table>{/* ... */}</Table>
</ResponsiveTable>
```

---

**Â¡Tu aplicación ahora es 100% responsive!** ðŸŽ‰

Para más detalles, consulta: `/VERIFICACION_RESPONSIVE_COMPLETA.md`



# 06_DEPENDENCY_AUDIT.md — Fase 3.2

## Dependency Analysis

### Dependencias activas (usadas en código)

| Paquete | Versión | Uso detectado |
|---------|---------|---------------|
| react | ^18.2.0 | ✅ Core |
| react-dom | ^18.2.0 | ✅ Core |
| react-router-dom | ^7.15.1 | ✅ Router |
| firebase | ^12.13.0 | ✅ Auth en AppProviders |
| lucide-react | ^1.16.0 | ✅ Iconos en múltiples archivos |
| tailwindcss | ^4.2.4 | ✅ className en todos los componentes |
| framer-motion | ^12.40.0 | ✅ HeroCarousel.tsx |
| react-hot-toast | ^2.6.0 | ✅ Toaster en App.tsx |
| @tanstack/react-query | ^5.100.10 | ✅ QueryClient en main.tsx |
| zustand | ^5.0.13 | ⚠️ No usado (alternativa a Context API) |
| axios | ^1.16.1 | ⚠️ No usado (fetch nativo usado) |

### Radix UI dependencies

| Paquete | Versión | Uso |
|---------|---------|-----|
| @radix-ui/react-dialog | ^1.1.15 | ✅ Dialog (ui/dialog) |
| @radix-ui/react-label | ^2.1.8 | ✅ Label (ui/label) |
| @radix-ui/react-slot | ^1.2.4 | ✅ Slot (ui/button) |
| @radix-ui/react-scroll-area | ^1.2.10 | ⚠️ No usado (ui existente no funciona) |
| @radix-ui/react-select | ^2.2.6 | ⚠️ No usado (ui existente no funciona) |
| @radix-ui/react-tabs | ^1.1.13 | ⚠️ No usado (ui existente no funciona) |
| @radix-ui/react-switch | ^1.2.6 | ⚠️ No usado |
| @radix-ui/react-radio-group | ^1.3.8 | ⚠️ No usado |
| @radix-ui/react-toggle | ^1.1.10 | ⚠️ No usado |
| @radix-ui/react-toggle-group | ^1.1.11 | ⚠️ No usado |
| @radix-ui/react-tooltip | ^1.2.8 | ⚠️ No usado |
| @radix-ui/react-popper | ^1.2.8 | ⚠️ No usado |

### Form/Hook dependencies

| Paquete | Versión | Uso |
|---------|---------|-----|
| react-hook-form | ^7.75.0 | ⚠️ No usado (ui existente no funciona) |
| @hookform/resolvers | ^5.2.2 | ⚠️ No usado |
| zod | ^4.4.3 | ⚠️ No usado |

### UI Utilities

| Paquete | Versión | Uso |
|---------|---------|-----|
| class-variance-authority | ^0.7.1 | ✅ buttonVariants |
| clsx | ^2.1.1 | ✅ cn utility |
| tailwind-merge | ^3.6.0 | ⚠️ No usado directamente |

### Icon libraries

| Paquete | Versión | Uso |
|---------|---------|-----|
| react-icons | ^5.6.0 | ✅ FaInstagram en footer.tsx |

### Chart dependencies

| Paquete | Versión | Uso |
|---------|---------|-----|
| recharts | ^3.8.1 | ⚠️ No usado (ui existente no funciona) |
| @tanstack/react-table | ^8.21.3 | ⚠️ No usado |

### Toast notifications

| Paquete | Versión | Uso |
|---------|---------|-----|
| sonner | ^2.0.7 | ⚠️ No usado (react-hot-toast usado) |

### Dependencias potencialmente obsoletas

| Paquete | Razón |
|---------|-------|
| zustand | State management no usado, Context API usado en su lugar |
| axios | fetch nativo usado en su lugar |
| @tanstack/react-table | No hay referencias en componentes activos |
| sonner | react-hot-toast usado en su lugar |

### Dependencias críticamente necesarias (pero no funcionan)

| Paquete | Razón |
|---------|-------|
| Radix UI suite | ui components existentes buscan módulos que no existen |
| react-hook-form | ui/form no existe |
| recharts | ui components no están operativos |

### Recomendación
- **Mantener**: react, react-router-dom, firebase, lucide-react, tailwindcss, framer-motion, react-hot-toast
- **Evaluar**: zustand (usar o eliminar), axios (consolidar a fetch)
- **Arreglar**: Todos los Radix UI components (barrel exports rotos)
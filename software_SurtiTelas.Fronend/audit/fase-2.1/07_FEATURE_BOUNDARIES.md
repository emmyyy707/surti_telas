# Feature Boundaries — Fase 2.1

## Límites de los Features

### Estructura por Feature

```
src/features/{feature}/
  ├── components/    # Componentes específicos del feature
  ├── hooks/         # Hooks locales del feature
  ├── services/      # Servicios del feature
  └── index.ts       # Barrel export
```

### Features Identificados

| Feature | Componentes | Responsabilidad |
|---------|-------------|------------------|
| admin/ | 12 módulos | Panel de administración |
| asesor/ | 2 módulos | Panel de asesor comercial |
| domiciliario/ | 2 módulos | Panel de domiciliario |
| cliente/ | 6 módulos | Panel de cliente |
| public/ | 8+ componentes | Catálogo, carrito, contacto |

### Reglas de Feature

1. **Aislamiento**: Features no pueden importar entre sí
2. **Comunicación**: Usar eventos o servicios compartidos en `src/shared/`
3. **UI**: Solo componentes específicos del feature en `components/`
4. **Hooks**: Solo hooks locales en `hooks/`
5. **Services**: Solo servicios del feature en `services/`

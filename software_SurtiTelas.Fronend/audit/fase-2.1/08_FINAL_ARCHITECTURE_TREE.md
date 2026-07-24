# Final Architecture Tree — Fase 2.1

## Árbol de Arquitectura Definitivo

```
src/
├── main.tsx                          # Entry point único
├── vite-env.d.ts                     # Referencia Vite
├── app/
│   ├── providers/
│   │   └── AppProviders.tsx          # AuthProvider + CartProvider + ThemeProvider
│   └── router/
│       └── routes.tsx                # Todas las rutas en un solo lugar
├── features/
│   ├── admin/
│   │   ├── components/
│   │   │   ├── AdminDashboard.tsx
│   │   │   ├── ClientesModule.tsx
│   │   │   ├── ConfiguracionModule.tsx
│   │   │   ├── DevolucionesModule.tsx
│   │   │   ├── DomiciliosModule.tsx
│   │   │   ├── HistorialPagosModule.tsx
│   │   │   ├── InsumosModule.tsx
│   │   │   ├── InventarioModule.tsx
│   │   │   ├── NotificationsDropdown.tsx
│   │   │   ├── NotificationsDropdown.tsx
│   │   │   ├── ProduccionModule.tsx
│   │   │   ├── ReportesModule.tsx
│   │   │   ├── UsuariosModule.tsx
│   │   │   └── VentasModule.tsx
│   │   ├── hooks/
│   │   └── services/
│   ├── asesor/
│   │   ├── components/
│   │   │   ├── ComisionesModule.tsx
│   │   │   └── MisClientesModule.tsx
│   │   ├── hooks/
│   │   └── services/
│   ├── domiciliario/
│   │   ├── components/
│   │   │   ├── EntregasModule.tsx
│   │   │   └── RutasModule.tsx
│   │   ├── hooks/
│   │   └── services/
│   └── cliente/
│       ├── components/
│       │   ├── CatalogoCliente.tsx
│       │   ├── DireccionesCliente.tsx
│       │   ├── MetodosPagoCliente.tsx
│       │   ├── MiPerfilCliente.tsx
│       │   ├── MisPedidosCliente.tsx
│       │   └── ResumenCliente.tsx
│       ├── hooks/
│       └── services/
├── shared/
│   ├── ui/
│   │   ├── Badge.tsx
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Input.tsx
│   │   ├── Modal.tsx
│   │   ├── Table.tsx
│   │   └── index.ts
│   ├── hooks/
│   │   └── useTelas.ts
│   ├── utils/
│   │   ├── image-utils.ts
│   │   └── index.ts
│   ├── types/
│   │   ├── auth.types.ts
│   │   └── index.ts
│   └── constants/
│       └── menuConfig.ts
├── domain/
│   ├── entities/
│   │   └── Tela.ts
│   └── repositories/
│       └── ITelaRepository.ts
├── infrastructure/
│   ├── api/
│   │   └── apiClient.ts
│   ├── repositories/
│   │   └── TelaRepository.ts
│   └── config/
│       └── firebase.ts
└── assets/
    ├── images/
    │   ├── logos/
    │   └── placeholders/
    └── icons/
```

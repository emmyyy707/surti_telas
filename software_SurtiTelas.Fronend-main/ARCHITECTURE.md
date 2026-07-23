# Arquitectura del Proyecto SurtiCamisetas ERP

## Visión General
Este proyecto sigue una arquitectura en capas inspirada en Clean Architecture y Hexagonal Architecture, con una clara separación de responsabilidades entre las diferentes capas del sistema.

## Estructura de Capas

```mermaid
graph TD
    %% Capas principales
    subgraph Presentation_Layer["Capa de Presentación"]
        direction TB
        Pages[Páginas<br/>(src/presentation/pages)]
        Components[Componentes<br/>(src/presentation/components)]
        UI_Library[Biblioteca UI<br/>(src/presentation/ui)]
        Layouts[Diseños<br/>(src/presentation/layouts)]
        Contexts[Contextos React<br/>(src/presentation/contexts)]
        Presentation_Hooks[Hooks Personalizados<br/>(src/presentation/hooks)]
        Admin[Módulo Admin<br/>(src/presentation/pages/admin)]
        Asesor[Módulo Asesor<br/>(src/presentation/pages/asesor)]
        Domiciliario[Módulo Domiciliario<br/>(src/presentation/pages/domiciliario)]
        Cliente[Módulo Cliente<br/>(src/presentation/pages/cliente)]
        Common[Componentes Comunes<br/>(src/presentation/pages/common)]
    end

    subgraph Application_Layer["Capa de Aplicación"]
        direction TB
        Use_Cases[Casos de Uso<br/>(src/application/useCases)]
        Services[Servicios de Aplicación<br/>(src/application/services)]
        Dashboard_Serv[Servicio de Dashboard<br/>(src/application/dashboardService.ts)]
        Dashboard_TS[Tipos de Dashboard<br/>(src/application/dashboard.ts)]
    end

    subgraph Domain_Layer["Capa de Dominio"]
        direction TB
        Entities[Entidades de Negocio<br/>(src/domain/entities)]
        Repository_Interfaces[Interfaces de Repositorio<br/>(src/domain/repositories)]
        Tela_Entity[Entidad Tela<br/>(src/domain/entities/Tela.ts)]
        ITela_Repo[ITelaRepository<br/>(src/domain/repositories/ITelaRepository.ts)]
        GetTelas_UC[GetTelasUseCase<br/>(src/application/useCases/GetTelasUseCase.ts)]
    end

    subgraph Infrastructure_Layer["Capa de Infraestructura"]
        direction TB
        API_Clients[Clientes API<br/>(src/infrastructure/http)]
        Firebase_Config[Configuración Firebase<br/>(src/infrastructure/firebase.ts)]
        Repo_Implementations[Implementaciones de Repositorios<br/>(src/infrastructure/repositories)]
        Tela_Repo[Implementación TelaRepository<br/>(src/infrastructure/repositories/TelaRepository.ts)]
        Axios_Client[Cliente Axios<br/>(src/infrastructure/http/axios.ts)]
        Firebase_Serv[Servicios Firebase<br/>(src/infrastructure/services)]
    end

    subgraph Shared_Layer["Capa Compartida"]
        direction TB
        Shared_Utils[Utilidades Compartidas<br/>(src/shared)]
        Shared_Hooks[Hooks Compartidos<br/>(src/hooks)]
        Shared_Types[Tipos TypeScript<br/>(src/types)]
        Shared_Components[Componentes Compartidos<br/>(src/components)]
        Config[Configuración<br/>(src/config)]
        Assets[Recursos Estáticos<br/>(src/assets)]
        Image_Utils[Utilidades de Imagen<br/>(src/shared/image-utils.ts)]
        Index_TS[Index de Exportaciones<br/>(src/shared/index.ts)]
    end

    %% Dependencias entre capas
    Presentation_Layer --> Application_Layer
    Presentation_Layer --> Domain_Layer
    Presentation_Layer --> Shared_Layer
    
    Application_Layer --> Domain_Layer
    Application_Layer --> Infrastructure_Layer
    
    Domain_Layer --> Infrastructure_Layer
    Domain_Layer --> Shared_Layer
    
    Infrastructure_Layer --> Shared_Layer
    
    %% Dependencias específicas dentro de capas
    Admin --> Pages
    Asesor --> Pages
    Domiciliario --> Pages
    Cliente --> Pages
    Common --> Pages
    
    Tela_Entity --> Repository_Interfaces
    ITela_Repo --> GetTelas_UC
    GetTelas_UC --> Services
    
    Tela_Repo --> Repository_Interfaces
    Tela_Repo --> Tela_Entity
    Axios_Client --> Tela_Repo
    Firebase_Config --> Firebase_Serv
    
    %% Estilo visual
    classDef layer fill:#f8f9fa,stroke:#343a40,stroke-width:2px,rx:5,ry:5;
    class Presentation_Layer,Application_Layer,Domain_Layer,Infrastructure_Layer,Shared_Layer layer;
    
    classDef module fill:#e9ecef,stroke:#6c757d,stroke-width:1px,rx:3,ry:3;
    class Pages,Components,UI_Library,Layouts,Contexts,Presentation_Hooks module;
    class Use_Cases,Services,Dashboard_Serv,Dashboard_TS module;
    class Entities,Repository_Interfaces,Tela_Entity,ITela_Repo,GetTelas_UC module;
    class API_Clients,Firebase_Config,Repo_Implementations,Tela_Repo,Axios_Client,Firebase_Serv module;
    class Shared_Utils,Shared_Hooks,Shared_Types,Shared_Components,Config,Assets,Image_Utils,Index_TS module;
```

## Detalle de Módulos por Funcionalidad

### Módulo de Administrador
```
src/presentation/pages/admin/
â”œâ”€â”€ AdminDashboard.tsx
â”œâ”€â”€ AdminLoginPage.tsx
â”œâ”€â”€ components/
â”‚   â”œâ”€â”€ AlertsPanel.tsx
â”‚   â”œâ”€â”€ DashboardLayout.tsx
â”‚   â”œâ”€â”€ Header.tsx
â”‚   â”œâ”€â”€ KPICard.tsx
â”‚   â”œâ”€â”€ OrdersPieChart.tsx
â”‚   â”œâ”€â”€ RecentSalesTable.tsx
â”‚   â”œâ”€â”€ SalesChart.tsx
â”‚   â””â”€â”€ Sidebar.tsx
â”œâ”€â”€ contexts/
â”‚   â”œâ”€â”€ AlertsPanel.tsx
â”‚   â”œâ”€â”€ Dashboard.tsx
â”‚   â”œâ”€â”€ Header.tsx
â”‚   â”œâ”€â”€ KPICard.tsx
â”‚   â”œâ”€â”€ OrdersPieChart.tsx
â”‚   â”œâ”€â”€ RecentSalesTable.tsx
â”‚   â”œâ”€â”€ SalesChart.tsx
â”‚   â””â”€â”€ Sidebar.tsx
â”œâ”€â”€ dashboardTypes.ts
â””â”€â”€ mockData.ts
```

### Módulo de Asesor
```
src/presentation/pages/asesor/
â”œâ”€â”€ AsesorDashboard.tsx
â”œâ”€â”€ components/
â”‚   â”œâ”€â”€ AlertsPanel.tsx
â”‚   â”œâ”€â”€ Dashboard.tsx
â”‚   â”œâ”€â”€ Header.tsx
â”‚   â”œâ”€â”€ KPICard.tsx
â”‚   â”œâ”€â”€ OrdersPieChart.tsx
â”‚   â”œâ”€â”€ RecentSalesTable.tsx
â”‚   â”œâ”€â”€ SalesChart.tsx
â”‚   â””â”€â”€ Sidebar.tsx
â””â”€â”€ mockData.ts
```

### Módulo de Domiciliario
```
src/presentation/pages/domiciliario/
â”œâ”€â”€ DomiciliarioDashboard.tsx
â”œâ”€â”€ components/
â”‚   â”œâ”€â”€ AlertsPanel.tsx
â”‚   â”œâ”€â”€ Dashboard.tsx
â”‚   â”œâ”€â”€ Header.tsx
â”‚   â”œâ”€â”€ KPICard.tsx
â”‚   â”œâ”€â”€ OrdersPieChart.tsx
â”‚   â”œâ”€â”€ RecentSalesTable.tsx
â”‚   â”œâ”€â”€ SalesChart.tsx
â”‚   â””â”€â”€ Sidebar.tsx
â””â”€â”€ mockData.ts
```

### Módulo de Cliente (Frontend Público)
```
src/presentation/pages/cliente/
â”œâ”€â”€ ClienteDashboard.tsx
â”œâ”€â”€ components/
â”‚   â”œâ”€â”€ Header.tsx
â”‚   â””â”€â”€ Sidebar.tsx
â””â”€â”€ mockData.ts
```

### Módulos Comunes
```
src/presentation/pages/common/
â”œâ”€â”€ CartDrawer.css
â”œâ”€â”€ CartDrawer.tsx
â”œâ”€â”€ CartItem.tsx
â”œâ”€â”€ CartSummary.tsx
â”œâ”€â”€ CheckoutModal.css
â”œâ”€â”€ CheckoutModal.tsx
â”œâ”€â”€ ProductDetailModal.css
â”œâ”€â”€ ProductDetailModal.tsx
â”œâ”€â”€ ProductModal.tsx
â”œâ”€â”€ ScrollToTop.tsx
â”œâ”€â”€ TelaList.tsx
â”œâ”€â”€ ImageWithFallback.tsx
â””â”€â”€ styles/
```

## Tecnologías Utilizadas

- **Frontend**: React 18, TypeScript, Vite
- **Estilos**: Tailwind CSS, CSS Modules
- **Estado**: Context API de React, Zustand (implícito en stores)
- **Servicios**: Firebase (Firestore, Auth), APIs RESTful
- **Build**: Vite, ESLint, Prettier
- **Tipos**: TypeScript estricto

## Principios de Arquitectura

1. **Separación de Responsabilidades**: Cada capa tiene una responsabilidad bien definida
2. **Dependencia de Abstracciones**: Las capas dependen de interfaces, no de implementaciones concretas
3. **Dirección de Dependencias**: Las dependencias fluyen hacia adentro (las capas externas dependen de las internas)
4. **Testabilidad**: La separación permite probar cada capa de forma aislada
5. **Mantenibilidad**: Los cambios en una capa tienen impacto mínimo en las demás

## Flujo de Datos Típico

1. **Interacción Usuario**: Componente de Presentación â†’ Hook/Presentación
2. **Lógica de Negocio**: Hook/Presentación â†’ Caso de Uso (Aplicación)
3. **Acceso a Datos**: Caso de Uso â†’ Repositorio (Infraestructura)
4. **Servicios Externos**: Repositorio â†’ Firebase/API REST
5. **Respuesta**: Datos fluyen en dirección opuesta hacia la presentación

## Puntos de Extensión

- **Nuevos Features**: Agregar nuevos módulos en `src/presentation/pages/{feature}`
- **Nuevos Servicios**: Extender `src/infrastructure/services` o `src/application/services`
- **Nuevas Entidades**: Definir en `src/domain/entities` y sus repositorios en `src/domain/repositories`
- **Configuración**: Modificar archivos en `src/config/` y variables de entorno
- **UI Compartida**: Actualizar componentes en `src/shared/components` o `src/presentation/ui`

## Decisiones de Diseño

- **React Context API**: Para manejo de estado global ligero (tema, carrito, autenticación)
- **Custom Hooks**: Para encapsular lógica reutilizable de presentaciones
- **Separación de Presentación y Lógica**: Los componentes son "tontos" y reciben datos vía props/hooks
- **Tipado Fuerte**: Uso extensivo de TypeScript para seguridad en tiempo de compilación
- **Modularidad**: Cada feature está relativamente aislado para facilitar desarrollo paralelo


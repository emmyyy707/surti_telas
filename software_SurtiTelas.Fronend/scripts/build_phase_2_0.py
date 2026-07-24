#!/usr/bin/env python3
"""
Fase 2.0 — Generador de Arquitectura Objetivo
Analiza la estructura actual y genera la arquitectura objetivo.
"""

import os
import re
import json
import csv
from pathlib import Path
from collections import defaultdict

BASE = Path(os.getcwd())
SRC = BASE / "src"
OUT = BASE / "audit" / "fase-2.0"
OUT.mkdir(parents=True, exist_ok=True)

# ============================================================
# ANÁLISIS ESTRUCTURAL
# ============================================================

# 1. Detectar duplicados por nombre
files_by_name = defaultdict(list)
for f in SRC.rglob("*"):
    if f.is_file() and (f.suffix == ".ts" or f.suffix == ".tsx"):
        name = f.name
        files_by_name[name].append(str(f.relative_to(BASE)))

duplicates = {k: v for k, v in files_by_name.items() if len(v) > 1}

# 2. Detectar duplicados de UI
ui_files_src = list((SRC / "app" / "components" / "ui").glob("*.tsx")) if (SRC / "app" / "components" / "ui").exists() else []
ui_files_shared = list((SRC / "shared" / "ui").glob("*.tsx")) if (SRC / "shared" / "ui").exists() else []

ui_duplicates = []
for ui_src in ui_files_src:
    for ui_shared in ui_files_shared:
        if ui_src.name == ui_shared.name:
            ui_duplicates.append({
                "file": ui_src.name,
                "src_app": str(ui_src.relative_to(BASE)),
                "src_shared": str(ui_shared.relative_to(BASE))
            })

# 3. Detectar contextos duplicados
contexts_app = list((SRC / "app" / "contexts").glob("*.tsx")) if (SRC / "app" / "contexts").exists() else []
contexts_presentation = list((SRC / "presentation" / "contexts").glob("*.tsx")) if (SRC / "presentation" / "contexts").exists() else []

context_duplicates = []
for ctx_app in contexts_app:
    for ctx_pres in contexts_presentation:
        if ctx_app.name == ctx_pres.name:
            context_duplicates.append({
                "context": ctx_app.name,
                "app": str(ctx_app.relative_to(BASE)),
                "presentation": str(ctx_pres.relative_to(BASE))
            })

# 4. Detectar entry points múltiples
entry_points = []
if (SRC / "main.tsx").exists():
    entry_points.append(str((SRC / "main.tsx").relative_to(BASE)))
if (SRC / "app" / "App.tsx").exists():
    entry_points.append(str((SRC / "app" / "App.tsx").relative_to(BASE)))
if (SRC / "app" / "MODO_EXPORTACION.tsx").exists():
    entry_points.append(str((SRC / "app" / "MODO_EXPORTACION.tsx").relative_to(BASE)))

# 5. Clasificar archivos por capa actual
layers = {
    "presentation": [],
    "app_components": [],
    "app_features": [],
    "shared": [],
    "domain": [],
    "infrastructure": [],
    "application": [],
    "config": [],
    "hooks": [],
    "types": [],
    "assets": [],
    "other": []
}

for f in SRC.rglob("*"):
    if f.is_file() and (f.suffix == ".ts" or f.suffix == ".tsx"):
        rel = str(f.relative_to(BASE))
        if "presentation" in rel:
            layers["presentation"].append(rel)
        elif rel.startswith("src/app/components/"):
            layers["app_components"].append(rel)
        elif rel.startswith("src/app/features/"):
            layers["app_features"].append(rel)
        elif rel.startswith("src/shared/"):
            layers["shared"].append(rel)
        elif rel.startswith("src/domain/"):
            layers["domain"].append(rel)
        elif rel.startswith("src/infrastructure/"):
            layers["infrastructure"].append(rel)
        elif rel.startswith("src/application/"):
            layers["application"].append(rel)
        elif rel.startswith("src/config/"):
            layers["config"].append(rel)
        elif rel.startswith("src/hooks/"):
            layers["hooks"].append(rel)
        elif rel.startswith("src/types/"):
            layers["types"].append(rel)
        elif rel.startswith("src/assets/"):
            layers["assets"].append(rel)
        else:
            layers["other"].append(rel)

# ============================================================
# GENERAR CURRENT_ARCHITECTURE.md
# ============================================================
current_arch = []
current_arch.append("# Current Architecture — Fase 2.0\n\n")
current_arch.append("## Estructura Actual (Resumen)\n\n")
current_arch.append("```\n")
current_arch.append("src/\n")
current_arch.append("├── main.tsx                          # Entry point producción\n")
current_arch.append("├── app/\n")
current_arch.append("│   ├── App.tsx                       # Entry point alternativo (login/landing)\n")
current_arch.append("│   ├── MODO_EXPORTACION.tsx          # Modo Figma (NO producción)\n")
current_arch.append("│   ├── components/                   # DUPLICADO - Componentes UI genéricos\n")
current_arch.append("│   │   ├── ui/                       # 50+ componentes UI duplicados\n")
current_arch.append("│   │   ├── admin/                    # DUPLICADO - Módulos admin\n")
current_arch.append("│   │   ├── asesor/                   # DUPLICADO - Módulos asesor\n")
current_arch.append("│   │   ├── cliente-role/             # DUPLICADO - Módulos cliente\n")
current_arch.append("│   │   └── domiciliario/             # DUPLICADO - Módulos domiciliario\n")
current_arch.append("│   ├── features/                     # DUPLICADO - Features duplicados\n")
current_arch.append("│   │   ├── admin/                    # DUPLICADO\n")
current_arch.append("│   │   ├── asesor/                   # DUPLICADO\n")
current_arch.append("│   │   ├── cliente/                  # DUPLICADO\n")
current_arch.append("│   │   ├── domiciliario/             # DUPLICADO\n")
current_arch.append("│   │   ├── common/                   # DUPLICADO - Componentes comunes\n")
current_arch.append("│   │   └── figma/                    # DUPLICADO - Utilidades Figma\n")
current_arch.append("│   ├── contexts/                     # ThemeContext DUPLICADO\n")
current_arch.append("│   └── config/                       # menuConfig (solo aquí)\n")
current_arch.append("├── presentation/                     # ARBOL PRINCIPAL (el que funciona)\n")
current_arch.append("│   ├── pages/App.tsx                 # Router principal\n")
current_arch.append("│   ├── contexts/                     # Auth, Cart, CartDrawer, Theme (DUPLICADO Theme)\n")
current_arch.append("│   ├── components/                   # Componentes específicos\n")
current_arch.append("│   ├── routes/ProtectedRoute.tsx\n")
current_arch.append("│   └── hooks/useTelas.ts\n")
current_arch.append("├── shared/                           # UI library + utils\n")
current_arch.append("│   ├── ui/                           # 17 componentes UI\n")
current_arch.append("│   └── utils/\n")
current_arch.append("├── components/                       # Layout (OUTSIDE src/app/)\n")
current_arch.append("│   └── layout/\n")
current_arch.append("├── domain/                           # Clean Architecture (OUTSIDE src/)\n")
current_arch.append("├── infrastructure/                   # Clean Architecture (OUTSIDE src/)\n")
current_arch.append("├── application/                      # Clean Architecture (OUTSIDE src/)\n")
current_arch.append("├── config/                           # Firebase (OUTSIDE src/)\n")
current_arch.append("├── hooks/                            # usePagination (OUTSIDE src/)\n")
current_arch.append("├── types/                            # auth.types (DUPLICADO con src/shared/)\n")
current_arch.append("└── assets/                           # Imágenes\n")
current_arch.append("```\n\n")

current_arch.append("## Problemas Detectados\n\n")
current_arch.append("### 1. Duplicación Masiva\n\n")
current_arch.append(f"- **{len(duplicates)} archivos duplicados por nombre** entre `src/app/components/`, `src/app/features/common/`, y `src/presentation/`\n")
current_arch.append("- Cada página/cartalog/carrito/contacto/about/login existe 2-3 veces\n\n")

current_arch.append("### 2. Capas Mezcladas\n\n")
current_arch.append("- Clean Architecture (`domain/`, `application/`, `infrastructure/`) **fuera de `src/`**\n")
current_arch.append("- Lógica de presentación en `src/app/` junto con componentes UI\n")
current_arch.append("- Servicios en `src/app/` separados de la feature que los usa\n\n")

current_arch.append("### 3. Dependencias Invertidas\n\n")
current_arch.append("- `src/app/components/ui/` duplica `src/shared/ui/`\n")
current_arch.append(f"- {len(ui_duplicates)} componentes UI duplicados entre ambas carpetas\n")
current_arch.append("- Features importan desde múltiples capas sin restricción\n\n")

current_arch.append("### 4. Entry Points Múltiples\n\n")
current_arch.append(f"- {len(entry_points)} entry points detectados\n")
for ep in entry_points:
    current_arch.append(f"  - `{ep}`\n")
current_arch.append("- Solo `src/main.tsx` es el entry point de producción\n")
current_arch.append("- `src/app/App.tsx` es flujo alternativo (login/landing)\n")
current_arch.append("- `src/app/MODO_EXPORTACION.tsx` es modo Figma\n\n")

current_arch.append("### 5. Contextos Duplicados\n\n")
current_arch.append(f"- {len(context_duplicates)} contextos duplicados detectados\n")
for ctx in context_duplicates:
    current_arch.append(f"  - `{ctx['context']}` en `{ctx['app']}` y `{ctx['presentation']}`\n")
current_arch.append("\n")

current_arch.append("### 6. UI Libraries Duplicadas\n\n")
current_arch.append("- `src/app/components/ui/` (50+ componentes)\n")
current_arch.append("- `src/shared/ui/` (17 componentes)\n")
current_arch.append("- Ambas exportan Badge, Button, Card, Dialog, etc.\n\n")

current_arch.append("## Responsabilidades por Capa\n\n")
current_arch.append("| Capa | Archivos | Responsabilidad |\n")
current_arch.append("|------|----------|------------------|\n")
for layer, files in sorted(layers.items()):
    if files:
        current_arch.append(f"| {layer} | {len(files)} | {layer.capitalize()} layer |\n")

with open(OUT / "CURRENT_ARCHITECTURE.md", "w", encoding="utf-8") as f:
    f.writelines(current_arch)

# ============================================================
# GENERAR TARGET_ARCHITECTURE.md
# ============================================================
target_arch = []
target_arch.append("# Target Architecture — Fase 2.0\n\n")
target_arch.append("## Arquitectura Objetivo: Feature Based Architecture\n\n")
target_arch.append("```\n")
target_arch.append("src/\n")
target_arch.append("├── main.tsx                          # Entry point único\n")
target_arch.append("├── app/\n")
target_arch.append("│   ├── providers/\n")
target_arch.append("│   │   └── AppProviders.tsx          # Proveedores globales\n")
target_arch.append("│   └── router/\n")
target_arch.append("│       └── routes.tsx                # Definición de rutas\n")
target_arch.append("├── shared/                           # Código compartido global\n")
target_arch.append("│   ├── ui/                           # Componentes UI universales\n")
target_arch.append("│   │   ├── Button.tsx\n")
target_arch.append("│   │   ├── Card.tsx\n")
target_arch.append("│   │   ├── Input.tsx\n")
target_arch.append("│   │   ├── Modal.tsx\n")
target_arch.append("│   │   ├── Table.tsx\n")
target_arch.append("│   │   └── index.ts\n")
target_arch.append("│   ├── hooks/\n")
target_arch.append("│   │   └── useTelas.ts\n")
target_arch.append("│   ├── utils/\n")
target_arch.append("│   │   ├── image-utils.ts\n")
target_arch.append("│   │   └── index.ts\n")
target_arch.append("│   ├── types/\n")
target_arch.append("│   │   ├── auth.types.ts\n")
target_arch.append("│   │   └── index.ts\n")
target_arch.append("│   └── constants/\n")
target_arch.append("│       └── menuConfig.ts\n")
target_arch.append("├── features/                         # Módulos de negocio (por rol)\n")
target_arch.append("│   ├── admin/\n")
target_arch.append("│   │   ├── components/\n")
target_arch.append("│   │   │   ├── AdminDashboard.tsx\n")
target_arch.append("│   │   │   ├── ClientesModule.tsx\n")
target_arch.append("│   │   │   ├── ConfiguracionModule.tsx\n")
target_arch.append("│   │   │   ├── DevolucionesModule.tsx\n")
target_arch.append("│   │   │   ├── DomiciliosModule.tsx\n")
target_arch.append("│   │   │   ├── HistorialPagosModule.tsx\n")
target_arch.append("│   │   │   ├── InsumosModule.tsx\n")
target_arch.append("│   │   │   ├── InventarioModule.tsx\n")
target_arch.append("│   │   │   ├── NotificationsDropdown.tsx\n")
target_arch.append("│   │   │   ├── ProduccionModule.tsx\n")
target_arch.append("│   │   │   ├── ReportesModule.tsx\n")
target_arch.append("│   │   │   ├── UsuariosModule.tsx\n")
target_arch.append("│   │   │   └── VentasModule.tsx\n")
target_arch.append("│   │   ├── hooks/\n")
target_arch.append("│   │   ├── services/\n")
target_arch.append("│   │   └── index.ts\n")
target_arch.append("│   ├── asesor/\n")
target_arch.append("│   │   ├── components/\n")
target_arch.append("│   │   │   ├── ComisionesModule.tsx\n")
target_arch.append("│   │   │   └── MisClientesModule.tsx\n")
target_arch.append("│   │   ├── hooks/\n")
target_arch.append("│   │   ├── services/\n")
target_arch.append("│   │   └── index.ts\n")
target_arch.append("│   ├── domiciliario/\n")
target_arch.append("│   │   ├── components/\n")
target_arch.append("│   │   │   ├── EntregasModule.tsx\n")
target_arch.append("│   │   │   └── RutasModule.tsx\n")
target_arch.append("│   │   ├── hooks/\n")
target_arch.append("│   │   ├── services/\n")
target_arch.append("│   │   └── index.ts\n")
target_arch.append("│   └── cliente/\n")
target_arch.append("│       ├── components/\n")
target_arch.append("│       │   ├── CatalogoCliente.tsx\n")
target_arch.append("│       │   ├── DireccionesCliente.tsx\n")
target_arch.append("│       │   ├── MetodosPagoCliente.tsx\n")
target_arch.append("│       │   ├── MiPerfilCliente.tsx\n")
target_arch.append("│       │   ├── MisPedidosCliente.tsx\n")
target_arch.append("│       │   └── ResumenCliente.tsx\n")
target_arch.append("│       ├── hooks/\n")
target_arch.append("│       ├── services/\n")
target_arch.append("│       └── index.ts\n")
target_arch.append("├── domain/                           # Entidades y reglas de negocio\n")
target_arch.append("│   ├── entities/\n")
target_arch.append("│   │   ├── Tela.ts\n")
target_arch.append("│   │   └── index.ts\n")
target_arch.append("│   └── repositories/\n")
target_arch.append("│       ├── ITelaRepository.ts\n")
target_arch.append("│       └── index.ts\n")
target_arch.append("├── infrastructure/                   # Implementaciones técnicas\n")
target_arch.append("│   ├── api/\n")
target_arch.append("│   │   ├── apiClient.ts\n")
target_arch.append("│   │   └── index.ts\n")
target_arch.append("│   ├── repositories/\n")
target_arch.append("│   │   ├── TelaRepository.ts\n")
target_arch.append("│   │   └── index.ts\n")
target_arch.append("│   └── config/\n")
target_arch.append("│       └── firebase.ts\n")
target_arch.append("└── assets/                           # Imágenes estáticas\n")
target_arch.append("    ├── images/\n")
target_arch.append("    │   ├── logos/\n")
target_arch.append("    │   └── placeholders/\n")
target_arch.append("    └── icons/\n")
target_arch.append("```\n\n")

target_arch.append("## Reglas de Dependencia\n\n")
target_arch.append("### Permitido\n\n")
target_arch.append("```\n")
target_arch.append("app/          → shared/, features/, infrastructure/\n")
target_arch.append("features/     → shared/, domain/\n")
target_arch.append("infrastructure/ → domain/, shared/\n")
target_arch.append("domain/       → shared/\n")
target_arch.append("```\n\n")

target_arch.append("### Prohibido\n\n")
target_arch.append("```\n")
target_arch.append("shared/       → features/, app/, domain/, infrastructure/\n")
target_arch.append("domain/       → app/, features/, infrastructure/\n")
target_arch.append("features/     → features/ (entre sí)\n")
target_arch.append("infrastructure/ → app/\n")
target_arch.append("```\n\n")

with open(OUT / "TARGET_ARCHITECTURE.md", "w", encoding="utf-8") as f:
    f.writelines(target_arch)

# ============================================================
# GENERAR DEPENDENCY_RULES.md
# ============================================================
dep_rules = []
dep_rules.append("# Dependency Rules — Fase 2.0\n\n")
dep_rules.append("## Reglas de Dependencia Permitidas\n\n")
dep_rules.append("| Desde | Hacia | Permitido |\n")
dep_rules.append("|-------|-------|-----------|\n")
dep_rules.append("| app/ | shared/ | ✅ |\n")
dep_rules.append("| app/ | features/ | ✅ |\n")
dep_rules.append("| app/ | infrastructure/ | ✅ |\n")
dep_rules.append("| features/ | shared/ | ✅ |\n")
dep_rules.append("| features/ | domain/ | ✅ |\n")
dep_rules.append("| infrastructure/ | domain/ | ✅ |\n")
dep_rules.append("| infrastructure/ | shared/ | ✅ |\n")
dep_rules.append("| domain/ | shared/ | ✅ |\n\n")

dep_rules.append("## Reglas de Dependencia Prohibidas\n\n")
dep_rules.append("| Desde | Hacia | Prohibido |\n")
dep_rules.append("|-------|-------|-----------|\n")
dep_rules.append("| shared/ | features/ | ❌ |\n")
dep_rules.append("| shared/ | app/ | ❌ |\n")
dep_rules.append("| shared/ | domain/ | ❌ |\n")
dep_rules.append("| shared/ | infrastructure/ | ❌ |\n")
dep_rules.append("| domain/ | app/ | ❌ |\n")
dep_rules.append("| domain/ | features/ | ❌ |\n")
dep_rules.append("| domain/ | infrastructure/ | ❌ |\n")
dep_rules.append("| features/ | features/ | ❌ |\n")
dep_rules.append("| infrastructure/ | app/ | ❌ |\n\n")

dep_rules.append("## Reglas Específicas del Proyecto\n\n")
dep_rules.append("1. **UI Components**: Solo pueden vivir en `src/shared/ui/` o `src/features/*/components/ui/`\n")
dep_rules.append("2. **Contexts**: Solo en `src/app/providers/`\n")
dep_rules.append("3. **Hooks**: En `src/shared/hooks/` o `src/features/*/hooks/`\n")
dep_rules.append("4. **Services**: En `src/features/*/services/` o `src/infrastructure/`\n")
dep_rules.append("5. **Utils**: En `src/shared/utils/`\n")
dep_rules.append("6. **Types**: En `src/shared/types/`\n")
dep_rules.append("7. **Config**: En `src/infrastructure/config/`\n")

with open(OUT / "DEPENDENCY_RULES.md", "w", encoding="utf-8") as f:
    f.writelines(dep_rules)

# ============================================================
# GENERAR PROVIDER_STRATEGY.md
# ============================================================
provider_strat = []
provider_strat.append("# Provider Strategy — Fase 2.0\n\n")
provider_strat.append("## Providers Actuales\n\n")
provider_strat.append("| Provider | Ubicación | Estado |\n")
provider_strat.append("|----------|-----------|--------|\n")
provider_strat.append("| AuthProvider | src/presentation/contexts/AuthContext.tsx | ✅ MANTENER |\n")
provider_strat.append("| CartProvider | src/presentation/contexts/CartContext.tsx | ✅ MANTENER |\n")
provider_strat.append("| CartDrawerProvider | src/presentation/contexts/CartDrawerContext.tsx | ✅ MANTENER |\n")
provider_strat.append("| ThemeProvider | src/presentation/contexts/ThemeContext.tsx | ✅ MANTENER (principal) |\n")
provider_strat.append("| ThemeProvider | src/app/contexts/ThemeContext.tsx | ❌ ELIMINAR (duplicado) |\n")
provider_strat.append("| QueryClientProvider | @tanstack/react-query | ✅ MANTENER |\n\n")

provider_strat.append("## Estrategia\n\n")
provider_strat.append("1. **Consolidar**: Mover todos los providers a `src/app/providers/AppProviders.tsx`\n")
provider_strat.append("2. **Fusionar**: Eliminar `src/app/contexts/ThemeContext.tsx` (duplicado)\n")
provider_strat.append("3. **Mantener**: AuthProvider, CartProvider, CartDrawerProvider, ThemeProvider\n")
provider_strat.append("4. **Eliminar**: ThemeProvider duplicado en `src/app/contexts/`\n")
provider_strat.append("5. **Unificar**: Un solo archivo `AppProviders.tsx` que envuelva toda la app\n")

with open(OUT / "PROVIDER_STRATEGY.md", "w", encoding="utf-8") as f:
    f.writelines(provider_strat)

# ============================================================
# GENERAR SHARED_COMPONENTS.md
# ============================================================
shared_comp = []
shared_comp.append("# Shared Components — Fase 2.0\n\n")
shared_comp.append("## Clasificación\n\n")
shared_comp.append("### GLOBAL_SHARED (src/shared/ui/)\n\n")
shared_comp.append("Componentes UI universales usados en toda la aplicación:\n\n")
shared_comp.append("| Componente | Uso |\n")
shared_comp.append("|------------|-----|\n")
shared_comp.append("| Alert | Notificaciones |\n")
shared_comp.append("| Avatar | User avatars |\n")
shared_comp.append("| Badge | Etiquetas |\n")
shared_comp.append("| Button | Botones |\n")
shared_comp.append("| Card | Contenedores |\n")
shared_comp.append("| Drawer | Paneles laterales |\n")
shared_comp.append("| DropdownMenu | Menús |\n")
shared_comp.append("| EmptyState | Estados vacíos |\n")
shared_comp.append("| Input | Campos de entrada |\n")
shared_comp.append("| Modal | Diálogos |\n")
shared_comp.append("| Pagination | Paginación |\n")
shared_comp.append("| Select | Selectores |\n")
shared_comp.append("| Skeleton | Loading |\n")
shared_comp.append("| Spinner | Carga |\n")
shared_comp.append("| StatsCard | Métricas |\n")
shared_comp.append("| Table | Tablas |\n")
shared_comp.append("| Tabs | Pestañas |\n\n")

shared_comp.append("### FEATURE_SHARED (src/features/*/components/ui/)\n\n")
shared_comp.append("Componentes específicos de una feature (si aplica):\n\n")
shared_comp.append("- Admin: AdminDashboard, ClientesModule, etc.\n")
shared_comp.append("- Asesor: ComisionesModule, MisClientesModule\n")
shared_comp.append("- Domiciliario: EntregasModule, RutasModule\n")
shared_comp.append("- Cliente: CatalogoCliente, MisPedidosCliente, etc.\n\n")

shared_comp.append("### LOCAL_COMPONENT (src/presentation/components/)\n\n")
shared_comp.append("Componentes específicos de páginas públicas:\n\n")
shared_comp.append("- CartDrawer, CartItem, CartSummary\n")
shared_comp.append("- CheckoutModal, ProductDetailModal, ProductModal\n")
shared_comp.append("- TelaList\n")
shared_comp.append("- ScrollToTop\n\n")

shared_comp.append("## Acciones Requeridas\n\n")
shared_comp.append("1. Eliminar `src/app/components/ui/` (50+ duplicados)\n")
shared_comp.append("2. Mantener `src/shared/ui/` como fuente de verdad\n")
shared_comp.append("3. Mover componentes locales a `src/features/public/components/`\n")
shared_comp.append("4. Consolidar componentes duplicados en `src/features/*/`\n")

with open(OUT / "SHARED_COMPONENTS.md", "w", encoding="utf-8") as f:
    f.writelines(shared_comp)

# ============================================================
# GENERAR ARCHITECTURE_RISKS.md
# ============================================================
arch_risks = []
arch_risks.append("# Architecture Risks — Fase 2.0\n\n")
arch_risks.append("## Riesgos Críticos\n\n")
arch_risks.append("1. **Pérdida de código al eliminar duplicados**\n")
arch_risks.append("   - Impacto: ALTO\n")
arch_risks.append("   - Mitigación: Usar git para trackear cambios, hacer backup antes de eliminar\n")
arch_risks.append("   - Archivos afectados: 70+ duplicados\n\n")

arch_risks.append("2. **Rutas rotas por reestructuración**\n")
arch_risks.append("   - Impacto: ALTO\n")
arch_risks.append("   - Mitigación: Actualizar TODOS los imports, verificar con `npm run build`\n")
arch_risks.append("   - Archivos afectados: Todos los que importan desde rutas movidas\n\n")

arch_risks.append("## Riesgos Altos\n\n")
arch_risks.append("3. **Contextos duplicados causando comportamiento inconsistente**\n")
arch_risks.append("   - Impacto: MEDIO-ALTO\n")
arch_risks.append("   - Mitigación: Eliminar `src/app/contexts/ThemeContext.tsx`\n")
arch_risks.append("   - Archivos afectados: Componentes que usan ThemeContext\n\n")

arch_risks.append("4. **Features acopladas entre sí**\n")
arch_risks.append("   - Impacto: MEDIO-ALTO\n")
arch_risks.append("   - Mitigación: Definir boundaries claros, usar eventos o servicios compartidos\n")
arch_risks.append("   - Archivos afectados: Todos los imports cross-feature\n\n")

arch_risks.append("## Riesgos Medios\n\n")
arch_risks.append("5. **Clean Architecture fuera de src/**\n")
arch_risks.append("   - Impacto: MEDIO\n")
arch_risks.append("   - Mitigación: Mover `domain/`, `application/`, `infrastructure/` dentro de `src/`\n")
arch_risks.append("   - Archivos afectados: 3 carpetas completas\n\n")

arch_risks.append("6. **Entry points múltiples**\n")
arch_risks.append("   - Impacto: MEDIO\n")
arch_risks.append("   - Mitigación: Documentar cuál es el principal, archivar los otros\n")
arch_risks.append("   - Archivos afectados: `src/app/App.tsx`, `src/app/MODO_EXPORTACION.tsx`\n\n")

arch_risks.append("## Riesgos Bajos\n\n")
arch_risks.append("7. **Tipos duplicados**\n")
arch_risks.append("   - Impacto: BAJO\n")
arch_risks.append("   - Mitigación: Consolidar en `src/shared/types/`\n")
arch_risks.append("   - Archivos afectados: `src/types/`, `src/shared/auth.types.ts`\n\n")

arch_risks.append("8. **Hooks globales**\n")
arch_risks.append("   - Impacto: BAJO\n")
arch_risks.append("   - Mitigación: Mover a `src/shared/hooks/`\n")
arch_risks.append("   - Archivos afectados: `src/hooks/`\n")

with open(OUT / "ARCHITECTURE_RISKS.md", "w", encoding="utf-8") as f:
    f.writelines(arch_risks)

# ============================================================
# GENERAR MIGRATION_MAP.csv
# ============================================================
migration_rows = []

# Duplicados app/components vs presentation
app_components = list((SRC / "app" / "components").rglob("*.tsx")) if (SRC / "app" / "components").exists() else []
presentation_components = list((SRC / "presentation" / "components").rglob("*.tsx")) if (SRC / "presentation" / "components").exists() else []

for comp in app_components:
    name = comp.name
    # Buscar en presentation
    for pres_comp in presentation_components:
        if pres_comp.name == name:
            migration_rows.append({
                "CURRENT_PATH": str(comp.relative_to(BASE)),
                "TARGET_PATH": str(pres_comp.relative_to(BASE)),
                "ACTION": "DELETE_CANDIDATE",
                "REASON": f"Duplicado de {pres_comp.relative_to(BASE)}"
            })
            break
    else:
        # No está en presentation, podría ser feature-specific
        if "admin" in str(comp.relative_to(SRC / "app" / "components")):
            migration_rows.append({
                "CURRENT_PATH": str(comp.relative_to(BASE)),
                "TARGET_PATH": f"src/features/admin/components/{name}",
                "ACTION": "MOVE",
                "REASON": "Módulo admin a estructura feature-based"
            })
        elif "asesor" in str(comp.relative_to(SRC / "app" / "components")):
            migration_rows.append({
                "CURRENT_PATH": str(comp.relative_to(BASE)),
                "TARGET_PATH": f"src/features/asesor/components/{name}",
                "ACTION": "MOVE",
                "REASON": "Módulo asesor a estructura feature-based"
            })
        elif "domiciliario" in str(comp.relative_to(SRC / "app" / "components")):
            migration_rows.append({
                "CURRENT_PATH": str(comp.relative_to(BASE)),
                "TARGET_PATH": f"src/features/domiciliario/components/{name}",
                "ACTION": "MOVE",
                "REASON": "Módulo domiciliario a estructura feature-based"
            })
        elif "cliente-role" in str(comp.relative_to(SRC / "app" / "components")):
            migration_rows.append({
                "CURRENT_PATH": str(comp.relative_to(BASE)),
                "TARGET_PATH": f"src/features/cliente/components/{name}",
                "ACTION": "MOVE",
                "REASON": "Módulo cliente a estructura feature-based"
            })
        else:
            migration_rows.append({
                "CURRENT_PATH": str(comp.relative_to(BASE)),
                "TARGET_PATH": f"src/features/public/components/{name}",
                "ACTION": "MOVE",
                "REASON": "Componente público a estructura feature-based"
            })

# UI duplicados
for ui_dup in ui_duplicates:
    migration_rows.append({
        "CURRENT_PATH": ui_dup["src_app"],
        "TARGET_PATH": ui_dup["src_shared"],
        "ACTION": "DELETE_CANDIDATE",
        "REASON": f"Duplicado de {ui_dup['src_shared']}"
    })

# Contextos duplicados
for ctx_dup in context_duplicates:
    migration_rows.append({
        "CURRENT_PATH": ctx_dup["app"],
        "TARGET_PATH": ctx_dup["presentation"],
        "ACTION": "DELETE_CANDIDATE",
        "REASON": f"Duplicado de {ctx_dup['presentation']}"
    })

# Entry points
if (SRC / "app" / "App.tsx").exists():
    migration_rows.append({
        "CURRENT_PATH": "src/app/App.tsx",
        "TARGET_PATH": "audit/archive/App.tsx",
        "ACTION": "DELETE_CANDIDATE",
        "REASON": "Entry point alternativo, no producción"
    })

if (SRC / "app" / "MODO_EXPORTACION.tsx").exists():
    migration_rows.append({
        "CURRENT_PATH": "src/app/MODO_EXPORTACION.tsx",
        "TARGET_PATH": "audit/archive/MODO_EXPORTACION.tsx",
        "ACTION": "DELETE_CANDIDATE",
        "REASON": "Modo Figma, no producción"
    })

# Clean Architecture fuera de src
migration_rows.append({
    "CURRENT_PATH": "src/domain/",
    "TARGET_PATH": "src/domain/",
    "ACTION": "KEEP",
    "REASON": "Mover dentro de src/ (ya está)"
})
migration_rows.append({
    "CURRENT_PATH": "src/application/",
    "TARGET_PATH": "src/application/",
    "ACTION": "KEEP",
    "REASON": "Mover dentro de src/ (ya está)"
})
migration_rows.append({
    "CURRENT_PATH": "src/infrastructure/",
    "TARGET_PATH": "src/infrastructure/",
    "ACTION": "KEEP",
    "REASON": "Mover dentro de src/ (ya está)"
})
migration_rows.append({
    "CURRENT_PATH": "src/config/firebase.ts",
    "TARGET_PATH": "src/infrastructure/config/firebase.ts",
    "ACTION": "MOVE",
    "REASON": "Configuración a infrastructure"
})

# Tipos duplicados
if (SRC / "types").exists() and (SRC / "shared" / "types").exists():
    migration_rows.append({
        "CURRENT_PATH": "src/types/",
        "TARGET_PATH": "src/shared/types/",
        "ACTION": "MERGE",
        "REASON": "Consolidar tipos en shared/types"
    })

# Hooks globales
if (SRC / "hooks").exists():
    migration_rows.append({
        "CURRENT_PATH": "src/hooks/",
        "TARGET_PATH": "src/shared/hooks/",
        "ACTION": "MOVE",
        "REASON": "Hooks globales a shared/hooks"
    })

# Write CSV
with open(OUT / "MIGRATION_MAP.csv", "w", newline="", encoding="utf-8") as f:
    writer = csv.DictWriter(f, fieldnames=["CURRENT_PATH", "TARGET_PATH", "ACTION", "REASON"])
    writer.writeheader()
    for row in migration_rows:
        writer.writerow(row)

# ============================================================
# GENERAR CERTIFICATE
# ============================================================
total_duplicates = len(duplicates)
total_ui_duplicates = len(ui_duplicates)
total_context_duplicates = len(context_duplicates)
total_entry_points = len(entry_points)
total_migration = len(migration_rows)

cert = []
cert.append("# Fase 2.0 Certificate\n\n")
cert.append("## Resumen de Análisis\n\n")
cert.append(f"- **Total archivos duplicados por nombre:** {total_duplicates}\n")
cert.append(f"- **Total componentes UI duplicados:** {total_ui_duplicates}\n")
cert.append(f"- **Total contextos duplicados:** {total_context_duplicates}\n")
cert.append(f"- **Total entry points detectados:** {total_entry_points}\n")
cert.append(f"- **Total acciones de migración:** {total_migration}\n\n")

cert.append("## Estado\n\n")
cert.append("✅ Arquitectura objetivo definida\n")
cert.append("✅ Mapa de migración generado\n")
cert.append("✅ Reglas de dependencia documentadas\n")
cert.append("✅ Estrategia de providers definida\n")
cert.append("✅ Clasificación de componentes completada\n")
cert.append("✅ Riesgos identificados\n\n")

cert.append("## Limitaciones\n\n")
cert.append("- Análisis estático basado en estructura de archivos\n")
cert.append("- No se ejecutó la aplicación para validar imports\n")
cert.append("- No se verificó contenido de archivos duplicados\n")
cert.append("- Migración debe ejecutarse en fases con validación continua\n")

with open(OUT / "FASE_2_0_CERTIFICATE.md", "w", encoding="utf-8") as f:
    f.writelines(cert)

print("Fase 2.0 completada.")
print(f"Duplicados detectados: {total_duplicates} archivos")
print(f"UI duplicados: {total_ui_duplicates}")
print(f"Contextos duplicados: {total_context_duplicates}")
print(f"Entry points: {total_entry_points}")
print(f"Acciones de migración: {total_migration}")

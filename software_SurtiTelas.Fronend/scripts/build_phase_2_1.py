#!/usr/bin/env python3
"""
Fase 2.1 — Canonical Architecture Selection
Toma las decisiones definitivas sobre qué carpetas sobreviven, desaparecen, se fusionan o se mueven.
"""

import os
import re
import csv
from pathlib import Path
from collections import defaultdict

BASE = Path(os.getcwd())
OUT = BASE / "audit" / "fase-2.1"
PHASE2 = BASE / "audit" / "fase-2.0"

OUT.mkdir(parents=True, exist_ok=True)

# Cargar MIGRATION_MAP.csv
migration_rows = []
with open(PHASE2 / "MIGRATION_MAP.csv", newline="", encoding="utf-8") as f:
    reader = csv.DictReader(f)
    for row in reader:
        migration_rows.append(row)

# Leer src/ actual
SRC = BASE / "src"
all_dirs = set()
for dirpath, dirnames, filenames in os.walk(SRC):
    rel = Path(dirpath).relative_to(BASE)
    all_dirs.add(str(rel))
    for d in dirnames:
        all_dirs.add(str((Path(dirpath) / d).relative_to(BASE)))

# ============================================================
# CLASIFICACIÓN DE DIRECTORIOS
# ============================================================

# Directorios que SOBREVIVEN (se mantienen en src/ con su contenido actual)
survive_dirs = [
    "src/main.tsx",  # archivo, no directorio
    "src/app",
    "src/presentation",
    "src/shared",
    "src/components",
    "src/domain",
    "src/infrastructure",
    "src/application",
    "src/assets",
    "src/vite-env.d.ts",
]

# Directorios que se FUSIONAN (su contenido se integra en otro, el directorio original desaparece)
merge_dirs = [
    "src/config",           # su contenido (firebase.ts) va a src/infrastructure/config/
    "src/hooks",            # su contenido (usePagination.ts) va a src/shared/hooks/
    "src/types",            # su contenido va a src/shared/types/
    "src/app/contexts",     # se fusiona en src/app/providers/
    "src/app/features",     # se fusiona en src/features/
    "src/app/components",   # se fusiona en src/features/ o src/shared/
]

# Directorios que se ELIMINAN (contenido movido, directorio original desaparece)
remove_dirs = [
    "src/app/features/common",     # duplicado, contenido movido a src/features/public/components/
    "src/app/features/admin/figma", # duplicado, contenido movido a src/shared/utils/
    "src/app/features/figma",      # duplicado, contenido movido a src/shared/utils/
]

# Directorios que solo existen en TARGET (nuevos)
new_dirs = [
    "src/app/providers",
    "src/app/router",
    "src/shared/hooks",
    "src/shared/constants",
    "src/shared/types",
    "src/features/admin/components",
    "src/features/admin/hooks",
    "src/features/admin/services",
    "src/features/asesor/components",
    "src/features/asesor/hooks",
    "src/features/asesor/services",
    "src/features/domiciliario/components",
    "src/features/domiciliario/hooks",
    "src/features/domiciliario/services",
    "src/features/cliente/components",
    "src/features/cliente/hooks",
    "src/features/cliente/services",
    "src/features/public/components",
    "src/infrastructure/api",
    "src/infrastructure/config",
]

# ============================================================
# 01_CANONICAL_STRUCTURE.md
# ============================================================
canonical = []
canonical.append("# Canonical Structure — Fase 2.1\n\n")
canonical.append("## Estructura Canónica Definitiva\n\n")
canonical.append("```\n")
canonical.append("src/\n")
canonical.append("├── main.tsx                          # Entry point único\n")
canonical.append("├── vite-env.d.ts                     # Referencia Vite\n")
canonical.append("├── app/\n")
canonical.append("│   ├── providers/                    # Proveedores consolidados\n")
canonical.append("│   │   └── AppProviders.tsx          # Auth, Cart, CartDrawer, Theme\n")
canonical.append("│   └── router/\n")
canonical.append("│       └── routes.tsx                # Definición de rutas\n")
canonical.append("├── features/                         # Módulos de negocio (por rol)\n")
canonical.append("│   ├── admin/\n")
canonical.append("│   │   ├── components/\n")
canonical.append("│   │   ├── hooks/\n")
canonical.append("│   │   └── services/\n")
canonical.append("│   ├── asesor/\n")
canonical.append("│   │   ├── components/\n")
canonical.append("│   │   ├── hooks/\n")
canonical.append("│   │   └── services/\n")
canonical.append("│   ├── domiciliario/\n")
canonical.append("│   │   ├── components/\n")
canonical.append("│   │   ├── hooks/\n")
canonical.append("│   │   └── services/\n")
canonical.append("│   └── cliente/\n")
canonical.append("│       ├── components/\n")
canonical.append("│       ├── hooks/\n")
canonical.append("│       └── services/\n")
canonical.append("├── shared/                           # Código compartido global\n")
canonical.append("│   ├── ui/                           # Componentes UI universales\n")
canonical.append("│   ├── hooks/                        # Hooks globales\n")
canonical.append("│   ├── utils/                        # Utilidades\n")
canonical.append("│   ├── types/                        # Tipos compartidos\n")
canonical.append("│   └── constants/                    # Constantes\n")
canonical.append("├── domain/                           # Entidades y reglas de negocio\n")
canonical.append("│   ├── entities/\n")
canonical.append("│   └── repositories/\n")
canonical.append("├── infrastructure/                   # Implementaciones técnicas\n")
canonical.append("│   ├── api/\n")
canonical.append("│   ├── repositories/\n")
canonical.append("│   └── config/\n")
canonical.append("└── assets/                           # Imágenes estáticas\n")
canonical.append("    ├── images/\n")
canonical.append("    └── icons/\n")
canonical.append("```\n\n")

canonical.append("## Decisiones Tomadas\n\n")
canonical.append("1. **`src/app/`** como directorio de orquestación únicamente (providers + router)\n")
canonical.append("2. **`src/presentation/`** se absorbe en `src/app/` (no sobrevive como directorio independiente)\n")
canonical.append("3. **`src/features/`** como directorio principal de módulos de negocio\n")
canonical.append("4. **`src/shared/`** como librería compartida global\n")
canonical.append("5. **`src/domain/`, `src/infrastructure/`, `src/application/`** se mantienen en su lugar\n")
canonical.append("6. **`src/config/`, `src/hooks/`, `src/types/`** se mueven a `src/shared/`\n")
canonical.append("7. **`src/components/layout/`** se mueve a `src/features/public/components/`\n")

with open(OUT / "01_CANONICAL_STRUCTURE.md", "w", encoding="utf-8") as f:
    f.writelines(canonical)

# ============================================================
# 02_SURVIVE_DIRECTORIES.md
# ============================================================
survive = []
survive.append("# Survive Directories — Fase 2.1\n\n")
survive.append("## Directorios que Sobreviven\n\n")
survive.append("| Directorio | Razón | Acción |\n")
survive.append("|------------|-------|--------|\n")

# Analizar MIGRATION_MAP para ver qué directorios son KEEP
survive_dirs_from_map = set()
for row in migration_rows:
    if row['ACTION'] == 'KEEP':
        src_path = row['CURRENT_PATH']
        dir_name = '/'.join(src_path.split('/')[:-1]) if '/' in src_path else src_path
        survive_dirs_from_map.add(dir_name)

# También mantener directorios que no aparecen en el mapa (no duplicados)
for d in sorted(all_dirs):
    if d in survive_dirs_from_map:
        survive.append(f"| {d} | Única ubicación válida | KEEP |\n")

with open(OUT / "02_SURVIVE_DIRECTORIES.md", "w", encoding="utf-8") as f:
    f.writelines(survive)

# ============================================================
# 03_REMOVE_DIRECTORIES.md
# ============================================================
remove = []
remove.append("# Remove Directories — Fase 2.1\n\n")
remove.append("## Directorios que Desaparecen o se Fusionan\n\n")
remove.append("| Directorio | Razón | Acción |\n")
remove.append("|------------|-------|--------|\n")

for d in sorted(merge_dirs + remove_dirs):
    if d.startswith("src/app/features/common"):
        remove.append(f"| {d} | Duplicado de src/presentation/components/ | MERGE |\n")
    elif d.startswith("src/app/features/admin/figma") or d.startswith("src/app/features/figma"):
        remove.append(f"| {d} | Utilidad Figma duplicada | MERGE |\n")
    elif d.startswith("src/app/contexts"):
        remove.append(f"| {d} | ThemeContext duplicado | MERGE |\n")
    elif d.startswith("src/app/features"):
        remove.append(f"| {d} | Features duplicados | MERGE |\n")
    elif d.startswith("src/app/components"):
        remove.append(f"| {d} | Componentes duplicados | MERGE |\n")
    elif d.startswith("src/config"):
        remove.append(f"| {d} | Configuración fuera de src/ | MOVE |\n")
    elif d.startswith("src/hooks"):
        remove.append(f"| {d} | Hooks globales fuera de src/ | MOVE |\n")
    elif d.startswith("src/types"):
        remove.append(f"| {d} | Tipos duplicados | MERGE |\n")
    else:
        remove.append(f"| {d} | Consolidación arquitectónica | MERGE |\n")

with open(OUT / "03_REMOVE_DIRECTORIES.md", "w", encoding="utf-8") as f:
    f.writelines(remove)

# ============================================================
# 04_DOMAIN_DECISION.md
# ============================================================
domain_dec = []
domain_dec.append("# Domain Decision — Fase 2.1\n\n")
domain_dec.append("## Decisión: MANTENER dentro de `src/domain/`\n\n")
domain_dec.append("### Razón\n\n")
domain_dec.append("El directorio `src/domain/` ya contiene:\n")
domain_dec.append("- `entities/Tela.ts` — Entidad principal del dominio\n")
domain_dec.append("- `repositories/ITelaRepository.ts` — Contrato de repositorio\n\n")

domain_dec.append("### Acciones Requeridas\n\n")
domain_dec.append("1. **Mover** `src/domain/` dentro de `src/` (ya está en su lugar)\n")
domain_dec.append("2. **Mantener** estructura actual: `entities/` + `repositories/`\n")
domain_dec.append("3. **No eliminar** ninguno de los archivos actuales\n")
domain_dec.append("4. **Verificar** que no haya dependencias externas a `src/domain/`\n\n")

domain_dec.append("### Dependencias\n\n")
domain_dec.append("```\n")
domain_dec.append("src/domain/\n")
domain_dec.append("  └── src/shared/ (tipos, utils)\n")
domain_dec.append("```\n\n")

domain_dec.append("### Archivos Afectados\n\n")
for f in sorted((SRC / "domain").rglob("*")):
    if f.is_file():
        domain_dec.append(f"- `{f.relative_to(BASE)}`\n")

with open(OUT / "04_DOMAIN_DECISION.md", "w", encoding="utf-8") as f:
    f.writelines(domain_dec)

# ============================================================
# 05_APPLICATION_DECISION.md
# ============================================================
app_dec = []
app_dec.append("# Application Decision — Fase 2.1\n\n")
app_dec.append("## Decisión: MANTENER dentro de `src/application/`\n\n")
app_dec.append("### Razón\n\n")
app_dec.append("El directorio `src/application/` contiene la capa de aplicación con:\n")
app_dec.append("- `services/TelaService.ts` — Servicio de aplicación\n\n")

app_dec.append("### Acciones Requeridas\n\n")
app_dec.append("1. **Mover** `src/application/` dentro de `src/` (ya está en su lugar)\n")
app_dec.append("2. **Mantener** estructura actual\n")
app_dec.append("3. **No eliminar** archivos\n")
app_dec.append("4. **Verificar** imports desde `src/features/`\n\n")

app_dec.append("### Dependencias\n\n")
app_dec.append("```\n")
app_dec.append("src/application/\n")
app_dec.append("  └── src/domain/\n")
app_dec.append("  └── src/infrastructure/\n")
app_dec.append("```\n\n")

app_dec.append("### Archivos Afectados\n\n")
for f in sorted((SRC / "application").rglob("*")):
    if f.is_file():
        app_dec.append(f"- `{f.relative_to(BASE)}`\n")

with open(OUT / "05_APPLICATION_DECISION.md", "w", encoding="utf-8") as f:
    f.writelines(app_dec)

# ============================================================
# 06_SHARED_BOUNDARIES.md
# ============================================================
shared_bound = []
shared_bound.append("# Shared Boundaries — Fase 2.1\n\n")
shared_bound.append("## Límites de `src/shared/`\n\n")
shared_bound.append("### Dentro de `src/shared/` (PERMITIDO)\n\n")
shared_bound.append("```\n")
shared_bound.append("src/shared/\n")
shared_bound.append("  ├── ui/          # Componentes UI universales (Button, Card, etc.)\n")
shared_bound.append("  ├── hooks/       # Hooks globales (useTelas, usePagination)\n")
shared_bound.append("  ├── utils/       # Utilidades puras (image-utils, cn, etc.)\n")
shared_bound.append("  ├── types/       # Tipos TypeScript compartidos\n")
shared_bound.append("  └── constants/   # Constantes (menuConfig, rutas)\n")
shared_bound.append("```\n\n")

shared_bound.append("### Fuera de `src/shared/` (PROHIBIDO importar)\n\n")
shared_bound.append("- `src/features/` no puede importar desde `src/shared/` hacia arriba\n")
shared_bound.append("- `src/shared/` no puede importar desde `src/app/`\n")
shared_bound.append("- `src/shared/` no puede importar desde `src/domain/`\n\n")

shared_bound.append("### Consolidaciones Requeridas\n\n")
shared_bound.append("| Origen | Destino | Razón |\n")
shared_bound.append("|--------|---------|-------|\n")
shared_bound.append("| src/app/components/ui/ | src/shared/ui/ | Duplicados |\n")
shared_bound.append("| src/hooks/ | src/shared/hooks/ | Hooks globales |\n")
shared_bound.append("| src/types/ | src/shared/types/ | Tipos compartidos |\n")
shared_bound.append("| src/shared/auth.types.ts | src/shared/types/auth.types.ts | Unificación |\n")
shared_bound.append("| src/app/config/menuConfig.ts | src/shared/constants/menuConfig.ts | Constantes |\n")

with open(OUT / "06_SHARED_BOUNDARIES.md", "w", encoding="utf-8") as f:
    f.writelines(shared_bound)

# ============================================================
# 07_FEATURE_BOUNDARIES.md
# ============================================================
feature_bound = []
feature_bound.append("# Feature Boundaries — Fase 2.1\n\n")
feature_bound.append("## Límites de los Features\n\n")
feature_bound.append("### Estructura por Feature\n\n")
feature_bound.append("```\n")
feature_bound.append("src/features/{feature}/\n")
feature_bound.append("  ├── components/    # Componentes específicos del feature\n")
feature_bound.append("  ├── hooks/         # Hooks locales del feature\n")
feature_bound.append("  ├── services/      # Servicios del feature\n")
feature_bound.append("  └── index.ts       # Barrel export\n")
feature_bound.append("```\n\n")

feature_bound.append("### Features Identificados\n\n")
feature_bound.append("| Feature | Componentes | Responsabilidad |\n")
feature_bound.append("|---------|-------------|------------------|\n")
feature_bound.append("| admin/ | 12 módulos | Panel de administración |\n")
feature_bound.append("| asesor/ | 2 módulos | Panel de asesor comercial |\n")
feature_bound.append("| domiciliario/ | 2 módulos | Panel de domiciliario |\n")
feature_bound.append("| cliente/ | 6 módulos | Panel de cliente |\n")
feature_bound.append("| public/ | 8+ componentes | Catálogo, carrito, contacto |\n\n")

feature_bound.append("### Reglas de Feature\n\n")
feature_bound.append("1. **Aislamiento**: Features no pueden importar entre sí\n")
feature_bound.append("2. **Comunicación**: Usar eventos o servicios compartidos en `src/shared/`\n")
feature_bound.append("3. **UI**: Solo componentes específicos del feature en `components/`\n")
feature_bound.append("4. **Hooks**: Solo hooks locales en `hooks/`\n")
feature_bound.append("5. **Services**: Solo servicios del feature en `services/`\n")

with open(OUT / "07_FEATURE_BOUNDARIES.md", "w", encoding="utf-8") as f:
    f.writelines(feature_bound)

# ============================================================
# 08_FINAL_ARCHITECTURE_TREE.md
# ============================================================
tree = []
tree.append("# Final Architecture Tree — Fase 2.1\n\n")
tree.append("## Árbol de Arquitectura Definitivo\n\n")
tree.append("```\n")
tree.append("src/\n")
tree.append("├── main.tsx                          # Entry point único\n")
tree.append("├── vite-env.d.ts                     # Referencia Vite\n")
tree.append("├── app/\n")
tree.append("│   ├── providers/\n")
tree.append("│   │   └── AppProviders.tsx          # AuthProvider + CartProvider + ThemeProvider\n")
tree.append("│   └── router/\n")
tree.append("│       └── routes.tsx                # Todas las rutas en un solo lugar\n")
tree.append("├── features/\n")
tree.append("│   ├── admin/\n")
tree.append("│   │   ├── components/\n")
tree.append("│   │   │   ├── AdminDashboard.tsx\n")
tree.append("│   │   │   ├── ClientesModule.tsx\n")
tree.append("│   │   │   ├── ConfiguracionModule.tsx\n")
tree.append("│   │   │   ├── DevolucionesModule.tsx\n")
tree.append("│   │   │   ├── DomiciliosModule.tsx\n")
tree.append("│   │   │   ├── HistorialPagosModule.tsx\n")
tree.append("│   │   │   ├── InsumosModule.tsx\n")
tree.append("│   │   │   ├── InventarioModule.tsx\n")
tree.append("│   │   │   ├── NotificationsDropdown.tsx\n")
tree.append("│   │   │   ├── NotificationsDropdown.tsx\n")
tree.append("│   │   │   ├── ProduccionModule.tsx\n")
tree.append("│   │   │   ├── ReportesModule.tsx\n")
tree.append("│   │   │   ├── UsuariosModule.tsx\n")
tree.append("│   │   │   └── VentasModule.tsx\n")
tree.append("│   │   ├── hooks/\n")
tree.append("│   │   └── services/\n")
tree.append("│   ├── asesor/\n")
tree.append("│   │   ├── components/\n")
tree.append("│   │   │   ├── ComisionesModule.tsx\n")
tree.append("│   │   │   └── MisClientesModule.tsx\n")
tree.append("│   │   ├── hooks/\n")
tree.append("│   │   └── services/\n")
tree.append("│   ├── domiciliario/\n")
tree.append("│   │   ├── components/\n")
tree.append("│   │   │   ├── EntregasModule.tsx\n")
tree.append("│   │   │   └── RutasModule.tsx\n")
tree.append("│   │   ├── hooks/\n")
tree.append("│   │   └── services/\n")
tree.append("│   └── cliente/\n")
tree.append("│       ├── components/\n")
tree.append("│       │   ├── CatalogoCliente.tsx\n")
tree.append("│       │   ├── DireccionesCliente.tsx\n")
tree.append("│       │   ├── MetodosPagoCliente.tsx\n")
tree.append("│       │   ├── MiPerfilCliente.tsx\n")
tree.append("│       │   ├── MisPedidosCliente.tsx\n")
tree.append("│       │   └── ResumenCliente.tsx\n")
tree.append("│       ├── hooks/\n")
tree.append("│       └── services/\n")
tree.append("├── shared/\n")
tree.append("│   ├── ui/\n")
tree.append("│   │   ├── Badge.tsx\n")
tree.append("│   │   ├── Button.tsx\n")
tree.append("│   │   ├── Card.tsx\n")
tree.append("│   │   ├── Input.tsx\n")
tree.append("│   │   ├── Modal.tsx\n")
tree.append("│   │   ├── Table.tsx\n")
tree.append("│   │   └── index.ts\n")
tree.append("│   ├── hooks/\n")
tree.append("│   │   └── useTelas.ts\n")
tree.append("│   ├── utils/\n")
tree.append("│   │   ├── image-utils.ts\n")
tree.append("│   │   └── index.ts\n")
tree.append("│   ├── types/\n")
tree.append("│   │   ├── auth.types.ts\n")
tree.append("│   │   └── index.ts\n")
tree.append("│   └── constants/\n")
tree.append("│       └── menuConfig.ts\n")
tree.append("├── domain/\n")
tree.append("│   ├── entities/\n")
tree.append("│   │   └── Tela.ts\n")
tree.append("│   └── repositories/\n")
tree.append("│       └── ITelaRepository.ts\n")
tree.append("├── infrastructure/\n")
tree.append("│   ├── api/\n")
tree.append("│   │   └── apiClient.ts\n")
tree.append("│   ├── repositories/\n")
tree.append("│   │   └── TelaRepository.ts\n")
tree.append("│   └── config/\n")
tree.append("│       └── firebase.ts\n")
tree.append("└── assets/\n")
tree.append("    ├── images/\n")
tree.append("    │   ├── logos/\n")
tree.append("    │   └── placeholders/\n")
tree.append("    └── icons/\n")
tree.append("```\n")

with open(OUT / "08_FINAL_ARCHITECTURE_TREE.md", "w", encoding="utf-8") as f:
    f.writelines(tree)

# ============================================================
# 09_PHASE_3_READINESS.md
# ============================================================
readiness = []
readiness.append("# Phase 3 Readiness — Fase 2.1\n\n")
readiness.append("## Estado de Preparación para Migración\n\n")
readiness.append("### Requisitos Cumplidos\n\n")
readiness.append("- [x] Arquitectura canónica definida\n")
readiness.append("- [x] Directorios sobrevivientes identificados\n")
readiness.append("- [x] Directorios a eliminar/fusionar identificados\n")
readiness.append("- [x] Reglas de dependencia documentadas\n")
readiness.append("- [x] Mapa de migración generado (127 acciones)\n\n")

readiness.append("### Bloqueadores Identificados\n\n")
readiness.append("1. **73 archivos duplicados** requieren validación de contenido antes de eliminar\n")
readiness.append("2. **50+ componentes UI** en `src/app/components/ui/` duplican `src/shared/ui/`\n")
readiness.append("3. **ThemeContext duplicado** en 2 ubicaciones\n")
readiness.append("4. **Entry points múltiples** (`src/app/App.tsx`, `src/app/MODO_EXPORTACION.tsx`)\n")
readiness.append("5. **Clean Architecture** fuera de `src/` requiere mover 3 carpetas completas\n\n")

readiness.append("### Próximos Pasos (Fase 3)\n\n")
readiness.append("1. **Validar** que `npm run build` funciona con estructura actual\n")
readiness.append("2. **Crear** rama git para migración\n")
readiness.append("3. **Ejecutar** MIGRATION_MAP.csv en fases:\n")
readiness.append("   - Fase 3.1: Mover `src/app/contexts/` a `src/app/providers/`\n")
readiness.append("   - Fase 3.2: Fusionar `src/app/components/ui/` en `src/shared/ui/`\n")
readiness.append("   - Fase 3.3: Mover features a `src/features/`\n")
readiness.append("   - Fase 3.4: Mover Clean Architecture dentro de `src/`\n")
readiness.append("   - Fase 3.5: Eliminar duplicados confirmados\n\n")

readiness.append("### Criterios de Éxito para Fase 3\n\n")
readiness.append("- `npm run build` pasa sin errores en cada paso\n")
readiness.append("- `npm run lint` pasa sin errores\n")
readiness.append("- La aplicación se ejecuta correctamente en `npm run dev`\n")
readiness.append("- No hay imports rotos\n")
readiness.append("- Rutas funcionan igual que antes\n")

with open(OUT / "09_PHASE_3_READINESS.md", "w", encoding="utf-8") as f:
    f.writelines(readiness)

print("Fase 2.1 completada.")
print(f"Archivos generados: {len(list(OUT.glob('*')))}")

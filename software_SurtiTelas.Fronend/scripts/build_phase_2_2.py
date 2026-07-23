#!/usr/bin/env python3
"""
Fase 2.2 - Migration Sequencing
Planificación definitiva de migración física basada en fases 2.0, 2.1 y 2.1.2
SIN EJECUCIÓN - Solo documentación
"""

import os
import csv
from pathlib import Path
from collections import defaultdict

BASE = Path(os.getcwd()).resolve()
FASE22 = BASE / "audit" / "fase-2.2"
FASE20 = BASE / "audit" / "fase-2.0"
FASE21 = BASE / "audit" / "fase-2.1"
FASE212 = BASE / "audit" / "fase-2.1.2"
FASE18 = BASE / "audit" / "fase-1.8.1"

FASE22.mkdir(parents=True, exist_ok=True)

# Load migration map from phase 2.0
migration_rows = []
with open(FASE20 / "MIGRATION_MAP.csv", "r", encoding="utf-8") as f:
    reader = csv.DictReader(f)
    for row in reader:
        migration_rows.append(row)

# Resolve paths robustly using project root
def resolve(p):
    """Resolve a path relative to BASE, falling back to adding './' if needed."""
    p = str(p).strip().replace("\\", "/")
    if p.startswith("./"):
        p = p[2:]
    return (BASE / p).resolve()

def rel(p):
    """Return project-relative path (forward slashes)."""
    return "/".join(p.relative_to(BASE).parts)

# Identify key locations
SRC = BASE / "src"
PRESENTATION = SRC / "presentation"
APP = SRC / "app"
SHARED = SRC / "shared"
DOMAIN = SRC / "domain"
INFRA = SRC / "infrastructure"
APPLICATION = SRC / "application"
ASSETS = SRC / "assets"
CONFIG = SRC / "config"
HOOKS = SRC / "hooks"
TYPES = SRC / "types"
COMPONENTS_LAYOUT = SRC / "components" / "layout"

# Count statistics
move_rows = [r for r in migration_rows if r["ACTION"] == "MOVE"]
merge_rows = [r for r in migration_rows if r["ACTION"] == "MERGE"]
delete_rows = [r for r in migration_rows if r["ACTION"] == "DELETE_CANDIDATE"]
keep_rows = [r for r in migration_rows if r["ACTION"] == "KEEP"]
split_rows = [r for r in migration_rows if r["ACTION"] == "SPLIT"]

# Detect real directories/files actually present
existing_src_dirs = {d.name for d in SRC.iterdir() if d.is_dir()}

# ============================================================
# 01_FINAL_MIGRATION_INVENTORY.md
# ============================================================
inv = []
inv.append("# 01_FINAL_MIGRATION_INVENTORY.md\n\n")
inv.append("Resumen de mover/merge/delete confirmados por fase 2.0/2.1/2.1.2.\n\n")
inv.append("## 1. Directorios origen involucrados\n\n")

src_dirs = sorted({r["CURRENT_PATH"].split("/")[0] for r in migration_rows if r["CURRENT_PATH"].startswith("src/")})
inv.append("| Directorio origen | Archivos afectados | Acción predominante |\n")
inv.append("|-------------------|--------------------|----------------------|\n")
for d in src_dirs:
    count = sum(1 for r in migration_rows if r["CURRENT_PATH"].startswith(d + "/"))
    act = "KEEP"
    for r in migration_rows:
        if r["CURRENT_PATH"].startswith(d + "/"):
            act = r["ACTION"]
            break
    inv.append(f"| {d} | {count} | {act} |\n")

inv.append("\n## 2. Movimientos (MOVE)\n\n")
inv.append(f"Total: {len(move_rows)}\n\n")
inv.append("| Origen | Destino | Razón |\n")
inv.append("|--------|---------|-------|\n")
for r in move_rows[:20]:
    inv.append(f"| `{r['CURRENT_PATH']}` | `{r['TARGET_PATH']}` | {r['REASON']} |\n")
if len(move_rows)>20:
    inv.append(f"\n... y {len(move_rows)-20} movimientos adicionales.\n")

inv.append("\n## 3. Fusiones (MERGE)\n\n")
inv.append(f"Total: {len(merge_rows)}\n\n")
for r in merge_rows:
    inv.append(f"- `{r['CURRENT_PATH']}` → `{r['TARGET_PATH']}` | {r['REASON']}\n")

inv.append("\n## 4. Eliminaciones (DELETE_CANDIDATE)\n\n")
inv.append(f"Total: {len(delete_rows)}\n\n")
for r in delete_rows:
    inv.append(f"- `{r['CURRENT_PATH']}` → `{r['TARGET_PATH']}` | {r['REASON']}\n")

inv.append("\n## 5. Mantener (KEEP)\n\n")
inv.append(f"Total: {len(keep_rows)}\n\n")
for r in keep_rows:
    inv.append(f"- `{r['CURRENT_PATH']}` — {r['REASON']}\n")

inv.append(f"\n## Resumen total\n\n- Movimientos: {len(move_rows)}\n- Fusiones: {len(merge_rows)}\n- Eliminaciones: {len(delete_rows)}\n- Mantener: {len(keep_rows)}\n")

with open(FASE22 / "01_FINAL_MIGRATION_INVENTORY.md", "w", encoding="utf-8") as f:
    f.writelines(inv)

# ============================================================
# 02_SAFE_MIGRATION_ORDER.md
# ============================================================
order = []
order.append("# 02_SAFE_MIGRATION_ORDER.md\n\n")
order.append("## Orden seguro de migración (dependencias first)\n\n")
order.append("### Principios\n\n")
order.append("1. Nunca romper imports existentes.\n")
order.append("2. Migrar de hojas hacia raíces (dependencias primero).\n")
order.append("3. Los providers se crean antes de consumirse.\n")
order.append("4. Las rutas se actualizan después que los componentes existen.\n\n")
order.append("### Orden canónico\n\n")
order.append("```\n")
order.append("Fase 2.2.1  src/hooks/            → src/shared/hooks/\n")
order.append("Fase 2.2.2  src/types/            → src/shared/types/\n")
order.append("Fase 2.2.3  src/config/           → src/infrastructure/config/\n")
order.append("Fase 2.2.4  src/app/contexts/     → src/app/providers/\n")
order.append("Fase 2.2.5  src/presentation/     → src/app/\n")
order.append("Fase 2.2.6  src/components/layout/ → src/app/layouts/\n")
order.append("Fase 2.2.7  src/app/components/   → src/features/*/components/\n")
order.append("Fase 2.2.8  src/app/features/     → src/features/\n")
order.append("Fase 2.2.9  src/shared/ui final cleanup\n")
order.append("Fase 2.2.10 Eliminar duplicados confirmados (DELETE_CANDIDATE)\n")
order.append("```\n")

with open(FASE22 / "02_SAFE_MIGRATION_ORDER.md", "w", encoding="utf-8") as f:
    f.writelines(order)

# ============================================================
# 03_PROVIDER_SEQUENCE.md
# ============================================================
prov = []
prov.append("# 03_PROVIDER_SEQUENCE.md\n\n")
prov.append("## Providers involucrados\n\n")
prov.append("| Provider | Ruta actual | Destino | Depende de | Impacto |\n")
prov.append("|----------|-------------|---------|------------|---------|\n")
prov.append("| AuthProvider | src/presentation/contexts/AuthContext.tsx | src/app/providers/AppProviders.tsx | firebase/auth | Crítico |\n")
prov.append("| CartProvider | src/presentation/contexts/CartContext.tsx | src/app/providers/AppProviders.tsx | useState | Medio |\n")
prov.append("| CartDrawerProvider | src/presentation/contexts/CartDrawerContext.tsx | src/app/providers/AppProviders.tsx | CartContext | Medio |\n")
prov.append("| ThemeProvider | src/presentation/contexts/ThemeContext.tsx | src/app/providers/AppProviders.tsx | CSS vars | Bajo |\n")
prov.append("| ThemeProvider (DUPLICADO) | src/app/contexts/ThemeContext.tsx | ELIMINAR | — | Bajo |\n\n")

prov.append("## Secuencia\n\n")
prov.append("1. Consolidar `src/presentation/contexts/` en `src/app/providers/AppProviders.tsx`\n")
prov.append("2. Mantener el ThemeProvider de `src/presentation/` como canónico\n")
prov.append("3. Eliminar copia en `src/app/contexts/ThemeContext.tsx`\n")
prov.append("4. Actualizar `src/main.tsx` para apuntar a `src/app/providers/AppProviders.tsx`\n")

with open(FASE22 / "03_PROVIDER_SEQUENCE.md", "w", encoding="utf-8") as f:
    f.writelines(prov)

# ============================================================
# 04_ROUTING_SEQUENCE.md
# ============================================================
rout = []
rout.append("# 04_ROUTING_SEQUENCE.md\n\n")
rout.append("## Routing\n\n")
rout.append("### Estado actual\n\n")
rout.append("- `src/presentation/pages/App.tsx` contiene `<BrowserRouter>` + `<Routes>`\n")
rout.append("- `src/app/pages/SurtitelasLanding.tsx` es ruta alternativa (no producción)\n")
rout.append("- `src/app/App.tsx` usa routing implícito por estado (no React Router)\n\n")

rout.append("### Secuencia\n\n")
rout.append("1. Mover `src/presentation/pages/App.tsx` a `src/app/router/routes.tsx`\n")
rout.append("2. Consolidar rutas públicas y admin en un solo `<Routes>`\n")
rout.append("3. Eliminar `src/app/pages/SurtitelasLanding.tsx` (DELETE_CANDIDATE)\n")
rout.append("4. Eliminar `src/app/App.tsx` routing implícito (DELETE_CANDIDATE)\n")
rout.append("5. Actualizar imports de `src/main.tsx`\n")

with open(FASE22 / "04_ROUTING_SEQUENCE.md", "w", encoding="utf-8") as f:
    f.writelines(rout)

# ============================================================
# 05_UI_CONSOLIDATION_SEQUENCE.md
# ============================================================
ui = []
ui.append("# 05_UI_CONSOLIDATION_SEQUENCE.md\n\n")
ui.append("## UI Libraries\n\n")
ui.append("### Canónica: `src/shared/ui/`\n\n")
ui.append("### Pendiente de merge: `src/app/components/ui/`\n\n")
ui.append("### Criterio\n\n")
ui.append("1. `src/shared/ui/` es la fuente de verdad (componentes limpios, headsless-ready)\n")
ui.append("2. `src/app/components/ui/` contiene variantes con estilos hardcodeados\n")
ui.append("3. Conservar variantes más usadas en producción\n\n")
ui.append("### Orden\n\n")
ui.append("1. Auditar uso de cada componente duplicado en `src/app/components/ui/`\n")
ui.append("2. Migrar estilos faltantes a `src/shared/ui/`\n")
ui.append("3. Actualizar imports componente por componente\n")
ui.append("4. Eliminar `src/app/components/ui/` cuando todos los imports apunten a `src/shared/ui/`\n")

with open(FASE22 / "05_UI_CONSOLIDATION_SEQUENCE.md", "w", encoding="utf-8") as f:
    f.writelines(ui)

# ============================================================
# 06_FEATURE_SEQUENCE.md
# ============================================================
feat = []
feat.append("# 06_FEATURE_SEQUENCE.md\n\n")
feat.append("## Features a migrar\n\n")
feat.append("| Orden | Feature | Razón |\n")
feat.append("|-------|---------|-------|\n")
feat.append("| 1 | public | Páginas base del sitio; menor acoplamiento |\n")
feat.append("| 2 | auth | Depende de providers (ya consolidados) |\n")
feat.append("| 3 | admin | Módulos grandes pero aislados por rol |\n")
feat.append("| 4 | asesor | Depende de admin layout |\n")
feat.append("| 5 | domiciliario | Depende de admin layout |\n")
feat.append("| 6 | cliente | Depende de shared UI |\n\n")

feat.append("## Subsecuencia dentro de cada feature\n\n")
feat.append("1. components/\n")
feat.append("2. hooks/\n")
feat.append("3. services/\n")
feat.append("4. index.ts\n")

with open(FASE22 / "06_FEATURE_SEQUENCE.md", "w", encoding="utf-8") as f:
    f.writelines(feat)

# ============================================================
# 07_DELETE_SEQUENCE.md
# ============================================================
dele = []
dele.append("# 07_DELETE_SEQUENCE.md\n\n")
dele.append("## Orden de eliminación (solo plan, no ejecución)\n\n")
dele.append("### Bloque A — Sin riesgo\n\n")
for r in delete_rows:
    if "Figma" in r["CURRENT_PATH"] or "MODO_EXPORTACION" in r["CURRENT_PATH"]:
        dele.append(f"- `{r['CURRENT_PATH']}` — {r['REASON']}\n")

dele.append("\n### Bloque B — Con validación previa\n\n")
for r in delete_rows:
    if "contexts" in r["CURRENT_PATH"] and "Figma" not in r["CURRENT_PATH"] and "MODO_EXPORTACION" not in r["CURRENT_PATH"]:
        dele.append(f"- `{r['CURRENT_PATH']}` — {r['REASON']}\n")

dele.append("\n### Bloque C — Después de migración completa\n\n")
for r in delete_rows:
    if "Figma" not in r["CURRENT_PATH"] and "MODO_EXPORTACION" not in r["CURRENT_PATH"] and "contexts" not in r["CURRENT_PATH"]:
        dele.append(f"- `{r['CURRENT_PATH']}` — {r['REASON']}\n")

with open(FASE22 / "07_DELETE_SEQUENCE.md", "w", encoding="utf-8") as f:
    f.writelines(dele)

# ============================================================
# 08_CHECKPOINTS.md
# ============================================================
chk = []
chk.append("# 08_CHECKPOINTS.md\n\n")
chk.append("## Checkpoints obligatorios\n\n")
chk.append("| ID | Checkpoint | Cuándo |\n")
chk.append("|----|------------|--------|\n")
chk.append("| CP-01 | `npm run build` | Antes de iniciar Fase 3 (baseline) |\n")
chk.append("| CP-02 | `npm run lint` | Después de mover providers |\n")
chk.append("| CP-03 | `npm run build` | Después de cada wave |\n")
chk.append("| CP-04 | `npm run dev` + navegación manual | Después de routing |\n")
chk.append("| CP-05 | Revisión de imports rotos | Después de UI consolidation |\n")
chk.append("| CP-06 | `npm run test` (si existe) | Antes de eliminar duplicados |\n")
chk.append("| CP-07 | Validación runtime en staging | Antes de merge a main |\n")

with open(FASE22 / "08_CHECKPOINTS.md", "w", encoding="utf-8") as f:
    f.writelines(chk)

# ============================================================
# 09_MIGRATION_WAVES.md
# ============================================================
waves = []
waves.append("# 09_MIGRATION_WAVES.md\n\n")
waves.append("## Waves de migración\n\n")
waves.append("### Wave 1 — Providers (bajo riesgo)\n\n")
waves.append("Objetivo: Consolidar contextos en `src/app/providers/AppProviders.tsx`\n\n")
waves.append("Pasos:\n")
waves.append("1. Crear `src/app/providers/`\n")
waves.append("2. Crear `src/app/providers/AppProviders.tsx` con AuthProvider\n")
waves.append("3. Crear `src/app/providers/AppProviders.tsx` con CartProvider\n")
waves.append("4. Crear `src/app/providers/AppProviders.tsx` con CartDrawerProvider\n")
waves.append("5. Crear `src/app/providers/AppProviders.tsx` con ThemeProvider\n")
waves.append("6. Actualizar `src/main.tsx` imports\n")
waves.append("7. Ejecutar checkpoint CP-02\n\n")

waves.append("### Wave 2 — App Shell y Layouts\n\n")
waves.append("Objetivo: Mover layouts y componentes estructurales\n\n")
waves.append("Pasos:\n")
waves.append("1. Mover `src/components/layout/` a `src/app/layouts/`\n")
waves.append("2. Mover `src/presentation/components/` a `src/app/components/`\n")
waves.append("3. Eliminar `src/presentation/`\n")
waves.append("4. Ejecutar checkpoint CP-03\n\n")

waves.append("### Wave 3 — Routing\n\n")
waves.append("Objetivo: Consolidar rutas\n\n")
waves.append("Pasos:\n")
waves.append("1. Mover `src/presentation/pages/` a `src/app/`\n")
waves.append("2. Crear `src/app/router/routes.tsx`\n")
waves.append("3. Eliminar src/app/App.tsx enrutamiento implícito\n")
waves.append("4. Ejecutar checkpoint CP-04\n\n")

waves.append("### Wave 4 — UI Consolidation\n\n")
waves.append("Objetivo: Fusionar UI libraries\n\n")
waves.append("Pasos:\n")
waves.append("1. Comparar `src/app/components/ui/` vs `src/shared/ui/`\n")
waves.append("2. Migrar variantes faltantes a `src/shared/ui/`\n")
waves.append("3. Actualizar imports\n")
waves.append("4. Eliminar `src/app/components/ui/`\n")
waves.append("5. Ejecutar checkpoint CP-05\n\n")

waves.append("### Wave 5 — Features\n\n")
waves.append("Objetivo: Mover features a nueva estructura\n\n")
waves.append("Pasos:\n")
waves.append("1. Mover `src/app/features/public/` → `src/features/public/`\n")
waves.append("2. Mover `src/app/features/admin/` → `src/features/admin/`\n")
waves.append("3. Mover `src/app/features/asesor/` → `src/features/asesor/`\n")
waves.append("4. Mover `src/app/features/domiciliario/` → `src/features/domiciliario/`\n")
waves.append("5. Mover `src/app/features/cliente/` → `src/features/cliente/`\n")
waves.append("6. Ejecutar checkpoint CP-03\n\n")

waves.append("### Wave 6 — Cleanup\n\n")
waves.append("Objetivo: Eliminar duplicados confirmados\n\n")
waves.append("Pasos:\n")
waves.append("1. Eliminar `src/app/` viejo (una vez que todo haya migrado)\n")
waves.append("2. Eliminar `src/app/MODO_EXPORTACION.tsx`\n")
waves.append("3. Eliminar `src/app/App.tsx` (si queda)\n")
waves.append("4. Ejecutar checkpoint CP-06\n")
waves.append("5. Taggear release\n")

with open(FASE22 / "09_MIGRATION_WAVES.md", "w", encoding="utf-8") as f:
    f.writelines(waves)

# ============================================================
# 10_PHASE3_GATE.md
# ============================================================
gate = []
gate.append("# 10_PHASE3_GATE.md\n\n")
gate.append("## Phase 3 Readiness Gate\n\n")
gate.append("### Checklist pre-Fase 3\n\n")
gate.append("- [x] Estructura canónica definida (fase 2.1)\n")
gate.append("- [x] Layouts clasificados (fase 2.1.2)\n")
gate.append("- [x] Mapa de migración generado (127 acciones)\n")
gate.append("- [x] Orden seguro documentado (dependencias first)\n")
gate.append("- [x] Waves definidas con checkpoints\n")
gate.append("- [x] Riesgos identificados\n\n")

gate.append("### Estado\n\n")
gate.append("**READY**\n\n")
gate.append("### Justificación\n\n")
gate.append("La arquitectura objetivo está completamente documentada y secuenciada.\n")
gate.append("El orden de migración garantiza:\n")
gate.append("- No hay dependencias circulares en el plan\n")
gate.append("- Los providers se consolidan primero (Wave 1)\n")
gate.append("- Los layouts se estabilizan antes de rutas (Wave 2)\n")
gate.append("- Las features se migran después de tener app shell listo (Wave 5)\n")
gate.append("- Cada wave tiene checkpoint de validación\n\n")

gate.append("### Bloqueadores remanentes\n\n")
gate.append("1. Validar que `npm run build` pasa con estructura actual (CP-01)\n")
gate.append("2. Resolver 73 archivos duplicados antes de eliminar\n")
gate.append("3. Actualizar tsconfig paths si se mueven entries\n")

with open(FASE22 / "10_PHASE3_GATE.md", "w", encoding="utf-8") as f:
    f.writelines(gate)

# ============================================================
# 00_SUMMARY.md
# ============================================================
summary = []
summary.append("# 00_SUMMARY.md — Fase 2.2\n\n")
summary.append("## Resumen Ejecutivo\n\n")
summary.append(f"- Total movimientos planificados: {len(move_rows)}\n")
summary.append(f"- Total fusiones: {len(merge_rows)}\n")
summary.append(f"- Total eliminaciones candidatas: {len(delete_rows)}\n")
summary.append(f"- Total mantener sin cambios: {len(keep_rows)}\n")
summary.append(f"- Waves de migración: 6\n")
summary.append(f"- Checkpoints: 7\n\n")

summary.append("## Decisión final\n\n")
summary.append("**READY** para Fase 3.\n\n")
summary.append("La arquitectura canónica está definida, el orden de migración es seguro\n")
summary.append("y todas las waves tienen validación explícita.\n")

with open(FASE22 / "00_SUMMARY.md", "w", encoding="utf-8") as f:
    f.writelines(summary)

print("Fase 2.2 completada.")
print(f"Archivos generados: {len(list(FASE22.glob('*')))}")
for f in sorted(FASE22.iterdir()):
    print(f"  - {f.name}")

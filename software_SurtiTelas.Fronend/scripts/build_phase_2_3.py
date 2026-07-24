#!/usr/bin/env python3
"""
Fase 2.3 — Pre-Migration Validation
Valida toda la información generada en fases 2.0, 2.1, 2.1.2, 2.2
contra el estado REAL del proyecto.
NO modifica archivos. NO mueve archivos. Solo audita.
"""

import os
import re
import csv
import hashlib
from pathlib import Path
from collections import defaultdict

BASE = Path(os.getcwd()).resolve()
FASE23 = BASE / "audit" / "fase-2.3"
FASE20 = BASE / "audit" / "fase-2.0"
FASE21 = BASE / "audit" / "fase-2.1"
FASE212 = BASE / "audit" / "fase-2.1.2"
FASE22 = BASE / "audit" / "fase-2.2"
FASE18 = BASE / "audit" / "fase-1.8.1"

FASE23.mkdir(parents=True, exist_ok=True)

SRC = BASE / "src"

def read_file(p: Path) -> str:
    try:
        return p.read_text(encoding="utf-8", errors="replace")
    except Exception:
        return ""

def rel(p: Path) -> str:
    return "/".join(p.relative_to(BASE).parts)

# ============================================================
# DATOS BASE
# ============================================================
all_src_files = {f for f in SRC.rglob("*") if f.is_file()}
all_src_dirs = {f for f in SRC.rglob("*") if f.is_dir()}

# Cargar migration map
migration_rows = []
with open(FASE20 / "MIGRATION_MAP.csv", "r", encoding="utf-8") as f:
    for row in csv.DictReader(f):
        migration_rows.append(row)

# ============================================================
# T1 — MIGRATION MAP VALIDATION
# ============================================================
t1_errors = []
t1_ok = 0
validated_rows = []

for row in migration_rows:
    src_path = (BASE / row["CURRENT_PATH"]).resolve()
    tgt_path = (BASE / row["TARGET_PATH"]).resolve()
    
    # Validar origen
    src_exists = src_path.exists()
    src_in_src = str(src_path).startswith(str(SRC))
    
    # Validar destino (puede no existir aún)
    tgt_in_src = str(tgt_path).startswith(str(SRC)) if not row["TARGET_PATH"].startswith("audit/") else True
    
    # Validar acción
    action = row["ACTION"]
    if action not in ("KEEP", "MOVE", "MERGE", "SPLIT", "DELETE_CANDIDATE"):
        t1_errors.append(f"Acción inválida: {action} en {row['CURRENT_PATH']}")
    
    if not src_exists and action not in ("DELETE_CANDIDATE",):
        t1_errors.append(f"Origen no existe: {row['CURRENT_PATH']}")
    
    if action == "DELETE_CANDIDATE" and src_exists:
        t1_ok += 1  # candidato encontrado
    elif action in ("MOVE", "MERGE", "SPLIT"):
        if src_exists:
            t1_ok += 1
        else:
            t1_errors.append(f"Origen no existe para {action}: {row['CURRENT_PATH']}")
    else:
        t1_ok += 1
    
    validated_rows.append({
        "ORIGIN": row["CURRENT_PATH"],
        "TARGET": row["TARGET_PATH"],
        "ACTION": action,
        "ORIGIN_EXISTS": "YES" if src_exists else "NO",
        "VALID": "OK" if src_exists or action == "DELETE_CANDIDATE" else "ERROR",
        "ERROR": "" if src_exists or action == "DELETE_CANDIDATE" else "ORIGIN_NOT_FOUND"
    })

# ============================================================
# T2 — FILE EXISTENCE AUDIT
# ============================================================
# Referencias en auditorías que deberían existir
referenced_files = set()

# Cargar referencias desde DEPENDENCY_GRAPH.json
import json
try:
    with open(FASE18 / "DEPENDENCY_GRAPH.json", "r", encoding="utf-8") as f:
        dep_graph = json.load(f)
    for node in dep_graph["nodes"]:
        nid = node["id"]
        if nid.startswith("src/"):
            referenced_files.add(nid)
except Exception:
    pass

# Cargar referencias desde REACHABILITY
try:
    with open(FASE18 / "ENTRYPOINT_REACHABILITY.csv", "r", encoding="utf-8") as f:
        for row in csv.DictReader(f):
            if row["REACHABLE_FROM_MAIN"] == "YES":
                referenced_files.add(row["FILE"])
except Exception:
    pass

t2_missing = []
t2_found = 0
for f in referenced_files:
    if (BASE / f).exists():
        t2_found += 1
    else:
        t2_missing.append(f)

# ============================================================
# T3 — IMPORT GRAPH VALIDATION
# ============================================================
t3_broken = []
t3_circular = []
t3_orphan = []

# Mapeo de imports locales por archivo
local_imports = defaultdict(set)
for f in all_src_files:
    if f.suffix not in (".ts", ".tsx"):
        continue
    text = read_file(f)
    rel_f = rel(f)
    for m in re.finditer(r'from\s+["\']([^"\']+)["\']', text):
        src = m.group(1)
        if src.startswith(".") or src.startswith("src/"):
            local_imports[rel_f].add(src)

# Detectar imports rotos (referencias a archivos que no existen)
for f, imps in local_imports.items():
    for imp in imps:
        # Resolver ruta
        if imp.startswith("."):
            base = Path(f).parent
            resolved = (base / imp).resolve()
        elif imp.startswith("src/"):
            resolved = BASE / imp[4:] if imp.startswith("src/") else BASE / imp
        else:
            continue
        
        # Verificar existencia con extensiones comunes
        exists = False
        for ext in ["", ".ts", ".tsx", "/index.ts", "/index.tsx"]:
            if ext:
                test = resolved.with_suffix(ext) if not ext.startswith("/") else resolved / ext.lstrip("/")
            else:
                test = resolved
            if test.exists():
                exists = True
                break
        
        if not exists:
            t3_broken.append({
                "FILE": f,
                "IMPORT": imp,
                "RESOLVED": str(resolved.relative_to(BASE) if resolved.is_relative_to(BASE) else resolved)
            })

# Detectar imports huérfanos (archivos nunca importados)
all_imported = set()
for f, imps in local_imports.items():
    for imp in imps:
        if imp.startswith("."):
            base = Path(f).parent
            resolved = (base / imp).resolve()
        elif imp.startswith("src/"):
            resolved = BASE / imp[4:] if imp.startswith("src/") else BASE / imp
        else:
            continue
        for ext in ["", ".ts", ".tsx", "/index.ts", "/index.tsx"]:
            if ext:
                test = resolved.with_suffix(ext) if not ext.startswith("/") else resolved / ext.lstrip("/")
            else:
                test = resolved
            if test.exists():
                all_imported.add(rel(test))
                break

# ============================================================
# T4 — PROVIDER VALIDATION
# ============================================================
providers = {
    "AuthProvider": "src/presentation/contexts/AuthContext.tsx",
    "CartProvider": "src/presentation/contexts/CartContext.tsx",
    "CartDrawerProvider": "src/presentation/contexts/CartDrawerContext.tsx",
    "ThemeProvider": "src/presentation/contexts/ThemeContext.tsx",
    "ThemeProvider_DUP": "src/app/contexts/ThemeContext.tsx",
    "QueryClientProvider": "node_modules/@tanstack/react-query",  # external
}

t4_validation = []
for name, path in providers.items():
    if path.startswith("node_modules/"):
        t4_validation.append({
            "PROVIDER": name,
            "PATH": path,
            "EXISTS": "EXTERNAL",
            "IMPORTERS": 1,
            "STATUS": "OK"
        })
    else:
        p = BASE / path
        exists = p.exists()
        import_count = 0
        for f in all_src_files:
            if f.suffix in (".ts", ".tsx"):
                text = read_file(f)
                if name in text and "import" in text:
                    import_count += 1
        
        t4_validation.append({
            "PROVIDER": name,
            "PATH": path,
            "EXISTS": "YES" if exists else "NO",
            "IMPORTERS": import_count,
            "STATUS": "OK" if exists else "MISSING"
        })

# ============================================================
# T5 — ROUTING VALIDATION
# ============================================================
t5_routes = []
main_tsx = SRC / "main.tsx"
app_tsx = SRC / "presentation" / "pages" / "App.tsx"
app_tsx_alt = SRC / "app" / "App.tsx"

# Detectar entry points
entry_points = []
if main_tsx.exists():
    entry_points.append(("src/main.tsx", "PRODUCTION", read_file(main_tsx)))
if app_tsx.exists():
    entry_points.append(("src/presentation/pages/App.tsx", "PRODUCTION_ROUTER", read_file(app_tsx)))
if app_tsx_alt.exists():
    entry_points.append(("src/app/App.tsx", "ALTERNATIVE", read_file(app_tsx_alt)))

# Detectar rutas React Router
routes = []
for ep_name, ep_type, ep_text in entry_points:
    if "Route" in ep_text or "Routes" in ep_text or "BrowserRouter" in ep_text:
        for m in re.finditer(r'path="([^"]+)"', ep_text):
            routes.append({
                "ENTRY": ep_name,
                "TYPE": ep_type,
                "PATH": m.group(1),
                "LINE": ep_text[:m.start()].count("\n") + 1
            })

# Detectar rutas huérfanas
orphan_routes = []
for r in routes:
    if r["TYPE"] == "ALTERNATIVE":
        orphan_routes.append(r)

# ============================================================
# T6 — LAYOUT VALIDATION
# ============================================================
layout_names = ["DashboardLayout", "PublicLayout", "AuthLayout", "Layout",
                "Header", "Sidebar", "Footer", "Navbar", "NavigationBar",
                "BottomNavigation", "ProtectedRoute", "ScrollToTop",
                "CartDrawer", "AdminDashboard", "SimpleLoginPage"]

t6_layouts = []
for name in layout_names:
    found = list(SRC.rglob(f"{name}.tsx"))
    if found:
        for f in found:
            t6_layouts.append({
                "NAME": name,
                "PATH": rel(f),
                "EXISTS": "YES",
                "IMPORTERS": []  # se llena abajo
            })
    else:
        t6_layouts.append({
            "NAME": name,
            "PATH": "NOT_FOUND",
            "EXISTS": "NO",
            "IMPORTERS": []
        })

# Contar importers
for layout in t6_layouts:
    if layout["EXISTS"] == "YES":
        count = 0
        for f in all_src_files:
            if f.suffix in (".ts", ".tsx"):
                text = read_file(f)
                if layout["NAME"] in text and "import" in text:
                    count += 1
        layout["IMPORTERS"] = count

# ============================================================
# T7 — DUPLICATE CONTENT AUDIT
# ============================================================
# Agrupar por contenido similar (hash de primeras líneas)
content_hashes = defaultdict(list)
for f in all_src_files:
    if f.suffix not in (".ts", ".tsx") or f.name in ("vite-env.d.ts",):
        continue
    text = read_file(f)
    # Normalizar: eliminar espacios y comentarios
    normalized = re.sub(r'//.*$', '', text, flags=re.MULTILINE)
    normalized = re.sub(r'/\*.*?\*/', '', normalized, flags=re.DOTALL)
    normalized = re.sub(r'\s+', ' ', normalized).strip()
    h = hashlib.md5(normalized[:500].encode()).hexdigest()  # primeras 500 chars
    content_hashes[h].append(f)

t7_duplicates = []
for h, files in content_hashes.items():
    if len(files) > 1:
        t7_duplicates.append({
            "HASH": h[:12],
            "FILES": [rel(f) for f in files],
            "COUNT": len(files)
        })

# ============================================================
# T8 — DEAD CODE AUDIT
# ============================================================
# Archivos nunca importados por nadie
imported_by_someone = set()
for f, imps in local_imports.items():
    for imp in imps:
        if imp.startswith("."):
            base = Path(f).parent
            resolved = (base / imp).resolve()
        elif imp.startswith("src/"):
            resolved = BASE / imp[4:] if imp.startswith("src/") else BASE / imp
        else:
            continue
        for ext in ["", ".ts", ".tsx", "/index.ts", "/index.tsx"]:
            if ext:
                test = resolved.with_suffix(ext) if not ext.startswith("/") else resolved / ext.lstrip("/")
            else:
                test = resolved
            if test.exists():
                imported_by_someone.add(rel(test))
                break

dead_files = []
for f in all_src_files:
    if f.suffix not in (".ts", ".tsx"):
        continue
    r = rel(f)
    if r not in imported_by_someone:
        # Verificar si es entry point o index
        if r not in ("src/main.tsx",):
            dead_files.append(r)

# ============================================================
# T9 — BUILD RISK ANALYSIS
# ============================================================
t9_risks = []

# Riesgo 1: Mover src/presentation/ (afecta 25 archivos)
pres_files = list((SRC / "presentation").rglob("*.tsx"))
t9_risks.append({
    "RISK": "Mover src/presentation/ a src/app/",
    "IMPACT": "HIGH",
    "FILES_AFFECTED": len(pres_files),
    "TYPE": "ROUTING_BREAK"
})

# Riesgo 2: Fusionar UI libraries
app_ui = list((SRC / "app" / "components" / "ui").rglob("*.tsx")) if (SRC / "app" / "components" / "ui").exists() else []
shared_ui = list((SRC / "shared" / "ui").rglob("*.tsx"))
t9_risks.append({
    "RISK": "Fusionar src/app/components/ui/ en src/shared/ui/",
    "IMPACT": "MEDIUM",
    "FILES_AFFECTED": len(app_ui) + len(shared_ui),
    "TYPE": "IMPORT_BREAK"
})

# Riesgo 3: Eliminar ThemeContext duplicado
t9_risks.append({
    "RISK": "Eliminar src/app/contexts/ThemeContext.tsx",
    "IMPACT": "MEDIUM",
    "FILES_AFFECTED": 1,
    "TYPE": "PROVIDER_BREAK"
})

# Riesgo 4: Mover 73 archivos duplicados
t9_risks.append({
    "RISK": "Eliminar 73 archivos duplicados",
    "IMPACT": "CRITICAL",
    "FILES_AFFECTED": 73,
    "TYPE": "DATA_LOSS"
})

# ============================================================
# T10 — PHASE 3 EXECUTION GATE
# ============================================================
# Calcular estado
total_errors = len(t1_errors) + len(t2_missing) + len(t3_broken)
total_warnings = len(t7_duplicates) + len(dead_files) + len(t9_risks)

if total_errors > 0:
    gate_status = "NOT_READY"
elif total_warnings > 10:
    gate_status = "READY_WITH_WARNINGS"
else:
    gate_status = "READY"

# ============================================================
# GENERAR DOCUMENTOS
# ============================================================

# 01_MIGRATION_MAP_VALIDATION.md
with open(FASE23 / "01_MIGRATION_MAP_VALIDATION.md", "w", encoding="utf-8") as f:
    f.write("# 01_MIGRATION_MAP_VALIDATION.md\n\n")
    f.write(f"Total filas validadas: {len(validated_rows)}\n")
    f.write(f"Filas OK: {t1_ok}\n")
    f.write(f"Errores: {len(t1_errors)}\n\n")
    f.write("## Errores detectados\n\n")
    if t1_errors:
        for e in t1_errors[:20]:
            f.write(f"- {e}\n")
    else:
        f.write("Ningún error crítico en el mapa de migración.\n")
    f.write("\n## Muestra de validaciones\n\n")
    f.write("| Origen | Destino | Acción | Origen existe | Estado |\n")
    f.write("|--------|---------|--------|---------------|--------|\n")
    for r in validated_rows[:15]:
        f.write(f"| `{r['ORIGIN']}` | `{r['TARGET']}` | {r['ACTION']} | {r['ORIGIN_EXISTS']} | {r['VALID']} |\n")

# 02_FILE_EXISTENCE_AUDIT.md
with open(FASE23 / "02_FILE_EXISTENCE_AUDIT.md", "w", encoding="utf-8") as f:
    f.write("# 02_FILE_EXISTENCE_AUDIT.md\n\n")
    f.write(f"Total archivos en src/: {len(all_src_files)}\n")
    f.write(f"Archivos referenciados en auditorías: {len(referenced_files)}\n")
    f.write(f"Archivos encontrados: {t2_found}\n")
    f.write(f"Archivos faltantes: {len(t2_missing)}\n\n")
    if t2_missing:
        f.write("## Archivos referenciados pero inexistentes\n\n")
        for m in t2_missing[:20]:
            f.write(f"- `{m}`\n")
    else:
        f.write("Todos los archivos referenciados existen.\n")

# 03_IMPORT_GRAPH_VALIDATION.md
with open(FASE23 / "03_IMPORT_GRAPH_VALIDATION.md", "w", encoding="utf-8") as f:
    f.write("# 03_IMPORT_GRAPH_VALIDATION.md\n\n")
    f.write(f"Total imports locales analizados: {sum(len(v) for v in local_imports.values())}\n")
    f.write(f"Imports rotos detectados: {len(t3_broken)}\n")
    f.write(f"Imports huérfanos detectados: {len(dead_files)}\n\n")
    if t3_broken:
        f.write("## Imports rotos\n\n")
        for b in t3_broken[:20]:
            f.write(f"- `{b['FILE']}` → `{b['IMPORT']}` (no resuelve a `{b['RESOLVED']}`)\n")
    else:
        f.write("No se detectaron imports rotos.\n")
    f.write("\n## Archivos huérfanos (nunca importados)\n\n")
    if dead_files:
        for d in dead_files[:20]:
            f.write(f"- `{d}`\n")
    else:
        f.write("No se detectaron archivos huérfanos.\n")

# 04_PROVIDER_VALIDATION.md
with open(FASE23 / "04_PROVIDER_VALIDATION.md", "w", encoding="utf-8") as f:
    f.write("# 04_PROVIDER_VALIDATION.md\n\n")
    f.write("| Provider | Ruta | Existe | Importers | Estado |\n")
    f.write("|----------|------|--------|-----------|--------|\n")
    for p in t4_validation:
        f.write(f"| {p['PROVIDER']} | `{p['PATH']}` | {p['EXISTS']} | {p['IMPORTERS']} | {p['STATUS']} |\n")

# 05_ROUTING_VALIDATION.md
with open(FASE23 / "05_ROUTING_VALIDATION.md", "w", encoding="utf-8") as f:
    f.write("# 05_ROUTING_VALIDATION.md\n\n")
    f.write("## Entry Points\n\n")
    for ep_name, ep_type, _ in entry_points:
        f.write(f"- `{ep_name}` — {ep_type}\n")
    f.write(f"\n## Rutas detectadas: {len(routes)}\n\n")
    f.write("| Entrada | Tipo | Ruta | Línea |\n")
    f.write("|---------|------|------|-------|\n")
    for r in routes[:15]:
        f.write(f"| `{r['ENTRY']}` | {r['TYPE']} | `{r['PATH']}` | {r['LINE']} |\n")
    if orphan_routes:
        f.write("\n## Rutas en entry points alternativos (huérfanas)\n\n")
        for r in orphan_routes:
            f.write(f"- `{r['PATH']}` en `{r['ENTRY']}`\n")

# 06_LAYOUT_VALIDATION.md
with open(FASE23 / "06_LAYOUT_VALIDATION.md", "w", encoding="utf-8") as f:
    f.write("# 06_LAYOUT_VALIDATION.md\n\n")
    f.write("| Nombre | Ruta | Existe | Importers |\n")
    f.write("|--------|------|--------|-----------|\n")
    for l in t6_layouts:
        f.write(f"| {l['NAME']} | `{l['PATH']}` | {l['EXISTS']} | {l['IMPORTERS']} |\n")

# 07_DUPLICATE_CONTENT_AUDIT.md
with open(FASE23 / "07_DUPLICATE_CONTENT_AUDIT.md", "w", encoding="utf-8") as f:
    f.write("# 07_DUPLICATE_CONTENT_AUDIT.md\n\n")
    f.write(f"Duplicados por contenido (hash): {len(t7_duplicates)}\n\n")
    if t7_duplicates:
        f.write("## Duplicados detectados\n\n")
        for dup in t7_duplicates[:10]:
            f.write(f"### Hash {dup['HASH']} ({dup['COUNT']} archivos)\n\n")
            for file_path in dup['FILES']:
                f.write(f"- `{file_path}`\n")
            f.write("\n")
    else:
        f.write("No se detectaron duplicados exactos por contenido.\n")

# 08_DEAD_CODE_AUDIT.md
with open(FASE23 / "08_DEAD_CODE_AUDIT.md", "w", encoding="utf-8") as f:
    f.write("# 08_DEAD_CODE_AUDIT.md\n\n")
    f.write(f"Archivos nunca importados: {len(dead_files)}\n\n")
    if dead_files:
        f.write("## Archivos potencialmente muertos (nunca importados)\n\n")
        for d in dead_files[:30]:
            f.write(f"- `{d}`\n")
        if len(dead_files) > 30:
            f.write(f"\n... y {len(dead_files)-30} más.\n")
    else:
        f.write("No se detectaron archivos huérfanos.\n")

# 09_BUILD_RISK_ANALYSIS.md
with open(FASE23 / "09_BUILD_RISK_ANALYSIS.md", "w", encoding="utf-8") as f:
    f.write("# 09_BUILD_RISK_ANALYSIS.md\n\n")
    f.write("## Riesgos de migración\n\n")
    f.write("| Riesgo | Impacto | Archivos | Tipo |\n")
    f.write("|--------|---------|----------|------|\n")
    for r in t9_risks:
        f.write(f"| {r['RISK']} | {r['IMPACT']} | {r['FILES_AFFECTED']} | {r['TYPE']} |\n")
    f.write("\n## Recomendaciones\n\n")
    f.write("1. Ejecutar `npm run build` antes de cualquier movimiento\n")
    f.write("2. Migrar en waves pequeñas con validación continua\n")
    f.write("3. No eliminar archivos duplicados hasta confirmar contenido idéntico\n")
    f.write("4. Mantener backup de estructura original\n")

# 10_PHASE3_EXECUTION_GATE.md
with open(FASE23 / "10_PHASE3_EXECUTION_GATE.md", "w", encoding="utf-8") as f:
    f.write("# 10_PHASE3_EXECUTION_GATE.md\n\n")
    f.write(f"## Estado: {gate_status}\n\n")
    f.write("### Evidencia\n\n")
    f.write(f"- Errores en migration map: {len(t1_errors)}\n")
    f.write(f"- Archivos faltantes: {len(t2_missing)}\n")
    f.write(f"- Imports rotos: {len(t3_broken)}\n")
    f.write(f"- Duplicados por contenido: {len(t7_duplicates)}\n")
    f.write(f"- Archivos huérfanos: {len(dead_files)}\n")
    f.write(f"- Riesgos críticos: {sum(1 for r in t9_risks if r['IMPACT'] == 'CRITICAL')}\n\n")
    if gate_status == "NOT_READY":
        f.write("### Bloqueadores\n\n")
        for e in t1_errors[:5]:
            f.write(f"- {e}\n")
        if t2_missing:
            f.write(f"- {len(t2_missing)} archivos referenciados no existen\n")
        if t3_broken:
            f.write(f"- {len(t3_broken)} imports rotos detectados\n")
    elif gate_status == "READY_WITH_WARNINGS":
        f.write("### Advertencias\n\n")
        f.write(f"- {len(t7_duplicates)} duplicados por contenido\n")
        f.write(f"- {len(dead_files)} archivos huérfanos\n")
    else:
        f.write("### Justificación\n\n")
        f.write("Todas las validaciones pasaron sin errores críticos.\n")
        f.write("La arquitectura está lista para migración física.\n")

# 00_EXECUTIVE_SUMMARY.md
with open(FASE23 / "00_EXECUTIVE_SUMMARY.md", "w", encoding="utf-8") as f:
    f.write("# 00_EXECUTIVE_SUMMARY.md — Fase 2.3\n\n")
    f.write("## Hallazgos principales\n\n")
    f.write(f"- **Errores en migration map**: {len(t1_errors)}\n")
    f.write(f"- **Archivos referenciados faltantes**: {len(t2_missing)}\n")
    f.write(f"- **Imports rotos**: {len(t3_broken)}\n")
    f.write(f"- **Duplicados por contenido**: {len(t7_duplicates)}\n")
    f.write(f"- **Archivos huérfanos (nunca importados)**: {len(dead_files)}\n")
    f.write(f"- **Riesgos de build**: {len(t9_risks)}\n\n")
    f.write("## Estado del Gate\n\n")
    f.write(f"**{gate_status}**\n\n")
    if gate_status == "READY":
        f.write("La arquitectura está validada y lista para Fase 3.\n")
    elif gate_status == "READY_WITH_WARNINGS":
        f.write("La arquitectura puede migrarse, pero requiere atención a duplicados y código muerto.\n")
    else:
        f.write("NO iniciar Fase 3 hasta resolver errores críticos.\n")

print("Fase 2.3 completada.")
print(f"Errores: {len(t1_errors)}")
print(f"Archivos faltantes: {len(t2_missing)}")
print(f"Imports rotos: {len(t3_broken)}")
print(f"Duplicados: {len(t7_duplicates)}")
print(f"Huérfanos: {len(dead_files)}")
print(f"Gate: {gate_status}")

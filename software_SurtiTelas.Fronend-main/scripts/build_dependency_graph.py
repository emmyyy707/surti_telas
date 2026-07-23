#!/usr/bin/env python3
"""
Motor de trazabilidad estática - Fase 1.8.1 (corregido)
Genera grafo de dependencias completo desde src/main.tsx
"""

import os
import re
import json
import csv
from pathlib import Path
from collections import defaultdict, deque
from typing import Dict, List, Set, Tuple, Optional

# ============================================================
# CONFIG
# ============================================================
PROJECT_ROOT = Path(os.getcwd())
SRC_DIR = PROJECT_ROOT / "src"
TS_CONFIG = PROJECT_ROOT / "tsconfig.json"
OUTPUT_DIR = PROJECT_ROOT / "audit" / "fase-1.8.1"
MAIN_ENTRY = SRC_DIR / "main.tsx"

OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

# ============================================================
# TS PATH ALIAS PARSER
# ============================================================
ALIASES: Dict[str, str] = {}
try:
    tsconfig_data = json.loads(TS_CONFIG.read_text(encoding="utf-8"))
    paths = tsconfig_data.get("compilerOptions", {}).get("paths", {})
    for alias, targets in paths.items():
        base_alias = re.sub(r'\*\*$', '', alias).rstrip('/')
        target = targets[0] if isinstance(targets, list) else targets
        base_target = re.sub(r'\*\*$', '', target).rstrip('/')
        ALIASES[base_alias] = base_target
except Exception:
    # Fallback manual
    ALIASES = {
        "@": "src",
        "@config": "src/config",
        "@config/*": "src/config/*",
        "@presentation": "src/presentation",
        "@presentation/*": "src/presentation/*",
        "@presentation/components": "src/presentation/components",
        "@presentation/components/*": "src/presentation/components/*",
        "@presentation/pages": "src/presentation/pages",
        "@presentation/pages/*": "src/presentation/pages/*",
        "@presentation/contexts": "src/presentation/contexts",
        "@presentation/contexts/*": "src/presentation/contexts/*",
        "@presentation/hooks": "src/presentation/hooks",
        "@presentation/hooks/*": "src/presentation/hooks/*",
        "@presentation/styles": "src/presentation/styles",
        "@presentation/styles/*": "src/presentation/styles/*",
        "@application": "src/application",
        "@application/*": "src/application/*",
        "@application/services": "src/application/services",
        "@application/services/*": "src/application/services/*",
        "@application/usecases": "src/application/usecases",
        "@application/usecases/*": "src/application/usecases/*",
        "@domain": "src/domain",
        "@domain/*": "src/domain/*",
        "@domain/entities": "src/domain/entities",
        "@domain/entities/*": "src/domain/entities/*",
        "@domain/repositories": "src/domain/repositories",
        "@domain/repositories/*": "src/domain/repositories/*",
        "@infrastructure": "src/infrastructure",
        "@infrastructure/*": "src/infrastructure/*",
        "@infrastructure/api": "src/infrastructure/api",
        "@infrastructure/api/*": "src/infrastructure/api/*",
        "@infrastructure/repositories": "src/infrastructure/repositories",
        "@infrastructure/repositories/*": "src/infrastructure/repositories/*",
        "@shared": "src/shared",
        "@shared/*": "src/shared/*",
        "@app": "src/app",
        "@app/*": "src/app/*",
        "@assets": "src/assets",
        "@assets/*": "src/assets/*",
    }

# ============================================================
# FILE DISCOVERY
# ============================================================
def find_ts_files(root: Path) -> List[Path]:
    files = []
    for dirpath, _, filenames in os.walk(root):
        for f in filenames:
            if f.endswith(".ts") or f.endswith(".tsx"):
                files.append(Path(dirpath) / f)
    return sorted(files)

ALL_FILES = find_ts_files(SRC_DIR)
FILE_ID_MAP: Dict[str, Path] = {}
for f in ALL_FILES:
    rel = f.relative_to(PROJECT_ROOT).as_posix()
    FILE_ID_MAP[rel] = f

# ============================================================
# HELPERS
# ============================================================
HTML_COMMENT_RE = re.compile(r'<!--.*?-->', re.DOTALL)
# Remove JS/TS comments (single-line and multi-line)
COMMENT_RE = re.compile(r'(?s)//.*?$|/\*.*?\*/', re.MULTILINE)

def strip_comments(text: str) -> str:
    # JS comments
    text = COMMENT_RE.sub('', text)
    # HTML comments if any
    text = HTML_COMMENT_RE.sub('', text)
    return text

NPM_PACKAGE_RE = re.compile(r'^(?:@[a-zA-Z0-9_\-]+\/)?[a-zA-Z0-9_\-]+$')

# ============================================================
# IMPORT / EXPORT / LAZY PARSERS
# ============================================================
# Matches:
#   import default, { a, b } from '...'
#   import { a, b } from '...'
#   import * as X from '...'
#   import '...'
IMPORT_RE = re.compile(
    r'import\s+(?:(\w+)\s*,)?\s*(?:(\{(?:[^{}]|\{[^{}]*\})*\}|[\w\s,]+|[\*]\s+as\s+\w+))\s*(?:as\s+\w+)?\s*from\s+'
    r'(?P<q>["\'])(?P<src>[^"\']+)(?P=q)',
    re.MULTILINE,
)
# Side-effect only imports
IMPORT_SIDE_EFFECT_RE = re.compile(r'import\s+(?P<q>["\'])(?P<src>[^"\']+)(?P=q);', re.MULTILINE)

# Matches:
#   export { a, b } from '...'
#   export * from '...'
#   export { a } from '...'
#   export default X from '...'  (rare but valid)
EXPORT_RE = re.compile(
    r'export\s+(?:(\{[^}]*\}|[\w]+|\*))\s*(?:as\s+\w+)?\s*from\s+'
    r'(?P<q>["\'])(?P<src>[^"\']+)(?P=q)',
    re.MULTILINE,
)

LAZY_RE = re.compile(r'import\s*\(\s*(?P<q>["\'])(?P<src>[^"\']+)(?P=q)\s*\)', re.MULTILINE)

def resolve_source(source: str, from_file: Path) -> Optional[Path]:
    if NPM_PACKAGE_RE.match(source):
        return None

    resolved_alias = None
    if source in ALIASES:
        resolved_alias = ALIASES[source]
    else:
        for alias, target in ALIASES.items():
            if alias.endswith("*"):
                prefix = alias[:-1]
                if source.startswith(prefix):
                    suffix = source[len(prefix):]
                    resolved_alias = target[:-1] + suffix
                    break
            elif source.startswith(alias + "/"):
                resolved_alias = target + source[len(alias):]
                break

    if resolved_alias:
        candidate = PROJECT_ROOT / resolved_alias
        if candidate.is_file():
            return candidate
        for ext in [".tsx", ".ts"]:
            p = candidate.with_suffix(ext)
            if p.is_file():
                return p
        if candidate.is_dir():
            for idx in ["index.ts", "index.tsx"]:
                p = candidate / idx
                if p.is_file():
                    return p
        return None

    if source.startswith("."):
        base = from_file.parent
        candidate = (base / source).resolve()
        if candidate.is_file():
            return candidate
        for ext in [".tsx", ".ts"]:
            p = candidate.with_suffix(ext)
            if p.is_file():
                return p
        if candidate.is_dir():
            for idx in ["index.ts", "index.tsx"]:
                p = candidate / idx
                if p.is_file():
                    return p
        return None

    if source.startswith("src/"):
        candidate = PROJECT_ROOT / source
        if candidate.is_file():
            return candidate
        for ext in [".tsx", ".ts"]:
            p = candidate.with_suffix(ext)
            if p.is_file():
                return p
        if candidate.is_dir():
            for idx in ["index.ts", "index.tsx"]:
                p = candidate / idx
                if p.is_file():
                    return p
        return None

    return None

# ============================================================
# PARSE ALL FILES
# ============================================================
nodes: Dict[str, Dict] = {}
edges: List[Dict] = []
imports_by_file: Dict[str, List[Dict]] = defaultdict(list)
file_imports: Dict[str, List[str]] = defaultdict(list)

for f in ALL_FILES:
    rel = f.relative_to(PROJECT_ROOT).as_posix()
    try:
        raw_text = f.read_text(encoding="utf-8", errors="replace")
    except Exception:
        raw_text = ""
    lines = raw_text.splitlines()
    nodes[rel] = {
        "id": rel,
        "exists": True,
        "size": f.stat().st_size,
        "lines": len(lines),
    }

    text = strip_comments(raw_text)

    # Static imports (including side-effect)
    for m in IMPORT_RE.finditer(text):
        source = m.group("src")
        target = resolve_source(source, f)
        target_id = target.relative_to(PROJECT_ROOT).as_posix() if target else source
        edge = {
            "from": rel,
            "to": target_id,
            "type": "STATIC_IMPORT",
            "source_raw": source,
        }
        edges.append(edge)
        imports_by_file[rel].append({"source": source, "resolved": target_id, "type": "STATIC_IMPORT"})
        file_imports[rel].append(target_id)

    for m in IMPORT_SIDE_EFFECT_RE.finditer(text):
        source = m.group("src")
        # Avoid double counting if already matched by IMPORT_RE
        if not any(imp.get("source") == source for imp in imports_by_file[rel]):
            target = resolve_source(source, f)
            target_id = target.relative_to(PROJECT_ROOT).as_posix() if target else source
            edge = {
                "from": rel,
                "to": target_id,
                "type": "STATIC_IMPORT",
                "source_raw": source,
            }
            edges.append(edge)
            imports_by_file[rel].append({"source": source, "resolved": target_id, "type": "STATIC_IMPORT"})
            file_imports[rel].append(target_id)

    # Lazy imports
    for m in LAZY_RE.finditer(text):
        source = m.group("src")
        target = resolve_source(source, f)
        target_id = target.relative_to(PROJECT_ROOT).as_posix() if target else source
        edge = {
            "from": rel,
            "to": target_id,
            "type": "LAZY_IMPORT",
            "source_raw": source,
        }
        edges.append(edge)
        imports_by_file[rel].append({"source": source, "resolved": target_id, "type": "LAZY_IMPORT"})
        file_imports[rel].append(target_id)

    # Re-exports (barrels)
    for m in EXPORT_RE.finditer(text):
        source = m.group("src")
        target = resolve_source(source, f)
        target_id = target.relative_to(PROJECT_ROOT).as_posix() if target else source
        edge = {
            "from": rel,
            "to": target_id,
            "type": "REEXPORT",
            "source_raw": source,
        }
        edges.append(edge)
        imports_by_file[rel].append({"source": source, "resolved": target_id, "type": "REEXPORT"})
        file_imports[rel].append(target_id)

# ============================================================
# DEPENDENCY GRAPH JSON
# ============================================================
graph = {
    "nodes": list(nodes.values()),
    "edges": edges,
}
with open(OUTPUT_DIR / "DEPENDENCY_GRAPH.json", "w", encoding="utf-8") as f:
    json.dump(graph, f, indent=2, ensure_ascii=False)

# ============================================================
# REVERSE DEPENDENCIES CSV
# ============================================================
reverse: Dict[str, List[str]] = defaultdict(list)
for e in edges:
    to = e["to"]
    fr = e["from"]
    if to in nodes and to not in reverse[to]:
        reverse[to].append(fr)

with open(OUTPUT_DIR / "REVERSE_DEPENDENCIES.csv", "w", newline="", encoding="utf-8") as f:
    writer = csv.writer(f)
    writer.writerow(["FILE", "IMPORTED_BY_COUNT", "IMPORTED_BY"])
    for rel in sorted(nodes.keys()):
        importers = reverse.get(rel, [])
        writer.writerow([rel, len(importers), ";".join(importers)])

# ============================================================
# FORWARD DEPENDENCIES CSV
# ============================================================
with open(OUTPUT_DIR / "FORWARD_DEPENDENCIES.csv", "w", newline="", encoding="utf-8") as f:
    writer = csv.writer(f)
    writer.writerow(["FILE", "IMPORTS_COUNT", "IMPORTS"])
    for rel in sorted(nodes.keys()):
        imps = file_imports.get(rel, [])
        writer.writerow([rel, len(imps), ";".join(imps)])

# ============================================================
# REACHABILITY FROM MAIN.TSX
# ============================================================
adj: Dict[str, List[str]] = defaultdict(list)
for e in edges:
    if e["from"] in nodes and e["to"] in nodes:
        adj[e["from"]].append(e["to"])

reachability: Dict[str, List[str]] = {}

def compute_reachability():
    start = MAIN_ENTRY.relative_to(PROJECT_ROOT).as_posix()
    visited = set()
    queue = deque([(start, [start])])
    reachability[start] = [start]

    while queue:
        current, path = queue.popleft()
        if current in visited:
            continue
        visited.add(current)
        reachability[current] = list(path)

        for neighbor in adj.get(current, []):
            if neighbor not in visited:
                queue.append((neighbor, path + [neighbor]))

compute_reachability()

with open(OUTPUT_DIR / "ENTRYPOINT_REACHABILITY.csv", "w", newline="", encoding="utf-8") as f:
    writer = csv.writer(f)
    writer.writerow(["FILE", "REACHABLE_FROM_MAIN", "PATH_FROM_MAIN"])
    for rel in sorted(nodes.keys()):
        path = reachability.get(rel, [])
        writer.writerow([rel, "YES" if path else "NO", " -> ".join(path)])

# ============================================================
# CYCLE DETECTION
# ============================================================
def find_cycles():
    found = []
    visited_global = set()
    rec_stack = set()

    def dfs(node, path):
        visited_global.add(node)
        rec_stack.add(node)
        path.append(node)
        for neighbor in adj.get(node, []):
            if neighbor not in visited_global:
                dfs(neighbor, path)
            elif neighbor in rec_stack:
                cycle_start = path.index(neighbor)
                cycle = path[cycle_start:] + [neighbor]
                found.append(cycle)
        path.pop()
        rec_stack.remove(node)

    for node in sorted(nodes.keys()):
        if node not in visited_global:
            dfs(node, [])
    return found

cycles = find_cycles()

cycle_lines = []
cycle_lines.append("# Detección de Ciclos\n\n")
if cycles:
    for i, cyc in enumerate(cycles, 1):
        unique = list(dict.fromkeys(cyc))
        cycle_lines.append(f"## Ciclo {i}\n")
        cycle_lines.append(f"**Archivos:** {' -> '.join(cyc)}\n")
        cycle_lines.append(f"**Longitud (sin duplicados):** {len(unique)}\n\n")
else:
    cycle_lines.append("No se detectaron ciclos en el grafo de dependencias.\n\n")

with open(OUTPUT_DIR / "CYCLE_DETECTION.md", "w", encoding="utf-8") as f:
    f.writelines(cycle_lines)

# ============================================================
# ORPHAN ANALYSIS
# ============================================================
orphans = []
for rel in sorted(nodes.keys()):
    importers = reverse.get(rel, [])
    if not importers:
        orphans.append(rel)

orphan_lines = []
orphan_lines.append("# Análisis de Archivos Huérfanos\n\n")
orphan_lines.append("Archivo huérfano = sin imports entrantes desde otros archivos del proyecto.\n\n")
if orphans:
    for rel in orphans:
        orphan_lines.append(f"- `{rel}`\n")
else:
    orphan_lines.append("No se detectaron archivos huérfanos.\n")

with open(OUTPUT_DIR / "ORPHAN_ANALYSIS.md", "w", encoding="utf-8") as f:
    f.writelines(orphan_lines)

# ============================================================
# ALIAS RESOLUTION CSV
# ============================================================
alias_rows = []
for alias, target in sorted(ALIASES.items()):
    if "*" in alias:
        continue
    exists = (PROJECT_ROOT / target).exists()
    alias_rows.append((alias, target, "YES" if exists else "NO"))

with open(OUTPUT_DIR / "ALIAS_RESOLUTION.csv", "w", newline="", encoding="utf-8") as f:
    writer = csv.writer(f)
    writer.writerow(["ALIAS", "RESUELVE_A", "EXISTS"])
    for row in alias_rows:
        writer.writerow(row)

# ============================================================
# BARREL RESOLUTION CSV
# ============================================================
barrels = []
for rel, deps in imports_by_file.items():
    # Barrel = file where all outgoing edges are REEXPORT and at least one
    if deps and all(d["type"] == "REEXPORT" for d in deps):
        exports = [d["resolved"] for d in deps]
        barrels.append((rel, ";".join(exports)))

with open(OUTPUT_DIR / "BARREL_RESOLUTION.csv", "w", newline="", encoding="utf-8") as f:
    writer = csv.writer(f)
    writer.writerow(["BARREL", "EXPORTS", "ARCHIVO_REAL"])
    for barrel, exports in barrels:
        writer.writerow([barrel, exports, ""])

# ============================================================
# TRACEABILITY CERTIFICATE
# ============================================================
static_imports = sum(1 for e in edges if e["type"] == "STATIC_IMPORT")
lazy_imports = sum(1 for e in edges if e["type"] == "LAZY_IMPORT")
reexports = sum(1 for e in edges if e["type"] == "REEXPORT")
barrel_count = len(barrels)
alias_count = len([a for a in ALIASES if "*" not in a])
reachable_count = len([k for k, v in reachability.items() if v])
orphan_count = len(orphans)
cycle_count = len(cycles)

cert = []
cert.append("# TRACEABILITY CERTIFICATE\n\n")
cert.append("## Resumen de Trazabilidad\n\n")
cert.append(f"- **Total nodos (archivos TS/TSX):** {len(nodes)}\n")
cert.append(f"- **Total edges (imports):** {len(edges)}\n")
cert.append(f"- **Total imports estáticos:** {static_imports}\n")
cert.append(f"- **Total imports lazy:** {lazy_imports}\n")
cert.append(f"- **Total re-exports (barrels):** {reexports}\n")
cert.append(f"- **Total barrels identificados:** {barrel_count}\n")
cert.append(f"- **Total aliases definidos:** {alias_count}\n")
cert.append(f"- **Total archivos alcanzables desde main.tsx:** {reachable_count}\n")
cert.append(f"- **Total archivos huérfanos:** {orphan_count}\n")
cert.append(f"- **Total ciclos detectados:** {cycle_count}\n\n")
cert.append("## Validación\n\n")
cert.append(f"Archivos TS/TSX escaneados: {len(ALL_FILES)}\n")
cert.append(f"Punto de entrada: {MAIN_ENTRY}\n")
cert.append("Todo el análisis se generó exclusivamente a partir de evidencia estática del código fuente.\n")

with open(OUTPUT_DIR / "TRACEABILITY_CERTIFICATE.md", "w", encoding="utf-8") as f:
    f.writelines(cert)

print("Fase 1.8.1 completada.")
print(f"Archivos procesados: {len(ALL_FILES)}")
print(f"Nodos grafo: {len(nodes)}")
print(f"Edges: {len(edges)}")
print(f"Alcanzables desde main.tsx: {reachable_count}")
print(f"Huérfanos: {orphan_count}")
print(f"Ciclos: {cycle_count}")
print(f"Barrels: {barrel_count}")

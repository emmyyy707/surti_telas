#!/usr/bin/env python3
"""
Fase 1.11 — Ejecución: solo para stakeholders.
"""

import os
import re
import csv
import json
from pathlib import Path
from collections import defaultdict

BASE = Path(os.getcwd())
OUT = BASE / "audit" / "fase-1.11"
OUT.mkdir(parents=True, exist_ok=True)

DEP_GRAPH = OUT.parent / "fase-1.8.1" / "DEPENDENCY_GRAPH.json"
REACH = OUT.parent / "fase-1.8.1" / "ENTRYPOINT_REACHABILITY.csv"
RENDER_TREE = OUT.parent / "fase-1.9" / "RENDER_TREE.md"

graph = json.loads(DEP_GRAPH.read_text(encoding="utf-8"))
nodes = {n["id"]: n for n in graph["nodes"]}
edges = graph["edges"]

children_of = defaultdict(set)
for e in edges:
    f = e["from"]; t = e["to"]
    if f in nodes and t in nodes:
        children_of[f].add(t)

reachable_paths = {}
with REACH.open(encoding="utf-8") as f:
    for row in csv.DictReader(f):
        if row.get("REACHABLE_FROM_MAIN") == "YES":
            reachable_paths[row["FILE"]] = row["PATH_FROM_MAIN"]

render_rows = []
if RENDER_TREE.exists():
    for line in RENDER_TREE.read_text(encoding="utf-8").splitlines():
        if line.strip().startswith("|") and "Source File" not in line and "---" not in line:
            render_rows.append(line)

IMPORT_RE = re.compile(r"^\s*import\s+.*?from\s+['\"](.*?)['\"]", re.MULTILINE)
JSX_OPEN = re.compile(r"<\s*[A-Z][A-Za-z0-9]*\b")
JSX_ROUTE = re.compile(r"<Route\b")
JSX_LAZY = re.compile(r"lazy\s*\(")
JSX_SUSPENSE = re.compile(r"<Suspense\b")
DEF_USE = re.compile(r"export\s+(?:const|function)\s+(use[A-Z][a-zA-Z0-9_]*)")
CALL_USE = re.compile(r"\b(use[A-Z][a-zA-Z0-9_]*)\s*\(")

proof = []
referenced = []
unverified = []
chains = []

for rel in sorted(reachable_paths):
    path_str = reachable_paths[rel]
    path_nodes = [p.strip() for p in path_str.split("->")] if path_str else []

    p = BASE / rel
    if not p.exists():
        unverified.append((rel, "FILE_NOT_FOUND", ""))
        continue
    src = p.read_text(encoding="utf-8", errors="replace")

    proof_type = None
    proof_src = None
    proof_line = None
    proof_text = None
    status = "REFERENCED_ONLY"

    for rline in render_rows:
        if rel in rline:
            proof_type = "RENDER_TREE"
            proof_src = str(RENDER_TREE.relative_to(BASE))
            proof_line = ""
            proof_text = rline.strip()
            status = "EXECUTED"
            break

    if not proof_type and JSX_OPEN.search(src):
        m = JSX_OPEN.search(src)
        proof_type = "JSX"
        proof_src = rel
        proof_line = src[:m.start()].count("\n") + 1
        proof_text = m.group(0)
        status = "EXECUTED"

    if not proof_type and JSX_ROUTE.search(src):
        m = JSX_ROUTE.search(src)
        proof_type = "ROUTE"
        proof_src = rel
        proof_line = src[:m.start()].count("\n") + 1
        proof_text = m.group(0)
        status = "EXECUTED"

    if not proof_type and JSX_LAZY.search(src):
        m = JSX_LAZY.search(src)
        proof_type = "LAZY"
        proof_src = rel
        proof_line = src[:m.start()].count("\n") + 1
        proof_text = m.group(0)
        status = "EXECUTED"

    if not proof_type and JSX_SUSPENSE.search(src):
        m = JSX_SUSPENSE.search(src)
        proof_type = "SUSPENSE"
        proof_src = rel
        proof_line = src[:m.start()].count("\n") + 1
        proof_text = m.group(0)
        status = "EXECUTED"

    if not proof_type and (DEF_USE.search(src) or CALL_USE.search(src)):
        m = DEF_USE.search(src) or CALL_USE.search(src)
        proof_type = "HOOK_DEF" if DEF_USE.search(src) else "HOOK_CALL"
        proof_src = rel
        proof_line = src[:m.start()].count("\n") + 1
        proof_text = m.group(0)
        status = "EXECUTED"

    if status == "EXECUTED":
        proof.append({
            "FILE": rel,
            "STATUS": status,
            "PROOF_TYPE": proof_type or "",
            "PROOF_SOURCE": proof_src or "",
            "PROOF_LINE": proof_line or "",
            "PROOF_TEXT": (proof_text or "")[:120],
        })
        chains.append((rel, path_nodes))
    else:
        referenced.append((rel, path_nodes))

for rel in reachable_paths:
    if not any(r["FILE"] == rel for r in proof) and not any(r[0] == rel for r in referenced):
        unverified.append((rel, reachable_paths.get(rel, ""), ""))

with (OUT / "EXECUTION_PROOF.csv").open("w", encoding="utf-8", newline="") as f:
    w = csv.DictWriter(f, fieldnames=["FILE","STATUS","PROOF_TYPE","PROOF_SOURCE","PROOF_LINE","PROOF_TEXT"])
    w.writeheader()
    for row in proof:
        w.writerow(row)

def path_str_chain(rel, path_nodes):
    lines = []
    for n in path_nodes:
        lines.append(f"- {n}")
    lines.append(f"- {rel}")
    return "\n".join(lines)

with (OUT / "EXECUTION_CHAINS.md").open("w", encoding="utf-8") as f:
    for rel, nodes_list in chains:
        f.write(f"## {rel}\n\n")
        f.write(path_str_chain(rel, nodes_list))
        f.write("\n\n")

with (OUT / "REFERENCED_ONLY.md").open("w", encoding="utf-8") as f:
    f.write("# Referenced Only\n\n")
    for rel, path_nodes in referenced:
        f.write(f"- {rel}\n")
        f.write(f"  Path: {' -> '.join(path_nodes)}\n\n")

with (OUT / "UNVERIFIED_FILES.md").open("w", encoding="utf-8") as f:
    f.write("# Unverified execution\n\n")
    for item in unverified:
        if len(item) == 3:
            rel, path_or_reason, extra = item
        else:
            rel, path_or_reason = item
            extra = ""
        f.write(f"- {rel}\n")
        if path_or_reason:
            f.write(f"  Reason/path: {path_or_reason}\n")
        if extra:
            f.write(f"  {extra}\n")
        f.write("\n")

total_executed = len(proof)
total_referenced = len(referenced)
total_unverified = len(unverified)
total_chains = len(chains)

cert = []
cert.append("# Execution Chain Proof — Fase 1.11\n\n")
cert.append(f"- TOTAL_REACHABLE: {len(reachable_paths)}\n")
cert.append(f"- TOTAL_EXECUTED: {total_executed}\n")
cert.append(f"- TOTAL_REFERENCED_ONLY: {total_referenced}\n")
cert.append(f"- TOTAL_UNVERIFIED: {total_unverified}\n")
cert.append(f"- TOTAL_EXECUTION_CHAINS: {total_chains}\n")

with (OUT / "EXECUTION_CERTIFICATE.md").open("w", encoding="utf-8") as f:
    f.writelines(cert)

print("Fase 1.11 completed.")
print(f"Executed: {total_executed}")
print(f"Referenced: {total_referenced}")
print(f"Unverified: {total_unverified}")
print(f"Chains: {total_chains}")

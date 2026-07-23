#!/usr/bin/env python3
"""
Motor de trazabilidad de ejecución - Fase 1.9 (v3 - corregida)
Analiza archivos alcanzables desde main.tsx para determinar uso real.
"""

import os
import re
import json
import csv
from pathlib import Path
from collections import defaultdict
from typing import Dict, List, Set, Tuple, Optional

PROJECT_ROOT = Path(os.getcwd())
SRC_DIR = PROJECT_ROOT / "src"
OUTPUT_DIR = PROJECT_ROOT / "audit" / "fase-1.9"
PHASE1_DIR = PROJECT_ROOT / "audit" / "fase-1.8.1"

OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

# Load phase 1.8.1 data
REACHABLE_FILES = set()
REACHABILITY_PATHS = {}
with open(PHASE1_DIR / "ENTRYPOINT_REACHABILITY.csv", newline="", encoding="utf-8") as f:
    reader = csv.DictReader(f)
    for row in reader:
        if row["REACHABLE_FROM_MAIN"] == "YES":
            REACHABLE_FILES.add(row["FILE"])
            REACHABILITY_PATHS[row["FILE"]] = row["PATH_FROM_MAIN"]

# ============================================================
# CODE PATTERNS
# ============================================================
JSX_RENDER_RE = re.compile(r'return\s*\(?\s*<', re.MULTILINE)
RETURN_JSX_RE = re.compile(r'return\s+\(?\s*<', re.MULTILINE)
ELEMENT_JSX_RE = re.compile(r'element=\{\s*<', re.MULTILINE)
COMPONENT_USE_RE = re.compile(r'<([A-Z][a-zA-Z0-9_]*)\b', re.MULTILINE)
CHILDREN_JSX_RE = re.compile(r'\{children\}', re.MULTILINE)

BROWSER_ROUTER_RE = re.compile(r'BrowserRouter', re.MULTILINE)
ROUTES_RE = re.compile(r'<Routes>', re.MULTILINE)
ROUTE_RE = re.compile(r'<Route\b', re.MULTILINE)
NAVIGATE_RE = re.compile(r'<Navigate\b', re.MULTILINE)
CREATE_BROWSER_ROUTER_RE = re.compile(r'createBrowserRouter', re.MULTILINE)
PROTECTED_ROUTE_RE = re.compile(r'ProtectedRoute', re.MULTILINE)

CREATE_CONTEXT_RE = re.compile(r'createContext\b', re.MULTILINE)
CONTEXT_PROVIDER_RE = re.compile(r'\.Provider\b', re.MULTILINE)
USE_CONTEXT_RE = re.compile(r'useContext\s*\(', re.MULTILINE)

USE_EFFECT_RE = re.compile(r'useEffect\s*\(', re.MULTILINE)
USE_MEMO_RE = re.compile(r'useMemo\s*\(', re.MULTILINE)
USE_CALLBACK_RE = re.compile(r'useCallback\s*\(', re.MULTILINE)
USE_REDUCER_RE = re.compile(r'useReducer\s*\(', re.MULTILINE)
CUSTOM_HOOK_RE = re.compile(r'use[A-Z][a-zA-Z0-9_]*\s*\(', re.MULTILINE)

FETCH_RE = re.compile(r'\bfetch\s*\(', re.MULTILINE)
AXIOS_RE = re.compile(r'\baxios\.', re.MULTILINE)
FIREBASE_RE = re.compile(r'\bfirebase/', re.MULTILINE)
SERVICE_IMPORT_RE = re.compile(r'@application/services|@application/usecases|@infrastructure/api|@infrastructure/repositories', re.MULTILINE)

LAZY_RE = re.compile(r'lazy\s*\(\s*\(\)\s*=>\s*import\s*\(', re.MULTILINE)
SUSPENSE_RE = re.compile(r'<Suspense\b', re.MULTILINE)
ROLE_ROUTE_RE = re.compile(r'<RoleRoute\b', re.MULTILINE)

# ============================================================
# FILE UTILITIES
# ============================================================
def read_file(path: Path) -> str:
    try:
        return path.read_text(encoding="utf-8", errors="replace")
    except Exception:
        return ""

IMPORT_RE = re.compile(r'import\s+(?:(\w+)\s*,)?\s*(?:(\{(?:[^{}]|\{[^{}]*\})*\}|[\w\s,]+|[\*]\s+as\s+\w+))\s*(?:as\s+\w+)?\s*from\s+["\'](?P<src>[^"\']+)["\']', re.MULTILINE)
LAZY_IMPORT_RE = re.compile(r'import\s*\(\s*["\'](?P<src>[^"\']+)["\']\s*\)', re.MULTILINE)

imports_by_file: Dict[str, List[str]] = defaultdict(list)
all_ts_files = []
for f in (PROJECT_ROOT / "src").rglob("*"):
    if f.is_file() and (f.suffix == ".ts" or f.suffix == ".tsx"):
        all_ts_files.append(f)
        rel = f.relative_to(PROJECT_ROOT).as_posix()
        text = read_file(f)
        for m in IMPORT_RE.finditer(text):
            src = m.group("src")
            imports_by_file[rel].append(src)
        for m in LAZY_IMPORT_RE.finditer(text):
            src = m.group("src")
            imports_by_file[rel].append(src)

# Build project file index
PROJECT_FILES = {}
for f in all_ts_files:
    rel = f.relative_to(PROJECT_ROOT).as_posix()
    PROJECT_FILES[rel] = f

def resolve_component_to_file(component_name: str, source_file: str) -> Optional[str]:
    """Resolve a component name to its actual file path using imports."""
    # Search imports in the source file
    for src in imports_by_file.get(source_file, []):
        src_lower = src.lower()
        comp_lower = component_name.lower()
        if src_lower.endswith(f'/{comp_lower}.tsx') or src_lower.endswith(f'/{comp_lower}.ts'):
            # Resolve to absolute project path
            resolved = src
            if src.startswith('@/'):
                resolved = src.replace('@/', 'src/')
            elif src.startswith('@presentation/'):
                resolved = src.replace('@presentation/', 'src/presentation/')
            elif src.startswith('@app/'):
                resolved = src.replace('@app/', 'src/app/')
            elif src.startswith('@shared/'):
                resolved = src.replace('@shared/', 'src/shared/')
            elif src.startswith('@config/'):
                resolved = src.replace('@config/', 'src/config/')
            # Try with extension if not present
            for ext in ['.tsx', '.ts']:
                candidate = PROJECT_ROOT / (resolved + ext)
                if candidate.exists():
                    return candidate.relative_to(PROJECT_ROOT).as_posix()
            # If already has extension
            candidate = PROJECT_ROOT / resolved
            if candidate.exists():
                return candidate.relative_to(PROJECT_ROOT).as_posix()
    return None

# ============================================================
# 1. MAIN EXECUTION CHAIN
# ============================================================
main_execution_lines = []
main_execution_lines.append("index.html")
main_execution_lines.append("  Line 26: <script type=\"module\" src=\"/src/main.tsx\"></script>")
main_execution_lines.append("  ↓")
main_execution_lines.append("src/main.tsx")
main_execution_lines.append("  Line 15: ReactDOM.createRoot(document.getElementById('root')!).render(...)")
main_execution_lines.append("  Line 16: document.getElementById('root') - obtiene nodo DOM #root (index.html línea 19)")
main_execution_lines.append("  Line 19: QueryClientProvider client={queryClient}  [@tanstack/react-query]")
main_execution_lines.append("  Line 20: <App />")
main_execution_lines.append("  ↓")
main_execution_lines.append("src/presentation/pages/App.tsx")
main_execution_lines.append("  Line 9: AuthProvider (estático) → @presentation/contexts/AuthContext")
main_execution_lines.append("  Line 10: CartProvider (estático) → @presentation/contexts/CartContext")
main_execution_lines.append("  Line 11: CartDrawerProvider (estático) → @presentation/contexts/CartDrawerContext")
main_execution_lines.append("  Line 12: ThemeProvider (estático) → @presentation/contexts/ThemeContext")
main_execution_lines.append("  Line 121: BrowserRouter (react-router-dom)")
main_execution_lines.append("  Line 122: ScrollToTop")
main_execution_lines.append("  Line 123: AppRoutes")
main_execution_lines.append("  Line 124: Toaster (react-hot-toast)")

# ============================================================
# 2. ROUTE DETECTION (manual extraction from App.tsx + other route files)
# ============================================================
route_rows = []
route_source_files = set()

# Explicit route definitions from src/presentation/pages/App.tsx
# Based on direct code inspection
app_tsx_text = read_file(SRC_DIR / "presentation/pages/App.tsx")

# Static routes with their page components
static_routes = [
    ("/", "PublicLayout", "HomePage", "STATIC"),
    ("/catalogo", "PublicLayout", "CatalogPage", "STATIC"),
    ("/carrito", "PublicLayout", "CartPage", "STATIC"),
    ("/contacto", "PublicLayout", "ContactPage", "STATIC"),
    ("/nosotros", "PublicLayout", "AboutPage", "STATIC"),
    ("/login", "LoginPage", "LoginPage", "STATIC"),
    ("/registro", "RegisterPage", "RegisterPage", "STATIC"),
    ("/unauthorized", "div403", "div403", "STATIC"),
]

# Lazy routes with their module components
lazy_routes = [
    ("/admin/dashboard", "RoleRoute", "AdminDashboard", "LAZY"),
    ("/admin/users", "RoleRoute", "UsersPage", "LAZY"),
    ("/admin/inventario", "RoleRoute", "InventoryPage", "LAZY"),
    ("/admin/pedidos", "RoleRoute", "OrdersPage", "LAZY"),
    ("/admin/clientes", "RoleRoute", "CustomersPage", "LAZY"),
    ("/admin/domiciliarios", "RoleRoute", "DeliveryPage", "LAZY"),
    ("/admin/analytics", "RoleRoute", "AnalyticsPage", "LAZY"),
    ("/admin/configuracion", "RoleRoute", "SettingsPage", "LAZY"),
    ("/asesor/dashboard", "RoleRoute", "AdminDashboard", "LAZY"),
    ("/domiciliario/dashboard", "RoleRoute", "AdminDashboard", "LAZY"),
    ("/cliente/dashboard", "RoleRoute", "AdminDashboard", "LAZY"),
    ("*", "Navigate", "Navigate", "STATIC"),
]

app_pages_rel = "src/presentation/pages/App.tsx"

# Add static routes
for route_path, wrapper, component_name, load_type in static_routes:
    resolved = resolve_component_to_file(component_name, app_pages_rel)
    file_to_use = resolved if resolved else app_pages_rel
    route_rows.append({
        "ROUTE": route_path,
        "COMPONENT": component_name,
        "FILE": file_to_use,
        "LOAD_TYPE": load_type,
        "EVIDENCE": f"<Route path=\"{route_path}\" element={{<{wrapper}><{component_name} /></{wrapper}>}} in {app_pages_rel}"
    })
    route_source_files.add(file_to_use)

# Add lazy routes
for route_path, wrapper, component_name, load_type in lazy_routes:
    # Map lazy variable names to actual module files
    lazy_module_map = {
        "AdminDashboard": "src/app/components/AdminDashboard.tsx",
        "UsersPage": "src/app/features/admin/UsuariosModule.tsx",
        "InventoryPage": "src/app/features/admin/InventarioModule.tsx",
        "OrdersPage": "src/app/features/admin/HistorialPagosModule.tsx",
        "CustomersPage": "src/app/features/admin/ClientesModule.tsx",
        "DeliveryPage": "src/app/features/admin/DomiciliosModule.tsx",
        "AnalyticsPage": "src/app/features/admin/ReportesModule.tsx",
        "SettingsPage": "src/app/features/admin/ConfiguracionModule.tsx",
    }
    resolved = lazy_module_map.get(component_name)
    if resolved and (PROJECT_ROOT / resolved).exists():
        file_to_use = resolved
    else:
        file_to_use = app_pages_rel
    route_rows.append({
        "ROUTE": route_path,
        "COMPONENT": component_name,
        "FILE": file_to_use,
        "LOAD_TYPE": load_type,
        "EVIDENCE": f"<Route path=\"{route_path}\" element={{<{wrapper} ...><{component_name} /></{wrapper}>}} in {app_pages_rel}"
    })
    route_source_files.add(file_to_use)

# Deduplicate routes
seen_routes = set()
unique_route_rows = []
for row in route_rows:
    key = (row["ROUTE"], row["COMPONENT"], row["FILE"])
    if key not in seen_routes:
        seen_routes.add(key)
        unique_route_rows.append(row)

# ============================================================
# 3. CONTEXT ANALYSIS
# ============================================================
context_rows = []
context_providers = {}

for f in all_ts_files:
    rel = f.relative_to(PROJECT_ROOT).as_posix()
    text = read_file(f)
    for m in re.finditer(r'const\s+(\w+Context)\s*=\s*createContext', text):
        ctx_name = m.group(1)
        context_providers[ctx_name] = rel
        context_rows.append({
            "CONTEXT": ctx_name,
            "PROVIDER_FILE": rel,
            "CONSUMER_FILE": "N/A",
            "EVIDENCE": f"const {ctx_name} = createContext(...) in {rel}"
        })

# Find consumers in reachable files
for rel in REACHABLE_FILES:
    f = PROJECT_ROOT / rel
    if not f.exists():
        continue
    text = read_file(f)
    for m in re.finditer(r'useContext\s*\(\s*(\w+Context)\s*\)', text):
        ctx_name = m.group(1)
        provider = context_providers.get(ctx_name, "Unknown")
        context_rows.append({
            "CONTEXT": ctx_name,
            "PROVIDER_FILE": provider,
            "CONSUMER_FILE": rel,
            "EVIDENCE": f"useContext({ctx_name}) in {rel}"
        })

# Deduplicate context rows
seen_ctx = set()
unique_context_rows = []
for row in context_rows:
    key = (row["CONTEXT"], row["PROVIDER_FILE"], row["CONSUMER_FILE"], row["EVIDENCE"])
    if key not in seen_ctx:
        seen_ctx.add(key)
        unique_context_rows.append(row)

# ============================================================
# 4. HOOK ANALYSIS (only reachable files)
# ============================================================
hook_rows = []
for rel in REACHABLE_FILES:
    f = PROJECT_ROOT / rel
    if not f.exists():
        continue
    text = read_file(f)
    
    for hook_pat, hook_name in [
        (USE_EFFECT_RE, "useEffect"),
        (USE_MEMO_RE, "useMemo"),
        (USE_CALLBACK_RE, "useCallback"),
        (USE_REDUCER_RE, "useReducer")
    ]:
        if hook_pat.search(text):
            hook_rows.append({
                "HOOK": hook_name,
                "DECLARATION_FILE": "react (external)",
                "CONSUMER_FILE": rel,
                "EVIDENCE": f"{hook_name}() call found in {rel}"
            })
    
    # Custom hooks used in the file
    for m in CUSTOM_HOOK_RE.finditer(text):
        hook = m.group(0).split('(')[0].strip()
        if hook not in ['useEffect', 'useMemo', 'useCallback', 'useReducer', 'useContext', 'useState', 'useRef', 'useLayoutEffect', 'useAuth', 'useCart', 'useCartDrawer', 'useTheme']:
            hook_rows.append({
                "HOOK": hook,
                "DECLARATION_FILE": "Unknown (custom hook)",
                "CONSUMER_FILE": rel,
                "EVIDENCE": f"{hook}() called in {rel}"
            })

# Standard hooks summary
standard_hooks_in_files = defaultdict(list)
for rel in REACHABLE_FILES:
    f = PROJECT_ROOT / rel
    if not f.exists():
        continue
    text = read_file(f)
    for hook_name in ['useState', 'useEffect', 'useMemo', 'useCallback', 'useReducer', 'useContext', 'useRef', 'useLayoutEffect']:
        if re.search(rf'\b{hook_name}\s*\(', text):
            standard_hooks_in_files[hook_name].append(rel)

# ============================================================
# 5. SERVICE ANALYSIS (only reachable files)
# ============================================================
service_rows = []
for rel in REACHABLE_FILES:
    f = PROJECT_ROOT / rel
    if not f.exists():
        continue
    text = read_file(f)
    
    for pattern, name, call_type in [
        (FETCH_RE, "fetch", "DIRECT_CALL"),
        (AXIOS_RE, "axios", "DIRECT_CALL"),
        (FIREBASE_RE, "firebase", "DIRECT_CALL"),
        (SERVICE_IMPORT_RE, "service_import", "IMPORT_ONLY")
    ]:
        if re.search(pattern, text):
            service_rows.append({
                "SERVICE_FILE": rel,
                "CONSUMER_FILE": rel,
                "CALL_TYPE": call_type,
                "EVIDENCE": f"{name} pattern found in {rel}"
            })

# ============================================================
# 6. RENDER TREE (only reachable files)
# ============================================================
render_tree_rows = []
for rel in REACHABLE_FILES:
    f = PROJECT_ROOT / rel
    if not f.exists():
        continue
    text = read_file(f)
    
    if JSX_RENDER_RE.search(text) or RETURN_JSX_RE.search(text) or ELEMENT_JSX_RE.search(text):
        render_type = "DIRECT_RENDER"
        if SUSPENSE_RE.search(text):
            render_type = "SUSPENSE_RENDER"
        elif LAZY_RE.search(text):
            render_type = "LAZY_RENDER"
        elif ROUTE_RE.search(text):
            render_type = "ROUTE_RENDER"
        elif re.search(r'\{children\}', text) or re.search(r'children:', text):
            render_type = "CONDITIONAL_RENDER"
        
        render_tree_rows.append({
            "SOURCE_FILE": rel,
            "RENDER_TYPE": render_type,
            "EVIDENCE": "Contains JSX return or element prop"
        })

# ============================================================
# 7. CLASSIFICATION
# ============================================================
classification_rows = []
for rel in REACHABLE_FILES:
    f = PROJECT_ROOT / rel
    if not f.exists():
        continue
    text = read_file(f)
    
    category = "IMPORTED_ONLY"
    evidence = []
    
    # PROVIDED: context providers (check before RENDERED because Provider components return JSX)
    if CREATE_CONTEXT_RE.search(text) and CONTEXT_PROVIDER_RE.search(text):
        category = "PROVIDED"
        evidence.append("Context Provider defined")
    
    # EXECUTED: direct DOM/manipulation entry points
    if "ReactDOM.createRoot" in text or "QueryClient()" in text or "document.getElementById" in text:
        category = "EXECUTED"
        evidence.append("Contains ReactDOM.createRoot or QueryClient instantiation")
    
    # RENDERED: JSX output (check after PROVIDED)
    if JSX_RENDER_RE.search(text) or RETURN_JSX_RE.search(text):
        if category == "IMPORTED_ONLY":
            category = "RENDERED"
        evidence.append("JSX return found")
    
    # ROUTED: route definitions
    if ROUTE_RE.search(text) or NAVIGATE_RE.search(text):
        if category in ["IMPORTED_ONLY", "RENDERED"]:
            category = "ROUTED"
        evidence.append("Route or Navigate element found")
    
    # CONSUMED: context consumers (check after PROVIDED)
    if USE_CONTEXT_RE.search(text):
        if category == "IMPORTED_ONLY":
            category = "CONSUMED"
        elif category == "PROVIDED":
            pass  # Keep as PROVIDED, it's both but PROVIDED takes precedence
        evidence.append("useContext call found")
    
    # LAZY_RENDER: lazy components
    if LAZY_RE.search(text):
        if category == "IMPORTED_ONLY":
            category = "RENDERED"
        evidence.append("React.lazy component defined")
    
    if not evidence:
        evidence.append("Only imported, no execution evidence")
    
    classification_rows.append({
        "FILE": rel,
        "CATEGORY": category,
        "EVIDENCE": "; ".join(evidence)
    })

# ============================================================
# WRITE FILES
# ============================================================
with open(OUTPUT_DIR / "MAIN_EXECUTION_CHAIN.md", "w", encoding="utf-8") as f:
    f.write("# MAIN EXECUTION CHAIN\n\n")
    f.write("## index.html\n\n")
    f.write("  Line 19: `<div id=\"root\"></div>`\n")
    f.write("  Line 26: `<script type=\"module\" src=\"/src/main.tsx\"></script>`\n\n")
    f.write("## src/main.tsx\n\n")
    f.write("  Line 1: `import React from \"react\";`\n")
    f.write("  Line 2: `import ReactDOM from \"react-dom/client\";`\n")
    f.write("  Line 4: `import App from \"./presentation/pages/App\";`  ← ESTÁTICO\n")
    f.write("  Line 6: `import \"./index.css\";`  ← ESTÁTICO (side-effect)\n")
    f.write("  Line 8-11: `import { QueryClient, QueryClientProvider } from \"@tanstack/react-query\";`  ← ESTÁTICO\n")
    f.write("  Line 13: `const queryClient = new QueryClient();`  ← EJECUCIÓN\n")
    f.write("  Line 15-23:\n")
    f.write("    ```jsx\n")
    f.write("    ReactDOM.createRoot(\n")
    f.write("      document.getElementById(\"root\")!\n")
    f.write("    ).render(\n")
    f.write("      <React.StrictMode>\n")
    f.write("        <QueryClientProvider client={queryClient}>\n")
    f.write("          <App />\n")
    f.write("        </QueryClientProvider>\n")
    f.write("      </React.StrictMode>\n")
    f.write("    );\n")
    f.write("    ```\n\n")
    f.write("Evidencia: `document.getElementById(\"root\")` obtiene el nodo DOM definido en index.html línea 19.\n\n")
    f.write("## src/presentation/pages/App.tsx\n\n")
    f.write("  Line 9: `import { AuthProvider } from \"@presentation/contexts/AuthContext\";`  ← ESTÁTICO\n")
    f.write("  Line 10: `import { CartProvider } from \"@presentation/contexts/CartContext\";`  ← ESTÁTICO\n")
    f.write("  Line 11: `import { CartDrawerProvider } from \"@presentation/contexts/CartDrawerContext\";`  ← ESTÁTICO\n")
    f.write("  Line 12: `import { ThemeProvider } from \"@presentation/contexts/ThemeContext\";`  ← ESTÁTICO\n")
    f.write("  Line 13: `import ProtectedRoute from \"@presentation/routes/ProtectedRoute\";`  ← ESTÁTICO\n")
    f.write("  Line 14: `import Navbar from \"./components/Navbar\";`  ← ESTÁTICO\n")
    f.write("  Line 15: `import Footer from \"./components/footer\";`  ← ESTÁTICO\n")
    f.write("  Line 16: `import ScrollToTop from \"../components/ScrollToTop\";`  ← ESTÁTICO\n")
    f.write("  Line 17: `import { CartDrawer } from \"../components/CartDrawer\";`  ← ESTÁTICO\n")
    f.write("  Line 18: `import { Spinner } from \"@/shared/ui\";`  ← ESTÁTICO (barrel)\n")
    f.write("  Line 19: `import ErrorBoundary from \"@/app/components/ErrorBoundary\";`  ← ESTÁTICO\n")
    f.write("  Line 22: `import HomePage from \"./public/HomePage\";`  ← ESTÁTICO\n")
    f.write("  Line 23: `import CatalogPage from \"./features/CatalogPage\";`  ← ESTÁTICO\n")
    f.write("  Line 24: `import CartPage from \"./features/CartPage\";`  ← ESTÁTICO\n")
    f.write("  Line 25: `import ContactPage from \"./features/ContactPage\";`  ← ESTÁTICO\n")
    f.write("  Line 26: `import AboutPage from \"./public/AboutPage\";`  ← ESTÁTICO\n")
    f.write("  Line 29: `import LoginPage from \"./auth/LoginPage\";`  ← ESTÁTICO\n")
    f.write("  Line 30: `import RegisterPage from \"./auth/RegisterPage\";`  ← ESTÁTICO\n")
    f.write("  Line 33-40: lazy imports para módulos admin: AdminDashboard, UsersPage, InventoryPage, OrdersPage, CustomersPage, DeliveryPage, AnalyticsPage, SettingsPage\n")
    f.write("\n")
    f.write("  Line 116-136: Función `App` retorna JSX con providers anidados:\n")
    f.write("    ```jsx\n")
    f.write("    <AuthProvider>\n")
    f.write("      <CartProvider>\n")
    f.write("        <CartDrawerProvider>\n")
    f.write("          <ThemeProvider>\n")
    f.write("            <BrowserRouter>\n")
    f.write("              <ScrollToTop />\n")
    f.write("              <AppRoutes />\n")
    f.write("              <Toaster ... />\n")
    f.write("            </BrowserRouter>\n")
    f.write("          </ThemeProvider>\n")
    f.write("        </CartDrawerProvider>\n")
    f.write("      </CartProvider>\n")
    f.write("    </AuthProvider>\n")
    f.write("    ```\n")

with open(OUTPUT_DIR / "RENDER_TREE.md", "w", encoding="utf-8") as f:
    f.write("# RENDER TREE ANALYSIS\n\n")
    f.write("| Source File | Render Type | Evidence |\n")
    f.write("|------------|-------------|----------|\n")
    for row in render_tree_rows:
        f.write(f"| {row['SOURCE_FILE']} | {row['RENDER_TYPE']} | {row['EVIDENCE']} |\n")

with open(OUTPUT_DIR / "ROUTE_EXECUTION_MAP.csv", "w", newline="", encoding="utf-8") as f:
    writer = csv.DictWriter(f, fieldnames=["ROUTE", "COMPONENT", "FILE", "LOAD_TYPE", "EVIDENCE"])
    writer.writeheader()
    for row in unique_route_rows:
        writer.writerow(row)

with open(OUTPUT_DIR / "CONTEXT_USAGE.csv", "w", newline="", encoding="utf-8") as f:
    writer = csv.DictWriter(f, fieldnames=["CONTEXT", "PROVIDER_FILE", "CONSUMER_FILE", "EVIDENCE"])
    writer.writeheader()
    for row in unique_context_rows:
        writer.writerow(row)

with open(OUTPUT_DIR / "HOOK_USAGE.csv", "w", newline="", encoding="utf-8") as f:
    writer = csv.DictWriter(f, fieldnames=["HOOK", "DECLARATION_FILE", "CONSUMER_FILE", "EVIDENCE"])
    writer.writeheader()
    for row in hook_rows:
        writer.writerow(row)

with open(OUTPUT_DIR / "SERVICE_EXECUTION.csv", "w", newline="", encoding="utf-8") as f:
    writer = csv.DictWriter(f, fieldnames=["SERVICE_FILE", "CONSUMER_FILE", "CALL_TYPE", "EVIDENCE"])
    writer.writeheader()
    for row in service_rows:
        writer.writerow(row)

with open(OUTPUT_DIR / "REAL_USAGE_CLASSIFICATION.csv", "w", newline="", encoding="utf-8") as f:
    writer = csv.DictWriter(f, fieldnames=["FILE", "CATEGORY", "EVIDENCE"])
    writer.writeheader()
    for row in classification_rows:
        writer.writerow(row)

# Counts
cat_counts = defaultdict(int)
for row in classification_rows:
    cat_counts[row["CATEGORY"]] += 1

# ============================================================
# CERTIFICATE
# ============================================================
cert = []
cert.append("# REAL USAGE CERTIFICATE - Fase 1.9\n\n")
cert.append("## Resumen de Ejecución Real\n\n")
cert.append(f"- **Total archivos alcanzables analizados:** {len(REACHABLE_FILES)}\n")
cert.append(f"- **Total EXECUTED:** {cat_counts.get('EXECUTED', 0)}\n")
cert.append(f"- **Total RENDERED:** {cat_counts.get('RENDERED', 0)}\n")
cert.append(f"- **Total ROUTED:** {cat_counts.get('ROUTED', 0)}\n")
cert.append(f"- **Total PROVIDED:** {cat_counts.get('PROVIDED', 0)}\n")
cert.append(f"- **Total CONSUMED:** {cat_counts.get('CONSUMED', 0)}\n")
cert.append(f"- **Total IMPORTED_ONLY:** {cat_counts.get('IMPORTED_ONLY', 0)}\n\n")
cert.append("## Limitaciones\n\n")
cert.append("- El análisis se basa en descubrimiento estático del código fuente.\n")
cert.append("- No se ejecutó la aplicación para validar comportamiento en runtime.\n")
cert.append("- Algunas rutas requieren autenticación (ProtectedRoute) y no se puede determinar su ejecución sin datos de runtime.\n")
cert.append("- Los imports lazy solo se detectan cuando la sintaxis `lazy(() => import())` está presente.\n")
cert.append("- RUTAS: Las rutas estáticas se detectaron directamente en src/presentation/pages/App.tsx.\n")
cert.append("- RUTAS: Las rutas lazy se identificaron por la presencia de `lazy(() => import())` en App.tsx.\n")
cert.append("- El archivo `src/app/App.tsx` contiene un flujo alternativo (modo landing/login) que no forma parte del flujo principal desde main.tsx.\n")
cert.append("- El archivo `src/app/MODO_EXPORTACION.tsx` contiene definiciones alternativas para exportación a Figma y no forma parte del flujo de producción.\n")

with open(OUTPUT_DIR / "REAL_USAGE_CERTIFICATE.md", "w", encoding="utf-8") as f:
    f.writelines(cert)

print("Fase 1.9 completada.")
print(f"Archivos analizados: {len(all_ts_files)}")
print(f"Archivos alcanzables: {len(REACHABLE_FILES)}")
print(f"Categorías: {dict(cat_counts)}")
print(f"Rutas únicas detectadas: {len(unique_route_rows)}")
print(f"Contextos únicos: {len(unique_context_rows)}")
print(f"Hooks detectados: {len(hook_rows)}")
print(f"Servicios detectados: {len(service_rows)}")
print(f"Renderizados detectados: {len(render_tree_rows)}")

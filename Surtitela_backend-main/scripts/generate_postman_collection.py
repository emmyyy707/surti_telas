import glob
import os
import re
import json

BASE_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
MODULES_DIR = os.path.join(BASE_PATH, 'src', 'modules')
APP_FILE = os.path.join(BASE_PATH, 'src', 'shared', 'app.ts')

with open(APP_FILE, encoding='utf-8') as f:
    app_text = f.read()

# Import aliases for route modules
alias_to_module = {}
for m in re.finditer(r'import\s+([A-Za-z0-9_]+)\s+from\s+["\"](\.\./modules/([^/]+)/routes/[^"\"]+)["\"];', app_text):
    alias = m.group(1)
    module = m.group(3)
    alias_to_module[alias] = module

# Route prefixes by alias name
alias_prefix = {}
for line in app_text.splitlines():
    line = line.strip()
    if line.startswith('app.use('):
        m = re.match(r'app\.use\(\s*["\"]([^"\"]+)["\"]\s*,\s*(.+)\)\s*;', line)
        if m:
            prefix = m.group(1)
            parts = [p.strip() for p in m.group(2).split(',') if p.strip()]
            if parts:
                alias_prefix[parts[-1]] = prefix

for m in re.finditer(r'path:\s*["\"]([^"\"]+)["\"]\s*,\s*router:\s*([A-Za-z0-9_]+)', app_text):
    alias_prefix[m.group(2)] = m.group(1)

module_prefix = {}
for alias, prefix in alias_prefix.items():
    module = alias_to_module.get(alias)
    if module:
        module_prefix[module] = prefix

# Manual fallbacks for public product catalog routes and others
module_prefix.setdefault('products', '/api/products')
module_prefix.setdefault('auth', '/api/auth')
module_prefix.setdefault('uploads', '/api/uploads')
module_prefix.setdefault('checkout', '/api/checkout')

# Static non-module routes
static_routes = [
    {'method': 'GET', 'path': '/', 'name': 'GET /'},
    {'method': 'GET', 'path': '/api/health', 'name': 'GET /api/health'},
]

# Parse body field examples from controller functions
body_examples = {}
for controller_file in glob.glob(os.path.join(MODULES_DIR, '**', 'controller', '*.ts'), recursive=True):
    module = os.path.basename(os.path.dirname(os.path.dirname(controller_file)))
    with open(controller_file, encoding='utf-8') as f:
        text = f.read()
    functions = re.split(r'export async function\s+(\w+)\s*\(', text)
    for i in range(1, len(functions), 2):
        func_name = functions[i]
        body = functions[i + 1]
        fields = []
        for m in re.finditer(r'const\s*\{([^}]+)\}\s*=\s*req\.body', body):
            names = [n.strip().split(':')[0].strip() for n in m.group(1).split(',') if n.strip()]
            for name in names:
                if name and name not in fields:
                    fields.append(name)
        for m in re.finditer(r'req\.body\.(\w+)', body):
            if m.group(1) not in fields:
                fields.append(m.group(1))
        if fields:
            body_examples[(module, func_name)] = fields

routes = []
for route_file in glob.glob(os.path.join(MODULES_DIR, '**', 'routes', '*.ts'), recursive=True):
    module = os.path.basename(os.path.dirname(os.path.dirname(route_file)))
    prefix = module_prefix.get(module, f'/api/{module}')
    with open(route_file, encoding='utf-8') as f:
        for line in f:
            line = line.strip()
            m = re.match(r'router\.(get|post|put|delete|patch)\(\s*["\"]([^"\"]+)["\"]\s*,\s*(.+)\)\s*;', line)
            if not m:
                continue
            method = m.group(1).upper()
            path = m.group(2)
            middleware = m.group(3)
            handlers = re.findall(r'([A-Za-z_][A-Za-z0-9_]*)', middleware)
            handler = handlers[-1] if handlers else None
            routes.append({'module': module, 'method': method, 'path': path, 'handler': handler, 'prefix': prefix})

collection = {
    'info': {
        'name': 'Surtitelas API',
        'schema': 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json'
    },
    'item': []
}

for route in static_routes:
    collection['item'].append({
        'name': route['name'],
        'request': {
            'method': route['method'],
            'header': [{'key': 'Content-Type', 'value': 'application/json'}],
            'url': {'raw': '{{baseUrl}}' + route['path'], 'host': ['{{baseUrl}}'], 'path': [p for p in route['path'].split('/') if p != '']}
        }
    })

for route in routes:
    full_path = route['prefix'].rstrip('/') + (route['path'] if route['path'].startswith('/') else '/' + route['path'])
    full_url = '{{baseUrl}}' + full_path
    path_segments = [seg for seg in full_path.split('/') if seg != '']
    item = {
        'name': f"{route['method']} {full_path}",
        'request': {
            'method': route['method'],
            'header': [
                {'key': 'Content-Type', 'value': 'application/json'},
                {'key': 'Authorization', 'value': 'Bearer {{token}}'}
            ],
            'url': {'raw': full_url, 'host': ['{{baseUrl}}'], 'path': path_segments}
        }
    }
    if route['method'] in ('POST', 'PUT', 'PATCH'):
        fields = body_examples.get((route['module'], route['handler']), [])
        if fields:
            body_data = {}
            for field in fields:
                if 'status' in field:
                    body_data[field] = True
                elif any(k in field for k in ['id_', 'quantity', 'price', 'amount', 'total', 'salary', 'stock', 'unit_value', 'subtotal']):
                    body_data[field] = 1
                elif 'email' in field:
                    body_data[field] = 'correo@ejemplo.com'
                elif 'name' in field and field != 'name':
                    body_data[field] = 'Texto'
                elif 'date' in field:
                    body_data[field] = '2026-01-01'
                else:
                    body_data[field] = ''
            item['request']['body'] = {
                'mode': 'raw',
                'raw': json.dumps(body_data, indent=2, ensure_ascii=False),
                'options': {'raw': {'language': 'json'}}
            }
    collection['item'].append(item)

with open(os.path.join(BASE_PATH, 'postman_collection.json'), 'w', encoding='utf-8') as f:
    json.dump(collection, f, indent=2, ensure_ascii=False)

with open(os.path.join(BASE_PATH, 'postman_environment.json'), 'w', encoding='utf-8') as f:
    json.dump({
        'id': 'surtitelas-env',
        'name': 'Surtitelas Environment',
        'values': [
            {'key': 'baseUrl', 'value': 'http://localhost:3000', 'enabled': True},
            {'key': 'token', 'value': '', 'enabled': True}
        ]
    }, f, indent=2, ensure_ascii=False)

print('Generated postman_collection.json with', len(collection['item']), 'requests')
print('Generated postman_environment.json')

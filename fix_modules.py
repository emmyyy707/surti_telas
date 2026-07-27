filepath = r'C:\Users\usuario\surti_telas\software_SurtiTelas.Fronend\src\presentation\pages\admin\GestionUsuarios.tsx'

with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

old = """{['admin', 'asesor', 'domiciliario'].map(([value, label]) => ("""
new = """{[
              { value: 'admin', label: 'Administrador' },
              { value: 'asesor', label: 'Asesor' },
              { value: 'domiciliario', label: 'Domiciliario' },
            ].map(mod => ("""

content = content.replace(old, new)

old2 = "<span>{label === 'admin' ? 'Administrador' : label === 'asesor' ? 'Asesor' : 'Domiciliario'}</span>"
new2 = "<span>{mod.label}</span>"

content = content.replace(old2, new2)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
print('Fixed')
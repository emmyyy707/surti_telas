# Prueba con puerto 2222 (reemplaza clave si la tenés con -i)
ssh -vvv -p 2222 ubuntu@23.227.38.32
ssh -vvv -p 2222 deploy@23.227.38.32
ssh -vvv -p 2222 root@23.227.38.32
ssh -vvv -p 2222 admin@23.227.38.32
ssh -vvv -p 2222 ec2-user@23.227.38.32
ssh -vvv -p 2222 bitnami@23.227.38.32# Cómo acceder al servidor productivo - SurtiTelas

## 1) Reuní esta información

Antes de pedir acceso, necesitás tener a mano:

- Proveedor cloud o hosting (AWS, DigitalOcean, Hetzner, Vultr, cPanel, etc.)
- IP pública o dominio del servidor (ej. `203.0.113.10` o `prod.surtitelas.com`)
- Usuario SSH (ej. `root`, `ubuntu`, `admin`, `deploy`)
- Puerto SSH (habitualmente `22`, a veces `2222` o custom)
- Método de autenticación:
  - **Contraseña** (temporal hasta generar claves)
  - **Clave SSH** (`id_ed25519`, `id_rsa`)
  - **VPN / Bastión** (salto intermedio)

## 2) Opción A — Acceso por SSH (recomendado)

### 2.1 Generá tu clave SSH (si no tenés)
```bash
ssh-keygen -t ed25519 -C "tu-email@dominio.com"
```

### 2.2 Entregá la clave pública al proveedor/admin
```bash
cat ~/.ssh/id_ed25519.pub
```
Ellos la agregan al archivo `~/.ssh/authorized_keys` en el servidor.

### 2.3 Probá la conexión
```bash
ssh usuario@ip-o-dominio
```

### 2.4 Si hay bastión/VPN
```bash
ssh -J usuario@bastion usuario@servidor-produccion
```

## 3) Opción B — Acceso por panel web (si te dan VPN/panel)

1. Entrá al panel del proveedor (AWS Console, DigitalOcean Cloud Panel, cPanel, etc.)
2. Navegá a **Servidores / droplets / instancias / hosting**
3. Buscá **Acceso / Console / VNC / Browser Console**
4. Usá las credenciales provistas para ingresar por consola web

## 4) Prerrequisitos mínimos antes de pedir acceso

- [ ] Confirmar qué proveedor usan
- [ ] Confirmar IP/puerto/USUARIO
- [ ] Tener tu clave SSH lista (si el método es SSH)
- [ ] Tener acceso al panel del proveedor (si es panel web)
- [ ] Tener los datos de BD/Redis/SMTP listos para configurar en `.env.production`

## 5) Una vez dentro del servidor

Ejecutá `DEPLOY_RUNBOOK.md` en este orden:

```bash
# 1) Variables de entorno
cp .env.production.example .env.production
# Completar .env.production con los datos reales del servidor

# 2) Base de datos
npm install
npx prisma migrate deploy
npx prisma db seed

# 3) Build
npm run build

# 4) Pruebas
npm run typecheck
npm test --silent
npm run test:e2e -- --project=chromium --reporter=line

# 5) Servidor
PORT=3000 NODE_ENV=production node dist/server.js
# En verdad usar PM2 o systemd: pm2 start dist/server.js --name surtitelas

# 6) Validar
curl -s http://localhost:3000/health | jq .
curl -s http://localhost:3000/api/v1/catalog/products | jq '.success'
```

## 6) Si algo falla

Pegá el error completo acá y lo revisamos.

---

**Responsable de acceso:** _______________
**Fecha planificada:** __/__/_____

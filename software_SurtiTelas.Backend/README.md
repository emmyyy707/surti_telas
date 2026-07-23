# SurtiTelas Backend

Backend Node.js + TypeScript + Express + PostgreSQL (Prisma) + Clean Architecture / DDD para la plataforma SurtiTelas.

## Requisitos

- Node.js >= 20
- npm >= 10
- PostgreSQL >= 15
- Redis >= 7 (opcional en desarrollo; requerido en producción)

## Configuración inicial

```bash
# 1) Clonar e instalar dependencias
npm install

# 2) Configurar variables de entorno
cp .env.example .env

# 3) Generar cliente Prisma
npm run prisma:generate

# 4) Ejecutar migraciones
npm run prisma:migrate

# 5) Sembrar datos iniciales
npm run prisma:seed
```

## Scripts disponibles

```bash
# Desarrollo con hot reload
npm run dev

# Build
npm run build

# Producción (requiere build previo)
npm run start

# Typecheck
npm run typecheck

# Lint
npm run lint

# Tests unitarios
npm run test

# Tests E2E (Playwright)
npm run test:e2e

# Todos los tests
npm run test:all

# Prisma Studio
npm run prisma:studio
```

## Docker

```bash
# Levantar API + PostgreSQL + Redis + Prometheus + Grafana
docker-compose up --build

# API: http://localhost:3000
# Swagger: http://localhost:3000/api/docs
# Health: http://localhost:3000/health
# Prometheus: http://localhost:9090
# Grafana: http://localhost:3001
```

### Datos por defecto (seed)

- Admin: `admin@surtitelas.com` / `SurtiTelas2025*`
- Roles: ADMIN, ASESOR, CLIENTE, DOMICILIARIO, ALMACEN, PRODUCCION, REPORTES

## Estructura del proyecto

```
src/
├── config/                     # env, app, database, redis, swagger
├── modules/
│   ├── auth/                   # usuarios, login, roles, permisos
│   ├── catalog/                # productos, categorías
│   ├── customers/              # clientes, cupos de crédito
│   ├── orders/                 # pedidos, checkout, estados
│   ├── deliveries/             # entregas y domiciliarios
│   ├── stock/                  # insumos, proveedores, movimientos
│   ├── production/             # talleres, órdenes de producción
│   ├── receipts/               # recibos
│   ├── payments/               # pagos
│   ├── commissions/            # comisiones
│   ├── contact/                # mensajes de contacto
│   ├── notifications/          # notificaciones
│   └── shared/                 # event bus, errores, HTTP helpers
└── server.ts                   # bootstrap
```

## Calidad

- `npm run typecheck` — verifica tipos TypeScript
- `npm run lint` — ESLint
- Tests unitarios con Vitest
- Tests E2E con Playwright
- Cache distribuido con Redis
- Métricas Prometheus en `/metrics`

## Variables de entorno

Ver `.env.example` para la lista completa de variables requeridas.

## Licencia

Privado — SurtiTelas
# Deployment Runbook - SurtiTelas

Ejecutar estos comandos en el servidor/productivo/staging cuando corresponda.

## Pre-requisitos
- Acceso al servidor
- Acceso a base de datos y Redis
- Secrets de producción disponibles
- Dominios configurados y apuntando

## 1) Variables de entorno
rm -f .env.production
cp .env.production.example .env.production
# Completar .env.production con los datos reales antes de continuar

## 2) Base de datos
npm install
npx prisma migrate deploy
npx prisma db seed
curl -s http://localhost:3000/health | jq .

## 3) Build
npm run build
node dist/server.js &
PID=$!
sleep 3
kill $PID || true
sleep 1

## 4) Pruebas
npm run typecheck
npm test --silent
npm run test:e2e -- --project=chromium --reporter=line

## 5) Servidor
PORT=3000 NODE_ENV=production DISABLE_RATE_LIMIT=false node dist/server.js &
sleep 3
curl -s http://localhost:3000/health | jq .
curl -s http://localhost:3000/api/v1/catalog/products | jq '.success'

## 6) Proxy/HTTPS
# Solo si aplica; configurar nginx/Caddy/reverse proxy aparte

## 7) Monitoreo
# Verificar logs, métricas y backup según tu stack

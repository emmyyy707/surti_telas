# Checklist de Deploy - SurtiTelas

## Pre-requisitos
- [ ] Acceso a servidor de producción/staging
- [ ] Acceso a base de datos y Redis
- [ ] Secrets de producción disponibles (JWT, SMTP, etc.)
- [ ] Dominios configurados y apuntando al servidor

## 1. Variables de Entorno
- [ ] Backend `.env.production` configurado con todas las variables de `.env.production.example`
- [ ] `JWT_ACCESS_SECRET` y `JWT_REFRESH_SECRET` tienen 32+ caracteres y son diferentes
- [ ] `DATABASE_URL` apunta a la base de datos de producción
- [ ] `REDIS_URL` apunta a Redis de producción (si aplica)
- [ ] `CORS_ORIGIN` incluye solo dominios productivos
- [ ] `SMTP_*` configurado para servicio de correo productivo
- [ ] Frontend `.env.production` con `VITE_API_URL` apuntando al backend productivo

## 2. Base de Datos
- [ ] Migraciones Prisma aplicadas: `npx prisma migrate deploy`
- [ ] Seed ejecutado si es necesario: `npx prisma db seed`
- [ ] Backup de base de datos existente y verificado
- [ ] Conexión probada desde el servidor de aplicación

## 3. Build y Dependencias
- [ ] `npm install` ejecutado en backend
- [ ] `npm install` ejecutado en frontend
- [ ] `npm run build` backend exitoso
- [ ] `npm run build` frontend exitoso

## 4. Pruebas
- [ ] `npm run test` backend pasa (o solo preexistentes)
- [ ] `npm run test:e2e` pasa en staging
- [ ] `npm run typecheck` backend pasa
- [ ] `npm run typecheck` frontend pasa

## 5. Servidor y Proceso
- [ ] Puerto 3000 disponible (o configurado en `PORT`)
- [ ] Proceso backend corriendo con `node dist/server.js`
- [ ] PM2/systemd configurado para auto-restart
- [ ] Logs rotados y configurados
- [ ] Health check responde: `curl http://localhost:3000/health`

## 6. Proxy/HTTPS (si aplica)
- [ ] Nginx/Caddy configurado con HTTPS
- [ ] Certificado SSL válido y no expirado
- [ ] Dominios apuntan correctamente al servidor
- [ ] `CORS_ORIGIN` coincide con dominios HTTPS

## 7. Monitoreo
- [ ] Logs estructurados activados (`LOG_LEVEL=info` o `warn`)
- [ ] Métricas/Monitoreo configurado
- [ ] Alertas configuradas para errores 5xx
- [ ] Backup automático de BD configurado

## 8. Validación Final
- [ ] `/health` retorna 200
- [ ] `/api/v1/catalog/products` retorna 200
- [ ] Login con usuario de prueba funciona
- [ ] Frontend carga correctamente en dominio productivo
- [ ] CORS funciona desde dominio productivo a backend

---
**Fecha de deploy:** __/__/____
**Responsable:** _______________
**Entorno:** [ ] Staging [ ] Producción

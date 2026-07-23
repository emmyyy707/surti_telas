# 🚨 DIAGNÓSTICO Y SOLUCIÓN DE ERRORES CRÍTICOS

**Fecha:** Enero 2025  
**Estado:** CRÍTICO - Requiere atención inmediata  
**Proyecto:** SurtiTelas Full Stack

---

## 📋 RESUMEN DE ERRORES IDENTIFICADOS

### 1. 🔴 ERR_CONNECTION_REFUSED - Backend en Puerto 3002
**Síntoma:** El backend se corta o no queda escuchando en puerto 3002
**Impacto:** Frontend no puede comunicarse con el backend

### 2. 🔴 403 Forbidden en Rutas de Cliente
**Síntoma:** Errores 403 en `/customers`, `/alerts`, `/notifications`, `/orders/me`, `/receipts/me`
**Impacto:** Usuario con rol CLIENTE no puede acceder a su propio panel

### 3. 🔴 Errores en Módulo de Chat
**Síntoma:** Referencias rotas a `authContainer`, rutas relativas inválidas, alias `@` no resuelven en dist/
**Impacto:** Bloquea el build y el arranque del frontend

### 4. 🟡 PostgreSQL/Prisma sin Persistencia
**Síntoma:** Si se agrega sin migración puede causar errores
**Impacto:** Inestabilidad en base de datos

---

## 🔧 SOLUCIÓN 1: ERR_CONNECTION_REFUSED (Backend Puerto 3002)

### Diagnóstico del Problema

**Estado actual del backend:**
```typescript
// src/shared/server.ts
const PORT = Number(process.env.PORT) || 3000;  // ⚠️ Default es 3000, no 3002
```

**Estado actual del frontend:**
```typescript
// src/infrastructure/http/apiClient.ts
baseURL: import.meta.env.VITE_API_URL,  // ⚠️ Variable no definida
```

**Problema:** 
1. Backend arranca en puerto 3000 por defecto
2. Frontend no tiene `.env` con `VITE_API_URL`
3. Inconsistencia de puertos causa ERR_CONNECTION_REFUSED

### ✅ Solución Paso a Paso

#### Paso 1: Verificar Puerto del Backend

**Opción A - Configurar Backend en 3002:**
```bash
# En Surtitela_backend-main/.env.local
PORT=3002
HOST=localhost
```

**Opción B - Usar el Puerto 3000 (Actual):**
Mantener el backend en 3000 y ajustar el frontend.

#### Paso 2: Crear .env en Frontend

```bash
# Ubicación: software_SurtiTelas--main/.env
VITE_API_URL=http://localhost:3002
```

O si backend usa 3000:
```bash
VITE_API_URL=http://localhost:3000
```

#### Paso 3: Crear .env.example en Frontend

```bash
# software_SurtiTelas--main/.env.example
VITE_API_URL=http://localhost:3002
VITE_APP_NAME=SurtiTelas
```

#### Paso 4: Actualizar .gitignore

```bash
# Agregar a software_SurtiTelas--main/.gitignore
.env
.env.local
```

#### Paso 5: Verificar que Backend Queda Escuchando

```bash
# Ejecutar backend con logs visibles
cd Surtitela_backend-main
npm run dev

# Deberías ver:
# Conectando a la base de datos...
# Conexión a la base de datos establecida.
# Surtitelas iniciado
# Escuchando en http://localhost:3002
```

#### Paso 6: Probar Conexión

```bash
# Desde otra terminal:
curl http://localhost:3002/api/productos
# Debe retornar JSON con productos
```

### 🛠️ Script de Diagnóstico

```bash
# Crear: test-backend-connection.sh
#!/bin/bash
echo "🔍 Probando conexión con backend..."
curl -I http://localhost:3002/api/productos
if [ $? -eq 0 ]; then
  echo "✅ Backend respondiendo correctamente"
else
  echo "❌ Backend no responde"
  echo "Verifica que el proceso esté corriendo: lsof -i :3002"
fi
```

---

## 🔧 SOLUCIÓN 2: 403 Forbidden en Rutas de Cliente

### Diagnóstico del Problema

**Ruta Problemática:**
```typescript
// src/modules/customers/routes/customers.routes.ts
const router = Router();
router.use(verifyToken, authorizeRoles("admin"));  // ⚠️ Solo admin
router.get("/", listCustomers);
```

**Problema:** El endpoint `/api/clientes` (customers) requiere rol `admin`, pero el usuario CLIENTE intenta acceder.

### ✅ Solución Paso a Paso

#### Paso 1: Crear Endpoint Específico para Clientes

```typescript
// src/modules/customers/routes/customers.routes.ts
import { Router } from "express";
import { 
  listCustomers, 
  getCustomer, 
  handleCreateCustomer, 
  handleUpdateCustomer, 
  handleDeleteCustomer 
} from "../controller/customers.controller.js";
import { verifyToken, authorizeRoles } from "../../../shared/auth.js";

const router = Router();

// ✅ Rutas administrativas (solo admin)
router.get("/", verifyToken, authorizeRoles("admin"), listCustomers);
router.post("/", verifyToken, authorizeRoles("admin"), handleCreateCustomer);
router.patch("/:id", verifyToken, authorizeRoles("admin"), handleUpdateCustomer);
router.put("/:id", verifyToken, authorizeRoles("admin"), handleUpdateCustomer);
router.delete("/:id", verifyToken, authorizeRoles("admin"), handleDeleteCustomer);

// ✅ Ruta para que cliente vea su propio perfil
router.get("/me", verifyToken, async (req, res) => {
  const authReq = req as any;
  const userId = authReq.user?.id_user;
  
  if (!userId) {
    return res.status(401).json({ status: "error", message: "No autenticado" });
  }
  
  // Buscar el customer asociado al usuario
  const customer = await prisma.customers.findFirst({
    where: { id_user: userId },
    include: {
      users: {
        select: {
          name: true,
          last_name: true,
          email: true,
          phone: true,
          address: true
        }
      }
    }
  });
  
  if (!customer) {
    return res.status(404).json({ status: "error", message: "Cliente no encontrado" });
  }
  
  return res.json({ status: "success", data: customer });
});

export default router;
```

#### Paso 2: Crear Endpoints para Pedidos del Cliente

```typescript
// src/modules/orders/routes/orders.routes.ts (agregar al final)

// ✅ Endpoint para que cliente vea SUS pedidos
router.get("/me", verifyToken, authorizeRoles("cliente"), async (req, res) => {
  const authReq = req as any;
  const userId = authReq.user?.id_user;
  
  // Obtener el customer_id del usuario
  const customer = await prisma.customers.findFirst({
    where: { id_user: userId },
    select: { id_customer: true }
  });
  
  if (!customer) {
    return res.status(404).json({ status: "error", message: "Cliente no encontrado" });
  }
  
  // Obtener solo los pedidos de este cliente
  const orders = await prisma.orders.findMany({
    where: { id_customer: customer.id_customer },
    include: {
      orders_details: {
        include: {
          products: true
        }
      }
    },
    orderBy: { order_date: 'desc' }
  });
  
  return res.json({ status: "success", data: orders });
});
```

#### Paso 3: Crear Módulo de Notificaciones

```typescript
// src/modules/notifications/routes/notifications.routes.ts (NUEVO)
import { Router } from "express";
import { verifyToken } from "../../../shared/auth.js";
import prisma from "../../../config/prisma.js";

const router = Router();

// ✅ Obtener notificaciones del usuario actual
router.get("/", verifyToken, async (req, res) => {
  const authReq = req as any;
  const userId = authReq.user?.id_user;
  
  const notifications = await prisma.notifications.findMany({
    where: { id_user: userId },
    orderBy: { created_at: 'desc' },
    take: 50
  });
  
  return res.json({ status: "success", data: notifications });
});

// ✅ Marcar notificación como leída
router.patch("/:id/read", verifyToken, async (req, res) => {
  const id = Number(req.params.id);
  const authReq = req as any;
  const userId = authReq.user?.id_user;
  
  // Verificar que la notificación pertenece al usuario
  const notification = await prisma.notifications.findFirst({
    where: { id_notification: id, id_user: userId }
  });
  
  if (!notification) {
    return res.status(404).json({ status: "error", message: "Notificación no encontrada" });
  }
  
  const updated = await prisma.notifications.update({
    where: { id_notification: id },
    data: { read: true }
  });
  
  return res.json({ status: "success", data: updated });
});

export default router;
```

#### Paso 4: Crear Módulo de Alertas

```typescript
// src/modules/alerts/routes/alerts.routes.ts (NUEVO)
import { Router } from "express";
import { verifyToken, authorizeRoles } from "../../../shared/auth.js";
import prisma from "../../../config/prisma.js";

const router = Router();

// ✅ Alertas para clientes (stock bajo, pedidos pendientes, etc.)
router.get("/", verifyToken, authorizeRoles("cliente"), async (req, res) => {
  const authReq = req as any;
  const userId = authReq.user?.id_user;
  
  // Obtener customer_id
  const customer = await prisma.customers.findFirst({
    where: { id_user: userId },
    select: { id_customer: true }
  });
  
  if (!customer) {
    return res.json({ status: "success", data: [] });
  }
  
  // Buscar pedidos pendientes
  const pendingOrders = await prisma.orders.count({
    where: { 
      id_customer: customer.id_customer,
      status_enum: { in: ['Nuevo', 'EnProduccion'] }
    }
  });
  
  // Buscar pagos pendientes
  const unpaidOrders = await prisma.orders.count({
    where: { 
      id_customer: customer.id_customer,
      payments: { none: {} }
    }
  });
  
  const alerts = [];
  
  if (pendingOrders > 0) {
    alerts.push({
      id: 'pending-orders',
      type: 'info',
      message: `Tienes ${pendingOrders} pedidos en proceso`,
      severity: 'info'
    });
  }
  
  if (unpaidOrders > 0) {
    alerts.push({
      id: 'unpaid-orders',
      type: 'warning',
      message: `Tienes ${unpaidOrders} pedidos pendientes de pago`,
      severity: 'warning'
    });
  }
  
  return res.json({ status: "success", data: alerts });
});

export default router;
```

#### Paso 5: Crear Módulo de Recibos/Facturas

```typescript
// src/modules/receipts/routes/receipts.routes.ts (NUEVO)
import { Router } from "express";
import { verifyToken, authorizeRoles } from "../../../shared/auth.js";
import prisma from "../../../config/prisma.js";

const router = Router();

// ✅ Obtener recibos del cliente
router.get("/me", verifyToken, authorizeRoles("cliente"), async (req, res) => {
  const authReq = req as any;
  const userId = authReq.user?.id_user;
  
  // Obtener customer_id
  const customer = await prisma.customers.findFirst({
    where: { id_user: userId },
    select: { id_customer: true }
  });
  
  if (!customer) {
    return res.json({ status: "success", data: [] });
  }
  
  // Obtener pagos (recibos) del cliente
  const receipts = await prisma.payments.findMany({
    where: {
      orders: {
        id_customer: customer.id_customer
      }
    },
    include: {
      orders: {
        include: {
          orders_details: {
            include: {
              products: true
            }
          }
        }
      }
    },
    orderBy: { payment_date: 'desc' }
  });
  
  return res.json({ status: "success", data: receipts });
});

export default router;
```

#### Paso 6: Montar las Nuevas Rutas

```typescript
// src/shared/app.ts (agregar imports)
import notificationsRoutes from "../modules/notifications/routes/notifications.routes.js";
import alertsRoutes from "../modules/alerts/routes/alerts.routes.js";
import receiptsRoutes from "../modules/receipts/routes/receipts.routes.js";

// Agregar a protectedRoutes
export const protectedRoutes = [
  // ... rutas existentes ...
  
  // ✅ Nuevas rutas para clientes
  { path: "/api/notifications", router: notificationsRoutes, middlewares: [verifyToken] },
  { path: "/api/alerts", router: alertsRoutes, middlewares: [verifyToken] },
  { path: "/api/receipts", router: receiptsRoutes, middlewares: [verifyToken] },
];
```

---

## 🔧 SOLUCIÓN 3: Errores en Módulo de Chat

### Diagnóstico del Problema

**Síntomas:**
- Referencias rotas a `authContainer`
- Rutas relativas inválidas
- Alias `@` no se resuelven en dist/

### ✅ Solución Paso a Paso

#### Paso 1: Identificar Archivos Problemáticos

```bash
# Buscar referencias a authContainer
grep -r "authContainer" software_SurtiTelas--main/src/
```

#### Paso 2: Eliminar o Comentar Módulo de Chat Temporal

**Opción A - Eliminar (Recomendado si no se usa):**
```bash
# Si el chat está en desarrollo y causando problemas
rm -rf software_SurtiTelas--main/src/app/features/chat/
```

**Opción B - Comentar Imports (Si se quiere mantener):**
```typescript
// src/app/components/AdminDashboard.tsx
// import { ChatModule } from '../features/chat/ChatModule';  // ⚠️ Comentado temporalmente
```

#### Paso 3: Verificar Alias de TypeScript

```json
// software_SurtiTelas--main/tsconfig.json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["src/*"],
      "@presentation/*": ["src/presentation/*"],
      "@app/*": ["src/app/*"],
      // ✅ Asegurar que todos los alias estén correctos
    }
  }
}
```

#### Paso 4: Verificar Alias de Vite

```typescript
// software_SurtiTelas--main/vite.config.ts
import path from "path";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@presentation": path.resolve(__dirname, "./src/presentation"),
      "@app": path.resolve(__dirname, "./src/app"),
      // ✅ Deben coincidir con tsconfig.json
    }
  }
});
```

#### Paso 5: Limpiar y Reconstruir

```bash
# Limpiar caché y reconstruir
cd software_SurtiTelas--main
rm -rf node_modules/.vite
rm -rf dist
npm run build

# Verificar que no haya errores
```

#### Paso 6: Solución para Referencias Rotas

Si encuentras referencias a `authContainer`, reemplázalas:

```typescript
// ❌ INCORRECTO
import { authContainer } from './authContainer';  // No existe

// ✅ CORRECTO
import { useAuth } from '@presentation/contexts/AuthContext';

// O si es un contenedor de inyección de dependencias:
import { AuthProvider } from '@presentation/contexts/AuthContext';
```

---

## 🔧 SOLUCIÓN 4: PostgreSQL/Prisma sin Persistencia

### Diagnóstico del Problema

**Estado actual:**
- Base de datos: Neon PostgreSQL (conectada)
- Prisma: Cliente generado
- ⚠️ Si se hacen cambios al schema sin migración = problemas

### ✅ Solución Paso a Paso

#### Paso 1: Verificar Estado de Migraciones

```bash
cd Surtitela_backend-main
npx prisma migrate status
```

#### Paso 2: Crear Migración si Hay Cambios Pendientes

```bash
# Si hiciste cambios al schema.prisma
npx prisma migrate dev --name fix_schema_changes
```

#### Paso 3: Aplicar Migraciones en Producción

```bash
# Cuando despliegues
npx prisma migrate deploy
```

#### Paso 4: Regenerar Cliente Prisma

```bash
npx prisma generate
```

#### Paso 5: Verificar Conexión

```bash
# Probar conexión con la base de datos
npx prisma db pull  # Sincronizar schema con DB actual
```

---

## 🧪 PRUEBAS DE VERIFICACIÓN

### Test 1: Backend Responde

```bash
#!/bin/bash
echo "Test 1: Backend en puerto correcto"
curl -I http://localhost:3002/api/productos
if [ $? -eq 0 ]; then echo "✅ PASS"; else echo "❌ FAIL"; fi
```

### Test 2: Cliente Puede Obtener Sus Pedidos

```bash
#!/bin/bash
echo "Test 2: Cliente puede ver sus pedidos"

# Login como cliente
TOKEN=$(curl -s -X POST http://localhost:3002/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"cliente@email.com","password":"cliente123"}' \
  | jq -r '.token')

# Intentar obtener pedidos
STATUS=$(curl -s -o /dev/null -w "%{http_code}" \
  http://localhost:3002/api/orders/me \
  -H "Authorization: Bearer $TOKEN")

if [ "$STATUS" -eq 200 ]; then
  echo "✅ PASS - Cliente puede ver sus pedidos"
else
  echo "❌ FAIL - Status: $STATUS (esperado 200)"
fi
```

### Test 3: Frontend Conecta con Backend

```bash
#!/bin/bash
echo "Test 3: Frontend puede comunicarse con backend"

# Verificar que VITE_API_URL esté configurado
if grep -q "VITE_API_URL" software_SurtiTelas--main/.env; then
  echo "✅ PASS - VITE_API_URL configurado"
else
  echo "❌ FAIL - Falta VITE_API_URL en .env"
fi
```

### Test 4: Build Frontend sin Errores

```bash
#!/bin/bash
echo "Test 4: Frontend compila sin errores"

cd software_SurtiTelas--main
npm run build 2>&1 | tee build.log

if grep -q "error" build.log; then
  echo "❌ FAIL - Errores en build"
  cat build.log
else
  echo "✅ PASS - Build exitoso"
fi
```

---

## 📝 CHECKLIST DE SOLUCIÓN

### Backend
- [ ] Verificar puerto en `.env.local` (3002 o 3000)
- [ ] Backend arranca sin errores
- [ ] Logs muestran "Escuchando en http://localhost:XXXX"
- [ ] Curl a `/api/productos` retorna JSON
- [ ] Crear rutas `/me` para clientes
- [ ] Montar rutas de notificaciones, alerts, receipts
- [ ] Verificar migraciones Prisma

### Frontend
- [ ] Crear `.env` con `VITE_API_URL`
- [ ] Verificar que `apiClient` usa la variable correcta
- [ ] Eliminar o comentar módulo de chat problemático
- [ ] Verificar aliases en `tsconfig.json` y `vite.config.ts`
- [ ] Build exitoso sin errores
- [ ] `.env` en `.gitignore`

### Integración
- [ ] Cliente puede hacer login
- [ ] Cliente puede ver sus pedidos (sin 403)
- [ ] Cliente puede ver notificaciones (sin 403)
- [ ] No hay ERR_CONNECTION_REFUSED
- [ ] Backend permanece escuchando durante desarrollo

---

## 🚀 PRÓXIMOS PASOS RECOMENDADOS

1. **Hoy (Urgente):**
   - ✅ Configurar puerto correcto y crear `.env` en frontend
   - ✅ Crear rutas `/me` para cliente
   - ✅ Eliminar módulo de chat si está roto

2. **Esta Semana:**
   - ✅ Implementar todos los endpoints de cliente
   - ✅ Agregar logs detallados en backend para debugging
   - ✅ Crear tests automatizados

3. **Próxima Semana:**
   - ✅ Integrar frontend con nuevos endpoints
   - ✅ Pruebas de usuario con rol cliente
   - ✅ Monitoreo de errores 403

---

## 📞 COMANDOS DE EMERGENCIA

### Si el backend no arranca:
```bash
cd Surtitela_backend-main
rm -rf node_modules
npm install
npx prisma generate
npm run dev
```

### Si el frontend no compila:
```bash
cd software_SurtiTelas--main
rm -rf node_modules node_modules/.vite dist
npm install
npm run build
```

### Ver qué proceso usa el puerto 3002:
```bash
# Linux/Mac
lsof -i :3002

# Windows
netstat -ano | findstr :3002
```

### Matar proceso en puerto 3002:
```bash
# Linux/Mac
kill -9 $(lsof -t -i:3002)

# Windows (reemplazar PID con el número obtenido arriba)
taskkill /PID <PID> /F
```

---

**Estado:** Documento de solución creado  
**Siguiente paso:** Implementar soluciones en orden de prioridad  
**Tiempo estimado:** 2-4 horas para todas las correcciones

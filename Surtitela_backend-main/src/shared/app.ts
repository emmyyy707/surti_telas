import express, { RequestHandler } from "express";
import { verifyToken, authorizeRoles } from "./auth.js";
import { respuestaNotFound } from "./http.js";

import authRoutes from "../modules/auth/routes/auth.routes.js";
import usersRoutes from "../modules/users/routes/users.routes.js";
import rolesRoutes from "../modules/roles/routes/roles.routes.js";
import productsRoutes from "../modules/products/routes/products.routes.js";
import ordersRoutes from "../modules/orders/routes/orders.routes.js";
import customersRoutes from "../modules/customers/routes/customers.routes.js";
import profileRoutes from "../modules/profile/routes/profile.routes.js";
import checkoutRoutes from "../modules/checkout/routes/checkout.routes.js";
import uploadsRoutes from "../modules/uploads/routes/uploads.routes.js";
import { listProducts } from "../modules/products/controller/products.controller.js";

const app = express();

// Configuración global de middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rutas públicas (no requieren autenticación)
export const publicRoutes = [
  { path: "/api/auth", router: authRoutes },
  { path: "/auth", router: authRoutes },
  { path: "/api/productos", router: productsRoutes },
  { path: "/products", router: productsRoutes },
  // Alias para productos
  { path: "/api/inventario", 
    router: (() => {
      const router = express.Router();
      router.get("/", listProducts);
      return router;
    })()
  },
  { path: "/api/catalogo",
    router: (() => {
      const router = express.Router();
      router.get("/", (req, res) => {
        // Forzar filtro de publicado=true
        req.query.publicado = "true";
        return listProducts(req, res);
      });
      return router;
    })()
  },
];

// Rutas protegidas (requieren autenticación)
export const protectedRoutes = [
  { path: "/api/usuarios", router: usersRoutes, middlewares: [verifyToken, authorizeRoles("admin")] },
  { path: "/api/roles", router: rolesRoutes, middlewares: [verifyToken] },
  { path: "/api/pedidos", router: ordersRoutes, middlewares: [verifyToken] },
  { path: "/orders", router: ordersRoutes, middlewares: [verifyToken] },
  { path: "/api/clientes", router: customersRoutes, middlewares: [verifyToken] },
  { path: "/customers", router: customersRoutes, middlewares: [verifyToken] },
  { path: "/api/profile", router: profileRoutes, middlewares: [verifyToken] },
  { path: "/customers/me", router: profileRoutes, middlewares: [verifyToken] },
  { path: "/api/checkout", router: checkoutRoutes, middlewares: [verifyToken] },
  { path: "/checkout", router: checkoutRoutes, middlewares: [verifyToken] },
  { path: "/api/uploads", router: uploadsRoutes, middlewares: [verifyToken] },
];

// Función para montar rutas
export function mountRoutes(routes: Array<{ path: string; router: express.Router; middlewares?: RequestHandler[] }>) {
  routes.forEach(({ path, router, middlewares = [] }) => {
    app.use(path, ...middlewares, router);
  });
}

// Monta todas las rutas
mountRoutes(publicRoutes);
mountRoutes(protectedRoutes);

// Manejo de rutas no encontradas
app.use((req, res) => {
  res.status(404).json({ status: "error", message: "Ruta no encontrada" });
});

export default app;
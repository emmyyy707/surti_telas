# MAIN EXECUTION CHAIN

## index.html

  Line 19: `<div id="root"></div>`
  Line 26: `<script type="module" src="/src/main.tsx"></script>`

## src/main.tsx

  Line 1: `import React from "react";`
  Line 2: `import ReactDOM from "react-dom/client";`
  Line 4: `import App from "./presentation/pages/App";`  ← ESTÁTICO
  Line 6: `import "./index.css";`  ← ESTÁTICO (side-effect)
  Line 8-11: `import { QueryClient, QueryClientProvider } from "@tanstack/react-query";`  ← ESTÁTICO
  Line 13: `const queryClient = new QueryClient();`  ← EJECUCIÓN
  Line 15-23:
    ```jsx
    ReactDOM.createRoot(
      document.getElementById("root")!
    ).render(
      <React.StrictMode>
        <QueryClientProvider client={queryClient}>
          <App />
        </QueryClientProvider>
      </React.StrictMode>
    );
    ```

Evidencia: `document.getElementById("root")` obtiene el nodo DOM definido en index.html línea 19.

## src/presentation/pages/App.tsx

  Line 9: `import { AuthProvider } from "@presentation/contexts/AuthContext";`  ← ESTÁTICO
  Line 10: `import { CartProvider } from "@presentation/contexts/CartContext";`  ← ESTÁTICO
  Line 11: `import { CartDrawerProvider } from "@presentation/contexts/CartDrawerContext";`  ← ESTÁTICO
  Line 12: `import { ThemeProvider } from "@presentation/contexts/ThemeContext";`  ← ESTÁTICO
  Line 13: `import ProtectedRoute from "@presentation/routes/ProtectedRoute";`  ← ESTÁTICO
  Line 14: `import Navbar from "./components/Navbar";`  ← ESTÁTICO
  Line 15: `import Footer from "./components/footer";`  ← ESTÁTICO
  Line 16: `import ScrollToTop from "../components/ScrollToTop";`  ← ESTÁTICO
  Line 17: `import { CartDrawer } from "../components/CartDrawer";`  ← ESTÁTICO
  Line 18: `import { Spinner } from "@/shared/ui";`  ← ESTÁTICO (barrel)
  Line 19: `import ErrorBoundary from "@/app/components/ErrorBoundary";`  ← ESTÁTICO
  Line 22: `import HomePage from "./public/HomePage";`  ← ESTÁTICO
  Line 23: `import CatalogPage from "./features/CatalogPage";`  ← ESTÁTICO
  Line 24: `import CartPage from "./features/CartPage";`  ← ESTÁTICO
  Line 25: `import ContactPage from "./features/ContactPage";`  ← ESTÁTICO
  Line 26: `import AboutPage from "./public/AboutPage";`  ← ESTÁTICO
  Line 29: `import LoginPage from "./auth/LoginPage";`  ← ESTÁTICO
  Line 30: `import RegisterPage from "./auth/RegisterPage";`  ← ESTÁTICO
  Line 33-40: lazy imports para módulos admin: AdminDashboard, UsersPage, InventoryPage, OrdersPage, CustomersPage, DeliveryPage, AnalyticsPage, SettingsPage

  Line 116-136: Función `App` retorna JSX con providers anidados:
    ```jsx
    <AuthProvider>
      <CartProvider>
        <CartDrawerProvider>
          <ThemeProvider>
            <BrowserRouter>
              <ScrollToTop />
              <AppRoutes />
              <Toaster ... />
            </BrowserRouter>
          </ThemeProvider>
        </CartDrawerProvider>
      </CartProvider>
    </AuthProvider>
    ```

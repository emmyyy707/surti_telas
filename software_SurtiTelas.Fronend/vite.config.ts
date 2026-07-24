import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import path from "path"

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
        "@config": path.resolve(__dirname, "./src/config"),
        "@presentation": path.resolve(__dirname, "./src/presentation"),
        "@presentation/components": path.resolve(__dirname, "./src/presentation/components"),
        "@presentation/pages": path.resolve(__dirname, "./src/presentation/pages"),
        "@presentation/contexts": path.resolve(__dirname, "./src/presentation/contexts"),
        "@presentation/hooks": path.resolve(__dirname, "./src/presentation/hooks"),
        "@presentation/styles": path.resolve(__dirname, "./src/presentation/styles"),
        "@application": path.resolve(__dirname, "./src/application"),
        "@application/services": path.resolve(__dirname, "./src/application/services"),
        "@application/usecases": path.resolve(__dirname, "./src/application/usecases"),
        "@domain": path.resolve(__dirname, "./src/domain"),
        "@domain/entities": path.resolve(__dirname, "./src/domain/entities"),
        "@domain/repositories": path.resolve(__dirname, "./src/domain/repositories"),
        "@infrastructure": path.resolve(__dirname, "./src/infrastructure"),
        "@infrastructure/api": path.resolve(__dirname, "./src/infrastructure/api"),
        "@infrastructure/repositories": path.resolve(__dirname, "./src/infrastructure/repositories"),
        "@shared": path.resolve(__dirname, "./src/shared"),
        "@shared/ui": path.resolve(__dirname, "./src/shared/ui"),
        "@shared/utils": path.resolve(__dirname, "./src/shared/utils"),
        "@assets": path.resolve(__dirname, "./src/assets"),
        "@components": path.resolve(__dirname, "./src/presentation/components/common"),
        "@modules": path.resolve(__dirname, "./modules"),
        "@modules/admin": path.resolve(__dirname, "./modules/admin"),
      }
    },
  server: {
    port: 5173,
    host: 'localhost', // Sirve en http://localhost:5173 para evitar problemas de CORS con backend
    open: true, // Abre el navegador automáticamente
    strictPort: true, // Fijo en 5173: evita saltos a 5174/5179 que rompen CORS
    hmr: {
      overlay: true // Muestra overlay de errores en el navegador
    }
  },
  build: {
    target: "esnext", // Optimiza para navegadores modernos
    outDir: "dist",
    sourcemap: true, // Incluye sourcemaps para debugging
    rollupOptions: {
      output: {
        manualChunks: {
          // Code splitting para mejorar performance
          vendor: ["react", "react-dom"],
          router: ["react-router-dom"]
        }
      }
    }
  },
  // Asegura que los tipos de módulo se resuelvan correctamente
   optimizeDeps: {
     include: ["react", "react-dom", "react-router-dom", "react-is", "recharts"]
   },
   ssr: {
     external: ["recharts", "lucide-react"]
   }
})



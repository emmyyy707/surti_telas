import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ShoppingBag,
  TrendingUp,
  Users,
  Package,
  CheckCircle2,
  ArrowRight,
  Smartphone,
  Truck,
  BarChart3,
  Calendar,
  Shield,
  Zap,
  Clock,
  AlertTriangle,
  MessageSquare,
  FileText,
  Store,
  ShoppingCart,
  CreditCard,
  Eye,
  Menu,
  X,
  ChevronRight,
  Star,
  Minus,
  Plus,
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../components/ui/dialog';

interface SurtitelasLandingProps {
  onLoginRequest?: () => void;
  user?: { role: 'admin' | 'asesor' | 'domiciliario' | 'cliente' | null; name: string; email: string } | null;
  onLogout?: () => void;
}

export function SurtitelasLanding({ onLoginRequest, user, onLogout }: SurtitelasLandingProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('Todas');
  const [hoveredProduct, setHoveredProduct] = useState<number | null>(null);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Productos del catálogo mejorado
  const productos = [
    {
      id: 1,
      nombre: 'Camiseta Premium Cotton',
      descripcion: 'Algodón 100% peinado, corte moderno',
      precio: 45000,
      precioAnterior: 65000,
      imagen: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800',
      imagenHover: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800',
      categoria: 'Camisetas',
      tallas: ['S', 'M', 'L', 'XL', 'XXL'],
      colores: ['Blanco', 'Negro', 'Gris', 'Azul'],
      nuevo: true,
      descuento: 30,
      rating: 4.8,
      reviews: 245,
      stock: 'En stock',
    },
    {
      id: 2,
      nombre: 'Polo Empresarial',
      descripcion: 'Ideal para uniformes corporativos',
      precio: 52000,
      imagen: 'https://images.unsplash.com/photo-1586363104862-3a5e2ab60d99?w=800',
      imagenHover: 'https://images.unsplash.com/photo-1589310243389-96a5483213a8?w=800',
      categoria: 'Polos',
      tallas: ['S', 'M', 'L', 'XL'],
      colores: ['Negro', 'Azul Marino', 'Blanco', 'Gris'],
      popular: true,
      rating: 4.9,
      reviews: 412,
      stock: 'En stock',
    },
    {
      id: 3,
      nombre: 'Camiseta Deportiva Pro',
      descripcion: 'Tecnología Dry-Fit, máxima transpirabilidad',
      precio: 58000,
      imagen: 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=800',
      imagenHover: 'https://images.unsplash.com/photo-1622445275463-afa2ab738c34?w=800',
      categoria: 'Deportivas',
      tallas: ['S', 'M', 'L', 'XL', 'XXL'],
      colores: ['Negro', 'Rojo', 'Azul', 'Verde'],
      rating: 4.7,
      reviews: 189,
      stock: 'En stock',
    },
    {
      id: 4,
      nombre: 'Camiseta Oversized',
      descripcion: 'Estilo urbano, corte amplio y cómodo',
      precio: 48000,
      precioAnterior: 60000,
      imagen: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800',
      imagenHover: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800',
      categoria: 'Camisetas',
      tallas: ['M', 'L', 'XL', 'XXL'],
      colores: ['Negro', 'Beige', 'Gris', 'Blanco'],
      nuevo: true,
      descuento: 20,
      rating: 4.6,
      reviews: 156,
      stock: 'En stock',
    },
    {
      id: 5,
      nombre: 'Camiseta Básica Essential',
      descripcion: 'Tu básico perfecto para el día a día',
      precio: 35000,
      imagen: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800',
      imagenHover: 'https://images.unsplash.com/photo-1622445275463-afa2ab738c34?w=800',
      categoria: 'Básicas',
      tallas: ['S', 'M', 'L', 'XL'],
      colores: ['Blanco', 'Negro', 'Gris'],
      popular: true,
      rating: 4.8,
      reviews: 523,
      stock: 'En stock',
    },
    {
      id: 6,
      nombre: 'Polo Premium Piqué',
      descripcion: 'Tejido piqué de alta calidad',
      precio: 65000,
      imagen: 'https://images.unsplash.com/photo-1589310243389-96a5e2ab60d99?w=800',
      imagenHover: 'https://images.unsplash.com/photo-1586363104862-3a5e2ab60d99?w=800',
      categoria: 'Polos',
      tallas: ['S', 'M', 'L', 'XL', 'XXL'],
      colores: ['Azul Marino', 'Blanco', 'Negro', 'Gris'],
      rating: 4.9,
      reviews: 287,
      stock: 'Pocas unidades',
    },
    {
      id: 7,
      nombre: 'Camiseta Cuello V',
      descripcion: 'Elegante y versátil',
      precio: 42000,
      imagen: 'https://images.unsplash.com/photo-1622445275463-afa2ab738c34?w=800',
      imagenHover: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800',
      categoria: 'Camisetas',
      tallas: ['S', 'M', 'L', 'XL'],
      colores: ['Negro', 'Blanco', 'Azul Oscuro', 'Gris'],
      rating: 4.7,
      reviews: 198,
      stock: 'En stock',
    },
    {
      id: 8,
      nombre: 'Deportiva Running',
      descripcion: 'Máxima performance para corredores',
      precio: 62000,
      precioAnterior: 80000,
      imagen: 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=800',
      imagenHover: 'https://images.unsplash.com/photo-1622445275463-afa2ab738c34?w=800',
      categoria: 'Deportivas',
      tallas: ['S', 'M', 'L', 'XL'],
      colores: ['Negro', 'Azul', 'Rojo'],
      nuevo: true,
      descuento: 22,
      rating: 4.9,
      reviews: 341,
      stock: 'En stock',
    },
  ];

  const categorias = ['Todas', 'Camisetas', 'Polos', 'Deportivas', 'Básicas'];

  const productosFiltrados = selectedCategory === 'Todas' 
    ? productos 
    : productos.filter(p => p.categoria === selectedCategory);

  const addToCart = (producto: any, talla: string, color: string) => {
    const newItem = {
      ...producto,
      talla,
      color,
      cantidad: 1,
      itemId: `${producto.id}-${talla}-${color}`,
    };
    setCartItems([...cartItems, newItem]);
    setSelectedProduct(null);
  };

  const removeFromCart = (itemId: string) => {
    setCartItems(cartItems.filter(item => item.itemId !== itemId));
  };

  const updateQuantity = (itemId: string, change: number) => {
    setCartItems(cartItems.map(item => {
      if (item.itemId === itemId) {
        const newCantidad = Math.max(1, item.cantidad + change);
        return { ...item, cantidad: newCantidad };
      }
      return item;
    }));
  };

  const totalCarrito = cartItems.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      {/* Navigation */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-200"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="h-10 w-10 bg-gradient-to-br from-black to-[#3D3D3D] rounded-lg flex items-center justify-center">
                <ShoppingBag className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold text-black">Surtitelas</span>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center gap-8">
              <a href="#inicio" className="text-gray-700 hover:text-black transition-colors">Inicio</a>
              <a href="#soluciones" className="text-gray-700 hover:text-black transition-colors">Soluciones</a>
              <a href="#modulos" className="text-gray-700 hover:text-black transition-colors">Módulos</a>
              <a href="#catalogo" className="text-gray-700 hover:text-black transition-colors">Catálogo</a>
              <a href="#contacto" className="text-gray-700 hover:text-black transition-colors">Contacto</a>
            </div>

            {/* CTA Buttons */}
            <div className="hidden md:flex items-center gap-4">
              <Button
                variant="ghost"
                onClick={() => setCartOpen(true)}
                className="relative"
              >
                <ShoppingCart className="h-5 w-5" />
                {cartItems.length > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-black text-white text-xs flex items-center justify-center">
                    {cartItems.length}
                  </span>
                )}
              </Button>
              {user ? (
                <Button variant="outline" onClick={onLogout}>
                  Cerrar sesión
                </Button>
              ) : (
                <Button variant="outline" onClick={() => onLoginRequest ? onLoginRequest() : setShowLoginModal(true)}>
                  Iniciar sesión
                </Button>
              )}
              <Button className="bg-black hover:bg-[#1A1A1A] text-white">
                Ver catálogo
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="md:hidden py-4 space-y-4"
            >
              <a href="#inicio" className="block text-gray-700 hover:text-black">Inicio</a>
              <a href="#soluciones" className="block text-gray-700 hover:text-black">Soluciones</a>
              <a href="#modulos" className="block text-gray-700 hover:text-black">Módulos</a>
              <a href="#catalogo" className="block text-gray-700 hover:text-black">Catálogo</a>
              <a href="#contacto" className="block text-gray-700 hover:text-black">Contacto</a>
              <div className="flex flex-col gap-2 pt-4 border-t">
                {user ? (
                  <Button variant="outline" onClick={onLogout} className="w-full">
                    Cerrar sesión
                  </Button>
                ) : (
                  <Button variant="outline" onClick={() => onLoginRequest ? onLoginRequest() : setShowLoginModal(true)} className="w-full">
                    Iniciar sesión
                  </Button>
                )}
                <Button className="bg-black hover:bg-[#1A1A1A] text-white w-full">
                  Ver catálogo
                </Button>
              </div>
            </motion.div>
          )}
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section id="inicio" className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white to-[#FAFAFA]">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Badge className="mb-6 bg-[#E8E3D8] text-[#3D3D3D] border-none">
                Plataforma integral de gestión
              </Badge>
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-black mb-6 leading-tight">
                Digitaliza tu negocio de confección
              </h1>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Control total de inventario, producción automatizada y ventas en una sola plataforma. 
                Simplifica la gestión de tu empresa textil con tecnología de punta.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  size="lg"
                  className="bg-black hover:bg-[#1A1A1A] text-white text-lg h-14 px-8"
                  onClick={() => document.getElementById('catalogo')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  Ver catálogo
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
                {user ? (
                  <Button
                    size="lg"
                    variant="outline"
                    className="text-lg h-14 px-8"
                    onClick={onLogout}
                  >
                    Cerrar sesión
                  </Button>
                ) : (
                  <Button
                    size="lg"
                    variant="outline"
                    className="text-lg h-14 px-8"
                    onClick={() => onLoginRequest ? onLoginRequest() : setShowLoginModal(true)}
                  >
                    Iniciar sesión
                  </Button>
                )}
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-6 mt-12 pt-12 border-t border-gray-200">
                <div>
                  <p className="text-3xl font-bold text-black">+500</p>
                  <p className="text-sm text-gray-600 mt-1">Clientes activos</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-black">99.9%</p>
                  <p className="text-sm text-gray-600 mt-1">Disponibilidad</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-black">24/7</p>
                  <p className="text-sm text-gray-600 mt-1">Soporte</p>
                </div>
              </div>
            </motion.div>

            {/* Right Content - Mockup */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative"
            >
              <div className="relative">
                {/* Desktop Mockup */}
                <Card className="p-8 bg-white shadow-2xl rounded-2xl">
                  <div className="aspect-video bg-gradient-to-br from-[#F5F5F5] to-white rounded-lg p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="h-3 w-3 rounded-full bg-red-500"></div>
                      <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
                      <div className="h-3 w-3 rounded-full bg-green-500"></div>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={i} className="aspect-square bg-white rounded-lg shadow-sm"></div>
                      ))}
                    </div>
                  </div>
                </Card>

                {/* Mobile Mockup - Floating */}
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute -bottom-8 -right-8 w-48"
                >
                  <Card className="p-3 bg-white shadow-2xl rounded-2xl">
                    <div className="aspect-[9/16] bg-gradient-to-b from-[#FAFAFA] to-white rounded-lg"></div>
                  </Card>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Problems Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <Badge className="mb-4 bg-red-50 text-red-700 border-red-200">
              Problemas comunes
            </Badge>
            <h2 className="text-4xl sm:text-5xl font-bold text-black mb-6">
              Â¿Te suena familiar?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              La mayoría de empresas de confección enfrentan estos desafíos diariamente
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: AlertTriangle,
                title: 'Desorden en inventario',
                description: 'No sabes cuántas telas o productos tienes disponibles',
                color: 'bg-red-50 text-red-600',
              },
              {
                icon: MessageSquare,
                title: 'Ventas por WhatsApp',
                description: 'Pedidos desordenados, sin historial ni control',
                color: 'bg-orange-50 text-orange-600',
              },
              {
                icon: FileText,
                title: 'Falta de control',
                description: 'No sabes el estado de producción de tus talleres',
                color: 'bg-yellow-50 text-yellow-600',
              },
              {
                icon: Clock,
                title: 'Pérdida de información',
                description: 'Datos dispersos en cuadernos y hojas de cálculo',
                color: 'bg-blue-50 text-blue-600',
              },
            ].map((problem, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="p-6 h-full hover:shadow-lg transition-shadow">
                  <div className={`h-12 w-12 rounded-lg ${problem.color} flex items-center justify-center mb-4`}>
                    <problem.icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-semibold text-black mb-2">{problem.title}</h3>
                  <p className="text-gray-600">{problem.description}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section id="soluciones" className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[#FAFAFA] to-white">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <Badge className="mb-4 bg-green-50 text-green-700 border-green-200">
              La solución completa
            </Badge>
            <h2 className="text-4xl sm:text-5xl font-bold text-black mb-6">
              Todo en una sola plataforma
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Surtitelas centraliza todas las operaciones de tu negocio textil
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            {[
              {
                icon: Package,
                title: 'Control total del inventario',
                description: 'Gestiona tus insumos, telas y productos terminados en tiempo real. Alertas automáticas de stock bajo.',
                features: ['Stock en tiempo real', 'Alertas automáticas', 'Historial completo'],
                gradient: 'from-blue-500 to-blue-600',
              },
              {
                icon: ShoppingCart,
                title: 'Pedidos automatizados',
                description: 'Catálogo digital con carrito de compras. Tus clientes compran 24/7 sin intermediarios.',
                features: ['Catálogo digital', 'Carrito inteligente', 'Pagos en línea'],
                gradient: 'from-purple-500 to-purple-600',
              },
              {
                icon: BarChart3,
                title: 'Producción con trazabilidad',
                description: 'Seguimiento completo desde el corte hasta la entrega. Kanban visual para gestionar talleres.',
                features: ['Flujo Kanban', 'Control de talleres', 'Trazabilidad total'],
                gradient: 'from-orange-500 to-orange-600',
              },
              {
                icon: Store,
                title: 'Catálogo digital integrado',
                description: 'Muestra tus productos de forma profesional. Tus clientes navegan, seleccionan y pagan en línea.',
                features: ['Diseño profesional', 'Responsive', 'Fácil gestión'],
                gradient: 'from-green-500 to-green-600',
              },
            ].map((solution, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="p-8 h-full hover:shadow-xl transition-all group">
                  <div className={`h-14 w-14 rounded-xl bg-gradient-to-br ${solution.gradient} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                    <solution.icon className="h-7 w-7 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-black mb-3">{solution.title}</h3>
                  <p className="text-gray-600 mb-6">{solution.description}</p>
                  <div className="space-y-2">
                    {solution.features.map((feature, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                        <span className="text-sm text-gray-700">{feature}</span>
                      </div>
                    ))}
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Modules Section */}
      <section id="modulos" className="py-20 px-4 sm:px-6 lg:px-8 bg-black text-white">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <Badge className="mb-4 bg-white/10 text-white border-white/20">
              Módulos del sistema
            </Badge>
            <h2 className="text-4xl sm:text-5xl font-bold mb-6">
              Diseñado para cada rol
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Cada usuario tiene su propio espacio de trabajo optimizado
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                role: 'Administrador',
                icon: Shield,
                description: 'Panel completo de gestión y configuración',
                features: ['Dashboard ejecutivo', 'Gestión de usuarios', 'Reportes avanzados', 'Configuración total'],
                color: 'from-purple-500 to-purple-600',
                hasAccess: true,
              },
              {
                role: 'Asesor',
                icon: Users,
                description: 'Gestión de ventas y atención al cliente',
                features: ['Crear pedidos', 'Gestión de clientes', 'Historial de ventas', 'Comisiones'],
                color: 'from-blue-500 to-blue-600',
                hasAccess: true,
              },
              {
                role: 'Domiciliario',
                icon: Truck,
                description: 'Control de entregas y rutas',
                features: ['Rutas asignadas', 'Escaneo QR', 'Confirmación', 'Historial'],
                color: 'from-green-500 to-green-600',
                hasAccess: true,
              },
              {
                role: 'Cliente',
                icon: ShoppingBag,
                description: 'Experiencia de compra simplificada',
                features: ['Ver catálogo', 'Comprar productos', 'Carrito de compras', 'Seguimiento'],
                color: 'from-orange-500 to-orange-600',
                hasAccess: false,
                note: 'Sin dashboard - Solo compras',
              },
            ].map((module, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="p-6 bg-white/5 border-white/10 backdrop-blur-sm hover:bg-white/10 transition-all h-full">
                  <div className={`h-12 w-12 rounded-lg bg-gradient-to-br ${module.color} flex items-center justify-center mb-4`}>
                    <module.icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">{module.role}</h3>
                  <p className="text-gray-300 text-sm mb-4">{module.description}</p>
                  
                  {module.note && (
                    <Badge className="mb-4 bg-orange-500/20 text-orange-300 border-orange-500/30">
                      {module.note}
                    </Badge>
                  )}

                  <div className="space-y-2">
                    {module.features.map((feature, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-white/60"></div>
                        <span className="text-sm text-gray-300">{feature}</span>
                      </div>
                    ))}
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Catalog Section */}
      <section id="catalogo" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <Badge className="mb-4 bg-[#E8E3D8] text-[#3D3D3D] border-none">
              Catálogo de productos
            </Badge>
            <h2 className="text-4xl sm:text-5xl font-bold text-black mb-6">
              Nuestros productos
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Explora nuestra selección de camisetas de alta calidad
            </p>
          </motion.div>

          <div className="flex justify-center mb-8">
            <div className="flex items-center gap-4">
              {categorias.map((categoria) => (
                <Button
                  key={categoria}
                  variant={selectedCategory === categoria ? 'default' : 'outline'}
                  onClick={() => setSelectedCategory(categoria)}
                >
                  {categoria}
                </Button>
              ))}
            </div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {productosFiltrados.map((producto, index) => (
              <motion.div
                key={producto.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="overflow-hidden hover:shadow-xl transition-all group">
                  <div className="relative aspect-square bg-gray-100 overflow-hidden">
                    <img
                      src={hoveredProduct === producto.id ? producto.imagenHover : producto.imagen}
                      alt={producto.nombre}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      onMouseEnter={() => setHoveredProduct(producto.id)}
                      onMouseLeave={() => setHoveredProduct(null)}
                    />
                    <Badge className="absolute top-4 left-4 bg-white/90 text-black">
                      {producto.categoria}
                    </Badge>
                    {producto.nuevo && (
                      <Badge className="absolute top-4 right-4 bg-red-500 text-white">
                        Nuevo
                      </Badge>
                    )}
                    {producto.descuento && (
                      <Badge className="absolute top-4 right-4 bg-green-500 text-white">
                        {producto.descuento}% OFF
                      </Badge>
                    )}
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-black mb-2">{producto.nombre}</h3>
                    <p className="text-2xl font-bold text-black mb-4">
                      ${producto.precio.toLocaleString()}
                      {producto.precioAnterior && (
                        <span className="text-sm text-gray-500 line-through ml-2">
                          ${producto.precioAnterior.toLocaleString()}
                        </span>
                      )}
                    </p>
                    <div className="flex items-center gap-2 mb-4">
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star key={star} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        ))}
                      </div>
                      <span className="text-sm text-gray-600">({producto.reviews} reviews)</span>
                    </div>
                    <Button
                      className="w-full bg-black hover:bg-[#1A1A1A] text-white"
                      onClick={() => setSelectedProduct(producto)}
                    >
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      Agregar al carrito
                    </Button>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Order Tracking Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[#FAFAFA] to-white">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <Badge className="mb-4 bg-blue-50 text-blue-700 border-blue-200">
              Seguimiento en tiempo real
            </Badge>
            <h2 className="text-4xl sm:text-5xl font-bold text-black mb-6">
              Rastrea tu pedido en cada paso
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Transparencia total desde que realizas tu compra hasta que llega a tu puerta
            </p>
          </motion.div>

          <Card className="p-8 sm:p-12">
            <div className="relative">
              {/* Progress Bar */}
              <div className="absolute top-6 left-0 right-0 h-1 bg-gray-200">
                <div className="h-full bg-black w-3/4"></div>
              </div>

              {/* Steps */}
              <div className="relative grid grid-cols-4 gap-4">
                {[
                  { icon: CheckCircle2, label: 'Recibido', status: 'completed' },
                  { icon: Package, label: 'En producción', status: 'completed' },
                  { icon: Truck, label: 'Enviado', status: 'current' },
                  { icon: ShoppingBag, label: 'Entregado', status: 'pending' },
                ].map((step, index) => (
                  <div key={index} className="flex flex-col items-center">
                    <div
                      className={`h-12 w-12 rounded-full flex items-center justify-center mb-3 ${
                        step.status === 'completed'
                          ? 'bg-black text-white'
                          : step.status === 'current'
                          ? 'bg-black text-white animate-pulse'
                          : 'bg-gray-200 text-gray-400'
                      }`}
                    >
                      <step.icon className="h-6 w-6" />
                    </div>
                    <span className="text-sm font-medium text-center">{step.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* Mobile Experience */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-black text-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <Badge className="mb-6 bg-white/10 text-white border-white/20">
                Experiencia móvil
              </Badge>
              <h2 className="text-4xl sm:text-5xl font-bold mb-6">
                Compra desde cualquier lugar
              </h2>
              <p className="text-xl text-gray-300 mb-8">
                Aplicación optimizada para móviles. Tus clientes pueden navegar, comprar y hacer seguimiento desde su celular.
              </p>

              <div className="space-y-6">
                {[
                  {
                    icon: Smartphone,
                    title: 'Diseño responsive',
                    description: 'Perfecta en cualquier dispositivo',
                  },
                  {
                    icon: Zap,
                    title: 'Carga ultrarrápida',
                    description: 'Optimizado para conexiones lentas',
                  },
                  {
                    icon: Eye,
                    title: 'Interfaz intuitiva',
                    description: 'Fácil de usar para cualquier persona',
                  },
                ].map((feature, index) => (
                  <div key={index} className="flex items-start gap-4">
                    <div className="h-12 w-12 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                      <feature.icon className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">{feature.title}</h3>
                      <p className="text-gray-400">{feature.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="flex justify-center gap-4"
            >
              {/* Mobile Mockups */}
              <div className="space-y-4">
                <Card className="p-4 bg-white">
                  <div className="aspect-[9/16] w-48 bg-gradient-to-b from-[#FAFAFA] to-white rounded-lg"></div>
                </Card>
              </div>
              <div className="space-y-4 mt-12">
                <Card className="p-4 bg-white">
                  <div className="aspect-[9/16] w-48 bg-gradient-to-b from-white to-[#F5F5F5] rounded-lg"></div>
                </Card>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-[#1A1A1A] to-black text-white">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl sm:text-5xl font-bold mb-6">
              Comienza a digitalizar tu negocio hoy
            </h2>
            <p className="text-xl text-gray-300 mb-8">
              Únete a cientos de empresas que ya confían en Surtitelas
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="bg-white text-black hover:bg-gray-100 text-lg h-14 px-8"
                onClick={() => document.getElementById('catalogo')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Explorar catálogo
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
              {user ? (
                <Button
                  size="lg"
                  variant="outline"
                  className="text-lg h-14 px-8 border-white text-white hover:bg-white/10"
                  onClick={onLogout}
                >
                  Cerrar sesión
                </Button>
              ) : (
                <Button
                  size="lg"
                  variant="outline"
                  className="text-lg h-14 px-8 border-white text-white hover:bg-white/10"
                  onClick={() => onLoginRequest ? onLoginRequest() : setShowLoginModal(true)}
                >
                  Iniciar sesión
                </Button>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contacto" className="bg-black text-white py-16 px-4 sm:px-6 lg:px-8 border-t border-white/10">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            {/* Brand */}
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <div className="h-10 w-10 bg-white rounded-lg flex items-center justify-center">
                  <ShoppingBag className="h-6 w-6 text-black" />
                </div>
                <span className="text-xl font-bold">Surtitelas</span>
              </div>
              <p className="text-gray-400 mb-6">
                Plataforma integral de gestión para empresas de confección. 
                Digitaliza tu negocio y lleva el control total de inventario, producción y ventas.
              </p>
              <div className="flex gap-4">
                <a href="#" className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">
                  <span className="sr-only">Facebook</span>
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"/></svg>
                </a>
                <a href="#" className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">
                  <span className="sr-only">Instagram</span>
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z"/></svg>
                </a>
                <a href="#" className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">
                  <span className="sr-only">WhatsApp</span>
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
                </a>
              </div>
            </div>

            {/* Links */}
            <div>
              <h3 className="font-semibold mb-4">Enlaces rápidos</h3>
              <ul className="space-y-2">
                <li><a href="#inicio" className="text-gray-400 hover:text-white transition-colors">Inicio</a></li>
                <li><a href="#soluciones" className="text-gray-400 hover:text-white transition-colors">Soluciones</a></li>
                <li><a href="#modulos" className="text-gray-400 hover:text-white transition-colors">Módulos</a></li>
                <li><a href="#catalogo" className="text-gray-400 hover:text-white transition-colors">Catálogo</a></li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h3 className="font-semibold mb-4">Contacto</h3>
              <ul className="space-y-2 text-gray-400">
                <li>contacto@surtitelas.com</li>
                <li>+57 300 123 4567</li>
                <li>Bogotá, Colombia</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-white/10 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-gray-400 text-sm">
              Â© 2026 Surtitelas. Todos los derechos reservados.
            </p>
            <div className="flex gap-6 text-sm">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">Términos de servicio</a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">Privacidad</a>
            </div>
          </div>
        </div>
      </footer>

      {/* Product Details Modal */}
      {selectedProduct && (
        <Dialog open={!!selectedProduct} onOpenChange={() => setSelectedProduct(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{selectedProduct.nombre}</DialogTitle>
              <DialogDescription>
                Selecciona talla y color para agregar al carrito
              </DialogDescription>
            </DialogHeader>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                <img
                  src={selectedProduct.imagen}
                  alt={selectedProduct.nombre}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <p className="text-3xl font-bold text-black mb-4">
                  ${selectedProduct.precio.toLocaleString()}
                </p>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">Talla</label>
                  <div className="flex gap-2">
                    {selectedProduct.tallas.map((talla: string) => (
                      <Button key={talla} variant="outline" size="sm">
                        {talla}
                      </Button>
                    ))}
                  </div>
                </div>
                <div className="mb-6">
                  <label className="block text-sm font-medium mb-2">Color</label>
                  <div className="flex gap-2">
                    {selectedProduct.colores.map((color: string) => (
                      <Button key={color} variant="outline" size="sm">
                        {color}
                      </Button>
                    ))}
                  </div>
                </div>
                <Button
                  className="w-full bg-black hover:bg-[#1A1A1A] text-white"
                  onClick={() => {
                    addToCart(selectedProduct, 'M', selectedProduct.colores[0]);
                  }}
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Agregar al carrito
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Shopping Cart Modal */}
      <Dialog open={cartOpen} onOpenChange={setCartOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Carrito de compras</DialogTitle>
            <DialogDescription>
              {cartItems.length} {cartItems.length === 1 ? 'producto' : 'productos'} en tu carrito
            </DialogDescription>
          </DialogHeader>

          {cartItems.length === 0 ? (
            <div className="py-12 text-center text-gray-500">
              <ShoppingCart className="h-12 w-12 mx-auto mb-4 opacity-20" />
              <p>Tu carrito está vacío</p>
            </div>
          ) : (
            <>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {cartItems.map((item) => (
                  <div key={item.itemId} className="flex gap-4 p-4 border rounded-lg">
                    <img
                      src={item.imagen}
                      alt={item.nombre}
                      className="w-20 h-20 object-cover rounded"
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold">{item.nombre}</h3>
                      <p className="text-sm text-gray-600">
                        Talla: {item.talla} • Color: {item.color}
                      </p>
                      <p className="font-bold mt-1">${item.precio.toLocaleString()}</p>
                    </div>
                    <div className="flex flex-col items-end justify-between">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFromCart(item.itemId)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => updateQuantity(item.itemId, -1)}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-8 text-center">{item.cantidad}</span>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => updateQuantity(item.itemId, 1)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-lg font-semibold">Total:</span>
                  <span className="text-2xl font-bold">${totalCarrito.toLocaleString()}</span>
                </div>
                <Button className="w-full bg-black hover:bg-[#1A1A1A] text-white">
                  <CreditCard className="h-4 w-4 mr-2" />
                  Proceder al pago
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Login Modal - Solo se muestra si NO hay onLoginRequest prop */}
      {!onLoginRequest && (
        <Dialog open={showLoginModal} onOpenChange={setShowLoginModal}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Iniciar sesión</DialogTitle>
              <DialogDescription>
                Ingresa tus credenciales para acceder al dashboard
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Correo electrónico</label>
                <Input
                  type="email"
                  placeholder="admin@surticamisetas.com"
                  className="w-full"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Contraseña</label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  className="w-full"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                />
              </div>
              <div className="bg-gray-50 p-4 rounded-lg border text-sm space-y-2">
                <p className="font-semibold text-gray-900">Credenciales de prueba:</p>
                <div className="space-y-1 text-gray-700">
                  <p>ðŸ‘¨â€ðŸ’¼ <strong>Admin:</strong> admin@surticamisetas.com / admin123</p>
                  <p>ðŸ‘” <strong>Asesor:</strong> asesor@surticamisetas.com / asesor123</p>
                  <p>ðŸšš <strong>Domiciliario:</strong> domiciliario@surticamisetas.com / domi123</p>
                  <p>ðŸ‘¤ <strong>Cliente:</strong> cliente@email.com / cliente123</p>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                className="w-full bg-black hover:bg-[#1A1A1A] text-white"
                onClick={() => {
                  // Simulación simple de login sin redirección real
                  setShowLoginModal(false);
                }}
              >
                Iniciar sesión
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}




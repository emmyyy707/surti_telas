import { ImageWithFallback } from './figma/ImageWithFallback';
import { NavigationBar } from './NavigationBar';
import { ScrollingImages } from './ScrollingImages';
import { Footer } from './Footer';
import { HeroCarousel } from './HeroCarousel';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { User as UserType, Employee, AdvisorRating, Product, ProductRating, QuickMessage, CartItem } from '../types';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { Clock, Phone, MessageCircle, Shirt, PenTool, Users, Package, Mail, User, Palette, Sparkles, ArrowRight } from 'lucide-react';
import gorrasImage from 'figma:asset/0693bd3c359c94577b682547d6f3ba74b8804bb3.png';

interface HomePageProps {
  onNavigate: (page: string) => void;
  currentUser?: UserType | null;
  assignedAdvisor?: Employee;
  ratings?: AdvisorRating[];
  onSubmitRating?: (rating: number, comment: string) => void;
  products?: Product[];
  advisors?: Employee[];
  onSubmitProductRating?: (rating: ProductRating) => void;
  onSubmitQuickMessage?: (message: QuickMessage) => void;
  onAddToCart?: (item: CartItem) => void;
  onCartClick: () => void;
  cartItemCount?: number;
}

export function HomePage({ 
  onNavigate, 
  currentUser,
  onCartClick,
  cartItemCount,
}: HomePageProps) {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    subject: '',
    message: '',
    privacy: false,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (checked: boolean) => {
    setFormData(prev => ({ ...prev, privacy: checked }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validaciones
    if (!formData.name || !formData.phone || !formData.email || !formData.subject) {
      toast.error('Campos requeridos incompletos', {
        description: 'Por favor completa todos los campos marcados con *',
      });
      return;
    }

    if (!formData.privacy) {
      toast.error('Políticas de privacidad', {
        description: 'Debes aceptar las políticas de privacidad',
      });
      return;
    }

    // Simular envío
    toast.success('Â¡Mensaje enviado!', {
      description: 'Nos pondremos en contacto contigo pronto',
    });

    // Limpiar formulario
    setFormData({
      name: '',
      phone: '',
      email: '',
      subject: '',
      message: '',
      privacy: false,
    });
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar flotante */}
      <div className="fixed top-0 left-0 right-0 z-50">
        <NavigationBar 
          onNavigate={onNavigate} 
          currentUser={currentUser}
          activePage="inicio"
          onCartClick={onCartClick}
          cartItemCount={cartItemCount}
        />
      </div>

      {/* Espacio para el navbar fijo */}
      <div className="h-20"></div>

      {/* Hero Carousel - Automático */}
      <HeroCarousel onNavigate={onNavigate} />

      {/* Banner Destacado - Surtitelas Landing */}
      <motion.div 
        className="relative bg-gradient-to-br from-black via-[#1A1A1A] to-black py-16 px-4 overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        {/* Partículas de fondo animadas */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            className="absolute top-1/4 left-1/4 w-64 h-64 bg-[#8B8173]/10 rounded-full blur-3xl"
            animate={{
              x: [0, 100, 0],
              y: [0, -50, 0],
            }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          />
          <motion.div
            className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#B5ADA1]/10 rounded-full blur-3xl"
            animate={{
              x: [0, -100, 0],
              y: [0, 100, 0],
            }}
            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          />
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            {/* Contenido izquierdo */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <Badge className="mb-4 bg-[#8B8173] text-white border-none">
                <Sparkles className="h-3 w-3 mr-2" />
                Nueva Plataforma Disponible
              </Badge>
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
                Descubre
                <span className="block bg-gradient-to-r from-[#D4CFC4] to-[#B5ADA1] bg-clip-text text-transparent">
                  Surtitelas
                </span>
              </h2>
              <p className="text-xl text-gray-300 mb-8 leading-relaxed">
                La plataforma integral de gestión para empresas textiles. Control total de inventario, 
                producción automatizada y ventas digitales en un solo lugar.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  size="lg"
                  className="bg-white text-black hover:bg-gray-100 text-lg h-14 px-8 group"
                  onClick={() => onNavigate('surtitelas-landing')}
                >
                  Explorar Surtitelas
                  <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="text-lg h-14 px-8 border-white text-white hover:bg-white/10"
                  onClick={() => onNavigate('login')}
                >
                  Iniciar sesión
                </Button>
              </div>

              {/* Características destacadas */}
              <div className="grid grid-cols-3 gap-4 mt-10 pt-10 border-t border-white/10">
                {[
                  { icon: Package, label: 'Control de inventario' },
                  { icon: Users, label: 'Gestión de equipo' },
                  { icon: Palette, label: 'Catálogo digital' },
                ].map((feature, index) => (
                  <motion.div
                    key={index}
                    className="flex flex-col items-center text-center"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className="h-12 w-12 rounded-full bg-white/10 flex items-center justify-center mb-2">
                      <feature.icon className="h-6 w-6 text-white" />
                    </div>
                    <p className="text-xs text-gray-400">{feature.label}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Mockup derecho */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative hidden lg:block"
            >
              {/* Desktop mockup */}
              <div className="relative">
                <div className="bg-white/10 backdrop-blur-sm p-6 rounded-2xl shadow-2xl border border-white/20">
                  <div className="aspect-video bg-gradient-to-br from-[#F5F5F5] to-white rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="h-2 w-2 rounded-full bg-red-500"></div>
                      <div className="h-2 w-2 rounded-full bg-yellow-500"></div>
                      <div className="h-2 w-2 rounded-full bg-green-500"></div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      <div className="grid grid-cols-3 gap-2 mt-4">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                          <div key={i} className="aspect-square bg-gray-100 rounded"></div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Mobile mockup floating */}
                <motion.div
                  animate={{ y: [0, -15, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute -bottom-6 -right-6 w-32"
                >
                  <div className="bg-white/10 backdrop-blur-sm p-2 rounded-xl shadow-2xl border border-white/20">
                    <div className="aspect-[9/16] bg-gradient-to-b from-[#FAFAFA] to-white rounded-lg"></div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Segunda Sección - Servicios 24 Horas */}
      <div className="relative bg-[#1a1a1a] py-24 overflow-hidden">
        {/* Imagen de fondo con overlay */}
        <div className="absolute inset-0 opacity-20">
          <ImageWithFallback
            src="https://images.unsplash.com/photo-1581508512961-0e3b9524db40?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcmludGluZyUyMHdvcmtzaG9wJTIwdGV4dGlsZXxlbnwxfHx8fDE3NjI5ODI4NDV8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
            alt="Workshop background"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#1a1a1a] via-[#1a1a1a]/90 to-[#1a1a1a]"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div 
            className="text-center mb-8"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl lg:text-4xl text-white mb-2">Nuestros Servicios</h2>
            <p className="text-gray-400">Siempre disponibles para ti</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Servicio 1 */}
            <motion.div 
              className="bg-white/5 backdrop-blur-sm p-6 rounded-xl border border-white/10 hover:bg-white/10 transition-all duration-300"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              whileHover={{ scale: 1.05, y: -5 }}
            >
              <div className="flex items-center justify-center mb-4">
                <motion.div 
                  className="bg-gradient-to-br from-[#8B8173] to-[#6B6B6B] p-3 rounded-xl"
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                >
                  <Clock className="h-8 w-8 text-white" />
                </motion.div>
              </div>
              <h3 className="text-lg text-white mb-2 text-center">Atención</h3>
              <p className="text-gray-400 text-sm text-center">
                Lunes a Sábado de 8:00 AM - 5:00 PM. No trabajamos domingos ni festivos.
              </p>
            </motion.div>

            {/* Servicio 2 */}
            <motion.div 
              className="bg-white/5 backdrop-blur-sm p-6 rounded-xl border border-white/10 hover:bg-white/10 transition-all duration-300"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              whileHover={{ scale: 1.05, y: -5 }}
            >
              <div className="flex items-center justify-center mb-4">
                <motion.div 
                  className="bg-gradient-to-br from-[#8B8173] to-[#6B6B6B] p-3 rounded-xl"
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                >
                  <Phone className="h-8 w-8 text-white" />
                </motion.div>
              </div>
              <h3 className="text-lg text-white mb-2 text-center">Línea de atención telefónica</h3>
              <p className="text-gray-400 text-sm text-center">
                Contáctanos a través de nuestra línea telefónica para resolver cualquier consulta o problema.
              </p>
            </motion.div>

            {/* Servicio 3 */}
            <motion.div 
              className="bg-white/5 backdrop-blur-sm p-6 rounded-xl border border-white/10 hover:bg-white/10 transition-all duration-300"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
              whileHover={{ scale: 1.05, y: -5 }}
            >
              <div className="flex items-center justify-center mb-4">
                <motion.div 
                  className="bg-gradient-to-br from-[#8B8173] to-[#6B6B6B] p-3 rounded-xl"
                  animate={{ y: [0, -5, 0] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                >
                  <MessageCircle className="h-8 w-8 text-white" />
                </motion.div>
              </div>
              <h3 className="text-lg text-white mb-2 text-center">Línea de atención celular</h3>
              <p className="text-gray-400 text-sm text-center">
                Estamos a tu disposición a través de nuestro número de celular para cualquier consulta o problema.
              </p>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Tercera Sección - Información y Contacto */}
      <div className="relative bg-white py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Información de SurtiCamisetas */}
            <motion.div 
              className="space-y-8"
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div>
                <h2 className="text-3xl lg:text-4xl text-gray-900 mb-4">Información de SurtiCamisetas</h2>
                <p className="text-gray-600 leading-relaxed">
                  Somos líderes en confección y personalización de camisetas con más de 15 años de experiencia. 
                  Ofrecemos productos de alta calidad en algodón 100% premium, poliéster y mezclas especiales 
                  para todo tipo de eventos: corporativos, deportivos, escolares y familiares.
                </p>
              </div>

              {/* Menú de navegación rápida */}
              <div className="grid grid-cols-2 gap-6">
                <motion.div 
                  className="bg-gray-50 p-6 rounded-xl hover:shadow-lg transition-all cursor-pointer border-l-4 border-gray-900"
                  whileHover={{ x: 5 }}
                  onClick={() => onNavigate('catalogo')}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="bg-gray-900 p-2 rounded-lg">
                      <Shirt className="h-5 w-5 text-white" />
                    </div>
                    <h3 className="text-lg text-gray-900">Catálogo</h3>
                  </div>
                  <p className="text-sm text-gray-600">
                    Explora nuestra amplia variedad de camisetas y diseños personalizados.
                  </p>
                </motion.div>

                <motion.div 
                  className="bg-gray-50 p-6 rounded-xl hover:shadow-lg transition-all cursor-pointer border-l-4 border-gray-900"
                  whileHover={{ x: 5 }}
                  onClick={() => onNavigate('nosotros')}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="bg-gray-900 p-2 rounded-lg">
                      <PenTool className="h-5 w-5 text-white" />
                    </div>
                    <h3 className="text-lg text-gray-900">Servicios</h3>
                  </div>
                  <p className="text-sm text-gray-600">
                    Conoce nuestros servicios de personalización y confección.
                  </p>
                </motion.div>

                <motion.div 
                  className="bg-gray-50 p-6 rounded-xl hover:shadow-lg transition-all cursor-pointer border-l-4 border-gray-900"
                  whileHover={{ x: 5 }}
                  onClick={() => onNavigate('nosotros')}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="bg-gray-900 p-2 rounded-lg">
                      <Users className="h-5 w-5 text-white" />
                    </div>
                    <h3 className="text-lg text-gray-900">Nosotros</h3>
                  </div>
                  <p className="text-sm text-gray-600">
                    Conoce nuestra historia, valores y equipo de trabajo profesional.
                  </p>
                </motion.div>

                <motion.div 
                  className="bg-gray-50 p-6 rounded-xl hover:shadow-lg transition-all cursor-pointer border-l-4 border-gray-900"
                  whileHover={{ x: 5 }}
                  onClick={() => onNavigate('contacto')}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="bg-gray-900 p-2 rounded-lg">
                      <MessageCircle className="h-5 w-5 text-white" />
                    </div>
                    <h3 className="text-lg text-gray-900">Contacto</h3>
                  </div>
                  <p className="text-sm text-gray-600">
                    Comunícate con nosotros para cotizaciones y asesoría personalizada.
                  </p>
                </motion.div>
              </div>

              {/* Información adicional */}
              <div className="bg-gradient-to-br from-gray-900 to-gray-800 p-6 rounded-xl text-white">
                <h3 className="text-xl mb-4">Â¿Por qué elegirnos?</h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <div className="bg-[#8B8173] p-1 rounded-full mt-1">
                      <svg className="h-3 w-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="text-sm">Telas de primera calidad certificadas</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="bg-[#8B8173] p-1 rounded-full mt-1">
                      <svg className="h-3 w-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="text-sm">Diseños personalizados sin costo adicional</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="bg-[#8B8173] p-1 rounded-full mt-1">
                      <svg className="h-3 w-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="text-sm">Entregas rápidas en todo el país</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="bg-[#8B8173] p-1 rounded-full mt-1">
                      <svg className="h-3 w-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="text-sm">Garantía de satisfacción 100%</span>
                  </li>
                </ul>
              </div>
            </motion.div>

            {/* Información de contacto y mapa */}
            <motion.div 
              className="space-y-6"
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              {/* Mapa placeholder con imagen */}
              <a 
                href="https://www.google.com/maps/place/Cra.+44+%23+37-67,+La+Candelaria,+Medell%C3%ADn,+La+Candelaria,+Medell%C3%ADn,+Antioquia/@6.237665,-75.569565,17z/data=!3m1!4b1!4m6!3m5!1s0x8e44284df232aded:0x29dff15cd02de6d2!8m2!3d6.237665!4d-75.569565!16s%2Fg%2F11x2m3y4mh?hl=es&entry=ttu&g_ep=EgoyMDI1MTEyMy4xIKXMDSoASAFQAw%3D%3D"
                target="_blank"
                rel="noopener noreferrer"
                className="block relative rounded-2xl h-64 lg:h-80 overflow-hidden shadow-xl hover:shadow-2xl transition-all"
              >
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1758876018643-71ee5951ab0a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBvZmZpY2UlMjBjb250YWN0fGVufDF8fHx8MTc2Mjk0NzY2MHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                  alt="Contact location"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex items-end justify-center pb-6">
                  <div className="bg-white backdrop-blur-sm px-6 py-3 rounded-full shadow-lg hover:bg-gray-50 transition-colors">
                    <p className="text-sm text-gray-900">ðŸ“ Tienda SurtiCamisetas</p>
                  </div>
                </div>
              </a>

              {/* Información de contacto */}
              <div className="bg-gray-50 p-8 rounded-2xl border border-gray-200">
                <h3 className="text-2xl text-gray-900 mb-6">NUESTRA SEDE</h3>
                
                <div className="space-y-5">
                  <motion.div 
                    className="flex items-start gap-4 p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow"
                    whileHover={{ x: 5 }}
                  >
                    <div className="bg-gray-900 p-3 rounded-lg flex-shrink-0">
                      <Package className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="text-gray-900 mb-1">Dirección:</p>
                      <p className="text-gray-600 text-sm">CL 42 CR 27- 45</p>
                      <p className="text-gray-600 text-sm">Medellín, Antioquia, Colombia</p>
                    </div>
                  </motion.div>

                  <motion.div 
                    className="flex items-start gap-4 p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow"
                    whileHover={{ x: 5 }}
                  >
                    <div className="bg-gray-900 p-3 rounded-lg flex-shrink-0">
                      <Phone className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="text-gray-900 mb-1">Teléfono:</p>
                      <p className="text-gray-600 text-sm">3218267514</p>
                    </div>
                  </motion.div>

                  <motion.div 
                    className="flex items-start gap-4 p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow"
                    whileHover={{ x: 5 }}
                  >
                    <div className="bg-gray-900 p-3 rounded-lg flex-shrink-0">
                      <Mail className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="text-gray-900 mb-1">Correo electrónico:</p>
                      <p className="text-gray-600 text-sm">surticamisetas@gmail.com</p>
                    </div>
                  </motion.div>

                  <motion.div 
                    className="flex items-start gap-4 p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow"
                    whileHover={{ x: 5 }}
                  >
                    <div className="bg-gray-900 p-3 rounded-lg flex-shrink-0">
                      <User className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="text-gray-900 mb-1">Contacto:</p>
                      <p className="text-gray-600 text-sm">Jonathan Montoya</p>
                    </div>
                  </motion.div>
                </div>

                {/* Horarios */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="flex items-center gap-3 mb-3">
                    <Clock className="h-5 w-5 text-gray-900" />
                    <h4 className="text-gray-900">Horarios de atención:</h4>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div>
                      <p className="text-gray-900">Lunes - Sábado:</p>
                      <p className="text-gray-600">8:00 AM - 5:00 PM</p>
                    </div>
                    <div className="pt-2 border-t border-gray-100">
                      <p className="text-red-600">No trabajamos domingos ni festivos</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer onNavigate={onNavigate} />
    </div>
  );
}




import { NavigationBar } from './NavigationBar';
import { Footer } from './Footer';
import { VideoCarousel } from './VideoCarousel';
import { User, Sparkles, Zap, Crown, Palette, Cog, Headphones, Target, Eye, Heart } from 'lucide-react';
import { User as UserType } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import logoWhite from 'figma:asset/bbd6b9715c11e30fd86dca5ed1c93fd1d8ff5eea.png';

interface AboutPageProps {
  onNavigate: (page: string) => void;
  currentUser?: UserType | null;
  onCartClick: () => void;
  cartItemCount?: number;
}

export function AboutPage({ onNavigate, currentUser, onCartClick, cartItemCount }: AboutPageProps) {
  const [expandedCard, setExpandedCard] = useState<'mission' | 'vision' | 'values' | null>(null);

  const team = [
    {
      name: 'Carlos Mendoza',
      role: 'Director General',
      description: 'Fundador con 15 años de experiencia en la industria textil.',
      icon: Crown
    },
    {
      name: 'María González',
      role: 'Diseñadora Jefe',
      description: 'Especialista en diseño gráfico y personalización de productos.',
      icon: Palette
    },
    {
      name: 'Juan Pérez',
      role: 'Jefe de Producción',
      description: 'Experto en técnicas de impresión y control de calidad.',
      icon: Cog
    },
    {
      name: 'Ana López',
      role: 'Atención al Cliente',
      description: 'Dedicada a hacer realidad tu visión con el mejor servicio.',
      icon: Headphones
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <NavigationBar 
        onNavigate={onNavigate}
        currentUser={currentUser}
        activePage="nosotros"
        onCartClick={onCartClick}
        cartItemCount={cartItemCount}
      />

      {/* Carrusel de Videos - Justo debajo del Nav */}
      <VideoCarousel onNavigate={onNavigate} />

      {/* Hero Section con Título */}
      <section className="bg-white py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <h1 className="text-gray-900 mb-4">Sobre Nosotros</h1>
            </motion.div>
            <motion.p 
              className="text-gray-600 max-w-3xl mx-auto text-lg"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              En SurtiCamisetas somos expertos en confección y personalización de camisetas para todas las edades. 
              Convertimos tus ideas en realidad con calidad, creatividad y el mejor servicio.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Mission, Vision & Values */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-6">
            {/* Misión */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="bg-gradient-to-br from-[#E8F4F8] to-[#D4E8F0] rounded-2xl p-8 shadow-md hover:shadow-lg transition-all duration-300 border border-[#B8D9E8]"
            >
              <div className="text-center">
                <motion.div 
                  className="w-16 h-16 bg-gradient-to-br from-[#5A9FBD] to-[#4A8CAD] rounded-full flex items-center justify-center mx-auto mb-4 shadow-md"
                  whileHover={{ scale: 1.1, rotate: 360 }}
                  transition={{ duration: 0.6 }}
                >
                  <Target className="h-8 w-8 text-white" />
                </motion.div>
                <h3 className="text-gray-900 text-2xl mb-4">Misión</h3>
                <p className="text-gray-700 leading-relaxed">
                  Confeccionar ropa de excelente calidad a la medida, superando las expectativas de nuestros clientes.
                </p>
              </div>
            </motion.div>

            {/* Visión */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="bg-gradient-to-br from-[#E8F4F8] to-[#D4E8F0] rounded-2xl p-8 shadow-md hover:shadow-lg transition-all duration-300 border border-[#B8D9E8]"
            >
              <div className="text-center">
                <motion.div 
                  className="w-16 h-16 bg-gradient-to-br from-[#5A9FBD] to-[#4A8CAD] rounded-full flex items-center justify-center mx-auto mb-4 shadow-md"
                  whileHover={{ scale: 1.1, rotate: 360 }}
                  transition={{ duration: 0.6 }}
                >
                  <Eye className="h-8 w-8 text-white" />
                </motion.div>
                <h3 className="text-gray-900 text-2xl mb-4">Visión</h3>
                <p className="text-gray-700 leading-relaxed">
                  Ser líder Nacional para el 2030 en ropa y accesorios con innovación constante y productos de excelente calidad.
                </p>
              </div>
            </motion.div>

            {/* Valores */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-gradient-to-br from-[#E8F4F8] to-[#D4E8F0] rounded-2xl p-8 shadow-md hover:shadow-lg transition-all duration-300 border border-[#B8D9E8]"
            >
              <div className="text-center">
                <motion.div 
                  className="w-16 h-16 bg-gradient-to-br from-[#5A9FBD] to-[#4A8CAD] rounded-full flex items-center justify-center mx-auto mb-4 shadow-md"
                  whileHover={{ scale: 1.1, rotate: 360 }}
                  transition={{ duration: 0.6 }}
                >
                  <Heart className="h-8 w-8 text-white" />
                </motion.div>
                <h3 className="text-gray-900 text-2xl mb-4">Valores</h3>
                <p className="text-gray-700 leading-relaxed">
                  <strong>Calidad</strong> en nuestros proyectos • <strong>Innovación</strong> continua • <strong>Coherencia</strong> entre compromiso y ejecución • <strong>Confianza</strong> y <strong>compromiso</strong> con nuestros clientes.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-16 bg-[#FAFAF9]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-10"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-gray-900 mb-3">Nuestro Equipo</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Profesionales apasionados comprometidos con tu satisfacción
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {team.map((member, index) => {
              return (
                <motion.div 
                  key={index} 
                  className="bg-[#FAFAF9] p-6 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 group cursor-pointer border border-gray-200"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ y: -4 }}
                >
                  <div className="flex items-center gap-5">
                    <motion.div 
                      className="w-16 h-16 bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md"
                      whileHover={{ scale: 1.1, rotate: 360 }}
                      transition={{ duration: 0.6 }}
                    >
                      <member.icon className="h-8 w-8 text-white" />
                    </motion.div>
                    <div className="flex-1 text-left">
                      <h3 className="text-gray-900 mb-1 group-hover:text-gray-700 transition-colors">{member.name}</h3>
                      <p className="text-gray-600 text-sm mb-1.5">{member.role}</p>
                      <p className="text-gray-500 text-sm leading-relaxed">{member.description}</p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-[#8FA5BA] via-[#A3B5C8] to-[#B7C7D6] relative overflow-hidden">
        {/* Elementos decorativos animados */}
        <motion.div
          className="absolute top-0 right-0 w-96 h-96 bg-white/30 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          className="absolute bottom-0 left-0 w-96 h-96 bg-white/30 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.5, 0.3, 0.5],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <motion.div
              className="inline-flex items-center gap-2 bg-white/40 backdrop-blur-sm px-4 py-2 rounded-full mb-6"
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <Sparkles className="h-5 w-5 text-gray-800" />
              <span className="text-gray-800 text-sm">Tu proyecto comienza aquí</span>
            </motion.div>
            
            <h2 className="text-gray-900 mb-4 text-4xl lg:text-5xl">Â¿Listo para crear tu camiseta personalizada?</h2>
            <p className="text-gray-800 mb-8 max-w-2xl mx-auto text-lg">
              Contáctanos hoy y trabajemos juntos en tu próximo proyecto. Calidad garantizada y entrega rápida.
            </p>
            
            <motion.button 
              onClick={() => onNavigate('contacto')}
              className="bg-[#16a34a] text-white px-10 py-4 rounded-full hover:bg-[#15803d] active:bg-[#15803d] transition-all shadow-xl text-lg inline-flex items-center gap-3 group"
              whileHover={{ scale: 1.05, y: -3 }}
              whileTap={{ scale: 0.95, backgroundColor: '#15803d' }}
            >
              Contáctanos Ahora
              <Zap className="h-5 w-5 group-hover:rotate-12 transition-transform" />
            </motion.button>
          </motion.div>
        </div>
      </section>

      <Footer onNavigate={onNavigate} />
    </div>
  );
}




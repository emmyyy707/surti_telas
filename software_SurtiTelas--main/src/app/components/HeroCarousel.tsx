import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import carouselImage1 from 'figma:asset/8279254f3b4fd8676889fd44d0601c47b069d440.png';
import carouselImage2 from 'figma:asset/504d3b1a49ac36be7cb79495797cfadb4e44422b.png';
import carouselImage3 from 'figma:asset/5416fa68ef6c02265c45d36f944f7bae6eca5e9e.png';

interface Slide {
  id: number;
  title: string;
  description: string;
  primaryButton: string;
  secondaryButton?: string;
  onPrimaryClick: () => void;
  onSecondaryClick?: () => void;
  backgroundColor: string;
  image: string;
}

interface HeroCarouselProps {
  onNavigate: (page: string) => void;
}

export function HeroCarousel({ onNavigate }: HeroCarouselProps) {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides: Slide[] = [
    {
      id: 1,
      title: 'Da vida a tus ideas.',
      description: 'Personaliza tus camisetas con diseños únicos y calidad premium.',
      primaryButton: 'Comienza gratis',
      onPrimaryClick: () => onNavigate('registrarse'),
      backgroundColor: 'from-[#3D3D3D] via-[#6B6B6B] to-[#999999]',
      image: carouselImage1,
    },
    {
      id: 2,
      title: 'Personalización única.',
      description: 'Diseños exclusivos para cada ocasión. Calidad que destaca.',
      primaryButton: 'Ver Catálogo',
      secondaryButton: 'Nosotros',
      onPrimaryClick: () => onNavigate('catalogo'),
      onSecondaryClick: () => onNavigate('nosotros'),
      backgroundColor: 'from-[#2C2C2C] via-[#5A5A5A] to-[#888888]',
      image: carouselImage2,
    },
    {
      id: 3,
      title: 'Calidad profesional.',
      description: 'Los mejores materiales. Entregas rápidas. Servicio personalizado.',
      primaryButton: 'Solicitar Cotización',
      secondaryButton: 'Contáctanos',
      onPrimaryClick: () => window.open('https://wa.me/573001234567?text=Hola,%20me%20gustaría%20solicitar%20una%20cotización', '_blank'),
      onSecondaryClick: () => onNavigate('contacto'),
      backgroundColor: 'from-[#4A4A4A] via-[#787878] to-[#A5A5A5]',
      image: carouselImage3,
    },
  ];

  // Auto-advance slides every 5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [slides.length]);

  return (
    <div className="relative overflow-hidden h-[500px] md:h-[600px] lg:h-[700px]">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSlide}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
          className="absolute inset-0"
        >
          {/* Imagen de fondo completa */}
          <motion.img
            src={slides[currentSlide].image}
            alt={slides[currentSlide].title}
            className="absolute inset-0 w-full h-full object-cover"
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
          />

          {/* Overlay oscuro con gradiente vertical para mejor legibilidad */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/70 to-black/40"></div>
          
          {/* Contenido centrado - Texto y Botones */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
              <motion.div
                className="text-white space-y-8 max-w-4xl mx-auto text-center"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <motion.h1
                  className="text-5xl sm:text-6xl lg:text-8xl leading-tight tracking-tight"
                  style={{
                    fontFamily: "'Poppins', sans-serif",
                    fontWeight: 700,
                    textShadow: '0 0 40px rgba(0,0,0,0.9), 0 0 20px rgba(0,0,0,0.8), 0 4px 12px rgba(0,0,0,0.7)',
                    WebkitTextStroke: '1px rgba(0,0,0,0.3)',
                  }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.3 }}
                >
                  {slides[currentSlide].title}
                </motion.h1>
                <motion.p
                  className="text-xl sm:text-2xl lg:text-3xl leading-relaxed max-w-3xl mx-auto"
                  style={{
                    fontFamily: "'Poppins', sans-serif",
                    fontWeight: 400,
                    textShadow: '0 0 30px rgba(0,0,0,0.9), 0 0 15px rgba(0,0,0,0.8), 0 2px 8px rgba(0,0,0,0.6)',
                  }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                >
                  {slides[currentSlide].description}
                </motion.p>
                <motion.div
                  className="flex flex-col sm:flex-row gap-5 pt-4 justify-center"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.5 }}
                >
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      size="lg"
                      onClick={slides[currentSlide].onPrimaryClick}
                      style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 600 }}
                      className="bg-white hover:bg-gray-100 text-black px-12 py-8 rounded-full shadow-2xl w-full sm:w-auto text-xl"
                    >
                      {slides[currentSlide].primaryButton}
                    </Button>
                  </motion.div>
                  {slides[currentSlide].secondaryButton && (
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button
                        size="lg"
                        variant="outline"
                        style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 500 }}
                        className="bg-black/40 backdrop-blur-sm border-2 border-white hover:bg-black/60 text-white px-12 py-8 rounded-full w-full sm:w-auto text-xl"
                        onClick={slides[currentSlide].onSecondaryClick}
                      >
                        {slides[currentSlide].secondaryButton}
                      </Button>
                    </motion.div>
                  )}
                </motion.div>
              </motion.div>
            </div>
          </div>

          {/* Decoración de círculos en el fondo con animación */}
          <motion.div
            className="absolute top-0 right-0 w-[600px] h-[600px] bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.1, 0.2, 0.1],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
          <motion.div
            className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-white/5 rounded-full blur-3xl translate-y-1/2"
            animate={{
              scale: [1, 1.15, 1],
              opacity: [0.05, 0.15, 0.05],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        </motion.div>
      </AnimatePresence>

      {/* Indicadores de slides */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex gap-3 z-10">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`transition-all duration-300 rounded-full ${
              index === currentSlide
                ? 'bg-white w-12 h-3'
                : 'bg-white/40 w-3 h-3 hover:bg-white/60'
            }`}
            aria-label={`Ir a slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}




import { Button } from './ui/button';
import { Card } from './ui/card';
import { NavigationBar } from './NavigationBar';
import { Footer } from './Footer';
import { User } from '../types';
import { motion } from 'framer-motion';
import { Mail, MessageCircle, MapPin, Phone, Clock, ExternalLink } from 'lucide-react';

interface ContactPageProps {
  onNavigate: (page: string) => void;
  currentUser?: User | null;
  onCartClick: () => void;
  cartItemCount?: number;
}

export function ContactPage({ onNavigate, currentUser, onCartClick, cartItemCount }: ContactPageProps) {
  const handleEmailClick = () => {
    window.location.href = 'mailto:surticamisetas@gmail.com?subject=Consulta desde la web&body=Hola, me gustaría obtener más información sobre...';
  };

  const handleWhatsAppClick = () => {
    const phoneNumber = '573218267514'; // Número sin espacios ni caracteres especiales
    const message = encodeURIComponent('Hola, me gustaría obtener más información sobre sus productos.');
    window.open(`https://wa.me/${phoneNumber}?text=${message}`, '_blank');
  };

  const handleLocationClick = () => {
    // Coordenadas para Medellín, Antioquia - CL 42 CR 27-45
    window.open('https://www.google.com/maps/search/?api=1&query=CL+42+CR+27-45+Medellín+Antioquia+Colombia', '_blank');
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="fixed top-0 left-0 right-0 z-50">
        <NavigationBar 
          onNavigate={onNavigate} 
          currentUser={currentUser}
          activePage="contacto"
          onCartClick={onCartClick}
          cartItemCount={cartItemCount}
        />
      </div>
      <div className="h-20"></div>
      
      <div className="py-12 sm:py-16 md:py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          {/* Header */}
          <motion.div 
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl sm:text-5xl md:text-6xl mb-4 text-black">Contáctanos</h1>
            <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
              Estamos aquí para ayudarte. Elige el medio de contacto que prefieras
            </p>
          </motion.div>

          {/* Botones de Acción Rápida */}
          <motion.div 
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-12 max-w-5xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Button
              onClick={handleEmailClick}
              className="bg-black text-white hover:bg-gray-800 h-16 text-lg group"
            >
              <Mail className="h-5 w-5 mr-3 group-hover:scale-110 transition-transform" />
              Enviar Email
              <ExternalLink className="h-4 w-4 ml-2 opacity-0 group-hover:opacity-100 transition-opacity" />
            </Button>

            <Button
              onClick={handleWhatsAppClick}
              className="bg-green-600 text-white hover:bg-green-700 h-16 text-lg group"
            >
              <MessageCircle className="h-5 w-5 mr-3 group-hover:scale-110 transition-transform" />
              WhatsApp
              <ExternalLink className="h-4 w-4 ml-2 opacity-0 group-hover:opacity-100 transition-opacity" />
            </Button>

            <Button
              onClick={handleLocationClick}
              className="bg-blue-600 text-white hover:bg-blue-700 h-16 text-lg group sm:col-span-2 lg:col-span-1"
            >
              <MapPin className="h-5 w-5 mr-3 group-hover:scale-110 transition-transform" />
              Ver Ubicación
              <ExternalLink className="h-4 w-4 ml-2 opacity-0 group-hover:opacity-100 transition-opacity" />
            </Button>
          </motion.div>

          {/* Información de Contacto */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto mb-12">
            {/* Teléfono */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <Card className="p-6 sm:p-8 hover:shadow-xl transition-all bg-white border-2 border-gray-100 h-full">
                <div className="flex items-start gap-4">
                  <div className="bg-black text-white w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Phone className="h-7 w-7" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl mb-3 text-black">Teléfono</h3>
                    <div className="space-y-2">
                      <a 
                        href="tel:+573218267514"
                        className="block text-gray-700 hover:text-black transition-colors text-lg"
                      >
                        +57 321 826 7514
                      </a>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* Email */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <Card className="p-6 sm:p-8 hover:shadow-xl transition-all bg-white border-2 border-gray-100 h-full">
                <div className="flex items-start gap-4">
                  <div className="bg-black text-white w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Mail className="h-7 w-7" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl mb-3 text-black">Correo Electrónico</h3>
                    <div className="space-y-2">
                      <a 
                        href="mailto:surticamisetas@gmail.com"
                        className="block text-gray-700 hover:text-black transition-colors break-all"
                      >
                        surticamisetas@gmail.com
                      </a>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* Ubicación */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              <Card className="p-6 sm:p-8 hover:shadow-xl transition-all bg-white border-2 border-gray-100 h-full">
                <div className="flex items-start gap-4">
                  <div className="bg-black text-white w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0">
                    <MapPin className="h-7 w-7" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl mb-3 text-black">Ubicación</h3>
                    <div className="space-y-1 text-gray-700">
                      <p className="text-lg">CL 42 CR 27- 45</p>
                      <p className="text-lg">Medellín, Antioquia, Colombia</p>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* Horario */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <Card className="p-6 sm:p-8 hover:shadow-xl transition-all bg-black text-white border-2 border-black h-full">
                <div className="flex items-start gap-4">
                  <div className="bg-white text-black w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Clock className="h-7 w-7" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl mb-4">Horario de Atención</h3>
                    <div className="space-y-2 text-gray-300">
                      <div className="flex justify-between items-center">
                        <span>Lunes - Sábado</span>
                        <span className="text-white">8:00 AM - 5:00 PM</span>
                      </div>
                      <div className="pt-2 border-t border-gray-700">
                        <span className="text-red-400">No trabajamos domingos ni festivos</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
      
      <Footer onNavigate={onNavigate} />
    </div>
  );
}





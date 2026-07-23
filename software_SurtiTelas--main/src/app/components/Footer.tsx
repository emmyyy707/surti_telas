import { Shirt, Facebook, Twitter, Linkedin, Instagram, MessageCircle, ChevronRight, MapPin, Phone, Mail } from 'lucide-react';
import { motion } from 'framer-motion';
import logoWhite from 'figma:asset/f514387f1aa60fb986c5bf8e591cbe42bfd2b885.png';
import logoSurtitela from 'figma:asset/b904727ced6c593fec13aee98655e5bc8a0e485e.png';

interface FooterProps {
  onNavigate: (page: string) => void;
}

export function Footer({ onNavigate }: FooterProps) {
  return (
    <footer className="bg-[#000000] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
          {/* Columna 1 - Logo y descripción */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="mb-4 flex items-center gap-4">
              <div className="w-28 h-auto flex items-center justify-center">
                <img 
                  src={logoWhite} 
                  alt="SurtiCamisetas" 
                  className="w-full h-auto object-contain"
                />
              </div>
              {/* Logo Surtitela en cuadrito */}
              <motion.div 
                className="bg-white rounded-lg overflow-hidden shadow-lg"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.3 }}
              >
                <div className="w-24 h-24">
                  <img 
                    src={logoSurtitela} 
                    alt="Surtitela" 
                    className="w-full h-full object-cover"
                  />
                </div>
              </motion.div>
            </div>
            <p className="text-gray-400 text-sm mb-4">
              Confección y personalización de camisetas para todas las edades. Calidad y estilo en cada prenda.
            </p>
            <div className="flex gap-3">
              <motion.a
                href="https://www.instagram.com/surticamisetas_premium?igsh=dGtra2NicGZ5aDhu"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white/10 p-2 rounded-full hover:bg-[#8B8173] transition-colors"
                whileHover={{ scale: 1.1, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <Instagram className="h-5 w-5" />
              </motion.a>
              <motion.a
                href="https://wa.me/573218267514"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white/10 p-2 rounded-full hover:bg-[#8B8173] transition-colors"
                whileHover={{ scale: 1.1, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <MessageCircle className="h-5 w-5" />
              </motion.a>
            </div>
          </motion.div>

          {/* Columna 2 - Enlaces rápidos */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <h3 className="text-lg mb-4">Enlaces Rápidos</h3>
            <ul className="space-y-2">
              <li>
                <motion.a
                  href="#"
                  onClick={(e) => { e.preventDefault(); onNavigate('inicio'); }}
                  className="text-gray-400 hover:text-[#8B8173] transition-colors text-sm cursor-pointer"
                  whileHover={{ x: 5 }}
                >
                  Inicio
                </motion.a>
              </li>
              <li>
                <motion.a
                  href="#"
                  onClick={(e) => { e.preventDefault(); onNavigate('catalogo'); }}
                  className="text-gray-400 hover:text-[#8B8173] transition-colors text-sm cursor-pointer"
                  whileHover={{ x: 5 }}
                >
                  Catálogo
                </motion.a>
              </li>
              <li>
                <motion.a
                  href="#"
                  onClick={(e) => { e.preventDefault(); onNavigate('nosotros'); }}
                  className="text-gray-400 hover:text-[#8B8173] transition-colors text-sm cursor-pointer"
                  whileHover={{ x: 5 }}
                >
                  Nosotros
                </motion.a>
              </li>
              <li>
                <motion.a
                  href="#"
                  onClick={(e) => { e.preventDefault(); onNavigate('contacto'); }}
                  className="text-gray-400 hover:text-[#8B8173] transition-colors text-sm cursor-pointer"
                  whileHover={{ x: 5 }}
                >
                  Contacto
                </motion.a>
              </li>
              <li>
                <motion.a
                  href="#"
                  onClick={(e) => { e.preventDefault(); onNavigate('login'); }}
                  className="text-gray-400 hover:text-[#8B8173] transition-colors text-sm cursor-pointer"
                  whileHover={{ x: 5 }}
                >
                  Iniciar Sesión
                </motion.a>
              </li>
              <li>
                <motion.a
                  href="#"
                  onClick={(e) => { e.preventDefault(); onNavigate('registro'); }}
                  className="text-gray-400 hover:text-[#8B8173] transition-colors text-sm cursor-pointer"
                  whileHover={{ x: 5 }}
                >
                  Registrarse
                </motion.a>
              </li>
            </ul>
          </motion.div>

          {/* Columna 3 - Contacto */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <h3 className="text-lg mb-4">Contacto</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-[#8B8173] flex-shrink-0 mt-0.5" />
                <span className="text-gray-400 text-sm">
                  CL 42 CR 27- 45<br />
                  Medellín, Antioquia
                </span>
              </li>
              <li className="flex items-start gap-3">
                <Phone className="h-5 w-5 text-[#8B8173] flex-shrink-0 mt-0.5" />
                <span className="text-gray-400 text-sm">
                  3218267514
                </span>
              </li>
              <li className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-[#8B8173] flex-shrink-0 mt-0.5" />
                <span className="text-gray-400 text-sm">
                  surticamisetas@gmail.com
                </span>
              </li>
              <li className="flex items-start gap-3">
                <MessageCircle className="h-5 w-5 text-[#8B8173] flex-shrink-0 mt-0.5" />
                <span className="text-gray-400 text-sm">
                  Jonathan Montoya
                </span>
              </li>
            </ul>
          </motion.div>
        </div>

        {/* Línea separadora */}
        <motion.div 
          className="border-t border-white/10 pt-8"
          initial={{ opacity: 0, scaleX: 0 }}
          whileInView={{ opacity: 1, scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <motion.p 
              className="text-gray-400 text-sm"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              Â© 2025 SurtiCamisetas. Todos los derechos reservados.
            </motion.p>
            <motion.div 
              className="flex gap-6"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <motion.a
                href="#"
                className="text-gray-400 hover:text-[#8B8173] transition-colors text-sm"
                whileHover={{ y: -2 }}
              >
                Términos y condiciones
              </motion.a>
              <motion.a
                href="#"
                className="text-gray-400 hover:text-[#8B8173] transition-colors text-sm"
                whileHover={{ y: -2 }}
              >
                Política de privacidad
              </motion.a>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </footer>
  );
}




import { motion } from 'framer-motion';
import { ImageWithFallback } from './figma/ImageWithFallback';

const images = [
  {
    src: 'https://images.unsplash.com/photo-1641573335229-331ef3e6a2b7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb2xvcmZ1bCUyMHRzaGlydCUyMGRlc2lnbnxlbnwxfHx8fDE3NjI5NTM5NjF8MA&ixlib=rb-4.1.0&q=80&w=1080',
    alt: 'Camiseta colorida'
  },
  {
    src: 'https://images.unsplash.com/photo-1723853310542-a9d2d84f5fa2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjdXN0b20lMjBwcmludGVkJTIwc2hpcnR8ZW58MXx8fHwxNzYyOTY0MjU3fDA&ixlib=rb-4.1.0&q=80&w=1080',
    alt: 'Camiseta personalizada'
  },
  {
    src: 'https://images.unsplash.com/photo-1666358085449-a10a39f33942?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0cmVuZHklMjB0c2hpcnQlMjBtb2NrdXB8ZW58MXx8fHwxNzYyOTY0MjU4fDA&ixlib=rb-4.1.0&q=80&w=1080',
    alt: 'Mockup de camiseta'
  },
  {
    src: 'https://images.unsplash.com/photo-1605523741161-4addbe97e50d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmYXNoaW9uJTIwdHNoaXJ0JTIwZGlzcGxheXxlbnwxfHx8fDE3NjI5MDk1Mjd8MA&ixlib=rb-4.1.0&q=80&w=1080',
    alt: 'Camiseta fashion'
  },
  {
    src: 'https://images.unsplash.com/photo-1655141559787-25ac8cfca72f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxncmFwaGljJTIwdGVlJTIwZGVzaWdufGVufDF8fHx8MTc2Mjg4MjAyNXww&ixlib=rb-4.1.0&q=80&w=1080',
    alt: 'Diseño gráfico'
  },
  {
    src: 'https://images.unsplash.com/photo-1666358070731-f5bd1ef7d17b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxicmFuZGVkJTIwY2xvdGhpbmclMjBtb2NrdXB8ZW58MXx8fHwxNzYyOTY0MjU5fDA&ixlib=rb-4.1.0&q=80&w=1080',
    alt: 'Ropa de marca'
  },
];

export function ScrollingImages() {
  return (
    <div className="relative overflow-hidden h-[420px] w-full">
      {/* Contenedor sin padding para maximizar espacio */}
      <div className="absolute inset-0">
        {/* Columna de imágenes con animación */}
        <motion.div
          className="flex flex-col gap-2"
          animate={{
            y: [0, -1400], // Ajustado para el nuevo gap y tamaño
          }}
          transition={{
            y: {
              repeat: Infinity,
              repeatType: "loop",
              duration: 20,
              ease: "linear",
            },
          }}
        >
          {/* Primera ronda de imágenes */}
          {images.map((image, index) => (
            <div
              key={`first-${index}`}
              className="bg-white rounded-xl shadow-2xl overflow-hidden w-full h-[230px] flex-shrink-0"
            >
              <ImageWithFallback
                src={image.src}
                alt={image.alt}
                className="w-full h-full object-cover"
              />
            </div>
          ))}
          {/* Segunda ronda de imágenes para crear loop infinito */}
          {images.map((image, index) => (
            <div
              key={`second-${index}`}
              className="bg-white rounded-xl shadow-2xl overflow-hidden w-full h-[230px] flex-shrink-0"
            >
              <ImageWithFallback
                src={image.src}
                alt={image.alt}
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </motion.div>
      </div>

      {/* Gradientes para fade effect en top y bottom - más cortos */}
      <div className="absolute top-0 left-0 right-0 h-12 bg-gradient-to-b from-[#6B6B6B] to-transparent pointer-events-none z-10"></div>
      <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-[#6B6B6B] to-transparent pointer-events-none z-10"></div>
    </div>
  );
}




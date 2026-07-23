import { motion } from 'framer-motion';
import { Loader2, ShoppingBag } from 'lucide-react';
import logoBlack from 'figma:asset/6b1b01bec62a36f96143e42f8161cda0f047b918.png';

interface LoadingScreenProps {
  message?: string;
}

export function LoadingScreen({ message = 'Cargando...' }: LoadingScreenProps) {
  return (
    <div className="fixed inset-0 bg-white z-50 flex items-center justify-center px-4">
      <div className="flex flex-col items-center gap-4 sm:gap-5 md:gap-6 max-w-sm w-full">
        {/* Logo with animation - Responsivo */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="relative"
        >
          <div className="w-28 h-auto flex items-center justify-center">
            <img
              src={logoBlack}
              alt="SurtiCamisetas"
              className="w-full h-auto object-contain"
            />
          </div>
        </motion.div>

        {/* Animated icon - Responsivo */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
        >
          <ShoppingBag className="h-10 w-10 sm:h-11 sm:w-11 md:h-12 md:w-12 text-gray-800" />
        </motion.div>

        {/* Loading dots - Responsivo */}
        <div className="flex gap-1.5 sm:gap-2">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-black rounded-full"
              animate={{
                y: [0, -10, 0],
              }}
              transition={{
                duration: 0.6,
                repeat: Infinity,
                delay: i * 0.15,
              }}
            />
          ))}
        </div>

        {/* Loading message - Responsivo */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-gray-600 text-sm sm:text-base text-center"
        >
          {message}
        </motion.p>
      </div>
    </div>
  );
}




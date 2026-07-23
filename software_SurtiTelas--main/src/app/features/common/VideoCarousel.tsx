// -------------------------------------------------------
// VideoCarousel Mejorado - Compatible con:
// - youtube:VIDEO_ID
// - URLs completas de Shorts y YouTube normales
// - Videos MP4 locales
// -------------------------------------------------------

import { useState } from 'react';
import { ChevronLeft, ChevronRight, Volume2, VolumeX, Play } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface VideoCarouselProps {
  onNavigate?: (page: string) => void;
}

export function VideoCarousel({ onNavigate }: VideoCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(true);

  // -----------------------------
  // FUNCIÓN ROBUSTA PARA OBTENER EL ID
  // -----------------------------
  const extractYouTubeId = (url: string) => {
    // Caso 1: formato "youtube:ID"
    if (url.startsWith("youtube:")) {
      return url.replace("youtube:", "");
    }

    // Caso 2: URL corta youtu.be
    if (url.includes("youtu.be/")) {
      return url.split("youtu.be/")[1].split("?")[0];
    }

    // Caso 3: Shorts
    if (url.includes("youtube.com/shorts/")) {
      return url.split("shorts/")[1].split("?")[0];
    }

    // Caso 4: URL estándar
    const match = url.match(/v=([^&]+)/);
    if (match && match[1]) return match[1];

    return null;
  };

  // -----------------------------
  // VIDEOS
  // -----------------------------
  const videos = [
    {
      id: 1,
      src: "https://www.youtube.com/shorts/An78GjQ3W2c?feature=share",
      title: "SurtiCamisetas - Nuestro Proceso",
      type: "youtube",
    },
  ];

  const nextSlide = () => setCurrentIndex((prev) => (prev + 1) % videos.length);
  const prevSlide = () => setCurrentIndex((prev) => (prev - 1 + videos.length) % videos.length);

  const currentVideo = videos[currentIndex];
  const youtubeId = extractYouTubeId(currentVideo.src);

  return (
    <div className="relative py-8 sm:py-12 px-4 sm:px-6 lg:px-8 bg-[#000000]">
      {/* Contenedor con marco decorativo */}
      <div className="max-w-7xl mx-auto">
        {/* Marco exterior con sombra */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative"
        >
          {/* Elementos decorativos en las esquinas */}
          <div className="absolute -top-2 -left-2 w-12 h-12 border-l-4 border-t-4 border-white/30 rounded-tl-lg z-20" />
          <div className="absolute -top-2 -right-2 w-12 h-12 border-r-4 border-t-4 border-white/30 rounded-tr-lg z-20" />
          <div className="absolute -bottom-2 -left-2 w-12 h-12 border-l-4 border-b-4 border-white/30 rounded-bl-lg z-20" />
          <div className="absolute -bottom-2 -right-2 w-12 h-12 border-r-4 border-b-4 border-white/30 rounded-br-lg z-20" />

          {/* Resplandor de fondo */}
          <div className="absolute -inset-1 bg-gradient-to-r from-white/20 via-neutral-400/20 to-white/20 rounded-2xl blur-xl opacity-50" />

          {/* Contenedor del video con sombra profunda */}
          <div className="relative bg-black rounded-xl overflow-hidden shadow-2xl border border-white/10">
            {/* Borde interior brillante */}
            <div className="absolute inset-0 rounded-xl ring-1 ring-inset ring-white/20 pointer-events-none z-10" />
            
            <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentIndex}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                  className="absolute top-0 left-0 w-full h-full"
                >
                  {/* Si es YouTube */}
                  {currentVideo.type === "youtube" && youtubeId ? (
                    <iframe
                      className="w-full h-full"
                      src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&loop=1&mute=${
                        isMuted ? 1 : 0
                      }&controls=0&playlist=${youtubeId}&playsinline=1&rel=0&modestbranding=1`}
                      title={currentVideo.title}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      style={{ border: "none" }}
                    />
                  ) : (
                    <video className="w-full h-full object-cover" autoPlay loop muted={isMuted} playsInline>
                      <source src={currentVideo.src} type="video/mp4" />
                    </video>
                  )}

                  {/* Overlay con gradiente mejorado */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />
                  
                  {/* Borde de luz sutil en el borde inferior */}
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-white/30 to-transparent pointer-events-none" />

                  {/* Título con efecto de cristal */}
                  <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8 lg:p-10 pointer-events-none">
                    <motion.div
                      initial={{ y: 30, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.4, duration: 0.6 }}
                      className="backdrop-blur-sm bg-black/30 rounded-lg p-4 border border-white/10"
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                          <Play className="h-5 w-5 text-white fill-white" />
                        </div>
                        <h2 className="text-white text-xl sm:text-2xl md:text-3xl">
                          {currentVideo.title}
                        </h2>
                      </div>
                      <p className="text-white/70 text-sm sm:text-base">
                        Descubre la calidad y pasión detrás de cada prenda
                      </p>
                    </motion.div>
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Botones de navegación mejorados */}
              {videos.length > 1 && (
                <>
                  <motion.button
                    whileHover={{ scale: 1.1, x: -5 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={prevSlide}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/10 backdrop-blur-md hover:bg-white/20 text-white p-4 rounded-full transition-all z-20 border border-white/20 shadow-xl"
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.1, x: 5 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={nextSlide}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/10 backdrop-blur-md hover:bg-white/20 text-white p-4 rounded-full transition-all z-20 border border-white/20 shadow-xl"
                  >
                    <ChevronRight className="h-6 w-6" />
                  </motion.button>

                  {/* Indicadores mejorados */}
                  <div className="absolute bottom-20 sm:bottom-24 left-1/2 -translate-x-1/2 flex gap-2 z-20">
                    {videos.map((_, index) => (
                      <motion.button
                        key={index}
                        whileHover={{ scale: 1.2 }}
                        onClick={() => setCurrentIndex(index)}
                        className={`h-2 rounded-full transition-all backdrop-blur-sm ${
                          index === currentIndex
                            ? 'bg-white w-10 shadow-lg shadow-white/50'
                            : 'bg-white/40 w-2 hover:bg-white/60'
                        }`}
                      />
                    ))}
                  </div>
                </>
              )}

              {/* Botón de sonido mejorado */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsMuted(!isMuted)}
                className="absolute top-4 right-4 bg-white/10 backdrop-blur-md hover:bg-white/20 text-white p-3 rounded-full transition-all z-20 border border-white/20 shadow-xl"
              >
                {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}





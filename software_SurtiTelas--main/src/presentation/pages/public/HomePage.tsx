import React, { useState, ReactNode } from 'react';
import {
  Shirt,
  Scissors,
  Layers,
  Truck,
  Warehouse,
  ArrowRight,
  Zap,
  AlertCircle,
  MessageSquare,
  ClipboardList,
  Clock,
  ChevronLeft,
  ChevronRight,
  Smartphone,
  Eye
} from 'lucide-react';

import { useNavigate } from 'react-router-dom';

import '../styles/App.css';

/* =========================
  TYPES
========================= */

interface ChallengeItem {
  id: string;
  icon: ReactNode;
  bg: string;
  title: string;
  desc: string;
}

interface SlideItem {
  id: string;
  title: string;
  phrase: string;
  img: string;
  tag: string;
}

interface FeatureItem {
  id: string;
  icon: ReactNode;
  title: string;
  desc: string;
}

/* =========================
   DATA
========================= */

const challenges: ChallengeItem[] = [
  {
    id: 'inventory',
    icon: <AlertCircle size={24} color="#E53E3E" />,
    bg: '#FFF5F5',
    title: 'Desorden en inventario',
    desc: 'No sabes cuántas telas o productos tienes disponibles.'
  },
  {
    id: 'whatsapp-sales',
    icon: <MessageSquare size={24} color="#DD6B20" />,
    bg: '#FFFAF0',
    title: 'Ventas por WhatsApp',
    desc: 'Pedidos desordenados, sin historial ni control.'
  },
  {
    id: 'production-control',
    icon: <ClipboardList size={24} color="#D69E2E" />,
    bg: '#FFFFF0',
    title: 'Falta de control',
    desc: 'No sabes el estado de producción de tus talleres.'
  },
  {
    id: 'data-loss',
    icon: <Clock size={24} color="#3182CE" />,
    bg: '#EBF8FF',
    title: 'Pérdida de información',
    desc: 'Datos dispersos en cuadernos y hojas de cálculo.'
  }
];

const slides: SlideItem[] = [
  {
    id: 'quality',
    title: 'Calidad que se siente',
    phrase:
      'Textiles seleccionados bajo los más altos estándares de durabilidad.',
    img: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?q=80&w=800',
    tag: 'Premium'
  },
  {
    id: 'production',
    title: 'Producción óptima',
    phrase:
      'Procesos transparentes que garantizan confianza en cada costura.',
    img: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?q=80&w=800',
    tag: 'Compromiso'
  },
  {
    id: 'technology',
    title: 'Tecnología Textil',
    phrase:
      'Innovación aplicada a la gestión y fabricación de tus prendas.',
    img: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=800',
    tag: 'Innovación'
  }
];

const features: FeatureItem[] = [
  {
    id: 'responsive',
    icon: <Smartphone size={20} />,
    title: 'Diseño responsive',
    desc: 'Perfecta en cualquier dispositivo.'
  },
  {
    id: 'fast',
    icon: <Zap size={20} />,
    title: 'Carga ultrarrápida',
    desc: 'Optimizado para conexiones lentas.'
  },
  {
    id: 'ui',
    icon: <Eye size={20} />,
    title: 'Interfaz intuitiva',
    desc: 'Fácil de usar para cualquier persona.'
  }
];

/* =========================
   COMPONENTS
========================= */

const ChallengesSection = () => (
  <section className="challenges-section" id="nosotros">
    <div className="section-header">
      <span className="badge-alert">Problemas comunes</span>

      <h2>¿Te suena familiar?</h2>

      <p>
        La mayor parte de empresas de confección enfrentan estos desafíos
        diariamente.
      </p>
    </div>

    <div className="challenges-grid">
      {challenges.map((item) => (
        <div className="challenge-card" key={item.id}>
          <div
            className="icon-box"
            style={{ backgroundColor: item.bg }}
          >
            {item.icon}
          </div>

          <h3>{item.title}</h3>

          <p>{item.desc}</p>
        </div>
      ))}
    </div>
  </section>
);

const ProductCarousel = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const navigate = useNavigate();

  const handleSlide = (direction: 'next' | 'prev') => {
    setCurrentSlide((prev) => {
      if (direction === 'next') {
        return prev === slides.length - 1 ? 0 : prev + 1;
      }

      return prev === 0 ? slides.length - 1 : prev - 1;
    });
  };

  return (
    <section className="carousel-section" id="catalogo">
      <div className="carousel-header">
        <span className="badge">Excelencia Textil</span>

        <h2>Inspirando confianza en cada prenda</h2>
      </div>

      <div className="carousel-container-wrapper">
        <button
          className="nav-btn prev"
          onClick={() => handleSlide('prev')}
          aria-label="Anterior"
        >
          <ChevronLeft />
        </button>

        <button
          className="nav-btn next"
          onClick={() => handleSlide('next')}
          aria-label="Siguiente"
        >
          <ChevronRight />
        </button>

        <div className="carousel-window">
          <div
            className="carousel-track"
            style={{
              transform: `translateX(-${currentSlide * 100}%)`
            }}
          >
            {slides.map((slide) => (
              <div className="slide-card-full" key={slide.id}>
                <div className="slide-image">
                  <img
                    src={slide.img}
                    alt={slide.title}
                    loading="lazy"
                  />

                  <span className="slide-tag">{slide.tag}</span>
                </div>

                <div className="slide-info">
                  <h3>{slide.title}</h3>

                  <p>{slide.phrase}</p>

                  <button className="btn-primary" onClick={() => navigate('/catalogo')}>
                    Explorar calidad
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

const MobileExperience = () => (
  <section className="mobile-section" id="contacto">
    <div className="mobile-container">
      <div className="mobile-text">
        <span className="badge-dark">Experiencia móvil</span>

        <h2>Compra desde cualquier lugar</h2>

        <p>
          Aplicación optimizada para móviles. Tus clientes pueden
          navegar, comprar y hacer seguimiento desde su celular.
        </p>

        <div className="mobile-features-list">
          {features.map((feature) => (
            <div className="m-feature-item" key={feature.id}>
              <div className="m-icon-box">
                {feature.icon}
              </div>

              <div className="m-info">
                <h4>{feature.title}</h4>

                <p>{feature.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mobile-visuals">
        {[
          {
            id: 'img-1',
            className: 'p-1',
            src: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=500',
            alt: 'Ropa 1'
          },
          {
            id: 'img-2',
            className: 'p-2',
            src: 'https://images.unsplash.com/photo-1554568218-0f1715e72254?q=80&w=500',
            alt: 'Ropa 2'
          }
        ].map((image) => (
          <div
            key={image.id}
            className={`phone-card ${image.className}`}
          >
            <img
              src={image.src}
              alt={image.alt}
              loading="lazy"
            />
          </div>
        ))}
      </div>
    </div>
  </section>
);

/* =========================
  PAGE
========================= */

const HomePage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="app-shell">
      {/* NAVBAR ELIMINADO PARA EVITAR DUPLICIDAD */}

      <main>
        <section className="hero-container" id="inicio">
          <div className="hero-content">
            <div className="hero-text">
              <span className="badge">
                Líderes en confección
              </span>

              <h1>Bienvenido a Surticamisetas</h1>

              <p>
                Más de 15 años liderando la industria textil.
                Productos premium en algodón 100% y
                personalización avanzada para tu marca o evento.
              </p>

              <div className="hero-btns">
                <button className="btn-primary btn-large" onClick={() => navigate('/catalogo')}>
                  Ver catálogo
                  <ArrowRight size={18} />
                </button>

                <button
                  className="btn-secondary btn-large"
                  onClick={() => navigate('/login')}
                >
                  Iniciar sesión
                </button>
              </div>

              <div className="hero-stats">
                <div className="stat">
                  <strong>+500</strong>
                  <span>Clientes activos</span>
                </div>

                <div className="stat">
                  <strong>99.9%</strong>
                  <span>Calidad garantizada</span>
                </div>

                <div className="stat">
                  <strong>24/7</strong>
                  <span>Soporte experto</span>
                </div>
              </div>
            </div>

            <div className="hero-visual">
              <div className="window-mockup">
                <div className="window-header">
                  <span className="dot red" />
                  <span className="dot yellow" />
                  <span className="dot green" />
                </div>

                <div className="window-grid">
                  <div className="grid-card">
                    <Shirt size={32} strokeWidth={1.2} />
                  </div>

                  <div className="grid-card">
                    <Scissors size={32} strokeWidth={1.2} />
                  </div>

                  <div className="grid-card">
                    <Layers size={32} strokeWidth={1.2} />
                  </div>

                  <div className="grid-card">
                    <Warehouse size={32} strokeWidth={1.2} />
                  </div>

                  <div className="grid-card">
                    <img
                      src="https://cdn-icons-png.flaticon.com/512/2503/2503380.png"
                      alt="Icono textil"
                      className="small-img"
                    />
                  </div>

                  <div className="grid-card">
                    <Truck size={32} strokeWidth={1.2} />
                  </div>
                </div>

                <div className="phone-mockup">
                  <div className="phone-inner">
                    <div className="phone-skeleton-line" />
                    <div className="phone-skeleton-rect" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <ChallengesSection />
        <ProductCarousel />
        <MobileExperience />
      </main>
    </div>
  );
};

export default HomePage;



import React, { memo, useMemo } from 'react';
import {
  ShieldCheck,
  Eye,
  Gem,
  Smartphone,
  Zap,
  ScanSearch,
  Crown,
  Palette,
  Settings2,
  Headphones,
  Sparkles,
  ArrowRight,
} from 'lucide-react';

import { useNavigate } from 'react-router-dom';
import '../styles/AboutPage.css';

/* =========================================================
   HELPERS
========================================================= */

const getEmbedUrl = (url: string): string => {
  let videoId = '';

  if (url.includes('shorts/')) {
    videoId = url.split('shorts/')[1]?.split('?')[0];
  } else if (url.includes('watch?v=')) {
    videoId = url.split('v=')[1]?.split('&')[0];
  } else if (url.includes('youtu.be/')) {
    videoId = url.split('youtu.be/')[1]?.split('?')[0];
  }

  return `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}&controls=0&modestbranding=1&rel=0`;
};

/* =========================================================
   TYPES
========================================================= */

interface RoleItem {
  title: string;
  icon: React.ReactNode;
  description: string;
}

interface FeatureItem {
  icon: React.ReactNode;
  title: string;
  description: string;
}

interface TeamMember {
  name: string;
  role: string;
  description: string;
  icon: React.ReactNode;
}

/* =========================================================
   DATA
========================================================= */

const rolesData: RoleItem[] = [
  {
    title: 'Misión',
    icon: <ShieldCheck size={26} />,
    description:
      'Confeccionamos prendas de alta calidad que reflejan compromiso, precisión y excelencia en cada detalle.',
  },
  {
    title: 'Visión',
    icon: <Eye size={26} />,
    description:
      'Ser una marca líder a nivel nacional para 2030, reconocida por innovación, diseño y confianza.',
  },
  {
    title: 'Valores',
    icon: <Gem size={26} />,
    description:
      'Calidad, innovación, transparencia y compromiso constante con cada cliente y proyecto.',
  },
];

const featuresData: FeatureItem[] = [
  {
    icon: <Smartphone size={22} />,
    title: 'Experiencia Moderna',
    description:
      'Una plataforma intuitiva diseñada para facilitar tus compras y pedidos.',
  },
  {
    icon: <Zap size={22} />,
    title: 'Procesos ágiles',
    description:
      'Producción y distribución optimizadas para tiempos de entrega rápidos.',
  },
  {
    icon: <ScanSearch size={22} />,
    title: 'Seguimiento Transparente',
    description:
      'Control y visibilidad completa durante todo el proceso de producción.',
  },
];

const teamData: TeamMember[] = [
  {
    name: 'Carlos Mendoza',
    role: 'Director General',
    description:
      'Especialista en dirección estratégica y desarrollo de marcas textiles.',
    icon: <Crown size={22} />,
  },
  {
    name: 'María González',
    role: 'Diseñadora Creativa',

    description:
      'Experta en identidad visual, personalización y diseño de prendas.',
    icon: <Palette size={22} />,
  },
  {
    name: 'Juan Pérez',
    role: 'Jefe de Producción',
    description:
      'Responsable del control de calidad y optimización de procesos.',
    icon: <Settings2 size={22} />,
  },
  {
    name: 'Ana López',
    role: 'Atención al Cliente',
    description:
      'Enfocada en brindar una experiencia cercana y personalizada.',
    icon: <Headphones size={22} />,
  },
];

/* =========================================================
   ABOUT SECTION
========================================================= */

export const AboutSection = memo(() => {
  return (
    <section className="about-modules-section">
      <div className="about-container">

        <div className="modules-header">
          <span className="top-badge">Identidad</span>

          <h2>Conocémonos</h2>

          <p>
            Nuestra costura representa compromiso, elegancia y precisión
            para transformar cada proyecto en una experiencia premium.
          </p>
        </div>

        <div className="roles-grid">
          {rolesData.map((role) => (
            <article className="role-card" key={role.title}>
              <div className="role-icon">
                {role.icon}
              </div>

              <h3>{role.title}</h3>

              <p className="role-description">
                {role.description}
              </p>
            </article>
          ))}
        </div>

      </div>
    </section>
  );
});

AboutSection.displayName = 'AboutSection';

/* =========================================================
   MOBILE / DIGITAL SECTION
========================================================= */

export const MobileSection = memo(() => {
  const videoUrl = useMemo(
    () => getEmbedUrl('https://youtube.com/shorts/eRutE4Y_Rp8'),
    []
  );

  return (
    <section className="about-mobile-section-dark">
      <div className="about-container mobile-flex">

        {/* TEXT */}
        <div className="mobile-text-column">

          <span className="experience-badge">
            Innovación Digital
          </span>

          <h1>
            Tecnología y moda en un mismo lugar
          </h1>

          <p className="mobile-description">
            En Surticamisetas combinamos diseño, innovación y procesos
            inteligentes para ofrecer soluciones textiles modernas,
            rápidas y totalmente personalizadas.
          </p>

          <div className="mobile-features-list">
            {featuresData.map((item) => (
              <div
                className="mobile-feature-item"
                key={item.title}
              >
                <div className="mobile-icon-box">
                  {item.icon}
                </div>

                <div className="mobile-feature-text">
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                </div>
              </div>
            ))}
          </div>

        </div>

        {/* MOCKUP */}
        <div className="mobile-mockup-column">
          <div className="phone-mockup">

            <div className="video-aspect-ratio">
              <iframe
                src={videoUrl}
                title="Surticamisetas Video"
                className="youtube-iframe"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>

          </div>
        </div>

      </div>
    </section>
  );
});

MobileSection.displayName = 'MobileSection';

/* =========================================================
   TEAM SECTION
========================================================= */

export const TeamSection = memo(() => {
  return (
    <section className="team-section">
      <div className="about-container">

        <div className="team-header">
          <span className="top-badge">
            Equipo Profesional
          </span>

          <h2>Nuestro Equipo</h2>

          <p>
            Profesionales apasionados por crear prendas con calidad,
            diseño y atención personalizada.
          </p>
        </div>

        <div className="team-grid">
          {teamData.map((member) => (
            <article
              className="team-card"
              key={member.name}
            >
              <div className="team-icon-wrapper">
                {member.icon}
              </div>

              <div className="team-info">
                <h3>{member.name}</h3>

                <span className="team-role">
                  {member.role}
                </span>

                <p>{member.description}</p>
              </div>
            </article>
          ))}
        </div>

      </div>
    </section>
  );
});

TeamSection.displayName = 'TeamSection';

/* =========================================================
   CTA SECTION
========================================================= */

export const CTASection = memo(() => {
  const navigate = useNavigate();

  return (
    <section className="cta-section">
      <div className="about-container cta-content">

        <div className="cta-badge">
          <Sparkles size={16} />
          <span>Tu próximo proyecto comienza aquí</span>
        </div>

        <h2>
          Diseñemos juntos tus próximas camisetas
        </h2>

        <p>
          Creamos prendas personalizadas con acabados premium,
          producción eficiente y acompaamiento profesional.
        </p>

        <button
          className="cta-button"
          onClick={() => navigate('/contacto')}
        >
          <span>Contáctanos</span>

          <ArrowRight size={20} />
        </button>

      </div>
    </section>
  );
});

CTASection.displayName = 'CTASection';

/* =========================================================
  PAGE
========================================================= */

const AboutPage = () => {
  return (
    <main className="page-nosotros">

      <AboutSection />

      <MobileSection />

      <TeamSection />

      <CTASection />

    </main>
  );
};

export default memo(AboutPage);



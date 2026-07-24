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
  Users,
  Cpu,
  PenTool,
  Sparkles,
  ArrowRight,
} from 'lucide-react';

import { useNavigate } from 'react-router-dom';
import '../styles/AboutPage.css';
import { appContent } from '@/shared/config/appContent';

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

const rolesData: RoleItem[] = appContent.publicPages.about.roles.map((role, index) => ({
  title: role.title,
  icon: [<Eye size={26} />, <Gem size={26} />, <Palette size={26} />][index] ?? <ShieldCheck size={26} />,
  description: role.description,
}));

const featuresData: FeatureItem[] = appContent.publicPages.about.features.map((feature, index) => ({
  icon: [<Sparkles size={22} />, <Zap size={22} />, <ScanSearch size={22} />][index] ?? <Smartphone size={22} />,
  title: feature.title,
  description: feature.description,
}));

const teamIcons: Record<string, React.ReactNode> = {
  'Equipo de producto': <Users size={22} />,
  'Equipo creativo': <PenTool size={22} />,
  'Equipo técnico': <Cpu size={22} />,
};

const teamData: TeamMember[] = appContent.publicPages.about.team.map((member) => ({
  name: member.name,
  role: member.role,
  description: member.description,
  icon: teamIcons[member.name] ?? <Crown size={22} />,
}));

/* =========================================================
   ABOUT SECTION
========================================================= */

export const AboutSection = memo(() => {
  return (
    <section className="about-modules-section">
      <div className="about-container">

        <div className="modules-header">
          <span className="top-badge">{appContent.publicPages.about.identityLabel}</span>

          <h2>{appContent.publicPages.about.introTitle}</h2>

          <p>{appContent.publicPages.about.introDescription}</p>
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
            {appContent.publicPages.contact.heroBadge}
          </span>

          <h1>
            {appContent.publicPages.contact.title}
          </h1>

          <p className="mobile-description">
            {appContent.publicPages.contact.description}
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
            {appContent.publicPages.about.identityLabel}
          </span>

          <h2>Nuestro Equipo</h2>

          <p>{appContent.publicPages.about.introDescription}</p>
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



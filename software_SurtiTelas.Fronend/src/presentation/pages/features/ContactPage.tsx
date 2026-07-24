import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Mail,
  MessageSquare,
  MapPin,
  Phone,
  Clock,
  Sparkles,
  ArrowRight,
  LogIn,
} from "lucide-react";

import "../styles/ContactPage.css";
import { companyApi } from "@/infrastructure/api/companyApi";

interface ContactAction {
  name: string;
  icon: React.ReactNode;
  className: string;
  href: string;
}

interface ContactCard {
  title: string;
  icon: React.ReactNode;
  content: React.ReactNode;
  variant: "light" | "dark";
}

const ContactInfoCard = ({
  card,
}: {
  card: ContactCard;
}) => (
  <article
    className={`contact-card ${
      card.variant === "dark" ? "card-dark" : "card-light"
    }`}
  >
    <div className="contact-card-icon">{card.icon}</div>

    <div className="contact-card-content">
      <h3>{card.title}</h3>

      <div className="contact-card-body">{card.content}</div>
    </div>
  </article>
);

export const SurtitelaLayout: React.FC = () => {
  const navigate = useNavigate();
  const [company, setCompany] = useState<{ nombre?: string; telefono?: string; email?: string; direccion?: string; ciudad?: string } | null>(null);

  useEffect(() => {
    let active = true;
    companyApi.get().then((data) => {
      if (active) setCompany(data);
    }).catch(() => {
      if (active) setCompany(null);
    });
    return () => { active = false; };
  }, []);

  const telefono = company?.telefono || 'No disponible';
  const email = company?.email || 'No disponible';
  const direccion = [company?.direccion, company?.ciudad].filter(Boolean).join(', ') || 'No disponible';

  const contactActions: ContactAction[] = [
    {
      name: "Enviar Email",
      icon: <Mail size={18} strokeWidth={2.2} />,
      className: "btn-email",
      href: `mailto:${email}`,
    },
    {
      name: "WhatsApp",
      icon: <MessageSquare size={18} strokeWidth={2.2} />,
      className: "btn-whatsapp",
      href: `https://wa.me/${(telefono || '').replace(/\D/g, '')}`,
    },
    {
      name: "Ver Ubicación",
      icon: <MapPin size={18} strokeWidth={2.2} />,
      className: "btn-location",
      href: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(direccion)}`,
    },
  ];

  const contactCards: ContactCard[] = [
    {
      title: "Teléfono",
      icon: <Phone size={22} />,
      content: telefono,
      variant: "light",
    },
    {
      title: "Correo Electrónico",
      icon: <Mail size={22} />,
      content: email,
      variant: "light",
    },
    {
      title: "Ubicación",
      icon: <MapPin size={22} />,
      content: direccion,
      variant: "light",
    },
    {
      title: "Horario de Atención",
      icon: <Clock size={22} />,
      content: (
        <div className="schedule-content">
          <div className="schedule-row">
            <span>Lunes - Sábado</span>
            <span>8:00 AM - 5:00 PM</span>
          </div>

          <p className="schedule-notice">
            No trabajamos domingos ni festivos
          </p>
        </div>
      ),
      variant: "dark",
    },
  ];

  const ContactActionButton = ({
    action,
  }: {
    action: ContactAction;
  }) => (
    <a className={`contact-btn ${action.className}`} href={action.href} target="_blank" rel="noopener noreferrer">
      <div className="contact-btn-icon">{action.icon}</div>

      <span>{action.name}</span>
    </a>
  );

  return (
    <main className="landing-page">
      {/* ================= HERO CONTACTO ================= */}
      <section className="hero-contact">
        <div className="hero-overlay"></div>

        <div className="container">
          <header className="hero-header">
            <div className="hero-badge">
              <Sparkles size={14} />
              <span>Atención Inmediata</span>
            </div>

            <h1>
              Conecta con <span>{company?.nombre || 'Surtitela'}</span>
            </h1>

            <p>
              Nuestro equipo está listo para ayudarte con cotizaciones,
              pedidos, asesoría textil y soporte personalizado.
            </p>
          </header>

          {/* ACTION BUTTONS */}
          <div className="contact-actions">
            {contactActions.map((action) => (
              <ContactActionButton
                key={action.name}
                action={action}
              />
            ))}
          </div>

          {/* CONTACT CARDS */}
          <div className="contact-grid">
            {contactCards.map((card) => (
              <ContactInfoCard
                key={card.title}
                card={card}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ================= CTA DIGITAL ================= */}
      <section className="digital-section">
        <div className="digital-blur blur-left"></div>
        <div className="digital-blur blur-right"></div>

        <div className="container digital-container">
          <div className="digital-badge">
            <Sparkles size={14} />
            <span>Tecnología Textil</span>
          </div>

          <h2>
            Comienza a digitalizar
            <br />
            <span>tu negocio hoy</span>
          </h2>

          <p>
            Únete a cientos de empresas que ya confían en{" "}
            <strong>Surtitela</strong> para gestionar inventarios,
            pedidos y procesos de confección.
          </p>

          <div className="digital-actions">
            <button className="btn-primary" type="button" onClick={() => navigate('/catalogo')}>
              <span>Explorar catálogo</span>
              <ArrowRight size={18} />
            </button>

            <button className="btn-secondary" type="button" onClick={() => navigate('/login')}>
              <LogIn size={18} />
              <span>Iniciar sesión</span>
            </button>
          </div>
        </div>
      </section>
    </main>
  );
};

export default SurtitelaLayout;



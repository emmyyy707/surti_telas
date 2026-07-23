import React from "react";
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

interface ContactAction {
  name: string;
  icon: React.ReactNode;
  className: string;
}

interface ContactCard {
  title: string;
  icon: React.ReactNode;
  content: React.ReactNode;
  variant: "light" | "dark";
}

const contactActions: ContactAction[] = [
  {
    name: "Enviar Email",
    icon: <Mail size={18} strokeWidth={2.2} />,
    className: "btn-email",
  },
  {
    name: "WhatsApp",
    icon: <MessageSquare size={18} strokeWidth={2.2} />,
    className: "btn-whatsapp",
  },
  {
    name: "Ver Ubicación",
    icon: <MapPin size={18} strokeWidth={2.2} />,
    className: "btn-location",
  },
];

const contactCards: ContactCard[] = [
  {
    title: "Teléfono",
    icon: <Phone size={22} />,
    content: "+57 321 826 7514",
    variant: "light",
  },
  {
    title: "Correo Electrónico",
    icon: <Mail size={22} />,
    content: "surticamisetas@gmail.com",
    variant: "light",
  },
  {
    title: "Ubicación",
    icon: <MapPin size={22} />,
    content: "CL 42 CR 27 - 45, Medellín",
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
  <button className={`contact-btn ${action.className}`}>
    <div className="contact-btn-icon">{action.icon}</div>

    <span>{action.name}</span>
  </button>
);

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
              Conecta con <span>Surtitela</span>
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



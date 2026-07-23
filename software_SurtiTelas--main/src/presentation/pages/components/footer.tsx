import React from 'react';
import {
  MessageCircle,
  MapPin,
  Phone,
  Mail,
  User,
} from 'lucide-react';
import { FaInstagram } from 'react-icons/fa';

// Assets
import logoSurticamisetas from '@assets/images/logos/partner-logo-1.png';
import logoSurtitela from '@assets/images/logos/partner-logo-2.jpg';

const Footer: React.FC = () => {
  return (
    <footer className="site-footer">
      <div className="footer-main-container">

        {/* Columna 1: Logos y Descripción */}
        <div className="footer-col-left">

          <div className="footer-logos-group">
            <img
              src={logoSurticamisetas}
              alt="Surticamisetas Logo"
              className="logo-surticamisetas"
              loading="lazy"
              onError={(e) => {
                const target = e.currentTarget;

                if (!target.src.includes('placeholders')) {
                  target.src = '/assets/images/placeholders/product.svg';
                }
              }}
            />

            <img
              src={logoSurtitela}
              alt="Surtitela Logo"
              className="logo-surtitela"
              loading="lazy"
              onError={(e) => {
                const target = e.currentTarget;

                if (!target.src.includes('placeholders')) {
                  target.src = '/assets/images/placeholders/product.svg';
                }
              }}
            />
          </div>

          <p className="footer-description">
            Confección y personalización de camisetas para todas las edades.
            Calidad y estilo en cada prenda.
          </p>

          {/* Redes sociales */}
          <div className="footer-social-icons">

            {/* Instagram */}
            <a
              href="https://www.instagram.com/surticamisetas/"
              className="social-icon-btn"
              target="_blank"
              rel="noreferrer"
              aria-label="Instagram"
            >
              <FaInstagram size={22} />
            </a>

            {/* WhatsApp */}
            <a
              href="https://wa.me/573218267514"
              className="social-icon-btn"
              target="_blank"
              rel="noreferrer"
              aria-label="WhatsApp"
            >
              <MessageCircle size={22} />
            </a>

          </div>
        </div>

        {/* Columna 2: Enlaces rápidos */}
        <div className="footer-col-center">
          <h3>Enlaces Rápidos</h3>

          <ul className="footer-links-list">
            <li>
              <a href="#inicio">Inicio</a>
            </li>

            <li>
              <a href="#catalogo">Catálogo</a>
            </li>

            <li>
              <a href="#nosotros">Nosotros</a>
            </li>

            <li>
              <a href="#contacto">Contacto</a>
            </li>

            <li>
              <a href="#login">Iniciar Sesión</a>
            </li>

            <li>
              <a href="#registro">Registrarse</a>
            </li>
          </ul>
        </div>

        {/* Columna 3: Contacto */}
        <div className="footer-col-right">
          <h3>Contacto</h3>

          <ul className="footer-contact-list">

            <li>
              <MapPin size={20} className="contact-icon" />

              <div>
                CL 42 CR 27-45
                <br />
                <span>Medellín, Colombia</span>
              </div>
            </li>

            <li>
              <Phone size={20} className="contact-icon" />
              <span>321 826 7514</span>
            </li>

            <li>
              <Mail size={20} className="contact-icon" />
              <span>surticamisetas@gmail.com</span>
            </li>

            <li>
              <User size={20} className="contact-icon" />
              <span>Jonathan Montoya</span>
            </li>

          </ul>
        </div>
      </div>

      {/* Barra inferior */}
      <div className="footer-bottom-bar">
        <div className="footer-bottom-content">

          <p>
            © 2025 Surticamisetas. Todos los derechos reservados.
          </p>

          <div className="legal-links-group">
            <a href="#">Términos y condiciones</a>
            <a href="#">Política de privacidad</a>
          </div>

        </div>
      </div>

      {/* Botón flotante WhatsApp */}
      <a
        href="https://wa.me/573218267514"
        className="whatsapp-float-btn"
        target="_blank"
        rel="noreferrer"
        aria-label="WhatsApp"
      >
        <MessageCircle size={32} fill="currentColor" />
      </a>
    </footer>
  );
};

export default Footer;



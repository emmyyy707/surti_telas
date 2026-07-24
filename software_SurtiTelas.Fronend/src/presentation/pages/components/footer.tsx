import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Tooltip } from "@/shared/components/Tooltip";
import {
  MessageCircle,
  MapPin,
  Phone,
  Mail,
  User,
} from 'lucide-react';
import { FaInstagram, FaTiktok } from 'react-icons/fa';

// Assets
import logoSurticamisetas from '@assets/images/logos/partner-logo-1.png';
import logoSurtitela from '@assets/images/logos/partner-logo-2.jpg';
import { companyApi } from '@/infrastructure/api/companyApi';

const Footer: React.FC = () => {
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

  const direccion = [company?.direccion, company?.ciudad].filter(Boolean).join(', ') || 'No disponible';

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
            <Tooltip title="WhatsApp">
              <a
                className="social-icon-btn"
                href="https://wa.me/573000000000"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp"
              >
                <MessageCircle size={22} />
              </a>
            </Tooltip>

            <Tooltip title="Instagram">
              <a
                className="social-icon-btn"
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
              >
                <FaInstagram size={22} />
              </a>
            </Tooltip>

            <Tooltip title="TikTok">
              <a
                className="social-icon-btn"
                href="https://tiktok.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="TikTok"
              >
                <FaTiktok size={22} />
              </a>
            </Tooltip>
          </div>
        </div>

        {/* Columna 2: Enlaces rápidos */}
        <div className="footer-col-center">
          <h3>Enlaces Rápidos</h3>

          <ul className="footer-links-list">
            <li>
              <Link to="/">Inicio</Link>
            </li>

            <li>
              <Link to="/catalogo">Catálogo</Link>
            </li>

            <li>
              <Link to="/nosotros">Nosotros</Link>
            </li>

            <li>
              <Link to="/contacto">Contacto</Link>
            </li>

            <li>
              <Link to="/login">Iniciar Sesión</Link>
            </li>

            <li>
              <Link to="/registro">Registrarse</Link>
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
                {direccion}
              </div>
            </li>

            <li>
              <Phone size={20} className="contact-icon" />
              <span>{company?.telefono || 'No disponible'}</span>
            </li>

            <li>
              <Mail size={20} className="contact-icon" />
              <span>{company?.email || 'No disponible'}</span>
            </li>

            <li>
              <User size={20} className="contact-icon" />
              <span>{company?.nombre || 'No disponible'}</span>
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
      <Tooltip title="WhatsApp">
        <a
          className="whatsapp-float-btn"
          href="https://wa.me/573000000000"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="WhatsApp"
        >
          <MessageCircle size={32} fill="currentColor" />
        </a>
      </Tooltip>
    </footer>
  );
};

export default Footer;

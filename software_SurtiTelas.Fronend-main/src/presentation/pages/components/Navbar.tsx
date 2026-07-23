import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ShoppingCart, User } from "lucide-react";
import logoImg from "@assets/images/logos/surtitelas-logo.jpg";
import { useCart, useAuth } from "@/app/providers/AppProviders";
import { Tooltip } from "@/shared/components/Tooltip";
import "./Navbar.css";

const USER_TOOLTIP: Record<string, string> = {
  admin: "Panel Admin",
  asesor: "Panel Asesor",
  domiciliario: "Panel Domiciliario",
  cliente: "Mi Cuenta",
};

const Navbar: React.FC = () => {
  const { totalItems } = useCart();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  // Estado para detectar si el usuario ha hecho scroll hacia abajo
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const role = user?.role;

  const goToCart = () => navigate("/carrito");
  const goToLogin = () => navigate("/login");

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const handleUserClick = () => {
    if (!user) {
      goToLogin();
      return;
    }

    switch (role) {
      case "admin":
        navigate("/admin/dashboard");
        break;
      case "asesor":
        navigate("/asesor/dashboard");
        break;
      case "domiciliario":
        navigate("/domiciliario/dashboard");
        break;
      case "cliente":
        navigate("/cliente/inicio");
        break;
      default:
        navigate("/");
    }
  };

  return (
    /* Agregamos dinámicamente la clase 'is-scrolled' según el estado */
    <header className={`site-header ${isScrolled ? "is-scrolled" : ""}`}>
      <div className="header-container">
        {/* LOGO */}
        <div className="brand">
          <Link to="/">
            <img
              src={logoImg}
              alt="Surticamisetas"
              className="main-logo"
              loading="lazy"
              onError={(e) => {
                const target = e.currentTarget;
                if (!target.src.includes("placeholders")) {
                  target.src = "/assets/images/placeholders/logo-light.svg";
                }
              }}
            />
          </Link>
        </div>

        {/* NAVIGATION */}
        <nav className="site-nav">
          <Link to="/">Inicio</Link>
          <Link to="/nosotros">Nosotros</Link>
          <Link to="/catalogo">Catálogo</Link>
          <Link to="/contacto">Contacto</Link>
        </nav>

        {/* ACTIONS */}
        <div className="header-actions">
          {/* USER */}
          <Tooltip title={role ? USER_TOOLTIP[role] ?? "Mi Cuenta" : "Iniciar sesión"}>
            <button className="icon-btn" onClick={handleUserClick}>
              <User size={22} />
            </button>
          </Tooltip>

          {/* LOGOUT */}
          {user && (
            <button className="logout-btn" onClick={handleLogout}>
              Salir
            </button>
          )}

          {/* CART */}
          <Tooltip title="Carrito de compras">
            <button className="cart-wrapper-pro" onClick={goToCart}>
              <ShoppingCart size={24} color="#1a1a1a" />
              {totalItems > 0 && (
                <span className="cart-badge-dynamic">{totalItems}</span>
              )}
            </button>
          </Tooltip>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
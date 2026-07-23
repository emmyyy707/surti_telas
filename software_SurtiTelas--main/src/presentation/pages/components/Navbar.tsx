import React from "react";

import {
  useNavigate,
  Link,
} from "react-router-dom";

import {
  ShoppingCart,
  User,
} from "lucide-react";

import logoImg
from "@assets/images/logos/surtitelas-logo.jpg";

import {
  useCart,
} from "@presentation/contexts/CartContext";

import {
  useAuth,
} from "@presentation/contexts/AuthContext";

import "./Navbar.css";

const Navbar: React.FC = () => {

  const { totalItems } =
    useCart();

  const {
    user,
    logout,
  } = useAuth();

  const navigate =
    useNavigate();

  // ROLE ACTUAL
  const role = user?.role;

  const goToCart = () =>
    navigate("/carrito");

  const goToLogin = () =>
    navigate("/login");

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
        navigate("/cliente/dashboard");
        break;

      default:
        navigate("/");
    }
  };

  return (
    <header className="site-header">

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

                const target =
                  e.currentTarget;

                if (
                  !target.src.includes(
                    "placeholders"
                  )
                ) {
                  target.src =
                    "/assets/images/placeholders/logo-light.svg";
                }
              }}
            />

          </Link>

        </div>

        {/* NAVIGATION */}
        <nav className="site-nav">

          <Link to="/">
            Inicio
          </Link>

          <Link to="/nosotros">
            Nosotros
          </Link>

          <Link to="/catalogo">
            Catálogo
          </Link>

          <Link to="/contacto">
            Contacto
          </Link>

        </nav>

        {/* ACTIONS */}
        <div className="header-actions">

          {/* USER */}
          <button
            className="icon-btn"
            title={
              role === "admin"
                ? "Panel Admin"
                : role === "asesor"
                ? "Panel Asesor"
                : role === "domiciliario"
                ? "Panel Domiciliario"
                : role === "cliente"
                ? "Mi Cuenta"
                : "Iniciar sesión"
            }
            onClick={handleUserClick}
          >
            <User size={22} />
          </button>

          {/* LOGOUT */}
          {user && (
            <button
              className="logout-btn"
              onClick={handleLogout}
            >
              Salir
            </button>
          )}

          {/* CART */}
          <button
            className="cart-wrapper-pro"
            onClick={goToCart}
          >

            <ShoppingCart
              size={24}
              color="#1a1a1a"
            />

            {totalItems > 0 && (
              <span className="cart-badge-dynamic">
                {totalItems}
              </span>
            )}

          </button>

        </div>

      </div>

    </header>
  );
};

export default Navbar;



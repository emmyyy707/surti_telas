# 01_NAVBAR_AUDIT.md — Fase 3.1.4

## Navbar UI Audit

### Estructura (Navbar.tsx)
```tsx
<header className="site-header">
  <div className="header-container">
    <div className="brand">
      <Link to="/">
        <img src={logoImg} alt="Surticamisetas" className="main-logo" loading="lazy" />
      </Link>
    </div>
    <nav className="site-nav">
      <Link to="/">Inicio</Link>
      <Link to="/nosotros">Nosotros</Link>
      <Link to="/catalogo">Catálogo</Link>
      <Link to="/contacto">Contacto</Link>
    </nav>
    <div className="header-actions">
      <button className="icon-btn" onClick={handleUserClick}>
        <User size={22} />
      </button>
      {user && <button className="logout-btn" onClick={handleLogout}>Salir</button>}
      <button className="cart-wrapper-pro" onClick={goToCart}>
        <ShoppingCart size={24} />
        {totalItems > 0 && <span className="cart-badge-dynamic">{totalItems}</span>}
      </button>
    </div>
  </div>
</header>
```

### Estilos (Navbar.css + App.css)

| Elemento | Clase | Navbar.css | App.css | Estado |
|----------|-------|------------|---------|--------|
| Header | .site-header | backdrop-filter, bg rgba(255,255,255,0.9), border-bottom | bg #ffffff, padding 16px | ⚠️ Propiedades diferentes |
| Container | .header-container | max-width: 1440px, height: 70px, padding: 0 2.5rem | max-width: 1300px, padding: 0 40px | ❌ Inconsistente |
| Logo | .main-logo | No definido | height: 45px | ✅ Definido en App.css |
| Nav | .site-nav | gap: 2.5rem, font-size: 0.85rem, font-weight: 700, uppercase | gap: 35px, font-size: 0.95rem, font-weight: 600 | ⚠️ Valores diferentes |
| Actions | .header-actions | gap: 1.2rem | gap: 24px o 12px | ⚠️ Múltiples definiciones |

### Problemas detectados

| Problema | Ubicación | Severidad |
|----------|-----------|-----------|
| Gap inconsistente en nav | Navbar.css línea 43 vs App.css línea 48 | Media |
| Header height diferente | Navbar.css línea 14 (70px) vs implícito | Media |
| .header-actions duplicado 3 veces | App.css líneas 64-68, 1203-1207, 1227-1231, 1254-1258 | Alta |
| .main-logo definido múltiples veces | App.css líneas 46, 370 | Baja |
| Font-family conflict: Plus Jakarta Sans vs Inter | Navbar.css import vs index.css | Media |

### Responsive

| Breakpoint | Footer CSS | Navbar CSS | Estado |
|------------|------------|------------|--------|
| 320px (mobile) | No definido | No definido | ❌ Pendiente |
| 768px (tablet) | No definido | No definido | ❌ Pendiente |
| 1024px (desktop) | No definido | No definido | ❌ Pendiente |
| 1440px (wide) | max-width con 1440px | max-width con 1440px | ✅ OK |

### Navbar en rutas públicas

- Renderizado en PublicLayout (App.tsx línea 46)
- Eliminado duplicado en App.tsx línea 115 (FASE 3.1.2)
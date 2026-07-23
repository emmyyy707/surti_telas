// src/presentation/pages/LoginPage.tsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { auth } from '@config/firebase';
import { useAuth } from '@presentation/contexts/AuthContext';
import toast from 'react-hot-toast';
import logoImg from '@assets/images/logos/surtitelas-logo.jpg';
import '../styles/AuthPages.css';

const TEST_ACCOUNTS: { label: string; email: string; password: string }[] = [
  { label: 'Administrador', email: 'admin@surticamisetas.com', password: 'admin123' },
  { label: 'Asesor', email: 'asesor@surticamisetas.com', password: 'asesor123' },
  { label: 'Domiciliario', email: 'domiciliario@surticamisetas.com', password: 'domi123' },
  { label: 'Cliente', email: 'cliente@email.com', password: 'cliente123' },
];

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { loginWithCredentials } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const result = loginWithCredentials(email.trim(), password);

    if (result.success) {
      toast.success('Sesión iniciada');

      if (result.role === 'admin') navigate('/admin/dashboard', { replace: true });
      else if (result.role === 'asesor') navigate('/asesor/dashboard', { replace: true });
      else if (result.role === 'domiciliario') navigate('/domiciliario/dashboard', { replace: true });
      else if (result.role === 'cliente') navigate('/cliente/dashboard', { replace: true });
      else navigate('/catalogo', { replace: true });
    } else {
      toast.error(result.error || 'Correo o contraseña incorrectos');
    }

    setLoading(false);
  };

  const handleGoogleLogin = async () => {
    setLoading(true);

    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      toast.success('Sesión iniciada con Google');
      navigate('/catalogo', { replace: true });
    } catch (err) {
      toast.error('No se pudo iniciar sesión con Google');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div
        className="auth-brand-card cursor-pointer"
        onClick={() => navigate('/login', { replace: true })}
        role="button"
        aria-label="Ir a inicio de sesión"
      >
        <img src={logoImg} alt="Surticamisetas" className="auth-brand-logo" />
      </div>

      <div className="auth-card">
        <div className="auth-header">
          <h1>Bienvenido</h1>
          <p>Ingresa tus credenciales para continuar</p>
        </div>

        <button
          className="auth-google-btn"
          type="button"
          onClick={handleGoogleLogin}
          disabled={loading}
        >
          <span className="auth-google-icon">G</span>
          <span>Continuar con Google</span>
        </button>

        <div className="auth-divider">
          <span>o</span>
        </div>

        <form className="auth-form" onSubmit={handleLogin}>
          <div className="auth-field">
            <label>Correo electrónico</label>
            <div className="auth-input-wrapper">
              <span className="auth-input-icon">
                <Mail size={16} />
              </span>
              <input
                type="email"
                placeholder="correo@ejemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="auth-field">
            <label>Contraseña</label>
            <div className="auth-input-wrapper">
              <span className="auth-input-icon">
                <Lock size={16} />
              </span>
              <input
                type={showPass ? 'text' : 'password'}
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="auth-input-toggle"
                onClick={() => setShowPass((p) => !p)}
                aria-label={showPass ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              >
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div className="auth-forgot-row">
            <button type="button" className="auth-forgot-btn">
              ¿Olvidaste tu contraseña?
            </button>
          </div>

          <button className="auth-primary-btn" type="submit" disabled={loading}>
            {loading ? 'Verificando...' : 'Iniciar sesión'}
          </button>
        </form>

        <div className="auth-test-accounts">
          <p className="text-sm text-slate-500 mb-2">Credenciales de prueba:</p>
          <div className="grid grid-cols-2 gap-2">
            {TEST_ACCOUNTS.map((account) => (
              <button
                key={account.email}
                type="button"
                className="auth-secondary-btn"
                onClick={() => {
                  setEmail(account.email);
                  setPassword(account.password);
                }}
              >
                {account.label}
              </button>
            ))}
          </div>
        </div>

        <div className="auth-footer-text">
          ¿No tienes cuenta?{' '}
          <Link to="/registro" className="auth-link">
            Regístrate
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;



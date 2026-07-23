// src/presentation/pages/RegisterPage.tsx
import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  createUserWithEmailAndPassword,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth';
import { User, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { auth } from '@config/firebase';
import '../styles/AuthPages.css';

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation() as any;
  const from = location.state?.from || '/carrito';

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleGoogleRegister = async () => {
    try {
      setLoading(true);
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      navigate(from, { replace: true });
    } catch (err) {
      console.error(err);
      alert('Error al registrarte con Google');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pass !== confirmPass) {
      alert('Las contraseñas no coinciden');
      return;
    }

    try {
      setLoading(true);
      const cred = await createUserWithEmailAndPassword(auth, email, pass);
      if (name) {
        await updateProfile(cred.user, { displayName: name });
      }
      navigate(from, { replace: true });
    } catch (err) {
      console.error(err);
      alert('No se pudo crear la cuenta. Revisa los datos.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <h1>Crea tu cuenta</h1>
          <p>Registra tus credenciales para continuar</p>
        </div>

        <button
          className="auth-google-btn"
          onClick={handleGoogleRegister}
          disabled={loading}
        >
          <span className="auth-google-icon">G</span>
          <span>Continuar con Google</span>
        </button>

        <div className="auth-divider">
          <span>o</span>
        </div>

        <form className="auth-form" onSubmit={handleRegister}>
          <div className="auth-field">
            <label>Nombre completo</label>
            <div className="auth-input-wrapper">
              <span className="auth-input-icon">
                <User size={16} />
              </span>
              <input
                type="text"
                placeholder="Nombre y apellido"
                value={name}
                onChange={e => setName(e.target.value)}
                required
              />
            </div>
          </div>

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
                onChange={e => setEmail(e.target.value)}
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
                placeholder="Crea una contraseña"
                value={pass}
                onChange={e => setPass(e.target.value)}
                required
              />
              <button
                type="button"
                className="auth-input-toggle"
                onClick={() => setShowPass(p => !p)}
              >
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div className="auth-field">
            <label>Confirmar contraseña</label>
            <div className="auth-input-wrapper">
              <span className="auth-input-icon">
                <Lock size={16} />
              </span>
              <input
                type={showConfirmPass ? 'text' : 'password'}
                placeholder="Repite tu contraseña"
                value={confirmPass}
                onChange={e => setConfirmPass(e.target.value)}
                required
              />
              <button
                type="button"
                className="auth-input-toggle"
                onClick={() => setShowConfirmPass(p => !p)}
              >
                {showConfirmPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="auth-primary-btn"
            disabled={loading}
          >
            Registrarme
          </button>
        </form>

        <div className="auth-footer-text">
          ¿Ya tienes cuenta?{' '}
          <Link to="/login" className="auth-link">
            Iniciar sesión
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;



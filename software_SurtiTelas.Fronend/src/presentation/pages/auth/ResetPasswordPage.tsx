import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Lock, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import partnerLogo from '@/assets/images/logos/partner-logo-2-Photoroom.png';
import { authApi } from '@/infrastructure/api/authApi';
import './AuthPage.css';

const ResetPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) {
      setError('Token de recuperación no válido');
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!token) {
      setError('Token de recuperación no válido');
      return;
    }

    if (!password || password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres');
      return;
    }

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    setLoading(true);

    try {
      await authApi.resetPassword({ token, newPassword: password });
      setSuccess(true);
      toast.success('Contraseña actualizada correctamente');
    } catch {
      setError('No se pudo restablecer la contraseña. El token puede haber expirado.');
      toast.error('Error al restablecer contraseña');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="authPage">
      {/* Left Panel - Branding */}
      <aside className="leftPanel">
        <div className="orb orb1" />
        <div className="orb orb2" />
        <div className="panelDivider" />

        <div className="leftLogo">
          <button
            type="button"
            className="auth-back-btn"
            onClick={() => navigate('/')}
            aria-label="Volver al inicio"
          >
            <ArrowLeft size={16} />
            <span>Volver al inicio</span>
          </button>
          <img src={partnerLogo} alt="Surtitelas" className="partnerLogo" />
        </div>

        <div className="leftContent">
          <p className="leftTagline">Plataforma de gestión</p>
          <h1 className="leftHeading">
            Nueva contraseña
          </h1>
          <p className="leftDesc">
            Ingresa tu nueva contraseña para recuperar el acceso a tu cuenta.
          </p>
        </div>

        <div className="testimonial">
          <p className="testimonialQuote">
            Tu seguridad es nuestra prioridad. Protegemos tus datos con encriptación de última generación.
          </p>
        </div>
      </aside>

      {/* Right Panel - Form */}
      <main className="rightPanel">
        <div className="formCard">
          <div className="mobileLogo">
            <div className="mobileLogoIcon">ST</div>
            <span className="mobileLogoText">Surtitelas</span>
          </div>

          <div className="formHeader">
            <p className="formWelcome">Restablecer contraseña</p>
            <h2 className="formTitle">Crea una nueva contraseña</h2>
            <p className="formSubtitle">
              Asegúrate de usar una contraseña segura y fácil de recordar.
            </p>
          </div>

          {!success ? (
            <form className="form" onSubmit={handleSubmit}>
              {error && (
                <div style={{ marginBottom: '16px', padding: '12px', background: 'rgba(239,68,68,0.1)', borderRadius: '8px', color: '#dc2626', fontSize: '0.875rem' }}>
                  {error}
                </div>
              )}

              <div className="fieldWrap fieldWrap--icon">
                <input
                  className={`fieldInput ${error ? 'fieldInput--error' : ''}`}
                  type="password"
                  placeholder="Nueva contraseña"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  autoComplete="new-password"
                  disabled={loading || !token}
                />
                <label className="fieldLabel">Nueva contraseña</label>
                <span className="fieldIcon"><Lock size={16} /></span>
              </div>

              <div className="fieldWrap fieldWrap--icon">
                <input
                  className={`fieldInput ${error ? 'fieldInput--error' : ''}`}
                  type="password"
                  placeholder="Confirmar contraseña"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  autoComplete="new-password"
                  disabled={loading || !token}
                />
                <label className="fieldLabel">Confirmar contraseña</label>
                <span className="fieldIcon"><Lock size={16} /></span>
              </div>

              <button className={`submitBtn ${loading ? 'submitBtn--loading' : ''}`} type="submit" disabled={loading || !token}>
                <span className="btnInner">
                  {loading ? <span className="spinner" /> : <Lock size={18} />}
                  {loading ? 'Actualizando...' : 'Restablecer contraseña'}
                </span>
              </button>

              <div className="formFooter">
                ¿Recordaste tu contraseña?{' '}
                <button type="button" className="switchLink" onClick={() => navigate('/login')}>Inicia sesión</button>
              </div>
            </form>
          ) : (
            <div className="form">
              <div className="successState" style={{ textAlign: 'center', padding: '20px 0' }}>
                <CheckCircle2 size={48} color="#22c55e" style={{ margin: '0 auto 16px' }} />
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#111111', marginBottom: '8px' }}>
                  ¡Contraseña actualizada!
                </h3>
                <p style={{ fontSize: '0.875rem', color: '#555555', lineHeight: 1.6 }}>
                  Tu contraseña ha sido restablecida correctamente. Ahora puedes iniciar sesión.
                </p>
              </div>

              <button className="submitBtn" onClick={() => navigate('/login')}>
                <span className="btnInner">Ir al inicio de sesión</span>
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default ResetPasswordPage;

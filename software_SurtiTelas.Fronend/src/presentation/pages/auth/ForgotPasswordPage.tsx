import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import partnerLogo from '@/assets/images/logos/partner-logo-2-Photoroom.png';
import { authApi } from '@/infrastructure/api/authApi';
import './AuthPage.css';

const ForgotPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [devResetUrl, setDevResetUrl] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      setError('El email es obligatorio');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Email inválido');
      return;
    }

    setLoading(true);
    setError('');
    setDevResetUrl(null);

    try {
      const result = await authApi.forgotPassword({ email });
      const resetUrl = result.resetUrl || null;
      setDevResetUrl(resetUrl);
      setSuccess(true);
      toast.success('Correo de recuperación enviado');
    } catch {
      setError('No se pudo enviar el correo. Intenta nuevamente.');
      toast.error('Error al enviar correo');
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
            Recupera tu acceso<br />en segundos
          </h1>
          <p className="leftDesc">
            Ingresa tu correo y te enviaremos instrucciones para restablecer tu contraseña.
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
            <p className="formWelcome">Recuperar contraseña</p>
            <h2 className="formTitle">¿Olvidaste tu contraseña?</h2>
            <p className="formSubtitle">
              Ingresa tu correo electrónico para recibir un enlace de recuperación.
            </p>
          </div>

          <div className="tabToggle">
            <button className="tabBtn" onClick={() => navigate('/login')}>Iniciar sesión</button>
            <button className="tabBtn" onClick={() => navigate('/registro')}>Registrarse</button>
          </div>

          {!success ? (
            <div className="form">
              <div className="fieldWrap fieldWrap--icon">
                <input
                  className={`fieldInput ${error ? 'fieldInput--error' : ''}`}
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  autoComplete="email"
                  disabled={loading}
                />
                <label className="fieldLabel">Correo electrónico</label>
                <span className="fieldIcon"><Mail size={16} /></span>
                {error && <span className="fieldError">{error}</span>}
              </div>

              <button className={`submitBtn ${loading ? 'submitBtn--loading' : ''}`} onClick={handleSubmit} disabled={loading}>
                <span className="btnInner">
                  {loading ? <span className="spinner" /> : <Mail size={18} />}
                  {loading ? 'Enviando...' : 'Enviar enlace de recuperación'}
                </span>
              </button>

              <div className="formFooter">
                ¿Recordaste tu contraseña?{' '}
                <button className="switchLink" onClick={() => navigate('/login')}>Inicia sesión</button>
              </div>
            </div>
          ) : (
            <div className="form">
              <div className="successState" style={{ textAlign: 'center', padding: '20px 0' }}>
                <CheckCircle2 size={48} color="#22c55e" style={{ margin: '0 auto 16px' }} />
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#111111', marginBottom: '8px' }}>
                  ¡Email enviado!
                </h3>
                <p style={{ fontSize: '0.875rem', color: '#555555', lineHeight: 1.6 }}>
                  Revisa tu bandeja de entrada y sigue las instrucciones para restablecer tu contraseña.
                </p>
                {devResetUrl && (
                  <div style={{ marginTop: 16, padding: 12, background: '#f1f5f9', borderRadius: 8, textAlign: 'left' }}>
                    <p style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: 8 }}>
                      Estás en modo desarrollo. Usá este enlace para restablecer tu contraseña:
                    </p>
                    <a href={devResetUrl} style={{ fontSize: '0.875rem', color: '#2563eb', wordBreak: 'break-all' }}>
                      {devResetUrl}
                    </a>
                  </div>
                )}
              </div>

              <button className="submitBtn" onClick={() => navigate('/login')}>
                <span className="btnInner">Volver al inicio de sesión</span>
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default ForgotPasswordPage;

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, LogIn, X } from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/app/providers/AppProviders';
import './AuthRequiredModal.css';

interface AuthRequiredModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onContinueShopping?: () => void;
}

const CHECKOUT_RETURN_PATH = '/checkout';

export const AuthRequiredModal: React.FC<AuthRequiredModalProps> = ({
  open,
  onOpenChange,
  onContinueShopping,
}) => {
  const navigate = useNavigate();
  const { isAuthenticated, setReturnTo } = useAuth();

  useEffect(() => {
    if (open && isAuthenticated) {
      onOpenChange(false);
      navigate(CHECKOUT_RETURN_PATH);
    }
  }, [open, isAuthenticated, navigate, onOpenChange]);

  const handleLogin = () => {
    setReturnTo(CHECKOUT_RETURN_PATH);
    onOpenChange(false);
    navigate('/login', { state: { from: CHECKOUT_RETURN_PATH } });
  };

  const handleRegister = () => {
    setReturnTo(CHECKOUT_RETURN_PATH);
    onOpenChange(false);
    navigate('/registro', { state: { from: CHECKOUT_RETURN_PATH } });
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay asChild>
          <motion.div
            className="auth-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
          />
        </Dialog.Overlay>

        <Dialog.Content asChild>
          <motion.div
            className="auth-modal-card"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            aria-describedby="auth-modal-description"
          >
            <Dialog.Close className="auth-modal-close" aria-label="Cerrar modal">
              <X size={18} />
            </Dialog.Close>

            <header className="auth-modal-header">
              <Dialog.Title className="auth-modal-title">
                Iniciar sesión
              </Dialog.Title>
              <p className="auth-modal-subtitle">
                Para continuar con tu compra
              </p>
            </header>

            <Dialog.Description id="auth-modal-description" className="auth-modal-description">
              Ingresa a tu cuenta para continuar con el proceso de compra. Tu carrito se conservará mientras completas el acceso.
            </Dialog.Description>

            <div className="auth-modal-actions">
              <button type="button" className="auth-modal-action primary" onClick={handleLogin}>
                <LogIn size={18} aria-hidden="true" />
                <span>Iniciar sesión</span>
              </button>

              <p className="auth-modal-register">
                ¿Aún no tienes una cuenta?
                <button type="button" className="auth-modal-link" onClick={handleRegister}>
                  Crear cuenta
                </button>
              </p>
            </div>

            <div className="auth-modal-divider" role="separator" />

            <button type="button" className="auth-modal-continue" onClick={onContinueShopping}>
              <ArrowLeft size={16} aria-hidden="true" />
              <span>Seguir comprando</span>
            </button>
          </motion.div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default AuthRequiredModal;
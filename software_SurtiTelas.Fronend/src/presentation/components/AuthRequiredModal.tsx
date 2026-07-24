import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { LogIn, UserPlus, X, ShieldCheck, ShoppingBag } from 'lucide-react';
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
            transition={{ duration: 0.2 }}
          />
        </Dialog.Overlay>

        <Dialog.Content asChild>
          <motion.div
            className="auth-modal-card"
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ duration: 0.24, ease: 'easeOut' }}
            aria-describedby="auth-modal-description"
          >
            <Dialog.Close className="auth-modal-close" aria-label="Cerrar modal">
              <X size={18} />
            </Dialog.Close>

            <div className="auth-modal-icon">
              <ShieldCheck size={28} />
            </div>

            <Dialog.Title className="auth-modal-title">
              Debes iniciar sesión para continuar con tu compra
            </Dialog.Title>

            <Dialog.Description id="auth-modal-description" className="auth-modal-description">
              Debes iniciar sesión para continuar con tu compra. Tu carrito se mantendrá intacto mientras completas el acceso.
            </Dialog.Description>

            <div className="auth-modal-benefits">
              <div className="auth-modal-benefit">
                <ShoppingBag size={18} />
                <span>Carrito preservado</span>
              </div>
              <div className="auth-modal-benefit">
                <ShieldCheck size={18} />
                <span>Checkout protegido</span>
              </div>
            </div>

            <div className="auth-modal-actions">
              <button type="button" className="auth-modal-action secondary" onClick={onContinueShopping}>
                Continuar comprando
              </button>
              <button type="button" className="auth-modal-action ghost" onClick={handleRegister}>
                <UserPlus size={18} />
                Registrarme
              </button>
              <button type="button" className="auth-modal-action primary" onClick={handleLogin}>
                <LogIn size={18} />
                Iniciar Sesión
              </button>
            </div>
          </motion.div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default AuthRequiredModal;


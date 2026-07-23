import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Lock, ShoppingBag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth, useCart } from '@/app/providers/AppProviders';
import { AuthRequiredModal } from './AuthRequiredModal';
import './CheckoutButton.css';

interface CheckoutButtonProps {
  className?: string;
  total?: number;
  disabled?: boolean;
  children?: React.ReactNode;
  onContinueShopping?: () => void;
}

const formatCurrency = (value: number) => `$${value.toLocaleString('es-CO')}`;

export const CheckoutButton: React.FC<CheckoutButtonProps> = ({
  className = '',
  total,
  disabled = false,
  children = 'Finalizar compra',
  onContinueShopping,
}) => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { items } = useCart();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const isEmpty = items.length === 0;

  const handleCheckout = () => {
    if (disabled || isEmpty) {
      toast.error('Tu carrito está vacío.');
      return;
    }

    if (!isAuthenticated) {
      setIsModalOpen(true);
      toast.warning('Necesitas una cuenta para finalizar la compra.');
      return;
    }

    onContinueShopping?.();
  };

  const handleContinueShopping = () => {
    setIsModalOpen(false);
    navigate('/catalogo');
  };

  return (
    <>
      <motion.button
        type="button"
        className={`checkout-button ${className}`}
        onClick={handleCheckout}
        disabled={disabled || isEmpty}
        whileHover={{ y: disabled || isEmpty ? 0 : -2 }}
        whileTap={{ scale: disabled || isEmpty ? 1 : 0.98 }}
      >
        <span className="checkout-button-content">
          <ShoppingBag size={18} />
          <span>{children}</span>
        </span>
        {total !== undefined && <strong>{formatCurrency(total)}</strong>}
        {total === undefined && <ArrowRight size={18} />}
      </motion.button>

      <AnimatePresence>
        {isModalOpen && (
          <AuthRequiredModal
            open={isModalOpen}
            onOpenChange={setIsModalOpen}
            onContinueShopping={handleContinueShopping}
          />
        )}
      </AnimatePresence>

      {isModalOpen && (
        <motion.div
          className="checkout-auth-lock"
          aria-hidden="true"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <Lock size={18} />
        </motion.div>
      )}
    </>
  );
};

export default CheckoutButton;

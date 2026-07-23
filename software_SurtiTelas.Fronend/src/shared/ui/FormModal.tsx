import { ReactNode } from 'react';
import { BaseModal, type BaseModalProps } from './Modal';

export interface FormModalProps extends Omit<BaseModalProps, 'variant'> {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
  size?: BaseModalProps['size'];
}

export const FormModal = ({ open, onClose, size = 'md', footer, children, ...props }: FormModalProps) => (
  <BaseModal
    {...props}
    open={open}
    onClose={onClose}
    size={size}
    variant="form"
    bodyClassName="space-y-5"
    footer={footer}
  >
    {children}
  </BaseModal>
);

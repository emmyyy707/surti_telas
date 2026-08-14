import React from 'react';
import { CheckCircle2, XCircle, Clock, Package, FileText, Ban } from 'lucide-react';
import { Badge } from '@/shared/ui/Badge';
import { CUSTOM_ORDER_STATUS_COLORS } from '@/shared/constants/options';
import type { CustomOrderEstado } from '@/infrastructure/api/customOrdersApi';
import styles from './CustomOrderStatusSelector.module.css';

interface CustomOrderStatusSelectorProps {
  currentStatus: CustomOrderEstado;
  selectedStatus: CustomOrderEstado;
  onSelectedStatusChange: (status: CustomOrderEstado) => void;
  disabled?: boolean;
}

const STATUS_CONFIG: Record<CustomOrderEstado, { icon: React.ReactNode; label: string; description: string }> = {
  SOLICITUD_RECIBIDA: {
    icon: <FileText size={18} />,
    label: 'Solicitud recibida',
    description: 'La solicitud fue registrada y está pendiente de revisión'
  },
  EN_REVISION: {
    icon: <Clock size={18} />,
    label: 'En revisión',
    description: 'La solicitud está siendo evaluada por el equipo'
  },
  COTIZADO: {
    icon: <FileText size={18} />,
    label: 'Cotizado',
    description: 'Se generó una cotización para el cliente'
  },
  COTIZACION_ACEPTADA: {
    icon: <CheckCircle2 size={18} />,
    label: 'Cotización aceptada',
    description: 'El cliente aceptó la cotización'
  },
  COTIZACION_RECHAZADA: {
    icon: <XCircle size={18} />,
    label: 'Cotización rechazada',
    description: 'El cliente rechazó la cotización'
  },
  PAGO_PENDIENTE: {
    icon: <Clock size={18} />,
    label: 'Pago pendiente',
    description: 'Esperando el pago del anticipo'
  },
  PAGO_EN_VERIFICACION: {
    icon: <Clock size={18} />,
    label: 'Pago en verificación',
    description: 'El comprobante está siendo verificado'
  },
  PAGO_APROBADO: {
    icon: <CheckCircle2 size={18} />,
    label: 'Pago aprobado',
    description: 'El anticipo fue aprobado'
  },
  EN_PRODUCCION: {
    icon: <Package size={18} />,
    label: 'En producción',
    description: 'La orden de producción está en curso'
  },
  COMPLETADO: {
    icon: <CheckCircle2 size={18} />,
    label: 'Completado',
    description: 'La orden de producción fue finalizada'
  },
  CANCELADO: {
    icon: <Ban size={18} />,
    label: 'Cancelado',
    description: 'La solicitud fue cancelada'
  },
  CONVERTIDO_A_PEDIDO: {
    icon: <FileText size={18} />,
    label: 'Convertido a pedido',
    description: 'La solicitud se convirtió en un pedido normal'
  },
  VENCIDO: {
    icon: <XCircle size={18} />,
    label: 'Vencido',
    description: 'La solicitud o cotización ha vencido'
  },
};

export const CUSTOM_ORDER_STATUS_TRANSITIONS: Record<CustomOrderEstado, CustomOrderEstado[]> = {
  SOLICITUD_RECIBIDA: ['EN_REVISION', 'CANCELADO'],
  EN_REVISION: ['COTIZADO', 'CANCELADO'],
  COTIZADO: ['COTIZACION_ACEPTADA', 'COTIZACION_RECHAZADA', 'CANCELADO'],
  COTIZACION_ACEPTADA: ['PAGO_PENDIENTE', 'CANCELADO'],
  COTIZACION_RECHAZADA: ['SOLICITUD_RECIBIDA', 'CANCELADO'],
  PAGO_PENDIENTE: ['PAGO_EN_VERIFICACION', 'CANCELADO'],
  PAGO_EN_VERIFICACION: ['PAGO_APROBADO', 'CANCELADO'],
  PAGO_APROBADO: ['CONVERTIDO_A_PEDIDO', 'CANCELADO'],
  EN_PRODUCCION: ['COMPLETADO', 'CANCELADO'],
  COMPLETADO: [],
  CANCELADO: [],
  CONVERTIDO_A_PEDIDO: [],
  VENCIDO: [],
};

export const CustomOrderStatusSelector: React.FC<CustomOrderStatusSelectorProps> = ({
  currentStatus,
  selectedStatus,
  onSelectedStatusChange,
  disabled = false
}) => {
  const allowedTransitions = CUSTOM_ORDER_STATUS_TRANSITIONS[currentStatus] || [];
  const currentConfig = STATUS_CONFIG[currentStatus];

  if (allowedTransitions.length === 0) {
    if (import.meta.env.DEV) {
      console.warn('[CustomOrderStatusSelector] No transitions allowed', { currentStatus, allowedTransitions });
    }
    return (
      <div className={styles.container}>
        <div className={styles.currentStatus}>
          <span className={styles.label}>Estado actual</span>
          <Badge variant={CUSTOM_ORDER_STATUS_COLORS[currentStatus] ?? 'default'}>
            {currentConfig?.icon}
            {currentConfig?.label}
          </Badge>
        </div>
        <div className={styles.noTransitions}>
          <p className={styles.noTransitionsText}>
            Este pedido no puede cambiar de estado desde &quot;{currentConfig?.label ?? currentStatus}&quot;.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.currentStatus}>
        <span className={styles.label}>Estado actual</span>
        <Badge variant={CUSTOM_ORDER_STATUS_COLORS[currentStatus] ?? 'default'}>
          {currentConfig?.icon}
          {currentConfig?.label}
        </Badge>
      </div>

      <div className={styles.section}>
        <span className={styles.sectionLabel}>Seleccionar nuevo estado</span>
        <div className={styles.grid}>
          {allowedTransitions.map((status) => {
            const config = STATUS_CONFIG[status];
            const isSelected = selectedStatus === status;

            return (
              <button
                key={status}
                type="button"
                role="option"
                aria-selected={isSelected}
                disabled={disabled}
                className={`${styles.option} ${isSelected ? styles.optionSelected : ''}`}
                onClick={() => onSelectedStatusChange(status)}
              >
                <span className={styles.optionContent}>
                  <span className={styles.optionIcon}>{config.icon}</span>
                  <span className={styles.optionText}>
                    <span className={styles.optionLabel}>{config.label}</span>
                    <span className={styles.optionDescription}>{config.description}</span>
                  </span>
                </span>
                {isSelected && (
                  <CheckCircle2 size={20} className={styles.checkIcon} />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

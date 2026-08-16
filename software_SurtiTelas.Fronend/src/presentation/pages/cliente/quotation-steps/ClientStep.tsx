import { type UseFormRegister, type FieldErrors } from 'react-hook-form';
import { type FormValues } from '../MisPedidosPersonalizados';

export interface ClientStepProps {
  register: UseFormRegister<FormValues>;
  errors: FieldErrors<FormValues>;
  styles: Record<string, string>;
}

export const ClientStep = ({ register, errors, styles }: ClientStepProps) => {
  return (
    <div className={styles.sectionBlock}>
      <div className={styles.formRow}>
        <div className={`${styles.field} ${styles.colSpan2}`}>
          <label htmlFor="cliente-nombre" className={styles.label}>Cliente <span className={styles.labelRequired}>*</span></label>
          <input
            id="cliente-nombre"
            className={`${styles.input}`}
            placeholder="Cliente"
            aria-required="true"
            {...register('clienteNombre')}
          />
          {errors.clienteNombre && <span className={styles.errorText}>{errors.clienteNombre.message as string}</span>}
        </div>
      </div>
      <div className={styles.formRow}>
        <div className={styles.field}>
          <label htmlFor="cliente-email" className={styles.label}>Email</label>
          <input id="cliente-email" className={styles.input} placeholder="Email" {...register('clienteEmail')} />
          {errors.clienteEmail && <span className={styles.errorText}>{errors.clienteEmail.message as string}</span>}
        </div>
        <div className={styles.field}>
          <label htmlFor="cliente-telefono" className={styles.label}>Teléfono</label>
          <input id="cliente-telefono" className={styles.input} placeholder="Teléfono" {...register('clienteTelefono')} />
        </div>
      </div>
    </div>
  );
};

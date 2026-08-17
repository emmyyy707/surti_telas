import { type UseFormRegister } from 'react-hook-form';
import { type FormValues } from '../MisPedidosPersonalizados';

export interface DeliveryStepProps {
  register: UseFormRegister<FormValues>;
  styles: Record<string, string>;
  direccionEntrega: string;
}

export const DeliveryStep = ({
  register,
  styles,
  direccionEntrega,
}: DeliveryStepProps) => {
  return (
    <div className={styles.sectionBlock}>
      <div className={styles.summarySection}>
        <label htmlFor="direccion-entrega" className={styles.label}>Dirección de entrega</label>
        <input
          id="direccion-entrega"
          type="text"
          className={styles.input}
          placeholder="Ingresa la dirección de entrega"
          {...register('direccionEntrega')}
        />
      </div>

      <div className={styles.summarySection}>
        <label htmlFor="fecha-entrega" className={styles.label}>Fecha solicitada de entrega</label>
        <input id="fecha-entrega" type="date" className={styles.input} {...register('fechaEntregaDeseada')} />
      </div>

      <div className={styles.summarySection}>
        <label htmlFor="uso-pedido" className={styles.label}>Uso del pedido</label>
        <select id="uso-pedido" className={styles.select} {...register('usoFinal')}>
          <option value="">Selecciona</option>
          <option value="USO_PERSONAL">Uso personal</option>
          <option value="EMPRESA">Empresa</option>
          <option value="UNIFORME">Uniforme</option>
          <option value="EVENTO">Evento</option>
          <option value="REGALO">Regalo</option>
          <option value="OTRO">Otro</option>
        </select>
      </div>

      <div className={styles.summarySection}>
        <label htmlFor="notas-cliente" className={styles.label}>Observaciones</label>
        <textarea id="notas-cliente" className={styles.textarea} placeholder="Notas adicionales..." {...register('notasCliente')} />
      </div>
    </div>
  );
};

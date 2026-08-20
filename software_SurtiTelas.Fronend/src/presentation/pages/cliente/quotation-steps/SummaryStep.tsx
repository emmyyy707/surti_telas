import { type UseFormWatch } from 'react-hook-form';
import { type FormValues } from '../MisPedidosPersonalizados';
import { CustomOrderSummary, type CustomOrderSummaryData } from './CustomOrderSummary';

export interface SummaryStepProps {
  watch: UseFormWatch<FormValues>;
  styles: Record<string, string>;
  onEditClient: () => void;
  onEditProducts: () => void;
  onEditDelivery: () => void;
}

export const SummaryStep = ({ watch, styles, onEditClient, onEditProducts, onEditDelivery }: SummaryStepProps) => {
  const data: CustomOrderSummaryData = {
    clienteNombre: watch('clienteNombre'),
    clienteEmail: watch('clienteEmail'),
    clienteTelefono: watch('clienteTelefono'),
    notasReferencia: watch('notasReferencia') || undefined,
    items: (watch('items') || []).map((item) => ({
      id: item.id,
      productoNombre: item.productoNombre,
      descripcion: item.descripcion,
      tipoPersonalizacion: item.tipoPersonalizacion,
      cantidad: Object.values(item.distribucionTallas || {}).reduce((sum: number, val: any) => sum + (Number(val) || 0), 0),
      material: item.material,
      talla: item.talla,
      color: item.color,
      especificaciones: item.especificaciones,
      distribucionTallas: item.distribucionTallas
        ? Object.fromEntries(
            Object.entries(item.distribucionTallas).map(([k, v]) => [k, Number(v) || 0])
          ) as Record<string, number>
        : undefined,
      imagenesReferencia: item.imagenesReferencia || undefined,
      personalizaciones: (item.personalizaciones || []).map((pers) => ({
        tipo: pers.tipo,
        tecnica: pers.tecnica,
        descripcion: pers.descripcion,
        ubicacion: pers.ubicacion,
        archivos: pers.archivos,
        variantes: (pers.variantes || []).map((v) => ({
          talla: v.talla,
          color: v.color,
          cantidad: Number(v.cantidad) || 0,
        })),
      })),
    })),
    fechaEntregaDeseada: watch('fechaEntregaDeseada') || undefined,
    usoFinal: watch('usoFinal') || undefined,
    direccionEntrega: watch('direccionEntrega') || undefined,
    notasCliente: watch('notasCliente') || undefined,
  };

  return (
    <CustomOrderSummary
      data={data}
      styles={styles}
      title="Cliente"
      extraHeader={
        <div style={{ display: 'flex', gap: '8px' }}>
          <button type="button" className={styles.btnLink} onClick={onEditClient}>Editar</button>
        </div>
      }
    />
  );
};

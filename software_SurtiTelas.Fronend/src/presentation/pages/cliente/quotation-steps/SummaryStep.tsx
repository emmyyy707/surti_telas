import { type UseFormWatch } from 'react-hook-form';
import { type FormValues } from '../MisPedidosPersonalizados';
import { Skeleton } from './Skeleton';

export interface SummaryStepProps {
  watch: UseFormWatch<FormValues>;
  styles: Record<string, string>;
  onEditClient: () => void;
  onEditProducts: () => void;
  onEditDelivery: () => void;
}

export const SummaryStep = ({ watch, styles, onEditClient, onEditProducts, onEditDelivery }: SummaryStepProps) => {
  return (
    <div className={styles.sectionBlock}>
      <div className={styles.summarySection}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <h3 className={styles.summaryTitle}>Cliente</h3>
          <button type="button" className={styles.btnLink} onClick={onEditClient}>Editar</button>
        </div>
        <div className={styles.summaryRow}><span>Nombre</span><span>{watch('clienteNombre') || '-'}</span></div>
        <div className={styles.summaryRow}><span>Email</span><span>{watch('clienteEmail') || '-'}</span></div>
        <div className={styles.summaryRow}><span>Teléfono</span><span>{watch('clienteTelefono') || '-'}</span></div>
      </div>

      <div className={styles.summarySection}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <h3 className={styles.summaryTitle}>Productos</h3>
          <button type="button" className={styles.btnLink} onClick={onEditProducts}>Editar</button>
        </div>
        {(watch('items') || []).length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <Skeleton width="100%" height={14} />
            <Skeleton width="80%" height={14} />
            <Skeleton width="60%" height={14} />
          </div>
        ) : (watch('items') || []).map((item: any, idx: number) => {
            const distribucion = Object.entries(item.distribucionTallas || {}).filter(([, v]) => Number(v as any) > 0) as [string, number][];
            const totalDistribucion = distribucion.reduce((sum: number, [, v]) => sum + v, 0);
            return (
              <div key={item.id || idx} className={styles.summaryProductCard}>
                <div className={styles.summaryProductTitle}>Producto #{idx + 1}: {item.productoNombre || item.descripcion || 'Sin nombre'}</div>
                <div className={styles.summaryRow}><span>Cantidad</span><span>{item.cantidad || '-'}</span></div>
                <div className={styles.summaryRow}><span>Material</span><span>{item.material || '-'}</span></div>
                {(!item.personalizaciones || item.personalizaciones.length === 0) && (
                  <>
                    <div className={styles.summaryRow}><span>Tipo</span><span>{item.tipoPersonalizacion || '-'}</span></div>
                    <div className={styles.summaryRow}><span>Descripción</span><span>{item.descripcion || item.productoNombre || '-'}</span></div>
                  </>
                )}
                {distribucion.length > 0 && (
                  <>
                    <div className={styles.summarySubTitle}>Distribución de prendas</div>
                    {distribucion.map(([talla, cant]) => (
                      <div key={talla} className={styles.summaryRow}><span>{talla}</span><span>{cant}</span></div>
                    ))}
                    <div className={styles.summaryRow}><span>Total</span><span>{totalDistribucion}</span></div>
                  </>
                  )}
                 {item.imagenesReferencia && item.imagenesReferencia.length > 0 && (
                   <>
                     <div className={styles.summarySubTitle}>Imágenes de referencia</div>
                     <div className={styles.filePreview}>
                       {item.imagenesReferencia.map((url: string, imgIdx: number) => (
                         <img key={imgIdx} src={url} alt={`Referencia ${imgIdx + 1}`} className={styles.fileChipImage} />
                       ))}
                     </div>
                   </>
                 )}
                 {(() => {
                  const validPersonalizaciones = (item.personalizaciones || []).filter((pers: any) => {
                    const hasTipo = !!pers.tipo;
                    const hasDescripcion = !!pers.descripcion && pers.descripcion.trim() !== '';
                    const hasUbicacion = Array.isArray(pers.ubicacion) && pers.ubicacion.length > 0;
                    const hasVariantes = (pers.variantes || []).some((v: any) => Number(v.cantidad) > 0);
                    return hasTipo && (hasDescripcion || hasUbicacion || hasVariantes);
                  });
                  if (validPersonalizaciones.length === 0) return null;
                  return (
                    <>
                      <div className={styles.summarySubTitle}>Personalizaciones</div>
                      {validPersonalizaciones.map((pers: any, pIdx: number) => {
                        const varianteTotal = (pers.variantes || []).reduce((sum: number, v: any) => sum + (Number(v.cantidad) || 0), 0);
                        return (
                          <div key={pIdx} className={styles.summaryPersonalizationCard}>
                            <div className={styles.summaryPersonalizationTitle}>{pers.tipo}</div>
                            <div className={styles.summaryPersonalizationMeta}>
                              {(pers.ubicacion || []).map((u: string) => u.replace('MANGA_IZQUIERDA', 'Manga izq.').replace('MANGA_DERECHA', 'Manga der.')).join(', ') || '-'}
                            </div>
                            <div className={styles.summaryPersonalizationDescription}>{pers.descripcion || '-'}</div>
                            {(pers.variantes || []).length > 0 && (
                              <div className={styles.summaryPersonalizationVariants}>
                                {(pers.variantes || []).map((variante: any, vIdx: number) => (
                                  <div key={vIdx} className={styles.summaryRow}>
                                    <span>{variante.talla || '-'} / {variante.color || '-'}</span>
                                    <span>{Number(variante.cantidad) || 0}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                            <div className={styles.summaryPersonalizationTotal}>
                              {varianteTotal} unidad{varianteTotal !== 1 ? 'es' : ''}
                            </div>
                          </div>
                        );
                      })}
                    </>
                  );
                })()}
              </div>
            );
           })}
       </div>

      <div className={styles.summarySection}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <h3 className={styles.summaryTitle}>Entrega</h3>
          <button type="button" className={styles.btnLink} onClick={onEditDelivery}>Editar</button>
        </div>
        <div className={styles.summaryRow}><span>Fecha solicitada</span><span>{watch('fechaEntregaDeseada') ? new Date(watch('fechaEntregaDeseada') as string).toLocaleDateString('es-CO') : '-'}</span></div>
        <div className={styles.summaryRow}><span>Uso</span><span>{watch('usoFinal') || '-'}</span></div>
        <div className={styles.summaryRow}><span>Dirección de entrega</span><span>{watch('direccionEntrega') || '-'}</span></div>
        <div className={styles.summaryRow}><span>Observaciones</span><span>{watch('notasCliente') || '-'}</span></div>
      </div>
    </div>
  );
};

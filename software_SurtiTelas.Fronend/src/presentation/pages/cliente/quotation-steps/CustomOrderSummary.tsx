import { type ReactNode } from 'react';

export interface CustomOrderSummaryData {
  clienteNombre?: string;
  clienteEmail?: string | null;
  clienteTelefono?: string | null;
  descripcionGeneral?: string | null;
  notasReferencia?: string | null;
  items: Array<{
    id?: string;
    productoNombre?: string | null;
    descripcion?: string | null;
    tipoPersonalizacion?: string;
    cantidad?: number;
    material?: string | null;
    talla?: string | null;
    color?: string | null;
    especificaciones?: string | null;
    distribucionTallas?: Record<string, number> | null;
    imagenesReferencia?: string[] | null;
    personalizaciones?: Array<{
      tipo?: string;
      tecnica?: string | null;
      descripcion?: string;
      ubicacion?: string[] | null;
      archivos?: string[] | null;
      variantes?: Array<{
        talla?: string;
        color?: string;
        cantidad?: number;
      }>;
    }>;
  }>;
  fechaEntregaDeseada?: string | null;
  usoFinal?: string | null;
  direccionEntrega?: string | null;
  notasCliente?: string | null;
  estado?: string;
}

export interface CotizacionResumen {
  estado?: string;
  validaHasta?: string | null;
  condicionesPago?: string | null;
  subtotal?: number | string | null;
  descuento?: number | string | null;
  impuestos?: number | string | null;
  total?: number | string | null;
  detalles?: Array<{
    descripcion?: string | null;
    tipo?: string | null;
    cantidad?: number | string | null;
    precioUnitario?: number | string | null;
    subtotal?: number | string | null;
  }>;
  negotiationCount?: number | null;
}

export interface CustomOrderSummaryProps {
  data: CustomOrderSummaryData;
  styles: Record<string, string>;
  title?: string;
  extraHeader?: ReactNode;
  cotizacion?: CotizacionResumen;
  footerActions?: Array<{
    label: string;
    onClick?: () => void;
    variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
    disabled?: boolean;
  }>;
}

function formatDate(value?: string | null): string {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleDateString('es-CO');
}

function renderThumbnails(urls: string[] | null | undefined, styles: Record<string, string>): ReactNode {
  if (!urls || urls.length === 0) return null;
  const placeholder = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><rect width="32" height="32" fill="%23e2e8f0"/><text x="16" y="20" text-anchor="middle" font-size="10" fill="%2394a3b8">IMG</text></svg>';
  return (
    <div className={styles.filePreview}>
      {urls.map((url, imgIdx) => (
        <img key={imgIdx} src={url} alt={`Referencia ${imgIdx + 1}`} className={styles.fileChipImage} onError={(e) => { e.currentTarget.src = placeholder; }} />
      ))}
    </div>
  );
}

export const CustomOrderSummary = ({ data, styles, title, extraHeader, cotizacion, footerActions }: CustomOrderSummaryProps) => {
  const items = data.items || [];

  const formatCurrency = (value: number | string | null | undefined) => {
    if (value === null || value === undefined) return '-';
    const num = typeof value === 'string' ? Number(value) : value;
    if (Number.isNaN(num)) return '-';
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(num);
  };

  return (
    <div className={styles.sectionBlock}>
      <div className={styles.summarySection}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <h3 className={styles.summaryTitle}>{title || 'Cliente'}</h3>
          {extraHeader}
        </div>
        <div className={styles.summaryRow}><span>Nombre</span><span>{data.clienteNombre || '-'}</span></div>
        <div className={styles.summaryRow}><span>Email</span><span>{data.clienteEmail || '-'}</span></div>
        <div className={styles.summaryRow}><span>Teléfono</span><span>{data.clienteTelefono || '-'}</span></div>
        {data.estado && (
          <div className={styles.summaryRow}>
            <span>Estado</span>
            <span>{data.estado}</span>
          </div>
        )}
      </div>

      {data.descripcionGeneral && (
        <div className={styles.summarySection}>
          <h3 className={styles.summaryTitle}>Descripción general</h3>
          <div className={styles.summaryRow}><span>{data.descripcionGeneral}</span></div>
        </div>
      )}

      {data.notasReferencia && (
        <div className={styles.summarySection}>
          <h3 className={styles.summaryTitle}>Notas de referencia</h3>
          <div className={styles.summaryRow}><span>{data.notasReferencia}</span></div>
        </div>
      )}

      <div className={styles.summarySection}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <h3 className={styles.summaryTitle}>Productos</h3>
        </div>
        {items.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ height: 14, width: '100%', background: 'rgba(255,255,255,0.06)', borderRadius: 4 }} />
            <div style={{ height: 14, width: '80%', background: 'rgba(255,255,255,0.06)', borderRadius: 4 }} />
            <div style={{ height: 14, width: '60%', background: 'rgba(255,255,255,0.06)', borderRadius: 4 }} />
          </div>
        ) : (
          items.map((item, idx) => {
            const distribucion = Object.entries(item.distribucionTallas || {})
              .filter(([, v]) => v !== null && v !== undefined && Number(v) > 0) as [string, number][];
            const totalDistribucion = distribucion.reduce((sum, [, v]) => sum + v, 0);

            return (
              <div key={item.id || idx} className={styles.summaryProductCard}>
                <div className={styles.summaryProductTitle}>Producto #{idx + 1}: {item.productoNombre || item.descripcion || 'Sin nombre'}</div>
                <div className={styles.summaryRow}><span>Cantidad</span><span>{totalDistribucion || '-'}</span></div>
                {item.talla && <div className={styles.summaryRow}><span>Talla</span><span>{item.talla}</span></div>}
                {item.color && <div className={styles.summaryRow}><span>Color</span><span>{item.color}</span></div>}
                <div className={styles.summaryRow}><span>Material</span><span>{item.material || '-'}</span></div>
                {item.especificaciones && (
                  <div className={styles.summaryRow}><span>Especificaciones</span><span>{item.especificaciones}</span></div>
                )}
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
                 {renderThumbnails(item.imagenesReferencia, styles)}
                 {(() => {
                   const validPersonalizaciones = (item.personalizaciones || []).filter((pers) => {
                     const hasTipo = !!pers.tipo;
                     const hasDescripcion = !!pers.descripcion && pers.descripcion.trim() !== '';
                     const hasUbicacion = Array.isArray(pers.ubicacion) && pers.ubicacion.length > 0;
                     const hasVariantes = (pers.variantes || []).some((v) => Number(v.cantidad) > 0);
                     return hasTipo && (hasDescripcion || hasUbicacion || hasVariantes);
                   });
                   if (validPersonalizaciones.length === 0) return null;
                   return (
                     <>
                       <div className={styles.summarySubTitle}>Personalizaciones</div>
                       {validPersonalizaciones.map((pers, pIdx) => {
                         const varianteTotal = (pers.variantes || []).reduce((sum, v) => sum + (Number(v.cantidad) || 0), 0);
                         return (
                           <div key={pIdx} className={styles.summaryPersonalizationCard}>
                             <div className={styles.summaryPersonalizationTitle}>{pers.tipo}</div>
                             {pers.tecnica && (
                               <div className={styles.summaryPersonalizationMeta}>Técnica: {pers.tecnica}</div>
                             )}
                             <div className={styles.summaryPersonalizationMeta}>
                               {(pers.ubicacion || []).map((u) => u.replace('MANGA_IZQUIERDA', 'Manga izq.').replace('MANGA_DERECHA', 'Manga der.')).join(', ') || '-'}
                             </div>
                             <div className={styles.summaryPersonalizationDescription}>{pers.descripcion || '-'}</div>
                             {renderThumbnails(pers.archivos, styles)}
                             {(pers.variantes || []).length > 0 && (
                               <div className={styles.summaryPersonalizationVariants}>
                                 {(pers.variantes || []).map((variante, vIdx) => (
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
                 {(() => {
                   const hasItemImages = (item.imagenesReferencia || []).length > 0;
                   const hasPersonalizationImages = (item.personalizaciones || []).some((pers) => (pers.archivos || []).length > 0);
                   if (hasItemImages || hasPersonalizationImages) return null;
                   return <div className={styles.summaryRow}><span>Sin imágenes de referencia</span></div>;
                 })()}
               </div>
             );
           })
         )}
       </div>

      {cotizacion && (
        <div className={styles.summarySection}>
          <div className={styles.summaryTitle}>Cotización</div>
          <div className={styles.summaryRow}>
            <span>Estado</span>
            <span>{cotizacion.estado || '-'}</span>
          </div>
          {cotizacion.negotiationCount !== undefined && cotizacion.negotiationCount !== null && (
            <div className={styles.summaryRow}>
              <span>Negociaciones</span>
              <span>{cotizacion.negotiationCount}/3</span>
            </div>
          )}
          {cotizacion.validaHasta && (
            <div className={styles.summaryRow}>
              <span>Vigencia</span>
              <span>{formatDate(cotizacion.validaHasta)}</span>
            </div>
          )}
          {cotizacion.condicionesPago && (
            <div className={styles.summaryRow}>
              <span>Condiciones</span>
              <span>{cotizacion.condicionesPago}</span>
            </div>
          )}
          {cotizacion.detalles && cotizacion.detalles.length > 0 && (
            <>
              <div className={styles.summarySubTitle}>Conceptos</div>
              <div className={styles.quotationTable}>
                <div className={styles.quotationHeader}>
                  <span className={styles.quotationColDesc}>Concepto</span>
                  <span className={styles.quotationColCant}>Cant.</span>
                  <span className={styles.quotationColUnit}>P. unitario</span>
                  <span className={styles.quotationColSub}>Subtotal</span>
                </div>
                {cotizacion.detalles.map((detalle, idx) => (
                  <div key={idx} className={styles.quotationRow}>
                    <div className={styles.quotationColDesc}>
                      <span>{detalle.descripcion || detalle.tipo || '-'}</span>
                    </div>
                    <div className={styles.quotationColCant}>
                      <span>{detalle.cantidad ?? '-'}</span>
                    </div>
                    <div className={styles.quotationColUnit}>
                      <span>{formatCurrency(detalle.precioUnitario)}</span>
                    </div>
                    <div className={styles.quotationColSub}>
                      <span>{formatCurrency(detalle.subtotal)}</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className={styles.quotationSummary} style={{ marginTop: '12px' }}>
                <div className={styles.quotationSummaryRow}>
                  <span>Subtotal</span>
                  <span>{formatCurrency(cotizacion.subtotal)}</span>
                </div>
                {Number(cotizacion.descuento) > 0 && (
                  <div className={styles.quotationSummaryRow}>
                    <span>Descuento</span>
                    <span>-{formatCurrency(cotizacion.descuento)}</span>
                  </div>
                )}
                {Number(cotizacion.impuestos) > 0 && (
                  <div className={styles.quotationSummaryRow}>
                    <span>Impuestos</span>
                    <span>{formatCurrency(cotizacion.impuestos)}</span>
                  </div>
                )}
                <div className={`${styles.quotationSummaryRow} ${styles.quotationSummaryTotal}`}>
                  <span>Total</span>
                  <span>{formatCurrency(cotizacion.total)}</span>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {footerActions && footerActions.length > 0 && (
        <div className={styles.formActions}>
          {footerActions.map((action, idx) => (
            <button
              key={idx}
              type="button"
              onClick={action.onClick}
              disabled={action.disabled}
              style={{
                padding: '8px 14px',
                borderRadius: 'var(--radius-md)',
                border: 'none',
                cursor: action.disabled ? 'not-allowed' : 'pointer',
                opacity: action.disabled ? 0.6 : 1,
                background: action.variant === 'danger' ? 'var(--color-danger)' : action.variant === 'secondary' ? 'transparent' : 'var(--color-accent)',
                color: '#fff',
                fontSize: '0.85rem',
                fontWeight: 600,
              }}
            >
              {action.label}
            </button>
          ))}
        </div>
      )}

      <div className={styles.summarySection}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <h3 className={styles.summaryTitle}>Entrega</h3>
        </div>
        <div className={styles.summaryRow}><span>Fecha solicitada</span><span>{formatDate(data.fechaEntregaDeseada)}</span></div>
        <div className={styles.summaryRow}><span>Uso</span><span>{data.usoFinal || '-'}</span></div>
        <div className={styles.summaryRow}><span>Dirección de entrega</span><span>{data.direccionEntrega || '-'}</span></div>
        <div className={styles.summaryRow}><span>Observaciones</span><span>{data.notasCliente || '-'}</span></div>
      </div>
    </div>
  );
};

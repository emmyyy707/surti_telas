import React from 'react';
import type { Producto } from '@/core/types';
import { Modal } from '@/shared/ui/Modal';
import { Badge } from '@/shared/ui/Badge';
import { Calendar, Tag } from 'lucide-react';

interface ProductPreviewModalProps {
  open: boolean;
  onClose: () => void;
  product: Producto | null;
}

export const ProductPreviewModal: React.FC<ProductPreviewModalProps> = ({ open, onClose, product }) => {
  if (!product) return null;

  const imagenSrc = product.imagenPrincipal && product.imagenPrincipal.trim() !== ''
    ? product.imagenPrincipal
    : product.imagenes && product.imagenes.length > 0
      ? product.imagenes[0]
      : '';

  return (
    <Modal open={open} onClose={onClose} title="Vista previa del producto" size="lg">
      <div style={{ display: 'flex', gap: '28px', flexWrap: 'wrap' }}>
        <div style={{ flex: '0 0 280px', minWidth: '240px' }}>
          {imagenSrc ? (
            <img
              src={imagenSrc}
              alt={product.nombre}
              style={{
                width: '100%',
                aspectRatio: '1 / 1',
                objectFit: 'cover',
                borderRadius: '12px',
                border: '1px solid var(--color-border)',
              }}
            />
          ) : (
            <div
              style={{
                width: '100%',
                aspectRatio: '1 / 1',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'var(--color-bg-elevated)',
                color: 'var(--color-text-muted)',
                borderRadius: '12px',
                fontSize: '1rem',
              }}
            >
              Sin imagen
            </div>
          )}

          {product.imagenes && product.imagenes.length > 1 && (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '8px',
              marginTop: '12px',
            }}>
              {product.imagenes.slice(1, 4).map((img, i) => (
                <img
                  key={i}
                  src={img}
                  alt={`${product.nombre} ${i + 2}`}
                  style={{
                    width: '100%',
                    aspectRatio: '1 / 1',
                    objectFit: 'cover',
                    borderRadius: '8px',
                    border: '1px solid rgba(255,255,255,0.08)',
                  }}
                />
              ))}
            </div>
          )}
        </div>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '16px', minWidth: '240px' }}>
          <div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--color-text-primary)', margin: '0 0 8px' }}>
              {product.nombre}
            </h2>
            <div style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', display: 'flex', gap: '8px', alignItems: 'center' }}>
              <Tag size={13} />
              <span>{product.codigo || product.ref}</span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {product.publicado && <Badge variant="success">Publicado</Badge>}
            {!product.publicado && product.estado === 'Activo' && <Badge variant="warning">Borrador</Badge>}
            {!product.publicado && product.estado === 'Inactivo' && <Badge variant="danger">Oculto</Badge>}
            {product.destacado && <Badge variant="warning">⭐ Destacado</Badge>}
            {product.oferta && <Badge variant="danger">🔥 Oferta</Badge>}
            {product.nuevo && <Badge variant="info">🆕 Nuevo</Badge>}
            {product.masVendido && <Badge variant="primary">🏆 Más vendido</Badge>}
            {product.stock === 'Agotado' && <Badge variant="danger">Agotado</Badge>}
            {product.stock === 'Bajo stock' && <Badge variant="warning">Stock bajo</Badge>}
          </div>

          <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px' }}>
            <span style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--color-accent)' }}>
              ${product.precio.toLocaleString()}
            </span>
            {product.precioAnterior && product.precioAnterior > product.precio && (
              <span style={{ fontSize: '1.1rem', color: 'var(--color-text-muted)', textDecoration: 'line-through' }}>
                ${product.precioAnterior.toLocaleString()}
              </span>
            )}
            {(product.descuento ?? 0) > 0 && (
              <Badge variant="danger">-{product.descuento}%</Badge>
            )}
            <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>C/u</span>
          </div>

          {(product.descripcionCorta || product.descripcion) && (
            <div>
              <h4 style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-secondary)', margin: '0 0 6px' }}>
                Descripción
              </h4>
              <p style={{ fontSize: '0.88rem', color: 'var(--color-text-secondary)', lineHeight: 1.6, margin: 0 }}>
                {product.descripcionCorta || product.descripcion}
              </p>
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {product.descripcion && product.descripcionCorta !== product.descripcion && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', minWidth: '100px' }}>Descripción</span>
                <span style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>{product.descripcion}</span>
              </div>
            )}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', minWidth: '100px' }}>Categoría</span>
              <span style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
                {product.categoria}{product.subcategoria ? ` / ${product.subcategoria}` : ''}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', minWidth: '100px' }}>Tela</span>
              <span style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>{product.tela}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
              <span style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', minWidth: '100px' }}>Colores</span>
              <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                {product.colores.map(c => (
                  <span key={c} style={{ fontSize: '0.76rem', padding: '3px 8px', background: 'var(--color-bg-elevated)', borderRadius: '999px', color: 'var(--color-text-secondary)', border: '1px solid var(--color-border-subtle)' }}>
                    {c}
                  </span>
                ))}
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', minWidth: '100px' }}>Tallas</span>
              <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                {product.tallas.map(t => (
                  <span key={t} style={{ fontSize: '0.76rem', padding: '3px 8px', background: 'var(--color-bg-elevated)', borderRadius: '999px', color: 'var(--color-text-secondary)', border: '1px solid var(--color-border-subtle)' }}>
                    {t}
                  </span>
                ))}
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', minWidth: '100px' }}>Stock</span>
              <span style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>{product.cantidadStock} unidades</span>
            </div>
            {product.fechaPublicacion && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Calendar size={13} style={{ color: 'var(--color-text-muted)' }} />
                <span style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
                  {new Date(product.fechaPublicacion).toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
};

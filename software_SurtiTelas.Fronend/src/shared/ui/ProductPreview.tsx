import { Producto } from '@/core/types';
import { Modal } from '@/shared/ui/Modal';
import { Badge } from '@/shared/ui/Badge';
import s from './AdminCatalogo.module.css';

interface ProductPreviewProps {
  open: boolean;
  onClose: () => void;
  product: Producto | null;
}

export const ProductPreview = ({ open, onClose, product }: ProductPreviewProps) => {
  if (!product) return null;

  const hasDiscount = product.oferta && product.precio > 0;
  const discountPrice = hasDiscount ? product.precio * 0.85 : product.precio;

  return (
    <Modal open={open} onClose={onClose} title="Vista previa del producto" size="lg">
      <div className={s.previewContainer}>
        <div className={s.previewImageSection}>
          {product.imagenes && product.imagenes.length > 0 ? (
            <img src={product.imagenes[0]} alt={product.nombre} className={s.previewImage} />
          ) : (
            <div className={s.previewImagePlaceholder}>Sin imagen</div>
          )}
          {product.imagenes && product.imagenes.length > 1 && (
            <div className={s.previewGallery}>
              {product.imagenes.slice(1, 4).map((img, i) => (
                <img key={i} src={img} alt={`${product.nombre} ${i + 2}`} className={s.previewThumb} />
              ))}
            </div>
          )}
        </div>

        <div className={s.previewDetails}>
          <h2 className={s.previewName}>{product.nombre}</h2>
          
          <div className={s.previewBadges}>
            {product.publicado && <Badge variant="success">Publicado</Badge>}
            {product.destacado && <Badge variant="warning">Destacado</Badge>}
            {product.oferta && <Badge variant="danger">Oferta</Badge>}
            {product.nuevo && <Badge variant="info">Nuevo</Badge>}
            {product.stock === 'Agotado' && <Badge variant="danger">Agotado</Badge>}
            {product.stock === 'Bajo stock' && <Badge variant="warning">Stock bajo</Badge>}
          </div>

          <div className={s.previewPriceRow}>
            <span className={s.previewPrice}>${discountPrice.toLocaleString()}</span>
            {hasDiscount && (
              <span className={s.previewOldPrice}>${product.precio.toLocaleString()}</span>
            )}
            <span className={s.previewPriceLabel}>C/u</span>
          </div>

          <div className={s.previewSection}>
            <h4>Descripción</h4>
            <p className={s.previewDesc}>{product.descripcion || 'Sin descripción'}</p>
          </div>

          <div className={s.previewMeta}>
            <div className={s.previewMetaItem}>
              <span className={s.previewMetaLabel}>Tela</span>
              <span>{product.tela}</span>
            </div>
            <div className={s.previewMetaItem}>
              <span className={s.previewMetaLabel}>Colores</span>
              <div className={s.previewTags}>
                {product.colores.map(c => (
                  <span key={c} className={s.previewTag}>{c}</span>
                ))}
              </div>
            </div>
            <div className={s.previewMetaItem}>
              <span className={s.previewMetaLabel}>Tallas</span>
              <div className={s.previewTags}>
                {product.tallas.map(t => (
                  <span key={t} className={s.previewTag}>{t}</span>
                ))}
              </div>
            </div>
          </div>

          {product.fechaPublicacion && (
            <div className={s.previewMetaItem}>
              <span className={s.previewMetaLabel}>Fecha publicación</span>
              <span>{new Date(product.fechaPublicacion).toLocaleDateString()}</span>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};
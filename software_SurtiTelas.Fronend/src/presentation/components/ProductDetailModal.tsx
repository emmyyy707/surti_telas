import React, { useMemo, useState } from 'react'
import {
  X,
  Minus,
  Plus,
  Check,
  Heart,
  Share2,
  ChevronLeft,
  ChevronRight,
  ShoppingBag
} from 'lucide-react'

import './ProductDetailModal.css'

import { sanitizeImageUrl } from '@shared/utils/image-utils'
import { useCart } from '@/app/providers/AppProviders'
import type { Producto } from '@/core/types'
import { resolveColor } from '@/shared/utils/colorUtils'

const MIN_QUANTITY = 1

const variantKey = (colorId: string, sizeId: string) => `${colorId}|${sizeId}`

type Props = {
  product: Producto | null
  isOpen: boolean
  onClose: () => void
}

const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL']

export const ProductDetailModal: React.FC<Props> = ({
  product,
  isOpen,
  onClose
}) => {
  const { addToCart } = useCart()

  const productSizes = useMemo(() => {
    if (product?.tallas && product.tallas.length > 0) {
      return product.tallas
    }
    return SIZES
  }, [product?.tallas])

const productColors = useMemo(() => {
  if (product?.colores && product.colores.length > 0) {
    return product.colores.map((raw) => {
      const resolved = resolveColor(raw);
      return {
        id: raw,
        label: resolved?.label ?? raw,
        hex: resolved?.value ?? '#b5ada1',
      };
    });
  }
  return [
    { id: 'Blanco', label: 'Blanco', hex: '#f9fafb' },
    { id: 'Negro', label: 'Negro', hex: '#111827' },
    { id: 'Beige', label: 'Beige', hex: '#b5ada1' },
    { id: 'Gris', label: 'Gris', hex: '#6b7280' },
    { id: 'Azul', label: 'Azul', hex: '#1e40af' },
    { id: 'Rojo', label: 'Rojo', hex: '#b91c1c' },
  ];
}, [product?.colores]);

  const [selectedColors, setSelectedColors] = useState<string[]>([])

  const [selectedSizes, setSelectedSizes] = useState<string[]>([])

  const [_selectedSize, setSelectedSize] =
    useState<string>(productSizes[0] || 'M')

  const [variantQuantities, setVariantQuantities] = useState<Record<string, number>>({})

  const [variantQuantityTexts, setVariantQuantityTexts] = useState<Record<string, string>>({})

  const stock = product?.cantidadStock ?? 0

  const seedQuantitiesForNewCombos = (colors: string[], sizes: string[]) => {
    if (stock <= 0) return
    setVariantQuantities(prev => {
      const next = { ...prev }
      let changed = false
      for (const colorId of colors) {
        for (const sizeId of sizes) {
          const key = variantKey(colorId, sizeId)
          if (next[key] === undefined) {
            next[key] = MIN_QUANTITY
            changed = true
          }
        }
      }
      if (!changed) return prev
      setVariantQuantityTexts(prevTexts => {
        const nextTexts = { ...prevTexts }
        for (const colorId of colors) {
          for (const sizeId of sizes) {
            const key = variantKey(colorId, sizeId)
            if (nextTexts[key] === undefined) nextTexts[key] = String(MIN_QUANTITY)
          }
        }
        return nextTexts
      })
      return next
    })
  }

  const toggleSelectedColor = (id: string) => {
    setSelectedColors(prev => {
      const exists = prev.includes(id)
      const next = exists ? prev.filter(x => x !== id) : [...prev, id]
      seedQuantitiesForNewCombos(next, selectedSizes)
      return next
    })
  }

  const toggleSelectedSize = (id: string) => {
    setSelectedSizes(prev => {
      const exists = prev.includes(id)
      const next = exists ? prev.filter(x => x !== id) : [...prev, id]
      seedQuantitiesForNewCombos(selectedColors, next)
      return next
    })
  }

  const [isWishlisted, setIsWishlisted] =
    useState<boolean>(false)

  const [currentImageIndex, setCurrentImageIndex] =
    useState<number>(0)

  const productImages = useMemo(() => {
    const rawPrincipal = product?.imagenPrincipal
    const rawList = product?.imagenes
    const principal = rawPrincipal && rawPrincipal.trim() !== '' ? rawPrincipal : ''
    const list = Array.isArray(rawList) ? rawList : []

    if (list.length > 0) {
      return list.map(imagen => sanitizeImageUrl(imagen))
    }

    const imagen = principal ? sanitizeImageUrl(principal) : '/assets/images/placeholders/product.svg'
    return [imagen, imagen, imagen]
  }, [product?.imagenes, product?.imagenPrincipal])

  const handleClose = () => {
    setSelectedColors([])
    setSelectedSizes([])
    setSelectedSize(productSizes[0] || 'M')
    setVariantQuantities({})
    setVariantQuantityTexts({})
    setCurrentImageIndex(0)

    onClose()
  }

  const updateVariantQuantity = (colorId: string, sizeId: string, delta: number) => {
    const key = variantKey(colorId, sizeId)
    setVariantQuantities(prev => {
      const current = prev[key] ?? MIN_QUANTITY
      const next = Math.max(MIN_QUANTITY, Math.min(stock, current + delta))
      setVariantQuantityTexts(prevTexts => ({ ...prevTexts, [key]: String(next) }))
      return { ...prev, [key]: next }
    })
  }

  const setVariantQuantityInput = (colorId: string, sizeId: string, value: string) => {
    const key = variantKey(colorId, sizeId)
    setVariantQuantityTexts(prev => ({ ...prev, [key]: value }))
    const parsed = Number(value)
    if (Number.isNaN(parsed) || parsed < MIN_QUANTITY) return
    setVariantQuantities(prev => ({ ...prev, [key]: Math.min(parsed, stock) }))
  }

  const handleVariantQuantityBlur = (colorId: string, sizeId: string) => {
    const key = variantKey(colorId, sizeId)
    const text = variantQuantityTexts[key] ?? ''
    const parsed = Number(text)
    const current = variantQuantities[key] ?? MIN_QUANTITY
    const clamped = Number.isNaN(parsed) || !Number.isFinite(parsed)
      ? current
      : Math.min(Math.max(parsed, MIN_QUANTITY), stock)
    setVariantQuantities(prev => ({ ...prev, [key]: clamped }))
    setVariantQuantityTexts(prev => ({ ...prev, [key]: String(clamped) }))
  }

  const selectedVariants = useMemo(() => {
    return selectedColors.flatMap(colorId =>
      selectedSizes.map(sizeId => {
        const key = variantKey(colorId, sizeId)
        const quantity = variantQuantities[key] ?? MIN_QUANTITY
        if (quantity < MIN_QUANTITY) return null
        const color = productColors.find(c => c.id === colorId)
        return {
          colorId,
          sizeId,
          colorLabel: color?.label ?? colorId,
          colorHex: color?.hex ?? '#b5ada1',
          quantity,
        }
      })
    ).filter((v): v is NonNullable<typeof v> => v != null)
  }, [selectedColors, selectedSizes, variantQuantities, productColors])

  const totalUnits = useMemo(() => {
    return selectedVariants.reduce((sum, v) => sum + v.quantity, 0)
  }, [selectedVariants])

  const totalPrice = useMemo(() => {
    if (!product) return 0
    return product.precio * totalUnits
  }, [product, totalUnits])

  const handleAddToCart = () => {
    if (!product || selectedVariants.length === 0) return

    const validVariants = selectedVariants.filter(v => v.quantity >= MIN_QUANTITY)
    if (validVariants.length === 0) return

    const imagen =
      product.imagenPrincipal && product.imagenPrincipal.trim() !== ''
        ? product.imagenPrincipal
        : product.imagenes && product.imagenes.length > 0
          ? product.imagenes[0]
          : '/assets/images/placeholders/product.svg'

    validVariants.forEach(variant => {
      addToCart({
        productId: product.id,
        cartId: `${product.id}-${variant.sizeId}-${variant.colorId}`,
        nombre: product.nombre,
        precio: product.precio,
        imagen,
        categoria: product.categoria ?? 'Premium',
        talla: variant.sizeId,
        color: variant.colorLabel,
        stock: product.cantidadStock,
        quantity: variant.quantity,
      })
    })

    handleClose()
  }

  const nextImage = () => {
    setCurrentImageIndex(prev =>
      prev === productImages.length - 1
        ? 0
        : prev + 1
    )
  }

  const prevImage = () => {
    setCurrentImageIndex(prev =>
      prev === 0
        ? productImages.length - 1
        : prev - 1
    )
  }

  if (!isOpen || !product) return null

  return (
    <>
      {/* OVERLAY */}
      <div
        className="pd-overlay-premium"
        onClick={handleClose}
      />

      {/* MODAL */}
      <div className="pd-modal-premium">
        <div
          className="pd-modal-content"
          onClick={(e) => e.stopPropagation()}
        >
          {/* CLOSE */}
          <button
            className="pd-close-premium"
            onClick={handleClose}
          >
            <X size={18} />
          </button>

          <div className="pd-layout-premium">

            {/* LEFT */}
            <div className="pd-image-column">

              <div className="pd-floating-badge">
                NUEVO
              </div>

              <div className="pd-image-controls">

                <button
                  className={`pd-icon-btn ${
                    isWishlisted
                      ? 'active'
                      : ''
                  }`}
                  onClick={() =>
                    setIsWishlisted(!isWishlisted)
                  }
                >
                  <Heart
                    size={18}
                    fill={
                      isWishlisted
                        ? 'currentColor'
                        : 'none'
                    }
                  />
                </button>

                <button className="pd-icon-btn">
                  <Share2 size={18} />
                </button>

              </div>

              <button
                className="pd-nav-btn pd-nav-left"
                onClick={prevImage}
              >
                <ChevronLeft size={20} />
              </button>

              <button
                className="pd-nav-btn pd-nav-right"
                onClick={nextImage}
              >
                <ChevronRight size={20} />
              </button>

              <div className="pd-image-showcase">

                <img
                  src={
                    productImages[currentImageIndex]
                  }
                  alt={product.nombre}
                  className="pd-image-main"
                  onError={(e) => {
                    const target =
                      e.currentTarget

                    target.src =
                      '/assets/images/placeholders/product.svg'
                  }}
                />

              </div>

              <div className="pd-image-gallery">

                {productImages.map(
                  (image, index) => (
                    <button
                      key={index}
                      className={`pd-gallery-thumb ${
                        currentImageIndex ===
                        index
                          ? 'active'
                          : ''
                      }`}
                      onClick={() =>
                        setCurrentImageIndex(index)
                      }
                    >
                      <img
                        src={image}
                        alt={`${product.nombre}-${index}`}
                      />
                    </button>
                  )
                )}

              </div>

            </div>

            {/* RIGHT */}
            <div className="pd-info-column">

              <div className="pd-info-scroll">

                {/* TOP */}
                <div className="pd-top-section">

                  <div className="pd-category-badge">
                    {product.categoria ||
                      'Premium'}
                  </div>

                  <h1 className="pd-title-premium">
                    {product.nombre}
                  </h1>

                  {/* DESCRIPTION */}
                  {(product.descripcion || product.descripcionCorta) && (
                    <div className="pd-description-premium">
                      {product.descripcionCorta && (
                        <p className="pd-short-description">{product.descripcionCorta}</p>
                      )}
                      {product.descripcion && product.descripcionCorta !== product.descripcion && (
                        <p>{product.descripcion}</p>
                      )}
                    </div>
                  )}

                  {/* PRICE */}
                  <div className="pd-price-section">

                    <div className="pd-price-main">

                      <span className="pd-price-current">
                        $
                        {product.precio.toLocaleString()}
                      </span>

                      {product.precio > 100 && (
                        <span className="pd-price-original">
                          $
                          {(
                            product.precio * 1.2
                          ).toLocaleString()}
                        </span>
                      )}

                    </div>

                    {product.precio > 100 && (
                      <div className="pd-discount-pill">
                        20% OFF
                      </div>
                    )}

                  </div>

                </div>

                 {/* COLORS */}
                <div className="pd-selector-section">

                  <div className="pd-section-title-row">
                    <h3>Color</h3>
                    <span>{selectedColors.join(', ') || '—'}</span>
                  </div>

                  <div className="pd-color-selector">

                    {productColors.map((color) => {
                      const active = selectedColors.includes(color.id)
                      return (
                        <button
                          key={color.id}
                          className={`pd-color-option ${active ? 'active' : ''}`}
                          onClick={() => toggleSelectedColor(color.id)}
                          type="button"
                          aria-pressed={active}
                        >
                          <div className="pd-color-swatch" style={{ backgroundColor: color.hex }} />
                          {active && <Check size={12} />}
                        </button>
                      )
                    })}

                  </div>

                  <div className="pd-variant-rows">
                    {selectedColors.map(colorId => {
                      const color = productColors.find(c => c.id === colorId)
                      if (!color) return null
                      return selectedSizes.map(sizeId => {
                        const key = variantKey(colorId, sizeId)
                        const qty = variantQuantities[key] ?? MIN_QUANTITY
                        const text = variantQuantityTexts[key] ?? String(qty)
                        const isMin = qty <= MIN_QUANTITY
                        const isMax = qty >= stock
                        return (
                          <div key={key} className="pd-variant-row">
                            <div className="pd-variant-info">
                              <div className="pd-color-swatch-sm" style={{ backgroundColor: color.hex }} />
                              <span>{color.label}</span>
                              <span className="pd-variant-size">{sizeId}</span>
                            </div>
                            <div className="pd-variant-controls">
                              <button
                                className="pd-quantity-btn"
                                onClick={() => updateVariantQuantity(colorId, sizeId, -1)}
                                type="button"
                                disabled={isMin}
                                aria-label="Disminuir cantidad"
                              >
                                <Minus size={14} />
                              </button>
                              <input
                                type="number"
                                className="pd-quantity-input"
                                min={MIN_QUANTITY}
                                max={stock}
                                value={text}
                                onChange={(e) => setVariantQuantityInput(colorId, sizeId, e.target.value)}
                                onBlur={() => handleVariantQuantityBlur(colorId, sizeId)}
                                onKeyDown={(e) => { if (e.key === 'Enter') e.currentTarget.blur(); }}
                                aria-label="Cantidad"
                              />
                              <button
                                className="pd-quantity-btn"
                                onClick={() => updateVariantQuantity(colorId, sizeId, 1)}
                                type="button"
                                disabled={isMax}
                                aria-label="Aumentar cantidad"
                              >
                                <Plus size={14} />
                              </button>
                            </div>
                          </div>
                        )
                      })
                    })}
                  </div>

                  {selectedVariants.length > 0 && (
                    <div className="pd-selected-summary">
                      <span>Total unidades: {totalUnits}</span>
                      <span>Total: ${totalPrice.toLocaleString()}</span>
                    </div>
                  )}

                </div>

                {/* SIZES */}
                <div className="pd-selector-section">

                  <div className="pd-section-title-row">
                    <h3>Talla</h3>
                    <span>{selectedSizes.join(', ') || '—'}</span>
                  </div>

                  <div className="pd-size-selector">

                    {productSizes.map((size) => (
                      <button
                        key={size}
                        className={`pd-size-option ${
                          selectedSizes.includes(size)
                            ? 'active'
                            : ''
                        }`}
                        onClick={() =>
                          toggleSelectedSize(size)
                        }
                        type="button"
                        aria-pressed={selectedSizes.includes(size)}
                      >
                        {size}
                      </button>
                    ))}

                  </div>

                </div>

                  {/* EXTRA INFO */}
                 {product && (
                   <div className="pd-selector-section">
                     <div className="pd-section-title-row">
                       <h3>Detalle del producto</h3>
                     </div>
                     <div className="pd-meta-grid">
                       <div className="pd-meta-item">
                         <span className="pd-meta-label">Código</span>
                         <span className="pd-meta-value">{product.codigo || product.ref}</span>
                       </div>
                       {product.marca && (
                         <div className="pd-meta-item">
                           <span className="pd-meta-label">Marca</span>
                           <span className="pd-meta-value">{product.marca}</span>
                         </div>
                       )}
                       {product.tela && (
                         <div className="pd-meta-item">
                           <span className="pd-meta-label">Tela</span>
                           <span className="pd-meta-value">{product.tela}</span>
                         </div>
                       )}
                       <div className="pd-meta-item">
                         <span className="pd-meta-label">Stock</span>
                         <span className="pd-meta-value">{product.cantidadStock} uds</span>
                       </div>
                       <div className="pd-meta-item">
                         <span className="pd-meta-label">Estado</span>
                         <span className="pd-meta-value">{product.estado || 'Activo'}</span>
                       </div>
                       {product.descuento ? (
                         <div className="pd-meta-item">
                           <span className="pd-meta-label">Descuento</span>
                           <span className="pd-meta-value">{product.descuento}%</span>
                         </div>
                       ) : null}
                       {product.precioAnterior ? (
                         <div className="pd-meta-item">
                           <span className="pd-meta-label">Precio anterior</span>
                           <span className="pd-meta-value">${product.precioAnterior.toLocaleString()}</span>
                         </div>
                       ) : null}
                     </div>
                   </div>
                 )}

              </div>

              {/* PURCHASE */}
              <div className="pd-bottom-purchase">

                <div className="pd-purchase-top">

                  <div className="pd-total-premium">

                    <span>Total</span>

                    <strong>
                      $
                      {Number.isFinite(totalPrice) ? totalPrice.toLocaleString() : '0'}
                    </strong>

                  </div>

                </div>

                <button
                  className="pd-add-to-cart-btn"
                  onClick={handleAddToCart}
                >

                  <span className="pd-add-cart-icon">
                    <ShoppingBag size={18} />
                  </span>

                  Añadir al carrito

                </button>

                <div className="pd-bottom-meta">
                  Envío gratis en pedidos superiores a $200.000
                </div>

              </div>

            </div>

          </div>
        </div>
      </div>
    </>
  )
}



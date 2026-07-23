import React, { useMemo, useState } from 'react'
import {
  X,
  Minus,
  Plus,
  Check,
  Heart,
  Share2,
  Star,
  ChevronLeft,
  ChevronRight,
  ShoppingBag
} from 'lucide-react'

import './ProductDetailModal.css'

import { sanitizeImageUrl } from '@shared/utils/image-utils'
import { useCart } from '@presentation/contexts/CartContext'

type DetailProduct = {
  id: string
  nombre: string
  precio: number
  imagen?: string
  categoria?: string
  descripcion?: string
  tallas?: string[]
  colores?: string[]
  rating?: number
  reviews?: number
}

type Props = {
  product: DetailProduct | null
  isOpen: boolean
  onClose: () => void
}

const COLORS = [
  {
    id: 'Blanco',
    label: 'Blanco',
    hex: '#f9fafb'
  },
  {
    id: 'Negro',
    label: 'Negro',
    hex: '#111827'
  },
  {
    id: 'Beige',
    label: 'Beige',
    hex: '#b5ada1'
  },
  {
    id: 'Gris',
    label: 'Gris',
    hex: '#6b7280'
  },
  {
    id: 'Azul',
    label: 'Azul',
    hex: '#1e40af'
  },
  {
    id: 'Rojo',
    label: 'Rojo',
    hex: '#b91c1c'
  }
]

const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL']

export const ProductDetailModal: React.FC<Props> = ({
  product,
  isOpen,
  onClose
}) => {
  const { addToCart } = useCart()

  const [selectedColor, setSelectedColor] =
    useState<string>('Blanco')

  const [selectedSize, setSelectedSize] =
    useState<string>('M')

  const [quantity, setQuantity] =
    useState<number>(1)

  const [isWishlisted, setIsWishlisted] =
    useState<boolean>(false)

  const [currentImageIndex, setCurrentImageIndex] =
    useState<number>(0)

  const productImages = useMemo(() => {
    if (!product?.imagen) {
      return [
        '/assets/images/placeholders/product.svg',
        '/assets/images/placeholders/product.svg',
        '/assets/images/placeholders/product.svg'
      ]
    }

    const image = sanitizeImageUrl(product.imagen)

    return [image, image, image]
  }, [product?.imagen])

  const totalPrice = useMemo(() => {
    if (!product) return 0

    return product.precio * quantity
  }, [product, quantity])

  const handleClose = () => {
    setSelectedColor('Blanco')
    setSelectedSize('M')
    setQuantity(1)
    setCurrentImageIndex(0)

    onClose()
  }

  const handleQuantityChange = (delta: number) => {
    setQuantity(prev => Math.max(1, prev + delta))
  }

  const handleAddToCart = () => {
    if (!product) return

    addToCart({
      ...product,
      imagen:
        product.imagen ??
        '/assets/images/placeholders/product.svg',
      categoria: product.categoria ?? 'Premium',
      talla: selectedSize,
      color: selectedColor,
      quantity,
      stock: 99
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

                  {/* RATING */}
                  {product.rating && (
                    <div className="pd-rating-premium">

                      <div className="pd-stars">
                        {[...Array(5)].map(
                          (_, i) => (
                            <Star
                              key={i}
                              size={15}
                              fill={
                                i <
                                Math.floor(
                                  product.rating!
                                )
                                  ? 'currentColor'
                                  : 'none'
                              }
                            />
                          )
                        )}
                      </div>

                      <span className="pd-rating-value">
                        {product.rating}
                      </span>

                      <span className="pd-divider" />

                      <span className="pd-reviews-count">
                        {product.reviews || 0}
                        {' '}
                        reviews
                      </span>

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

                  {/* DESCRIPTION */}
                  {product.descripcion && (
                    <p className="pd-description-premium">
                      {product.descripcion}
                    </p>
                  )}

                </div>

                {/* COLORS */}
                <div className="pd-selector-section">

                  <div className="pd-section-title-row">
                    <h3>Color</h3>

                    <span>
                      {selectedColor}
                    </span>
                  </div>

                  <div className="pd-color-selector">

                    {COLORS.map((color) => (
                      <button
                        key={color.id}
                        className={`pd-color-option ${
                          selectedColor ===
                          color.id
                            ? 'active'
                            : ''
                        }`}
                        onClick={() =>
                          setSelectedColor(
                            color.id
                          )
                        }
                      >
                        <div
                          className="pd-color-swatch"
                          style={{
                            backgroundColor:
                              color.hex
                          }}
                        />

                        {selectedColor ===
                          color.id && (
                          <Check size={12} />
                        )}
                      </button>
                    ))}

                  </div>

                </div>

                {/* SIZES */}
                <div className="pd-selector-section">

                  <div className="pd-section-title-row">

                    <h3>Talla</h3>

                    <button className="pd-size-guide-btn">
                      Guía
                    </button>

                  </div>

                  <div className="pd-size-selector">

                    {SIZES.map((size) => (
                      <button
                        key={size}
                        className={`pd-size-option ${
                          selectedSize ===
                          size
                            ? 'active'
                            : ''
                        }`}
                        onClick={() =>
                          setSelectedSize(size)
                        }
                      >
                        {size}
                      </button>
                    ))}

                  </div>

                </div>

              </div>

              {/* PURCHASE */}
              <div className="pd-bottom-purchase">

                <div className="pd-purchase-top">

                  <div className="pd-quantity-wrapper">

                    <button
                      className="pd-quantity-btn"
                      onClick={() =>
                        handleQuantityChange(-1)
                      }
                      disabled={quantity <= 1}
                    >
                      <Minus size={15} />
                    </button>

                    <span className="pd-quantity-value">
                      {quantity}
                    </span>

                    <button
                      className="pd-quantity-btn"
                      onClick={() =>
                        handleQuantityChange(1)
                      }
                    >
                      <Plus size={15} />
                    </button>

                  </div>

                  <div className="pd-total-premium">

                    <span>Total</span>

                    <strong>
                      $
                      {totalPrice.toLocaleString()}
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
                  Env Marketing - Envío gratis en pedidos superiores a $200.000
                </div>

              </div>

            </div>

          </div>
        </div>
      </div>
    </>
  )
}



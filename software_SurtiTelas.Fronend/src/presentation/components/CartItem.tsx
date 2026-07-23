import React from 'react'
import { Minus, Plus, Trash2 } from 'lucide-react'
import type { CartItem as CartItemType } from '@/app/providers/AppProviders'

interface CartItemProps {
  item: CartItemType
  onIncrement: (cartId: string) => void
  onDecrement: (cartId: string) => void
  onRemove: (cartId: string) => void
}

interface CartItemProps {
  item: CartItemType
  onIncrement: (cartId: string) => void
  onDecrement: (cartId: string) => void
  onRemove: (cartId: string) => void
}

const CartItem: React.FC<CartItemProps> = ({ item, onIncrement, onDecrement, onRemove }) => {
  const canIncrease = item.quantity < item.stock
  const canDecrease = item.quantity > 1

  return (
    <article className="cart-item-premium" data-stock={item.stock}>
      <div className="cart-item-image-wrapper">
        <img
          src={item.imagen}
          alt={item.nombre}
          className="cart-item-image"
          loading="lazy"
          onError={(e) => {
            const target = e.currentTarget
            if (!target.src.includes('placeholders')) {
              target.src = '/assets/images/placeholders/product.svg'
            }
          }}
        />
        <div className="cart-item-image-overlay" />
      </div>

      <div className="cart-item-info">
        <div className="cart-item-header">
          <div>
            <h4 className="cart-item-name">{item.nombre}</h4>
            <div className="cart-item-meta">
              <span>{item.categoria}</span>
              <span>{item.talla}</span>
              <span>{item.color}</span>
            </div>
          </div>
          <button className="cart-item-remove" onClick={() => onRemove(item.cartId)} aria-label="Eliminar producto">
            <Trash2 size={16} />
          </button>
        </div>

        <div className="cart-item-footer">
          <span className="cart-item-price">${item.precio.toLocaleString()}</span>
          <div className="cart-quantity-selector">
            <button className="quantity-btn" onClick={() => onDecrement(item.cartId)} disabled={!canDecrease} aria-label="Disminuir cantidad">
              <Minus size={14} />
            </button>
            <span className="quantity-value">{item.quantity}</span>
            <button className="quantity-btn" onClick={() => onIncrement(item.cartId)} disabled={!canIncrease} aria-label="Aumentar cantidad">
              <Plus size={14} />
            </button>
          </div>
        </div>

        <div className="cart-item-stock">
          <span>{item.stock - item.quantity} disponibles</span>
        </div>
      </div>
    </article>
  )
}

export default CartItem




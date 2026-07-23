import React, { createContext, useContext, useEffect, useMemo, useState, ReactNode } from 'react'
import toast from 'react-hot-toast'

export interface Product {
  id: string
  nombre: string
  precio: number
  imagen: string
  categoria: string
  talla?: string
  size?: string
  color?: string
  quantity?: number
  stock?: number
}

export interface CartItem {
  cartId: string
  id: string
  nombre: string
  precio: number
  imagen: string
  categoria: string
  talla: string
  color: string
  quantity: number
  stock: number
}

interface CartContextType {
  items: CartItem[]
  hasItems: boolean
  subtotal: number
  discount: number
  tax: number
  shipping: number
  total: number
  totalItems: number
  addToCart: (product: Product) => void
  removeFromCart: (cartId: string) => void
  increaseQuantity: (cartId: string) => void
  decreaseQuantity: (cartId: string) => void
  clearCart: () => void
  calculateSubtotal: () => number
  calculateTotal: () => number
  isLoaded: boolean
}

const CART_STORAGE_KEY = 'surtitelas-cart'
const CartContext = createContext<CartContextType | undefined>(undefined)

const buildCartId = (id: string, talla: string, color: string) => `${id}::${talla || 'default'}::${color || 'default'}`

const normalizeProduct = (product: Product): CartItem => {
  const quantity = Math.max(1, product.quantity ?? 1)
  const stock = Math.max(0, product.stock ?? 99)
  const talla = product.talla || product.size || 'M'
  const color = product.color || 'Original'

  return {
    cartId: buildCartId(product.id, talla, color),
    id: product.id,
    nombre: product.nombre,
    precio: product.precio,
    imagen: product.imagen,
    categoria: product.categoria || 'Telas',
    talla,
    color,
    quantity: Math.min(quantity, stock),
    stock
  }
}

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>([])
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem(CART_STORAGE_KEY)
    if (saved) {
      try {
        setItems(JSON.parse(saved))
      } catch (error) {
        console.error('Error parsing cart:', error)
      }
    }
    setIsLoaded(true)
  }, [])

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items))
    }
  }, [items, isLoaded])

  const subtotal = useMemo(() => items.reduce((acc, item) => acc + item.precio * item.quantity, 0), [items])
  const discount = useMemo(() => {
    if (subtotal > 200000) return Math.round(subtotal * 0.08)
    if (subtotal > 150000) return Math.round(subtotal * 0.05)
    return 0
  }, [subtotal])
  const tax = useMemo(() => Math.round((subtotal - discount) * 0.19), [subtotal, discount])
  const shipping = useMemo(() => (subtotal > 150000 ? 0 : 15000), [subtotal])
  const total = useMemo(() => subtotal - discount + tax + shipping, [subtotal, discount, tax, shipping])
  const totalItems = useMemo(() => items.reduce((acc, item) => acc + item.quantity, 0), [items])
  const hasItems = items.length > 0

  const addToCart = (product: Product) => {
    const normalized = normalizeProduct(product)

    if (!normalized.talla || !normalized.color) {
      toast.error('Selecciona talla y color antes de agregar al carrito.')
      return
    }

    if (normalized.stock <= 0) {
      toast.error('Este producto no tiene stock disponible.')
      return
    }

    setItems(prev => {
      const existing = prev.find(item => item.cartId === normalized.cartId)
      if (existing) {
        const nextQuantity = Math.min(existing.quantity + normalized.quantity, existing.stock)
        if (nextQuantity === existing.quantity) {
          toast.error('Has alcanzado el límite de cantidad de este producto.')
          return prev
        }
        toast.success('Cantidad actualizada en el carrito.')
        return prev.map(item => item.cartId === normalized.cartId ? { ...item, quantity: nextQuantity } : item)
      }

      toast.success('Producto agregado al carrito.')
      return [...prev, normalized]
    })
  }

  const removeFromCart = (cartId: string) => {
    setItems(prev => prev.filter(item => item.cartId !== cartId))
  }

  const increaseQuantity = (cartId: string) => {
    setItems(prev => prev.map(item => {
      if (item.cartId !== cartId) return item
      const nextQuantity = Math.min(item.quantity + 1, item.stock)
      if (nextQuantity === item.quantity) {
        toast.error('No hay más stock disponible.')
        return item
      }
      return { ...item, quantity: nextQuantity }
    }))
  }

  const decreaseQuantity = (cartId: string) => {
    setItems(prev => prev.reduce<CartItem[]>((acc, item) => {
      if (item.cartId !== cartId) {
        acc.push(item)
        return acc
      }
      const nextQuantity = item.quantity - 1
      if (nextQuantity > 0) acc.push({ ...item, quantity: nextQuantity })
      return acc
    }, []))
  }

  const clearCart = () => {
    setItems([])
    toast.success('Carrito vaciado.')
  }

  const calculateSubtotal = () => subtotal
  const calculateTotal = () => total

  return (
    <CartContext.Provider value={{
      items,
      hasItems,
      subtotal,
      discount,
      tax,
      shipping,
      total,
      totalItems,
      addToCart,
      removeFromCart,
      increaseQuantity,
      decreaseQuantity,
      clearCart,
      calculateSubtotal,
      calculateTotal,
      isLoaded
    }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => {
  const context = useContext(CartContext)
  if (!context) throw new Error('useCart debe estar dentro de CartProvider')
  return context
}



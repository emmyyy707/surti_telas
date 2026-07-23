/**
 * Utilidad centralizada para manejo de imágenes con fallback robusto.
 * Reemplaza todas las dependencias externas de imágenes (ej: via.placeholder.com)
 * por assets locales con soporte de error handling y lazy loading.
 */

import { useState, useCallback } from 'react'

// Imágenes locales por defecto
export const DEFAULT_IMAGES = {
  PRODUCT: '/assets/images/placeholders/product.svg',
  USER: '/assets/images/placeholders/user.svg',
  BANNER: '/assets/images/placeholders/banner.svg',
  CATEGORY: '/assets/images/placeholders/category.svg',
  LOGO: '/assets/images/logos/surtitelas-logo.jpg',
} as const

export type ImageType = keyof typeof DEFAULT_IMAGES

/**
 * Hook para imágenes con estado de carga y error
 */
export function useImage(src: string, fallback?: string) {
  const [imageSrc, setImageSrc] = useState<string>(src)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [hasError, setHasError] = useState<boolean>(false)

  const handleError = useCallback(() => {
    if (!hasError) {
      setHasError(true)
      setImageSrc(fallback || DEFAULT_IMAGES.PRODUCT)
    }
  }, [hasError, fallback])

  const handleLoad = useCallback(() => {
    setIsLoading(false)
  }, [])

  const reset = useCallback((newSrc?: string) => {
    const source = newSrc || src
    setImageSrc(source)
    setIsLoading(true)
    setHasError(false)
  }, [src])

  return { imageSrc, isLoading, hasError, handleError, handleLoad, reset }
}

/**
 * Props base para componentes de imagen con soporte de placeholder
 */
export interface ImageWithFallbackProps {
  src: string
  alt: string
  className?: string
  fallback?: string
  width?: number | string
  height?: number | string
  lazy?: boolean
  containerClassName?: string
  onClick?: React.MouseEventHandler<HTMLImageElement>
}

/**
 * Genera props de error handling para un elemento <img>
 */
export function getImageFallbackProps(
  src: string,
  alt: string,
  fallback: ImageType | string = 'PRODUCT',
  className?: string
) {
  const fallbackUrl = typeof fallback === 'string' && (fallback.startsWith('/') || fallback.startsWith('http'))
    ? fallback
    : DEFAULT_IMAGES[fallback as ImageType] || DEFAULT_IMAGES.PRODUCT

  return {
    src,
    alt,
    className,
    onError: (e: React.SyntheticEvent<HTMLImageElement>) => {
      const target = e.currentTarget
      if (target.src !== fallbackUrl) {
        target.src = fallbackUrl
      }
    },
    onLoad: (e: React.SyntheticEvent<HTMLImageElement>) => {
      e.currentTarget.classList.remove('image-loading')
      e.currentTarget.classList.add('image-loaded')
    },
  }
}

/**
 * Verifica si una URL es externa e insegura o potencialmente rota
 */
export function isUnsafeExternalUrl(url: string): boolean {
  if (!url) return true
  try {
    const parsed = new URL(url)
    // Dominios conocidos de placeholder que pueden fallar
    const unsafeDomains = [
      'via.placeholder.com',
      'placehold.co',
      'placekitten.com',
      'loremflickr.com',
      'dummyimage.com',
      'placehold.it',
      'via.placeholder.com',
    ]
    return unsafeDomains.includes(parsed.hostname)
  } catch {
    return true
  }
}

/**
 * Reemplaza URLs externas inseguras por el fallback local apropiado
 */
export function sanitizeImageUrl(
  url: string | undefined,
  type: ImageType = 'PRODUCT'
): string {
  if (!url) return DEFAULT_IMAGES[type]
  if (isUnsafeExternalUrl(url)) return DEFAULT_IMAGES[type]
  return url
}




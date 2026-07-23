import type { Producto } from '@/core/types';
import { api } from './httpClient';
import type { PaginatedResponse } from './pagination';

/** DTO que devuelve el backend para un producto (coincide con ProductMapper.toProductData). */
export interface ProductDTO {
  id: string;
  ref: string;
  codigo?: string;
  nombre: string;
  descripcion?: string;
  descripcionCorta?: string;
  categoria?: string;
  subcategoria?: string;
  marca?: string;
  precio: number;
  precioAnterior?: number;
  descuento?: number;
  cantidadStock: number;
  stock: 'OK' | 'Bajo stock' | 'Agotado';
  estado?: 'Activo' | 'Inactivo';
  imagenes: string[];
  imagenPrincipal?: string;
  publicado?: boolean;
  destacado?: boolean;
  oferta?: boolean;
  nuevo?: boolean;
  masVendido?: boolean;
  tela: string;
  colores: string[];
  tallas: string[];
}

/** Backend → tipo del frontend. Los nombres ya coinciden 1:1. */
export function toProducto(dto: ProductDTO): Producto {
  return {
    id: dto.id,
    ref: dto.ref,
    codigo: dto.codigo,
    nombre: dto.nombre,
    descripcion: dto.descripcion,
    descripcionCorta: dto.descripcionCorta,
    categoria: dto.categoria,
    subcategoria: dto.subcategoria,
    marca: dto.marca,
    precio: dto.precio,
    precioAnterior: dto.precioAnterior,
    descuento: dto.descuento,
    stock: dto.stock,
    cantidadStock: dto.cantidadStock,
    estado: dto.estado,
    imagenes: dto.imagenes ?? [],
    imagenPrincipal: dto.imagenPrincipal,
    publicado: dto.publicado,
    destacado: dto.destacado,
    oferta: dto.oferta,
    nuevo: dto.nuevo,
    masVendido: dto.masVendido,
    tela: dto.tela,
    colores: dto.colores ?? [],
    tallas: dto.tallas ?? [],
  };
}

/** Frontend → cuerpo que espera el backend (ProductSchema). */
function toProductBody(p: Partial<Producto>): Record<string, unknown> {
  const body: Record<string, unknown> = {};
  const assign = (k: string, v: unknown) => {
    if (v !== undefined) body[k] = v;
  };
  assign('codigo', p.codigo);
  assign('nombre', p.nombre);
  assign('descripcion', p.descripcion);
  assign('descripcionCorta', p.descripcionCorta);
  assign('categoria', p.categoria);
  assign('subcategoria', p.subcategoria);
  assign('marca', p.marca);
  assign('precio', p.precio);
  assign('precioAnterior', p.precioAnterior);
  assign('descuento', p.descuento);
  assign('cantidadStock', p.cantidadStock);
  assign('stock', p.stock);
  assign('estado', p.estado);
  assign('imagenes', p.imagenes);
  assign('imagenPrincipal', p.imagenPrincipal);
  assign('publicado', p.publicado);
  assign('destacado', p.destacado);
  assign('oferta', p.oferta);
  assign('nuevo', p.nuevo);
  assign('masVendido', p.masVendido);
  assign('tela', p.tela);
  assign('colores', p.colores);
  assign('tallas', p.tallas);
  return body;
}

export interface ProductsListResult {
  data: Producto[];
  meta: PaginatedResponse<ProductDTO>['data']['meta'];
}

export const catalogApi = {
  async list(query?: Record<string, string | number | boolean | undefined | null>): Promise<ProductsListResult> {
    const response = await api.get<{ items: ProductDTO[]; meta: PaginatedResponse<ProductDTO>['data']['meta'] }>('/catalog/products', { query, auth: false });
    const data = (response?.items ?? []).map(toProducto);
    const meta = response?.meta ?? { totalRecords: 0, page: 1, limit: 12, totalPages: 1 };
    return { data, meta };
  },

  async getByRef(ref: string): Promise<Producto | null> {
    try {
      const dto = await api.get<ProductDTO>(`/catalog/products/${encodeURIComponent(ref)}`);
      return dto ? toProducto(dto) : null;
    } catch {
      return null;
    }
  },

  async create(p: Partial<Producto>): Promise<Producto> {
    const body = toProductBody(p);
    // Valores obligatorios en el schema del backend.
    if (body.publicado === undefined) body.publicado = false;
    if (body.stock === undefined) body.stock = 'OK';
    if (body.imagenes === undefined) body.imagenes = [];
    const dto = await api.post<ProductDTO>('/catalog/products', body);
    return toProducto(dto);
  },

  async update(ref: string, changes: Partial<Producto>): Promise<Producto> {
    const dto = await api.patch<ProductDTO>(
      `/catalog/products/${encodeURIComponent(ref)}`,
      toProductBody(changes),
    );
    return toProducto(dto);
  },

  async remove(ref: string): Promise<void> {
    await api.delete<null>(`/catalog/products/${encodeURIComponent(ref)}`);
  },

  async publish(ref: string): Promise<Producto> {
    const dto = await api.post<ProductDTO>(`/catalog/products/${encodeURIComponent(ref)}/publish`);
    return toProducto(dto);
  },

  async unpublish(ref: string): Promise<Producto> {
    const dto = await api.post<ProductDTO>(`/catalog/products/${encodeURIComponent(ref)}/unpublish`);
    return toProducto(dto);
  },
};

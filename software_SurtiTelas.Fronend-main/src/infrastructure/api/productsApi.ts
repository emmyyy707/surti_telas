import { api } from './httpClient';
import { type ProductDTO, toProducto } from './catalogApi';

function toProductBody(p: Record<string, unknown>): Record<string, unknown> {
  const body: Record<string, unknown> = {};
  if (p.codigo !== undefined) body.codigo = p.codigo;
  if (p.nombre !== undefined) body.nombre = p.nombre;
  if (p.categoria !== undefined) body.categoria = p.categoria;
  body.subcategoria = '';
  body.marca = 'SurtiTelas';
  if (p.precio !== undefined) body.precio = p.precio;
  body.precioAnterior = 0;
  body.descuento = 0;
  if (p.stock !== undefined) body.cantidadStock = p.stock;
  body.stock = (Number(p.stock ?? 0) > 0) ? 'OK' : 'Agotado';
  if (p.estado !== undefined) body.estado = p.estado;
  body.imagenes = [];
  body.imagenPrincipal = '';
  body.publicado = false;
  body.destacado = false;
  body.oferta = false;
  body.nuevo = false;
  body.masVendido = false;
  body.tela = '';
  body.colores = Array.isArray(p.colores) ? p.colores : (p.color ? [String(p.color)] : []);
  body.tallas = Array.isArray(p.tallas) ? p.tallas : (p.talla ? [String(p.talla)] : []);
  return body;
}

export interface ProductTerminadoDTO {
  id: string;
  codigo?: string;
  nombre: string;
  categoria?: string;
  subcategoria?: string;
  tela?: string;
  tallas?: string[];
  colores?: string[];
  cantidadStock: number;
  precio: number;
  imagenPrincipal?: string;
  estado?: 'Activo' | 'Inactivo';
  createdAt?: string;
  fechaCreacion?: string;
}

export interface ProductTerminado {
  id: string;
  codigo: string;
  nombre: string;
  categoria: string;
  talla: string;
  color: string;
  stock: number;
  precio: number;
  fechaCreacion: string;
  estado: 'Activo' | 'Inactivo';
}

export function toProductTerminado(dto: ProductDTO | ProductTerminadoDTO): ProductTerminado {
  if ('ref' in dto) {
    const p = toProducto(dto);
    return {
      id: p.id ?? p.ref,
      codigo: p.codigo ?? p.ref,
      nombre: p.nombre,
      categoria: p.categoria ?? 'Sin categoría',
      talla: p.tallas.length > 0 ? p.tallas[0] : 'Única',
      color: p.colores.length > 0 ? p.colores[0] : 'Sin especificar',
      stock: p.cantidadStock ?? 0,
      precio: Number(p.precio) || 0,
      fechaCreacion: new Date().toISOString().slice(0, 10),
      estado: (p.estado ?? 'Activo') as 'Activo' | 'Inactivo',
    };
  }
  const d = dto;
  return {
    id: d.id,
    codigo: d.codigo ?? d.id,
    nombre: d.nombre,
    categoria: d.categoria ?? 'Sin categoría',
    talla: Array.isArray(d.tallas) && d.tallas.length > 0 ? d.tallas[0] : 'Única',
    color: Array.isArray(d.colores) && d.colores.length > 0 ? d.colores[0] : 'Sin especificar',
    stock: d.cantidadStock ?? 0,
    precio: Number(d.precio) || 0,
    fechaCreacion: d.fechaCreacion ?? new Date().toISOString().slice(0, 10),
    estado: (d.estado ?? 'Activo') as 'Activo' | 'Inactivo',
  };
}

export const productsApi = {
  async list(): Promise<ProductTerminado[]> {
    const response = await api.get<{ items: ProductDTO[]; meta: Record<string, unknown> }>('/catalog/products', { auth: false });
    const data = response?.items ?? [];
    return data.map(d => toProductTerminado(d));
  },

  async create(p: Partial<ProductTerminado>): Promise<ProductTerminado> {
    const body = toProductBody({
      codigo: p.codigo,
      nombre: p.nombre,
      categoria: p.categoria,
      subcategoria: '',
      marca: 'SurtiTelas',
      precio: p.precio,
      precioAnterior: 0,
      descuento: 0,
      cantidadStock: p.stock ?? 0,
      estado: p.estado,
      imagenes: [],
      imagenPrincipal: '',
      publicado: false,
      destacado: false,
      oferta: false,
      nuevo: false,
      masVendido: false,
      tela: '',
      colores: p.color ? [p.color] : [],
      tallas: p.talla ? [p.talla] : [],
    } as Record<string, unknown>);
    const dto = await api.post<ProductDTO>('/catalog/products', body);
    return toProductTerminado(dto);
  },

  async update(id: string, changes: Partial<ProductTerminado>): Promise<ProductTerminado> {
    const body = toProductBody({
      codigo: changes.codigo,
      nombre: changes.nombre,
      categoria: changes.categoria,
      subcategoria: '',
      marca: 'SurtiTelas',
      precio: changes.precio,
      precioAnterior: 0,
      descuento: 0,
      cantidadStock: changes.stock ?? 0,
      estado: changes.estado,
      imagenes: [],
      imagenPrincipal: '',
      publicado: false,
      destacado: false,
      oferta: false,
      nuevo: false,
      masVendido: false,
      tela: '',
      colores: changes.color ? [changes.color] : [],
      tallas: changes.talla ? [changes.talla] : [],
    } as Record<string, unknown>);
    const dto = await api.patch<ProductDTO>(`/catalog/products/${encodeURIComponent(id)}`, body);
    return toProductTerminado(dto);
  },

  async remove(id: string): Promise<void> {
    await api.delete<void>(`/catalog/products/${encodeURIComponent(id)}`);
  },
};

export default productsApi;

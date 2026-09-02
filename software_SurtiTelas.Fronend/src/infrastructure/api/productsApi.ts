import { api } from './httpClient';
import { type ProductDTO, toProducto } from './catalogApi';

function toProductBody(p: Record<string, unknown>): Record<string, unknown> {
  const body: Record<string, unknown> = {};
  if (p.codigo !== undefined) body.codigo = p.codigo;
  if (p.nombre !== undefined) body.nombre = p.nombre;
  if (p.descripcion !== undefined) body.descripcion = p.descripcion;
  if (p.descripcionCorta !== undefined) body.descripcionCorta = p.descripcionCorta;
  if (p.categoria !== undefined) body.categoria = p.categoria;
  if (p.subcategoria !== undefined) body.subcategoria = p.subcategoria;
  if (p.marca !== undefined) body.marca = p.marca;
  if (p.precio !== undefined) body.precio = p.precio;
  if (p.precioAnterior !== undefined) body.precioAnterior = p.precioAnterior;
  if (p.descuento !== undefined) body.descuento = p.descuento;
  if (p.stockStatus !== undefined) body.stock = p.stockStatus;
  if (p.stock !== undefined) body.cantidadStock = p.stock;
  if (p.estado !== undefined) body.estado = p.estado;
  if (p.tela !== undefined) body.tela = p.tela;
  if (Array.isArray(p.colores)) body.colores = p.colores;
  if (Array.isArray(p.tallas)) body.tallas = p.tallas;
  if (Array.isArray(p.imagenes)) body.imagenes = p.imagenes;
  if (p.imagenPrincipal !== undefined) body.imagenPrincipal = p.imagenPrincipal;
  if (p.destacado !== undefined) body.destacado = p.destacado;
  if (p.oferta !== undefined) body.oferta = p.oferta;
  if (p.nuevo !== undefined) body.nuevo = p.nuevo;
  if (p.masVendido !== undefined) body.masVendido = p.masVendido;
  body.publicado = false;
  return body;
}

export interface ProductTerminadoDTO {
  id: string;
  ref?: string;
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
  stock?: string;
  estado?: 'Activo' | 'Inactivo';
  tela?: string;
  colores?: string[];
  tallas?: string[];
  imagenes?: string[];
  imagenPrincipal?: string;
  destacado?: boolean;
  oferta?: boolean;
  nuevo?: boolean;
  masVendido?: boolean;
  publicado?: boolean;
  createdAt?: string;
  fechaCreacion?: string;
}

export interface ProductTerminado {
  id: string;
  ref: string;
  codigo: string;
  nombre: string;
  descripcion: string;
  descripcionCorta: string;
  categoria: string;
  subcategoria: string;
  marca: string;
  talla: string;
  color: string;
  stock: number;
  cantidadStock: number;
  precio: number;
  precioAnterior: number;
  descuento: number;
  tela: string;
  imagenes: string[];
  imagenPrincipal: string;
  destacado: boolean;
  oferta: boolean;
  nuevo: boolean;
  masVendido: boolean;
  fechaCreacion: string;
  estado: 'Activo' | 'Inactivo';
  colores?: string[];
  tallas?: string[];
  stockStatus?: 'OK' | 'Bajo stock' | 'Agotado';
}

export function toProductTerminado(dto: ProductDTO | ProductTerminadoDTO): ProductTerminado {
  if (dto && typeof (dto as ProductDTO).ref === 'string') {
    const p = toProducto(dto as ProductDTO);
    return {
      id: p.id ?? p.ref,
      ref: p.ref,
      codigo: p.codigo ?? p.ref,
      nombre: p.nombre,
      descripcion: p.descripcion || p.descripcionCorta || '',
      descripcionCorta: p.descripcionCorta || p.descripcion || '',
      categoria: p.categoria ?? 'Sin categoría',
      subcategoria: p.subcategoria || '',
      marca: p.marca || '',
      talla: p.tallas.length > 0 ? p.tallas[0] : 'Única',
      color: p.colores.length > 0 ? p.colores[0] : 'Sin especificar',
      stock: p.cantidadStock ?? 0,
      cantidadStock: p.cantidadStock ?? 0,
      precio: Number(p.precio) || 0,
      precioAnterior: Number(p.precioAnterior) || 0,
      descuento: Number(p.descuento) || 0,
      tela: p.tela || '',
      imagenes: p.imagenes || [],
      imagenPrincipal: p.imagenPrincipal || (p.imagenes?.length ? p.imagenes[0] : ''),
      destacado: p.destacado || false,
      oferta: p.oferta || false,
      nuevo: p.nuevo || false,
      masVendido: p.masVendido || false,
      fechaCreacion: new Date().toISOString().slice(0, 10),
      estado: (p.estado ?? 'Activo') as 'Activo' | 'Inactivo',
      colores: p.colores,
      tallas: p.tallas,
    };
  }
  const d = dto as ProductTerminadoDTO;
  return {
    id: d.id,
    ref: d.ref ?? d.id,
    codigo: d.codigo ?? d.id,
    nombre: d.nombre,
    descripcion: d.descripcion || '',
    descripcionCorta: d.descripcionCorta || '',
    categoria: d.categoria ?? 'Sin categoría',
    subcategoria: d.subcategoria || '',
    marca: d.marca || '',
    talla: Array.isArray(d.tallas) && d.tallas.length > 0 ? d.tallas[0] : 'Única',
    color: Array.isArray(d.colores) && d.colores.length > 0 ? d.colores[0] : 'Sin especificar',
    stock: d.cantidadStock ?? 0,
    cantidadStock: d.cantidadStock ?? 0,
    precio: Number(d.precio) || 0,
    precioAnterior: Number(d.precioAnterior) || 0,
    descuento: Number(d.descuento) || 0,
    tela: d.tela || '',
    imagenes: d.imagenes || [],
    imagenPrincipal: d.imagenPrincipal || (d.imagenes?.length ? d.imagenes[0] : ''),
    destacado: d.destacado || false,
    oferta: d.oferta || false,
    nuevo: d.nuevo || false,
    masVendido: d.masVendido || false,
    fechaCreacion: d.fechaCreacion ?? new Date().toISOString().slice(0, 10),
    estado: (d.estado ?? 'Activo') as 'Activo' | 'Inactivo',
    colores: d.colores,
    tallas: d.tallas,
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
      descripcion: p.descripcion,
      descripcionCorta: p.descripcionCorta,
      categoria: p.categoria,
      subcategoria: p.subcategoria,
      marca: p.marca,
      precio: p.precio,
      precioAnterior: p.precioAnterior,
      descuento: p.descuento,
      cantidadStock: p.stock ?? 0,
      estado: p.estado,
      imagenes: p.imagenes,
      imagenPrincipal: p.imagenPrincipal,
      destacado: p.destacado,
      oferta: p.oferta,
      nuevo: p.nuevo,
      masVendido: p.masVendido,
      tela: p.tela,
      colores: p.colores,
      tallas: p.tallas,
    } as Record<string, unknown>);
    const dto = await api.post<ProductDTO>('/catalog/products', body);
    return toProductTerminado(dto);
  },

  async update(ref: string, changes: Partial<ProductTerminado>): Promise<ProductTerminado> {
    const body = toProductBody({
      codigo: changes.codigo,
      nombre: changes.nombre,
      descripcion: changes.descripcion,
      descripcionCorta: changes.descripcionCorta,
      categoria: changes.categoria,
      subcategoria: changes.subcategoria,
      marca: changes.marca,
      precio: changes.precio,
      precioAnterior: changes.precioAnterior,
      descuento: changes.descuento,
      cantidadStock: changes.stock ?? 0,
      estado: changes.estado,
      imagenes: changes.imagenes,
      imagenPrincipal: changes.imagenPrincipal,
      destacado: changes.destacado,
      oferta: changes.oferta,
      nuevo: changes.nuevo,
      masVendido: changes.masVendido,
      tela: changes.tela,
      colores: changes.colores,
      tallas: changes.tallas,
    } as Record<string, unknown>);
    const dto = await api.patch<ProductDTO>(`/catalog/products/${encodeURIComponent(ref)}`, body);
    return toProductTerminado(dto);
  },

  async remove(ref: string): Promise<void> {
    await api.delete<void>(`/catalog/products/${encodeURIComponent(ref)}`);
  },
};

export default productsApi;

export interface Producto {
  id?: string;
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
  stock: 'OK' | 'Bajo stock' | 'Agotado';
  cantidadStock: number;
  estado?: 'Activo' | 'Inactivo';
  imagenes: string[];
  imagenPrincipal?: string;
  publicado?: boolean;
  fechaPublicacion?: string;
  destacado?: boolean;
  oferta?: boolean;
  nuevo?: boolean;
  masVendido?: boolean;
  tela: string;
  colores: string[];
  tallas: string[];
}

export type PublicationStatus = 'Publicado' | 'Borrador' | 'Oculto';

export interface ProductoDetalle {
  id?: string;
  nombre: string;
  precio: number;
  imagen?: string;
  categoria?: string;
  descripcion?: string;
  tallas?: string[];
  colores?: string[];
  rating?: number;
  reviews?: number;
}

export interface Cliente {
  id: string;
  nombre: string;
  ciudad: string;
  tel: string;
  asesor: string;
  asesorId?: string;
  pedidos: number;
  estado: 'Activo' | 'Inactivo';
  nit?: string;
  email?: string;
  direccion?: string;
  cupoTotal?: number;
  cupoUsado?: number;
  deudaVencida?: number;
  isTrustedCustomer?: boolean;
}

export interface PedidoItem {
  nombre: string;
  precio: number;
  cantidad: number;
}

export interface Pedido {
  id: string;
  numero?: string;
  cliente: string;
  asesor: string;
  fecha: string;
  items: number;
  total: string;
  estado: 'Nuevo' | 'En producción' | 'Listo' | 'Despachado' | 'En camino' | 'Entregado' | 'Cancelado';
  prioridad?: 'Estándar' | 'Prioritario';
  observaciones?: string;
  itemsList?: PedidoItem[];
  clienteId?: string;
  asesorId?: string;
}

export interface OrdenProduccion {
  id: string;
  pedido: string;
  operario: string;
  referencia: string;
  cantidad: number;
  fechaInicio: string;
  fechaEstimada: string;
  avance: number;
  estado: 'Pendiente' | 'En proceso' | 'Terminado';
  tela?: string;
  colores?: string[];
  curvaTallas?: { s: number; m: number; l: number; xl: number };
  notasTecnicas?: string;
}

export interface MovimientoInventario {
  id: string;
  tipo: 'entrada' | 'salida' | 'ajuste';
  productoRef: string;
  cantidad: number;
  motivo: string;
  usuario: string;
  fecha: string;
  ajuste?: number;
}

export interface Notificacion {
  id: string;
  tipo: 'info' | 'warning' | 'success' | 'danger';
  titulo: string;
  mensaje: string;
  leida: boolean;
  createdAt: number;
}

export interface Proveedor {
  id: string;
  nombre: string;
  nit: string;
  telefono: string;
  email: string;
  direccion: string;
  ciudad: string;
  materiales: string[];
  estado: 'Activo' | 'Inactivo';
  calificacion: number;
  pedidosRealizados: number;
  ultimoPedido?: string;
}

export type ProductStockStatus = 'OK' | 'Bajo stock' | 'Agotado';
export type ProductCategory = string;

export interface ProductData {
  id?: string;
  ref: string;
  codigo?: string;
  nombre: string;
  descripcion?: string;
  descripcionCorta?: string;
  categoria: ProductCategory;
  subcategoria?: string;
  marca?: string;
  precio: number;
  precioAnterior?: number;
  descuento?: number;
  cantidadStock: number;
  stock: ProductStockStatus;
  estado?: 'Activo' | 'Inactivo';
  imagenes: string[];
  imagenPrincipal?: string;
  publicado: boolean;
  destacado?: boolean;
  oferta?: boolean;
  nuevo?: boolean;
  masVendido?: boolean;
  tela: string;
  colores: string[];
  tallas: string[];
}

export function computeStockStatus(cantidadStock: number): ProductStockStatus {
  if (cantidadStock <= 0) return 'Agotado';
  if (cantidadStock < 10) return 'Bajo stock';
  return 'OK';
}

export class Product {
  readonly id?: string;
  readonly ref: string;
  readonly codigo?: string;
  readonly nombre: string;
  readonly descripcion?: string;
  readonly descripcionCorta?: string;
  readonly categoria: ProductCategory;
  readonly subcategoria?: string;
  readonly marca?: string;
  readonly precio: number;
  readonly precioAnterior?: number;
  readonly descuento?: number;
  readonly cantidadStock: number;
  readonly stock: ProductStockStatus;
  readonly estado?: 'Activo' | 'Inactivo';
  readonly imagenes: string[];
  readonly imagenPrincipal?: string;
  readonly publicado: boolean;
  readonly destacado?: boolean;
  readonly oferta?: boolean;
  readonly nuevo?: boolean;
  readonly masVendido?: boolean;
  readonly tela: string;
  readonly colores: string[];
  readonly tallas: string[];

  constructor(data: ProductData) {
    Product.validate(data);
    this.id = data.id;
    this.ref = data.ref;
    this.codigo = data.codigo;
    this.nombre = data.nombre;
    this.descripcion = data.descripcion;
    this.descripcionCorta = data.descripcionCorta;
    this.categoria = data.categoria;
    this.subcategoria = data.subcategoria;
    this.marca = data.marca;
    this.precio = data.precio;
    this.precioAnterior = data.precioAnterior;
    this.descuento = data.descuento;
    this.cantidadStock = data.cantidadStock;
    this.stock = data.stock;
    this.estado = data.estado;
    this.imagenes = data.imagenes;
    this.imagenPrincipal = data.imagenPrincipal;
    this.publicado = data.publicado;
    this.destacado = data.destacado;
    this.oferta = data.oferta;
    this.nuevo = data.nuevo;
    this.masVendido = data.masVendido;
    this.tela = data.tela;
    this.colores = data.colores;
    this.tallas = data.tallas;
  }

  static validate(data: ProductData): void {
    if (data.ref.trim() === '') throw new Error('El producto debe tener una referencia');
    if (data.nombre.trim() === '') throw new Error('El producto debe tener un nombre');
    if (data.categoria.trim() === '') throw new Error('El producto debe tener una categoría');
    if (data.tela.trim() === '') throw new Error('El producto debe tener una tela definida');
    if (!Number.isFinite(data.precio) || data.precio < 0)
      throw new Error('El precio del producto no puede ser negativo');
    if (data.precioAnterior !== undefined && data.precioAnterior < 0)
      throw new Error('El precio anterior no puede ser negativo');
    if (data.descuento !== undefined && (data.descuento < 0 || data.descuento > 100))
      throw new Error('El descuento debe estar entre 0 y 100');
    if (!Number.isInteger(data.cantidadStock) || data.cantidadStock < 0)
      throw new Error('La cantidad en stock no puede ser negativa');
    if (data.stock === 'Agotado' && data.cantidadStock > 0)
      throw new Error('Un producto agotado no puede tener cantidad en stock mayor a cero');
    if (!Array.isArray(data.imagenes)) throw new Error('Las imágenes deben ser un arreglo');
    if (!Array.isArray(data.colores) || data.colores.length === 0)
      throw new Error('El producto debe tener al menos un color');
    if (!Array.isArray(data.tallas) || data.tallas.length === 0)
      throw new Error('El producto debe tener al menos una talla');
  }

  withChanges(changes: Partial<ProductData>): Product {
    return new Product({
      ...this,
      ...changes,
      imagenes: changes.imagenes ?? this.imagenes,
      colores: changes.colores ?? this.colores,
      tallas: changes.tallas ?? this.tallas,
    });
  }

  publish(): Product {
    if (!this.canBePublished()) {
      throw new Error('El producto no cumple los requisitos para ser publicado');
    }
    return this.withChanges({ publicado: true, estado: 'Activo' });
  }

  unpublish(): Product {
    return this.withChanges({ publicado: false, estado: 'Inactivo' });
  }

  canBePublished(): boolean {
    return (
      this.nombre.trim() !== '' &&
      this.categoria.trim() !== '' &&
      this.precio > 0 &&
      (this.imagenPrincipal?.trim() !== '' || this.imagenes.length > 0)
    );
  }

  isAvailable(): boolean {
    return this.publicado && this.stock !== 'Agotado';
  }
}

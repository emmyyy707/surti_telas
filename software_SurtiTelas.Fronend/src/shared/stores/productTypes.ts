export interface Product {
  id: string;
  codigo: string;
  nombre: string;
  descripcion: string;
  descripcionCompleta: string;
  categoria: string;
  subcategoria: string;
  marca: string;
  precio: number;
  precioAnterior?: number;
  descuento?: number;
  stock: number;
  estado: 'activo' | 'inactivo';
  imagenes: {
    principal: string;
    galeria: string[];
  };
  etiquetas: {
    nuevo?: boolean;
    destacado?: boolean;
    oferta?: boolean;
    masVendido?: boolean;
  };
  publicado: boolean;
  fechaPublicacion?: string;
}

export type ProductCategory = {
  id: string;
  nombre: string;
  subcategorias?: ProductCategory[];
};

export const productCategories: ProductCategory[] = [
  { id: 'camisetas', nombre: 'Camisetas', subcategorias: [
    { id: 'manga-corta', nombre: 'Manga corta' },
    { id: 'manga-larga', nombre: 'Manga larga' },
    { id: 'sin-mangera', nombre: 'Sin mangera' },
  ]},
  { id: 'blusas', nombre: 'Blusas' },
  { id: 'vestidos', nombre: 'Vestidos' },
  { id: 'pantalones', nombre: 'Pantalones' },
  { id: 'faldas', nombre: 'Faldas' },
  { id: 'chaquetas', nombre: 'Chaquetas' },
  { id: 'accesorios', nombre: 'Accesorios' },
];
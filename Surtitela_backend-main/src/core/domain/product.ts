export type ProductEntity = {
  id_product: number;
  name: string;
  description?: string | null;
  price: number;
  imagen?: string | null;
  stock?: number | null;
  status?: boolean | null;
  id_product_category?: number | null;
};

export type PublicProduct = {
  id_product: number;
  id?: number;
  ref?: string;
  codigo?: string;
  nombre: string;
  descripcion?: string | null;
  categoria?: string | null;
  precio?: number | null;
  stock?: number | null;
  cantidadStock?: number | null;
  disponible?: boolean | null;
  publicado?: boolean | null;
  marca?: string | null;
  imagen?: string | null;
  imagenPrincipal?: string | null;
  imagenes?: string[];
  color?: string | null;
  colores?: string[];
  tallas?: string[];
  tela?: string | null;
  destacado?: boolean;
  nuevo?: boolean;
  rating?: number;
};

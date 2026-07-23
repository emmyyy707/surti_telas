import { ProductEntity, PublicProduct } from "../domain/product.js";

export interface ProductRepository {
  findAll(filters?: { categoria?: string; color?: string; talla?: string; publicado?: boolean; destacado?: boolean; nuevo?: boolean }): Promise<PublicProduct[]>;
  findAllPaginated(filters?: { categoria?: string; color?: string; talla?: string; publicado?: boolean; destacado?: boolean; nuevo?: boolean }, page?: number, limit?: number): Promise<{ data: PublicProduct[]; page: number; limit: number; total: number; totalPages: number; hasNextPage: boolean }>;
  findById(id_product: number): Promise<PublicProduct | null>;
  findByRef(ref: string): Promise<PublicProduct | null>;
  create(data: { name?: string; nombre?: string; price?: number; precio?: number; description?: string; descripcion?: string; imagen?: string; imagenPrincipal?: string | null; imagenes?: string[]; stock?: number; cantidadStock?: number; id_product_category?: number; categoria?: string; status?: boolean; publicado?: boolean; ref?: string; codigo?: string; color?: string | null; colors?: string[]; colorList?: string[]; talla?: string | null; tallas?: string[]; tela?: string | null; destacado?: boolean; nuevo?: boolean }): Promise<PublicProduct | null>;
  update(id_product: number, data: { name?: string; nombre?: string; price?: number; precio?: number; description?: string; descripcion?: string; imagen?: string; imagenPrincipal?: string | null; imagenes?: string[]; stock?: number; cantidadStock?: number; id_product_category?: number; categoria?: string; status?: boolean; publicado?: boolean; ref?: string; codigo?: string; color?: string | null; colors?: string[]; colorList?: string[]; talla?: string | null; tallas?: string[]; tela?: string | null; destacado?: boolean; nuevo?: boolean }): Promise<PublicProduct | null>;
  updateByRef(ref: string, data: { name?: string; nombre?: string; price?: number; precio?: number; description?: string; descripcion?: string; imagen?: string; imagenPrincipal?: string | null; imagenes?: string[]; stock?: number; cantidadStock?: number; id_product_category?: number; categoria?: string; status?: boolean; publicado?: boolean; ref?: string; codigo?: string; color?: string | null; colors?: string[]; colorList?: string[]; talla?: string | null; tallas?: string[]; tela?: string | null; destacado?: boolean; nuevo?: boolean }): Promise<PublicProduct | null>;
  updateStock(id_product: number, stock: number): Promise<PublicProduct | null>;
  delete(id_product: number): Promise<boolean>;
  deleteByRef(ref: string): Promise<boolean>;
}

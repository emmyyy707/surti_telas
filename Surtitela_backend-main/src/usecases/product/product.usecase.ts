import { ProductRepository } from "../../core/interfaces/product.repository.js";
import { PublicProduct } from "../../core/domain/product.js";

export class ProductUseCase {
  constructor(private productRepository: ProductRepository) {}

  async list(filters?: { categoria?: string; color?: string; talla?: string; publicado?: boolean; destacado?: boolean; nuevo?: boolean }, page?: number, limit?: number): Promise<{ data: PublicProduct[]; page: number; limit: number; total: number; totalPages: number; hasNextPage: boolean }> {
    return this.productRepository.findAllPaginated(filters, page, limit);
  }

  async getById(id_product: number): Promise<PublicProduct | null> {
    return this.productRepository.findById(id_product);
  }

  async getByRef(ref: string): Promise<PublicProduct | null> {
    return this.productRepository.findByRef(ref);
  }

  async create(data: { name?: string; nombre?: string; price?: number; precio?: number; description?: string; descripcion?: string; imagen?: string; imagenPrincipal?: string | null; imagenes?: string[]; stock?: number; cantidadStock?: number; id_product_category?: number; categoria?: string; status?: boolean; publicado?: boolean; ref?: string; codigo?: string; color?: string | null; colors?: string[]; colorList?: string[]; talla?: string | null; tallas?: string[]; tela?: string | null; destacado?: boolean; nuevo?: boolean }): Promise<PublicProduct | null> {
    return this.productRepository.create(data);
  }

  async update(id_product: number, data: { name?: string; nombre?: string; price?: number; precio?: number; description?: string; descripcion?: string; imagen?: string; imagenPrincipal?: string | null; imagenes?: string[]; stock?: number; cantidadStock?: number; id_product_category?: number; categoria?: string; status?: boolean; publicado?: boolean; ref?: string; codigo?: string; color?: string | null; colors?: string[]; colorList?: string[]; talla?: string | null; tallas?: string[]; tela?: string | null; destacado?: boolean; nuevo?: boolean }): Promise<PublicProduct | null> {
    return this.productRepository.update(id_product, data);
  }

  async updateByRef(ref: string, data: { name?: string; nombre?: string; price?: number; precio?: number; description?: string; descripcion?: string; imagen?: string; imagenPrincipal?: string | null; imagenes?: string[]; stock?: number; cantidadStock?: number; id_product_category?: number; categoria?: string; status?: boolean; publicado?: boolean; ref?: string; codigo?: string; color?: string | null; colors?: string[]; colorList?: string[]; talla?: string | null; tallas?: string[]; tela?: string | null; destacado?: boolean; nuevo?: boolean }): Promise<PublicProduct | null> {
    return this.productRepository.updateByRef(ref, data);
  }

  async updateStock(id_product: number, stock: number): Promise<PublicProduct | null> {
    return this.productRepository.updateStock(id_product, stock);
  }

  async delete(id_product: number): Promise<boolean> {
    return this.productRepository.delete(id_product);
  }

  async deleteByRef(ref: string): Promise<boolean> {
    return this.productRepository.deleteByRef(ref);
  }
}
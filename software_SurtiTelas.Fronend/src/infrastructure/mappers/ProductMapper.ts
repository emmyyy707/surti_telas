import { Product, type ProductData } from '@/domain/entities/Product';

export type ProductDTO = ProductData;

export class ProductMapper {
  static toDomain(dto: ProductDTO): Product {
    return new Product({
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
      publicado: dto.publicado ?? false,
      fechaPublicacion: dto.fechaPublicacion,
      destacado: dto.destacado ?? false,
      oferta: dto.oferta ?? false,
      nuevo: dto.nuevo ?? false,
      masVendido: dto.masVendido ?? false,
      tela: dto.tela,
      colores: dto.colores ?? [],
      tallas: dto.tallas ?? [],
    });
  }

  static toDTO(product: Product): ProductDTO {
    return {
      id: product.id,
      ref: product.ref,
      codigo: product.codigo,
      nombre: product.nombre,
      descripcion: product.descripcion,
      descripcionCorta: product.descripcionCorta,
      categoria: product.categoria,
      subcategoria: product.subcategoria,
      marca: product.marca,
      precio: product.precio,
      precioAnterior: product.precioAnterior,
      descuento: product.descuento,
      stock: product.stock,
      cantidadStock: product.cantidadStock,
      estado: product.estado,
      imagenes: product.imagenes,
      imagenPrincipal: product.imagenPrincipal,
      publicado: product.publicado,
      fechaPublicacion: product.fechaPublicacion,
      destacado: product.destacado,
      oferta: product.oferta,
      nuevo: product.nuevo,
      masVendido: product.masVendido,
      tela: product.tela,
      colores: product.colores,
      tallas: product.tallas,
    };
  }
}

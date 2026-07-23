import prisma from "../../config/prisma.js";
import { ProductRepository } from "../../core/interfaces/product.repository.js";
import { PublicProduct } from "../../core/domain/product.js";

function mapProduct(product: any, extra: Record<string, any> = {}): PublicProduct {
  const rawStock = extra.stock ?? extra.cantidadStock ?? product.stock ?? 0;
  const published = extra.publicado ?? extra.status ?? product.status ?? false;
  const images = Array.isArray(extra.imagenes) && extra.imagenes.length > 0
    ? extra.imagenes
    : extra.imagenPrincipal
      ? [extra.imagenPrincipal]
      : extra.imagen
        ? [extra.imagen]
        : product.imagen
          ? [product.imagen]
          : [];
  const primaryImage = extra.imagenPrincipal ?? extra.imagen ?? images[0] ?? product.imagen ?? null;
  const colors = Array.isArray(extra.colores) && extra.colores.length > 0
    ? extra.colores
    : extra.color
      ? [extra.color]
      : [];
  const sizes = Array.isArray(extra.tallas) && extra.tallas.length > 0
    ? extra.tallas
    : extra.talla
      ? [extra.talla]
      : [];

  return {
    id_product: product.id_product,
    id: product.id_product,
    ref: extra.ref ?? extra.codigo ?? String(product.id_product),
    codigo: extra.codigo ?? extra.ref ?? String(product.id_product),
    nombre: extra.nombre ?? product.name ?? "",
    descripcion: extra.descripcion ?? product.description,
    categoria: extra.categoria ?? product.products_category?.name ?? null,
    precio: Number(extra.precio ?? product.price ?? 0),
    stock: Number(rawStock),
    cantidadStock: Number(rawStock),
    disponible: Boolean(published),
    publicado: Boolean(published),
    marca: null,
    imagen: primaryImage,
    imagenPrincipal: primaryImage,
    imagenes: images,
    color: extra.color ?? null,
    colores: colors,
    tallas: sizes,
    tela: extra.tela ?? null,
    destacado: Boolean(extra.destacado ?? false),
    nuevo: Boolean(extra.nuevo ?? false),
    rating: 0,
  };
}

export class PrismaProductRepository implements ProductRepository {
  async findAll(filters?: { categoria?: string; color?: string; talla?: string; publicado?: boolean; destacado?: boolean; nuevo?: boolean }) {
    const where: any = {};
    if (filters?.categoria) {
      where.id_product_category = await prisma.products_category
        .findFirst({ where: { name: filters.categoria } })
        .then((category) => category?.id_product_category || undefined);
    }
    if (filters?.color) {
      where.description = { contains: filters.color, mode: "insensitive" };
    }
    if (filters?.publicado !== undefined) {
      where.status = filters.publicado;
    }
    const products = await prisma.products.findMany({ where, include: { products_category: true } });
    return products.map((product) => mapProduct(product));
  }

  async findAllPaginated(filters?: { categoria?: string; color?: string; talla?: string; publicado?: boolean; destacado?: boolean; nuevo?: boolean }, page: number = 1, limit: number = 8) {
    const where: any = {};
    if (filters?.categoria) {
      where.id_product_category = await prisma.products_category
        .findFirst({ where: { name: filters.categoria } })
        .then((category) => category?.id_product_category || undefined);
    }
    if (filters?.color) {
      where.description = { contains: filters.color, mode: "insensitive" };
    }
    if (filters?.publicado !== undefined) {
      where.status = filters.publicado;
    }

    const skip = (page - 1) * limit;
    const [products, total] = await Promise.all([
      prisma.products.findMany({ where, skip, take: limit, include: { products_category: true } }),
      prisma.products.count({ where }),
    ]);

    const data = products.map((product) => mapProduct(product));
    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;

    return { data, page, limit, total, totalPages, hasNextPage };
  }

  async findById(id_product: number) {
    const product = await prisma.products.findUnique({ where: { id_product }, include: { products_category: true } });
    if (!product) return null;
    return mapProduct(product);
  }

  async findByRef(ref: string) {
    const id = Number(ref);
    if (!Number.isNaN(id)) {
      return this.findById(id);
    }

    const product = await prisma.products.findFirst({ where: { name: ref }, include: { products_category: true } });
    if (!product) return null;
    return mapProduct(product);
  }

  async create(data: { name?: string; nombre?: string; price?: number; precio?: number; description?: string; descripcion?: string; imagen?: string; imagenPrincipal?: string | null; imagenes?: string[]; stock?: number; cantidadStock?: number; id_product_category?: number; categoria?: string; status?: boolean; publicado?: boolean; ref?: string; codigo?: string; color?: string | null; colors?: string[]; colorList?: string[]; talla?: string | null; tallas?: string[]; tela?: string | null; destacado?: boolean; nuevo?: boolean }) {
    const categoryId = data.id_product_category ?? (data.categoria ? await prisma.products_category.findFirst({ where: { name: data.categoria } }).then((category) => category?.id_product_category || undefined) : undefined);
    const product = await prisma.products.create({
      data: {
        name: data.name ?? data.nombre ?? "Producto",
        price: Number(data.price ?? data.precio ?? 0),
        description: data.description ?? data.descripcion,
        imagen: data.imagen ?? data.imagenPrincipal ?? undefined,
        stock: data.stock ?? data.cantidadStock ?? 0,
        status: data.publicado ?? data.status ?? true,
        id_product_category: categoryId,
      },
    });
    return mapProduct(product, data);
  }

  async update(id_product: number, data: { name?: string; nombre?: string; price?: number; precio?: number; description?: string; descripcion?: string; imagen?: string; imagenPrincipal?: string | null; imagenes?: string[]; stock?: number; cantidadStock?: number; id_product_category?: number; categoria?: string; status?: boolean; publicado?: boolean; ref?: string; codigo?: string; color?: string | null; colors?: string[]; colorList?: string[]; talla?: string | null; tallas?: string[]; tela?: string | null; destacado?: boolean; nuevo?: boolean }) {
    const categoryId = data.id_product_category ?? (data.categoria ? await prisma.products_category.findFirst({ where: { name: data.categoria } }).then((category) => category?.id_product_category || undefined) : undefined);
    const product = await prisma.products.update({
      where: { id_product },
      data: {
        ...(data.name !== undefined || data.nombre !== undefined ? { name: data.name ?? data.nombre } : {}),
        ...(data.price !== undefined || data.precio !== undefined ? { price: Number(data.price ?? data.precio) } : {}),
        ...(data.description !== undefined || data.descripcion !== undefined ? { description: data.description ?? data.descripcion } : {}),
        ...(data.imagen !== undefined || data.imagenPrincipal !== undefined ? { imagen: data.imagen ?? data.imagenPrincipal ?? null } : {}),
        ...(data.stock !== undefined || data.cantidadStock !== undefined ? { stock: Number(data.stock ?? data.cantidadStock) } : {}),
        ...(data.publicado !== undefined ? { status: data.publicado } : {}),
        ...(data.status !== undefined ? { status: data.status } : {}),
        ...(categoryId !== undefined ? { id_product_category: categoryId } : {}),
      },
    });
    return mapProduct(product, data);
  }

  async updateByRef(ref: string, data: { name?: string; nombre?: string; price?: number; precio?: number; description?: string; descripcion?: string; imagen?: string; imagenPrincipal?: string | null; imagenes?: string[]; stock?: number; cantidadStock?: number; id_product_category?: number; categoria?: string; status?: boolean; publicado?: boolean; ref?: string; codigo?: string; color?: string | null; colors?: string[]; colorList?: string[]; talla?: string | null; tallas?: string[]; tela?: string | null; destacado?: boolean; nuevo?: boolean }) {
    const target = await this.findByRef(ref);
    if (!target) return null;
    return this.update(target.id_product, data);
  }

  async updateStock(id_product: number, stock: number) {
    const product = await prisma.products.update({ where: { id_product }, data: { stock } });
    return mapProduct(product);
  }

  async delete(id_product: number) {
    try {
      await prisma.products.delete({ where: { id_product } });
      return true;
    } catch {
      return false;
    }
  }

  async deleteByRef(ref: string) {
    const target = await this.findByRef(ref);
    if (!target) return false;
    return this.delete(target.id_product);
  }
}

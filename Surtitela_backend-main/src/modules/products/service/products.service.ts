import prisma from "../../../config/prisma.js";
import { normalizarPrismaEntidad } from "../../../shared/prisma-utils.js";

export type ProductPublic = {
  id_product: number;
  nombre: string;
  descripcion?: string | null;
  categoria?: string | null;
  precio?: number | null;
  stock?: number | null;
  disponible?: boolean | null;
  marca?: string | null;
  imagen?: string | null;
  color?: string | null;
  tallas?: string[];
  destacado?: boolean;
  nuevo?: boolean;
  rating?: number;
};

function normalizeProduct(product: any): ProductPublic {
  const normalized = normalizarPrismaEntidad(product);
  return {
    id_product: normalized.id_product,
    nombre: normalized.name,
    descripcion: normalized.description,
    categoria: normalized.products_category?.name ?? null,
    precio: normalized.price,
    stock: normalized.stock,
    disponible: normalized.status,
    marca: null,
    imagen: normalized.imagen ?? null,
    color: null,
    tallas: [],
    destacado: false,
    nuevo: false,
    rating: 0,
  };
}

export async function getAllProducts(filters?: { categoria?: string; color?: string; talla?: string }) {
  const where: any = {};
  if (filters?.categoria) {
    where.id_product_category = await prisma.products_category.findFirst({ where: { name: filters.categoria } }).then((category) => category?.id_product_category || undefined);
  }
  if (filters?.color) {
    where.description = { contains: filters.color, mode: "insensitive" };
  }
  const products = await prisma.products.findMany({
    where,
    include: { products_category: true },
  });
  return products.map(normalizeProduct);
}

export async function getPublishedProducts() {
  const products = await prisma.products.findMany({
    where: { status: true },
    include: { products_category: true },
  });
  return products.map(normalizeProduct);
}

export async function getFeaturedProducts() {
  const products = await prisma.products.findMany({
    where: { status: true },
    orderBy: { id_product: "asc" },
    take: 10,
    include: { products_category: true },
  });
  return products.map(normalizeProduct);
}

export async function getProductById(id_product: number) {
  const product = await prisma.products.findUnique({
    where: { id_product },
    include: { products_category: true },
  });
  return product ? normalizeProduct(product) : null;
}

export async function createProduct(data: { name: string; price: number; description?: string; imagen?: string; stock?: number; id_product_category?: number }): Promise<ProductPublic | null> {
  try {
    const product = await prisma.products.create({ data });
    return normalizeProduct(product);
  } catch (error) {
    console.error("Error en el servicio:", error);
    return null;
  }
}

export async function updateProduct(id_product: number, data: { name?: string; price?: number; description?: string; imagen?: string; stock?: number; id_product_category?: number; status?: boolean }) {
  try {
    const product = await prisma.products.update({ where: { id_product }, data });
    return normalizeProduct(product);
  } catch (error) {
    console.error("Error actualizando producto:", error);
    return null;
  }
}

export async function updateProductStock(id_product: number, stock: number) {
  try {
    const product = await prisma.products.update({ where: { id_product }, data: { stock } });
    return normalizeProduct(product);
  } catch (error) {
    console.error("Error actualizando stock:", error);
    return null;
  }
}

export async function deleteProduct(id_product: number): Promise<boolean> {
  try {
    await prisma.products.delete({ where: { id_product } });
    return true;
  } catch (error) {
    return false;
  }
}


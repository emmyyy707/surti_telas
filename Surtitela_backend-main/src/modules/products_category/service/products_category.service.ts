import prisma from "../../../config/prisma.js";

export type ProductCategoryPublic = {
  id_product_category: number;
  name: string;
  description?: string | null;
  status?: boolean | null;
};

export async function getAllProductCategories(): Promise<ProductCategoryPublic[]> {
  return prisma.products_category.findMany();
}

export async function createProductCategory(data: { name: string; description?: string }): Promise<ProductCategoryPublic | null> {
  try {
    return await prisma.products_category.create({ data });
  } catch (error) {
    console.error("Error en el servicio:", error);
    return null;
  }
}

export async function deleteProductCategory(id_product_category: number): Promise<boolean> {
  try {
    await prisma.products_category.delete({ where: { id_product_category } });
    return true;
  } catch (error) {
    return false;
  }
}


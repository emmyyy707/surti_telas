import { Request, Response } from 'express';
import { created, noContent, ok } from '../../../../shared/presentation/http/HttpResponse';
import { buildHateoasLinks, buildApiPaginatedResponse } from '../../../../shared/presentation/http/PaginatedResponse';
import { parseDto } from '../../../../shared/presentation/http/validate';
import { clearCache } from '../../../../modules/shared/presentation/middlewares/cache';
import { catalogUseCases } from '../../infrastructure/container/catalogContainer';
import {
  CategorySchema,
  CategoryFiltersSchema,
  ProductFiltersSchema,
  ProductSchema,
  ProductUpdateSchema,
} from '../validators/catalog.validators';

export const listProducts = async (req: Request, res: Response) => {
  const filters = parseDto(ProductFiltersSchema, req.query);
  const result = await catalogUseCases.getProducts.execute(filters);
  const response = buildApiPaginatedResponse(
    result.data,
    result.meta.total,
    result.meta.page || 1,
    result.meta.limit,
    result.meta.nextCursor
  );
  return ok(res, response);
};

export const getProduct = async (req: Request, res: Response) => {
  const product = await catalogUseCases.getProductByRef.execute(req.params.ref);
  const hateoas = buildHateoasLinks('/api/v1/catalog/products', product.ref);
  return ok(res, { ...product, _links: hateoas });
};

export const createProduct = async (req: Request, res: Response) => {
  const input = parseDto(ProductSchema, req.body);
  const product = await catalogUseCases.createProduct.execute(input);
  clearCache('/api/v1/catalog/products');
  return created(res, product, 'Producto creado');
};

export const updateProduct = async (req: Request, res: Response) => {
  const changes = parseDto(ProductUpdateSchema, req.body);
  const product = await catalogUseCases.updateProduct.execute(req.params.ref, changes);
  clearCache('/api/v1/catalog/products');
  return ok(res, product, 'Producto actualizado');
};

export const deleteProduct = async (req: Request, res: Response) => {
  await catalogUseCases.deleteProduct.execute(req.params.ref);
  clearCache('/api/v1/catalog/products');
  return noContent(res);
};

export const publishProduct = async (req: Request, res: Response) => {
  const product = await catalogUseCases.publishProduct.execute(req.params.ref);
  clearCache('/api/v1/catalog/products');
  return ok(res, product, 'Producto publicado');
};

export const unpublishProduct = async (req: Request, res: Response) => {
  const product = await catalogUseCases.unpublishProduct.execute(req.params.ref);
  clearCache('/api/v1/catalog/products');
  return ok(res, product, 'Producto despublicado');
};

export const listCategories = async (req: Request, res: Response) => {
  const filters = parseDto(CategoryFiltersSchema, req.query);
  const result = await catalogUseCases.getCategories.execute(filters);
  const response = buildApiPaginatedResponse(
    result.data,
    result.meta.total,
    result.meta.page,
    result.meta.limit,
    result.meta.nextCursor
  );
  return ok(res, response);
};

export const createCategory = async (req: Request, res: Response) => {
  const input = parseDto(CategorySchema, req.body);
  const category = await catalogUseCases.createCategory.execute(input);
  clearCache('/api/v1/catalog/categories');
  return created(res, category, 'Categoría creada');
};

export const uploadProductImage = async (req: Request & { file?: Express.Multer.File }, res: Response) => {
  const file = req.file;
  if (!file) {
    return res.status(400).json({ success: false, error: 'bad_request', message: 'Archivo requerido' });
  }
  const imageUrl = `/uploads/${file.filename}`;
  const product = await catalogUseCases.updateProduct.execute(req.params.ref, {
    imagenes: [...(req.body.imagenes ? JSON.parse(req.body.imagenes) : []), imageUrl],
  });
  clearCache('/api/v1/catalog/products');
  return ok(res, product, 'Imagen subida correctamente');
};

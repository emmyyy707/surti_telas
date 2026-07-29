import { Request, Response } from 'express';
import { ok, created } from '../../../../shared/presentation/http/HttpResponse';
import { ToggleFavorite } from '../../application/use-cases/FavoriteUseCases';
import { PrismaFavoriteRepository } from '../../infrastructure/repositories/PrismaFavoriteRepository';
import { prisma } from '../../../../config/database';

const repository = new PrismaFavoriteRepository(prisma);
const toggleFavorite = new ToggleFavorite(repository);

export const listMyFavorites = async (req: Request, res: Response) => {
  const favoriteRows = await repository.listByUser(req.user!.id);
  const productIds = favoriteRows.map((fav) => fav.productId);
  const products = await prisma.product.findMany({
    where: { id: { in: productIds }, estado: 'ACTIVO', publicado: true },
    select: {
      id: true,
      ref: true,
      codigo: true,
      nombre: true,
      descripcion: true,
      categoriaId: true,
      precio: true,
      descuento: true,
      cantidadStock: true,
      stockStatus: true,
      estado: true,
      publicado: true,
      destacado: true,
      oferta: true,
      nuevo: true,
      masVendido: true,
      tela: true,
      colores: true,
      tallas: true,
      imagenPrincipal: true,
      imagenes: true,
      createdAt: true,
      updatedAt: true,
    },
  });
  const productsMap = new Map(products.map((p) => [p.id, p]));
  const orderedProducts = productIds.map((id) => productsMap.get(id)).filter(Boolean);
  return ok(res, orderedProducts);
};

export const toggleMyFavorite = async (req: Request, res: Response) => {
  const productId = req.params.productId;
  const favorite = await toggleFavorite.execute(req.user!.id, productId);
  if (!favorite) {
    return res.status(204).send();
  }
  return created(res, favorite, 'Favorito agregado');
};

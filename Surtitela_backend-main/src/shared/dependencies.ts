import { PrismaAuthRepository } from "../infra/prisma/prisma-auth.repository.js";
import { PrismaProductRepository } from "../infra/prisma/prisma-product.repository.js";
import { PrismaOrderRepository } from "../infra/prisma/prisma-order.repository.js";
import { AuthUseCase } from "../usecases/auth/auth.usecase.js";
import { ProductUseCase } from "../usecases/product/product.usecase.js";
import { OrderUseCase } from "../usecases/order/order.usecase.js";
import { usersService } from "../modules/users/service/users.service.js";

export const authUseCase = new AuthUseCase(new PrismaAuthRepository());
export const productUseCase = new ProductUseCase(new PrismaProductRepository());
export const orderUseCase = new OrderUseCase(new PrismaOrderRepository());
export { usersService };
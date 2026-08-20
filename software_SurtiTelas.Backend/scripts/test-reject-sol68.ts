import { PrismaClient } from '@prisma/client';
import { PrismaCustomOrderRepository } from '../src/modules/pedidos-personalizados/infrastructure/repositories/PrismaCustomOrderRepository';
import { PrismaQuotationRepository } from '../src/modules/pedidos-personalizados/infrastructure/repositories/PrismaQuotationRepository';
import { RejectQuotation } from '../src/modules/pedidos-personalizados/application/use-cases/CustomOrderUseCases';

const prisma = new PrismaClient();
const repo = new PrismaCustomOrderRepository(prisma);
const quotationRepo = new PrismaQuotationRepository(prisma);

async function main() {
  const orderId = 'cmt0kupjc0013igy81ho6ckr9';

  const order = await repo.getById(orderId);
  console.log('Order estado:', order?.estado);
  const quote = await quotationRepo.getByPedidoId(orderId);
  console.log('Quote estado:', quote?.estado, 'negotiationCount:', quote?.negotiationCount);

  const reject = new RejectQuotation(repo, quotationRepo, prisma);
  const result = await reject.execute(orderId, 'No me convence', 'test@test.com');
  console.log('REJECT OK:', result.estado);

  await prisma.$disconnect();
}

main().catch((e) => { console.error('REJECT ERROR:', e.message, e.code); process.exit(1); });

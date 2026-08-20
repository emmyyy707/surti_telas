import { PrismaClient } from '@prisma/client';
import { PrismaCustomOrderRepository } from '../src/modules/pedidos-personalizados/infrastructure/repositories/PrismaCustomOrderRepository';
import { PrismaQuotationRepository } from '../src/modules/pedidos-personalizados/infrastructure/repositories/PrismaQuotationRepository';
import { AcceptQuotation, RejectQuotation } from '../src/modules/pedidos-personalizados/application/use-cases/CustomOrderUseCases';

const prisma = new PrismaClient();
const repo = new PrismaCustomOrderRepository(prisma);
const quotationRepo = new PrismaQuotationRepository(prisma);

async function main() {
  const orderId = 'cmt039nos00cpig80715j5qzm';

  const order = await repo.getById(orderId);
  console.log('Order estado:', order?.estado);
  const quote = await quotationRepo.getByPedidoId(orderId);
  console.log('Quote estado:', quote?.estado, 'validaHasta:', quote?.validaHasta);

  const accept = new AcceptQuotation(repo, quotationRepo, prisma);
  const result = await accept.execute(orderId);
  console.log('ACCEPT OK:', result.estado);

  await prisma.$disconnect();
}

main().catch((e) => { console.error('ACCEPT ERROR:', e.message, e.code); process.exit(1); });

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
  console.log('Quote estado:', quote?.estado);

  const accept = new AcceptQuotation(repo, quotationRepo, prisma);
  const accepted = await accept.execute(orderId);
  console.log('ACCEPT OK:', accepted.estado);

  const restoredOrder = await repo.getById(orderId);
  console.log('Restored order estado:', restoredOrder?.estado);
  const restoredQuote = await quotationRepo.getByPedidoId(orderId);
  console.log('Restored quote estado:', restoredQuote?.estado, 'negotiationCount:', restoredQuote?.negotiationCount);

  const reject = new RejectQuotation(repo, quotationRepo, prisma);
  const rejected = await reject.execute(orderId, 'Prueba rechazo', 'test@test.com');
  console.log('REJECT OK:', rejected.estado);

  await prisma.$disconnect();
}

main().catch((e) => { console.error('ERROR:', e.message, e.code); process.exit(1); });

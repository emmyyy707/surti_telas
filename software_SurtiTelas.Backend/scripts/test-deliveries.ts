import { PrismaClient } from '@prisma/client';
import { PrismaDeliveryRepository } from '../src/modules/deliveries/infrastructure/repositories/PrismaDeliveryRepository';

const prisma = new PrismaClient();
const repo = new PrismaDeliveryRepository(prisma);

async function main() {
  try {
    const result = await repo.list({});
    console.log('Success:', JSON.stringify(result, null, 2));
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();

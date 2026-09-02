import type { SaleRepository } from '../../domain/repositories/SaleRepository';

export class DeleteSale {
  constructor(private readonly saleRepo: SaleRepository) {}
  async execute(id: string): Promise<void> {
    return this.saleRepo.delete(id);
  }
}

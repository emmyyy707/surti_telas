import { Prisma, PrismaClient } from '@prisma/client';
import { CompanyConfig } from '../../domain/entities/CompanyConfig';
import type {
  CompanyConfigRepository,
  UpdateCompanyConfigInput,
} from '../../domain/repositories/CompanyConfigRepository';

const toCompanyConfigData = (row: Prisma.CompanyConfigGetPayload<object>): CompanyConfig => ({
  id: row.id,
  nombre: row.nombre,
  nit: row.nit ?? undefined,
  telefono: row.telefono ?? undefined,
  email: row.email ?? undefined,
  direccion: row.direccion ?? undefined,
  ciudad: row.ciudad ?? undefined,
  logo: row.logo ?? undefined,
  moneda: row.moneda,
  createdAt: row.createdAt,
  updatedAt: row.updatedAt,
});

export class PrismaCompanyConfigRepository implements CompanyConfigRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async getCompany(): Promise<CompanyConfig | null> {
    const row = await this.prisma.companyConfig.findUnique({
      where: { id: 'company' },
    });
    return row ? new CompanyConfig(toCompanyConfigData(row)) : null;
  }

  async update(input: UpdateCompanyConfigInput): Promise<CompanyConfig> {
    const row = await this.prisma.companyConfig.update({
      where: { id: 'company' },
      data: {
        nombre: input.nombre,
        nit: input.nit,
        telefono: input.telefono,
        email: input.email,
        direccion: input.direccion,
        ciudad: input.ciudad,
        logo: input.logo,
        moneda: input.moneda,
      },
    });
    return new CompanyConfig(toCompanyConfigData(row));
  }
}

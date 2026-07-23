import { Request, Response } from 'express';
import { ok, created } from '../../../../shared/presentation/http/HttpResponse';
import { parseDto } from '../../../../shared/presentation/http/validate';
import { CommissionFiltersSchema, CreateCommissionSchema } from '../validators/commission.validators';
import { PrismaClient } from '@prisma/client';
import { Commission } from '../../domain/entities/Commission';

const prisma = new PrismaClient();

const commissionRepo = {
  async list(filters: { asesorId?: string; orderId?: string }): Promise<Commission[]> {
    const where: Record<string, unknown> = { deletedAt: null };
    if (filters.asesorId) where.asesorId = filters.asesorId;
    if (filters.orderId) where.orderId = filters.orderId;
    const rows = await prisma.commission.findMany({ where, orderBy: { createdAt: 'desc' } });
    return rows.map((row) => new Commission({
      id: row.id,
      asesorId: row.asesorId,
      orderId: row.orderId ?? undefined,
      monto: Number(row.monto.toNumber()),
      porcentaje: Number(row.porcentaje.toNumber()),
      estado: row.estado,
      notas: row.notas ?? undefined,
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
    }));
  },
  async getById(id: string): Promise<Commission | null> {
    const row = await prisma.commission.findFirst({ where: { id, deletedAt: null } });
    if (!row) return null;
    return new Commission({
      id: row.id,
      asesorId: row.asesorId,
      orderId: row.orderId ?? undefined,
      monto: Number(row.monto.toNumber()),
      porcentaje: Number(row.porcentaje.toNumber()),
      estado: row.estado,
      notas: row.notas ?? undefined,
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
    });
  },
  async create(input: { asesorId: string; orderId?: string; monto: number; porcentaje: number; notas?: string }): Promise<Commission> {
    const row = await prisma.commission.create({
      data: {
        asesorId: input.asesorId,
        orderId: input.orderId,
        monto: input.monto,
        porcentaje: input.porcentaje,
        notas: input.notas,
      },
    });
    return new Commission({
      id: row.id,
      asesorId: row.asesorId,
      orderId: row.orderId ?? undefined,
      monto: Number(row.monto.toNumber()),
      porcentaje: Number(row.porcentaje.toNumber()),
      estado: row.estado,
      notas: row.notas ?? undefined,
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
    });
  },
};

class ListCommissions {
  constructor(private repo: typeof commissionRepo) {}
  async execute(filters: { asesorId?: string; orderId?: string }): Promise<Commission[]> {
    return this.repo.list(filters);
  }
}

class GetCommissionById {
  constructor(private repo: typeof commissionRepo) {}
  async execute(id: string): Promise<Commission | null> {
    return this.repo.getById(id);
  }
}

class CreateCommission {
  constructor(private repo: typeof commissionRepo) {}
  async execute(input: { asesorId: string; orderId?: string; monto: number; porcentaje: number; notas?: string }): Promise<Commission> {
    return this.repo.create(input);
  }
}

const commissionUseCases = {
  listCommissions: new ListCommissions(commissionRepo),
  getCommissionById: new GetCommissionById(commissionRepo),
  createCommission: new CreateCommission(commissionRepo),
};

export const listCommissions = async (req: Request, res: Response) => {
  const filters = parseDto(CommissionFiltersSchema, req.query);
  if (req.user?.role === 'ASESOR') {
    filters.asesorId = req.user.id;
  }
  const data = await commissionUseCases.listCommissions.execute(filters as { asesorId?: string; orderId?: string });
  return ok(res, { items: data, meta: { totalRecords: data.length, page: 1, limit: data.length, totalPages: 1 } });
};

export const getCommission = async (req: Request, res: Response) => {
  const commission = await commissionUseCases.getCommissionById.execute(req.params.id);
  if (!commission) {
    return ok(res, { success: false, error: 'not_found', message: 'Comisión no encontrada' });
  }
  return ok(res, commission);
};

export const createCommission = async (req: Request, res: Response) => {
  const input = parseDto(CreateCommissionSchema, req.body);
  const commission = await commissionUseCases.createCommission.execute({
    ...input,
    asesorId: req.user?.role === 'ASESOR' ? req.user.id : input.asesorId,
  });
  return created(res, commission, 'Comisión creada');
};

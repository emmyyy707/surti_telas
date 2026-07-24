import { Request, Response } from 'express';
import { ok, created, noContent } from '../../../../shared/presentation/http/HttpResponse';
import { buildApiPaginatedResponse } from '../../../../shared/presentation/http/PaginatedResponse';
import { parseDto } from '../../../../shared/presentation/http/validate';
import { ReceiptFiltersSchema, CreateReceiptSchema, UpdateReceiptSchema, UpdateReceiptStatusSchema } from '../validators/receipt.validators';
import { PrismaClient } from '@prisma/client';
import type { Receipt } from '../../domain/entities/Receipt';

const prisma = new PrismaClient();

const receiptRepo = {
  async list(filters: { customerId?: string; orderId?: string }): Promise<{ data: Receipt[]; total: number }> {
    const where: Record<string, string | null> = { deletedAt: null };
    if (filters.customerId) where.customerId = filters.customerId;
    if (filters.orderId) where.orderId = filters.orderId;

    const [rows, total] = await Promise.all([
      prisma.receipt.findMany({
        where,
        select: {
          id: true,
          orderId: true,
          customerId: true,
          numero: true,
          total: true,
          concepto: true,
          notas: true,
          emitidoPor: true,
          emitidoAt: true,
          estado: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: { emitidoAt: 'desc' },
      }),
      prisma.receipt.count({ where }),
    ]);

    return {
      data: rows.map((row) => ({
        id: row.id,
        orderId: row.orderId ?? undefined,
        customerId: row.customerId,
        numero: row.numero,
        total: Number(row.total),
        concepto: row.concepto,
        notas: row.notas ?? undefined,
        emitidoPor: row.emitidoPor ?? undefined,
        emitidoAt: row.emitidoAt,
        estado: row.estado,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
      })) as unknown as Receipt[],
      total,
    };
  },

  async getById(id: string): Promise<Receipt | null> {
    const row = await prisma.receipt.findFirst({
      where: { id, deletedAt: null },
      select: {
        id: true,
        orderId: true,
        customerId: true,
        numero: true,
        total: true,
        concepto: true,
        notas: true,
        emitidoPor: true,
        emitidoAt: true,
        estado: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!row) return null;
    return {
      id: row.id,
      orderId: row.orderId ?? undefined,
      customerId: row.customerId,
      numero: row.numero,
      total: Number(row.total),
      concepto: row.concepto,
      notas: row.notas ?? undefined,
      emitidoPor: row.emitidoPor ?? undefined,
      emitidoAt: row.emitidoAt,
      estado: row.estado,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    } as unknown as Receipt;
  },

  async create(input: { orderId?: string; customerId: string; numero: string; total: number; concepto: string; notas?: string; emitidoPor?: string }): Promise<Receipt> {
    const row = await prisma.receipt.create({
      data: {
        orderId: input.orderId,
        customerId: input.customerId,
        numero: input.numero,
        total: input.total,
        concepto: input.concepto,
        notas: input.notas,
        emitidoPor: input.emitidoPor,
        estado: 'BORRADOR',
      },
      select: {
        id: true,
        orderId: true,
        customerId: true,
        numero: true,
        total: true,
        concepto: true,
        notas: true,
        emitidoPor: true,
        emitidoAt: true,
        estado: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return {
      id: row.id,
      orderId: row.orderId ?? undefined,
      customerId: row.customerId,
      numero: row.numero,
      total: Number(row.total),
      concepto: row.concepto,
      notas: row.notas ?? undefined,
      emitidoPor: row.emitidoPor ?? undefined,
      emitidoAt: row.emitidoAt,
      estado: row.estado,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    } as unknown as Receipt;
  },

  async update(id: string, changes: Partial<Receipt>): Promise<Receipt> {
    const row = await prisma.receipt.update({
      where: { id },
      data: {
        numero: changes.numero,
        total: changes.total,
        concepto: changes.concepto,
        notas: changes.notas,
        estado: changes.estado as unknown as string,
      },
      select: {
        id: true,
        orderId: true,
        customerId: true,
        numero: true,
        total: true,
        concepto: true,
        notas: true,
        emitidoPor: true,
        emitidoAt: true,
        estado: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return {
      id: row.id,
      orderId: row.orderId ?? undefined,
      customerId: row.customerId,
      numero: row.numero,
      total: Number(row.total),
      concepto: row.concepto,
      notas: row.notas ?? undefined,
      emitidoPor: row.emitidoPor ?? undefined,
      emitidoAt: row.emitidoAt,
      estado: row.estado,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    } as unknown as Receipt;
  },
};

class ListReceipts {
  constructor(private repo: typeof receiptRepo) {}
  async execute(filters: { customerId?: string; orderId?: string }): Promise<{ data: Receipt[]; total: number }> {
    return this.repo.list(filters);
  }
}

class GetReceiptById {
  constructor(private repo: typeof receiptRepo) {}
  async execute(id: string): Promise<Receipt | null> {
    return this.repo.getById(id);
  }
}

class CreateReceipt {
  constructor(private repo: typeof receiptRepo) {}
  async execute(input: { orderId?: string; customerId: string; numero: string; total: number; concepto: string; notas?: string; emitidoPor?: string }): Promise<Receipt> {
    return this.repo.create(input);
  }
}

class UpdateReceipt {
  constructor(private repo: typeof receiptRepo) {}
  async execute(id: string, changes: Partial<Receipt>): Promise<Receipt> {
    return this.repo.update(id, changes);
  }
}

class UpdateReceiptStatus {
  constructor(private repo: typeof receiptRepo) {}
  async execute(id: string, estado: string): Promise<Receipt> {
    return this.repo.update(id, { estado } as Partial<Receipt>);
  }
}

class DeleteReceipt {
  async execute(id: string): Promise<void> {
    await prisma.receipt.update({ where: { id }, data: { deletedAt: new Date() } });
  }
}

const receiptUseCases = {
  listReceipts: new ListReceipts(receiptRepo),
  getReceiptById: new GetReceiptById(receiptRepo),
  createReceipt: new CreateReceipt(receiptRepo),
  updateReceipt: new UpdateReceipt(receiptRepo),
  updateReceiptStatus: new UpdateReceiptStatus(receiptRepo),
  deleteReceipt: new DeleteReceipt(),
};

export const listReceipts = async (req: Request, res: Response) => {
  const filters = parseDto(ReceiptFiltersSchema, req.query);
  if (req.user?.role === 'CLIENTE') {
    filters.customerId = req.user.id;
  }
  const result = await receiptUseCases.listReceipts.execute(filters);
  const response = buildApiPaginatedResponse(
    result.data,
    result.total,
    1,
    result.data.length,
    null
  );
  return ok(res, response);
};

export const listMyReceipts = async (req: Request, res: Response) => {
  const filters = parseDto(ReceiptFiltersSchema, req.query);
  filters.customerId = req.user!.id;
  const result = await receiptUseCases.listReceipts.execute(filters);
  const response = buildApiPaginatedResponse(
    result.data,
    result.total,
    1,
    result.data.length,
    null
  );
  return ok(res, response);
};

export const getReceipt = async (req: Request, res: Response) => {
  const receipt = await receiptUseCases.getReceiptById.execute(req.params.id);
  if (!receipt) {
    return ok(res, { success: false, error: 'not_found', message: 'Recibo no encontrado' });
  }
  return ok(res, receipt);
};

export const createReceipt = async (req: Request, res: Response) => {
  const input = parseDto(CreateReceiptSchema, req.body);
  const receipt = await receiptUseCases.createReceipt.execute({
    ...input,
    emitidoPor: req.user?.nombre,
  });
  return created(res, receipt, 'Recibo creado');
};

export const updateReceipt = async (req: Request, res: Response) => {
  const changes = parseDto(UpdateReceiptSchema, req.body);
  const receipt = await receiptUseCases.updateReceipt.execute(req.params.id, changes);
  return ok(res, receipt, 'Recibo actualizado');
};

export const updateReceiptStatus = async (req: Request, res: Response) => {
  const { estado } = parseDto(UpdateReceiptStatusSchema, req.body);
  const receipt = await receiptUseCases.updateReceiptStatus.execute(req.params.id, estado);
  return ok(res, receipt, 'Estado del recibo actualizado');
};

export const deleteReceipt = async (req: Request, res: Response) => {
  await receiptUseCases.deleteReceipt.execute(req.params.id);
  return noContent(res);
};

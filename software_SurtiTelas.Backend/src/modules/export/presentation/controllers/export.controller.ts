import { Request, Response } from 'express';
import { parseDto } from '../../../../shared/presentation/http/validate';
import { ExportToCSV } from '../../application/use-cases/ExportUseCases';
import { z } from 'zod';

const ExportSchema = z.object({
  format: z.enum(['csv', 'xlsx']).default('csv'),
  data: z.array(z.record(z.string(), z.unknown())).min(1),
  filename: z.string().default('export'),
  columns: z.array(z.object({ key: z.string(), header: z.string() })).optional(),
});

export const exportData = async (req: Request, res: Response) => {
  const options = parseDto(ExportSchema, req.body);
  const exporter = new ExportToCSV();
  const result = exporter.execute(options as { format: 'csv' | 'xlsx'; data: Record<string, unknown>[]; filename: string; columns?: { key: string; header: string }[] });
  res.setHeader('Content-Type', result.mimeType);
  res.setHeader('Content-Disposition', 'attachment; filename="' + result.filename + '"');
  return res.send(result.buffer);
};

export const exportReport = async (req: Request, res: Response) => {
  const type = req.params.type as string;
  const query = req.query as { format?: string };
  const format = (query.format ?? 'csv') as 'csv' | 'xlsx';
  const data = [{ type, date: new Date().toISOString() }];
  const options = {
    format,
    data,
    filename: 'report-' + type + '-' + Date.now(),
  };
  const exporter = new ExportToCSV();
  const result = exporter.execute(options);
  res.setHeader('Content-Type', result.mimeType);
  res.setHeader('Content-Disposition', 'attachment; filename="' + result.filename + '"');
  return res.send(result.buffer);
};

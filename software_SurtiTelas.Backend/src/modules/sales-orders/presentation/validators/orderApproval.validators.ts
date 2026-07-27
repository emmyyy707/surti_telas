import { z } from 'zod';

export const UploadPaymentProofSchema = z.object({
  url: z.string().url('URL inválida'),
  nombreOriginal: z.string().min(1, 'El nombre del archivo es obligatorio'),
  mime: z.string().min(1, 'El tipo MIME es obligatorio'),
  tamaño: z.number().int().positive('El tamaño debe ser mayor a 0'),
  estado: z.string().min(1, 'El estado es obligatorio'),
  observaciones: z.string().optional(),
});

export const StartValidationSchema = z.object({});

export const AcceptOrderSchema = z.object({
  medioPago: z.string().optional(),
});

export const RejectOrderSchema = z.object({
  razon: z.enum([
    'COMPROBANTE_FALSO',
    'COMPROBANTE_ILEGIBLE',
    'PAGO_INCOMPLETO',
    'VALOR_INCORRECTO',
    'INFORMACION_INCOMPLETA',
    'PEDIDO_DUPLICADO',
    'PRODUCTO_NO_DISPONIBLE',
    'OTRA',
  ]),
  observaciones: z.string().optional(),
});

export const SalesReportSchema = z.object({
  asesorId: z.string().optional(),
  clienteId: z.string().optional(),
  desde: z.string().optional(),
  hasta: z.string().optional(),
});

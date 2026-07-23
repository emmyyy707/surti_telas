export interface ReceiptData {
  id: string;
  orderId?: string;
  customerId: string;
  numero: string;
  total: number;
  concepto: string;
  notas?: string;
  emitidoPor?: string;
  emitidoAt: string;
  estado: string;
  createdAt: string;
  updatedAt: string;
}

export class Receipt {
  readonly id: string;
  readonly orderId?: string;
  readonly customerId: string;
  readonly numero: string;
  readonly total: number;
  readonly concepto: string;
  readonly notas?: string;
  readonly emitidoPor?: string;
  readonly emitidoAt: string;
  readonly estado: string;
  readonly createdAt: string;
  readonly updatedAt: string;

  constructor(data: ReceiptData) {
    this.id = data.id;
    this.orderId = data.orderId;
    this.customerId = data.customerId;
    this.numero = data.numero;
    this.total = data.total;
    this.concepto = data.concepto;
    this.notas = data.notas;
    this.emitidoPor = data.emitidoPor;
    this.emitidoAt = data.emitidoAt;
    this.estado = data.estado;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }
}

export interface ReceiptRepository {
  list(filters: { customerId?: string; orderId?: string }): Promise<Receipt[]>;
  getById(id: string): Promise<Receipt | null>;
  create(input: { orderId?: string; customerId: string; numero: string; total: number; concepto: string; notas?: string; emitidoPor?: string }): Promise<Receipt>;
}

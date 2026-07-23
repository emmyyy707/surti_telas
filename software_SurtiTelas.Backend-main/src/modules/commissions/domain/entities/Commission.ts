export interface CommissionData {
  id: string;
  asesorId: string;
  orderId?: string;
  monto: number;
  porcentaje: number;
  estado: string;
  notas?: string;
  createdAt: string;
  updatedAt: string;
}

export class Commission {
  readonly id: string;
  readonly asesorId: string;
  readonly orderId?: string;
  readonly monto: number;
  readonly porcentaje: number;
  readonly estado: string;
  readonly notas?: string;
  readonly createdAt: string;
  readonly updatedAt: string;

  constructor(data: CommissionData) {
    this.id = data.id;
    this.asesorId = data.asesorId;
    this.orderId = data.orderId;
    this.monto = data.monto;
    this.porcentaje = data.porcentaje;
    this.estado = data.estado;
    this.notas = data.notas;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }
}

export interface CommissionRepository {
  list(filters: { asesorId?: string; orderId?: string }): Promise<Commission[]>;
  getById(id: string): Promise<Commission | null>;
  create(input: { asesorId: string; orderId?: string; monto: number; porcentaje: number; notas?: string }): Promise<Commission>;
}

import { Commission } from '../entities/Commission';

export interface CommissionRepository {
  list(filters: { asesorId?: string; orderId?: string }): Promise<Commission[]>;
  getById(id: string): Promise<Commission | null>;
  create(input: { asesorId: string; orderId?: string; monto: number; porcentaje: number; notas?: string }): Promise<Commission>;
}

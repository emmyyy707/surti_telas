import type { Return, ReturnData, ReturnFilters, ReturnListResult } from '../entities/Return';
export type { Return, ReturnData, ReturnFilters, ReturnListResult } from '../entities/Return';

export interface CreateReturnInput {
  orderId?: string;
  prenda?: string;
  referencia?: string;
  motivo?: string;
  cantidad: number;
  cantidadInspeccionada?: number;
  destino?: Return['destino'];
  cliente?: string;
  responsable?: string;
  observaciones?: string;
  fechaDevolucion?: string;
}

export interface UpdateReturnInput {
  prenda?: string;
  referencia?: string;
  motivo?: string;
  cantidad?: number;
  cantidadInspeccionada?: number;
  estado?: Return['estado'];
  destino?: Return['destino'];
  cliente?: string;
  responsable?: string;
  observaciones?: string;
}

export interface ReturnRepository {
  list(filters?: ReturnFilters): Promise<ReturnListResult>;
  getById(id: string): Promise<Return | null>;
  create(data: ReturnData): Promise<Return>;
  update(id: string, changes: Partial<ReturnData>): Promise<Return>;
  delete(id: string): Promise<void>;
  nextNumero(): Promise<string>;
}

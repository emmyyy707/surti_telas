import type { ControlPrenda, ControlPrendaEstado, ControlPrendaEtapa } from '../entities/ControlPrenda';

export interface CreateControlPrendaInput {
  produccionId: string;
  etapa: ControlPrendaEtapa;
  cantidadTotal: number;
  cantidadRevisada?: number;
  cantidadAprobada?: number;
  cantidadRechazada?: number;
  observaciones?: string;
  revisadoPorId?: string;
  creadoPorId: string;
}

export interface UpdateControlPrendaInput {
  etapa?: ControlPrendaEtapa;
  estado?: ControlPrendaEstado;
  cantidadTotal?: number;
  cantidadRevisada?: number;
  cantidadAprobada?: number;
  cantidadRechazada?: number;
  observaciones?: string;
  revisadoPorId?: string;
}

export interface ControlPrendaFilters {
  produccionId?: string;
  etapa?: ControlPrendaEtapa;
  estado?: ControlPrendaEstado;
  page?: number;
  limit?: number;
  cursor?: string;
  sort?: 'createdAt' | 'etapa' | 'estado';
  order?: 'asc' | 'desc';
}

export interface ControlPrendaRepository {
  list(filters?: ControlPrendaFilters): Promise<{ data: ControlPrenda[]; meta: { total: number; page?: number; limit: number; nextCursor?: string } }>;
  getById(id: string): Promise<ControlPrenda | null>;
  create(input: CreateControlPrendaInput): Promise<ControlPrenda>;
  update(id: string, changes: UpdateControlPrendaInput): Promise<ControlPrenda>;
  review(id: string, estado: ControlPrendaEstado, revisadoPorId: string, observaciones?: string): Promise<ControlPrenda>;
  delete(id: string): Promise<void>;
}

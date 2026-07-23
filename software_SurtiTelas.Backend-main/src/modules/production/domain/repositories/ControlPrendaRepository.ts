export interface CreateControlPrendaInput {
  produccionId: string;
  etapa: 'CORTE' | 'CONFECCION' | 'ACABADO' | 'CONTROL_CALIDAD' | 'EMPAQUE';
  cantidadTotal: number;
  observaciones?: string;
  creadoPorId: string;
}

export interface ReviewControlPrendaInput {
  estado: 'APROBADO' | 'RECHAZADO';
  cantidadAprobada?: number;
  cantidadRechazada?: number;
  revisadoPorId: string;
}

export interface UpdateControlPrendaInput {
  etapa?: 'CORTE' | 'CONFECCION' | 'ACABADO' | 'CONTROL_CALIDAD' | 'EMPAQUE';
  cantidadTotal?: number;
  observaciones?: string;
}

export interface ControlPrendaListItem {
  id: string;
  produccionId: string;
  etapa: string;
  estado: string;
  cantidadTotal: number;
  cantidadRevisada: number;
  cantidadAprobada: number;
  cantidadRechazada: number;
  observaciones?: string;
  revisadoPor?: { id: string; nombre: string } | null;
  creadoPor: { id: string; nombre: string };
  createdAt: string;
  updatedAt: string;
}

export interface ControlPrendaRepository {
  create(input: CreateControlPrendaInput): Promise<ControlPrendaListItem>;
  list(filters?: { produccionId?: string; etapa?: string; estado?: string }): Promise<{ data: ControlPrendaListItem[]; meta: { total: number } }>;
  getById(id: string): Promise<ControlPrendaListItem | null>;
  review(id: string, changes: ReviewControlPrendaInput): Promise<ControlPrendaListItem>;
  update(id: string, changes: Partial<ControlPrendaListItem>): Promise<ControlPrendaListItem>;
  delete(id: string): Promise<void>;
}

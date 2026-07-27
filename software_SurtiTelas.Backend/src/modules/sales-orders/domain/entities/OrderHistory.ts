export interface OrderHistoryData {
  id: string;
  pedidoId: string;
  usuarioId?: string;
  usuarioNombre?: string;
  accion: string;
  estadoAnterior: string;
  estadoNuevo: string;
  razon?: string;
  informacion?: Record<string, unknown>;
  createdAt: string;
}

export class OrderHistory {
  readonly id: string;
  readonly pedidoId: string;
  readonly usuarioId?: string;
  readonly usuarioNombre?: string;
  readonly accion: string;
  readonly estadoAnterior: string;
  readonly estadoNuevo: string;
  readonly razon?: string;
  readonly informacion?: Record<string, unknown>;
  readonly createdAt: string;

  constructor(data: OrderHistoryData) {
    this.id = data.id;
    this.pedidoId = data.pedidoId;
    this.usuarioId = data.usuarioId;
    this.usuarioNombre = data.usuarioNombre;
    this.accion = data.accion;
    this.estadoAnterior = data.estadoAnterior;
    this.estadoNuevo = data.estadoNuevo;
    this.razon = data.razon;
    this.informacion = data.informacion;
    this.createdAt = data.createdAt;
  }
}

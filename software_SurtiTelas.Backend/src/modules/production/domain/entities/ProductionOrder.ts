export type ProductionStatus = 'PENDIENTE' | 'EN_PROCESO' | 'TERMINADO';

export interface ProductionOrderData {
  id?: string;
  pedidoId?: string;
  operarioId?: string;
  tallerId?: string;
  referencia: string;
  cantidad: number;
  fechaInicio?: Date;
  fechaEstimada: Date;
  avance: number;
  estado: ProductionStatus;
  tela?: string;
  colores: string[];
  curvaTallas?: Record<string, number>;
  notasTecnicas?: string;
  pedidoNumero?: string;
  pedidoCliente?: string;
  pedidoPrioridad?: string;
  pedidoItemNombre?: string;
  pedidoTotal?: number;
}

export class ProductionOrder {
  readonly id?: string;
  readonly pedidoId?: string;
  readonly operarioId?: string;
  readonly tallerId?: string;
  readonly referencia: string;
  readonly cantidad: number;
  readonly fechaInicio?: Date;
  readonly fechaEstimada: Date;
  readonly avance: number;
  readonly estado: ProductionStatus;
  readonly tela?: string;
  readonly colores: string[];
  readonly curvaTallas?: Record<string, number>;
  readonly notasTecnicas?: string;
  readonly pedidoNumero?: string;
  readonly pedidoCliente?: string;
  readonly pedidoPrioridad?: string;
  readonly pedidoItemNombre?: string;
  readonly pedidoTotal?: number;

  constructor(data: ProductionOrderData) {
    ProductionOrder.validate(data);
    this.id = data.id;
    this.pedidoId = data.pedidoId;
    this.operarioId = data.operarioId;
    this.tallerId = data.tallerId;
    this.referencia = data.referencia;
    this.cantidad = data.cantidad;
    this.fechaInicio = data.fechaInicio;
    this.fechaEstimada = data.fechaEstimada;
    this.avance = data.avance;
    this.estado = data.estado;
    this.tela = data.tela;
    this.colores = data.colores;
    this.curvaTallas = data.curvaTallas;
    this.notasTecnicas = data.notasTecnicas;
    this.pedidoNumero = data.pedidoNumero;
    this.pedidoCliente = data.pedidoCliente;
    this.pedidoPrioridad = data.pedidoPrioridad;
    this.pedidoItemNombre = data.pedidoItemNombre;
    this.pedidoTotal = data.pedidoTotal;
  }

  static validate(data: ProductionOrderData): void {
    if (!data.referencia.trim()) throw new Error('La orden de producción debe tener una referencia');
    if (data.cantidad <= 0) throw new Error('La cantidad debe ser mayor a cero');
    if (data.avance < 0 || data.avance > 100) throw new Error('El avance debe estar entre 0 y 100');
  }

  avanceValido(nuevoAvance: number): boolean {
    return nuevoAvance >= 0 && nuevoAvance <= 100;
  }

  puedeTerminar(): boolean {
    return this.avance === 100;
  }

  withProgress(newProgress: number): ProductionOrder {
    if (!this.avanceValido(newProgress)) {
      throw new Error('El avance debe estar entre 0 y 100');
    }
    const nextEstado = newProgress === 100 ? 'TERMINADO' : newProgress > 0 ? 'EN_PROCESO' : this.estado;
    return new ProductionOrder({ ...this, avance: newProgress, estado: nextEstado as ProductionStatus });
  }
}

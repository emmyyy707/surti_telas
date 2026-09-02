export type CustomerStatus = 'Activo' | 'Inactivo';

import { BadRequestError } from '../../../../shared/domain/errors';

export interface CustomerData {
  id?: string;
  nombre: string;
  apellidos?: string;
  email?: string;
  ciudad: string;
  tel: string;
  asesorId?: string;
  asesor?: string;
  nit?: string;
  cupoTotal: number;
  cupoUsado: number;
  deudaVencida: number;
  isTrustedCustomer: boolean;
  estado: CustomerStatus;
  pedidos: number;
  rol: 'CLIENTE';
  direccion?: string;
}

export class Customer {
  readonly id?: string;
  readonly nombre: string;
  readonly apellidos?: string;
  readonly email?: string;
  readonly ciudad: string;
  readonly tel: string;
  readonly asesorId?: string;
  readonly asesor?: string;
  readonly nit?: string;
  readonly cupoTotal: number;
  readonly cupoUsado: number;
  readonly deudaVencida: number;
  readonly isTrustedCustomer: boolean;
  readonly estado: CustomerStatus;
  readonly pedidos: number;
  readonly rol: 'CLIENTE';
  readonly direccion?: string;

  constructor(data: CustomerData) {
    Customer.validate(data);
    this.id = data.id;
    this.nombre = data.nombre;
    this.apellidos = data.apellidos;
    this.email = data.email;
    this.ciudad = data.ciudad;
    this.tel = data.tel;
    this.asesorId = data.asesorId;
    this.asesor = data.asesor;
    this.nit = data.nit;
    this.cupoTotal = data.cupoTotal;
    this.cupoUsado = data.cupoUsado;
    this.deudaVencida = data.deudaVencida;
    this.isTrustedCustomer = data.isTrustedCustomer;
    this.estado = data.estado;
    this.pedidos = data.pedidos;
    this.rol = data.rol;
    this.direccion = data.direccion;
  }

  static validate(data: CustomerData): void {
    if (!data.nombre.trim()) {
      throw new BadRequestError('El cliente debe tener un nombre');
    }
    if (!Number.isFinite(data.cupoTotal) || data.cupoTotal < 0) {
      throw new BadRequestError('El cupo total no puede ser negativo');
    }
    if (!Number.isFinite(data.cupoUsado) || data.cupoUsado < 0) {
      throw new BadRequestError('El cupo usado no puede ser negativo');
    }
    if (!Number.isFinite(data.deudaVencida) || data.deudaVencida < 0) {
      throw new BadRequestError('La deuda vencida no puede ser negativa');
    }
  }

  tieneCupoDisponible(monto: number): boolean {
    return this.cupoUsado + monto <= this.cupoTotal;
  }
}

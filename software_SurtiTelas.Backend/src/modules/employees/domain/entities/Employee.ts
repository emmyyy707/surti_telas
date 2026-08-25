import { BadRequestError } from '../../../../shared/domain/errors';

export type EmployeeRole = 'ASESOR' | 'DOMICILIARIO';

export type EmployeeEstado = 'ACTIVO' | 'INACTIVO';

export interface EmployeeProfileData {
  cargo?: string;
  fechaContratacion?: Date | null;
  salario?: number | null;
  tipoEmpleado?: EmployeeRole | null;
}

export interface EmployeeData {
  id?: string;
  email: string;
  nombre: string;
  apellidos?: string | null;
  telefono?: string | null;
  direccion?: string | null;
  tipoDocumento?: string | null;
  numeroDocumento?: string | null;
  role: EmployeeRole;
  estado: EmployeeEstado;
  avatar?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
  profile?: EmployeeProfileData;
}

export class Employee {
  readonly id?: string;
  readonly email: string;
  readonly nombre: string;
  readonly apellidos?: string | null;
  readonly telefono?: string | null;
  readonly direccion?: string | null;
  readonly tipoDocumento?: string | null;
  readonly numeroDocumento?: string | null;
  readonly role: EmployeeRole;
  readonly estado: EmployeeEstado;
  readonly avatar?: string | null;
  readonly createdAt?: Date;
  readonly updatedAt?: Date;
  readonly profile?: EmployeeProfileData;

  constructor(data: EmployeeData) {
    Employee.validate(data);
    this.id = data.id;
    this.email = data.email;
    this.nombre = data.nombre;
    this.apellidos = data.apellidos;
    this.telefono = data.telefono;
    this.direccion = data.direccion;
    this.tipoDocumento = data.tipoDocumento;
    this.numeroDocumento = data.numeroDocumento;
    this.role = data.role;
    this.estado = data.estado;
    this.avatar = data.avatar;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
    this.profile = data.profile;
  }

  static validate(data: EmployeeData): void {
    if (!data.email || !data.email.includes('@')) {
      throw new BadRequestError('El correo electrónico es obligatorio y debe ser válido');
    }
    if (!data.nombre || data.nombre.trim().length < 3) {
      throw new BadRequestError('El nombre es obligatorio (mínimo 3 caracteres)');
    }
    if (!['ASESOR', 'DOMICILIARIO'].includes(data.role)) {
      throw new BadRequestError('El rol debe ser ASESOR o DOMICILIARIO');
    }
  }

  get nombreCompleto(): string {
    return this.apellidos ? `${this.nombre} ${this.apellidos}` : this.nombre;
  }

  get activo(): boolean {
    return this.estado === 'ACTIVO';
  }
}

import type { CustomerData, CustomerStatus } from '../../domain/entities/Customer';

type CustomerRow = {
  id: string;
  nombre: string;
  ciudad: string | null;
  telefono: string | null;
  asesorId: string | null;
  asesor: { nombre: string } | null;
  nit: string | null;
  cupoTotal: { toNumber(): number };
  cupoUsado: { toNumber(): number };
  deudaVencida: { toNumber(): number };
  isTrustedCustomer: boolean;
  estado: 'ACTIVO' | 'INACTIVO';
  _count: { orders: number };
};

export function toCustomerData(row: CustomerRow): CustomerData {
  return {
    id: row.id,
    nombre: row.nombre,
    ciudad: row.ciudad ?? '',
    tel: row.telefono ?? '',
    asesorId: row.asesorId ?? undefined,
    asesor: row.asesor?.nombre ?? '',
    nit: row.nit ?? undefined,
    cupoTotal: row.cupoTotal.toNumber(),
    cupoUsado: row.cupoUsado.toNumber(),
    deudaVencida: row.deudaVencida.toNumber(),
    isTrustedCustomer: row.isTrustedCustomer,
    estado: row.estado === 'ACTIVO' ? 'Activo' : 'Inactivo',
    pedidos: row._count.orders,
  };
}

export const STATUS_TO_DB: Record<CustomerStatus, 'ACTIVO' | 'INACTIVO'> = {
  Activo: 'ACTIVO',
  Inactivo: 'INACTIVO',
};

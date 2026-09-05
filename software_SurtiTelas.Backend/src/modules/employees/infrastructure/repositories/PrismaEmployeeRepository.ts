import { Prisma, PrismaClient, TipoEmpleado } from '@prisma/client';
import { Employee } from '../../domain/entities/Employee';
import type { EmployeeRole, EmployeeEstado, EmployeeProfileData } from '../../domain/entities/Employee';
import type {
  EmployeeRepository,
  CreateEmployeeInput,
  UpdateEmployeeInput,
  EmployeeFilters,
} from '../../domain/repositories/EmployeeRepository';
import { NotFoundError } from '../../../../shared/domain/errors';

const EMPLOYEE_ROLES: EmployeeRole[] = ['ASESOR', 'DOMICILIARIO'];

const toEmployee = (row: Prisma.UserGetPayload<{ include: { employeeProfile: true } }>): Employee => {
  const profile: EmployeeProfileData | undefined = row.employeeProfile
    ? {
        cargo: row.employeeProfile.cargo ?? undefined,
        fechaContratacion: row.employeeProfile.fechaContratacion ?? null,
        salario: row.employeeProfile.salario ? Number(row.employeeProfile.salario) : null,
        tipoEmpleado: (row.employeeProfile.tipoEmpleado as EmployeeRole | null) ?? null,
      }
    : undefined;

  return new Employee({
    id: row.id,
    email: row.email,
    nombre: row.nombre,
    apellidos: row.apellidos ?? null,
    telefono: row.telefono ?? null,
    direccion: row.direccion ?? null,
    tipoDocumento: row.tipoDocumento ?? null,
    numeroDocumento: row.numeroDocumento ?? null,
    role: row.role as EmployeeRole,
    estado: (row.estado as 'ACTIVO' | 'INACTIVO') ?? 'ACTIVO',
    avatar: row.avatar ?? null,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    profile,
  });
};

export class PrismaEmployeeRepository implements EmployeeRepository {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly hasher: { hash(password: string): Promise<string> }
  ) {}

  async list(filters: EmployeeFilters = {}): Promise<{ data: Employee[]; meta: { total: number; page: number; limit: number; nextCursor?: string } }> {
    const where: Prisma.UserWhereInput = {
      deletedAt: null,
      role: { in: EMPLOYEE_ROLES },
    };

    if (filters.search) {
      where.OR = [
        { nombre: { contains: filters.search, mode: 'insensitive' } },
        { email: { contains: filters.search, mode: 'insensitive' } },
        { numeroDocumento: { contains: filters.search, mode: 'insensitive' } },
      ];
    }
    if (filters.role) where.role = filters.role;
    if (filters.estado) where.estado = filters.estado;

    const page = filters.page ?? 1;
    const limit = Math.min(filters.limit ?? 50, 100);
    const sort = filters.sort ?? 'createdAt';
    const order = filters.order ?? 'desc';
    const orderBy: Record<string, 'asc' | 'desc'> = { [sort]: order };

    const [rows, total] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        where,
        orderBy: orderBy as Prisma.UserOrderByWithRelationInput,
        skip: (page - 1) * limit,
        take: limit,
        include: { employeeProfile: true },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      data: rows.map(toEmployee),
      meta: { total, page, limit, nextCursor: undefined },
    };
  }

  async getById(id: string): Promise<Employee | null> {
    const row = await this.prisma.user.findFirst({
      where: { id, deletedAt: null, role: { in: EMPLOYEE_ROLES } },
      include: { employeeProfile: true },
    });
    if (!row) return null;
    return toEmployee(row);
  }

  async search(query: string): Promise<Employee[]> {
    const rows = await this.prisma.user.findMany({
      where: {
        deletedAt: null,
        role: { in: EMPLOYEE_ROLES },
        OR: [
          { nombre: { contains: query, mode: 'insensitive' } },
          { email: { contains: query, mode: 'insensitive' } },
          { numeroDocumento: { contains: query, mode: 'insensitive' } },
          { apellidos: { contains: query, mode: 'insensitive' } },
        ],
      },
      include: { employeeProfile: true },
      orderBy: { createdAt: 'desc' },
    });
    return rows.map(toEmployee);
  }

  async create(data: CreateEmployeeInput): Promise<Employee> {
    const passwordHash = await this.hasher.hash(data.password);
    const role = data.role;
    const tipoEmpleado = data.profile?.tipoEmpleado ?? (role === 'DOMICILIARIO' ? 'DOMICILIARIO' : 'ASESOR');

    const row = await this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: data.email,
          nombre: data.nombre,
          apellidos: data.apellidos,
          passwordHash,
          role,
          telefono: data.telefono,
          direccion: data.direccion,
          tipoDocumento: data.tipoDocumento,
          numeroDocumento: data.numeroDocumento,
          employeeProfile: {
            create: {
              cargo: data.profile?.cargo,
              fechaContratacion: data.profile?.fechaContratacion,
              salario: data.profile?.salario ? new Prisma.Decimal(data.profile.salario) : undefined,
              tipoEmpleado: tipoEmpleado as TipoEmpleado,
            },
          },
        },
        include: { employeeProfile: true },
      });

      if (role === 'DOMICILIARIO' && data.domiciliaryData) {
        await tx.domiciliario.create({
          data: {
            userId: user.id,
            zona: data.domiciliaryData.zona,
            vehiculo: data.domiciliaryData.vehiculo,
            capacidad: data.domiciliaryData.capacidad,
          },
        });
      }

      return user;
    });

    return toEmployee(row);
  }

  async update(id: string, changes: UpdateEmployeeInput): Promise<Employee> {
    const existing = await this.prisma.user.findFirst({
      where: { id, deletedAt: null, role: { in: EMPLOYEE_ROLES } },
      include: { employeeProfile: true },
    });
    if (!existing) {
      throw new NotFoundError('Empleado no encontrado');
    }

    const row = await this.prisma.user.update({
      where: { id },
      data: {
        nombre: changes.nombre,
        apellidos: changes.apellidos,
        email: changes.email,
        telefono: changes.telefono,
        direccion: changes.direccion,
        tipoDocumento: changes.tipoDocumento,
        numeroDocumento: changes.numeroDocumento,
        ...(changes.avatar !== undefined && { avatar: changes.avatar }),
        ...(changes.role !== undefined && { role: changes.role as any }),
        employeeProfile: changes.profile
          ? {
              upsert: {
                create: {
                  cargo: changes.profile.cargo,
                  fechaContratacion: changes.profile.fechaContratacion,
                  salario: changes.profile.salario ? new Prisma.Decimal(changes.profile.salario) : undefined,
                  tipoEmpleado: (changes.profile.tipoEmpleado ?? existing.employeeProfile?.tipoEmpleado) as TipoEmpleado | undefined,
                },
                update: {
                  cargo: changes.profile.cargo,
                  fechaContratacion: changes.profile.fechaContratacion,
                  salario: changes.profile.salario ? new Prisma.Decimal(changes.profile.salario) : undefined,
                  tipoEmpleado: (changes.profile.tipoEmpleado ?? existing.employeeProfile?.tipoEmpleado) as TipoEmpleado | undefined,
                },
              },
            }
          : undefined,
      },
      include: { employeeProfile: true },
    });

    if (changes.domiciliaryData) {
      const shouldBeDomiciliary = (row.role as string) === 'DOMICILIARIO';
      if (shouldBeDomiciliary) {
        const existingDomiciliario = await this.prisma.domiciliario.findFirst({ where: { userId: id } });
        if (existingDomiciliario) {
          await this.prisma.domiciliario.update({
            where: { id: existingDomiciliario.id },
            data: {
              ...(changes.domiciliaryData.zona !== undefined && { zona: changes.domiciliaryData.zona }),
              ...(changes.domiciliaryData.vehiculo !== undefined && { vehiculo: changes.domiciliaryData.vehiculo }),
              ...(changes.domiciliaryData.capacidad !== undefined && { capacidad: changes.domiciliaryData.capacidad }),
              ...(changes.domiciliaryData.activo !== undefined && { activo: changes.domiciliaryData.activo }),
            },
          });
        } else {
          await this.prisma.domiciliario.create({
            data: {
              userId: id,
              zona: changes.domiciliaryData.zona,
              vehiculo: changes.domiciliaryData.vehiculo,
              capacidad: changes.domiciliaryData.capacidad,
              activo: changes.domiciliaryData.activo ?? true,
            },
          });
        }
      }
    } else if (existing.role === 'DOMICILIARIO' && row.role !== 'DOMICILIARIO') {
      await this.prisma.domiciliario.updateMany({
        where: { userId: id },
        data: { activo: false },
      });
    }

    return toEmployee(row);
  }

  async changeStatus(id: string, estado: EmployeeEstado): Promise<Employee> {
    const row = await this.prisma.user.update({
      where: { id },
      data: { estado },
      include: { employeeProfile: true },
    });
    return toEmployee(row);
  }

  async delete(id: string): Promise<void> {
    const existing = await this.prisma.user.findFirst({
      where: { id, deletedAt: null, role: { in: EMPLOYEE_ROLES } },
    });
    if (!existing) {
      throw new NotFoundError('Empleado no encontrado');
    }
    await this.prisma.user.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}

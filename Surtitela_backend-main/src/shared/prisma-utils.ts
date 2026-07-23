// Convierte los campos Decimal que devuelve Prisma a valores primitivos
export function normalizarPrismaDecimal(value: unknown): unknown {
  if (value && typeof value === "object" && typeof (value as any).toNumber === "function") {
    return (value as any).toNumber();
  }
  return value;
}

// Normaliza una entidad Prisma usando normalizarPrismaDecimal en cada propiedad
export function normalizarPrismaEntidad(entity: object): any {
  return Object.fromEntries(
    Object.entries(entity).map(([key, value]) => [key, normalizarPrismaDecimal(value)])
  );
}

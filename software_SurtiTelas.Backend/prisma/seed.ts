import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const PERMISSIONS: { code: string; description: string; module: string }[] = [
  { code: 'catalog:read', description: 'Ver catálogo', module: 'catalog' },
  { code: 'catalog:create', description: 'Crear productos', module: 'catalog' },
  { code: 'catalog:update', description: 'Editar productos', module: 'catalog' },
  { code: 'catalog:delete', description: 'Eliminar productos', module: 'catalog' },
  { code: 'catalog:publish', description: 'Publicar/despublicar', module: 'catalog' },
  { code: 'customers:read', description: 'Ver clientes', module: 'customers' },
  { code: 'customers:create', description: 'Crear clientes', module: 'customers' },
  { code: 'customers:update', description: 'Editar clientes', module: 'customers' },
  { code: 'orders:read', description: 'Ver pedidos', module: 'orders' },
  { code: 'orders:create', description: 'Crear pedidos', module: 'orders' },
  { code: 'orders:update', description: 'Cambiar estado de pedidos', module: 'orders' },
  { code: 'stock:read', description: 'Ver inventario', module: 'stock' },
  { code: 'stock:create', description: 'Gestionar insumos/proveedores', module: 'stock' },
  { code: 'stock:move', description: 'Registrar movimientos', module: 'stock' },
  { code: 'production:read', description: 'Ver producción', module: 'production' },
  { code: 'production:create', description: 'Crear órdenes de producción', module: 'production' },
  { code: 'production:update', description: 'Actualizar avance', module: 'production' },
  { code: 'auth:manage', description: 'Gestionar usuarios y roles', module: 'auth' },
  { code: 'payments:read', description: 'Ver pagos', module: 'payments' },
  { code: 'payments:create', description: 'Registrar pagos', module: 'payments' },
  { code: 'payments:update', description: 'Actualizar estado de pagos', module: 'payments' },
  { code: 'receipts:read', description: 'Ver recibos', module: 'receipts' },
  { code: 'receipts:create', description: 'Emitir recibos', module: 'receipts' },
  { code: 'commissions:read', description: 'Ver comisiones', module: 'commissions' },
  { code: 'commissions:create', description: 'Registrar comisiones', module: 'commissions' },
  { code: 'company:update', description: 'Editar configuración de empresa', module: 'company' },
  { code: 'cms:read', description: 'Ver páginas institucionales', module: 'cms' },
  { code: 'cms:update', description: 'Editar páginas institucionales', module: 'cms' },
  { code: 'contact:read', description: 'Ver mensajes de contacto', module: 'contact' },
  { code: 'contact:update', description: 'Gestionar mensajes de contacto', module: 'contact' },
  { code: 'returns:read', description: 'Ver devoluciones', module: 'returns' },
  { code: 'returns:create', description: 'Registrar devoluciones', module: 'returns' },
  { code: 'returns:update', description: 'Gestionar devoluciones', module: 'returns' },
  { code: 'deliveries:read', description: 'Ver entregas/domicilios', module: 'deliveries' },
  { code: 'deliveries:create', description: 'Crear entregas/domicilios', module: 'deliveries' },
  { code: 'deliveries:update', description: 'Gestionar entregas/domicilios', module: 'deliveries' },
];

const ROLE_PERMISSIONS: Record<Role, string[]> = {
  ADMIN: PERMISSIONS.map((p) => p.code),
  ASESOR: [
    'catalog:read', 'catalog:create', 'catalog:update', 'catalog:publish',
    'customers:read', 'customers:create', 'customers:update',
    'orders:read', 'orders:create', 'orders:update',
    'stock:read', 'production:read',
    'payments:read', 'payments:create',
    'receipts:read',
    'commissions:read', 'commissions:create',
    'contact:read', 'contact:update',
    'returns:read', 'returns:create', 'returns:update',
    'deliveries:read', 'deliveries:create', 'deliveries:update',
  ],
  DOMICILIARIO: ['orders:read', 'orders:update', 'deliveries:read', 'deliveries:update'],
  CLIENTE: ['catalog:read', 'orders:read', 'orders:create'],
};

function generatePassword(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%';
  let password = '';
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  for (let i = 0; i < array.length; i++) {
    password += chars[array[i] % chars.length];
  }
  return password;
}

async function main() {
  console.log('🌱 Sembrando base de datos SurtiTelas…');

  const adminPassword = process.env.ADMIN_PASSWORD || generatePassword();
  const asesorPassword = process.env.ASESOR_PASSWORD || generatePassword();
  const domiciliarioPassword = process.env.DOMICILIARIO_PASSWORD || generatePassword();

  for (const p of PERMISSIONS) {
    await prisma.permission.upsert({
      where: { code: p.code },
      update: { description: p.description, module: p.module },
      create: p,
    });
  }

  for (const role of Object.keys(ROLE_PERMISSIONS) as Role[]) {
    const codes = ROLE_PERMISSIONS[role];
    for (const code of codes) {
      const permission = await prisma.permission.findUnique({ where: { code } });
      if (permission) {
        await prisma.rolePermission.upsert({
          where: { role_permissionId: { role, permissionId: permission.id } },
          update: {},
          create: { role, permissionId: permission.id },
        });
      }
    }
  }
  console.log('✓ Roles y permisos creados');

  const adminEmail = 'admin@surtitelas.com';
  const existingAdmin = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (!existingAdmin) {
    const passwordHash = await bcrypt.hash(adminPassword, 12);
    await prisma.user.create({
      data: {
        email: adminEmail,
        nombre: 'Administrador SurtiTelas',
        passwordHash,
        role: Role.ADMIN,
      },
    });
    console.log(`✓ Usuario admin creado (${adminEmail} / ${adminPassword})`);
  }

  const categories = [
    { nombre: 'Camisetas', slug: 'camisetas' },
    { nombre: 'Blusas', slug: 'blusas' },
    { nombre: 'Vestidos', slug: 'vestidos' },
    { nombre: 'Pantalones', slug: 'pantalones' },
    { nombre: 'Faldas', slug: 'faldas' },
    { nombre: 'Chaquetas', slug: 'chaquetas' },
    { nombre: 'Accesorios', slug: 'accesorios' },
  ];
  for (const c of categories) {
    await prisma.category.upsert({
      where: { slug: c.slug },
      update: { nombre: c.nombre },
      create: c,
    });
  }
  console.log('✓ Categorías creadas');

  const camisetas = await prisma.category.findUnique({ where: { slug: 'camisetas' } });
  if (camisetas) {
    await prisma.product.upsert({
      where: { ref: 'REF-001' },
      update: {
        nombre: 'Camiseta básica de algodón',
        descripcion: 'Camiseta de algodón 100%',
        categoriaId: camisetas.id,
        precio: 25000,
        cantidadStock: 120,
        stockStatus: 'OK',
        estado: 'ACTIVO',
        tela: 'Algodón',
        colores: ['Blanco', 'Negro'],
        tallas: ['S', 'M', 'L', 'XL'],
        publicado: true,
        destacado: true,
        nuevo: true,
      },
      create: {
        ref: 'REF-001',
        codigo: 'PROD-001',
        nombre: 'Camiseta básica de algodón',
        descripcion: 'Camiseta de algodón 100%',
        categoriaId: camisetas.id,
        precio: 25000,
        cantidadStock: 120,
        stockStatus: 'OK',
        estado: 'ACTIVO',
        tela: 'Algodón',
        colores: ['Blanco', 'Negro'],
        tallas: ['S', 'M', 'L', 'XL'],
        imagenes: [],
        publicado: true,
        destacado: true,
        nuevo: true,
      },
    });
  }
  console.log('✓ Producto de ejemplo asegurado (REF-001)');

  const adminUser = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (adminUser) {
    const existingCustomer = await prisma.customer.findFirst({ where: { nit: '900123456-7' } });
    if (existingCustomer) {
      await prisma.customer.update({
        where: { id: existingCustomer.id },
        data: {
          nombre: 'Juan Pérez',
          ciudad: 'Bogotá',
          telefono: '3001234567',
          asesorId: adminUser.id,
          cupoTotal: 1000000,
          cupoUsado: 0,
          deudaVencida: 0,
          isTrustedCustomer: true,
          estado: 'ACTIVO',
        },
      });
    } else {
      await prisma.customer.create({
        data: {
          nombre: 'Juan Pérez',
          ciudad: 'Bogotá',
          telefono: '3001234567',
          nit: '900123456-7',
          asesorId: adminUser.id,
          cupoTotal: 1000000,
          cupoUsado: 0,
          deudaVencida: 0,
          isTrustedCustomer: true,
          estado: 'ACTIVO',
        },
      });
    }
    console.log('✓ Cliente demo asegurado (Juan Pérez)');

    const asesorEmail = 'asesor@surtitelas.com';
    const existingAsesor = await prisma.user.findUnique({ where: { email: asesorEmail } });
    if (!existingAsesor) {
      await prisma.user.create({
        data: {
          email: asesorEmail,
          nombre: 'Asesor Demo',
          passwordHash: await bcrypt.hash(asesorPassword, 12),
          role: Role.ASESOR,
        },
      });
      console.log(`✓ Asesor demo asegurado (${asesorEmail} / ${asesorPassword})`);
    }
  }

  const demoProduct = await prisma.product.findUnique({ where: { ref: 'REF-001' } });
  const demoCustomer = await prisma.customer.findFirst({ where: { nit: '900123456-7' } });
  const demoAsesor = await prisma.user.findFirst({ where: { role: Role.ASESOR } });

  if (demoProduct && demoCustomer && demoAsesor) {
    const orderNumber = 'PED-000001';
    const existingOrder = await prisma.order.findFirst({ where: { numero: orderNumber } });
    if (!existingOrder) {
      const _order = await prisma.order.create({
        data: {
          numero: orderNumber,
          clienteId: demoCustomer.id,
          clienteNombre: demoCustomer.nombre,
          asesorId: demoAsesor.id,
          asesorNombre: demoAsesor.nombre,
          total: 50000,
          itemsCount: 2,
          estado: 'EN_PRODUCCION',
          prioridad: 'PRIORITARIO',
          observaciones: 'Pedido demo para validar contratos',
          items: {
            create: [
              { productId: demoProduct.id, nombre: demoProduct.nombre, precio: 25000, cantidad: 2 },
            ],
          },
        },
      });
      console.log('✓ Order demo asegurada (PED-000001)');
    }
  }

  const demoOrder = await prisma.order.findFirst({ where: { numero: 'PED-000001' } });

  if (demoOrder && demoAsesor) {
    const domiciliarioEmail = 'domiciliario@surtitelas.com';
    let domiciliario = await prisma.user.findUnique({ where: { email: domiciliarioEmail } });
    if (!domiciliario) {
      domiciliario = await prisma.user.create({
        data: {
          email: domiciliarioEmail,
          nombre: 'Domiciliario Demo',
          passwordHash: await bcrypt.hash(domiciliarioPassword, 12),
          role: Role.DOMICILIARIO,
        },
      });
      console.log(`✓ Domiciliario demo asegurado (${domiciliarioEmail} / ${domiciliarioPassword})`);
    }

    // Tablas deliveries/returns no existen en la BD actual; se habilitan cuando se agreguen las migraciones correspondientes.
    console.log('✓ Seed demo entregas/devoluciones omitidas (tablas no migradas)');
  }

  console.log('🎉 Seed completado');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

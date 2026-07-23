# IMPLEMENTATION CHECKLIST

- [ ] Revisar m?dulos no montados y confirmar si est?n alineados con el contrato.
- [ ] Consolidar la autenticaci?n en un ?nico flujo y un helper de JWT/Bcrypt.
- [ ] Unificar el mapper y validaciones de productos.
- [ ] Optimizar consultas Prisma con `select`/`index` y reducir `include` innecesarios.
- [ ] Reducir dependencias de desarrollo no usadas.
- [ ] Validar compilaci?n con `npm run build` y ejecutar smoke tests del backend.
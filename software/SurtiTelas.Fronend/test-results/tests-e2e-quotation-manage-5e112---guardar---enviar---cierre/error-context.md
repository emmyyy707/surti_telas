# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: tests\e2e\quotation-management.spec.ts >> Gestion de Cotizaciones - Flujo E2E >> flujo: lista -> detalle -> gestionar cotizacion -> guardar -> enviar -> cierre
- Location: tests\e2e\quotation-management.spec.ts:72:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('.overlay').first()
Expected: visible
Timeout: 10000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 10000ms
  - waiting for locator('.overlay').first()

```

```yaml
- complementary:
  - img "SURTI CAMISETAS"
  - text: SURTI CAMISETAS Admin Panel
  - button "Colapsar menú"
  - navigation "Navegación principal":
    - link "Dashboard General":
      - /url: /admin/dashboard
    - button "Configuración"
    - link "Gestión de Roles y Permisos":
      - /url: /admin/gestion-roles-permisos
    - button "Usuarios"
    - link "Gestión de Usuarios":
      - /url: /admin/gestion-usuarios
    - link "Gestión de Acceso":
      - /url: /admin/gestion-acceso
    - link "Gestión de Empleados":
      - /url: /admin/empleados
    - button "Gestión de Compras"
    - link "Gestión de Compras":
      - /url: /admin/compras
    - link "Gestión de Insumos":
      - /url: /admin/insumos
    - link "Categorías de Insumos":
      - /url: /admin/categorias-insumos
    - link "Gestión de Proveedores":
      - /url: /admin/proveedores
    - button "Ventas"
    - link "Gestión de Pedidos":
      - /url: /admin/pedidos
    - link "Gestión de Cotizaciones":
      - /url: /admin/pedidos-personalizados
    - link "Gestión de Ventas":
      - /url: /admin/gestion-ventas
    - link "Gestión de Recibos":
      - /url: /admin/facturacion
    - link "Gestión de Pagos":
      - /url: /admin/pagos
    - link "Gestión de Clientes":
      - /url: /admin/clientes
    - link "Gestión de Domicilios":
      - /url: /admin/domicilios
    - link "Gestión de Ruta del Día":
      - /url: /admin/ruta-del-dia
    - button "Producción"
    - link "Gestión de Productos":
      - /url: /admin/catalogo
    - link "Gestión de Talleres":
      - /url: /admin/talleres
    - link "Gestión de Control de Prendas":
      - /url: /admin/prendas
    - link "Gestión de Producción":
      - /url: /admin/asignacion
    - link "Gestión de Seguimiento de Producción":
      - /url: /admin/seguimiento
    - link "Gestión de Categorías Productos":
      - /url: /admin/categorias
    - button "Dashboard de Reportes (Analítica)"
    - link "Reportes de Ventas":
      - /url: /admin/reportes/ventas
    - link "Finanzas":
      - /url: /admin/reportes/finanzas
    - link "Reportes de Usuarios":
      - /url: /admin/reportes/usuarios
    - link "Reportes de Producción":
      - /url: /admin/reportes/produccion
    - link "Reportes de Inventario":
      - /url: /admin/reportes/inventario
    - link "Alertas de Stock":
      - /url: /admin/alertas-stock
  - button "Ir al Inicio"
  - button "Cerrar sesión"
- main
- banner:
  - textbox "Buscar..."
  - button "Notificaciones"
  - text: "80"
  - button "Cambiar tema"
  - button "Exportar"
  - text: A Administrador SurtiTelas admin@surtitelas.com
- main:
  - heading "Cotizaciones" [level=1]
  - paragraph: Gestiona solicitudes, cotizaciones y conversión a pedidos
  - button "Nuevo pedido"
  - text: 1 Total 0 Pendientes 0 Cotizados 0 En producción
  - textbox "Buscar por solicitud o cliente...": SOL-0097
  - button "Actualizar"
  - text: Registros 1 registros
  - button "Filtros"
  - button "Exportar":
    - button "Exportar"
  - table:
    - rowgroup:
      - row "Solicitud Cliente Fecha Productos Entrega Estado Cotización Acción Acciones":
        - columnheader "Solicitud":
          - button "Solicitud"
        - columnheader "Cliente":
          - button "Cliente"
        - columnheader "Fecha":
          - button "Fecha"
        - columnheader "Productos":
          - button "Productos"
        - columnheader "Entrega":
          - button "Entrega"
        - columnheader "Estado":
          - button "Estado"
        - columnheader "Cotización":
          - button "Cotización"
        - columnheader "Acción":
          - button "Acción"
        - columnheader "Acciones"
    - rowgroup:
      - row "SOL-0097 Andrés Daniel 24/08/2026 1 producto 31/08/2026 ACEPTADO Rechazada Negoc. 1/3 Ver detalle Editar cotización Abrir menú de acciones":
        - cell "SOL-0097"
        - cell "Andrés Daniel"
        - cell "24/08/2026"
        - cell "1 producto"
        - cell "31/08/2026"
        - cell "ACEPTADO"
        - cell "Rechazada Negoc. 1/3"
        - cell "Ver detalle Editar cotización":
          - button "Ver detalle"
          - button "Editar cotización"
        - cell "Abrir menú de acciones":
          - button "Abrir menú de acciones":
            - button "Abrir menú de acciones"
  - text: Mostrando 1-1 de 1 10 por página
  - button [disabled]
  - button [disabled]
  - button "1"
  - button [disabled]
  - button [disabled]
- region "Notifications alt+T"
- dialog "Solicitud SOL-0097":
  - banner:
    - heading "Solicitud SOL-0097" [level=2]
    - button "Cerrar"
  - heading "Cliente" [level=3]
  - text: Nombre Andrés Daniel Email danielmurilloruiz53@gmail.com Teléfono 3015693683 Estado ACEPTADO
  - heading "Descripción general" [level=3]
  - text: Camiseta básica de algodón
  - heading "Productos" [level=3]
  - text: "Producto #1: Camiseta básica de algodón Cantidad 30 Material Algodon (+250 g/m²) Distribución de prendas M 10 S 20 Total 30 Personalizaciones ESTAMPADO Técnica: DTF Punto corazón asd asd as das dsa dsa d"
  - img "Referencia 1"
  - img "Referencia 2"
  - text: S / Beige 20 M / Gris 10 30 unidades Cotización Estado RECHAZADA Motivo del rechazo asdsadas safafa safa fas afa Negociaciones 1/3 Vigencia 31/8/2026 Condiciones 50% anticipo, 50% contra entrega Conceptos Concepto Cant. P. unitario Subtotal Camiseta básica de algodón 30 $ 1.000 $ 30.000 BORDADO ESTAMPADO 30 $ 10.000 $ 300.000 Subtotal $ 330.000 Impuestos $ 62.700 Total $ 392.700 Historial de negociaciones Negociación 1 - Invalid Date
  - button "Cerrar"
  - button "Negociar"
  - button "Editar cotización"
  - heading "Entrega" [level=3]
  - text: Fecha solicitada 31/8/2026 Uso OTRO Dirección de entrega Carrera 103 70D 108 Robledo santa maria Observaciones asdas asd as dsad sad asd as das dsa das dsa as
```

# Test source

```ts
  1   | import { test, expect, Locator, Page } from '@playwright/test';
  2   | 
  3   | const BASE_URL = 'http://localhost:5173';
  4   | 
  5   | async function loginAsAdmin(page: Page) {
  6   |   await page.goto(`${BASE_URL}/login`);
  7   |   await page.fill('input[type="email"]', 'admin@surtitelas.com');
  8   |   await page.fill('input[type="password"]', 'SurtiTelas2025*');
  9   |   await Promise.all([
  10  |     page.waitForResponse((resp) => resp.url().includes('/auth/login') && resp.status() === 200),
  11  |     page.click('button[type="submit"]'),
  12  |   ]);
  13  |   await page.waitForTimeout(3000);
  14  | }
  15  | 
  16  | async function findOrderForCotization(page: Page): Promise<string | null> {
  17  |   const searchInput = page.locator('input[placeholder="Buscar por solicitud o cliente..."]');
  18  |   if (await searchInput.count() > 0) {
  19  |     await searchInput.fill('SOL-');
  20  |     await page.waitForTimeout(1000);
  21  |   }
  22  | 
  23  |   const rows = await page.locator('tbody tr').all();
  24  |   for (const row of rows) {
  25  |     const text = await row.textContent();
  26  |     if (text && /SOL-\d+/.test(text)) {
  27  |       const match = text.match(/(SOL-\d+)/);
  28  |       if (match) {
  29  |         const estadoText = text.toLowerCase();
  30  |         const hasEnviada = /enviada/i.test(text);
  31  |         if (!hasEnviada) {
  32  |           return match[1];
  33  |         }
  34  |       }
  35  |     }
  36  |   }
  37  |   return null;
  38  | }
  39  | 
  40  | async function openDetailModal(page: Page, numeroSolicitud: string): Promise<void> {
  41  |   const searchInput = page.locator('input[placeholder="Buscar por solicitud o cliente..."]');
  42  |   if (await searchInput.count() > 0) {
  43  |     await searchInput.fill(numeroSolicitud);
  44  |     await page.waitForTimeout(800);
  45  |   }
  46  | 
  47  |   const targetRow = page.locator(`tbody tr`, { hasText: numeroSolicitud });
  48  |   const rowCount = await targetRow.count();
  49  |   if (rowCount === 0) {
  50  |     throw new Error(`No se encontro la solicitud ${numeroSolicitud}`);
  51  |   }
  52  | 
  53  |   const row = targetRow.first();
  54  |   const detalleBtn = row.locator('button:has-text("Ver detalle")').first();
  55  |   await expect(detalleBtn).toBeVisible({ timeout: 5000 });
  56  |   await detalleBtn.click();
  57  |   await page.waitForTimeout(1000);
  58  | 
  59  |   const modal = page.locator('.overlay').first();
> 60  |   await expect(modal).toBeVisible({ timeout: 10000 });
      |                       ^ Error: expect(locator).toBeVisible() failed
  61  | }
  62  | 
  63  | test.describe('Gestion de Cotizaciones - Flujo E2E', () => {
  64  |   test.beforeEach(async ({ page }) => {
  65  |     test.setTimeout(120000);
  66  |     await loginAsAdmin(page);
  67  |     await page.goto(`${BASE_URL}/admin/pedidos-personalizados`);
  68  |     await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
  69  |     await page.waitForTimeout(4000);
  70  |   });
  71  | 
  72  |   test('flujo: lista -> detalle -> gestionar cotizacion -> guardar -> enviar -> cierre', async ({ page }) => {
  73  |     let targetNumero = await findOrderForCotization(page);
  74  | 
  75  |     if (!targetNumero) {
  76  |       const rows = await page.locator('tbody tr').all();
  77  |       for (const row of rows) {
  78  |         const text = await row.textContent();
  79  |         if (text && /SOL-\d+/.test(text)) {
  80  |           const match = text.match(/(SOL-\d+)/);
  81  |           if (match) targetNumero = match[1];
  82  |           break;
  83  |         }
  84  |       }
  85  |       if (!targetNumero) {
  86  |         test.skip(true, 'No se encontraron pedidos para probar');
  87  |         return;
  88  |       }
  89  |     }
  90  | 
  91  |     console.log('Usando solicitud:', targetNumero);
  92  | 
  93  |     await openDetailModal(page, targetNumero);
  94  | 
  95  |     const gestionarBtn = page.locator('button:has-text("Gestionar cotizacion"), button:has-text("Editar cotizacion")').first();
  96  |     try {
  97  |       await expect(gestionarBtn).toBeVisible({ timeout: 10000 });
  98  |     } catch {
  99  |       console.log('No se encontro boton de gestionar/editar cotizacion');
  100 |       test.skip(true, 'No hay orden con cotizacion gestionable');
  101 |       return;
  102 |     }
  103 |     await gestionarBtn.click();
  104 |     await page.waitForTimeout(1000);
  105 | 
  106 |     const editor = page.locator('.quotationEditor').first();
  107 |     await expect(editor).toBeVisible({ timeout: 10000 });
  108 | 
  109 |     const conceptRows = page.locator('.productConceptRow').first();
  110 |     const firstDescripcion = conceptRows.locator('input').first();
  111 |     if (await firstDescripcion.count() > 0) {
  112 |       await firstDescripcion.fill('Prenda de algodon');
  113 |     }
  114 | 
  115 |     const inputs = await conceptRows.locator('input[type="number"]').all();
  116 |     if (inputs.length >= 2) {
  117 |       await inputs[0].fill('20');
  118 |       await inputs[1].fill('50000');
  119 |     }
  120 | 
  121 |     const guardarBtn = page.locator('button:has-text("Guardar cotizacion")').first();
  122 |     await expect(guardarBtn).toBeVisible({ timeout: 5000 });
  123 |     await guardarBtn.click();
  124 |     await page.waitForTimeout(2000);
  125 | 
  126 |     const toastSuccess = page.locator('.sonner-toast').filter({ hasText: /guardada|borrador/i });
  127 |     const toastCount = await toastSuccess.count();
  128 |     expect(toastCount).toBeGreaterThan(0);
  129 | 
  130 |     const editorAfterSave = page.locator('.quotationEditor').first();
  131 |     await expect(editorAfterSave).toBeVisible({ timeout: 5000 });
  132 | 
  133 |     const enviarBtn = page.locator('button:has-text("Enviar cotizacion")').first();
  134 |     await expect(enviarBtn).toBeVisible({ timeout: 5000 });
  135 |     await enviarBtn.click();
  136 |     await page.waitForTimeout(3000);
  137 | 
  138 |     const toastEnviada = page.locator('.sonner-toast').filter({ hasText: /enviada|enviado/i });
  139 |     const enviadaCount = await toastEnviada.count();
  140 |     expect(enviadaCount).toBeGreaterThan(0);
  141 | 
  142 |     await page.waitForTimeout(1000);
  143 | 
  144 |     const modalAfterSend = page.locator('.overlay');
  145 |     const modalCount = await modalAfterSend.count();
  146 |     if (modalCount > 0) {
  147 |       console.log('Modal still open after send:', await modalAfterSend.first().isVisible());
  148 |     }
  149 | 
  150 |     console.log('EVIDENCIA: Flujo guardar/enviar completado');
  151 |   });
  152 | 
  153 |   test('verifica que no haya modal stacking', async ({ page }) => {
  154 |     let targetNumero = await findOrderForCotization(page);
  155 | 
  156 |     if (!targetNumero) {
  157 |       test.skip(true, 'No se encontraron pedidos para probar');
  158 |       return;
  159 |     }
  160 | 
```
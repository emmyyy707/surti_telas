# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: quotation-management.spec.ts >> Gestion de Cotizaciones - Flujo E2E >> flujo: lista -> detalle -> gestionar cotizacion -> guardar -> enviar -> cierre
- Location: tests\e2e\quotation-management.spec.ts:71:3

# Error details

```
Error: No se encontro la solicitud SOL-01321
```

# Page snapshot

```yaml
- generic [ref=f1e2]:
  - generic [ref=f1e3]:
    - complementary [ref=f1e4]:
      - generic [ref=f1e5]:
        - generic [ref=f1e6]:
          - img "SURTI CAMISETAS" [ref=f1e7]
          - generic [ref=f1e8]:
            - generic [ref=f1e9]: SURTI CAMISETAS
            - generic [ref=f1e10]: Admin Panel
        - button "Colapsar menú" [ref=f1e11] [cursor=pointer]
      - navigation "Navegación principal" [ref=f1e14]:
        - link "Dashboard General" [ref=f1e16] [cursor=pointer]:
          - /url: /admin/dashboard
        - generic [ref=f1e23]:
          - button "Configuración" [ref=f1e24] [cursor=pointer]
          - link "Gestión de Roles y Permisos" [ref=f1e31] [cursor=pointer]:
            - /url: /admin/gestion-roles-permisos
        - generic [ref=f1e35]:
          - button "Usuarios" [ref=f1e36] [cursor=pointer]
          - generic:
            - generic:
              - link "Gestión de Usuarios" [ref=f1e45] [cursor=pointer]:
                - /url: /admin/gestion-usuarios
              - link "Gestión de Accesos" [ref=f1e52] [cursor=pointer]:
                - /url: /admin/gestion-acceso
              - link "Gestión de Empleados" [ref=f1e57] [cursor=pointer]:
                - /url: /admin/empleados
        - generic [ref=f1e71]:
          - button "Compras" [ref=f1e72] [cursor=pointer]
          - generic:
            - generic:
              - link "Gestión de Compras" [ref=f1e79] [cursor=pointer]:
                - /url: /admin/compras
              - link "Gestión de Insumos" [ref=f1e84] [cursor=pointer]:
                - /url: /admin/insumos
              - link "Gestión de Categorías Insumos" [ref=f1e96] [cursor=pointer]:
                - /url: /admin/categorias-insumos
              - link "Gestión de Proveedores" [ref=f1e102] [cursor=pointer]:
                - /url: /admin/proveedores
        - generic [ref=f1e108]:
          - button "Ventas" [ref=f1e109] [cursor=pointer]
          - generic:
            - generic:
              - link "Gestión de Ventas" [ref=f1e117] [cursor=pointer]:
                - /url: /admin/gestion-ventas
              - link "Gestión de Pagos" [ref=f1e122] [cursor=pointer]:
                - /url: /admin/pagos
              - link "Gestión de Devoluciones" [ref=f1e126] [cursor=pointer]:
                - /url: /admin/StockDevuelto
              - link "Gestión de Domicilios" [ref=f1e131] [cursor=pointer]:
                - /url: /admin/domicilios
              - link "Gestión de Domiciliarios" [ref=f1e136] [cursor=pointer]:
                - /url: /admin/ruta-del-dia
              - link "Gestión de Pedidos" [ref=f1e141] [cursor=pointer]:
                - /url: /admin/pedidos
              - link "Gestión de Clientes" [ref=f1e147] [cursor=pointer]:
                - /url: /admin/clientes
              - link "Gestión de Cotizaciones" [ref=f1e154] [cursor=pointer]:
                - /url: /admin/pedidos-personalizados
              - link "Gestión de Recibos" [ref=f1e159] [cursor=pointer]:
                - /url: /admin/facturacion
        - generic [ref=f1e164]:
          - button "Producción" [ref=f1e165] [cursor=pointer]
          - generic:
            - generic:
              - link "Gestión de Producción" [ref=f1e171] [cursor=pointer]:
                - /url: /admin/produccion
              - link "Gestión de Talleres" [ref=f1e175] [cursor=pointer]:
                - /url: /admin/talleres
              - link "Gestión de Productos" [ref=f1e180] [cursor=pointer]:
                - /url: /admin/productos
              - link "Gestión de Categorías Productos" [ref=f1e186] [cursor=pointer]:
                - /url: /admin/categorias
              - link "Gestión de Seguimiento de Producción" [ref=f1e193] [cursor=pointer]:
                - /url: /admin/seguimiento
        - generic [ref=f1e198]:
          - button "Reportes" [ref=f1e199] [cursor=pointer]
          - generic:
            - generic:
              - link "Gestión de Reportes de Usuarios" [ref=f1e205] [cursor=pointer]:
                - /url: /admin/reportes/usuarios
              - link "Gestión de Reportes de Producción" [ref=f1e211] [cursor=pointer]:
                - /url: /admin/reportes/produccion
              - link "Gestión de Alertas de Stock" [ref=f1e215] [cursor=pointer]:
                - /url: /admin/alertas-stock
              - link "Gestión de Reportes de Inventario" [ref=f1e219] [cursor=pointer]:
                - /url: /admin/reportes/inventario
              - link "Gestión de Reportes de Ventas" [ref=f1e225] [cursor=pointer]:
                - /url: /admin/reportes/ventas
      - generic [ref=f1e229]:
        - button "Ir al Inicio" [ref=f1e230] [cursor=pointer]
        - button "Cerrar sesión" [ref=f1e235] [cursor=pointer]
    - main
    - generic [ref=f1e240]:
      - banner [ref=f1e241]:
        - textbox "Buscar..." [ref=f1e244]
        - generic [ref=f1e245]:
          - button "Notificaciones" [ref=f1e248] [cursor=pointer]
          - button "Cambiar tema" [ref=f1e253] [cursor=pointer]
          - button "Exportar" [ref=f1e261] [cursor=pointer]
          - generic [ref=f1e266] [cursor=pointer]:
            - generic [ref=f1e267]: A
            - generic [ref=f1e268]:
              - generic [ref=f1e269]: Administrador SurtiTelas
              - generic [ref=f1e270]: admin@surtitelas.com
      - main [ref=f1e271]:
        - generic [ref=f1e272]:
          - generic [ref=f1e273]:
            - generic [ref=f1e274]:
              - heading "Cotizaciones" [level=1] [ref=f1e275]
              - paragraph [ref=f1e276]: Gestiona solicitudes, cotizaciones y conversián a pedidos
            - button "Nuevo pedido" [ref=f1e277] [cursor=pointer]
          - generic [ref=f1e282]:
            - generic [ref=f1e288]:
              - generic [ref=f1e289]: "0"
              - generic [ref=f1e290]: Total
            - generic [ref=f1e296]:
              - generic [ref=f1e297]: "0"
              - generic [ref=f1e298]: Pendientes
            - generic [ref=f1e304]:
              - generic [ref=f1e305]: "0"
              - generic [ref=f1e306]: Cotizados
            - generic [ref=f1e314]:
              - generic [ref=f1e315]: "0"
              - generic [ref=f1e316]: En producción
          - generic [ref=f1e317]:
            - generic [ref=f1e318]:
              - textbox "Buscar por solicitud o cliente..." [active] [ref=f1e320]: SOL-01321
              - button "Actualizar" [ref=f1e321] [cursor=pointer]
            - generic [ref=f1e330]:
              - generic [ref=f1e331]:
                - generic [ref=f1e333]:
                  - generic [ref=f1e334]: Registros
                  - generic [ref=f1e335]: 0 registros
                - generic [ref=f1e336]:
                  - button "Filtros" [ref=f1e337] [cursor=pointer]
                  - button [ref=f1e344] [cursor=pointer]:
                    - button "Exportar" [ref=f1e345]
              - table [ref=f1e356]:
                - rowgroup [ref=f1e357]:
                  - row [ref=f1e358]:
                    - columnheader [ref=f1e359]:
                      - button "Solicitud" [ref=f1e360] [cursor=pointer]
                    - columnheader [ref=f1e365]:
                      - button "Productos" [ref=f1e366] [cursor=pointer]
                    - columnheader [ref=f1e371]:
                      - button "Cantidad" [ref=f1e372] [cursor=pointer]
                    - columnheader [ref=f1e377]:
                      - button "Estado" [ref=f1e378] [cursor=pointer]
                    - columnheader [ref=f1e383]:
                      - button "Cotización" [ref=f1e384] [cursor=pointer]
                    - columnheader [ref=f1e389]:
                      - button "Total" [ref=f1e390] [cursor=pointer]
                    - columnheader [ref=f1e395]:
                      - button "Fecha" [ref=f1e396] [cursor=pointer]
                    - columnheader [ref=f1e401]:
                      - button "Ver detalle" [ref=f1e402] [cursor=pointer]
                - rowgroup [ref=f1e407]:
                  - row [ref=f1e408]:
                    - cell [ref=f1e409]:
                      - paragraph [ref=f1e415]: No hay pedidos personalizados
              - generic [ref=f1e416]:
                - generic [ref=f1e417]:
                  - generic [ref=f1e418]: Mostrando 0-0
                  - generic [ref=f1e419]: de
                  - generic [ref=f1e420]: "0"
                  - generic [ref=f1e421]: 10 por página
                - generic [ref=f1e422]:
                  - button [disabled]
                  - button [disabled]
                  - button "1" [ref=f1e423] [cursor=pointer]
                  - button [disabled]
                  - button [disabled]
  - region "Notifications alt+T"
```

# Test source

```ts
  1   | ﻿import { test, expect, Locator, Page } from '@playwright/test';
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
  29  |         const hasEnviada = /enviada/i.test(text);
  30  |         if (!hasEnviada) {
  31  |           return match[1];
  32  |         }
  33  |       }
  34  |     }
  35  |   }
  36  |   return null;
  37  | }
  38  | 
  39  | async function openDetailModal(page: Page, numeroSolicitud: string): Promise<void> {
  40  |   const searchInput = page.locator('input[placeholder="Buscar por solicitud o cliente..."]');
  41  |   if (await searchInput.count() > 0) {
  42  |     await searchInput.fill(numeroSolicitud);
  43  |     await page.waitForTimeout(800);
  44  |   }
  45  | 
  46  |   const targetRow = page.locator(`tbody tr`, { hasText: numeroSolicitud });
  47  |   const rowCount = await targetRow.count();
  48  |   if (rowCount === 0) {
> 49  |     throw new Error(`No se encontro la solicitud ${numeroSolicitud}`);
      |           ^ Error: No se encontro la solicitud SOL-01321
  50  |   }
  51  | 
  52  |   const row = targetRow.first();
  53  |   const detalleBtn = row.locator('button:has-text("Ver detalle")').first();
  54  |   await expect(detalleBtn).toBeVisible({ timeout: 5000 });
  55  |   await detalleBtn.click();
  56  |   await page.waitForTimeout(1000);
  57  | 
  58  |   const modal = page.locator('[role="dialog"]').first();
  59  |   await expect(modal).toBeVisible({ timeout: 10000 });
  60  | }
  61  | 
  62  | test.describe('Gestion de Cotizaciones - Flujo E2E', () => {
  63  |   test.beforeEach(async ({ page }) => {
  64  |     test.setTimeout(120000);
  65  |     await loginAsAdmin(page);
  66  |     await page.goto(`${BASE_URL}/admin/pedidos-personalizados`);
  67  |     await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
  68  |     await page.waitForTimeout(4000);
  69  |   });
  70  | 
  71  |   test('flujo: lista -> detalle -> gestionar cotizacion -> guardar -> enviar -> cierre', async ({ page }) => {
  72  |     let targetNumero = await findOrderForCotization(page);
  73  | 
  74  |     if (!targetNumero) {
  75  |       const rows = await page.locator('tbody tr').all();
  76  |       for (const row of rows) {
  77  |         const text = await row.textContent();
  78  |         if (text && /SOL-\d+/.test(text)) {
  79  |           const match = text.match(/(SOL-\d+)/);
  80  |           if (match) targetNumero = match[1];
  81  |           break;
  82  |         }
  83  |       }
  84  |       if (!targetNumero) {
  85  |         test.skip(true, 'No se encontraron pedidos para probar');
  86  |         return;
  87  |       }
  88  |     }
  89  | 
  90  |     console.log('Usando solicitud:', targetNumero);
  91  | 
  92  |     await openDetailModal(page, targetNumero);
  93  | 
  94  |     const gestionarBtn = page.locator('button:has-text("Gestionar cotizacion"), button:has-text("Editar cotizacion")').first();
  95  |     try {
  96  |       await expect(gestionarBtn).toBeVisible({ timeout: 10000 });
  97  |     } catch {
  98  |       console.log('No se encontro boton de gestionar/editar cotizacion');
  99  |       test.skip(true, 'No hay orden con cotizacion gestionable');
  100 |       return;
  101 |     }
  102 |     await gestionarBtn.click();
  103 |     await page.waitForTimeout(1000);
  104 | 
  105 |     const editor = page.locator('[data-testid="quotation-editor"]').first();
  106 |     await expect(editor).toBeVisible({ timeout: 10000 });
  107 | 
  108 |     const conceptRows = page.locator('[data-testid="concept-row"]').first();
  109 |     const firstDescripcion = conceptRows.locator('input').first();
  110 |     if (await firstDescripcion.count() > 0) {
  111 |       const currentVal = await firstDescripcion.inputValue();
  112 |       if (currentVal !== 'Prenda de algodon') {
  113 |         await firstDescripcion.fill('Prenda de algodon');
  114 |       }
  115 |     }
  116 | 
  117 |     const inputs = await conceptRows.locator('input[type="number"]').all();
  118 |     if (inputs.length >= 2) {
  119 |       await inputs[0].fill('20');
  120 |       await inputs[1].fill('50000');
  121 |     }
  122 | 
  123 |     const guardarBtn = page.locator('button:has-text("Guardar cotizacion")').first();
  124 |     await expect(guardarBtn).toBeVisible({ timeout: 5000 });
  125 |     await guardarBtn.click();
  126 |     await page.waitForTimeout(2000);
  127 | 
  128 |     const toastSuccess = page.locator('.sonner-toast').filter({ hasText: /guardada|borrador/i });
  129 |     const toastCount = await toastSuccess.count();
  130 |     expect(toastCount).toBeGreaterThan(0);
  131 | 
  132 |     const editorAfterSave = page.locator('[data-testid="quotation-editor"]').first();
  133 |     await expect(editorAfterSave).toBeVisible({ timeout: 5000 });
  134 | 
  135 |     const enviarBtn = page.locator('button:has-text("Enviar cotizacion")').first();
  136 |     await expect(enviarBtn).toBeVisible({ timeout: 5000 });
  137 |     await enviarBtn.click();
  138 |     await page.waitForTimeout(3000);
  139 | 
  140 |     const toastEnviada = page.locator('.sonner-toast').filter({ hasText: /enviada|enviado/i });
  141 |     const enviadaCount = await toastEnviada.count();
  142 |     expect(enviadaCount).toBeGreaterThan(0);
  143 | 
  144 |     await page.waitForTimeout(1000);
  145 | 
  146 |     const modalAfterSend = page.locator('[role="dialog"]');
  147 |     const modalCount = await modalAfterSend.count();
  148 |     if (modalCount > 0) {
  149 |       console.log('Modal still open after send:', await modalAfterSend.first().isVisible());
```
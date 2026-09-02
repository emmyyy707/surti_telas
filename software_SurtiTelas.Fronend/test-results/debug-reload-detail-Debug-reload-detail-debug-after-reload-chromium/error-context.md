# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: debug-reload-detail.spec.ts >> Debug reload detail >> debug after reload
- Location: tests\e2e\debug-reload-detail.spec.ts:15:3

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: page.fill: Test timeout of 30000ms exceeded.
Call log:
  - waiting for locator('input[placeholder="Tel�fono"]')

```

# Page snapshot

```yaml
- generic [ref=f1e1]:
  - generic [ref=f1e2]:
    - generic [ref=f1e3]:
      - complementary [ref=f1e4]:
        - generic [ref=f1e5]:
          - generic [ref=f1e6]:
            - img "SURTI CAMISETAS" [ref=f1e7]
            - generic [ref=f1e8]:
              - generic [ref=f1e9]: SURTI CAMISETAS
              - generic [ref=f1e10]: Portal Cliente
          - button "Colapsar menú" [ref=f1e11] [cursor=pointer]
        - navigation "Navegación principal" [ref=f1e14]:
          - link "Inicio" [ref=f1e16] [cursor=pointer]:
            - /url: /cliente/inicio
          - link "Mis Pedidos" [ref=f1e24] [cursor=pointer]:
            - /url: /cliente/pedidos
          - link "Mis Cotizaciones" [ref=f1e30] [cursor=pointer]:
            - /url: /cliente/pedidos-personalizados
          - link "Mis Recibos" [ref=f1e36] [cursor=pointer]:
            - /url: /cliente/recibos
          - link "Mis Favoritos" [ref=f1e41] [cursor=pointer]:
            - /url: /cliente/favoritos
          - link "Seguimiento" [ref=f1e46] [cursor=pointer]:
            - /url: /cliente/seguimiento
          - link "Reportar Devolución" [ref=f1e53] [cursor=pointer]:
            - /url: /cliente/reportar-devolucion
          - link "Mi Perfil" [ref=f1e59] [cursor=pointer]:
            - /url: /cliente/perfil
        - generic [ref=f1e65]:
          - button "Ir al Inicio" [ref=f1e66] [cursor=pointer]
          - button "Cerrar sesión" [ref=f1e71] [cursor=pointer]
      - main
      - generic [ref=f1e76]:
        - banner [ref=f1e77]:
          - textbox "Buscar..." [ref=f1e80]
          - generic [ref=f1e81]:
            - button "Notificaciones" [ref=f1e84] [cursor=pointer]
            - button "Cambiar tema" [ref=f1e89] [cursor=pointer]
            - generic [ref=f1e96] [cursor=pointer]:
              - generic [ref=f1e97]: A
              - generic [ref=f1e98]:
                - generic [ref=f1e99]: Andres
                - generic [ref=f1e100]: andres.test@example.com
        - main [ref=f1e101]:
          - generic [ref=f1e102]:
            - generic [ref=f1e103]:
              - generic [ref=f1e104]:
                - heading "Mis Cotizaciones" [level=1] [ref=f1e105]
                - paragraph [ref=f1e106]: Gestiona tus solicitudes, cotizaciones y envíos
              - button "Nueva solicitud" [ref=f1e107] [cursor=pointer]
            - generic [ref=f1e112]:
              - generic [ref=f1e118]:
                - generic [ref=f1e119]: "10"
                - generic [ref=f1e120]: Total
              - generic [ref=f1e126]:
                - generic [ref=f1e127]: "8"
                - generic [ref=f1e128]: Pendientes
              - generic [ref=f1e134]:
                - generic [ref=f1e135]: "2"
                - generic [ref=f1e136]: Cotizados
              - generic [ref=f1e144]:
                - generic [ref=f1e145]: "0"
                - generic [ref=f1e146]: En producción
            - generic [ref=f1e147]:
              - generic [ref=f1e148]:
                - textbox "Buscar por número de solicitud..." [ref=f1e151]
                - button "Actualizar" [ref=f1e152] [cursor=pointer]
              - generic [ref=f1e160]:
                - generic [ref=f1e161]:
                  - generic [ref=f1e163]:
                    - generic [ref=f1e164]: Registros
                    - generic [ref=f1e165]: 10 registros
                  - generic [ref=f1e166]:
                    - button "Filtros" [ref=f1e167] [cursor=pointer]
                    - button [ref=f1e174] [cursor=pointer]:
                      - button "Exportar" [ref=f1e175]
                - table [ref=f1e186]:
                  - rowgroup [ref=f1e187]:
                    - row [ref=f1e188]:
                      - columnheader [ref=f1e189]:
                        - button "Solicitud" [ref=f1e190] [cursor=pointer]
                      - columnheader [ref=f1e195]:
                        - button "Cliente" [ref=f1e196] [cursor=pointer]
                      - columnheader [ref=f1e201]:
                        - button "Correo electrónico" [ref=f1e202] [cursor=pointer]
                      - columnheader [ref=f1e207]:
                        - button "Teléfono" [ref=f1e208] [cursor=pointer]
                      - columnheader [ref=f1e213]:
                        - button "Estado" [ref=f1e214] [cursor=pointer]
                      - columnheader [ref=f1e219]:
                        - button "Actualizado" [ref=f1e220] [cursor=pointer]
                      - columnheader "Acciones" [ref=f1e225]
                  - rowgroup [ref=f1e226]:
                    - row [ref=f1e227] [cursor=pointer]:
                      - cell "SOL-0065" [ref=f1e228]
                      - cell "Andres Daniel Ruiz Murillo" [ref=f1e229]
                      - cell "andres.test@example.com" [ref=f1e232]
                      - cell "3015693683" [ref=f1e234]
                      - cell "Cotizado" [ref=f1e235]
                      - cell "19/8/2026" [ref=f1e237]
                      - cell [ref=f1e238]:
                        - button "Abrir menú de acciones" [ref=f1e240]:
                          - button "Abrir menú de acciones" [ref=f1e241]
                    - row [ref=f1e246] [cursor=pointer]:
                      - cell "SOL-0064" [ref=f1e247]
                      - cell "Andres Daniel Ruiz Murillo" [ref=f1e248]
                      - cell "andres.test@example.com" [ref=f1e251]
                      - cell "3015693683" [ref=f1e253]
                      - cell "Cotizado" [ref=f1e254]
                      - cell "19/8/2026" [ref=f1e256]
                      - cell [ref=f1e257]:
                        - button "Abrir menú de acciones" [ref=f1e259]:
                          - button "Abrir menú de acciones" [ref=f1e260]
                    - row [ref=f1e265] [cursor=pointer]:
                      - cell "SOL-0063" [ref=f1e266]
                      - cell "Andres Daniel Ruiz Murillo" [ref=f1e267]
                      - cell "andres.test@example.com" [ref=f1e270]
                      - cell "3015693683" [ref=f1e272]
                      - cell "Pendiente" [ref=f1e273]
                      - cell "19/8/2026" [ref=f1e275]
                      - cell [ref=f1e276]:
                        - button "Abrir menú de acciones" [ref=f1e278]:
                          - button "Abrir menú de acciones" [ref=f1e279]
                    - row [ref=f1e284] [cursor=pointer]:
                      - cell "SOL-0062" [ref=f1e285]
                      - cell "Andres Daniel Ruiz Murillo" [ref=f1e286]
                      - cell "andres.test@example.com" [ref=f1e289]
                      - cell "3015693683" [ref=f1e291]
                      - cell "Pendiente" [ref=f1e292]
                      - cell "19/8/2026" [ref=f1e294]
                      - cell [ref=f1e295]:
                        - button "Abrir menú de acciones" [ref=f1e297]:
                          - button "Abrir menú de acciones" [ref=f1e298]
                    - row [ref=f1e303] [cursor=pointer]:
                      - cell "SOL-0061" [ref=f1e304]
                      - cell "Andres Daniel Ruiz Murillo" [ref=f1e305]
                      - cell "andres.test@example.com" [ref=f1e308]
                      - cell "3015693683" [ref=f1e310]
                      - cell "Pendiente" [ref=f1e311]
                      - cell "19/8/2026" [ref=f1e313]
                      - cell [ref=f1e314]:
                        - button "Abrir menú de acciones" [ref=f1e316]:
                          - button "Abrir menú de acciones" [ref=f1e317]
                    - row [ref=f1e322] [cursor=pointer]:
                      - cell "SOL-0060" [ref=f1e323]
                      - cell "Andres Daniel Ruiz Murillo" [ref=f1e324]
                      - cell "andres.test@example.com" [ref=f1e327]
                      - cell "3015693683" [ref=f1e329]
                      - cell "Pendiente" [ref=f1e330]
                      - cell "19/8/2026" [ref=f1e332]
                      - cell [ref=f1e333]:
                        - button "Abrir menú de acciones" [ref=f1e335]:
                          - button "Abrir menú de acciones" [ref=f1e336]
                    - row [ref=f1e341] [cursor=pointer]:
                      - cell "SOL-0059" [ref=f1e342]
                      - cell "Andres Daniel Ruiz Murillo" [ref=f1e343]
                      - cell "andres.test@example.com" [ref=f1e346]
                      - cell "3015693683" [ref=f1e348]
                      - cell "Pendiente" [ref=f1e349]
                      - cell "19/8/2026" [ref=f1e351]
                      - cell [ref=f1e352]:
                        - button "Abrir menú de acciones" [ref=f1e354]:
                          - button "Abrir menú de acciones" [ref=f1e355]
                    - row [ref=f1e360] [cursor=pointer]:
                      - cell "SOL-0058" [ref=f1e361]
                      - cell "Andres Daniel Ruiz Murillo" [ref=f1e362]
                      - cell "andres.test@example.com" [ref=f1e365]
                      - cell "3015693683" [ref=f1e367]
                      - cell "Pendiente" [ref=f1e368]
                      - cell "19/8/2026" [ref=f1e370]
                      - cell [ref=f1e371]:
                        - button "Abrir menú de acciones" [ref=f1e373]:
                          - button "Abrir menú de acciones" [ref=f1e374]
                    - row [ref=f1e379] [cursor=pointer]:
                      - cell "SOL-0057" [ref=f1e380]
                      - cell "Andres Daniel Ruiz Murillo" [ref=f1e381]
                      - cell "andres.test@example.com" [ref=f1e384]
                      - cell "3015693683" [ref=f1e386]
                      - cell "Pendiente" [ref=f1e387]
                      - cell "19/8/2026" [ref=f1e389]
                      - cell [ref=f1e390]:
                        - button "Abrir menú de acciones" [ref=f1e392]:
                          - button "Abrir menú de acciones" [ref=f1e393]
                    - row [ref=f1e398] [cursor=pointer]:
                      - cell "SOL-0056" [ref=f1e399]
                      - cell "Andres Daniel Ruiz Murillo" [ref=f1e400]
                      - cell "andres.test@example.com" [ref=f1e403]
                      - cell "3015693683" [ref=f1e405]
                      - cell "Pendiente" [ref=f1e406]
                      - cell "19/8/2026" [ref=f1e408]
                      - cell [ref=f1e409]:
                        - button "Abrir menú de acciones" [ref=f1e411]:
                          - button "Abrir menú de acciones" [ref=f1e412]
                - generic [ref=f1e417]:
                  - generic [ref=f1e418]:
                    - generic [ref=f1e419]: Mostrando 1-10
                    - generic [ref=f1e420]: de
                    - generic [ref=f1e421]: "40"
                    - generic [ref=f1e422]: 10 por página
                  - generic [ref=f1e423]:
                    - button [disabled]
                    - button [disabled]
                    - button "1" [ref=f1e424] [cursor=pointer]
                    - button "2" [ref=f1e427] [cursor=pointer]
                    - button "3" [ref=f1e430] [cursor=pointer]
                    - button "4" [ref=f1e433] [cursor=pointer]
                    - button [ref=f1e436] [cursor=pointer]
                    - button [ref=f1e441] [cursor=pointer]
    - region "Notifications alt+T"
  - dialog [ref=f1e447]:
    - banner [ref=f1e448]:
      - heading "Solicitar cotización" [level=2] [ref=f1e452]
      - generic [ref=f1e453]:
        - generic [ref=f1e454]: Paso 1 de 4
        - button "Cerrar" [ref=f1e456] [cursor=pointer]
    - generic [ref=f1e463]:
      - 'generic "Progreso del formulario: paso 1 de 4" [ref=f1e464]':
        - list [ref=f1e467]:
          - listitem [ref=f1e468]:
            - generic [ref=f1e469]: "1"
            - generic [ref=f1e473]: Cliente
          - listitem [ref=f1e474]:
            - generic [ref=f1e475]: "2"
            - generic [ref=f1e479]: Producto y personalización
          - listitem [ref=f1e480]:
            - generic [ref=f1e481]: "3"
            - generic [ref=f1e485]: Entrega
          - listitem [ref=f1e486]:
            - generic [ref=f1e487]: "4"
            - generic [ref=f1e490]: Resumen
      - generic [ref=f1e491]:
        - generic [ref=f1e492]:
          - generic [ref=f1e493]: Paso 1 de 4
          - heading "Cliente" [level=2] [ref=f1e494]
          - paragraph [ref=f1e495]: Identifica quién solicita la cotización.
        - generic [ref=f1e498]:
          - generic [ref=f1e500]:
            - generic [ref=f1e501]: Cliente *
            - textbox "Cliente *" [active] [ref=f1e502]:
              - /placeholder: Cliente
              - text: Andres Daniel Ruiz Murillo
          - generic [ref=f1e503]:
            - generic [ref=f1e504]:
              - generic [ref=f1e505]: Email
              - textbox "Email" [ref=f1e506]
            - generic [ref=f1e507]:
              - generic [ref=f1e508]: Teléfono
              - textbox "Teléfono" [ref=f1e509]
    - contentinfo [ref=f1e510]:
      - generic [ref=f1e511]:
        - button "Cancelar" [ref=f1e512] [cursor=pointer]
        - button "Siguiente" [ref=f1e516] [cursor=pointer]
```

# Test source

```ts
  1   | import { test, expect } from '@playwright/test';
  2   | 
  3   | const TEST_EMAIL = 'andres.test@example.com';
  4   | const TEST_PASSWORD = 'Test123456';
  5   | 
  6   | test.describe('Debug reload detail', () => {
  7   |   test.beforeEach(async ({ page }) => {
  8   |     await page.goto('/login');
  9   |     await page.fill('input[type="email"]', TEST_EMAIL);
  10  |     await page.fill('input[type="password"]', TEST_PASSWORD);
  11  |     await page.click('button[type="submit"]');
  12  |     await page.waitForURL('**/cliente/**');
  13  |   });
  14  | 
  15  |   test('debug after reload', async ({ page }) => {
  16  |     await page.goto('/cliente/cotizaciones/nueva');
  17  |     await page.waitForSelector('text=Paso 1');
  18  |     await page.waitForTimeout(500);
  19  | 
  20  |     await page.fill('input[placeholder="Cliente"]', 'Andres Daniel Ruiz Murillo');
> 21  |     await page.fill('input[placeholder="Tel�fono"]', '3015693683');
      |                ^ Error: page.fill: Test timeout of 30000ms exceeded.
  22  |     await page.fill('input[placeholder="Email"]', 'andres.test@example.com');
  23  | 
  24  |     await page.click('[data-testid="quotation-next"]');
  25  |     await page.waitForSelector('text=Paso 2');
  26  |     await page.waitForTimeout(500);
  27  | 
  28  |     await page.fill('input[placeholder="Escribe el nombre del producto o selecciona uno del cat�logo"]', 'Producto prueba');
  29  |     await page.fill('input[placeholder="Cantidad"]', '1');
  30  | 
  31  |     const mostrarDistBtn = page.locator('button:has-text("Mostrar")').first();
  32  |     await expect(mostrarDistBtn).toBeVisible({ timeout: 10000 });
  33  |     await mostrarDistBtn.click();
  34  |     await page.waitForTimeout(500);
  35  | 
  36  |     const tallaInput = page.locator('input[placeholder="0"]').nth(2);
  37  |     await expect(tallaInput).toBeVisible({ timeout: 10000 });
  38  |     await tallaInput.fill('1');
  39  | 
  40  |     const mostrarBtn = page.locator('button:has-text("Mostrar")').last();
  41  |     await expect(mostrarBtn).toBeVisible({ timeout: 10000 });
  42  |     await mostrarBtn.click();
  43  |     await page.waitForTimeout(500);
  44  | 
  45  |     const addBtn = page.locator('button:has-text("Agregar personalizaci�n")');
  46  |     await expect(addBtn).toBeVisible({ timeout: 10000 });
  47  |     await addBtn.click();
  48  |     await page.waitForTimeout(500);
  49  | 
  50  |     await page.selectOption('select', 'ESTAMPADO');
  51  |     await page.fill('input[placeholder="Ej: DTF, Serigraf�a..."]', 'ESTAMPADO');
  52  |     await page.fill('textarea[placeholder="Describe el dise�o..."]', 'me gustar�a un Pikachu en la espalda');
  53  | 
  54  |     const ubicacionBtn = page.locator('button:has-text("ESPALDA")');
  55  |     if (await ubicacionBtn.count() > 0) {
  56  |       await ubicacionBtn.first().click();
  57  |     }
  58  | 
  59  |     const agregarVarianteBtn = page.locator('button:has-text("Agregar variante")');
  60  |     if (await agregarVarianteBtn.count() > 0) {
  61  |       await agregarVarianteBtn.first().click();
  62  |       await page.waitForTimeout(500);
  63  |       await page.fill('input[placeholder="Talla"]', 'M');
  64  |       await page.fill('input[placeholder="Color"]', 'Rojo');
  65  |       await page.fill('input[placeholder="Cant."]', '1');
  66  |     }
  67  | 
  68  |     const fileInput = page.locator('[data-testid="reference-image-input"]');
  69  |     await fileInput.setInputFiles('src/assets/images/logos/partner-logo-2-Photoroom.png');
  70  |     await page.waitForTimeout(500);
  71  | 
  72  |     await page.click('[data-testid="quotation-next"]');
  73  |     await page.waitForSelector('text=Paso 3');
  74  |     await page.waitForTimeout(500);
  75  | 
  76  |     const fechaInput = page.locator('input[type="date"], input[placeholder*="Fecha"], input[placeholder*="fecha"]').first();
  77  |     if (await fechaInput.count() > 0) {
  78  |       await fechaInput.fill('2026-12-31');
  79  |     }
  80  | 
  81  |     await page.click('[data-testid="quotation-next"]');
  82  |     await page.waitForSelector('text=Paso 4');
  83  |     await page.waitForTimeout(500);
  84  | 
  85  |     await page.click('[data-testid="quotation-submit"]');
  86  |     await page.waitForTimeout(5000);
  87  | 
  88  |     await page.waitForSelector('text=Nueva solicitud', { state: 'visible' });
  89  |     await page.waitForTimeout(1000);
  90  | 
  91  |     const row = page.locator('tbody tr').first();
  92  |     await expect(row).toBeVisible({ timeout: 10000 });
  93  |     await row.click({ force: true });
  94  |     await page.waitForTimeout(1000);
  95  | 
  96  |     await page.screenshot({ path: 'playwright-report/detail-before-reload.png' });
  97  | 
  98  |     const detailImg = page.locator('img[alt*="Referencia"]').first();
  99  |     await expect(detailImg).toBeVisible();
  100 |     const detailSrc = await detailImg.getAttribute('src');
  101 |     console.log('Detail src before reload:', detailSrc);
  102 | 
  103 |     await page.reload();
  104 |     await page.waitForTimeout(3000);
  105 | 
  106 |     const firstRowHtml = await page.evaluate(() => {
  107 |       const row = document.querySelector('tbody tr');
  108 |       return row ? row.innerHTML : 'NO ROW';
  109 |     });
  110 |     console.log('First row HTML after reload:', firstRowHtml);
  111 | 
  112 |     await page.waitForSelector('tbody tr:has(td)', { timeout: 10000 });
  113 |     const rowAfterReload = page.locator('tbody tr').first();
  114 |     await expect(rowAfterReload).toBeVisible({ timeout: 10000 });
  115 |     await rowAfterReload.click({ force: true });
  116 |     await page.waitForTimeout(3000);
  117 | 
  118 |     await page.screenshot({ path: 'playwright-report/detail-after-reload.png' });
  119 | 
  120 |     const detailModalAfterReload = await page.evaluate(() => {
  121 |       const modal = document.querySelector('[role="dialog"]');
```
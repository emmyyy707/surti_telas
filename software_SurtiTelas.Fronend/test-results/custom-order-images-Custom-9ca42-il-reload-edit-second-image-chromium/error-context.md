# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: custom-order-images.spec.ts >> Custom order reference images E2E >> full flow: create, submit, detail, reload, edit, second image
- Location: tests\e2e\custom-order-images.spec.ts:15:3

# Error details

```
Test timeout of 90000ms exceeded.
```

```
Error: page.fill: Test timeout of 90000ms exceeded.
Call log:
  - waiting for locator('input[placeholder="Cantidad"]')

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
        - generic [ref=f1e454]: Paso 2 de 4
        - button "Cerrar" [ref=f1e456] [cursor=pointer]
    - generic [ref=f1e463]:
      - 'generic "Progreso del formulario: paso 2 de 4" [ref=f1e464]':
        - list [ref=f1e467]:
          - listitem [ref=f1e468]:
            - generic [ref=f1e474]: Cliente
          - listitem [ref=f1e475]:
            - generic [ref=f1e476]: "2"
            - generic [ref=f1e480]: Producto y personalización
          - listitem [ref=f1e481]:
            - generic [ref=f1e482]: "3"
            - generic [ref=f1e486]: Entrega
          - listitem [ref=f1e487]:
            - generic [ref=f1e488]: "4"
            - generic [ref=f1e491]: Resumen
      - generic [ref=f1e492]:
        - generic [ref=f1e493]:
          - generic [ref=f1e494]: Paso 2 de 4
          - heading "Producto y personalización" [level=2] [ref=f1e495]
          - paragraph [ref=f1e496]: Configura el producto y sus personalizaciones.
        - generic [ref=f1e499]:
          - generic [ref=f1e500]:
            - generic [ref=f1e501] [cursor=pointer]:
              - generic [ref=f1e502]:
                - generic [ref=f1e503]: Producto 1
                - button "Eliminar producto" [ref=f1e504]
              - generic [ref=f1e508]:
                - generic [ref=f1e509]: 0 unidades
                - generic [ref=f1e510]: ·
                - generic [ref=f1e511]: 0 personalizaciónes
            - button "Agregar producto" [ref=f1e515] [cursor=pointer]
          - generic [ref=f1e518]:
            - generic [ref=f1e520]:
              - generic [ref=f1e521]: Producto base *
              - combobox "Producto base *" [active] [ref=f1e522]: Producto prueba
              - generic [ref=f1e523]: Sugerencias del catálogo disponibles.
            - generic [ref=f1e525]:
              - generic [ref=f1e526]: Material/Tela
              - textbox "Material/Tela" [ref=f1e527]:
                - /placeholder: Material
            - generic [ref=f1e528]:
              - heading "Distribución de prendas" [level=3] [ref=f1e530]
              - generic [ref=f1e531]:
                - generic [ref=f1e532]:
                  - generic [ref=f1e533]: XS
                  - spinbutton "0" [ref=f1e534]
                - generic [ref=f1e535]:
                  - generic [ref=f1e536]: S
                  - spinbutton "0" [ref=f1e537]
                - generic [ref=f1e538]:
                  - generic [ref=f1e539]: M
                  - spinbutton "0" [ref=f1e540]
                - generic [ref=f1e541]:
                  - generic [ref=f1e542]: L
                  - spinbutton "0" [ref=f1e543]
                - generic [ref=f1e544]:
                  - generic [ref=f1e545]: XL
                  - spinbutton "0" [ref=f1e546]
                - generic [ref=f1e547]:
                  - generic [ref=f1e548]: XXL
                  - spinbutton "0" [ref=f1e549]
              - generic [ref=f1e550]:
                - generic [ref=f1e551]: Total
                - generic [ref=f1e552]: "0"
            - generic [ref=f1e553]:
              - heading "Personalizaciones" [level=3] [ref=f1e555]
              - generic [ref=f1e557]:
                - generic [ref=f1e558]: No hay personalizaciones creadas para este producto.
                - button "Agregar personalización" [ref=f1e559] [cursor=pointer]
    - contentinfo [ref=f1e563]:
      - generic [ref=f1e564]:
        - button "Cancelar" [ref=f1e565] [cursor=pointer]
        - generic [ref=f1e568]:
          - button "Anterior" [ref=f1e569] [cursor=pointer]
          - button "Siguiente" [ref=f1e572] [cursor=pointer]
```

# Test source

```ts
  1   | import { test, expect } from '@playwright/test';
  2   | 
  3   | const TEST_EMAIL = 'andres.test@example.com';
  4   | const TEST_PASSWORD = 'Test123456';
  5   | 
  6   | test.describe('Custom order reference images E2E', () => {
  7   |   test.beforeEach(async ({ page }) => {
  8   |     await page.goto('/login');
  9   |     await page.fill('input[type="email"]', TEST_EMAIL);
  10  |     await page.fill('input[type="password"]', TEST_PASSWORD);
  11  |     await page.click('button[type="submit"]');
  12  |     await page.waitForURL('**/cliente/**');
  13  |   });
  14  | 
  15  |   test('full flow: create, submit, detail, reload, edit, second image', async ({ page }) => {
  16  |     test.setTimeout(90000);
  17  |     page.on('console', (msg) => {
  18  |       const text = msg.text();
  19  |       if (text.includes('[SUBMIT]') || text.includes('CUSTOM-ORDER')) {
  20  |         console.log('[BROWSER LOG]', text);
  21  |       }
  22  |     });
  23  | 
  24  |     await page.goto('/cliente/cotizaciones/nueva');
  25  |     await page.waitForSelector('text=Paso 1');
  26  |     await page.waitForTimeout(500);
  27  | 
  28  |     await page.fill('input[placeholder="Cliente"]', 'Andres Daniel Ruiz Murillo');
  29  |     await page.fill('input[placeholder="Teléfono"]', '3015693683');
  30  |     await page.fill('input[placeholder="Email"]', 'andres.test@example.com');
  31  | 
  32  |     await page.click('[data-testid="quotation-next"]');
  33  |     await page.waitForSelector('text=Paso 2');
  34  |     await page.waitForTimeout(500);
  35  | 
  36  |     await page.fill('input[placeholder="Escribe el nombre del producto o selecciona uno del catálogo"]', 'Producto prueba');
> 37  |     await page.fill('input[placeholder="Cantidad"]', '1');
      |                ^ Error: page.fill: Test timeout of 90000ms exceeded.
  38  | 
  39  |     const mostrarDistBtn = page.locator('button:has-text("Mostrar")').first();
  40  |     await expect(mostrarDistBtn).toBeVisible({ timeout: 10000 });
  41  |     await mostrarDistBtn.click();
  42  |     await page.waitForTimeout(500);
  43  | 
  44  |     const tallaInput = page.locator('input[placeholder="0"]').nth(2);
  45  |     await expect(tallaInput).toBeVisible({ timeout: 10000 });
  46  |     await tallaInput.fill('1');
  47  | 
  48  |     const mostrarBtn = page.locator('button:has-text("Mostrar")').last();
  49  |     await expect(mostrarBtn).toBeVisible({ timeout: 10000 });
  50  |     await mostrarBtn.click();
  51  |     await page.waitForTimeout(500);
  52  | 
  53  |     const addBtn = page.locator('button:has-text("Agregar personalización")');
  54  |     await expect(addBtn).toBeVisible({ timeout: 10000 });
  55  |     await addBtn.click();
  56  |     await page.waitForTimeout(500);
  57  | 
  58  |     await page.selectOption('select', 'ESTAMPADO');
  59  |     await page.fill('input[placeholder="Ej: DTF, Serigrafía..."]', 'ESTAMPADO');
  60  |     await page.fill('textarea[placeholder="Describe el diseño..."]', 'me gustaría un Pikachu en la espalda');
  61  | 
  62  |     const ubicacionBtn = page.locator('button:has-text("ESPALDA")');
  63  |     if (await ubicacionBtn.count() > 0) {
  64  |       await ubicacionBtn.first().click();
  65  |     }
  66  | 
  67  |     const agregarVarianteBtn = page.locator('button:has-text("Agregar variante")');
  68  |     if (await agregarVarianteBtn.count() > 0) {
  69  |       await agregarVarianteBtn.first().click();
  70  |       await page.waitForTimeout(500);
  71  |       await page.fill('input[placeholder="Talla"]', 'M');
  72  |       await page.fill('input[placeholder="Color"]', 'Rojo');
  73  |       await page.fill('input[placeholder="Cant."]', '1');
  74  |     }
  75  | 
  76  |     const fileInput = page.locator('[data-testid="reference-image-input"]');
  77  |     await fileInput.setInputFiles('src/assets/images/logos/partner-logo-2-Photoroom.png');
  78  |     await page.waitForTimeout(500);
  79  | 
  80  |     await page.click('[data-testid="quotation-next"]');
  81  |     await page.waitForSelector('text=Paso 3');
  82  |     await page.waitForTimeout(500);
  83  | 
  84  |     const fechaInput = page.locator('input[type="date"], input[placeholder*="Fecha"], input[placeholder*="fecha"]').first();
  85  |     if (await fechaInput.count() > 0) {
  86  |       await fechaInput.fill('2026-12-31');
  87  |     }
  88  | 
  89  |     await page.click('[data-testid="quotation-next"]');
  90  |     await page.waitForSelector('text=Paso 4');
  91  |     await page.waitForTimeout(500);
  92  | 
  93  |     const summaryImg = page.locator('img[alt*="Referencia"]').first();
  94  |     await expect(summaryImg).toBeVisible();
  95  |     const summarySrc = await summaryImg.getAttribute('src');
  96  |     expect(summarySrc).toBeTruthy();
  97  | 
  98  |     const buttonType = await page.locator('[data-testid="quotation-submit"]').getAttribute('type');
  99  |     console.log('Button type before click:', buttonType);
  100 | 
  101 |     await page.click('[data-testid="quotation-submit"]');
  102 |     await page.waitForTimeout(5000);
  103 | 
  104 |     const formEl = await page.locator('form').count();
  105 |     console.log('Form count:', formEl);
  106 | 
  107 |     const savingAfter = await page.locator('text=Enviando...').count();
  108 |     console.log('Saving indicator after click:', savingAfter);
  109 | 
  110 |     const toastAfter = await page.locator('[data-sonner-toast], .toast').count();
  111 |     console.log('Toast count after click:', toastAfter);
  112 | 
  113 |     const errorAfter = await page.locator('.errorText, [role="alert"], .text-red-600').count();
  114 |     console.log('Error count after click:', errorAfter);
  115 | 
  116 |     await page.screenshot({ path: 'playwright-report/after-submit.png' });
  117 | 
  118 |     const htmlAfter = await page.content();
  119 |     console.log('HTML after submit length:', htmlAfter.length);
  120 | 
  121 |     const titleCount = await page.locator('text=Mis Cotizaciones').count();
  122 |     console.log('Title count after submit:', titleCount);
  123 | 
  124 |     const nuevaSolicitudCount = await page.locator('text=Nueva solicitud').count();
  125 |     console.log('Nueva solicitud count after submit:', nuevaSolicitudCount);
  126 | 
  127 |     const rowCount = await page.locator('tbody tr').count();
  128 |     console.log('Table rows after submit:', rowCount);
  129 | 
  130 |     const pathname = await page.evaluate(() => window.location.pathname);
  131 |     console.log('Pathname after submit:', pathname);
  132 | 
  133 |     await page.waitForTimeout(1000);
  134 | 
  135 |     const row = page.locator('tbody tr').first();
  136 |     await expect(row).toBeVisible({ timeout: 10000 });
  137 |     await row.click({ force: true });
```
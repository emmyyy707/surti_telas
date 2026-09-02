# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: explorar-html.spec.ts >> explorar HTML de botones clave
- Location: tests\e2e\explorar-html.spec.ts:3:1

# Error details

```
ReferenceError: require is not defined
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
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test('explorar HTML de botones clave', async ({ page }) => {
  4  |   await page.goto('/login');
  5  |   await page.fill('input[type="email"]', 'andres.test@example.com');
  6  |   await page.fill('input[type="password"]', 'Test123456');
  7  |   await page.click('button[type="submit"]');
  8  |   await page.waitForURL('**/cliente/**');
  9  | 
  10 |   await page.goto('/cliente/pedidos-personalizados');
  11 |   await page.waitForTimeout(2000);
  12 | 
  13 |   const html = await page.content();
> 14 |   require('fs').writeFileSync('playwright-report/page.html', html, 'utf8');
     |   ^ ReferenceError: require is not defined
  15 | 
  16 |   const buttons = await page.locator('button').allTextContents();
  17 |   require('fs').writeFileSync('playwright-report/buttons.json', JSON.stringify(buttons, null, 2), 'utf8');
  18 | 
  19 |   const inputs = await page.locator('input').all();
  20 |   const inputInfo = [];
  21 |   for (const input of inputs) {
  22 |     const type = await input.getAttribute('type');
  23 |     const name = await input.getAttribute('name');
  24 |     const placeholder = await input.getAttribute('placeholder');
  25 |     const id = await input.getAttribute('id');
  26 |     inputInfo.push({ type, name, placeholder, id });
  27 |   }
  28 |   require('fs').writeFileSync('playwright-report/inputs.json', JSON.stringify(inputInfo, null, 2), 'utf8');
  29 | });
  30 | 
```
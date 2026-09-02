# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: chat.spec.ts >> Chat E2E - Asesor >> should show chat interface
- Location: tests\e2e\chat.spec.ts:27:3

# Error details

```
Test timeout of 30000ms exceeded while running "beforeEach" hook.
```

```
Error: page.fill: Test timeout of 30000ms exceeded.
Call log:
  - waiting for locator('input[type="email"]')

```

# Page snapshot

```yaml
- generic [ref=e2]:
  - generic [ref=e3]:
    - banner [ref=e4]:
      - generic [ref=e5]:
        - link [ref=e7] [cursor=pointer]:
          - /url: /
          - img "Surticamisetas" [ref=e8]
        - navigation [ref=e9]:
          - link "Inicio" [ref=e10] [cursor=pointer]:
            - /url: /
          - link "Nosotros" [ref=e11] [cursor=pointer]:
            - /url: /nosotros
          - link "Catálogo" [ref=e12] [cursor=pointer]:
            - /url: /catalogo
          - link "Contacto" [ref=e13] [cursor=pointer]:
            - /url: /contacto
        - generic [ref=e14]:
          - button [ref=e16] [cursor=pointer]
          - button [ref=e21] [cursor=pointer]
    - main [ref=e26]:
      - main [ref=e28]:
        - generic [ref=e30]:
          - generic [ref=e31]:
            - text: Líderes en confección
            - heading "Bienvenido a Surticamisetas" [level=1] [ref=e32]
            - paragraph [ref=e33]: Más de 15 años liderando la industria textil. Productos premium en algodón 100% y personalización avanzada para tu marca o evento.
            - generic [ref=e34]:
              - button "Ver catálogo" [ref=e35] [cursor=pointer]
              - button "Iniciar sesión" [ref=e38] [cursor=pointer]
          - img "Icono textil" [ref=e62]
        - generic [ref=e71]:
          - generic [ref=e72]:
            - text: Problemas comunes
            - heading "¿Te suena familiar?" [level=2] [ref=e73]
            - paragraph [ref=e74]: La mayor parte de empresas de confección enfrentan estos desafíos diariamente.
          - generic [ref=e75]:
            - generic [ref=e76]:
              - heading "Desorden en inventario" [level=3] [ref=e80]
              - paragraph [ref=e81]: No sabes cuántos productos o materiales tienes disponibles.
            - generic [ref=e82]:
              - heading "Ventas dispersas" [level=3] [ref=e86]
              - paragraph [ref=e87]: Los pedidos y seguimientos se pierden entre canales manuales.
            - generic [ref=e88]:
              - heading "Falta de control" [level=3] [ref=e92]
              - paragraph [ref=e93]: No hay visibilidad clara del estado de producción.
            - generic [ref=e94]:
              - heading "Pérdida de información" [level=3] [ref=e98]
              - paragraph [ref=e99]: Los datos quedan repartidos y son difíciles de consultar.
        - generic [ref=e100]:
          - generic [ref=e101]:
            - text: Excelencia Textil
            - heading "Inspirando confianza en cada prenda" [level=2] [ref=e102]
          - generic [ref=e103]:
            - button "Anterior" [ref=e104] [cursor=pointer]
            - button "Siguiente" [ref=e107] [cursor=pointer]
            - generic [ref=e111]:
              - generic [ref=e112]:
                - generic [ref=e113]:
                  - img "Calidad que se siente" [ref=e114]
                  - generic [ref=e115]: Premium
                - generic [ref=e116]:
                  - heading "Calidad que se siente" [level=3] [ref=e117]
                  - paragraph [ref=e118]: Procesos claros y herramientas simples para operar con confianza.
                  - button "Explorar calidad" [ref=e119] [cursor=pointer]
              - generic [ref=e120]:
                - generic [ref=e121]:
                  - img "Producción más ordenada" [ref=e122]
                  - generic [ref=e123]: Compromiso
                - generic [ref=e124]:
                  - heading "Producción más ordenada" [level=3] [ref=e125]
                  - paragraph [ref=e126]: Coordina talleres, pedidos y entregas desde un único lugar.
                  - button "Explorar calidad" [ref=e127] [cursor=pointer]
              - generic [ref=e128]:
                - generic [ref=e129]:
                  - img "Tecnología útil" [ref=e130]
                  - generic [ref=e131]: Innovación
                - generic [ref=e132]:
                  - heading "Tecnología útil" [level=3] [ref=e133]
                  - paragraph [ref=e134]: Digitaliza las operaciones sin perder agilidad ni control.
                  - button "Explorar calidad" [ref=e135] [cursor=pointer]
        - generic [ref=e137]:
          - generic [ref=e139]:
            - img "Gorras de marca" [ref=e140]
            - generic [ref=e142]:
              - heading "GORRAS DE MARCA PERSONALIZACIÓN TOTAL" [level=2] [ref=e143]
              - button "Ver Catálogo" [ref=e144] [cursor=pointer]
          - generic [ref=e145]:
            - generic [ref=e146]:
              - generic [ref=e147]:
                - img "Diseños Exclusivos" [ref=e148]
                - heading "DISEÑOS EXCLUSIVOS" [level=3] [ref=e150]
              - generic [ref=e151]:
                - img "Camisetas Premium" [ref=e152]
                - heading "CAMISETAS PREMIUM" [level=3] [ref=e154]
              - generic [ref=e155]:
                - img "Pantalonetas" [ref=e157]
                - generic [ref=e158]: Pantalonetas
              - generic [ref=e160]:
                - img "Camisas de Marca" [ref=e162]
                - generic [ref=e163]: Camisas de Marca
            - generic [ref=e165]:
              - generic [ref=e174]:
                - heading "DISEÑO DE MARCAS" [level=4] [ref=e175]
                - paragraph [ref=e176]: Diseños únicos sin costo adicional
              - button "Ver más" [ref=e177] [cursor=pointer]
        - generic [ref=e179]:
          - generic [ref=e180]:
            - generic [ref=e181]: Cotizaciones personalizadas
            - heading "Diseña tu prenda ideal" [level=2] [ref=e182]
            - paragraph [ref=e183]: Selecciona producto, cantidad, talla, color y técnica de personalización. Te entregamos una cotización clara y detallada sin compromiso.
            - generic [ref=e184]:
              - generic [ref=e189]:
                - strong [ref=e190]: Producto base
                - text: Elige la prenda perfecta para tu marca
              - generic [ref=e197]:
                - strong [ref=e198]: Personalización
                - text: Estampado, bordado, sublimación y más
              - generic [ref=e204]:
                - strong [ref=e205]: Cotización clara
                - text: Desglose detallado de costos y tiempos
            - button "Crear cotización" [ref=e206] [cursor=pointer]
          - generic [ref=e210]:
            - generic [ref=e219]:
              - generic [ref=e220]: Diseño
              - generic [ref=e221]: Archivos y referencias
            - generic [ref=e228]:
              - generic [ref=e229]: Material
              - generic [ref=e230]: Algodón premium
            - generic [ref=e236]:
              - generic [ref=e237]: Resultado
              - generic [ref=e238]: Listo para producción
        - generic [ref=e239]:
          - generic [ref=e240]:
            - generic [ref=e241]: Seguimiento en tiempo real
            - heading "Rastrea tu pedido en cada paso" [level=2] [ref=e242]
            - paragraph [ref=e243]: Transparencia total desde que realizas tu compra hasta que llega a tu puerta
          - generic [ref=e248]:
            - generic [ref=e249]: Recibido
            - generic [ref=e255]: En producción
            - generic [ref=e262]: Enviado
            - generic [ref=e270]: Entregado
        - generic [ref=e279]:
          - generic [ref=e280]:
            - text: Experiencia móvil
            - heading "Compra desde cualquier lugar" [level=2] [ref=e281]
            - paragraph [ref=e282]: Aplicación optimizada para móviles. Tus clientes pueden navegar, comprar y hacer seguimiento desde su celular.
            - generic [ref=e283]:
              - generic [ref=e288]:
                - heading "Diseño responsive" [level=4] [ref=e289]
                - paragraph [ref=e290]: Perfecta en cualquier dispositivo.
              - generic [ref=e295]:
                - heading "Carga ultrarrápida" [level=4] [ref=e296]
                - paragraph [ref=e297]: Optimizada para operar sin fricción.
              - generic [ref=e303]:
                - heading "Interfaz intuitiva" [level=4] [ref=e304]
                - paragraph [ref=e305]: Fácil de usar para cualquier persona.
          - generic [ref=e306]:
            - img "Ropa 1" [ref=e308]
            - img "Ropa 2" [ref=e310]
    - contentinfo [ref=e311]:
      - generic [ref=e312]:
        - generic [ref=e313]:
          - generic [ref=e314]:
            - img "Surticamisetas Logo" [ref=e315]
            - img "Surtitela Logo" [ref=e316]
          - paragraph [ref=e317]: Confección y personalización de camisetas para todas las edades. Calidad y estilo en cada prenda.
          - generic [ref=e318]:
            - link "WhatsApp" [ref=e320] [cursor=pointer]:
              - /url: https://wa.me/573000000000
            - link "Instagram" [ref=e324] [cursor=pointer]:
              - /url: https://instagram.com
            - link "TikTok" [ref=e328] [cursor=pointer]:
              - /url: https://tiktok.com
        - generic [ref=e331]:
          - heading "Enlaces Rápidos" [level=3] [ref=e332]
          - list [ref=e333]:
            - listitem [ref=e334]:
              - link "Inicio" [ref=e335] [cursor=pointer]:
                - /url: /
            - listitem [ref=e336]:
              - link "Catálogo" [ref=e337] [cursor=pointer]:
                - /url: /catalogo
            - listitem [ref=e338]:
              - link "Nosotros" [ref=e339] [cursor=pointer]:
                - /url: /nosotros
            - listitem [ref=e340]:
              - link "Contacto" [ref=e341] [cursor=pointer]:
                - /url: /contacto
            - listitem [ref=e342]:
              - link "Iniciar Sesión" [ref=e343] [cursor=pointer]:
                - /url: /login
            - listitem [ref=e344]:
              - link "Registrarse" [ref=e345] [cursor=pointer]:
                - /url: /registro
        - generic [ref=e346]:
          - heading "Contacto" [level=3] [ref=e347]
          - list [ref=e348]:
            - listitem [ref=e349]:
              - generic [ref=e353]: No disponible
            - listitem [ref=e354]:
              - generic [ref=e357]: No disponible
            - listitem [ref=e358]:
              - generic [ref=e362]: No disponible
            - listitem [ref=e363]:
              - generic [ref=e367]: No disponible
      - generic [ref=e369]:
        - paragraph [ref=e370]: © 2025 Surticamisetas. Todos los derechos reservados.
        - generic [ref=e371]:
          - link "Términos y condiciones" [ref=e372] [cursor=pointer]:
            - /url: "#"
          - link "Política de privacidad" [ref=e373] [cursor=pointer]:
            - /url: "#"
      - link "WhatsApp" [ref=e374] [cursor=pointer]:
        - /url: https://wa.me/573000000000
  - region "Notifications alt+T"
```

# Test source

```ts
  1   | import { test, expect, type Page } from '@playwright/test';
  2   | 
  3   | const BASE_URL = 'http://localhost:5173';
  4   | 
  5   | async function loginAsAdvisor(page: Page) {
  6   |   await page.goto(`${BASE_URL}/asesor/chat`);
> 7   |   await page.fill('input[type="email"]', 'chat-advisor@surtitelas.com');
      |              ^ Error: page.fill: Test timeout of 30000ms exceeded.
  8   |   await page.fill('input[type="password"]', 'asesor123');
  9   |   await page.click('.submitBtn');
  10  |   await page.waitForTimeout(3000);
  11  |   await expect(page.locator('body')).toContainText(/chat|asistente|mensaje/i);
  12  | }
  13  | 
  14  | async function loginAsAdmin(page: Page) {
  15  |   await page.goto(`${BASE_URL}/login`);
  16  |   await page.fill('input[type="email"]', 'admin@surtitelas.com');
  17  |   await page.fill('input[type="password"]', 'SurtiTelas2025*');
  18  |   await page.click('.submitBtn');
  19  |   await page.waitForTimeout(3000);
  20  | }
  21  | 
  22  | test.describe('Chat E2E - Asesor', () => {
  23  |   test.beforeEach(async ({ page }) => {
  24  |     await loginAsAdvisor(page);
  25  |   });
  26  | 
  27  |   test('should show chat interface', async ({ page }) => {
  28  |     await expect(page.locator('body')).toContainText(/chat|asistente|mensaje/i);
  29  |   });
  30  | 
  31  |   test('should send a message', async ({ page }) => {
  32  |     const messageInput = page.locator('input[placeholder*="mensaje"], textarea[placeholder*="mensaje"], input[type="text"]').first();
  33  |     if (await messageInput.count() > 0) {
  34  |       await messageInput.fill('Hola, esto es una prueba E2E');
  35  |       await page.click('button[type="submit"], button:has-text("Enviar")');
  36  |       await page.waitForTimeout(1000);
  37  |       await expect(page.locator('text=Hola, esto es una prueba E2E')).toBeVisible();
  38  |     } else {
  39  |       test.skip(true, 'Message input not found');
  40  |     }
  41  |   });
  42  | 
  43  |   test('should open global search', async ({ page }) => {
  44  |     const searchTrigger = page.locator('button[aria-label*="Buscar"], button:has-text("Buscar"), [data-testid="global-search"]').first();
  45  |     if (await searchTrigger.count() > 0) {
  46  |       await searchTrigger.click();
  47  |       await expect(page.locator('input[placeholder*="Buscar"], input[placeholder*="buscar"]').first()).toBeVisible();
  48  |     } else {
  49  |       test.skip(true, 'Global search trigger not found');
  50  |     }
  51  |   });
  52  | 
  53  |   test('should toggle dark mode', async ({ page }) => {
  54  |     const darkModeButton = page.locator('button[aria-label*="Modo oscuro"], button[aria-label*="Modo claro"], button:has-text("🌙"), button:has-text("☀️")').first();
  55  |     if (await darkModeButton.count() > 0) {
  56  |       await darkModeButton.click();
  57  |       await page.waitForTimeout(500);
  58  |     } else {
  59  |       test.skip(true, 'Dark mode button not found');
  60  |     }
  61  |   });
  62  | 
  63  |   test('should add a reaction to a message', async ({ page }) => {
  64  |     await page.waitForTimeout(1000);
  65  |     const message = page.locator('.messageRow, [data-testid="message"]').first();
  66  |     if (await message.count() > 0) {
  67  |       await message.hover();
  68  |       const reactionButton = page.locator('button:has-text("😊"), button[aria-label*="Reacción"], [data-testid="reaction-button"]').first();
  69  |       if (await reactionButton.count() > 0) {
  70  |         await reactionButton.click();
  71  |         await page.waitForTimeout(500);
  72  |       } else {
  73  |         test.skip(true, 'Reaction button not found');
  74  |       }
  75  |     } else {
  76  |       test.skip(true, 'No messages found');
  77  |     }
  78  |   });
  79  | 
  80  |   test('should attach a file', async ({ page }) => {
  81  |     const attachButton = page.locator('label:has-text("📎"), button:has-text("📎"), input[type="file"]').first();
  82  |     if (await attachButton.count() > 0) {
  83  |       await attachButton.click();
  84  |       await page.waitForTimeout(500);
  85  |     } else {
  86  |       test.skip(true, 'Attach button not found');
  87  |     }
  88  |   });
  89  | 
  90  |   test('should export conversation', async ({ page }) => {
  91  |     const exportButton = page.locator('button[aria-label*="Exportar"], button:has-text("📥"), [data-testid="export"]').first();
  92  |     if (await exportButton.count() > 0) {
  93  |       await exportButton.click();
  94  |       await page.waitForTimeout(1000);
  95  |     } else {
  96  |       test.skip(true, 'Export button not found');
  97  |     }
  98  |   });
  99  | 
  100 |   test('should open satisfaction survey', async ({ page }) => {
  101 |     const surveyTrigger = page.locator('[data-testid="survey"], .surveyContainer').first();
  102 |     if (await surveyTrigger.count() > 0) {
  103 |       await expect(surveyTrigger).toBeVisible();
  104 |     } else {
  105 |       test.skip(true, 'Satisfaction survey not found');
  106 |     }
  107 |   });
```
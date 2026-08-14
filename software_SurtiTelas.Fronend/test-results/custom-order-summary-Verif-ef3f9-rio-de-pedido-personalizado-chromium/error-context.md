# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: custom-order-summary.spec.ts >> Verificar estado del formulario de pedido personalizado
- Location: tests\e2e\custom-order-summary.spec.ts:5:1

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: page.click: Test timeout of 30000ms exceeded.
Call log:
  - waiting for locator('text=Nuevo Pedido Personalizado')

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
  1  | import { test, expect, type Page } from '@playwright/test';
  2  | 
  3  | const BASE_URL = 'http://localhost:5173';
  4  | 
  5  | test('Verificar estado del formulario de pedido personalizado', async ({ page }) => {
  6  |   await page.goto(`${BASE_URL}/cliente/mis-pedidos-personalizados`);
  7  |   await page.waitForTimeout(2000);
  8  |   await page.screenshot({ path: 'playwright-screenshot.png' });
  9  | 
> 10 |   await page.click('text=Nuevo Pedido Personalizado');
     |              ^ Error: page.click: Test timeout of 30000ms exceeded.
  11 |   await page.waitForTimeout(2000);
  12 |   await page.screenshot({ path: 'playwright-screenshot2.png' });
  13 | 
  14 |   const items = await page.locator('pre').innerText();
  15 |   console.log('ESTADO INICIAL:', items);
  16 | 
  17 |   await page.fill('input#producto-base', 'Pantalloneta');
  18 |   await page.fill('input#item-cantidad', '600');
  19 |   await page.fill('input#item-material', 'Algodón');
  20 |   await page.selectOption('select', { label: 'Bordado' });
  21 |   await page.click('button:has-text("Frente")');
  22 |   await page.fill('textarea', 'Logo empresarial');
  23 |   await page.fill('input[placeholder="Talla"]', 'M');
  24 |   await page.fill('input[placeholder="Color"]', 'Negro');
  25 |   await page.fill('input[type="number"][placeholder="Cant."]', '100');
  26 |   await page.click('text=Agregar personalización');
  27 |   await page.waitForTimeout(1000);
  28 | 
  29 |   await page.click('text=Agregar otro producto');
  30 |   await page.waitForTimeout(1000);
  31 | 
  32 |   await page.fill('input#producto-base', 'Camiseta básica');
  33 |   await page.fill('input#item-cantidad', '500');
  34 |   await page.selectOption('select', { label: 'Estampado' });
  35 |   await page.click('button:has-text("Espalda")');
  36 |   await page.fill('textarea', 'Diseño de prueba');
  37 |   await page.fill('input[placeholder="Talla"]', 'L');
  38 |   await page.fill('input[placeholder="Color"]', 'Blanco');
  39 |   await page.fill('input[type="number"][placeholder="Cant."]', '100');
  40 |   await page.click('text=Agregar personalización');
  41 |   await page.waitForTimeout(1000);
  42 | 
  43 |   await page.click('button:has-text("Siguiente")');
  44 |   await page.waitForTimeout(1000);
  45 |   await page.click('button:has-text("Siguiente")');
  46 |   await page.waitForTimeout(1000);
  47 | 
  48 |   const summary = await page.locator('pre').innerText();
  49 |   console.log('RESUMEN:', summary);
  50 | });
  51 | 
```
import { test, expect } from '@playwright/test';

const TEST_EMAIL = 'andres.test@example.com';
const TEST_PASSWORD = 'Test123456';

test.describe('Debug reload detail', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"]', TEST_EMAIL);
    await page.fill('input[type="password"]', TEST_PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForURL('**/cliente/**');
  });

  test('debug after reload', async ({ page }) => {
    await page.goto('/cliente/cotizaciones/nueva');
    await page.waitForSelector('text=Paso 1');
    await page.waitForTimeout(500);

    await page.fill('input[placeholder="Cliente"]', 'Andres Daniel Ruiz Murillo');
    await page.fill('input[placeholder="Teléfono"]', '3015693683');
    await page.fill('input[placeholder="Email"]', 'andres.test@example.com');

    await page.click('[data-testid="quotation-next"]');
    await page.waitForSelector('text=Paso 2');
    await page.waitForTimeout(500);

    await page.fill('input[placeholder="Escribe el nombre del producto o selecciona uno del catálogo"]', 'Producto prueba');
    await page.fill('input[placeholder="Cantidad"]', '1');

    const mostrarDistBtn = page.locator('button:has-text("Mostrar")').first();
    await expect(mostrarDistBtn).toBeVisible({ timeout: 10000 });
    await mostrarDistBtn.click();
    await page.waitForTimeout(500);

    const tallaInput = page.locator('input[placeholder="0"]').nth(2);
    await expect(tallaInput).toBeVisible({ timeout: 10000 });
    await tallaInput.fill('1');

    const mostrarBtn = page.locator('button:has-text("Mostrar")').last();
    await expect(mostrarBtn).toBeVisible({ timeout: 10000 });
    await mostrarBtn.click();
    await page.waitForTimeout(500);

    const addBtn = page.locator('button:has-text("Agregar personalización")');
    await expect(addBtn).toBeVisible({ timeout: 10000 });
    await addBtn.click();
    await page.waitForTimeout(500);

    await page.selectOption('select', 'ESTAMPADO');
    await page.fill('input[placeholder="Ej: DTF, Serigrafía..."]', 'ESTAMPADO');
    await page.fill('textarea[placeholder="Describe el diseño..."]', 'me gustaría un Pikachu en la espalda');

    const ubicacionBtn = page.locator('button:has-text("ESPALDA")');
    if (await ubicacionBtn.count() > 0) {
      await ubicacionBtn.first().click();
    }

    const agregarVarianteBtn = page.locator('button:has-text("Agregar variante")');
    if (await agregarVarianteBtn.count() > 0) {
      await agregarVarianteBtn.first().click();
      await page.waitForTimeout(500);
      await page.fill('input[placeholder="Talla"]', 'M');
      await page.fill('input[placeholder="Color"]', 'Rojo');
      await page.fill('input[placeholder="Cant."]', '1');
    }

    const fileInput = page.locator('[data-testid="reference-image-input"]');
    await fileInput.setInputFiles('src/assets/images/logos/partner-logo-2-Photoroom.png');
    await page.waitForTimeout(500);

    await page.click('[data-testid="quotation-next"]');
    await page.waitForSelector('text=Paso 3');
    await page.waitForTimeout(500);

    const fechaInput = page.locator('input[type="date"], input[placeholder*="Fecha"], input[placeholder*="fecha"]').first();
    if (await fechaInput.count() > 0) {
      await fechaInput.fill('2026-12-31');
    }

    await page.click('[data-testid="quotation-next"]');
    await page.waitForSelector('text=Paso 4');
    await page.waitForTimeout(500);

    await page.click('[data-testid="quotation-submit"]');
    await page.waitForTimeout(5000);

    await page.waitForSelector('text=Nueva solicitud', { state: 'visible' });
    await page.waitForTimeout(1000);

    const row = page.locator('tbody tr').first();
    await expect(row).toBeVisible({ timeout: 10000 });
    await row.click({ force: true });
    await page.waitForTimeout(1000);

    await page.screenshot({ path: 'playwright-report/detail-before-reload.png' });

    const detailImg = page.locator('img[alt*="Referencia"]').first();
    await expect(detailImg).toBeVisible();
    const detailSrc = await detailImg.getAttribute('src');
    console.log('Detail src before reload:', detailSrc);

    await page.reload();
    await page.waitForTimeout(3000);

    const firstRowHtml = await page.evaluate(() => {
      const row = document.querySelector('tbody tr');
      return row ? row.innerHTML : 'NO ROW';
    });
    console.log('First row HTML after reload:', firstRowHtml);

    await page.waitForSelector('tbody tr:has(td)', { timeout: 10000 });
    const rowAfterReload = page.locator('tbody tr').first();
    await expect(rowAfterReload).toBeVisible({ timeout: 10000 });
    await rowAfterReload.click({ force: true });
    await page.waitForTimeout(3000);

    await page.screenshot({ path: 'playwright-report/detail-after-reload.png' });

    const detailModalAfterReload = await page.evaluate(() => {
      const modal = document.querySelector('[role="dialog"]');
      if (!modal) return 'NO MODAL';
      return modal.innerHTML;
    });
    console.log('Detail modal after reload:', detailModalAfterReload);

    const detailImgAfterReload = page.locator('img[alt*="Referencia"]').first();
    const exists = await detailImgAfterReload.count();
    console.log('Images after reload count:', exists);
    if (exists > 0) {
      const src = await detailImgAfterReload.getAttribute('src');
      console.log('Detail src after reload:', src);
    }
  });
});

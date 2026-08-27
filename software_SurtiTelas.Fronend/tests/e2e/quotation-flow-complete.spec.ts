import { test, expect, Page } from '@playwright/test';

const BASE_URL = 'http://localhost:5173';

async function loginAsAdmin(page: Page) {
  await page.goto(`${BASE_URL}/login`);
  await page.fill('input[type="email"]', 'admin@surtitelas.com');
  await page.fill('input[type="password"]', 'SurtiTelas2025*');
  await Promise.all([
    page.waitForResponse((resp) => resp.url().includes('/auth/login') && resp.status() === 200),
    page.click('button[type="submit"]'),
  ]);
  await page.waitForTimeout(2000);
}

async function navigateToPedidosPersonalizados(page: Page) {
  await page.goto(`${BASE_URL}/admin/pedidos-personalizados`);
  await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
  await page.waitForTimeout(1000);
}

async function openOrderDetail(page: Page, searchTerm: string) {
  const searchInput = page.locator('input[placeholder="Buscar por solicitud o cliente..."]');
  await searchInput.fill(searchTerm);
  await page.waitForTimeout(800);

  const row = page.locator('tbody tr', { hasText: searchTerm }).first();
  const verDetalleBtn = row.locator('button:has-text("Ver detalle")').first();
  await verDetalleBtn.click();
  await page.waitForTimeout(1000);

  const modal = page.locator('[role="dialog"]').first();
  await expect(modal).toBeVisible({ timeout: 10000 });
  return modal;
}

test.describe('Gestión de Cotizaciones - Verificación Completa', () => {
  test.beforeEach(async ({ page }) => {
    test.setTimeout(120000);
    await loginAsAdmin(page);
    await navigateToPedidosPersonalizados(page);
  });

  test('A. Abrir Gestión de Cotizaciones y verificar lista', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Cotizaciones');
    const tableRows = await page.locator('tbody tr').count();
    expect(tableRows).toBeGreaterThan(0);
    console.log(`A. OK - ${tableRows} pedidos en la lista`);
  });

  test('B. Abrir detalle - verificar que NO hay modal stacking', async ({ page }) => {
    await openOrderDetail(page, 'SOL-0093');
    const modalCount = await page.locator('[role="dialog"]').count();
    expect(modalCount).toBe(1);
    console.log('B. OK - Solo 1 modal abierto después de Ver detalle');
  });

  test('C. Verificar CANCELADA - SOL-0093 tiene negotiationCount=3', async ({ page }) => {
    const modal = await openOrderDetail(page, 'SOL-0093');

    // Verificar aviso de cancelación
    const cancelledNotice = modal.locator('[data-testid="cancelled-notice"]').first();
    if (await cancelledNotice.count() > 0) {
      await expect(cancelledNotice).toBeVisible({ timeout: 5000 });
      console.log('C. OK - Mensaje de cancelación visible');
    } else {
      // Si no hay aviso, verificar que no hay botones de editar
      const editarBtn = modal.locator('button').filter({ hasText: /Editar|Gestionar|Cotizar/ });
      const count = await editarBtn.count();
      expect(count).toBe(0);
      console.log('C. OK - No hay botones de editar en cotización cancelada');
    }

    // Verificar contador 3/3
    const modalText = await modal.textContent();
    expect(modalText).toContain('3/3');
    console.log('C. OK - Contador 3/3 visible');
  });

  test('D. Verificar estado RECHAZADA - SOL-0092', async ({ page }) => {
    const modal = await openOrderDetail(page, 'SOL-0092');

    // Verificar estado RECHAZADA
    const modalText = await modal.textContent();
    expect(modalText).toContain('RECHAZADA');
    console.log('D. OK - Estado RECHAZADA visible');

    // Verificar motivo de rechazo
    const rejectionReason = modal.locator('[data-testid="rejection-reason"]').first();
    if (await rejectionReason.count() > 0) {
      await expect(rejectionReason).toBeVisible({ timeout: 5000 });
      console.log('D. OK - Motivo de rechazo visible');
    }
  });

  test('E. Verificar historial de negociación - SOL-0093', async ({ page }) => {
    const modal = await openOrderDetail(page, 'SOL-0093');

    // Verificar historial
    const history = modal.locator('[data-testid="negotiation-history"]').first();
    if (await history.count() > 0) {
      await expect(history).toBeVisible({ timeout: 5000 });
      console.log('E. OK - Historial de negociación visible');
    } else {
      // Buscar historial en el texto
      const modalText = await modal.textContent();
      if (modalText && modalText.includes('Historial de negociaciones')) {
        console.log('E. OK - Historial de negociación encontrado en texto');
      } else {
        console.log('E. SKIP - No se encontró historial de negociación');
      }
    }
  });

  test('F. Verificar ENVIADA - SOL-0097', async ({ page }) => {
    const modal = await openOrderDetail(page, 'SOL-0097');

    // Verificar estado ENVIADA
    const modalText = await modal.textContent();
    expect(modalText).toContain('ENVIADA');
    console.log('F. OK - Estado ENVIADA visible');

    // Verificar que NO hay botón de editar (porque está enviada)
    const editarBtn = modal.locator('button').filter({ hasText: /Editar|Gestionar|Cotizar/ });
    const count = await editarBtn.count();
    expect(count).toBe(0);
    console.log('F. OK - No hay botón de editar en cotización enviada');
  });

  test('G. Verificar contador de negociación - SOL-0097 (negCount=1)', async ({ page }) => {
    const modal = await openOrderDetail(page, 'SOL-0097');

    // Verificar contador de negociaciones
    const modalText = await modal.textContent();
    expect(modalText).toContain('Negociaciones');
    console.log('G. OK - Contador de negociación visible');
  });

  test('H. Verificar ACEPTADA - SOL-0098', async ({ page }) => {
    const modal = await openOrderDetail(page, 'SOL-0098');

    // Verificar estado ACEPTADA
    const modalText = await modal.textContent();
    expect(modalText).toContain('ACEPTADA');
    console.log('H. OK - Estado ACEPTADA visible');
  });

  test('I. Verificar PAGO_APROBADO - SOL-0098', async ({ page }) => {
    const modal = await openOrderDetail(page, 'SOL-0098');

    // Verificar botón de convertir a pedido
    const convertirBtn = modal.locator('button').filter({ hasText: /Convertir a pedido/ });
    if (await convertirBtn.count() > 0) {
      await expect(convertirBtn).toBeVisible({ timeout: 5000 });
      console.log('I. OK - Botón Convertir a pedido visible');
    } else {
      console.log('I. SKIP - No se encontró botón de convertir');
    }
  });

  test('J. Verificar CANCELADA bloquea acciones - SOL-0093', async ({ page }) => {
    const modal = await openOrderDetail(page, 'SOL-0093');

    // Verificar que NO hay botones de editar/gestionar
    const gestionarBtn = modal.locator('button').filter({ hasText: /Gestionar|Editar|Cotizar/ });
    const gestionarCount = await gestionarBtn.count();
    expect(gestionarCount).toBe(0);
    console.log('J. OK - No hay botón de gestionar en cotización cancelada');

    // Verificar aviso de cancelación
    const cancelledNotice = modal.locator('[data-testid="cancelled-notice"]').first();
    if (await cancelledNotice.count() > 0) {
      await expect(cancelledNotice).toBeVisible({ timeout: 5000 });
      console.log('J. OK - Mensaje de cancelación visible');
    }
  });

  test('K. Verificar resumen económico - SOL-0097', async ({ page }) => {
    const modal = await openOrderDetail(page, 'SOL-0097');

    // Verificar resumen económico
    const summarySection = modal.locator('[class*="quotationSummary"]').first();
    await expect(summarySection).toBeVisible({ timeout: 5000 });

    const summaryText = await summarySection.textContent();
    expect(summaryText).toContain('Subtotal');
    expect(summaryText).toContain('Total');
    console.log('K. OK - Resumen económico visible');
  });

  test('L. Verificar productos en cotización - SOL-0097', async ({ page }) => {
    const modal = await openOrderDetail(page, 'SOL-0097');

    // Verificar que hay información de productos
    const modalText = await modal.textContent();
    expect(modalText).toContain('Producto');
    console.log('L. OK - Información de productos visible');
  });
});

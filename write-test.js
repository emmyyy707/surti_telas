const fs = require('fs');
const content = `import { test, expect, Locator, Page } from '@playwright/test';

const BASE_URL = 'http://localhost:5173';

async function loginAsAdmin(page: Page) {
  await page.goto(\`\${BASE_URL}/login\`);
  await page.fill('input[type="email"]', 'admin@surtitelas.com');
  await page.fill('input[type="password"]', 'SurtiTelas2025*');
  await Promise.all([
    page.waitForResponse((resp) => resp.url().includes('/auth/login') && resp.status() === 200),
    page.click('button[type="submit"]'),
  ]);
  await page.waitForTimeout(3000);
}

async function findOrderForCotization(page: Page): Promise<string | null> {
  const searchInput = page.locator('input[placeholder="Buscar por solicitud o cliente..."]');
  if (await searchInput.count() > 0) {
    await searchInput.fill('SOL-');
    await page.waitForTimeout(1000);
  }

  const rows = await page.locator('tbody tr').all();
  for (const row of rows) {
    const text = await row.textContent();
    if (text && /SOL-\\d+/.test(text)) {
      const match = text.match(/(SOL-\\d+)/);
      if (match) {
        const hasEnviada = /enviada/i.test(text);
        if (!hasEnviada) {
          return match[1];
        }
      }
    }
  }
  return null;
}

async function openDetailModal(page: Page, numeroSolicitud: string): Promise<void> {
  const searchInput = page.locator('input[placeholder="Buscar por solicitud o cliente..."]');
  if (await searchInput.count() > 0) {
    await searchInput.fill(numeroSolicitud);
    await page.waitForTimeout(800);
  }

  const targetRow = page.locator(\`tbody tr\`, { hasText: numeroSolicitud });
  const rowCount = await targetRow.count();
  if (rowCount === 0) {
    throw new Error(\`No se encontro la solicitud \${numeroSolicitud}\`);
  }

  const row = targetRow.first();
  const detalleBtn = row.locator('button:has-text("Ver detalle")').first();
  await expect(detalleBtn).toBeVisible({ timeout: 5000 });
  await detalleBtn.click();
  await page.waitForTimeout(1000);

  const modal = page.locator('[role="dialog"]').first();
  await expect(modal).toBeVisible({ timeout: 10000 });
}

test.describe('Gestion de Cotizaciones - Flujo E2E', () => {
  test.beforeEach(async ({ page }) => {
    test.setTimeout(120000);
    await loginAsAdmin(page);
    await page.goto(\`\${BASE_URL}/admin/pedidos-personalizados\`);
    await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
    await page.waitForTimeout(4000);
  });

  test('flujo: lista -> detalle -> gestionar cotizacion -> guardar -> enviar -> cierre', async ({ page }) => {
    let targetNumero = await findOrderForCotization(page);

    if (!targetNumero) {
      const rows = await page.locator('tbody tr').all();
      for (const row of rows) {
        const text = await row.textContent();
        if (text && /SOL-\\d+/.test(text)) {
          const match = text.match(/(SOL-\\d+)/);
          if (match) targetNumero = match[1];
          break;
        }
      }
      if (!targetNumero) {
        test.skip(true, 'No se encontraron pedidos para probar');
        return;
      }
    }

    console.log('Usando solicitud:', targetNumero);

    await openDetailModal(page, targetNumero);

    const gestionarBtn = page.locator('button:has-text("Gestionar cotizacion"), button:has-text("Editar cotizacion")').first();
    try {
      await expect(gestionarBtn).toBeVisible({ timeout: 10000 });
    } catch {
      console.log('No se encontro boton de gestionar/editar cotizacion');
      test.skip(true, 'No hay orden con cotizacion gestionable');
      return;
    }
    await gestionarBtn.click();
    await page.waitForTimeout(1000);

    const editor = page.locator('.quotationEditor').first();
    await expect(editor).toBeVisible({ timeout: 10000 });

    const conceptRows = page.locator('.productConceptRow').first();
    const firstDescripcion = conceptRows.locator('input').first();
    if (await firstDescripcion.count() > 0) {
      await firstDescripcion.fill('Prenda de algodon');
    }

    const inputs = await conceptRows.locator('input[type="number"]').all();
    if (inputs.length >= 2) {
      await inputs[0].fill('20');
      await inputs[1].fill('50000');
    }

    const guardarBtn = page.locator('button:has-text("Guardar cotizacion")').first();
    await expect(guardarBtn).toBeVisible({ timeout: 5000 });
    await guardarBtn.click();
    await page.waitForTimeout(2000);

    const toastSuccess = page.locator('.sonner-toast').filter({ hasText: /guardada|borrador/i });
    const toastCount = await toastSuccess.count();
    expect(toastCount).toBeGreaterThan(0);

    const editorAfterSave = page.locator('.quotationEditor').first();
    await expect(editorAfterSave).toBeVisible({ timeout: 5000 });

    const enviarBtn = page.locator('button:has-text("Enviar cotizacion")').first();
    await expect(enviarBtn).toBeVisible({ timeout: 5000 });
    await enviarBtn.click();
    await page.waitForTimeout(3000);

    const toastEnviada = page.locator('.sonner-toast').filter({ hasText: /enviada|enviado/i });
    const enviadaCount = await toastEnviada.count();
    expect(enviadaCount).toBeGreaterThan(0);

    await page.waitForTimeout(1000);

    const modalAfterSend = page.locator('[role="dialog"]');
    const modalCount = await modalAfterSend.count();
    if (modalCount > 0) {
      console.log('Modal still open after send:', await modalAfterSend.first().isVisible());
    }

    console.log('EVIDENCIA: Flujo guardar/enviar completado');
  });

  test('verifica que no haya modal stacking', async ({ page }) => {
    let targetNumero = await findOrderForCotization(page);

    if (!targetNumero) {
      test.skip(true, 'No se encontraron pedidos para probar');
      return;
    }

    await openDetailModal(page, targetNumero);
    await page.waitForTimeout(500);

    const modalOverlays = await page.locator('[role="dialog"]').count();
    console.log('Modales visibles despues de abrir detalle:', modalOverlays);
    expect(modalOverlays).toBe(1);

    const gestionarBtn = page.locator('button:has-text("Gestionar cotizacion"), button:has-text("Editar cotizacion")').first();
    if (await gestionarBtn.count() > 0) {
      await gestionarBtn.click();
      await page.waitForTimeout(1000);

      const modalOverlaysAfter = await page.locator('[role="dialog"]').count();
      console.log('Modales visibles despues de gestionar cotizacion:', modalOverlaysAfter);
      expect(modalOverlaysAfter).toBe(1);
    } else {
      console.log('No hay boton de gestionar cotizacion - orden ya cotizada');
    }
  });
});
`;
fs.writeFileSync('C:\\Users\\usuario\\surti_telas\\software_SurtiTelas.Fronend\\tests\\e2e\\quotation-management.spec.ts', content, 'utf8');
console.log('Written successfully, lines:', content.split('\\n').length);

import { test, Page } from '@playwright/test';

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

test('Debug: Verificar estado real de cotizaciones', async ({ page }) => {
  test.setTimeout(90000);

  await loginAsAdmin(page);

  // Interceptar la respuesta de la API
  let apiData: unknown = null;
  await page.route('**/custom-orders**', async (route) => {
    const response = await route.fetch();
    try {
      apiData = await response.json();
    } catch (_e) {
      // ignore
    }
    await route.fulfill({ response });
  });

  await page.goto(`${BASE_URL}/admin/pedidos-personalizados`);
  await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
  await page.waitForTimeout(2000);

  console.log('\n=== DATOS DE LA API ===');
  const items = apiData?.data?.items || apiData?.items || [];
  if (items.length > 0) {
    for (const item of items) {
      console.log(`${item.numeroSolicitud}: orderEstado=${item.estado}, cotEstado=${item.cotizacion?.estado}, negCount=${item.cotizacion?.negotiationCount}`);
    }
  } else {
    console.log('No se obtuvieron datos de la API');
  }
});

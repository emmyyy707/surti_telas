import { test } from '@playwright/test';
import fs from 'fs';

test('explorar formulario de cotización', async ({ page }) => {
  await page.goto('/login');
  await page.fill('input[type="email"]', 'andres.test@example.com');
  await page.fill('input[type="password"]', 'Test123456');
  await page.click('button[type="submit"]');
  await page.waitForURL('**/cliente/**');

  await page.goto('/cliente/cotizaciones/nueva');
  await page.waitForSelector('text=Paso 1');
  await page.waitForTimeout(1000);

  const html = await page.content();
  fs.writeFileSync('playwright-report/form-step1.html', html, 'utf8');

  const inputs = await page.locator('input, textarea, select').all();
  const inputInfo = [];
  for (const input of inputs) {
    const tag = await input.evaluate((el) => el.tagName);
    const type = await input.getAttribute('type');
    const name = await input.getAttribute('name');
    const placeholder = await input.getAttribute('placeholder');
    const label = await input.evaluate((el) => {
      const label = el.closest('label') || el.parentElement?.querySelector('label');
      return label?.textContent?.trim() || null;
    });
    inputInfo.push({ tag, type, name, placeholder, label });
  }
  fs.writeFileSync('playwright-report/form-inputs.json', JSON.stringify(inputInfo, null, 2), 'utf8');
});

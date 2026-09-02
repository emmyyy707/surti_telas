import { test } from '@playwright/test';
import * as fs from 'fs';

test('explorar HTML de botones clave', async ({ page }) => {
  await page.goto('/login');
  await page.fill('input[type="email"]', 'andres.test@example.com');
  await page.fill('input[type="password"]', 'Test123456');
  await page.click('button[type="submit"]');
  await page.waitForURL('**/cliente/**');

  await page.goto('/cliente/pedidos-personalizados');
  await page.waitForTimeout(2000);

  const html = await page.content();
  fs.writeFileSync('playwright-report/page.html', html, 'utf8');

  const buttons = await page.locator('button').allTextContents();
  fs.writeFileSync('playwright-report/buttons.json', JSON.stringify(buttons, null, 2), 'utf8');

  const inputs = await page.locator('input').all();
  const inputInfo = [];
  for (const input of inputs) {
    const type = await input.getAttribute('type');
    const name = await input.getAttribute('name');
    const placeholder = await input.getAttribute('placeholder');
    const id = await input.getAttribute('id');
    inputInfo.push({ type, name, placeholder, id });
  }
  fs.writeFileSync('playwright-report/inputs.json', JSON.stringify(inputInfo, null, 2), 'utf8');
});

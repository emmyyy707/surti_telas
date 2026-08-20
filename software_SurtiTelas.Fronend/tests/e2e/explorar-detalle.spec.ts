import { test, expect } from '@playwright/test';
import fs from 'fs';

test('buscar selectores de detalle y editar', async ({ page }) => {
  await page.goto('/login');
  await page.fill('input[type="email"]', 'andres.test@example.com');
  await page.fill('input[type="password"]', 'Test123456');
  await page.click('button[type="submit"]');
  await page.waitForURL('**/cliente/**');

  await page.goto('/cliente/pedidos-personalizados');
  await page.waitForTimeout(2000);

  const html = await page.content();
  fs.writeFileSync('playwright-report/detail-page.html', html, 'utf8');

  const eyeButtons = await page.locator('button:has(svg)').all();
  const eyeInfo = [];
  for (const btn of eyeButtons) {
    const aria = await btn.getAttribute('aria-label');
    const title = await btn.getAttribute('title');
    const text = await btn.textContent();
    const cls = await btn.getAttribute('class');
    if (aria || title || (text && text.includes('Ver'))) {
      eyeInfo.push({ aria, title, text: text?.trim(), cls });
    }
  }
  fs.writeFileSync('playwright-report/eye-buttons.json', JSON.stringify(eyeInfo, null, 2), 'utf8');
});

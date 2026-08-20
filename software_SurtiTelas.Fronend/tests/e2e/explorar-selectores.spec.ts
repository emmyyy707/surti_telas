import { test, expect } from '@playwright/test';

test('explorar selectores de pedidos personalizados', async ({ page }) => {
  await page.goto('/login');
  await page.fill('input[type="email"]', 'andres.test@example.com');
  await page.fill('input[type="password"]', 'Test123456');
  await page.click('button[type="submit"]');
  await page.waitForURL('**/cliente/**');

  await page.goto('/cliente/pedidos-personalizados');
  await page.waitForTimeout(2000);

  await page.screenshot({ path: 'playwright-report/explorar-pagina.png', fullPage: true });

  const buttons = await page.locator('button').allTextContents();
  console.log('BUTTONS:', JSON.stringify(buttons, null, 2));

  const inputs = await page.locator('input').all();
  const inputInfo = [];
  for (const input of inputs) {
    const type = await input.getAttribute('type');
    const name = await input.getAttribute('name');
    const placeholder = await input.getAttribute('placeholder');
    const id = await input.getAttribute('id');
    inputInfo.push({ type, name, placeholder, id });
  }
  console.log('INPUTS:', JSON.stringify(inputInfo, null, 2));

  const html = await page.content();
  const matches = html.match(/data-testid="[^"]*"/g) || [];
  console.log('DATA_TESTID:', JSON.stringify(matches, null, 2));
});

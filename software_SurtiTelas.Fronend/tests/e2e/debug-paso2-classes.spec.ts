import { test } from '@playwright/test';

test('debug paso 2 personalization button html', async ({ page }) => {
  await page.goto('/login');
  await page.fill('input[type="email"]', 'andres.test@example.com');
  await page.fill('input[type="password"]', 'Test123456');
  await page.click('button[type="submit"]');
  await page.waitForURL('**/cliente/**');

  await page.goto('/cliente/cotizaciones/nueva');
  await page.waitForSelector('text=Paso 1');
  await page.waitForTimeout(500);

  await page.fill('input[placeholder="Cliente"]', 'Andres Daniel Ruiz Murillo');
  await page.fill('input[placeholder="Teléfono"]', '3015693683');
  await page.fill('input[placeholder="Email"]', 'andres.test@example.com');

  await page.click('[data-testid="quotation-next"]');
  await page.waitForSelector('text=Paso 2');
  await page.waitForTimeout(1000);

  const count = await page.evaluate(() => {
    return document.querySelectorAll('[class*="personalization"]').length;
  });
  console.log('Elements with personalization in class:', count);
  
  const allClasses = await page.evaluate(() => {
    const classes = new Set();
    document.querySelectorAll('*').forEach(el => {
      el.classList.forEach(c => {
        if (c.includes('personalization')) classes.add(c);
      });
    });
    return Array.from(classes);
  });
  console.log('Personalization classes:', allClasses);
});

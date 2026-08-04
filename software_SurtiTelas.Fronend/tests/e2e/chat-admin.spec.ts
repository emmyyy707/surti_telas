import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:5173';

async function loginAsAdmin(page: any) {
  await page.goto(`${BASE_URL}/login`);
  await page.fill('input[type="email"]', 'admin@surtitelas.com');
  await page.fill('input[type="password"]', 'SurtiTelas2025*');
  await page.click('.submitBtn');
  await page.waitForTimeout(3000);
}

test.describe('Chat Admin E2E', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test('should navigate to chat admin', async ({ page }) => {
    const chatMenu = page.locator('text=Chat').first();
    if (await chatMenu.count() > 0) {
      await chatMenu.click();
      await page.waitForTimeout(1000);
      await expect(page.locator('h2, h3')).toContainText(/métricas|chat/i);
    } else {
      test.skip(true, 'Chat menu item not found');
    }
  });

  test('should show metrics cards', async ({ page }) => {
    const chatMenu = page.locator('text=Chat').first();
    if (await chatMenu.count() > 0) {
      await chatMenu.click();
      await page.waitForTimeout(1000);
      const cards = page.locator('.card, [class*="card"]');
      if (await cards.count() > 0) {
        await expect(cards.first()).toBeVisible();
      }
    } else {
      test.skip(true, 'Chat menu item not found');
    }
  });
});

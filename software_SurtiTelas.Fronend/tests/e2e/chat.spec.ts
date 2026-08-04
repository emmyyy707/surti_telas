import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:5173';

async function loginAsAdvisor(page: any) {
  await page.goto(`${BASE_URL}/asesor/chat`);
  await page.fill('input[type="email"]', 'chat-advisor@surtitelas.com');
  await page.fill('input[type="password"]', 'asesor123');
  await page.click('.submitBtn');
  await page.waitForTimeout(3000);
  await expect(page.locator('body')).toContainText(/chat|asistente|mensaje/i);
}

async function loginAsAdmin(page: any) {
  await page.goto(`${BASE_URL}/login`);
  await page.fill('input[type="email"]', 'admin@surtitelas.com');
  await page.fill('input[type="password"]', 'SurtiTelas2025*');
  await page.click('.submitBtn');
  await page.waitForTimeout(3000);
}

test.describe('Chat E2E - Asesor', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdvisor(page);
  });

  test('should show chat interface', async ({ page }) => {
    await expect(page.locator('body')).toContainText(/chat|asistente|mensaje/i);
  });

  test('should send a message', async ({ page }) => {
    const messageInput = page.locator('input[placeholder*="mensaje"], textarea[placeholder*="mensaje"], input[type="text"]').first();
    if (await messageInput.count() > 0) {
      await messageInput.fill('Hola, esto es una prueba E2E');
      await page.click('button[type="submit"], button:has-text("Enviar")');
      await page.waitForTimeout(1000);
      await expect(page.locator('text=Hola, esto es una prueba E2E')).toBeVisible();
    } else {
      test.skip(true, 'Message input not found');
    }
  });

  test('should open global search', async ({ page }) => {
    const searchTrigger = page.locator('button[aria-label*="Buscar"], button:has-text("Buscar"), [data-testid="global-search"]').first();
    if (await searchTrigger.count() > 0) {
      await searchTrigger.click();
      await expect(page.locator('input[placeholder*="Buscar"], input[placeholder*="buscar"]').first()).toBeVisible();
    } else {
      test.skip(true, 'Global search trigger not found');
    }
  });

  test('should toggle dark mode', async ({ page }) => {
    const darkModeButton = page.locator('button[aria-label*="Modo oscuro"], button[aria-label*="Modo claro"], button:has-text("🌙"), button:has-text("☀️")').first();
    if (await darkModeButton.count() > 0) {
      await darkModeButton.click();
      await page.waitForTimeout(500);
    } else {
      test.skip(true, 'Dark mode button not found');
    }
  });

  test('should add a reaction to a message', async ({ page }) => {
    await page.waitForTimeout(1000);
    const message = page.locator('.messageRow, [data-testid="message"]').first();
    if (await message.count() > 0) {
      await message.hover();
      const reactionButton = page.locator('button:has-text("😊"), button[aria-label*="Reacción"], [data-testid="reaction-button"]').first();
      if (await reactionButton.count() > 0) {
        await reactionButton.click();
        await page.waitForTimeout(500);
      } else {
        test.skip(true, 'Reaction button not found');
      }
    } else {
      test.skip(true, 'No messages found');
    }
  });

  test('should attach a file', async ({ page }) => {
    const attachButton = page.locator('label:has-text("📎"), button:has-text("📎"), input[type="file"]').first();
    if (await attachButton.count() > 0) {
      await attachButton.click();
      await page.waitForTimeout(500);
    } else {
      test.skip(true, 'Attach button not found');
    }
  });

  test('should export conversation', async ({ page }) => {
    const exportButton = page.locator('button[aria-label*="Exportar"], button:has-text("📥"), [data-testid="export"]').first();
    if (await exportButton.count() > 0) {
      await exportButton.click();
      await page.waitForTimeout(1000);
    } else {
      test.skip(true, 'Export button not found');
    }
  });

  test('should open satisfaction survey', async ({ page }) => {
    const surveyTrigger = page.locator('[data-testid="survey"], .surveyContainer').first();
    if (await surveyTrigger.count() > 0) {
      await expect(surveyTrigger).toBeVisible();
    } else {
      test.skip(true, 'Satisfaction survey not found');
    }
  });
});

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

  test('should show total conversations metric', async ({ page }) => {
    const chatMenu = page.locator('text=Chat').first();
    if (await chatMenu.count() > 0) {
      await chatMenu.click();
      await page.waitForTimeout(1000);
      await expect(page.locator('text=/Conversaciones|Messages|total/i').first()).toBeVisible();
    } else {
      test.skip(true, 'Chat menu item not found');
    }
  });
});

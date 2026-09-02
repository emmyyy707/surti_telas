# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: custom-order-edit.spec.ts >> Custom order EDIT flow (second reference image) >> edit existing order, add second image, persist both
- Location: tests\e2e\custom-order-edit.spec.ts:16:3

# Error details

```
TimeoutError: page.waitForSelector: Timeout 15000ms exceeded.
Call log:
  - waiting for locator('tbody tr:has(td)') to be visible

```

# Page snapshot

```yaml
- generic [ref=f1e2]:
  - region "Notifications alt+T"
```

# Test source

```ts
  1   | import { test, expect } from '@playwright/test';
  2   | 
  3   | const TEST_EMAIL = 'andres.test@example.com';
  4   | const TEST_PASSWORD = 'Test123456';
  5   | const TARGET_NUMERO = 'SOL-0026';
  6   | 
  7   | test.describe('Custom order EDIT flow (second reference image)', () => {
  8   |   test.beforeEach(async ({ page }) => {
  9   |     await page.goto('/login');
  10  |     await page.fill('input[type="email"]', TEST_EMAIL);
  11  |     await page.fill('input[type="password"]', TEST_PASSWORD);
  12  |     await page.click('button[type="submit"]');
  13  |     await page.waitForURL('**/cliente/**');
  14  |   });
  15  | 
  16  |   test('edit existing order, add second image, persist both', async ({ page }) => {
  17  |     test.setTimeout(120000);
  18  |     const evidence: Record<string, unknown> = {};
  19  | 
  20  |     await page.goto('/cliente/pedidos-personalizados');
> 21  |     await page.waitForSelector('tbody tr:has(td)', { timeout: 15000 });
      |                ^ TimeoutError: page.waitForSelector: Timeout 15000ms exceeded.
  22  | 
  23  |     await page.locator('input[placeholder*="solicitud"]').first().fill(TARGET_NUMERO);
  24  |     await page.waitForTimeout(800);
  25  |     const targetRow = page.locator('tbody tr', { hasText: TARGET_NUMERO }).first();
  26  |     await expect(targetRow).toBeVisible({ timeout: 10000 });
  27  | 
  28  |     await targetRow.click({ force: true });
  29  |     await page.waitForTimeout(1000);
  30  |     const detailImgBefore = page.locator('img[alt*="Referencia"]');
  31  |     await expect(detailImgBefore.first()).toBeVisible({ timeout: 10000 });
  32  |     const existingSrc = await detailImgBefore.first().getAttribute('src');
  33  |     evidence.existingImageSrcBeforeEdit = existingSrc;
  34  |     evidence.existingImageIsBlob = (existingSrc || '').startsWith('blob:');
  35  |     console.log('EXISTING IMAGE BEFORE EDIT:', existingSrc);
  36  | 
  37  |     const closeBtn = page.locator('button[aria-label="Cerrar"]').last();
  38  |     if (await closeBtn.count() > 0) {
  39  |       await closeBtn.click();
  40  |       await page.waitForTimeout(500);
  41  |     }
  42  | 
  43  |     const actionBtn = page.locator('[aria-label="Abrir menÃ©n de acciones"]').first();
  44  |     await expect(actionBtn).toBeVisible({ timeout: 10000 });
  45  |     await actionBtn.click({ force: true });
  46  |     await page.waitForTimeout(500);
  47  |     const editBtn = page.locator('text=Editar');
  48  |     await expect(editBtn).toBeVisible({ timeout: 10000 });
  49  |     await editBtn.click();
  50  |     await page.waitForTimeout(1000);
  51  | 
  52  |     await page.waitForSelector('text=Paso 1', { timeout: 10000 });
  53  |     const clientName = await page.locator('input[placeholder="Cliente"]').inputValue();
  54  |     evidence.clientNameLoaded = clientName;
  55  |     console.log('CLIENT NAME LOADED:', clientName);
  56  | 
  57  |     await page.click('[data-testid="quotation-next"]');
  58  |     await page.waitForSelector('text=Paso 2');
  59  |     await page.waitForTimeout(500);
  60  | 
  61  |     const editPersBtn = page.locator('button:has-text("Editar")').filter({ has: page.locator('visible=true') }).first();
  62  |     await expect(editPersBtn).toBeVisible({ timeout: 10000 });
  63  |     await editPersBtn.click();
  64  |     await page.waitForTimeout(800);
  65  | 
  66  |     const previewBefore = page.locator('img[alt*="Referencia"]');
  67  |     const previewBeforeCount = await previewBefore.count();
  68  |     evidence.previewCountBeforeSecondImage = previewBeforeCount;
  69  |     if (previewBeforeCount > 0) {
  70  |       const src0 = await previewBefore.first().getAttribute('src');
  71  |       evidence.existingImageInEditFormSrc = src0;
  72  |       evidence.existingImageInEditFormIsBlob = (src0 || '').startsWith('blob:');
  73  |       console.log('EXISTING IMAGE IN EDIT FORM:', src0);
  74  |     }
  75  | 
  76  |     const fileInput = page.locator('[data-testid="reference-image-input"]');
  77  |     await expect(fileInput).toBeVisible({ timeout: 10000 });
  78  |     await fileInput.setInputFiles('src/assets/images/logos/partner-logo-1.png');
  79  |     await page.waitForTimeout(800);
  80  | 
  81  |     const previewAfter = page.locator('img[alt*="Referencia"]');
  82  |     const previewAfterCount = await previewAfter.count();
  83  |     evidence.previewCountAfterSecondImage = previewAfterCount;
  84  |     const srcs: string[] = [];
  85  |     for (let i = 0; i < previewAfterCount; i++) {
  86  |       srcs.push((await previewAfter.nth(i).getAttribute('src')) || '');
  87  |     }
  88  |     evidence.previewSrcsAfterSecondImage = srcs;
  89  |     evidence.secondImageIsBlobPreview = srcs.some((s) => s.startsWith('blob:'));
  90  |     console.log('PREVIEW SRCS AFTER SECOND IMAGE:', JSON.stringify(srcs));
  91  | 
  92  |     const savePersBtn = page.locator('button:has-text("Guardar personalizaciÃ³n")').first();
  93  |     await expect(savePersBtn).toBeVisible({ timeout: 10000 });
  94  |     await savePersBtn.click();
  95  |     await page.waitForTimeout(500);
  96  | 
  97  |     await page.click('[data-testid="quotation-next"]');
  98  |     await page.waitForSelector('text=Paso 3');
  99  |     await page.waitForTimeout(500);
  100 |     await page.click('[data-testid="quotation-next"]');
  101 |     await page.waitForSelector('text=Paso 4');
  102 |     await page.waitForTimeout(500);
  103 | 
  104 |     const summaryImgs = page.locator('img[alt*="Referencia"]');
  105 |     const summaryCount = await summaryImgs.count();
  106 |     evidence.summaryImageCount = summaryCount;
  107 |     const summarySrcs: string[] = [];
  108 |     for (let i = 0; i < summaryCount; i++) {
  109 |       summarySrcs.push((await summaryImgs.nth(i).getAttribute('src')) || '');
  110 |     }
  111 |     evidence.summarySrcs = summarySrcs;
  112 |     console.log('SUMMARY SRCS:', JSON.stringify(summarySrcs));
  113 | 
  114 |     await page.click('[data-testid="quotation-submit"]');
  115 |     await page.waitForTimeout(6000);
  116 | 
  117 |     const toast = page.locator('text=Solicitud actualizada').first();
  118 |     evidence.updateToastVisible = await toast.count() > 0;
  119 |     console.log('UPDATE TOAST VISIBLE:', evidence.updateToastVisible);
  120 | 
  121 |     await page.waitForTimeout(1000);
```
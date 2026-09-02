import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  console.log('Navigating to frontend...');
  await page.goto('http://localhost:5173');
  console.log('Page title:', await page.title());
  
  console.log('Taking screenshot...');
  await page.screenshot({ path: 'C:\\Users\\usuario\\AppData\\Local\\Temp\\kilo\\frontend-home.png' });
  
  await browser.close();
  console.log('Done');
})();

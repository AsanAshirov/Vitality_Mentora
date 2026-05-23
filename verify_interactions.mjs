import { chromium } from 'playwright';

const browser = await chromium.launch({ headless: true });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();

// Capture console errors
const errors = [];
page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text().slice(0,200)); });
page.on('pageerror', e => errors.push('PAGE_ERROR: ' + e.message.slice(0,200)));

page.setDefaultTimeout(10000);

const results = [];

// Test 1: Sidebar has nav links
await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
await page.waitForTimeout(600);
const navLinks = await page.$$('nav a, .nav-item, button[class*="nav"]');
const sidebarHtml = await page.evaluate(() => document.querySelector('.sidebar')?.innerHTML?.slice(0,200) ?? 'NO .sidebar');
const allButtons = await page.$$('button');
results.push(`Sidebar nav: navLinks=${navLinks.length} allButtons=${allButtons.length} sidebarExists="${sidebarHtml.slice(0,80)}"`);

// Test 2: Screenshot the actual render
await page.screenshot({ path: 'verify_dashboard.png', fullPage: false });

// Test 3: Click on Simulator in sidebar (if it exists)
try {
  const simBtn = await page.locator('text=Симулятор').first();
  await simBtn.click({ timeout: 3000 });
  await page.waitForTimeout(600);
  const url = page.url();
  results.push(`Nav click Симулятор → url=${url}`);
} catch(e) {
  results.push(`Nav click failed: ${e.message.slice(0,100)}`);
}

// Test 4: On KYC page, check the step buttons work
await page.goto('http://localhost:5173/simulator/kyc', { waitUntil: 'networkidle' });
await page.waitForTimeout(600);
const stepNextBtn = await page.locator('button:has-text("Шаг выполнен"), button:has-text("Далее"), button:has-text("выполнен")').first();
const stepBtnExists = await stepNextBtn.count() > 0;
results.push(`KYC next-step button exists=${stepBtnExists}`);

if (stepBtnExists) {
  await stepNextBtn.click({ timeout: 3000 });
  await page.waitForTimeout(600);
  const steps = await page.$$('.step');
  results.push(`After clicking next: steps=${steps.length}`);
}
await page.screenshot({ path: 'verify_kyc.png' });

// Test 5: Check tasks page has start buttons
await page.goto('http://localhost:5173/tasks', { waitUntil: 'networkidle' });
await page.waitForTimeout(600);
const startBtns = await page.locator('button:has-text("Начать"), button:has-text("Повторить")').count();
results.push(`Tasks start buttons=${startBtns}`);
await page.screenshot({ path: 'verify_tasks.png' });

// Test 6: Check settings language toggle
await page.goto('http://localhost:5173/settings', { waitUntil: 'networkidle' });
await page.waitForTimeout(600);
const langBtns = await page.locator('button:has-text("UZ"), button:has-text("EN"), [data-lang]').count();
results.push(`Settings language buttons=${langBtns}`);
await page.screenshot({ path: 'verify_settings.png' });

// Test 7: Messages — check chat renders
await page.goto('http://localhost:5173/messages', { waitUntil: 'networkidle' });
await page.waitForTimeout(600);
const msgInput = await page.locator('textarea, input[placeholder*="сообщ"], input[placeholder*="Написать"]').count();
results.push(`Messages compose input=${msgInput}`);
await page.screenshot({ path: 'verify_messages.png' });

await browser.close();

console.log('\n=== INTERACTION RESULTS ===');
for (const r of results) console.log(' •', r);
console.log('\n=== CONSOLE ERRORS ===');
if (errors.length === 0) console.log(' ✅ No console errors');
else errors.forEach(e => console.log(' ❌', e));

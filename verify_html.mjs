import { chromium } from 'playwright';
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
await page.waitForTimeout(600);
const html = await page.evaluate(() => document.querySelector('#root')?.innerHTML?.slice(0, 2000));
console.log(html);
await browser.close();

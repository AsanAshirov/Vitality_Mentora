import { chromium } from 'playwright';

const browser = await chromium.launch({ headless: true });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();
page.setDefaultTimeout(12000);

const results = [];

async function check(label, url, fn) {
  try {
    await page.goto('http://localhost:5173' + url, { waitUntil: 'networkidle', timeout: 10000 });
    await page.waitForTimeout(800);
    const result = await fn(page);
    await page.screenshot({ path: `verify_ss_${label}.png` });
    results.push({ label, ok: true, detail: result });
  } catch(e) {
    results.push({ label, ok: false, detail: e.message.slice(0,300) });
  }
}

await check('01_dashboard', '/', async p => {
  const sidebar = await p.$('.sidebar');
  const h1 = await p.$('h1, h2');
  const h1Text = h1 ? (await h1.textContent()).trim().slice(0,40) : 'none';
  const scenarioEls = await p.$$('.scenario');
  const statEls = await p.$$('.stat');
  return `sidebar=${!!sidebar} h1="${h1Text}" scenarios=${scenarioEls.length} stats=${statEls.length}`;
});

await check('02_kyc', '/simulator/kyc', async p => {
  const simSide = await p.$('.sim-side');
  const steps = await p.$$('.step');
  const card = await p.$('.crm-card');
  return `sim-side=${!!simSide} steps=${steps.length} card=${!!card}`;
});

await check('03_tasks', '/tasks', async p => {
  const text = await p.textContent('body');
  return `hasTasks=${text.includes('T-2148') || text.includes('KYC')} bodyLen=${text.length}`;
});

await check('04_messages', '/messages', async p => {
  const text = await p.textContent('body');
  return `hasMsgs=${text.includes('Татьяна') || text.includes('Ольга')} bodyLen=${text.length}`;
});

await check('05_handbook', '/simulator/handbook', async p => {
  const text = await p.textContent('body');
  return `hasContent=${text.includes('KYC') || text.includes('§')} bodyLen=${text.length}`;
});

await check('06_settings', '/settings', async p => {
  const text = await p.textContent('body');
  return `hasSettings=${text.includes('Язык') || text.includes('Аккаунт')} bodyLen=${text.length}`;
});

await check('07_badges', '/badges', async p => {
  const text = await p.textContent('body');
  return `hasBadges=${text.includes('KYC') || text.includes('Серия')} bodyLen=${text.length}`;
});

await check('08_profile', '/profile', async p => {
  const text = await p.textContent('body');
  return `hasProfile=${text.includes('XP') || text.includes('Алексей')} bodyLen=${text.length}`;
});

await browser.close();

let pass = 0, fail = 0;
for (const r of results) {
  const icon = r.ok ? '✅' : '❌';
  console.log(`${icon} ${r.label}: ${r.detail}`);
  r.ok ? pass++ : fail++;
}
console.log(`\n--- ${pass}/${pass+fail} PASSED ---`);

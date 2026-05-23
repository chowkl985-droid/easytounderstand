const puppeteer = require('puppeteer');
const path = require('path');

const BASE = 'http://localhost:8080';
const SCREENSHOTS_DIR = path.join(__dirname, 'screenshots');

async function screenshot(page, name) {
  const filepath = path.join(SCREENSHOTS_DIR, name);
  await page.screenshot({ path: filepath, fullPage: false });
  console.log('  Saved: ' + name);
}

(async () => {
  const fs = require('fs');
  if (!fs.existsSync(SCREENSHOTS_DIR)) fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });

  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });

  // 1. Main page - paste mode
  console.log('Capturing screenshots...');
  await page.goto(BASE + '/', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 500));
  await screenshot(page, '01-main-interface.png');

  // 2. Main page with sample text loaded
  await page.evaluate(() => {
    const btn = document.querySelector('#sampleBtn');
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 300));
  await screenshot(page, '02-text-parsed.png');

  // 3. Pro activation modal
  await page.evaluate(() => {
    const modal = document.querySelector('#activateModal');
    if (modal) { modal.classList.add('show'); }
  });
  await new Promise(r => setTimeout(r, 300));
  await screenshot(page, '03-pro-activation.png');

  // 4. PDF page
  await page.goto(BASE + '/pdf.html', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 500));
  await screenshot(page, '04-pdf-interface.png');

  // 5. Dark mode main page
  await page.goto(BASE + '/', { waitUntil: 'networkidle2' });
  await page.evaluate(() => {
    document.documentElement.setAttribute('data-theme', 'dark');
  });
  await new Promise(r => setTimeout(r, 300));
  await screenshot(page, '05-dark-mode.png');

  await browser.close();
  console.log('\nDone! Screenshots saved to screenshots/');
})();

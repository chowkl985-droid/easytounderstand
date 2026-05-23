const puppeteer = require('puppeteer');
const path = require('path');

const BASE = 'http://localhost:8080';
const SCREENSHOTS_DIR = path.join(__dirname, 'screenshots');

(async () => {
  const fs = require('fs');
  if (!fs.existsSync(SCREENSHOTS_DIR)) fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });

  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });

  // Cover: 1280x720
  console.log('Capturing cover (1280x720)...');
  const coverPage = await browser.newPage();
  await coverPage.setViewport({ width: 1280, height: 720, deviceScaleFactor: 1 });
  await coverPage.goto(BASE + '/cover.html', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 500));
  await coverPage.screenshot({ path: path.join(SCREENSHOTS_DIR, 'cover-1280x720.png') });
  console.log('  Saved: cover-1280x720.png');

  // Thumbnail: 600x600
  console.log('Capturing thumbnail (600x600)...');
  const thumbPage = await browser.newPage();
  await thumbPage.setViewport({ width: 600, height: 600, deviceScaleFactor: 1 });
  await thumbPage.goto(BASE + '/thumbnail.html', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 500));
  await thumbPage.screenshot({ path: path.join(SCREENSHOTS_DIR, 'thumbnail-600x600.png') });
  console.log('  Saved: thumbnail-600x600.png');

  await browser.close();
  console.log('\nDone!');
})();

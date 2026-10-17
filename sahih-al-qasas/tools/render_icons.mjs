import fs from 'node:fs';
import pw from '/tmp/opencode/node_modules/playwright/index.js';
const { chromium } = pw;
const base = new URL('..', import.meta.url).pathname;
let svg = fs.readFileSync(base + 'icon.svg', 'utf8');
if (!/width="/.test(svg)) {
  svg = svg.replace('<svg ', '<svg width="512" height="512" ');
}
const browser = await chromium.launch({ headless: true });
for (const size of [192, 512]) {
  const page = await browser.newPage({ viewport: { width: size, height: size }, deviceScaleFactor: 1 });
  await page.setContent('<html><body style="margin:0;background:transparent">' +
    svg.replace('width="512" height="512"', `width="${size}" height="${size}"`) + '</body></html>');
  await page.screenshot({ path: `${base}icon-${size}.png`, omitBackground: true });
  await page.close();
  console.log('wrote', `icon-${size}.png`);
}
await browser.close();

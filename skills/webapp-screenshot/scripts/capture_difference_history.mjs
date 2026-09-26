import { chromium } from 'playwright';

const [url, output] = process.argv.slice(2);
if (!url || !output) {
  throw new Error('Usage: node capture_difference_history.mjs URL OUTPUT');
}

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({
  viewport: { width: 2400, height: 1000 },
  deviceScaleFactor: 2,
});

await page.goto(url, { waitUntil: 'networkidle' });
const section = page.locator('section.stages-section');
const copyToggle = section.locator('input[type="checkbox"]').first();
if (await copyToggle.isChecked()) await copyToggle.uncheck();

await page.addStyleTag({
  content: '.stage-list { flex-direction: row !important; flex-wrap: nowrap !important; align-items: flex-start !important; }',
});

const cards = section.locator('.stage-card');
const boxes = await cards.evaluateAll((elements) => elements.map((element) => {
  const rect = element.getBoundingClientRect();
  return {
    x: rect.x + window.scrollX,
    y: rect.y + window.scrollY,
    right: rect.right + window.scrollX,
    bottom: rect.bottom + window.scrollY,
  };
}));
if (boxes.length === 0) throw new Error('No difference cards found: .stage-card');

const padding = 12;
const left = Math.min(...boxes.map(({ x }) => x)) - padding;
const top = Math.min(...boxes.map(({ y }) => y)) - padding;
const right = Math.max(...boxes.map(({ right }) => right)) + padding;
const bottom = Math.max(...boxes.map(({ bottom }) => bottom)) + padding;

await page.screenshot({
  path: output,
  fullPage: true,
  clip: { x: left, y: top, width: right - left, height: bottom - top },
});
await browser.close();

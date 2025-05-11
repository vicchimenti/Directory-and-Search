const { chromium } = require('playwright');

const searchTerms = [
  "biology", "nursing", "library", "tuition", "transcripts", "registrar",
  "parking", "psychology", "scholarships", "study abroad",
  // Add as many terms as you'd like
];

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  for (const term of searchTerms) {
    await page.goto('https://www.seattleu.edu/search/', { waitUntil: 'domcontentloaded' });

    const input = await page.locator('#autocomplete-concierge-inputField');
    await input.fill(''); // Clear previous
    await input.type(term, { delay: 100 }); // Simulate typing

    // Wait for suggestions to be fetched and cache to warm
    await page.waitForTimeout(1500);

    console.log(`✔ Wrote: ${term}`);

    await page.waitForTimeout(500); // Small gap before next term
  }

  await browser.close();
})();

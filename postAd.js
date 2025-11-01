const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: false }); // show browser
  const page = await browser.newPage();
  
  // Go to eBay Kleinanzeigen
  await page.goto('https://www.kleinanzeigen.de/m-einloggen.html', { waitUntil: 'networkidle2' });

  // Wait and type your email
  await page.type('#login-email', 'ni448482@gmail.com');
  
  // Wait and type your password
  await page.type('#login-password', 'Raju54321*');

  // Click login
  await page.click('button[type="submit"]');
  
  // Wait for navigation
  await page.waitForNavigation();

  // Visit the "post ad" page
  await page.goto('https://www.kleinanzeigen.de/p-anzeige-aufgeben.html');

  // Pause here so we can test login
  await page.waitForTimeout(10000); // 10 seconds to look

  await browser.close();
})();

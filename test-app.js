// Manual Playwright Test Script for Curatos
// Run with: node test-app.js

const { chromium } = require('playwright');

(async () => {
  console.log('🚀 Starting Playwright test...\n');
  
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    // Step 1: Navigate
    console.log('1️⃣ Navigating to http://localhost:5001');
    await page.goto('http://localhost:5001');
    await page.waitForLoadState('networkidle');
    console.log('✅ Page loaded\n');
    
    // Step 2: Take snapshot
    console.log('2️⃣ Taking initial snapshot');
    await page.screenshot({ path: 'test-step1-initial.png', fullPage: true });
    console.log('✅ Snapshot saved: test-step1-initial.png\n');
    
    // Step 3: Enter API key
    console.log('3️⃣ Entering API key');
    const apiKeyInput = await page.locator('input[type="password"][placeholder*="OpenRouter"]');
    await apiKeyInput.fill('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');
    console.log('✅ API key entered\n');
    
    // Step 4: Click Connect
    console.log('4️⃣ Clicking Connect button');
    const connectButton = await page.locator('button:has-text("Connect")');
    await connectButton.click();
    await page.waitForTimeout(3000); // Wait for connection
    console.log('✅ Connect clicked\n');
    
    // Check if connected
    const isConnected = await page.locator('text=API Connected').isVisible().catch(() => false);
    if (isConnected) {
      console.log('✅ API Connected successfully\n');
    } else {
      console.log('⚠️  API connection status unclear\n');
    }
    
    await page.screenshot({ path: 'test-step2-connected.png', fullPage: true });
    
    // Step 5: Enter niche
    console.log('5️⃣ Entering niche: fintech');
    const nicheInput = await page.locator('input[placeholder*="niche"]');
    await nicheInput.fill('fintech');
    console.log('✅ Niche entered\n');
    
    // Step 6: Click START ENGINE
    console.log('6️⃣ Clicking START ENGINE button');
    const startButton = await page.locator('button:has-text("START")');
    await startButton.click();
    console.log('✅ START ENGINE clicked\n');
    
    await page.screenshot({ path: 'test-step3-started.png', fullPage: true });
    
    // Step 7: Wait for research
    console.log('7️⃣ Waiting 15 seconds for research to generate...');
    await page.waitForTimeout(15000);
    console.log('✅ Wait complete\n');
    
    // Step 8: Take final screenshot
    console.log('8️⃣ Taking final screenshot');
    await page.screenshot({ path: 'test-step4-results.png', fullPage: true });
    console.log('✅ Screenshot saved: test-step4-results.png\n');
    
    // Step 9: Verify URLs
    console.log('9️⃣ Checking for real URLs (not example.com)');
    const pageContent = await page.content();
    
    const hasExampleUrls = pageContent.includes('example.com');
    const hasRealUrls = /https?:\/\/(?!example\.com)[a-z0-9-]+\.[a-z]{2,}/i.test(pageContent);
    
    console.log(`   - Contains example.com: ${hasExampleUrls ? '❌ YES (bad)' : '✅ NO (good)'}`);
    console.log(`   - Contains real URLs: ${hasRealUrls ? '✅ YES (good)' : '❌ NO (bad)'}`);
    
    // Check for hypothesis cards
    const hypothesisCards = await page.locator('[class*="hypothesis"]').count();
    console.log(`   - Hypothesis cards found: ${hypothesisCards}\n`);
    
    console.log('✅ Test complete! Check the screenshots for visual verification.');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    await page.screenshot({ path: 'test-error.png', fullPage: true });
  } finally {
    await browser.close();
  }
})();

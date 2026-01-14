const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    console.log('Step 1: Navigating to http://localhost:5001');
    await page.goto('http://localhost:5001');
    await page.waitForLoadState('networkidle');
    
    console.log('Step 2: Taking initial snapshot');
    await page.screenshot({ path: 'step2-initial.png', fullPage: true });
    console.log('✓ Initial snapshot saved as step2-initial.png');
    
    console.log('Step 3: Finding API key input and entering key');
    const apiKeyInput = await page.locator('input[placeholder*="API"], input[type="password"], input[placeholder*="key"]').first();
    if (await apiKeyInput.count() > 0) {
      await apiKeyInput.fill('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');
      console.log('✓ API key entered');
    } else {
      console.log('⚠ No API key input found');
    }
    
    console.log('Step 4: Clicking Connect button');
    const connectBtn = await page.locator('button:has-text("Connect"), button:has-text("CONNECT")').first();
    if (await connectBtn.count() > 0) {
      await connectBtn.click();
      await page.waitForTimeout(2000);
      console.log('✓ Connect button clicked');
    } else {
      console.log('⚠ No Connect button found');
    }
    
    console.log('Step 5: Looking for niche display (may be preset to FINTECH)');
    const nicheText = await page.locator('text=/FINTECH|fintech/i').first();
    if (await nicheText.count() > 0) {
      console.log('✓ Niche already set to FINTECH');
    } else {
      console.log('⚠ No FINTECH niche found - checking for editable input');
      const editableInput = await page.locator('input[type="text"]:not([type="password"])').first();
      if (await editableInput.count() > 0) {
        await editableInput.fill('fintech');
        console.log('✓ Niche input filled with "fintech"');
      }
    }
    
    console.log('Step 6: Clicking START ENGINE button');
    const startBtn = await page.locator('button:has-text("START ENGINE"), button:has-text("Start Engine")').first();
    if (await startBtn.count() > 0) {
      await startBtn.click();
      console.log('✓ START ENGINE clicked');
    } else {
      console.log('⚠ No START ENGINE button found');
    }
    
    console.log('Step 7: Waiting 15 seconds for research generation');
    await page.waitForTimeout(15000);
    
    console.log('Step 8: Taking final screenshot');
    await page.screenshot({ path: 'step8-results.png', fullPage: true });
    console.log('✓ Results screenshot saved as step8-results.png');
    
    console.log('Step 9: Verifying real URLs appear');
    const pageContent = await page.content();
    const hasRealUrls = !pageContent.includes('example.com') && 
                       (pageContent.includes('http') || pageContent.includes('www.'));
    
    console.log('\n=== FINAL REPORT ===');
    console.log('UI Elements Found:');
    console.log(`- API Key Input: ${await apiKeyInput.count() > 0 ? '✓' : '✗'}`);
    console.log(`- Connect Button: ${await connectBtn.count() > 0 ? '✓' : '✗'}`);
    console.log(`- Niche Input: ${await nicheInput.count() > 0 ? '✓' : '✗'}`);
    console.log(`- START ENGINE: ${await startBtn.count() > 0 ? '✓' : '✗'}`);
    console.log(`- Real URLs Present: ${hasRealUrls ? '✓' : '✗'}`);
    
    // Check for hypothesis cards
    const hypothesisCards = await page.locator('[class*="hypothesis"], [class*="card"], div:has-text("%")').count();
    console.log(`- Hypothesis Cards: ${hypothesisCards} found`);
    
    // Check for errors
    const errors = await page.locator('text=/error|Error|ERROR/i').count();
    console.log(`- Errors Visible: ${errors} found`);
    
  } catch (error) {
    console.error('Test failed:', error.message);
  } finally {
    await browser.close();
  }
})();
const { chromium } = require('playwright');

(async () => {

    const stockName = process.argv[2];
    let browser;

    try {
        browser = await chromium.launch({
            headless: true,
            args: ['--no-sandbox']
        });

        const page = await browser.newPage();

        await page.goto('https://groww.in/stocks', {
            waitUntil: 'domcontentloaded',
            timeout: 60000
        });

        await page.getByText('Search Groww....').click();
        await page.waitForTimeout(1000);
        await page.getByRole('textbox', {
            name: 'Search Groww....'
        }).fill(stockName);

        await page.waitForTimeout(1000);

        await page.keyboard.press('Enter');

        const stockElement = page.locator(
            'span.bodyBase.contentSecondary span'
        ).first();

        let tradingSymbol = await stockElement.textContent();

        tradingSymbol = tradingSymbol
            .replace('•', '')
            .trim();

        console.log(JSON.stringify({
            status: 'success',
            symbol: tradingSymbol
        }));

        await browser.close();
    } catch (error) {
        if (browser) {
            await browser.close();
        }

        console.log(JSON.stringify({
            status: 'error',
            message: error.message,
            symbol: ''
        }));
        process.exit(1);
    }

})();

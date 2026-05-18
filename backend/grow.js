const { chromium } = require('playwright');

(async () => {
    let browser;

    try {
        browser = await chromium.launch({
            headless: true,
            args: ['--no-sandbox']
        });

        const page = await browser.newPage();

        await page.goto('https://groww.in/stocks/intraday', {
            waitUntil: 'domcontentloaded',
            timeout: 60000
        });

        // =========================
        // APPLY FILTERS
        // =========================

        await page.getByText('Price change >1%').first().click();

        await page
            .locator('div')
            .filter({ hasText: /^Price change >1%$/ })
            .nth(1)
            .click();

        await page
            .locator('div')
            .filter({ hasText: /^Price change >1%$/ })
            .nth(1)
            .click();

        await page.getByText('Today').nth(1).click();

        await page.waitForTimeout(1000);

        // SORT COLUMN
        await page.locator('th:nth-child(5) > .flex > svg').click();
        await page.locator('th:nth-child(5) > .flex > svg').click();

        await page.waitForSelector('table tbody tr');

        await page.waitForTimeout(1000);

        // =========================
        // GET ONLY TOP 15 ROWS
        // =========================

        const tableData = await page.$$eval(
            'table tbody tr',
            rows => {

                return rows
                    .slice(0, 15)
                    .map(row => {

                        const cols = Array.from(
                            row.querySelectorAll('td')
                        ).map(td => td.innerText.trim()).filter(Boolean);

                        const stockText = cols[0] || '';
                        const stockParts = stockText
                            .split('\n')
                            .map(part => part.trim())
                            .filter(Boolean);

                        return {
                            stock: stockText,
                            symbol: stockParts[stockParts.length - 1] || stockText,
                            ltp: cols[1] || '',
                            change: cols[2] || '',
                            volume: cols[3] || '',
                            extra: cols[4] || ''
                        };

                    });

            }
        );

        console.log(JSON.stringify({
            status: 'success',
            data: tableData
        }));

        await browser.close();
    } catch (error) {
        if (browser) {
            await browser.close();
        }

        console.log(JSON.stringify({
            status: 'error',
            message: error.message,
            data: []
        }));
        process.exit(1);
    }

})();

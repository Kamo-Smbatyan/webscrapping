import { timeout } from "puppeteer";
import { connect } from "puppeteer-real-browser";
import dotenv from "dotenv"

dotenv.config();

let i = 0;
let manualCloseDetected = false;

while (!manualCloseDetected) {
    const success = await (async () => {
        let wasProgrammaticallyClosed = false;

        var { page, browser, setTarget } = await connect({
            turnstile: true,
            proxy: {
                host: process.env.PROXY_HOST,
                port: process.env.PROXY_PORT,
                username: process.env.PROXY_USER,
                password: process.env.PROXY_PASSWORD
            }
        });

        console.log("Browser Launched");
        setTarget({ status: true });

        // Event listener for browser disconnect
        browser.on('disconnected', () => {
            if (!wasProgrammaticallyClosed) {
                console.log('Browser was closed manually.');
                manualCloseDetected = true;
            }
        });

        try {
            setTarget({ status: false });
            //await getIP(page, i + 1, 1);
            await setBrowser(page);
            //await getIP(page, i + 1, 2);
        } catch (error) {
            console.error('Error in main function:', error);
        } finally {
            wasProgrammaticallyClosed = true;
            await browser.close();
        }

        return false;
    })();

    i++;
}

async function getIP(page,iter, order) {
    try {
        await page.goto('http://httpbin.org/ip', { waitUntil: 'networkidle2' });
        const content = await page.content();
        const ip = content.match(/"origin": "(.*?)"/)[1];
        console.log(iter,"::", `IP Address: ${ip}`,"-order::",order);
    } catch (error) {
        console.error('Error fetching IP:', error);
    }
}

async function setBrowser(page) {
    try {
        await page.goto( process.env.TARGET_URL + '/' + process.env.TARGET_CHAIN + '/' +  process.env.TARGET_TOKEN, 
            {
                waitUntil: 'networkidle2',
                timeout: 60000 // Set timeout to 60 seconds
            }
        );
        console.log('Navigated to page');
        await page.waitForSelector('#tv-chart-container', { timeout: 60000 });
        await page.waitForSelector('#tv-chart-container iframe', { state: 'attached' });
        console.log('IFrame Loaded');
        await page.waitForSelector('div.chakra-button__group.custom-ndy15h', { state: 'attached' });
        console.log("Div Loaded");
    } catch (error) {
        console.error('Error in setBrowser:',"Browser closed");
    }

    try {
        await page.evaluate(() => {
            const button = document.querySelector('div.chakra-button__group.custom-ndy15h button');
            if (button) {
                button.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
            } else {
                console.error('Button not found');
            }
        });

        await page.evaluate(() => new Promise(resolve => setTimeout(resolve, 1000)));
        const boundingBox = await page.evaluate(() => {
            const button = document.querySelector('div.chakra-button__group.custom-ndy15h button');
            if (button) {
                const rect = button.getBoundingClientRect();
                return {
                    x: rect.x + (rect.width / 2),
                    y: rect.y + (rect.height / 2)
                };
            } else {
                return null;
            }
        });

        if (boundingBox) {
            // Move the mouse to the center of the button and click
            await page.evaluate(() => new Promise(resolve => setTimeout(resolve, 20000)));
            await page.mouse.move(boundingBox.x, boundingBox.y);
            await page.mouse.down();
            await page.mouse.up();
            for (let i = 0; i <= 20; i++) {
                await page.evaluate(() => new Promise(resolve => setTimeout(resolve, 500)));
                await page.mouse.down();
                await page.mouse.up();
                //await page.mouse.click(boundingBox.x, boundingBox.y);
            }
            console.log("Button clicked");
            await page.evaluate(() => new Promise(resolve => setTimeout(resolve, 2000)));
        } else {
            console.error('Button not found');
        }
    } catch (error) {
        console.error('Error in buttonClick:', "Browser closed");
    }
}


const puppeteer = require('puppeteer');
const https = require('https');

var pageURL = 'https://steamcommunity.com/market/listings/730/AK-47%20%7C%20Safari%20Mesh%20%28Field-Tested%29';

const params = {
    m: '',
    a: '',
    d: ''
};

const getData = () => {
    new Promise((resolve, reject) => {
        console.log('Launching browser...');

        const browser = puppeteer.launch(/* { headless: false, args: ['--window-size=1920,1080'] } */);

        try {
            return resolve(browser);
        }
        catch (err) {
            return reject(err);
        }
    }).then((browser) => {
        console.log('Opening new page...');

        return page = browser.newPage();
    }).then((page) => {
        page.setViewport({
            width: 1920,
            height: 1080
        });

        page.goto(`${pageURL}`);

        return page;
    }).then(async (page) => {
        console.log('Fetching data...');

        const dataPath = await page.waitForXPath('/html/body/div[1]/div[7]/div[2]/script[2]');

        let data = await page.evaluate((data) => data.textContent, dataPath);
        let response = await data.split('var g_rgAssets = ')[1].split('var g_rgCurrency = [];')[0].trim().slice(0, -1);

        response = await JSON.parse(response);
        response = await response['730']['2'];

        setInterval(async () => {
            getFloats(response);
            const nextPage = await page.waitForXPath('/html/body/div[1]/div[7]/div[2]/div[2]/div[4]/div[1]/div[3]/div[4]/div[3]/div[1]/span[3]');
            await nextPage.click();
        }, 7500);
    });
};

const getFloats = (data) => {
    console.log('Getting floats...');

    for (item in data) {
        params.m = data[item]['market_actions'][0]['link'].split('M')[1].split('A')[0];
        params.a = data[item]['id'];
        params.d = data[item]['market_actions'][0]['link'].split('D')[1];

        https.get(`https://api.csgofloat.com/?m=${params.m}&a=${params.a}&d=${params.d}`, (res) => {
            let data = '';

            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', () => {
                try {
                    let response = JSON.parse(data);
                    console.log(response.iteminfo.floatvalue);
                } catch (err) {
                    console.error(err.message);
                }
            });
        });
    }
};

getData();

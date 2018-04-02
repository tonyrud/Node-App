const puppeteer = require('puppeteer');
const sessionFactory = require('./factories/sessionFactory');

let browser;
let page;
beforeEach(async () => {
    browser = await puppeteer.launch({ headless: false });
    page = await browser.newPage();

    await page.goto('localhost:3000');
});

afterEach(async () => {
    await browser.close();
});

test('The header has the correct text', async () => {
    const text = await page.$eval('a.brand-logo', el => el.innerHTML);

    expect(text).toEqual('Blogster');
});

test('clicking login goes to the correct link', async () => {
    await page.click('.right a');

    expect(await page.url()).toMatch(/accounts\.google\.com/);
});

test('When signed in, shows logout button', async () => {
    const { session, sig } = sessionFactory();

    await page.setCookie({ name: 'session', value: session });
    await page.setCookie({ name: 'session.sig', value: sig });

    await page.goto('localhost:3000');

    const btnEl = 'a[href="/auth/logout"]';
    await page.waitFor(btnEl);

    const text = await page.$eval(btnEl, el => el.innerHTML);

    expect(text).toEqual('Logout');
});

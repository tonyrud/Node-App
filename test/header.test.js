const Page = require('./helpers/page');

let page;
beforeEach(async () => {
    page = await Page.build();
    await page.goto('http://localhost:3000');
});

afterEach(async () => {
    await page.close();
});

test('The header has the correct text', async () => {
    const text = await page.getContentsOf('a.brand-logo');

    expect(text).toEqual('Blogster');
});

test('clicking login goes to the correct link', async () => {
    await page.click('.right a');

    expect(await page.url()).toMatch(/accounts\.google\.com/);
});

test('When signed in, shows logout button', async () => {
    await page.login();

    const text = await page.getContentsOf('a[href="/auth/logout"]');

    expect(text).toEqual('Logout');
});

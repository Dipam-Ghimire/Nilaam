import {test, expect} from '@playwright/test';
import {LoginPage} from '../pageOjects/login.page';

test.beforeEach(async ({page}) => {
    await page.goto('/');
})

test.describe('Login Tests', () => {
    test('Login with valid credentials', async ({page}) => {
        const loginPage = new LoginPage(page);
        await loginPage.login('testuser', 'testpass');
        await expect(page).toHaveURL('/dashboard');
    });
})

test.describe('Login Error Tests', () => {
    test('Login with invalid credentials', async ({page}) => {
        const loginPage = new LoginPage(page);
        await loginPage.login('invaliduser', 'invalidpass');
        await expect(loginPage.errorMessage).toBeVisible();
    });
    test('login using valid username and invalid password', async ({page}) => {
        const loginPage = new LoginPage(page);
        await loginPage.login('testuser', 'invalidpass');
        await expect(loginPage.errorMessage).toBeVisible();
    })
    test('login using invalid username and valid password', async ({page}) => {
        const loginPage = new LoginPage(page);
        await loginPage.login('invaliduser', 'testpass');
        await expect(loginPage.errorMessage).toBeVisible();
    })
    test('login using empty username and password and click login button', async ({page}) => {
        const loginPage = new LoginPage(page);
        await loginPage.login('', '');
        await expect(loginPage.errorMessage).toBeVisible();
    })

    test('login using empty username and valid password and click login button', async ({page}) => {
        const loginPage = new LoginPage(page);
        await loginPage.login('', 'testpass');
        await expect(loginPage.errorMessage).toBeVisible();
    })
    test('login using valid username and empty password and click login button', async ({page}) => {
        const loginPage = new LoginPage(page);
        await loginPage.login('testuser', '');
        await expect(loginPage.errorMessage).toBeVisible();
    })
    test('login using empty username and invalid password and click login button', async ({page}) => {
        const loginPage = new LoginPage(page);
        await loginPage.login('', 'invalidpass');
        await expect(loginPage.errorMessage).toBeVisible();
    })
    test('login using invalid username and empty password and click login button', async ({page}) => {
        const loginPage = new LoginPage(page);
        await loginPage.login('invaliduser', '');
        await expect(loginPage.errorMessage).toBeVisible();
    })
    test('login using empty username and valid password and click login button', async ({page}) => {
        const loginPage = new LoginPage(page);
        await loginPage.login('', 'testpass');
        await expect(loginPage.errorMessage).toBeVisible();
    })
    test('login using valid username and empty password and click login button', async ({page}) => {
        const loginPage = new LoginPage(page);
        await loginPage.login('testuser', '');
        await expect(loginPage.errorMessage).toBeVisible();
    })
    test('Login using invalid username and invalid password and click login button', async ({page}) => {
        const loginPage = new LoginPage(page);
        await loginPage.login('invaliduser', 'invalidpass');
        await expect(loginPage.errorMessage).toBeVisible();
    })
});


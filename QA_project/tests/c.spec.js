import {test, expect} from '@playwright/test';

test("Login using valid credentials", async ({ page }) => {
  await page.goto("https://thinking-tester-contact-list.herokuapp.com/");
  await page.getByPlaceholder("Email").fill("dipamghi123@gmail.com");
  await page.getByPlaceholder("Password").fill("password123");
  await page.getByText("Submit").click();
   await expect(page.getByText('Log Out')).toBeVisible();  
  
})

  test('Login using invalid credentials', async ({ page }) => {
    await page.goto('https://thinking-tester-contact-list.herokuapp.com/');
    await page.getByPlaceholder("Email").fill("dipamg123hi123@gmail.com");
    await page.getByPlaceholder("Password").fill("wrongpassw123ord");
    await page.getByText("Submit").click();
      await expect(page.getByText('Log Out')).toBeVisible();  
  })

     test('Login using invalid credentials', async ({ page }) => {
    await page.goto('https://thinking-tester-contact-list.herokuapp.com/');
    await page.locator('Xpath=//input[@id=\'email\']').fill("dipamg123hi123@gmail.com");
    await page.locator('Xpath=//input[@id=\'password\']').fill("wrongpassw123ord");
    await page.getByText("Submit").click();
      await expect(page.getByText('Log Out')).toBeVisible();  
  });
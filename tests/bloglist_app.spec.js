const { test, expect, beforeEach, describe } = require('@playwright/test')
const { loginWith, createBlog } = require('./helper')

describe('Bloglist app', () => {
  beforeEach(async ({ page, request }) => {
    await request.post('/api/testing/reset')
    await request.post('/api/users', {
      data: {
        name: 'Matti Luukkainen',
        username: 'mluukkai',
        password: 'salainen'
      }
    })

    await page.goto('/')
  })

  test('Login form is shown', async ({ page }) => {
    await expect(page.getByText('Login to application')).toBeVisible()
    await expect(page.getByText('Username')).toBeVisible()
    await expect(page.getByText('Password')).toBeVisible()
    await expect(page.locator('input[name="username"]')).toBeVisible()
    await expect(page.locator('input[name="password"]')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Login' })).toBeVisible()
  })

  describe('Login', () => {
    test('succeeds with correct credentials', async ({ page }) => {
      await loginWith(page, 'mluukkai', 'salainen')
      await expect(page.getByText('Matti Luukkainen logged in successfully')).toBeVisible()
    })

    test('fails with wrong credentials', async ({ page }) => {
      await loginWith(page, 'mluukkai', 'wrong')

      const notificationElement = await page.locator('.notification')
      await expect(notificationElement).toContainText('Login failed: invalid username or password')
      await expect(notificationElement).toHaveCSS('background-color', 'rgb(227, 211, 211)')
      await expect(notificationElement).toHaveCSS('border-color', 'rgb(139, 0, 0)')
      await expect(notificationElement).toHaveCSS('color', 'rgb(139, 0, 0)')
      await expect(page.getByText(/Matti Luukkainen logged in/)).not.toBeVisible()
    })
  })

  describe('When logged in', () => {
    beforeEach(async ({ page }) => {
      await loginWith(page, 'mluukkai', 'salainen')
    })
  
    test('a new blog can be created', async ({ page }) => {
      await createBlog(page, {
        title: 'This is a new blog created by playwright',
        author: 'Playwright',
        url: 'http://localhost/playwright'
      })

      await expect(page.locator('.blog-list-item').getByText(/This is a new blog created by playwright/)).toBeVisible()
    })

    describe('and blogs exist', () => {
      beforeEach(async ({ page }) => {
        await createBlog(page, { title: 'Playwrigth blog 1', author: 'Playwright', url: 'http://localhost/playwright1' })
        await createBlog(page, { title: 'Playwrigth blog 2', author: 'Playwright', url: 'http://localhost/playwright2' })
        await createBlog(page, { title: 'Playwrigth blog 3', author: 'Playwright', url: 'http://localhost/playwright3' })
      })

      test('a blog can be liked', async ({ page }) => {
        await page.locator('.blog-list-item')
          .getByText(/Playwrigth blog 2/)
          .getByRole('button', { name: 'View' })
          .click()

        const likesElement = page.locator('.blog-list-item')
          .getByText(/Playwrigth blog 2/)
          .locator('..')
          .getByText(/Likes/)

        await expect(likesElement).toContainText(/Likes: 0/)
        await expect(likesElement).not.toContainText(/Likes: 1/)

        await likesElement.getByRole('button', { name: 'Like' })
          .click()
        await likesElement.getByText(/Likes: 1/).waitFor()

        await expect(likesElement).toContainText(/Likes: 1/)
        await expect(likesElement).not.toContainText(/Likes: 0/)
      })
    })
  })
})

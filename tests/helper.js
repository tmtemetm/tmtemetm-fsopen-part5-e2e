const loginWith = async (page, username, password) => {
  await page.locator('input[name="username"]')
    .fill(username)
  await page.locator('input[name="password"]')
    .fill(password)
  await page.getByRole('button', { name: 'Login' })
    .click()
}

const createBlog = async (page, { title, author, url }) => {
  await page.getByRole('button', { name: 'Create new blog' })
    .click()
  await page.locator('input[name="title"]')
    .fill(title)
  await page.locator('input[name="author"]')
    .fill(author)
  await page.locator('input[name="url"]')
    .fill(url)
  await page.getByRole('button', { name: 'create' })
    .click()
  await page.locator('.blog-list-item')
    .getByText(title, { exact: false })
    .waitFor()
}

export { loginWith, createBlog }

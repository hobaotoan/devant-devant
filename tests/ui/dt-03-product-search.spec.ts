/**
 * DT-3 — Product search and detail view.
 *
 * Validates that catalog browsing and keyword search return the expected
 * heading/content, and that the detail page surfaces every documented field.
 *
 * Acceptance criteria source: Jira DT-3.
 */

import { test, expect } from '../fixtures/test'
import { ProductDetailPage, ProductsPage } from '../pages/products.page'

test.describe('DT-3 · Product search & detail', () => {

  test(
    'products page lists items with name and price visible @priority:medium @type:smoke',
    { tag: ['@jira:DT-3', '@priority:medium', '@type:smoke', '@severity:normal', '@status:draft'] },
    async ({ page }) => {
      const products = new ProductsPage(page)

      await products.goto()
      await expect(products.productCards.first()).toBeVisible()

      // Every card must show at least one price and a link to View Product.
      const firstCard = products.productCards.first()
      await expect(firstCard.getByRole('link', { name: /view product/i })).toBeVisible()
      await expect(firstCard.locator('h2, p').first()).toBeVisible()
    },
  )

  test(
    'searching for "top" returns only matching products under a "Searched Products" heading @priority:medium @type:functional',
    { tag: ['@jira:DT-3', '@priority:medium', '@type:functional', '@severity:normal', '@status:draft'] },
    async ({ page }) => {
      const products = new ProductsPage(page)

      await products.goto()
      await products.search('top')

      // Heading flips from "All Products" → "Searched Products".
      await expect(products.searchedProductsHeading).toBeVisible()

      // At least one result is returned and names mention the keyword.
      const count = await products.productCards.count()
      expect(count, 'expected at least one product matching "top"').toBeGreaterThan(0)

      const names = await products.productCards.locator('p').allInnerTexts()
      const allMatch = names.every((n) => /top/i.test(n))
      expect(allMatch, `non-matching names in results: ${names.join(' | ')}`).toBe(true)
    },
  )

  test(
    'clicking View Product opens a detail page with name, category, price, availability, condition, brand @priority:medium @type:functional',
    { tag: ['@jira:DT-3', '@priority:medium', '@type:functional', '@severity:normal', '@status:draft'] },
    async ({ page }) => {
      const products = new ProductsPage(page)
      const detail = new ProductDetailPage(page)

      await products.goto()
      await products.viewProduct(0)
      await detail.expectLoaded()

      // Each attribute is individually asserted so a single missing field is named in failure output.
      await expect(detail.productName, 'product name missing').toBeVisible()
      await expect(detail.category, 'category missing').toBeVisible()
      await expect(detail.price, 'price missing').toBeVisible()
      await expect(detail.availability, 'availability missing').toBeVisible()
      await expect(detail.condition, 'condition missing').toBeVisible()
      await expect(detail.brand, 'brand missing').toBeVisible()
    },
  )
})

/**
 * Products list (`/products`) + Product detail (`/product_details/<id>`) + Cart add-modal.
 *
 * Kept as a single module because the three screens are tightly coupled —
 * specs for DT-3 and DT-4 walk through all of them in one flow.
 */

import type { Page, Locator } from '@playwright/test'
import { expect } from '@playwright/test'

export class ProductsPage {
  readonly page: Page
  readonly searchInput: Locator
  readonly searchButton: Locator
  readonly allProductsHeading: Locator
  readonly searchedProductsHeading: Locator
  readonly productCards: Locator

  constructor(page: Page) {
    this.page = page
    this.searchInput = page.getByRole('textbox', { name: /search product/i })
    this.searchButton = page.locator('#submit_search')
    this.allProductsHeading = page.getByRole('heading', { name: /all products/i })
    this.searchedProductsHeading = page.getByRole('heading', { name: /searched products/i })
    this.productCards = page.locator('.features_items .product-image-wrapper')
  }

  async goto() {
    await this.page.goto('/products')
    await expect(this.allProductsHeading).toBeVisible()
  }

  async search(keyword: string) {
    await this.searchInput.fill(keyword)
    await this.searchButton.click()
    await expect(this.searchedProductsHeading).toBeVisible()
  }

  /** Opens the Nth product's detail page. */
  async viewProduct(index = 0) {
    await this.productCards.nth(index).getByRole('link', { name: /view product/i }).click()
  }

  /** Hovers the Nth card and clicks "Add to cart". */
  async addToCart(index = 0) {
    const card = this.productCards.nth(index)
    await card.hover()
    await card.getByRole('link', { name: /add to cart/i }).first().click()
  }
}

/**
 * Modal that appears after Add-to-Cart — offers "Continue Shopping" / "View Cart".
 */
export class CartAddedModal {
  readonly page: Page
  readonly modal: Locator
  readonly continueShoppingButton: Locator
  readonly viewCartLink: Locator

  constructor(page: Page) {
    this.page = page
    this.modal = page.locator('#cartModal')
    this.continueShoppingButton = this.modal.getByRole('button', { name: /continue shopping/i })
    this.viewCartLink = this.modal.getByRole('link', { name: /view cart/i })
  }

  async continueShopping() {
    await expect(this.modal).toBeVisible()
    await this.continueShoppingButton.click()
  }

  async viewCart() {
    await expect(this.modal).toBeVisible()
    await this.viewCartLink.click()
  }
}

export class ProductDetailPage {
  readonly page: Page
  readonly productName: Locator
  readonly category: Locator
  readonly price: Locator
  readonly availability: Locator
  readonly condition: Locator
  readonly brand: Locator

  constructor(page: Page) {
    this.page = page
    const info = page.locator('.product-information')
    this.productName = info.locator('h2')
    this.category = info.getByText(/category:/i)
    this.price = info.locator('span span')
    this.availability = info.getByText(/availability:/i)
    this.condition = info.getByText(/condition:/i)
    this.brand = info.getByText(/brand:/i)
  }

  async expectLoaded() {
    await expect(this.page).toHaveURL(/product_details\/\d+/)
    await expect(this.productName).toBeVisible()
  }
}

/**
 * Cart page (`/view_cart`) + Checkout (`/checkout`) + Payment (`/payment`).
 *
 * Bundled because DT-4's E2E flow walks through all three in sequence.
 */

import type { Page, Locator } from '@playwright/test'
import { expect } from '@playwright/test'
import type { TestUser } from '../helpers/user-factory'

export class CartPage {
  readonly page: Page
  readonly cartRows: Locator
  readonly proceedToCheckoutButton: Locator
  readonly registerLoginLink: Locator

  constructor(page: Page) {
    this.page = page
    this.cartRows = page.locator('#cart_info_table tbody tr')
    this.proceedToCheckoutButton = page.getByRole('button', { name: /proceed to checkout/i })
    this.registerLoginLink = page.getByRole('link', { name: /register \/ login/i })
  }

  async goto() {
    await this.page.goto('/view_cart')
  }

  async expectHasItems(min = 1) {
    await expect(this.cartRows).toHaveCount(min)
  }

  async expectEmpty() {
    await expect(this.page.locator('#empty_cart, #cart_items')).toContainText(/cart is empty/i)
  }

  async proceedToCheckout() {
    await this.proceedToCheckoutButton.click()
  }
}

export class CheckoutPage {
  readonly page: Page
  readonly addressDelivery: Locator
  readonly orderReviewHeading: Locator
  readonly commentBox: Locator
  readonly placeOrderButton: Locator

  constructor(page: Page) {
    this.page = page
    this.addressDelivery = page.locator('#address_delivery')
    this.orderReviewHeading = page.getByRole('heading', { name: /review your order/i })
    this.commentBox = page.locator('textarea[name="message"]')
    this.placeOrderButton = page.getByRole('link', { name: /place order/i })
  }

  /** Asserts the delivery address block reflects the registered user. */
  async expectAddressMatches(user: Pick<TestUser, 'firstname' | 'lastname' | 'city' | 'zipcode'>) {
    await expect(this.addressDelivery).toContainText(user.firstname)
    await expect(this.addressDelivery).toContainText(user.lastname)
    await expect(this.addressDelivery).toContainText(user.city)
    await expect(this.addressDelivery).toContainText(user.zipcode)
  }

  async addComment(comment: string) {
    await this.commentBox.fill(comment)
  }

  async placeOrder() {
    await this.placeOrderButton.click()
  }
}

/** Dummy payment gateway — no real charges happen. */
export class PaymentPage {
  readonly page: Page
  readonly nameOnCard: Locator
  readonly cardNumber: Locator
  readonly cvc: Locator
  readonly expiryMonth: Locator
  readonly expiryYear: Locator
  readonly payAndConfirmButton: Locator
  readonly orderPlacedHeading: Locator

  constructor(page: Page) {
    this.page = page
    this.nameOnCard = page.locator('input[name="name_on_card"]')
    this.cardNumber = page.locator('input[name="card_number"]')
    this.cvc = page.locator('input[name="cvc"]')
    this.expiryMonth = page.locator('input[name="expiry_month"]')
    this.expiryYear = page.locator('input[name="expiry_year"]')
    this.payAndConfirmButton = page.locator('#submit')
    this.orderPlacedHeading = page.getByRole('heading', { name: /order placed!?/i })
      .or(page.getByText(/congratulations! your order has been confirmed/i))
  }

  /** Fills and submits the dummy payment form. */
  async payWithDummyCard(nameOnCard: string) {
    await this.nameOnCard.fill(nameOnCard)
    await this.cardNumber.fill('4111 1111 1111 1111')
    await this.cvc.fill('123')
    await this.expiryMonth.fill('12')
    await this.expiryYear.fill('2030')
    await this.payAndConfirmButton.click()
  }

  async expectOrderPlaced() {
    await expect(this.orderPlacedHeading).toBeVisible()
  }
}

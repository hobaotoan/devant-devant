/**
 * DT-4 — Add product to cart and checkout (E2E).
 *
 * Full happy-path order placement, plus a guard that the cart empties after
 * the order is confirmed. Requires an authenticated session so we reuse the
 * `registeredUser` fixture (API-created, UI-logged-in, API-deleted).
 *
 * Acceptance criteria source: Jira DT-4.
 */

import { test, expect } from '../fixtures/test'
import { AuthPage } from '../pages/auth.page'
import { HomePage } from '../pages/home.page'
import { CartAddedModal, ProductsPage } from '../pages/products.page'
import { CartPage, CheckoutPage, PaymentPage } from '../pages/cart.page'

test.describe('DT-4 · Cart → Checkout → Place Order', () => {

  test(
    'logged-in shopper can add two products, checkout with dummy card, and see "Order Placed!" with an empty cart @priority:high @type:e2e',
    { tag: ['@jira:DT-4', '@priority:high', '@type:e2e', '@severity:major', '@status:draft'] },
    async ({ page, registeredUser }) => {
      const home = new HomePage(page)
      const auth = new AuthPage(page)
      const products = new ProductsPage(page)
      const modal = new CartAddedModal(page)
      const cart = new CartPage(page)
      const checkout = new CheckoutPage(page)
      const payment = new PaymentPage(page)

      // --- 1. Log in so delivery address auto-fills from the registration data. ---
      await auth.goto()
      await auth.login({ email: registeredUser.email, password: registeredUser.password })
      await home.expectLoggedIn(registeredUser.name)

      // --- 2. Add two distinct products to the cart. ---
      await products.goto()
      await products.addToCart(0)
      await modal.continueShopping()
      await products.addToCart(1)
      await modal.viewCart()

      // --- 3. Cart shows both items with price/qty/total per row. ---
      await cart.expectHasItems(2)
      await cart.proceedToCheckout()

      // --- 4. Checkout shows the registered delivery address and the order summary. ---
      await checkout.expectAddressMatches(registeredUser)
      await checkout.addComment('Please deliver between 9am–5pm.')
      await checkout.placeOrder()

      // --- 5. Pay via dummy gateway → "Order Placed!" confirmation. ---
      await payment.payWithDummyCard(
        `${registeredUser.firstname} ${registeredUser.lastname}`,
      )
      await payment.expectOrderPlaced()

      // --- 6. Cart is empty after placing the order. ---
      await cart.goto()
      await cart.expectEmpty()
    },
  )
})

/**
 * Home page (`/`) — used as the landing/smoke surface.
 * Only exposes the handful of elements our specs actually depend on.
 */

import type { Page, Locator } from '@playwright/test'
import { expect } from '@playwright/test'

export class HomePage {
  readonly page: Page
  readonly signupLoginLink: Locator
  readonly logoutLink: Locator
  readonly deleteAccountLink: Locator
  readonly cartLink: Locator
  readonly productsLink: Locator
  readonly contactUsLink: Locator
  /** "Logged in as <name>" nav indicator — asserts the session state. */
  readonly loggedInAs: (name: string) => Locator

  constructor(page: Page) {
    this.page = page
    this.signupLoginLink = page.getByRole('link', { name: /signup \/ login/i })
    this.logoutLink = page.getByRole('link', { name: /^logout$/i })
    this.deleteAccountLink = page.getByRole('link', { name: /delete account/i })
    this.cartLink = page.getByRole('link', { name: /^cart$/i }).first()
    this.productsLink = page.getByRole('link', { name: /^products$/i }).first()
    this.contactUsLink = page.getByRole('link', { name: /contact us/i })
    this.loggedInAs = (name) =>
      page.getByText(new RegExp(`logged in as\\s+${name}`, 'i'))
  }

  async goto() {
    await this.page.goto('/')
    await expect(this.page).toHaveURL(/automationexercise\.com\/?$/)
  }

  async expectLoggedIn(username: string) {
    await expect(this.loggedInAs(username)).toBeVisible()
  }

  async expectLoggedOut() {
    await expect(this.signupLoginLink).toBeVisible()
    await expect(this.logoutLink).toBeHidden()
  }
}

/**
 * Enter Account Information form (the long form reached from AuthPage).
 *
 * Fills every required field from a {@link TestUser} and submits.
 * After submission AE shows an "ACCOUNT CREATED!" confirmation → click Continue
 * to land on the home page as a logged-in user.
 */

import type { Page, Locator } from '@playwright/test'
import { expect } from '@playwright/test'
import type { TestUser } from '../helpers/user-factory'

export class SignupFormPage {
  readonly page: Page
  readonly heading: Locator
  readonly accountCreatedHeading: Locator
  readonly accountDeletedHeading: Locator
  readonly continueButton: Locator

  constructor(page: Page) {
    this.page = page
    this.heading = page.getByRole('heading', { name: /enter account information/i })
    this.accountCreatedHeading = page.getByRole('heading', { name: /account created!?/i })
    this.accountDeletedHeading = page.getByRole('heading', { name: /account deleted!?/i })
    this.continueButton = page.getByRole('link', { name: /^continue$/i })
  }

  async expectLoaded() {
    await expect(this.heading).toBeVisible()
  }

  /** Fills every field in the long signup form using the test user. */
  async fillForm(user: TestUser) {
    await this.page.getByRole('radio', { name: user.title + '.' }).check()
    // Name/Email are pre-filled from the previous step; re-fill defensively.
    await this.page.locator('input[data-qa="name"]').fill(user.name)
    await this.page.locator('input[data-qa="password"]').fill(user.password)
    await this.page.locator('select[data-qa="days"]').selectOption(user.birth_date)
    await this.page.locator('select[data-qa="months"]').selectOption({ index: Number(user.birth_month) })
    await this.page.locator('select[data-qa="years"]').selectOption(user.birth_year)
    await this.page.getByRole('checkbox', { name: /sign up for our newsletter!?/i }).check()
    await this.page.getByRole('checkbox', { name: /receive special offers/i }).check()

    await this.page.locator('input[data-qa="first_name"]').fill(user.firstname)
    await this.page.locator('input[data-qa="last_name"]').fill(user.lastname)
    await this.page.locator('input[data-qa="company"]').fill(user.company)
    await this.page.locator('input[data-qa="address"]').fill(user.address1)
    await this.page.locator('input[data-qa="address2"]').fill(user.address2)
    await this.page.locator('select[data-qa="country"]').selectOption(user.country)
    await this.page.locator('input[data-qa="state"]').fill(user.state)
    await this.page.locator('input[data-qa="city"]').fill(user.city)
    await this.page.locator('input[data-qa="zipcode"]').fill(user.zipcode)
    await this.page.locator('input[data-qa="mobile_number"]').fill(user.mobile_number)
  }

  async submit() {
    await this.page.getByRole('button', { name: /create account/i }).click()
  }

  async clickContinue() {
    await this.continueButton.click()
  }

  async expectAccountCreated() {
    await expect(this.accountCreatedHeading).toBeVisible()
  }

  async expectAccountDeleted() {
    await expect(this.accountDeletedHeading).toBeVisible()
  }
}

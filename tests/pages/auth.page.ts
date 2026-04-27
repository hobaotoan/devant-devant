/**
 * Signup / Login page (`/login`).
 *
 * Hosts *two* forms side-by-side:
 *  - Login form    → {@link login}.
 *  - Signup stub   → {@link startSignup} (continues to {@link SignupFormPage}).
 *
 * All locators use accessible roles/labels so they survive class-name churn.
 */

import type { Page, Locator } from '@playwright/test'
import { expect } from '@playwright/test'
import type { Credentials } from '../helpers/user-factory'

export class AuthPage {
  readonly page: Page

  // --- Signup (new user) side ---
  readonly newUserHeading: Locator
  readonly signupNameInput: Locator
  readonly signupEmailInput: Locator
  readonly signupButton: Locator
  readonly emailAlreadyExistsError: Locator

  // --- Login (existing user) side ---
  readonly loginHeading: Locator
  readonly loginEmailInput: Locator
  readonly loginPasswordInput: Locator
  readonly loginButton: Locator
  readonly loginError: Locator

  constructor(page: Page) {
    this.page = page

    this.newUserHeading = page.getByRole('heading', { name: /new user signup/i })
    this.signupNameInput = page.getByPlaceholder('Name')
    this.signupEmailInput = page
      .locator('form[action="/signup"] input[type="email"]')
    this.signupButton = page.getByRole('button', { name: /^signup$/i })
    this.emailAlreadyExistsError = page.getByText(/email address already exist!?/i)

    this.loginHeading = page.getByRole('heading', { name: /login to your account/i })
    this.loginEmailInput = page
      .locator('form[action="/login"] input[type="email"]')
    this.loginPasswordInput = page
      .locator('form[action="/login"] input[type="password"]')
    this.loginButton = page.getByRole('button', { name: /^login$/i })
    this.loginError = page.getByText(/your email or password is incorrect!?/i)
  }

  async goto() {
    await this.page.goto('/login')
    await expect(this.newUserHeading).toBeVisible()
    await expect(this.loginHeading).toBeVisible()
  }

  /** Fill the New User Signup stub and click Signup → proceeds to SignupFormPage. */
  async startSignup(name: string, email: string) {
    await this.signupNameInput.fill(name)
    await this.signupEmailInput.fill(email)
    await this.signupButton.click()
  }

  /** Submit the Login form. Caller asserts success or failure state. */
  async login({ email, password }: Credentials) {
    await this.loginEmailInput.fill(email)
    await this.loginPasswordInput.fill(password)
    await this.loginButton.click()
  }
}

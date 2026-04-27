/**
 * Contact Us page (`/contact_us`).
 *
 * The Submit button triggers a *native browser confirm dialog* — callers must
 * register a dialog handler via {@link acceptConfirmDialogOnce} BEFORE clicking
 * Submit, otherwise Playwright's default auto-dismiss will cancel the submission.
 */

import type { Page, Locator } from '@playwright/test'
import { expect } from '@playwright/test'

export interface ContactForm {
  name: string
  email: string
  subject: string
  message: string
  /** Optional absolute path to a file that will be attached. */
  attachmentPath?: string
}

export class ContactPage {
  readonly page: Page
  readonly heading: Locator
  readonly nameInput: Locator
  readonly emailInput: Locator
  readonly subjectInput: Locator
  readonly messageInput: Locator
  readonly fileInput: Locator
  readonly submitButton: Locator
  readonly successMessage: Locator
  readonly homeButton: Locator

  constructor(page: Page) {
    this.page = page
    this.heading = page.getByRole('heading', { name: /get in touch/i })
    this.nameInput = page.locator('input[data-qa="name"]')
    this.emailInput = page.locator('input[data-qa="email"]')
    this.subjectInput = page.locator('input[data-qa="subject"]')
    this.messageInput = page.locator('textarea[data-qa="message"]')
    this.fileInput = page.locator('input[name="upload_file"]')
    this.submitButton = page.locator('input[data-qa="submit-button"]')
    // Scope to #contact-page — the page also renders an unrelated
    // #success-subscribe newsletter banner whose text matches this regex.
    this.successMessage = page
      .locator('#contact-page')
      .getByText(/success!?\s*your details have been submitted successfully/i)
    // The green "Home" button shown inside the contact-us success state — *not*
    // the nav-bar Home link (which can be obscured by AE's ad iframes).
    this.homeButton = page.locator('#form-section a.btn-success')
  }

  async goto() {
    await this.page.goto('/contact_us')
    await expect(this.heading).toBeVisible()
  }

  async fill(form: ContactForm) {
    await this.nameInput.fill(form.name)
    await this.emailInput.fill(form.email)
    await this.subjectInput.fill(form.subject)
    await this.messageInput.fill(form.message)
    if (form.attachmentPath) {
      await this.fileInput.setInputFiles(form.attachmentPath)
    }
  }

  /** Registers a one-shot dialog handler that accepts the next confirm(). */
  acceptConfirmDialogOnce() {
    this.page.once('dialog', async (dialog) => {
      await dialog.accept()
    })
  }

  async submit() {
    await this.submitButton.click()
  }
}

/**
 * DT-5 — Contact Us form submission.
 *
 * The submit button triggers a native browser confirm() dialog — note the
 * `acceptConfirmDialogOnce()` call *before* submit. Also exercises the
 * optional file-upload branch with an in-memory synthesized attachment.
 *
 * Acceptance criteria source: Jira DT-5.
 */

import path from 'node:path'
import { writeFileSync, mkdtempSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { test, expect } from '../fixtures/test'
import { ContactPage } from '../pages/contact.page'

test.describe('DT-5 · Contact Us', () => {

  test(
    'visitor can submit the contact form without an attachment and sees the success message @priority:medium @type:smoke',
    { tag: ['@jira:DT-5', '@priority:medium', '@type:smoke', '@severity:normal', '@status:draft'] },
    async ({ page }) => {
      const contact = new ContactPage(page)

      await contact.goto()
      await contact.fill({
        name: 'Toan Ho',
        email: 'toan.qa@example.test',
        subject: 'Smoke — no attachment',
        message: 'Hello, this is an automated DT-5 smoke test.',
      })

      contact.acceptConfirmDialogOnce()
      await contact.submit()

      await expect(contact.successMessage).toBeVisible()
      await contact.homeButton.click()
      await expect(page).toHaveURL(/automationexercise\.com\/?$/)
    },
  )

  test(
    'contact form accepts an optional file attachment and still reports success @priority:medium @type:functional',
    { tag: ['@jira:DT-5', '@priority:medium', '@type:functional', '@severity:normal', '@status:draft'] },
    async ({ page }) => {
      const contact = new ContactPage(page)

      // Create a tiny temp file on disk so we can exercise the real file input.
      const dir = mkdtempSync(path.join(tmpdir(), 'dt-05-'))
      const attachmentPath = path.join(dir, 'feedback.txt')
      writeFileSync(attachmentPath, 'DT-5 attachment sample\n')

      await contact.goto()
      await contact.fill({
        name: 'Toan Ho',
        email: 'toan.qa@example.test',
        subject: 'With attachment',
        message: 'Attached a small text file for validation.',
        attachmentPath,
      })

      contact.acceptConfirmDialogOnce()
      await contact.submit()

      await expect(contact.successMessage).toBeVisible()
    },
  )
})

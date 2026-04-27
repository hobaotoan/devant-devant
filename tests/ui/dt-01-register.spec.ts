/**
 * DT-1 — User registration with valid details.
 *
 * Covers the happy path (Signup → full form → ACCOUNT CREATED! → logged-in),
 * the duplicate-email guard, and the Delete Account cleanup path.
 *
 * Acceptance criteria source: Jira DT-1.
 */

import { test, expect } from '../fixtures/test'
import { AuthPage } from '../pages/auth.page'
import { HomePage } from '../pages/home.page'
import { SignupFormPage } from '../pages/signup-form.page'
import { makeTestUser } from '../helpers/user-factory'

test.describe('DT-1 · User registration', () => {
  test(
    'new visitor can register with valid details and becomes logged in @priority:high @type:smoke',
    { tag: ['@jira:DT-1', '@id:TC-1C2B', '@priority:high', '@type:smoke', '@severity:major', '@status:draft'] },
    async ({ page, newUser }) => {
      const home = new HomePage(page)
      const auth = new AuthPage(page)
      const signup = new SignupFormPage(page)

      // Entry: land on home → Signup / Login.
      await home.goto()
      await home.signupLoginLink.click()
      await auth.goto()

      // Start signup with unique name + email.
      await auth.startSignup(newUser.name, newUser.email)
      await signup.expectLoaded()

      // Fill every required field and submit.
      await signup.fillForm(newUser)
      await signup.submit()

      // AE confirms account creation → click Continue → land logged in.
      await signup.expectAccountCreated()
      await signup.clickContinue()
      await home.expectLoggedIn(newUser.name)

      // Cleanup — exercise Delete Account so the test leaves no residue.
      await home.deleteAccountLink.click()
      await signup.expectAccountDeleted()
    },
  )

  test(
    'registering with an already-used email shows inline "Email Address already exist!" error @priority:high @type:regression',
    { tag: ['@jira:DT-1', '@priority:high', '@type:regression', '@severity:major', '@status:draft'] },
    async ({ page, api }) => {
      const auth = new AuthPage(page)

      // Arrange — seed an account via API so we have a guaranteed-existing email.
      const seeded = makeTestUser()
      const created = await api.createAccount(seeded)
      expect(created.responseCode, created.message).toBe(201)

      try {
        // Act — attempt to sign up with the same email.
        await auth.goto()
        await auth.startSignup('Duplicate User', seeded.email)

        // Assert — the inline duplicate-email error is displayed.
        await expect(auth.emailAlreadyExistsError).toBeVisible()
      } finally {
        // Teardown — always delete the seeded account.
        await api.deleteAccount({ email: seeded.email, password: seeded.password })
      }
    },
  )
})

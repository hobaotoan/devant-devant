/**
 * DT-2 — Login and logout with valid credentials.
 *
 * Uses the `registeredUser` fixture so every test starts with a guaranteed
 * valid account that is cleaned up afterwards — no shared state between tests.
 *
 * Acceptance criteria source: Jira DT-2.
 */

import { test, expect } from '../fixtures/test'
import { AuthPage } from '../pages/auth.page'
import { HomePage } from '../pages/home.page'

test.describe('DT-2 · Login / Logout', () => {

  test(
    'valid credentials land the user on home with "Logged in as <name>" in the nav @priority:high @type:smoke',
    { tag: ['@jira:DT-2', '@priority:high', '@type:smoke', '@severity:major', '@status:draft'] },
    async ({ page, registeredUser }) => {
      const auth = new AuthPage(page)
      const home = new HomePage(page)

      await auth.goto()
      await auth.login({ email: registeredUser.email, password: registeredUser.password })

      await expect(page).toHaveURL(/automationexercise\.com\/?$/)
      await home.expectLoggedIn(registeredUser.name)
    },
  )

  test(
    'invalid credentials surface "Your email or password is incorrect!" and no session is created @priority:high @type:regression',
    { tag: ['@jira:DT-2', '@priority:high', '@type:regression', '@severity:major', '@status:draft'] },
    async ({ page }) => {
      const auth = new AuthPage(page)
      const home = new HomePage(page)

      await auth.goto()
      await auth.login({ email: 'does-not-exist@example.test', password: 'wrong-password' })

      await expect(auth.loginError).toBeVisible()
      await home.expectLoggedOut()
    },
  )

  test(
    'logging out ends the session and does not survive a back-navigation @priority:high @type:regression',
    { tag: ['@jira:DT-2', '@priority:high', '@type:regression', '@severity:major', '@status:draft'] },
    async ({ page, registeredUser }) => {
      const auth = new AuthPage(page)
      const home = new HomePage(page)

      await auth.goto()
      await auth.login({ email: registeredUser.email, password: registeredUser.password })
      await home.expectLoggedIn(registeredUser.name)

      // Log out → redirected to /login and the session is gone.
      await home.logoutLink.click()
      await expect(page).toHaveURL(/\/login/)

      // Going back in history must not restore the authenticated state.
      await page.goBack()
      await home.expectLoggedOut()
    },
  )
})

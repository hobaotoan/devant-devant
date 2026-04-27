/**
 * DT-8 — Verify login — valid / invalid / missing params / wrong method.
 *
 * Uses the `registeredUser` fixture for the happy path so we never depend on
 * hardcoded credentials. The other cases are negative and need no setup.
 *
 * Acceptance criteria source: Jira DT-8.
 */

import { test, expect } from '../fixtures/test'

test.describe('DT-8 · POST /verifyLogin', () => {

  test(
    'valid credentials return responseCode 200 with message "User exists!" @priority:high @type:smoke',
    { tag: ['@jira:DT-8', '@priority:high', '@type:smoke', '@severity:major', '@status:draft'] },
    async ({ api, registeredUser }) => {
      const res = await api.verifyLogin({
        email: registeredUser.email,
        password: registeredUser.password,
      })

      expect(res.responseCode, res.message).toBe(200)
      expect(res.message).toMatch(/user exists!?/i)
    },
  )

  test(
    'unknown email/password combination returns responseCode 404 "User not found!" @priority:high @type:negative',
    { tag: ['@jira:DT-8', '@priority:high', '@type:negative', '@severity:major', '@status:draft'] },
    async ({ api }) => {
      const res = await api.verifyLogin({
        email: `nobody_${Date.now()}@example.test`,
        password: 'definitely-not-correct',
      })

      expect(res.responseCode).toBe(404)
      expect(res.message).toMatch(/user not found!?/i)
    },
  )

  test(
    'missing email parameter returns responseCode 400 "email or password parameter is missing" @priority:high @type:negative',
    { tag: ['@jira:DT-8', '@priority:high', '@type:negative', '@severity:major', '@status:draft'] },
    async ({ api }) => {
      const res = await api.verifyLogin({ password: 'only-password' })

      expect(res.responseCode).toBe(400)
      expect(res.message).toMatch(
        /bad request,\s*email or password parameter is missing in post request/i,
      )
    },
  )

  test(
    'DELETE method on /api/verifyLogin is rejected with responseCode 405 "method not supported" @priority:high @type:negative',
    { tag: ['@jira:DT-8', '@priority:high', '@type:negative', '@severity:major', '@status:draft'] },
    async ({ api }) => {
      const res = await api.deleteVerifyLogin()

      expect(res.responseCode).toBe(405)
      expect(res.message).toMatch(/this request method is not supported/i)
    },
  )
})

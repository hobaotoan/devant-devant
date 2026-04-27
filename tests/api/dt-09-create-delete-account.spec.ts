/**
 * DT-9 — Create and delete a user account via API.
 *
 * Exercises the full lifecycle:
 *  1. createAccount → 201
 *  2. createAccount with same email → non-201 (duplicate guard)
 *  3. deleteAccount → 200
 *  4. verifyLogin with the deleted creds → 404 "User not found!" (chain test)
 *
 * These tests DO NOT use the `registeredUser` fixture — they are the source of
 * truth for create/delete and must drive the lifecycle themselves.
 *
 * Acceptance criteria source: Jira DT-9.
 */

import { test, expect } from '../fixtures/test'
import { makeTestUser } from '../helpers/user-factory'

test.describe('DT-9 · POST /createAccount & DELETE /deleteAccount', () => {

  test(
    'creating an account with all required params returns responseCode 201 "User created!" @priority:high @type:smoke',
    { tag: ['@jira:DT-9', '@priority:high', '@type:smoke', '@severity:major', '@status:draft'] },
    async ({ api }) => {
      const user = makeTestUser()

      try {
        const res = await api.createAccount(user)
        expect(res.responseCode, res.message).toBe(201)
        expect(res.message).toMatch(/user created!?/i)
      } finally {
        await api.deleteAccount({ email: user.email, password: user.password })
      }
    },
  )

  test(
    'creating an account with a duplicate email is rejected (non-201 response) @priority:high @type:negative',
    { tag: ['@jira:DT-9', '@priority:high', '@type:negative', '@severity:major', '@status:draft'] },
    async ({ api }) => {
      const user = makeTestUser()

      // Seed the account.
      const first = await api.createAccount(user)
      expect(first.responseCode).toBe(201)

      try {
        // Second create with the SAME email must not report 201 — AE returns 400 "Email already exists!".
        const duplicate = await api.createAccount(user)
        expect(duplicate.responseCode).not.toBe(201)
        expect(duplicate.message || '').toMatch(/email.*exist|already/i)
      } finally {
        await api.deleteAccount({ email: user.email, password: user.password })
      }
    },
  )

  test(
    'deleting an existing account returns responseCode 200 "Account deleted!" @priority:high @type:smoke',
    { tag: ['@jira:DT-9', '@priority:high', '@type:smoke', '@severity:major', '@status:draft'] },
    async ({ api }) => {
      const user = makeTestUser()

      const created = await api.createAccount(user)
      expect(created.responseCode).toBe(201)

      const deleted = await api.deleteAccount({
        email: user.email,
        password: user.password,
      })
      expect(deleted.responseCode).toBe(200)
      expect(deleted.message).toMatch(/account deleted!?/i)
    },
  )

  test(
    'after deleting an account, verifyLogin with its credentials returns "User not found!" @priority:high @type:regression',
    { tag: ['@jira:DT-9', '@priority:high', '@type:regression', '@severity:major', '@status:draft'] },
    async ({ api }) => {
      const user = makeTestUser()

      await api.createAccount(user).then((r) => expect(r.responseCode).toBe(201))
      await api
        .deleteAccount({ email: user.email, password: user.password })
        .then((r) => expect(r.responseCode).toBe(200))

      const res = await api.verifyLogin({ email: user.email, password: user.password })
      expect(res.responseCode).toBe(404)
      expect(res.message).toMatch(/user not found!?/i)
    },
  )
})

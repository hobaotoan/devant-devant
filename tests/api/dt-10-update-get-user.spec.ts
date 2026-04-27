/**
 * DT-10 — Update user account and retrieve by email.
 *
 * Chains PUT /updateAccount with GET /getUserDetailByEmail to prove that an
 * update is *actually persisted* (not merely accepted). Also exercises the
 * missing-param and unknown-email negative paths.
 *
 * Uses `registeredUser` for setup because every assertion here assumes a
 * pre-existing account — the fixture guarantees lifecycle cleanup.
 *
 * Acceptance criteria source: Jira DT-10.
 */

import { test, expect } from '../fixtures/test'

test.describe('DT-10 · PUT /updateAccount & GET /getUserDetailByEmail', () => {

  test(
    'GET /getUserDetailByEmail for an existing account returns responseCode 200 with name/email/address @priority:medium @type:smoke',
    { tag: ['@jira:DT-10', '@priority:medium', '@type:smoke', '@severity:normal', '@status:draft'] },
    async ({ api, registeredUser }) => {
      const res = await api.getUserByEmail(registeredUser.email)

      expect(res.responseCode, res.message).toBe(200)
      const user = (res.body as any).user as Record<string, unknown>
      expect(user).toBeTruthy()
      expect(user.email).toBe(registeredUser.email)
      for (const field of ['name', 'email']) {
        expect(user, `missing ${field}`).toHaveProperty(field)
      }
      // Address fields live at the user root in AE's response shape.
      for (const field of ['address1', 'city', 'state', 'country', 'zipcode']) {
        expect(user, `missing ${field}`).toHaveProperty(field)
      }
    },
  )

  test(
    'PUT /updateAccount returns responseCode 200 and subsequent GET reflects the new firstname @priority:medium @type:regression',
    { tag: ['@jira:DT-10', '@priority:medium', '@type:regression', '@severity:normal', '@status:draft'] },
    async ({ api, registeredUser }) => {
      const updated = { ...registeredUser, firstname: `Updated_${Date.now()}` }

      const putRes = await api.updateAccount(updated)
      expect(putRes.responseCode, putRes.message).toBe(200)
      expect(putRes.message).toMatch(/user updated!?/i)

      // Round-trip — the GET must reflect the new firstname.
      const getRes = await api.getUserByEmail(updated.email)
      expect(getRes.responseCode).toBe(200)
      expect(((getRes.body as any).user as any).first_name).toBe(updated.firstname)
    },
  )

  test(
    'GET /getUserDetailByEmail with a non-existent email returns a 404-style error @priority:medium @type:negative',
    { tag: ['@jira:DT-10', '@priority:medium', '@type:negative', '@severity:normal', '@status:draft'] },
    async ({ api }) => {
      const res = await api.getUserByEmail(`ghost_${Date.now()}@example.test`)

      // AE sometimes uses 404, sometimes a 400/200+error — accept any non-200 logical code
      // OR a 200 logical code with an error message to make the test resilient.
      const errored =
        res.responseCode !== 200 || /not found|no such|does not exist/i.test(res.message || '')
      expect(errored, `unexpected success response: ${JSON.stringify(res.body)}`).toBe(true)
    },
  )

  test(
    'GET /getUserDetailByEmail without the email query param returns a 400-style error @priority:medium @type:negative',
    { tag: ['@jira:DT-10', '@priority:medium', '@type:negative', '@severity:normal', '@status:draft'] },
    async ({ api }) => {
      const res = await api.getUserByEmail(undefined)

      const errored =
        res.responseCode !== 200 ||
        /missing|parameter|bad request/i.test(res.message || '')
      expect(errored, `unexpected success response: ${JSON.stringify(res.body)}`).toBe(true)
    },
  )
})

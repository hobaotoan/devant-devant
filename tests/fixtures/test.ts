/**
 * Extended Playwright test with project-specific fixtures.
 *
 * Fixtures provided:
 *  - `api`           — {@link AeApiClient} bound to baseURL (use for DT-6..10).
 *  - `newUser`       — a fresh {@link TestUser}; not registered (use for DT-1).
 *  - `registeredUser`— user created via API in `beforeEach` and deleted in
 *                      `afterEach`; use for UI tests that need an existing
 *                      account (DT-2, DT-4) or API tests that need a fixture
 *                      account (DT-8, DT-10).
 *
 * Import from this file — never from `@playwright/test` directly — so every
 * spec automatically picks up these helpers.
 */

import { test as base, expect } from '@playwright/test'
import { AeApiClient } from '../helpers/api-client'
import { makeTestUser, type TestUser } from '../helpers/user-factory'

type Fixtures = {
  api: AeApiClient
  newUser: TestUser
  registeredUser: TestUser
}

export const test = base.extend<Fixtures>({
  api: async ({ request }, use) => {
    await use(new AeApiClient(request))
  },

  newUser: async ({}, use) => {
    await use(makeTestUser())
  },

  registeredUser: async ({ api }, use) => {
    const user = makeTestUser()
    const created = await api.createAccount(user)
    // AE returns 201 via responseCode (HTTP always 200). Fail loud on setup errors.
    if (created.responseCode !== 201) {
      throw new Error(
        `registeredUser fixture: createAccount failed — responseCode=${created.responseCode} message=${created.message}`,
      )
    }
    await use(user)
    // Teardown — best effort; don't mask test failures if cleanup 404s.
    await api.deleteAccount({ email: user.email, password: user.password }).catch(() => {})
  },
})

export { expect }

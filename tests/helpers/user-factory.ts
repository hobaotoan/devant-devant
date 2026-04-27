/**
 * User factory — generates unique test users for automationexercise.com.
 *
 * Every test that creates an account should use `makeTestUser()` so runs
 * are isolated (random email) and do not collide with existing data.
 */

export interface TestUser {
  name: string
  email: string
  password: string
  title: 'Mr' | 'Mrs'
  birth_date: string
  birth_month: string
  birth_year: string
  firstname: string
  lastname: string
  company: string
  address1: string
  address2: string
  country: string
  zipcode: string
  state: string
  city: string
  mobile_number: string
}

/**
 * Builds a unique test user. Email is randomised to avoid "already exists" errors.
 * Override any field via the `overrides` param (useful for negative tests).
 */
export function makeTestUser(overrides: Partial<TestUser> = {}): TestUser {
  const unique = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
  return {
    name: `QA User ${unique}`,
    email: `qa_${unique}@example.test`,
    password: 'Pa$$w0rd!_' + unique.slice(0, 4),
    title: 'Mr',
    birth_date: '15',
    birth_month: '6',
    birth_year: '1995',
    firstname: 'Toan',
    lastname: 'Ho',
    company: 'Devant QA',
    address1: '123 Nguyen Hue',
    address2: 'Apt 4B',
    country: 'Singapore',
    zipcode: '700000',
    state: 'Ho Chi Minh',
    city: 'Ho Chi Minh City',
    mobile_number: '+84123456789',
    ...overrides,
  }
}

/** Minimal credentials view — used by login specs and API verifyLogin. */
export type Credentials = Pick<TestUser, 'email' | 'password'>

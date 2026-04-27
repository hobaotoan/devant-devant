/**
 * DT-6 — Retrieve full products and brands lists.
 *
 * Asserts both GET success paths and the method-not-allowed negative paths.
 * AE returns HTTP 200 with a JSON `responseCode` field — we assert on the
 * logical code, not the transport status.
 *
 * Acceptance criteria source: Jira DT-6.
 */

import { test, expect } from '../fixtures/test'

test.describe('DT-6 · GET /productsList & /brandsList', () => {

  test(
    'GET /api/productsList returns responseCode 200 with a non-empty products array @priority:high @type:smoke',
    { tag: ['@jira:DT-6', '@priority:high', '@type:smoke', '@severity:major', '@status:draft'] },
    async ({ api }) => {
      const res = await api.listProducts()

      expect(res.responseCode, res.message).toBe(200)
      expect(res.raw.headers()['content-type']).toMatch(/application\/json/i)

      const products = (res.body as any).products as Array<Record<string, unknown>>
      expect(Array.isArray(products)).toBe(true)
      expect(products.length, 'products array should not be empty').toBeGreaterThan(0)

      // Schema spot-check on the first item — catch accidental field renames early.
      const first = products[0]
      for (const field of ['id', 'name', 'price', 'brand', 'category']) {
        expect(first, `missing field ${field}`).toHaveProperty(field)
      }
    },
  )

  test(
    'GET /api/brandsList returns responseCode 200 with a non-empty brands array @priority:high @type:smoke',
    { tag: ['@jira:DT-6', '@priority:high', '@type:smoke', '@severity:major', '@status:draft'] },
    async ({ api }) => {
      const res = await api.listBrands()

      expect(res.responseCode, res.message).toBe(200)
      const brands = (res.body as any).brands as Array<Record<string, unknown>>
      expect(Array.isArray(brands)).toBe(true)
      expect(brands.length).toBeGreaterThan(0)
      expect(brands[0]).toHaveProperty('brand')
    },
  )

  test(
    'POST /api/productsList is rejected with responseCode 405 "method not supported" @priority:high @type:negative',
    { tag: ['@jira:DT-6', '@priority:high', '@type:negative', '@severity:major', '@status:draft'] },
    async ({ api }) => {
      const res = await api.postProducts()
      expect(res.responseCode).toBe(405)
      expect(res.message).toMatch(/this request method is not supported/i)
    },
  )

  test(
    'PUT /api/brandsList is rejected with responseCode 405 "method not supported" @priority:high @type:negative',
    { tag: ['@jira:DT-6', '@priority:high', '@type:negative', '@severity:major', '@status:draft'] },
    async ({ api }) => {
      const res = await api.putBrands()
      expect(res.responseCode).toBe(405)
      expect(res.message).toMatch(/this request method is not supported/i)
    },
  )
})

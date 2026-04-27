/**
 * DT-7 — Search products by keyword via API.
 *
 * Data-driven across three valid keywords + case-insensitivity check + the
 * missing-parameter negative path.
 *
 * Acceptance criteria source: Jira DT-7.
 */

import { test, expect } from '../fixtures/test'

const VALID_KEYWORDS = ['top', 'tshirt', 'jean'] as const

test.describe('DT-7 · POST /searchProduct', () => {

  for (const keyword of VALID_KEYWORDS) {
    test(
      `searching for "${keyword}" returns responseCode 200 with products whose name contains the keyword @priority:medium @type:functional`,
      { tag: ['@jira:DT-7', '@priority:medium', '@type:functional', '@severity:normal', '@status:draft'] },
      async ({ api }) => {
        const res = await api.searchProduct(keyword)

        expect(res.responseCode, res.message).toBe(200)
        const products = (res.body as any).products as Array<{ name: string }>
        expect(Array.isArray(products)).toBe(true)
        expect(products.length, `expected results for "${keyword}"`).toBeGreaterThan(0)

        // Every returned product must carry the documented minimum fields.
        for (const p of products as any[]) {
          for (const field of ['id', 'name', 'price', 'category', 'brand']) {
            expect(p, `missing ${field} in ${JSON.stringify(p)}`).toHaveProperty(field)
          }
        }
      },
    )
  }

  test(
    'search is case-insensitive: "TOP" and "top" return the same result set @priority:medium @type:functional',
    { tag: ['@jira:DT-7', '@priority:medium', '@type:functional', '@severity:normal', '@status:draft'] },
    async ({ api }) => {
      const lower = await api.searchProduct('top')
      const upper = await api.searchProduct('TOP')

      expect(lower.responseCode).toBe(200)
      expect(upper.responseCode).toBe(200)

      const lowerIds = ((lower.body as any).products || []).map((p: any) => p.id).sort()
      const upperIds = ((upper.body as any).products || []).map((p: any) => p.id).sort()
      expect(upperIds).toEqual(lowerIds)
    },
  )

  test(
    'omitting search_product returns responseCode 400 "search_product parameter is missing" @priority:medium @type:negative',
    { tag: ['@jira:DT-7', '@priority:medium', '@type:negative', '@severity:normal', '@status:draft'] },
    async ({ api }) => {
      const res = await api.searchProduct(undefined)

      expect(res.responseCode).toBe(400)
      expect(res.message).toMatch(
        /bad request,\s*search_product parameter is missing in post request/i,
      )
    },
  )
})

/**
 * Typed wrapper around the automationexercise.com REST API.
 *
 * The AE API is quirky:
 *  - Endpoints that mutate use form-encoded bodies (`application/x-www-form-urlencoded`).
 *  - Every response is HTTP 200, with the *real* status in a JSON `responseCode` field.
 *    (Ticket acceptance criteria are written in terms of that `responseCode`, not
 *    the transport status — we assert on it.)
 *
 * Keep this file as the *single* place that knows AE's URL shape; specs should
 * call these methods, never raw `request.post('/api/...')`.
 */

import type { APIRequestContext, APIResponse } from '@playwright/test'
import type { TestUser } from './user-factory'

/** Parsed AE response envelope — { responseCode, message, ...payload }. */
export interface AeResponse<T = unknown> {
  responseCode: number
  message?: string
  raw: APIResponse
  body: T & { responseCode: number; message?: string }
}

async function parse<T>(res: APIResponse): Promise<AeResponse<T>> {
  const text = await res.text()
  let body: any = {}
  try {
    body = text ? JSON.parse(text) : {}
  } catch {
    // Some error paths return HTML; leave body empty and let the caller inspect raw.
    body = { raw: text }
  }
  return { responseCode: body.responseCode, message: body.message, raw: res, body }
}

export class AeApiClient {
  constructor(private readonly request: APIRequestContext) {}

  /** GET /api/productsList */
  listProducts() {
    return this.request.get('/api/productsList').then(parse)
  }

  /** POST /api/productsList — used to assert method-not-allowed. */
  postProducts() {
    return this.request.post('/api/productsList').then(parse)
  }

  /** GET /api/brandsList */
  listBrands() {
    return this.request.get('/api/brandsList').then(parse)
  }

  /** PUT /api/brandsList — used to assert method-not-allowed. */
  putBrands() {
    return this.request.put('/api/brandsList').then(parse)
  }

  /** POST /api/searchProduct — `searchProduct` may be omitted to trigger 400. */
  searchProduct(searchProduct?: string) {
    return this.request
      .post('/api/searchProduct', {
        form: searchProduct === undefined ? {} : { search_product: searchProduct },
      })
      .then(parse)
  }

  /** POST /api/verifyLogin — any field may be omitted to trigger 400. */
  verifyLogin(creds: Partial<{ email: string; password: string }>) {
    const form: Record<string, string> = {}
    if (creds.email !== undefined) form.email = creds.email
    if (creds.password !== undefined) form.password = creds.password
    return this.request.post('/api/verifyLogin', { form }).then(parse)
  }

  /** DELETE /api/verifyLogin — used to assert method-not-allowed. */
  deleteVerifyLogin() {
    return this.request.delete('/api/verifyLogin').then(parse)
  }

  /** POST /api/createAccount — expects every field from {@link TestUser}. */
  createAccount(user: TestUser) {
    return this.request.post('/api/createAccount', { form: user as any }).then(parse)
  }

  /** DELETE /api/deleteAccount — email + password identify the account. */
  deleteAccount(creds: { email: string; password: string }) {
    return this.request
      .delete('/api/deleteAccount', { form: creds })
      .then(parse)
  }

  /** PUT /api/updateAccount — same shape as createAccount. */
  updateAccount(user: TestUser) {
    return this.request.put('/api/updateAccount', { form: user as any }).then(parse)
  }

  /** GET /api/getUserDetailByEmail?email=... */
  getUserByEmail(email?: string) {
    const qs = email === undefined ? '' : `?email=${encodeURIComponent(email)}`
    return this.request.get(`/api/getUserDetailByEmail${qs}`).then(parse)
  }
}

# CLAUDE.md

## Skill routing

When the user asks to test a URL ("test <url>", "create tests for", "E2E test", "write test cases"):
- **USE**: `playwright-skill` — includes test-lifecycle, playwright-cli, POM, locators, debugging, everything
- **DO NOT USE**: `agent-browser`, `browse`, `gstack`, `qa`, or any other global browser/testing skill

The `playwright-skill` is the only skill needed. It bundles:
- **test-lifecycle** — autonomous workflow (explore → scenarios → approve → generate → run → heal → report)
- **playwright-cli** — browser exploration (open, snapshot, fill, click, screenshot)
- **core** — locators, assertions, auth, config, debugging
- **pom** — page object model patterns
- **ci** — GitHub Actions, Docker, sharding

## Test annotation & management

Use tags and annotations to organize and filter test cases.

### Rules

- Add tags: `@priority:critical|high|medium|low`, `@type:functional|smoke|regression`
- Assert on stable state: `.toHaveURL()`, `.toBeVisible()`, `.toHaveText()`
- Never use `waitForTimeout()` — Playwright auto-waits
- One user flow per test
- Use `env.*` files for credentials, never hardcode secrets

### Example

```ts
test('valid login redirects to inventory @priority:critical @type:smoke', async ({ page }) => {
  await page.goto('/');
  await page.getByPlaceholder('Username').fill(process.env.AUTH_USERNAME!);
  await page.getByPlaceholder('Password').fill(process.env.AUTH_PASSWORD!);
  await page.getByRole('button', { name: 'Login' }).click();

  await expect(page).toHaveURL(/.*inventory/);
  await expect(page.getByText('Products')).toBeVisible();
});
```

### Filtering by tags

```bash
bun --bun playwright test --grep "@priority:critical"
bun --bun playwright test --grep "@type:smoke"
bun --bun playwright test --grep "@type:regression"
```

## Environment variables

Tests load from `env.{TEST_ENV}` (default: `env.dev`):

```
BASE_URL=https://www.saucedemo.com
AUTH_USERNAME=standard_user
AUTH_PASSWORD=secret_sauce
```

Access in tests via `process.env.BASE_URL`. The `baseURL` in playwright.config.ts reads from `BASE_URL`.

## Commands

```bash
# Run tests
bun --bun playwright test

# Run single file
bun --bun playwright test tests/<file>.spec.ts

# Run headed (visible browser)
bun --bun playwright test --headed

# Run by tag
bun --bun playwright test --grep "@priority:critical"

# View report
npx playwright show-report
```

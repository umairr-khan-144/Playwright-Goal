# AutomationExercise Playwright Framework

A production-style, hybrid **Page Object Model + Playwright Fixtures** automation
framework in TypeScript, targeting the public practice site
[automationexercise.com](https://automationexercise.com) for both **Web UI** and
**REST API** testing (single domain, so hybrid web+API tests are realistic).

---

## 1. Why this demo site

| Requirement | How automationexercise.com satisfies it |
|---|---|
| Authentication | `/login` page: real login + signup forms, positive/negative flows |
| Dynamic Data Table manipulation | `/view_cart` renders a genuine HTML `<table>` whose rows are added/removed client-side |
| Multi-step Form Submission | Signup is a real 3-step flow: name+email -> full account/address form -> confirmation |
| Error Boundary / negative handling | Invalid login, duplicate signup email, empty search results, forced network failures |
| API chaining | 14 documented REST endpoints ([/api_list](https://automationexercise.com/api_list)): create/verify/update/delete account, products & brands listing, product search |
| Hybrid web + API | Same domain -> API can provision/teardown an account while the UI drives the actual scenario |

---

## 2. Tech stack

- **Engine:** Playwright Test with TypeScript (`strict` mode)
- **Pattern:** Hybrid POM + Fixtures — Page Objects (`src/pages`) and API endpoint
  classes (`src/api`) are injected into tests via a single merged fixture
  (`src/fixtures/index.ts`), never instantiated by hand inside a spec.
- **Locators:** `getByRole`, `getByLabel`, `getByText`, `getByPlaceholder` first;
  a small **self-healing** resolver (`BasePage.resolveLocator`) falls back to a
  CSS id only for the handful of fields the live site doesn't expose an
  accessible name for (documented inline in `SignupPage.ts` / `CartPage.ts`).
- **CI/CD:** Jenkins (`Jenkinsfile`) — parallel + sharded across Chromium/Firefox/WebKit.
- **Reporting:** Playwright HTML + JSON + JUnit + Allure, with trace/video/screenshot
  capture on retry/failure.
- **Config/security:** `.env` (gitignored) validated with `zod`, `.env.example` committed.
- **Logging:** centralized Winston logger; every API request/response and key UI
  action is logged, with `password`/`token` fields auto-redacted.

---

## 3. Project structure

```
├── src/
│   ├── api/
│   │   ├── ApiClient.ts            # wraps one persistent APIRequestContext
│   │   └── endpoints/              # AccountApi, AuthApi, ProductApi
│   ├── config/env.ts               # zod-validated environment loader
│   ├── fixtures/                   # api-fixtures, page-fixtures, merged index
│   ├── pages/                      # BasePage, HeaderComponent, LoginPage, ...
│   ├── types/api.types.ts
│   └── utils/                      # logger.ts, test-data.ts (Faker)
├── tests/
│   ├── web/         (auth, dynamic-table-cart, multi-step-registration, error-boundary)
│   ├── api/          (auth-chaining, product-search-chaining, account-update/delete-chaining)
│   └── hybrid/       (hybrid-cart-login)
├── playwright.config.ts
├── Jenkinsfile
├── .env.example / .env (gitignored)
└── eslint.config.mjs / .prettierrc.json
```

---

## 4. Getting started

```powershell
npm install
npx playwright install --with-deps
copy .env.example .env   # adjust if needed (defaults already point at the demo site)
npm test                 # full suite, all projects
```

### Common commands

| Command | Purpose |
|---|---|
| `npm run test:web` | UI specs only |
| `npm run test:api` | API specs only |
| `npm run test:hybrid` | Hybrid specs only |
| `npm run test:smoke` | Everything tagged `@smoke` |
| `npm run test:chromium` / `:firefox` / `:webkit` | Single browser project |
| `npx playwright test --shard=1/3` | Manual shard (used by Jenkins) |
| `npm run report:html` | Open the last Playwright HTML report |
| `npm run report:allure:generate` / `:open` | Build/open the Allure report |
| `npm run typecheck` / `npm run lint` | Static checks |

### Tagging

Tests are tagged in their titles (`@smoke`, `@regression`, `@negative`, `@web`,
`@api`, `@hybrid`, `@chaining`, `@auth`, `@cart`, `@form`). Filter with
`--grep @tag` / `--grep-invert @tag`.

---

## 5. Design notes

- **Persistent API context:** `apiRequestContext` is a **worker-scoped** fixture
  (`src/fixtures/api-fixtures.ts`) — created once and reused by every chained
  call in that worker, so cookies/headers set by one request are automatically
  available to the next (`ApiClient` in `src/api/ApiClient.ts`).
- **API chaining pattern:** every `tests/api/*.spec.ts` file calls endpoint A,
  extracts an id/email from the JSON body (`response.json()`, no manual
  `JSON.parse`), passes it into endpoint B/C/D, and asserts the final state
  (see `account-delete-chaining.spec.ts` for a 4-call chain: create → login →
  delete → login-fails).
- **Built-in assertions:** `expect(response).toBeOK()`, `response.status()`,
  and JSON body assertions are chained directly off the `APIResponse`.
- **Hybrid tests:** `tests/hybrid/hybrid-cart-login.spec.ts` uses the API to
  provision (and later delete) a throwaway account, while the UI performs the
  actual login + add-to-cart scenario — API for setup/teardown, UI for the test.

---

## 6. CI/CD (Jenkins)

The `Jenkinsfile`:
1. Checks out, runs `npm ci` + `npx playwright install --with-deps`.
2. Runs `typecheck` + `lint` as a fast-fail gate.
3. Runs a **parallel + sharded** matrix: Chromium/Firefox/WebKit × N shards
   (`SHARD_TOTAL` parameter), plus a single `api` project run.
4. Publishes the Playwright HTML report, JUnit results, and Allure report;
   archives traces/videos/screenshots for any retried/failed test.

**Triggers:** `cron('H 2 * * *')` for a nightly run, plus `githubPush()` for
webhook-driven runs. On the GitHub (or equivalent) repo side, add a webhook
pointing at `<jenkins-url>/github-webhook/` for push/PR events, or use the
Generic Webhook Trigger plugin if you need PR-specific payloads.

---

## 7. Security

- No secrets are hard-coded. `.env` is gitignored; only `.env.example` (no
  real values) is committed.
- `src/config/env.ts` validates and fails fast on a malformed environment.
- `src/utils/logger.ts` redacts any field whose key matches
  `password|token|authorization|secret` before it is written to console or file.
- Test accounts are generated fresh per test (`src/utils/test-data.ts`) and
  deleted via the API in teardown to avoid polluting the shared demo site.
